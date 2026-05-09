import type {
  AgentPermissionPolicy,
  AgentPermissionPolicyPresetId,
  AgentPermissionPolicyRules,
} from "./types.js";
import { AGENT_PERMISSION_POLICY_ACTION_CATEGORIES, AGENT_PERMISSION_POLICY_PRESET_IDS } from "./types.js";

export const DEFAULT_AGENT_PERMISSION_POLICY_PRESET_ID: AgentPermissionPolicyPresetId = "unrestricted";

export interface BuiltInAgentPermissionPolicyPreset {
  id: AgentPermissionPolicyPresetId;
  name: string;
  description: string;
  rules: AgentPermissionPolicyRules;
}

const BUILT_IN_PRESETS: Record<AgentPermissionPolicyPresetId, BuiltInAgentPermissionPolicyPreset> = {
  unrestricted: {
    id: "unrestricted",
    name: "Unrestricted",
    description: "Allows all runtime action categories (legacy-compatible default).",
    rules: buildRules("allow"),
  },
  "approval-required": {
    id: "approval-required",
    name: "Approval Required",
    description: "Requires approval for all runtime action categories.",
    rules: buildRules("require-approval"),
  },
  "locked-down": {
    id: "locked-down",
    name: "Locked Down",
    description: "Blocks all runtime action categories.",
    rules: buildRules("block"),
  },
};

function buildRules(disposition: AgentPermissionPolicyRules[(typeof AGENT_PERMISSION_POLICY_ACTION_CATEGORIES)[number]]): AgentPermissionPolicyRules {
  return AGENT_PERMISSION_POLICY_ACTION_CATEGORIES.reduce((acc, category) => {
    acc[category] = disposition;
    return acc;
  }, {} as AgentPermissionPolicyRules);
}

export function isAgentPermissionPolicyPresetId(value: unknown): value is AgentPermissionPolicyPresetId {
  return typeof value === "string" && (AGENT_PERMISSION_POLICY_PRESET_IDS as readonly string[]).includes(value);
}

export function getBuiltInAgentPermissionPolicyPresets(): BuiltInAgentPermissionPolicyPreset[] {
  return AGENT_PERMISSION_POLICY_PRESET_IDS.map((id) => resolveAgentPermissionPolicyPreset(id));
}

export function resolveAgentPermissionPolicyPreset(
  presetId: AgentPermissionPolicyPresetId,
): BuiltInAgentPermissionPolicyPreset {
  const preset = BUILT_IN_PRESETS[presetId];
  return {
    ...preset,
    rules: { ...preset.rules },
  };
}

export function normalizeAgentPermissionPolicyFromPreset(
  presetId: AgentPermissionPolicyPresetId,
): AgentPermissionPolicy {
  const preset = resolveAgentPermissionPolicyPreset(presetId);
  return {
    presetId: preset.id,
    rules: { ...preset.rules },
  };
}

export function resolveEffectiveAgentPermissionPolicy(
  policy: AgentPermissionPolicy | undefined,
): AgentPermissionPolicy {
  if (!policy || !isAgentPermissionPolicyPresetId(policy.presetId)) {
    return normalizeAgentPermissionPolicyFromPreset(DEFAULT_AGENT_PERMISSION_POLICY_PRESET_ID);
  }
  return normalizeAgentPermissionPolicyFromPreset(policy.presetId);
}
