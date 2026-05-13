import { randomUUID } from "node:crypto";
import type { Message, Model, StreamChunk } from "@wayofmono/wo-ai";
import { resolveModelConfig } from "@wayofmono/wo-ai";
import type { ToolDefinition, AgentToolResult } from "@wayofmono/wo-agent-core";
import type { Agent, AgentConfig, AgentOptions, TaskOptions, AgentEventMap, PromptResult, TaskResult, AgentChunk } from "./types.js";
import { SkillManager } from "./skill-manager.js";
import { runReActLoop } from "./react-loop.js";

export async function createAgent(config: AgentConfig): Promise<Agent> {
  const id = randomUUID();
  let state: Agent["state"] = "init";
  const skillManager = new SkillManager();
  const extraTools: ToolDefinition[] = [];
  const listeners = new Map<string, Set<(...args: unknown[]) => void>>();
  let conversation: Message[] = [];

  const maxSteps = config.maxSteps ?? 18;

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

  if (config.skills && config.skills.length > 0) {
    for (const skillName of config.skills) {
      await skillManager.load(skillName, { model: config, config });
    }
  }

  setState("ready");

  const agent: Agent = {
    id,
    get state() { return state; },
    get conversation() { return conversation; },

    async prompt(text: string, options?: AgentOptions): Promise<PromptResult> {
      if (state === "disposed") throw new Error("Agent is disposed");
      setState("running");

      try {
        const { model } = resolveModelConfig({
          api: config.model.api,
          modelId: config.model.modelId,
          apiKey: config.apiKey,
          baseUrl: config.baseUrl,
        });

        const tools = [...skillManager.getTools(), ...extraTools];
        const systemPrompt = options?.systemPrompt || skillManager.getSystemPrompt();

        const result = await runReActLoop({
          model: config.model,
          apiKey: config.apiKey,
          baseUrl: config.baseUrl,
          messages: options?.messages ? [...options.messages, { role: "user", content: text }] : [{ role: "user", content: text }],
          system: systemPrompt,
          tools,
          toolChoice: options?.toolChoice,
          maxSteps: 1,
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

        return { content: result.content, stopReason: "end_turn", usage: result.usage };
      } finally {
        setState("ready");
      }
    },

    async task(description: string, options?: TaskOptions): Promise<TaskResult> {
      if (state === "disposed") throw new Error("Agent is disposed");
      setState("running");

      try {
        const tools = [...skillManager.getTools(), ...extraTools];
        const systemPrompt = options?.systemPrompt || skillManager.getSystemPrompt();

        const messages: Message[] = options?.messages ? [...options.messages] : [...conversation];
        messages.push({ role: "user", content: description });

        const steps: import("./types.js").ReActStep[] = [];

        const result = await runReActLoop({
          model: config.model,
          apiKey: config.apiKey,
          baseUrl: config.baseUrl,
          messages,
          system: systemPrompt,
          tools,
          toolChoice: options?.toolChoice ?? (tools.length > 0 ? "auto" : undefined),
          maxSteps: options?.maxSteps ?? maxSteps,
          signal: options?.signal,
          onStep: (step) => {
            steps.push(step);
            options?.onStep?.(step);
            emit("step_complete", step);
          },
          onStream: options?.onChunk
            ? (chunk) => {
                const agentChunk: AgentChunk = { type: chunk.type, text: chunk.text, toolName: chunk.toolName, toolInput: chunk.toolInput, thinking: chunk.thinking, error: chunk.error };
                options.onChunk!(agentChunk);
                if (chunk.type === "text") emit("message", chunk.text || "");
                if (chunk.type === "tool_use") emit("tool_use", chunk.toolName || "", chunk.toolInput);
              }
            : undefined,
        });

        conversation = result.messages;

        return {
          summary: result.content,
          steps,
          artifacts: [],
          usage: result.usage,
        };
      } finally {
        setState("ready");
      }
    },

    async runLoop(params: import("./types.js").ReActLoopParams): Promise<import("./types.js").ReActLoopResult> {
      if (state === "disposed") throw new Error("Agent is disposed");
      const tools = [...skillManager.getTools(), ...extraTools];
      return runReActLoop({
        ...params,
        tools: [...params.tools, ...tools],
      });
    },

    registerTool(tool: ToolDefinition): void {
      extraTools.push(tool);
    },

    clearConversation(): void {
      conversation = [];
    },

    loadConversation(messages: Message[]): void {
      conversation = [...messages];
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
      conversation = [];
    },
  };

  return agent;
}
