import type { ReactNode } from "react";
import { ErrorBoundary } from "./ErrorBoundary";
import { usePluginUiSlots } from "../hooks/usePluginUiSlots";
import { resolvePluginSlotComponent, type PluginSlotHostActions } from "../plugins/pluginSlotRegistry";
import "./PluginSlot.css";

interface PluginSlotProps {
  /** The slot identifier to render (e.g., "task-detail-tab", "header-action") */
  slotId: string;
  /** Optional project ID for multi-project slot scoping */
  projectId?: string;
  /** Optional plugin IDs to restrict rendering to a subset of matching entries */
  pluginIds?: string[];
  /** Render unresolved entry shell states for unregistered slot components */
  renderPlaceholder?: boolean;
  /** Optional host-controlled callbacks that slot components can call */
  actions?: PluginSlotHostActions;
}

function PluginSlotMissingComponent({ slotId, pluginId }: { slotId: string; pluginId: string }): ReactNode {
  return (
    <section
      className="plugin-slot-shell"
      data-plugin-slot
      data-slot-id={slotId}
      data-plugin-id={pluginId}
      data-plugin-slot-state="missing-component"
      role="status"
      aria-live="polite"
    >
      <p className="plugin-slot-shell__title">Plugin component unavailable</p>
      <p className="plugin-slot-shell__message">
        The dashboard could not resolve this plugin surface from the static host registry.
      </p>
    </section>
  );
}

/**
 * Renders plugin slot registrations for a host surface.
 */
export function PluginSlot({ slotId, projectId, pluginIds, renderPlaceholder = true, actions }: PluginSlotProps): ReactNode {
  const { getSlotsForId, loading, error } = usePluginUiSlots(projectId);

  if (loading || error || !slotId) {
    return null;
  }

  const matchingEntries = getSlotsForId(slotId).filter((entry) =>
    pluginIds && pluginIds.length > 0 ? pluginIds.includes(entry.pluginId) : true,
  );

  if (matchingEntries.length === 0) {
    return null;
  }

  return (
    <ErrorBoundary level="page">
      <>
        {matchingEntries.map((entry, index) => {
          const key = `${entry.pluginId}-${entry.slot.slotId}-${index}`;
          const SlotComponent = resolvePluginSlotComponent(entry);

          if (SlotComponent) {
            return <SlotComponent key={key} entry={entry} actions={actions} />;
          }

          if (!renderPlaceholder) {
            return null;
          }

          return <PluginSlotMissingComponent key={key} slotId={entry.slot.slotId} pluginId={entry.pluginId} />;
        })}
      </>
    </ErrorBoundary>
  );
}
