import { describe, expect, it } from "vitest";
import {
  DEFAULT_AGENT_PERMISSION_POLICY_PRESET_ID,
  getBuiltInAgentPermissionPolicyPresets,
  isAgentPermissionPolicyPresetId,
  normalizeAgentPermissionPolicyFromPreset,
  resolveEffectiveAgentPermissionPolicy,
} from "../agent-permission-policy.js";
import { AGENT_PERMISSION_POLICY_ACTION_CATEGORIES } from "../types.js";

describe("agent-permission-policy", () => {
  it("returns the canonical built-in preset catalog", () => {
    const presets = getBuiltInAgentPermissionPolicyPresets();
    expect(presets.map((preset) => preset.id)).toEqual([
      "unrestricted",
      "approval-required",
      "locked-down",
    ]);
  });

  it("normalizes unrestricted preset with all categories allow", () => {
    const policy = normalizeAgentPermissionPolicyFromPreset("unrestricted");
    for (const category of AGENT_PERMISSION_POLICY_ACTION_CATEGORIES) {
      expect(policy.rules[category]).toBe("allow");
    }
  });

  it("normalizes approval-required preset with all categories require-approval", () => {
    const policy = normalizeAgentPermissionPolicyFromPreset("approval-required");
    for (const category of AGENT_PERMISSION_POLICY_ACTION_CATEGORIES) {
      expect(policy.rules[category]).toBe("require-approval");
    }
  });

  it("normalizes locked-down preset with all categories block", () => {
    const policy = normalizeAgentPermissionPolicyFromPreset("locked-down");
    for (const category of AGENT_PERMISSION_POLICY_ACTION_CATEGORIES) {
      expect(policy.rules[category]).toBe("block");
    }
  });

  it("resolves legacy missing policy to unrestricted default", () => {
    const effective = resolveEffectiveAgentPermissionPolicy(undefined);
    expect(effective.presetId).toBe(DEFAULT_AGENT_PERMISSION_POLICY_PRESET_ID);
    for (const category of AGENT_PERMISSION_POLICY_ACTION_CATEGORIES) {
      expect(effective.rules[category]).toBe("allow");
    }
  });

  it("resolves malformed policy payload to unrestricted default", () => {
    const effective = resolveEffectiveAgentPermissionPolicy({
      presetId: "not-a-preset" as never,
      rules: {
        "git-write": "block",
        "file-write-delete": "block",
        "shell-command": "block",
        "network-api": "block",
        "task-agent-management": "block",
      },
    });
    expect(effective.presetId).toBe(DEFAULT_AGENT_PERMISSION_POLICY_PRESET_ID);
  });

  it("validates known preset IDs", () => {
    expect(isAgentPermissionPolicyPresetId("unrestricted")).toBe(true);
    expect(isAgentPermissionPolicyPresetId("approval-required")).toBe(true);
    expect(isAgentPermissionPolicyPresetId("locked-down")).toBe(true);
    expect(isAgentPermissionPolicyPresetId("custom")).toBe(false);
  });
});
