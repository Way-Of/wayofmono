import type {
  CentralCore,
  GlobalSettings,
  SettingsSyncPayload,
  SharedMeshStatePayload,
} from "@fusion/core";
import type { NodeConfig, PeerSyncRequest, PeerSyncResponse } from "@fusion/core";
import { peerExchangeLog } from "./logger.js";

export interface PeerExchangeServiceOptions {
  /** Interval between peer sync cycles in milliseconds. Default: 120000 (2 minutes) */
  syncIntervalMs?: number;
  /** When true, include settings and model auth data in peer sync exchanges. Default: false. */
  settingsSyncEnabled?: boolean;
  /** Minimum interval between settings syncs with the same node in milliseconds.
   *  Prevents redundant transfers when the remote version hasn't changed.
   *  Default: 300000 (5 minutes). Only applies when settingsSyncEnabled is true. */
  settingsSyncThrottleMs?: number;
  /** Global settings to include in settings sync. Required when settingsSyncEnabled is true. */
  globalSettings?: GlobalSettings;
  /** When true, include auth material in shared-state exchanges. Default: false. */
  settingsSyncAuth?: boolean;
  /** Provider auth credentials to include in settings sync. */
  providerAuth?: Record<string, { type: "api_key" | "oauth"; key?: string; accessToken?: string; authenticated?: boolean }>;
}

/**
 * Result of syncing with a single node.
 */
export interface SyncResult {
  /** Node ID that was synced with */
  nodeId: string;
  /** Whether the sync was successful */
  success: boolean;
  /** Number of new peers discovered */
  added: number;
  /** Number of peers updated */
  updated: number;
  /** Error message if sync failed */
  error?: string;
  /** Whether remote settings were applied during this sync. */
  settingsApplied?: boolean;
  /** The settings version (checksum) observed on the remote node. */
  settingsVersion?: string;
}

/**
 * Background service that implements the peer gossip protocol.
 *
 * Periodically exchanges peer information with connected remote nodes
 * to keep the mesh state up-to-date across all nodes.
 */
export class PeerExchangeService {
  private centralCore: CentralCore;
  private syncIntervalMs: number;
  private interval: ReturnType<typeof setInterval> | null = null;
  private activeSync: Promise<void> | null = null;
  private running = false;
  /** Whether settings sync is enabled. Default: false. */
  private settingsSyncEnabled: boolean;
  /** Minimum interval between settings syncs with the same node in ms. Default: 5 minutes. */
  private settingsSyncThrottleMs: number;
  /** Tracks last settings sync by nodeId: version (checksum) + timestamp. */
  private lastSettingsSyncByNode = new Map<string, { version: string; timestamp: number }>();
  /** Cached settings payload from the last successful getSettingsForSync call. */
  private cachedSettingsPayload: SettingsSyncPayload | null = null;
  /** Cached shared-state settings/auth payload built from canonical snapshots. */
  private cachedSharedStatePayload: SharedMeshStatePayload | null = null;
  /** Global settings provided via options. */
  private globalSettings?: GlobalSettings;
  /** Whether auth snapshot exchange is enabled. */
  private settingsSyncAuth: boolean;
  /** Provider auth credentials provided via options. */
  private providerAuth?: Record<string, { type: "api_key" | "oauth"; key?: string; accessToken?: string; authenticated?: boolean }>;

  /**
   * Create a PeerExchangeService.
   *
   * @param centralCore - CentralCore instance for node registry access
   * @param options - Configuration options
   */
  constructor(centralCore: CentralCore, options: PeerExchangeServiceOptions = {}) {
    this.centralCore = centralCore;
    this.syncIntervalMs = options.syncIntervalMs ?? 120_000; // 2 minute default
    this.settingsSyncEnabled = options.settingsSyncEnabled ?? false;
    this.settingsSyncThrottleMs = options.settingsSyncThrottleMs ?? 300_000; // 5 minutes default
    this.globalSettings = options.globalSettings;
    this.settingsSyncAuth = options.settingsSyncAuth ?? false;
    this.providerAuth = options.providerAuth;
  }

  /**
   * Update the global settings used for settings sync.
   * Call this when global settings change to ensure fresh data is included in the next sync.
   *
   * @param settings - Updated global settings
   */
  updateGlobalSettings(settings: GlobalSettings): void {
    this.globalSettings = settings;
    // Invalidate cache to ensure fresh payload on next sync
    this.cachedSettingsPayload = null;
    this.cachedSharedStatePayload = null;
  }

