/**
 * NodeStatusIndicator - displays the connection status of the currently viewed node.
 * Shows a green/red/yellow dot and optional text based on node state.
 */

import type { NodeConfig } from "@fusion/core";

export interface NodeStatusIndicatorProps {
  /** The node to display, or null for local node */
  node: NodeConfig | null;
  /** Whether to show additional details (node name, type, status text) */
  showDetails?: boolean;
}

/**
 * Get display configuration for a node status
 */
function getStatusDisplay(status: NodeConfig["status"]): {
  label: string;
  dotClass: string;
} {
  switch (status) {
    case "online":
      return { label: "Online", dotClass: "node-status-indicator__dot--online" };
    case "offline":
      return { label: "Offline", dotClass: "node-status-indicator__dot--offline" };
    case "connecting":
      return { label: "Connecting", dotClass: "node-status-indicator__dot--connecting" };
    case "error":
      return { label: "Error", dotClass: "node-status-indicator__dot--error" };
    default:
      return { label: "Unknown", dotClass: "node-status-indicator__dot--offline" };
  }
}

/**
 * Status indicator component for nodes.
 * Shows connection status with a colored dot and optional details.
 */
export function NodeStatusIndicator({ node, showDetails = false }: NodeStatusIndicatorProps) {
  // Local or null node - show "Local" badge
  if (!node || node.type === "local") {
    return (
      <div className="node-status-indicator node-status-indicator--local">
        <span className="node-status-indicator__label">Local</span>
      </div>
    );
  }

  // Remote node - show status with dot and optional details
  const { label: statusLabel, dotClass } = getStatusDisplay(node.status);
  const isConnecting = node.status === "connecting";

  return (
    <div className="node-status-indicator node-status-indicator--remote">
      <span className={`node-status-indicator__dot ${dotClass}`}>
        {isConnecting && <span className="node-status-indicator__spinner" />}
      </span>
      <span className="node-status-indicator__name">{node.name}</span>
      {showDetails && (
        <span className="node-status-indicator__details">
          {node.type} · {statusLabel}
        </span>
      )}
    </div>
  );
}
