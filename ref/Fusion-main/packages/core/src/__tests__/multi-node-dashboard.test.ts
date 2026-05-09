/**
 * Integration tests for multi-node dashboard functionality.
 *
 * Tests the full flow of node registration, status management,
 * and dashboard display in the multi-node context.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { CentralCore } from "../central-core.js";
import { seedSampleNodes } from "./seed-sample-nodes.js";
import type { NodeConfig, NodeStatus } from "../types.js";

describe("Multi-Node Dashboard", () => {
  let tempDir: string;
  let central: CentralCore;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-01T12:00:00.000Z"));
    tempDir = mkdtempSync(join(tmpdir(), "kb-multi-node-test-"));
    central = new CentralCore(tempDir);
  });

  afterEach(async () => {
    await central.close();
    vi.useRealTimers();
    vi.restoreAllMocks();
    rmSync(tempDir, { recursive: true, force: true });
  });

  describe("node registration with mixed types", () => {
    it("should register remote nodes and list all sorted by name", async () => {
      await central.init();

      // Note: init() creates a default "local" node automatically
      // Register remote nodes only (to avoid duplicate local nodes)
      await central.registerNode({
        name: "Alpha Remote",
        type: "remote",
        url: "https://alpha.example.com",
        maxConcurrent: 2,
      });

      await central.registerNode({
        name: "Beta Remote",
        type: "remote",
        url: "https://beta.example.com",
        maxConcurrent: 4,
      });

      await central.registerNode({
        name: "Gamma Remote",
        type: "remote",
        url: "https://gamma.example.com",
        maxConcurrent: 8,
      });

      const nodes = await central.listNodes();

      // 1 default local + 3 remote = 4 nodes
      expect(nodes).toHaveLength(4);

      // Should be sorted alphabetically by name
      const names = nodes.map((n) => n.name);
      expect(names).toEqual([
        "Alpha Remote",
        "Beta Remote",
        "Gamma Remote",
        "local", // auto-created local node
      ]);

      // Verify types
      const localNodes = nodes.filter((n) => n.type === "local");
      const remoteNodes = nodes.filter((n) => n.type === "remote");
      expect(localNodes).toHaveLength(1);
      expect(remoteNodes).toHaveLength(3);
    });

    it("should create 1 local + 5 remote nodes via seed function", async () => {
      await central.init();
      const nodes = await seedSampleNodes(central);

      expect(nodes).toHaveLength(6);

      // Verify 1 local node
      const localNodes = nodes.filter((n) => n.type === "local");
      expect(localNodes).toHaveLength(1);
      expect(localNodes[0].name).toBe("local");
      expect(localNodes[0].status).toBe("online");

      // Verify 5 remote nodes
      const remoteNodes = nodes.filter((n) => n.type === "remote");
      expect(remoteNodes).toHaveLength(5);

      // Verify expected remote nodes exist
      const remoteNames = remoteNodes.map((n) => n.name).sort();
      expect(remoteNames).toEqual([
        "Build Machine",
        "Dev Box (John)",
        "GPU Cluster",
        "QA Environment",
        "Staging Server",
      ]);
    });
  });

  describe("node status transitions", () => {
    it("should transition node from offline to online", async () => {
      await central.init();

      const node = await central.registerNode({
        name: "Status Test Node",
        type: "local",
        maxConcurrent: 2,
      });

      expect(node.status).toBe("offline");

      // Transition to online
      const onlineNode = await central.updateNode(node.id, { status: "online" });
      expect(onlineNode.status).toBe("online");

      // Verify persisted
      const fetched = await central.getNode(node.id);
      expect(fetched?.status).toBe("online");
    });

    it("should transition node through multiple statuses", async () => {
      await central.init();

      const node = await central.registerNode({
        name: "Multi Status Node",
        type: "remote",
        url: "https://multi-status.example.com",
        maxConcurrent: 2,
      });

      // offline -> connecting -> online
      let updated = await central.updateNode(node.id, { status: "connecting" });
      expect(updated.status).toBe("connecting");

      updated = await central.updateNode(node.id, { status: "online" });
      expect(updated.status).toBe("online");

      // online -> error
      updated = await central.updateNode(node.id, { status: "error" });
      expect(updated.status).toBe("error");

      // error -> offline
      updated = await central.updateNode(node.id, { status: "offline" });
      expect(updated.status).toBe("offline");
    });

    it("should handle seed nodes with varied statuses", async () => {
      await central.init();
      const nodes = await seedSampleNodes(central);

      // Verify all expected statuses
      const statusMap = new Map<string, NodeStatus>();
      for (const node of nodes) {
        statusMap.set(node.name, node.status);
      }

      expect(statusMap.get("local")).toBe("online");
      expect(statusMap.get("Staging Server")).toBe("online");
      expect(statusMap.get("Build Machine")).toBe("online");
      expect(statusMap.get("GPU Cluster")).toBe("offline");
      expect(statusMap.get("Dev Box (John)")).toBe("error");
      expect(statusMap.get("QA Environment")).toBe("connecting");
    });
  });

  describe("list nodes returns correct type distribution", () => {
    it("should return correct local vs remote count", async () => {
      await central.init();

      // Add via seed which has 1 local + 5 remote
      await seedSampleNodes(central);

      const nodes = await central.listNodes();
      const localNodes = nodes.filter((n) => n.type === "local");
      const remoteNodes = nodes.filter((n) => n.type === "remote");

      expect(localNodes).toHaveLength(1);
      expect(remoteNodes).toHaveLength(5);
      expect(nodes).toHaveLength(6);
    });

    it("should return correct status distribution", async () => {
      await central.init();
      await seedSampleNodes(central);

      const nodes = await central.listNodes();

      const online = nodes.filter((n) => n.status === "online").length;
      const offline = nodes.filter((n) => n.status === "offline").length;
      const error = nodes.filter((n) => n.status === "error").length;
      const connecting = nodes.filter((n) => n.status === "connecting").length;

      expect(online).toBe(3); // local + 2 remote
      expect(offline).toBe(1); // GPU Cluster
      expect(error).toBe(1); // Dev Box (John)
      expect(connecting).toBe(1); // QA Environment
    });
  });

  describe("concurrent max tracking", () => {
    it("should preserve maxConcurrent on registration", async () => {
      await central.init();

      const node = await central.registerNode({
        name: "Max Concurrent Test",
        type: "local",
        maxConcurrent: 8,
      });

      expect(node.maxConcurrent).toBe(8);

      const fetched = await central.getNode(node.id);
      expect(fetched?.maxConcurrent).toBe(8);
    });

    it("should preserve maxConcurrent on update", async () => {
      await central.init();

      const node = await central.registerNode({
        name: "Max Concurrent Update",
        type: "local",
        maxConcurrent: 2,
      });

      const updated = await central.updateNode(node.id, { maxConcurrent: 16 });
      expect(updated.maxConcurrent).toBe(16);

      const fetched = await central.getNode(node.id);
      expect(fetched?.maxConcurrent).toBe(16);
    });

    it("should preserve maxConcurrent from seed nodes", async () => {
      await central.init();
      await seedSampleNodes(central);

      const nodes = await central.listNodes();
      const maxConcurrentMap = new Map<string, number>();
      for (const node of nodes) {
        maxConcurrentMap.set(node.name, node.maxConcurrent);
      }

      expect(maxConcurrentMap.get("local")).toBe(4);
      expect(maxConcurrentMap.get("Staging Server")).toBe(4);
      expect(maxConcurrentMap.get("Build Machine")).toBe(8);
      expect(maxConcurrentMap.get("GPU Cluster")).toBe(16);
      expect(maxConcurrentMap.get("Dev Box (John)")).toBe(2);
      expect(maxConcurrentMap.get("QA Environment")).toBe(4);
    });

    it("should reject invalid maxConcurrent values", async () => {
      await central.init();

      // Test zero
      await expect(
        central.registerNode({
          name: "Zero Max",
          type: "local",
          maxConcurrent: 0,
        }),
      ).rejects.toThrow("maxConcurrent must be >= 1");

      // Test negative
      await expect(
        central.registerNode({
          name: "Negative Max",
          type: "local",
          maxConcurrent: -1,
        }),
      ).rejects.toThrow("maxConcurrent must be >= 1");

      // Test Infinity
      await expect(
        central.registerNode({
          name: "Infinity Max",
          type: "local",
          maxConcurrent: Infinity,
        }),
      ).rejects.toThrow("maxConcurrent must be >= 1");

      // Test NaN
      await expect(
        central.registerNode({
          name: "NaN Max",
          type: "local",
          maxConcurrent: NaN,
        }),
      ).rejects.toThrow("maxConcurrent must be >= 1");
    });
  });

  describe("unregister removes node from listing", () => {
    it("should remove node from list after unregister", async () => {
      await central.init();
      await seedSampleNodes(central);

      const nodesBefore = await central.listNodes();
      expect(nodesBefore).toHaveLength(6);

      // Unregister one remote node
      const stagingServer = nodesBefore.find((n) => n.name === "Staging Server");
      expect(stagingServer).toBeDefined();

      await central.unregisterNode(stagingServer!.id);

      const nodesAfter = await central.listNodes();
      expect(nodesAfter).toHaveLength(5);

      // Verify removed
      const names = nodesAfter.map((n) => n.name);
      expect(names).not.toContain("Staging Server");
    });

    it("should remove multiple nodes and leave correct count", async () => {
      await central.init();
      await seedSampleNodes(central);

      // Unregister 2 nodes (GPU Cluster and QA Environment)
      const nodes = await central.listNodes();
      const gpuCluster = nodes.find((n) => n.name === "GPU Cluster");
      const qaEnv = nodes.find((n) => n.name === "QA Environment");

      await central.unregisterNode(gpuCluster!.id);
      await central.unregisterNode(qaEnv!.id);

      const remaining = await central.listNodes();
      expect(remaining).toHaveLength(4);

      // Verify remaining nodes
      const remainingNames = remaining.map((n) => n.name).sort();
      expect(remainingNames).toEqual([
        "Build Machine",
        "Dev Box (John)",
        "Staging Server",
        "local",
      ]);
    });

    it("should be idempotent when unregistering non-existent node", async () => {
      await central.init();
      await seedSampleNodes(central);

      const nodesBefore = await central.listNodes();

      // Try to unregister non-existent node
      await expect(central.unregisterNode("non_existent_id")).resolves.toBeUndefined();

      const nodesAfter = await central.listNodes();
      expect(nodesAfter).toHaveLength(nodesBefore.length);
    });
  });

  describe("node name uniqueness enforcement", () => {
    it("should reject duplicate node names", async () => {
      await central.init();

      await central.registerNode({
        name: "Unique Name",
        type: "local",
        maxConcurrent: 2,
      });

      await expect(
        central.registerNode({
          name: "Unique Name",
          type: "local",
          maxConcurrent: 2,
        }),
      ).rejects.toThrow("already exists");
    });

    it("should allow same name after unregister", async () => {
      await central.init();

      const node = await central.registerNode({
        name: "Reusable Name",
        type: "local",
        maxConcurrent: 2,
      });

      await central.unregisterNode(node.id);

      // Should be able to register again with same name
      const newNode = await central.registerNode({
        name: "Reusable Name",
        type: "local",
        maxConcurrent: 4,
      });

      expect(newNode.name).toBe("Reusable Name");
    });

    it("should reject duplicate names during seed idempotency", async () => {
      await central.init();
      await seedSampleNodes(central);

      // Running seed again should update existing nodes, not fail
      const nodes = await seedSampleNodes(central);
      expect(nodes).toHaveLength(6);
    });
  });

  describe("remote nodes require URL", () => {
    it("should reject remote node without URL", async () => {
      await central.init();

      await expect(
        central.registerNode({
          name: "Remote Without URL",
          type: "remote",
          maxConcurrent: 2,
        }),
      ).rejects.toThrow("must include a url");
    });

    it("should reject remote node with empty URL", async () => {
      await central.init();

      await expect(
        central.registerNode({
          name: "Remote With Empty URL",
          type: "remote",
          url: "",
          maxConcurrent: 2,
        }),
      ).rejects.toThrow("must include a url");
    });

    it("should accept remote node with valid URL", async () => {
      await central.init();

      const node = await central.registerNode({
        name: "Remote With URL",
        type: "remote",
        url: "https://valid.example.com",
        maxConcurrent: 2,
      });

      expect(node.url).toBe("https://valid.example.com");
      expect(node.type).toBe("remote");
    });

    it("should allow remote node URL update", async () => {
      await central.init();

      const node = await central.registerNode({
        name: "URL Update Test",
        type: "remote",
        url: "https://old.example.com",
        maxConcurrent: 2,
      });

      const updated = await central.updateNode(node.id, {
        url: "https://new.example.com",
      });

      expect(updated.url).toBe("https://new.example.com");
    });
  });

  describe("local nodes must not have URL/apiKey", () => {
    it("should reject local node with URL", async () => {
      await central.init();

      await expect(
        central.registerNode({
          name: "Local With URL",
          type: "local",
          url: "https://should-fail.example.com",
          maxConcurrent: 2,
        }),
      ).rejects.toThrow("must not include url or apiKey");
    });

    it("should reject local node with apiKey", async () => {
      await central.init();

      await expect(
        central.registerNode({
          name: "Local With API Key",
          type: "local",
          apiKey: "secret-key",
          maxConcurrent: 2,
        }),
      ).rejects.toThrow("must not include url or apiKey");
    });

    it("should reject local node with both URL and apiKey", async () => {
      await central.init();

      await expect(
        central.registerNode({
          name: "Local With Both",
          type: "local",
          url: "https://fail.example.com",
          apiKey: "secret-key",
          maxConcurrent: 2,
        }),
      ).rejects.toThrow("must not include url or apiKey");
    });

    it("should accept local node without URL or apiKey", async () => {
      await central.init();

      const node = await central.registerNode({
        name: "Valid Local",
        type: "local",
        maxConcurrent: 2,
      });

      expect(node.type).toBe("local");
      expect(node.url).toBeUndefined();
      expect(node.apiKey).toBeUndefined();
    });
  });

  describe("seed function idempotency", () => {
    it("should handle multiple seed calls without creating duplicates", async () => {
      await central.init();

      // First seed
      const firstSeed = await seedSampleNodes(central);
      expect(firstSeed).toHaveLength(6);

      // Second seed - should update existing, not create duplicates
      const secondSeed = await seedSampleNodes(central);
      expect(secondSeed).toHaveLength(6);

      // Verify only 6 nodes exist
      const allNodes = await central.listNodes();
      expect(allNodes).toHaveLength(6);
    });

    it("should update existing node statuses on re-seed", async () => {
      await central.init();
      await seedSampleNodes(central);

      // Manually change a status
      const gpuCluster = await central.getNodeByName("GPU Cluster");
      expect(gpuCluster).toBeDefined();
      await central.updateNode(gpuCluster!.id, { status: "online" });

      // Re-seed should restore original status
      await seedSampleNodes(central);

      const updated = await central.getNodeByName("GPU Cluster");
      expect(updated?.status).toBe("offline"); // Original status from seed
    });
  });
});