  /**
   * Start the peer exchange service.
   * Begins periodic gossip with all online remote nodes.
   */
  start(): void {
    if (this.running) {
      peerExchangeLog.log("Peer exchange service already running");
      return;
    }

    this.running = true;

    // Get initial peer count for logging (async call)
    this.centralCore.listNodes().then((nodes) => {
      const onlineRemoteCount = nodes.filter(
        (n) => n.type === "remote" && n.status === "online" && n.url
      ).length;

      peerExchangeLog.log(`Starting peer exchange service (sync interval: ${this.syncIntervalMs}ms, ${onlineRemoteCount} online remote peers)`);
    }).catch((err) => {
      peerExchangeLog.warn(`Failed to get initial peer count: ${err}`);
    });

    // Start periodic sync
    this.interval = setInterval(() => {
      if (!this.running) return;
      void this.syncWithAllPeers();
    }, this.syncIntervalMs);
  }

  /**
   * Stop the peer exchange service.
   * Clears the sync interval and prevents further syncs.
   */
  async stop(): Promise<void> {
    if (!this.running) {
      return;
    }

    this.running = false;

    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }

    // If a sync cycle is already in flight, wait for it to settle so shutdown
    // does not leave partially completed gossip work behind.
    if (this.activeSync) {
      try {
        await this.activeSync;
      } catch {
        // best-effort shutdown; sync errors are already logged by run loop
      }
    }

