import { randomUUID } from "node:crypto";
import { complete } from "@wayofmono/wo-ai";
import type { Model } from "@wayofmono/wo-ai";
import type { ToolDefinition, AgentToolResult } from "@wayofmono/wo-agent-core";
import type { Agent, AgentConfig, AgentOptions, AgentEventMap, PromptResult, TaskResult, AgentChunk } from "./types.js";
import { SkillManager } from "./skill-manager.js";

export async function createAgent(config: AgentConfig): Promise<Agent> {
  const id = randomUUID();
  let state: Agent["state"] = "init";
  const skillManager = new SkillManager();
  const extraTools: ToolDefinition[] = [];
  const listeners = new Map<string, Set<(...args: unknown[]) => void>>();
  const model: Model = resolveModel(config);

  const emit = <E extends keyof AgentEventMap>(event: E, ...args: Parameters<AgentEventMap[E]>) => {
    const handlers = listeners.get(event);
    if (handlers) {
      for (const h of handlers) {
        (h as (...args: unknown[]) => void)(...args);
      }
    }
  };

  const setState = (s: Agent["state"]) => {
    state = s;
    emit("state_change", s);
  };

  // Load requested skills
  if (config.skills && config.skills.length > 0) {
    for (const skillName of config.skills) {
      await skillManager.load(skillName, { model, config });
    }
  }

  setState("ready");

  const agent: Agent = {
    id,
    get state() { return state; },

    async prompt(text: string, options?: AgentOptions): Promise<PromptResult> {
      if (state === "disposed") throw new Error("Agent is disposed");
      setState("running");

      try {
        const tools = [...skillManager.getTools(), ...extraTools];
        const systemPrompt = options?.systemPrompt || skillManager.getSystemPrompt();

        const result = await complete(model, {
          messages: [{ role: "user", content: text }],
          system: systemPrompt,
          tools: tools.length > 0 ? tools : undefined,
          signal: options?.signal,
          onStream: options?.onChunk
            ? (chunk) => {
                const agentChunk: AgentChunk = { type: chunk.type, text: chunk.text, toolName: chunk.toolName, toolInput: chunk.toolInput, thinking: chunk.thinking, error: chunk.error };
                options.onChunk!(agentChunk);
                if (chunk.type === "text") emit("message", chunk.text || "");
                if (chunk.type === "tool_use") emit("tool_use", chunk.toolName || "", chunk.toolInput);
              }
            : undefined,
        });

        if (result.stopReason === "error") {
          emit("error", new Error(result.errorMessage || "Unknown error"));
        }

        return { content: result.content };
      } finally {
        setState("ready");
      }
    },

    async task(description: string, options?: AgentOptions): Promise<TaskResult> {
      const result = await agent.prompt(description, options);
      return { summary: result.content, steps: [], artifacts: [] };
    },

    registerTool(tool: ToolDefinition): void {
      extraTools.push(tool);
    },

    on<E extends keyof AgentEventMap>(event: E, handler: AgentEventMap[E]): () => void {
      if (!listeners.has(event)) listeners.set(event, new Set());
      listeners.get(event)!.add(handler as (...args: unknown[]) => void);
      return () => { listeners.get(event)?.delete(handler as (...args: unknown[]) => void); };
    },

    async dispose(): Promise<void> {
      setState("disposed");
      listeners.clear();
      extraTools.length = 0;
    },
  };

  return agent;
}

function resolveModel(config: AgentConfig): Model {
  const modelId = config.model.modelId || "claude-sonnet-4-20250514";
  const api = config.model.api || "anthropic";
  return {
    api,
    modelId,
    name: modelId,
    provider: api,
    maxTokens: config.model.maxTokens || 8192,
    supportsThinking: false,
    supportsSystemPrompt: true,
    supportsTools: true,
    supportsImages: false,
  };
}
