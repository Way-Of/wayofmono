import { describe, expect, it } from "vitest";
import type {
  FusionPlugin,
  PluginPromptContributions,
  PluginPromptSurface,
  PluginSetupCheckResult,
  PluginSetupHooks,
  PluginSetupManifest,
  PluginSkillContribution,
  PluginWorkflowStepContribution,
} from "../plugin-types.js";
import { validatePluginManifest } from "../plugin-types.js";

describe("plugin contribution type constraints", () => {
  it("accepts setup check result status variants", () => {
    const installed: PluginSetupCheckResult = {
      status: "installed",
      version: "1.0.0",
      binaryPath: "/usr/local/bin/agent-browser",
    };
    const notInstalled: PluginSetupCheckResult = { status: "not-installed" };
    const error: PluginSetupCheckResult = { status: "error", error: "probe failed" };

    expect(installed.binaryPath).toContain("agent-browser");
    expect(notInstalled.status).toBe("not-installed");
    expect(error.error).toBe("probe failed");
  });

  it("supports contribution defaults as optional fields on skill/workflow types", () => {
    const skill: PluginSkillContribution = {
      skillId: "browser-navigation",
      name: "Browser Navigation",
      description: "Navigate pages",
      skillFiles: ["skills/browser-navigation/SKILL.md"],
    };
    const workflow: PluginWorkflowStepContribution = {
      stepId: "browser-verification",
      name: "Browser Verification",
      description: "Verify with browser",
      mode: "prompt",
      prompt: "Verify page behavior",
    };

    expect(skill.enabled).toBeUndefined();
    expect(workflow.defaultOn).toBeUndefined();
  });

  it("accepts explicit enabled flags and workflow phase/toolMode variants", () => {
    const enabledSkill: PluginSkillContribution = {
      skillId: "browser-interaction",
      name: "Browser Interaction",
      description: "Interact with pages",
      skillFiles: ["skills/browser-interaction/SKILL.md"],
      enabled: true,
      triggerPatterns: ["click", "type"],
    };
    const disabledStep: PluginWorkflowStepContribution = {
      stepId: "browser-post-merge-check",
      name: "Browser Post-Merge Check",
      description: "Post merge browser check",
      mode: "script",
      scriptName: "browser-check",
      enabled: false,
      phase: "post-merge",
      toolMode: "full-access",
    };

    expect(enabledSkill.enabled).toBe(true);
    expect(disabledStep.enabled).toBe(false);
    expect(disabledStep.phase).toBe("post-merge");
    expect(disabledStep.toolMode).toBe("full-access");
  });

  it("accepts setup manifest/hooks and extended FusionPlugin shape", async () => {
    const setupManifests: PluginSetupManifest[] = [
      { binaryName: "agent-browser", description: "Browser runtime", version: "1.2.3", channel: "stable", defaultTimeoutMs: 120000 },
      { binaryName: "agent-browser", description: "Browser runtime", channel: "beta", defaultTimeoutMs: 120000 },
      { binaryName: "agent-browser", description: "Browser runtime", channel: "nightly", defaultTimeoutMs: 120000 },
    ];
    const setupManifest = setupManifests[0]!;
    const setupHooks: PluginSetupHooks = {
      checkSetup: async () => ({ status: "installed", version: "1.2.3", binaryPath: "/tmp/agent-browser" }),
      install: async () => {},
      uninstall: async () => {},
    };
    const minimalHooks: PluginSetupHooks = {
      checkSetup: async () => ({ status: "not-installed" }),
    };

    const plugin: FusionPlugin = {
      manifest: { id: "plugin-a", name: "Plugin A", version: "1.0.0" },
      state: "installed",
      hooks: {},
      skills: [{ skillId: "browser-extraction", name: "Browser Extraction", description: "Extract data", skillFiles: ["skills/extract/SKILL.md"] }],
      workflowSteps: [
        {
          stepId: "browser-qa",
          name: "Browser QA",
          description: "QA in browser",
          mode: "script",
          scriptName: "verify-browser",
          phase: "pre-merge",
          toolMode: "readonly",
        },
      ],
      promptContributions: {
        enabledByDefault: false,
        contributions: [{ surface: "reviewer", content: "Review browser assumptions" }],
      },
      setup: { manifest: setupManifest, hooks: setupHooks },
    };

    const check = await plugin.setup!.hooks.checkSetup({} as never);
    expect(setupManifests).toHaveLength(3);
    expect(plugin.setup?.manifest.channel).toBe("stable");
    expect(check.status).toBe("installed");
    expect((await minimalHooks.checkSetup({} as never)).status).toBe("not-installed");
  });

  it("accepts prompt surface union and prompt contribution records", () => {
    const surfaces: PluginPromptSurface[] = ["executor-system", "executor-task", "triage", "reviewer", "heartbeat"];
    const byPlugin: Record<string, PluginPromptContributions> = {
      "fusion-plugin-agent-browser": {
        enabledByDefault: false,
        contributions: surfaces.map((surface) => ({ surface, content: `${surface} content` })),
      },
    };

    expect(byPlugin["fusion-plugin-agent-browser"]?.contributions).toHaveLength(5);
  });

  it("compile-time rejects invalid prompt surfaces", () => {
    const validSurface: PluginPromptSurface = "triage";
    expect(validSurface).toBe("triage");

    // @ts-expect-error invalid PluginPromptSurface
    const invalidSurface: PluginPromptSurface = "invalid-surface";
    expect(invalidSurface).toBe("invalid-surface");
  });
});

describe("validatePluginManifest contribution metadata scope", () => {
  // validatePluginManifest only validates manifest-level contribution metadata,
  // not full FusionPlugin nested contribution object shapes.
  it("accepts valid contribution metadata", () => {
    const valid = validatePluginManifest({
      id: "plugin-a",
      name: "Plugin A",
      version: "1.0.0",
      skills: [{ skillId: "browser-reader", name: "Browser Reader" }],
      workflowSteps: [{ stepId: "browser-check", name: "Browser Check", mode: "prompt" }],
      promptSurfaces: ["executor-system", "heartbeat"],
      setup: { binaryName: "agent-browser", description: "Browser runtime", channel: "stable" },
    });

    expect(valid.valid).toBe(true);
  });

  it("rejects malformed contribution metadata", () => {
    const invalid = validatePluginManifest({
      id: "plugin-a",
      name: "Plugin A",
      version: "1.0.0",
      skills: [{ skillId: "Bad Skill", name: "Bad" }],
      workflowSteps: [{ stepId: "bad-step", name: "Bad Step", mode: "oops" as "prompt" }],
      promptSurfaces: ["not-a-surface" as PluginPromptSurface],
      setup: { binaryName: "", description: "" },
    });

    expect(invalid.valid).toBe(false);
    expect(invalid.errors.length).toBeGreaterThan(0);
  });
});