    peerExchangeLog.log("Stopped peer exchange service");
  }

  /**
   * Trigger an immediate sync with all peers, bypassing the interval.
   *
   * If a sync is already in progress, returns the in-progress sync.
   *
   * @returns Promise that resolves when the sync completes
   */
  async triggerSync(): Promise<SyncResult[]> {
    return this.syncWithAllPeers();
  }

  /**
   * Sync with all online remote nodes.
   *
   * Uses single-flight pattern to prevent overlapping syncs.
   * If a sync is already in progress, returns that sync's promise.
   */
  async syncWithAllPeers(): Promise<SyncResult[]> {
    // Single-flight: if a sync is already running, return that
    if (this.activeSync) {
      peerExchangeLog.log("Sync already in progress, skipping");
      await this.activeSync;
      return [];
    }

    this.activeSync = this.runSyncWithAllPeers();
    try {
      await this.activeSync;
    } finally {
      this.activeSync = null;
    }

    return [];
  }

  private async runSyncWithAllPeers(): Promise<void> {
    try {
      // Get all online remote nodes with URLs
      const nodes = await this.centralCore.listNodes();
      const onlineRemoteNodes = nodes.filter(
        (node) => node.type === "remote" && node.status === "online" && node.url
      );

      if (onlineRemoteNodes.length === 0) {
        peerExchangeLog.log("No online remote nodes to sync with");
        return;
      }

      peerExchangeLog.log(`Starting sync with ${onlineRemoteNodes.length} peers`);

      // Sync with each node sequentially (not in parallel to avoid thundering herd)
      let totalAdded = 0;
      let totalUpdated = 0;
      const errors: string[] = [];

      for (const node of onlineRemoteNodes) {
        try {
          const result = await this.syncWithNode(node);
          totalAdded += result.added;
          totalUpdated += result.updated;
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          errors.push(`${node.name}: ${message}`);
          peerExchangeLog.warn(`Sync with ${node.name} failed: ${message}`);
        }
      }

      // Log summary
      if (errors.length > 0) {
        peerExchangeLog.log(
          `Sync complete: ${onlineRemoteNodes.length - errors.length} succeeded, ${errors.length} failed. ` +
          `${totalAdded} new peers discovered, ${totalUpdated} updated. Errors: ${errors.join("; ")}`
        );
      } else {
        peerExchangeLog.log(
          `Sync complete: ${onlineRemoteNodes.length} peers synced. ` +
          `${totalAdded} new peers discovered, ${totalUpdated} updated.`
        );
      }
    } catch (error) {
      peerExchangeLog.error("Unexpected error in sync loop:", error);
    }
  }

  /**
   * Sync with a single remote node.
   *
   * Sends our known peers and merges the response. When settingsSyncEnabled is true,
   * also exchanges settings and model auth data using checksum-based version comparison
   * and throttling to prevent redundant transfers.
   *
   * @param node - Remote node configuration
   * @returns Sync result with counts and any errors
   */
  async syncWithNode(node: NodeConfig): Promise<SyncResult> {
    try {
      // Build the sync request
      // Refresh local metrics first to ensure freshness
      await this.centralCore.reportMeshState();

      // Get local node info
      const nodes = await this.centralCore.listNodes();
      const localNode = nodes.find((n) => n.type === "local");
      if (!localNode) {
        return { nodeId: node.id, success: false, added: 0, updated: 0, error: "Local node not found" };
      }

      // Get all known peers for the request
      const allKnownPeers = await this.centralCore.getAllKnownPeerInfo();

      const request: PeerSyncRequest = {
        senderNodeId: localNode.id,
        senderNodeUrl: localNode.url || "",
        knownPeers: allKnownPeers,
        timestamp: new Date().toISOString(),
      };

      // ── Settings sync: decide whether to include settings in request ──
      let shouldIncludeSettings = false;

      if (this.settingsSyncEnabled) {
        try {
          // Get or refresh cached settings payload
          if (!this.cachedSettingsPayload) {
            this.cachedSettingsPayload = await this.centralCore.getSettingsForSync(
              this.globalSettings ?? {},
              this.providerAuth ? { providerAuth: this.providerAuth } : undefined
            );
          }

          const storedSync = this.lastSettingsSyncByNode.get(node.id);
          const now = Date.now();

          if (!storedSync) {
            // First sync with this node - always include settings
            shouldIncludeSettings = true;
            peerExchangeLog.log(`Including settings in sync request to ${node.name} (first sync)`);
          } else if (storedSync.version !== this.cachedSettingsPayload.checksum) {
            // Local settings have changed - bypass throttle
            shouldIncludeSettings = true;
            peerExchangeLog.log(
              `Including settings in sync request to ${node.name} (version changed: ${storedSync.version} → ${this.cachedSettingsPayload.checksum})`
            );
          } else {
            const elapsed = now - storedSync.timestamp;
            if (elapsed >= this.settingsSyncThrottleMs) {
              // Throttle window expired - include settings
              shouldIncludeSettings = true;
              peerExchangeLog.log(
                `Including settings in sync request to ${node.name} (throttle expired after ${elapsed}ms)`
              );
            } else {
              // Throttled - skip settings
              peerExchangeLog.log(
                `Settings sync throttled for ${node.name} (version: ${storedSync.version}, ${elapsed}ms ago, throttle: ${this.settingsSyncThrottleMs}ms)`
              );
            }
          }

          if (shouldIncludeSettings) {
            request.settings = this.cachedSettingsPayload;
            request.sharedState = await this.getSharedStateSettingsBundle();
          }
        } catch (err) {
          // Log error but continue with peer sync
          const error = err instanceof Error ? err : String(err);
          peerExchangeLog.warn(`Failed to get settings for sync with ${node.name}: ${error}`);
        }
      }

      // Build headers
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (node.apiKey) {
        headers["Authorization"] = `Bearer ${node.apiKey}`;
      }

      // Send the sync request with 10-second timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10_000);

      let settingsApplied = false;
      let settingsVersion: string | undefined;

      try {
        const response = await fetch(`${node.url}/api/mesh/sync`, {
          method: "POST",
          headers,
          body: JSON.stringify(request),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          return {
            nodeId: node.id,
            success: false,
            added: 0,
            updated: 0,
            error: `HTTP ${response.status}: ${response.statusText}`,
          };
        }

        const peerResponse: PeerSyncResponse = await response.json();

        // Merge ALL known peers from the response (not just newPeers)
        // This ensures we get updates for existing peers too
        const mergeResult = await this.centralCore.mergePeers(peerResponse.knownPeers);

        // ── Process remote settings if included in response ──
        if (this.settingsSyncEnabled && (peerResponse.sharedState || peerResponse.settings)) {
          const remoteChecksum =
            peerResponse.sharedState?.projectSettings?.checksum ??
            peerResponse.settings?.checksum;
          settingsVersion = remoteChecksum;

          const localChecksum = this.cachedSettingsPayload?.checksum ?? "";

          if (remoteChecksum && remoteChecksum !== localChecksum) {
            try {
              const applyResult = await this.applyRemoteSharedState(peerResponse.sharedState, peerResponse.settings);

              if (applyResult.success) {
                settingsApplied = true;
                peerExchangeLog.log(
                  `Applied remote settings from ${node.name} (version: ${remoteChecksum}, ` +
                    `global: ${applyResult.globalCount}, projects: ${applyResult.projectCount}, auth: ${applyResult.authCount})`,
                );
                // Invalidate cache to ensure fresh data on next sync
                this.cachedSettingsPayload = null;
                this.cachedSharedStatePayload = null;
              } else {
                peerExchangeLog.warn(`Failed to apply remote settings from ${node.name}: ${applyResult.error}`);
              }
            } catch (err) {
              const error = err instanceof Error ? err.message : String(err);
              peerExchangeLog.warn(`Settings sync error with ${node.name}: ${error}`);
            }
          } else if (remoteChecksum) {
            peerExchangeLog.log(
              `Remote settings from ${node.name} are up-to-date (version: ${remoteChecksum})`,
            );
          }

          if (remoteChecksum) {
            this.lastSettingsSyncByNode.set(node.id, {
              version: remoteChecksum,
              timestamp: Date.now(),
            });
          }
        }

        peerExchangeLog.log(
          `Synced with ${node.name}: ${mergeResult.added.length} new, ${mergeResult.updated.length} updated, ` +
          `${peerResponse.newPeers.length} new to sender`
        );

        const result: SyncResult = {
          nodeId: node.id,
          success: true,
          added: mergeResult.added.length,
          updated: mergeResult.updated.length,
        };

        // Only include settings fields when settingsSyncEnabled is true
        if (this.settingsSyncEnabled) {
          result.settingsApplied = settingsApplied;
          result.settingsVersion = settingsVersion;
        }

        return result;
      } catch (fetchError) {
        clearTimeout(timeoutId);
        throw fetchError;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (message.includes("abort")) {
        return { nodeId: node.id, success: false, added: 0, updated: 0, error: "Timeout (10s)" };
      }
      return { nodeId: node.id, success: false, added: 0, updated: 0, error: message };
    }
  }

  private async getSharedStateSettingsBundle(): Promise<SharedMeshStatePayload | undefined> {
    if (this.cachedSharedStatePayload) {
      return this.cachedSharedStatePayload;
    }
    const globalSettings = this.globalSettings ?? {};
    const core = this.centralCore as CentralCore & {
      getProjectSettingsSnapshot?: (settings: GlobalSettings) => Promise<SharedMeshStatePayload["projectSettings"]>;
      getAuthMaterialSnapshot?: (
        providerAuth?: Record<string, { type: "api_key" | "oauth"; key?: string; accessToken?: string; authenticated?: boolean }>,
      ) => SharedMeshStatePayload["authMaterial"];
    };
    if (!core.getProjectSettingsSnapshot || !core.getAuthMaterialSnapshot) {
      return undefined;
    }
    const projectSettings = await core.getProjectSettingsSnapshot(globalSettings);
    const authMaterial = this.settingsSyncAuth ? core.getAuthMaterialSnapshot(this.providerAuth) : undefined;
    this.cachedSharedStatePayload = { projectSettings, authMaterial };
    return this.cachedSharedStatePayload;
  }

  private async applyRemoteSharedState(
    sharedState: SharedMeshStatePayload | undefined,
    fallbackSettings: SettingsSyncPayload | undefined,
  ): Promise<{ success: boolean; globalCount: number; projectCount: number; authCount: number; error?: string }> {
    const core = this.centralCore as CentralCore & {
      applyProjectSettingsSnapshot?: (snapshot: NonNullable<SharedMeshStatePayload["projectSettings"]>) => Promise<{ success: boolean; globalCount: number; projectCount: number; authCount: number; error?: string }>;
      applyAuthMaterialSnapshot?: (snapshot: NonNullable<SharedMeshStatePayload["authMaterial"]>) => { success?: boolean; authCount?: number; error?: string; providerAuth?: Record<string, unknown> };
    };

    if (sharedState?.projectSettings && core.applyProjectSettingsSnapshot) {
      const result = await core.applyProjectSettingsSnapshot(sharedState.projectSettings);
      if (this.settingsSyncAuth && sharedState.authMaterial && core.applyAuthMaterialSnapshot) {
        const authResult = core.applyAuthMaterialSnapshot(sharedState.authMaterial);
        const authCount =
          typeof authResult.authCount === "number"
            ? authResult.authCount
            : Object.keys(sharedState.authMaterial.payload.providerAuth ?? {}).length;
        return { ...result, authCount: Math.max(result.authCount, authCount) };
      }
      return result;
    }

    if (fallbackSettings) {
      return this.centralCore.applyRemoteSettings(fallbackSettings);
    }

    return { success: true, globalCount: 0, projectCount: 0, authCount: 0 };
  }
}
