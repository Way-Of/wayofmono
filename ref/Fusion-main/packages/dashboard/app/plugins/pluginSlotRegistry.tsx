import type { ComponentType, ReactNode } from "react";
import type { PluginUiSlotEntry } from "../api";
import { DroidCliProviderCard } from "../components/DroidCliProviderCard";

export interface PluginSlotHostActions {
  refreshAuthProviders?: () => void;
  openSettingsSection?: (section: string) => void;
  openModelOnboarding?: () => void;
}

interface PluginSlotComponentProps {
  entry: PluginUiSlotEntry;
  actions?: PluginSlotHostActions;
}

interface PluginSlotRegistration {
  pluginId: string;
  slotId: string;
  componentPath: string;
  component: ComponentType<PluginSlotComponentProps>;
}

function DroidSettingsProviderCard({ actions }: PluginSlotComponentProps): ReactNode {
  return (
    <DroidCliProviderCard
      compact
      authenticated={false}
      onToggled={() => {
        actions?.refreshAuthProviders?.();
      }}
    />
  );
}

function DroidOnboardingProviderCard({ actions }: PluginSlotComponentProps): ReactNode {
  return (
    <DroidCliProviderCard
      authenticated={false}
      onToggled={() => {
        actions?.refreshAuthProviders?.();
      }}
    />
  );
}

function DroidOnboardingSetupHelp(): ReactNode {
  return (
    <p className="onboarding-helper-text" data-testid="droid-onboarding-setup-help">
      Tip: Enable Droid CLI to reuse your Factory AI subscription without adding an API key.
    </p>
  );
}

function DroidPostOnboardingRecommendation({ actions }: PluginSlotComponentProps): ReactNode {
  return (
    <div className="post-onboarding-recommendations__item" data-testid="droid-post-onboarding-recommendation">
      <span className="post-onboarding-recommendations__item-text">
        <strong>Enable Droid CLI</strong>
        <span>Use your local Droid CLI session as an AI provider in Fusion.</span>
      </span>
      <button type="button" className="btn btn-sm" onClick={() => actions?.openSettingsSection?.("authentication")}>
        Open Authentication
      </button>
      <button type="button" className="btn btn-sm" onClick={() => actions?.openModelOnboarding?.()}>
        Open Onboarding
      </button>
    </div>
  );
}

const REGISTRY: PluginSlotRegistration[] = [
  {
    pluginId: "fusion-plugin-droid-runtime",
    slotId: "settings-provider-card",
    componentPath: "./components/settings-provider-card.js",
    component: DroidSettingsProviderCard,
  },
  {
    pluginId: "fusion-plugin-droid-runtime",
    slotId: "settings-integration-card",
    componentPath: "./components/settings-integration-card.js",
    component: DroidSettingsProviderCard,
  },
  {
    pluginId: "fusion-plugin-droid-runtime",
    slotId: "onboarding-provider-card",
    componentPath: "./components/onboarding-provider-card.js",
    component: DroidOnboardingProviderCard,
  },
  {
    pluginId: "fusion-plugin-droid-runtime",
    slotId: "onboarding-setup-help",
    componentPath: "./components/onboarding-setup-help.js",
    component: DroidOnboardingSetupHelp,
  },
  {
    pluginId: "fusion-plugin-droid-runtime",
    slotId: "post-onboarding-recommendation",
    componentPath: "./components/post-onboarding-recommendation.js",
    component: DroidPostOnboardingRecommendation,
  },
];

export function resolvePluginSlotComponent(entry: PluginUiSlotEntry): ComponentType<PluginSlotComponentProps> | null {
  const hit = REGISTRY.find(
    (candidate) =>
      candidate.pluginId === entry.pluginId
      && candidate.slotId === entry.slot.slotId
      && candidate.componentPath === entry.slot.componentPath,
  );

  return hit?.component ?? null;
}
