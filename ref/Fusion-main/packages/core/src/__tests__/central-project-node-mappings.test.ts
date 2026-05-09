import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { CentralCore } from "../central-core.js";

describe("CentralCore project-node path mappings", () => {
  let tempDir: string;
  let central: CentralCore;

  beforeEach(async () => {
    tempDir = mkdtempSync(join(tmpdir(), "kb-central-mapping-test-"));
    central = new CentralCore(tempDir);
    await central.init();
  });

  afterEach(async () => {
    await central.close();
    rmSync(tempDir, { recursive: true, force: true });
  });

  it("creates a local-node mapping when registering a project", async () => {
    const projectPath = join(tempDir, "project-a");
    mkdirSync(projectPath);

    const project = await central.registerProject({ name: "Project A", path: projectPath });
    const localNode = (await central.listNodes()).find((node) => node.type === "local");

    const mapping = await central.getProjectNodePathMapping(project.id, localNode!.id);
    expect(mapping?.path).toBe(projectPath);
  });

  it("keeps local mapping in sync when project.path is updated", async () => {
    const projectPath = join(tempDir, "project-b");
    const projectPathNext = join(tempDir, "project-b-renamed");
    mkdirSync(projectPath);
    mkdirSync(projectPathNext);

    const project = await central.registerProject({ name: "Project B", path: projectPath });
    const localNode = (await central.listNodes()).find((node) => node.type === "local");

    await central.updateProject(project.id, { path: projectPathNext });

    const mapping = await central.getProjectNodePathMapping(project.id, localNode!.id);
    expect(mapping?.path).toBe(projectPathNext);
  });

  it("supports create/update/list/remove mapping CRUD", async () => {
    const projectPath = join(tempDir, "project-c");
    mkdirSync(projectPath);

    const project = await central.registerProject({ name: "Project C", path: projectPath });
    const remoteNode = await central.registerNode({
      name: "remote-c",
      type: "remote",
      url: "https://remote-c.example",
      apiKey: "secret",
    });

    const created = await central.createProjectNodePathMapping({
      projectId: project.id,
      nodeId: remoteNode.id,
      path: "/srv/project-c",
    });
    expect(created.path).toBe("/srv/project-c");

    const updated = await central.updateProjectNodePathMapping({
      projectId: project.id,
      nodeId: remoteNode.id,
      path: "/srv/project-c-next",
    });
    expect(updated.path).toBe("/srv/project-c-next");

    const listedByProject = await central.listProjectNodePathMappings({ projectId: project.id });
    expect(listedByProject.some((row) => row.nodeId === remoteNode.id)).toBe(true);

    await central.removeProjectNodePathMapping(project.id, remoteNode.id);
    const removed = await central.getProjectNodePathMapping(project.id, remoteNode.id);
    expect(removed).toBeUndefined();
  });

  it("rejects unknown project/node and duplicate/conflicting mappings", async () => {
    const projectPath = join(tempDir, "project-d");
    mkdirSync(projectPath);
    const project = await central.registerProject({ name: "Project D", path: projectPath });
    const remoteNode = await central.registerNode({
      name: "remote-d",
      type: "remote",
      url: "https://remote-d.example",
      apiKey: "secret",
    });

    await expect(
      central.createProjectNodePathMapping({
        projectId: "proj_missing",
        nodeId: remoteNode.id,
        path: "/x",
      }),
    ).rejects.toThrow("Project not found");

    await expect(
      central.createProjectNodePathMapping({
        projectId: project.id,
        nodeId: "node_missing",
        path: "/x",
      }),
    ).rejects.toThrow("Node not found");

    await central.createProjectNodePathMapping({
      projectId: project.id,
      nodeId: remoteNode.id,
      path: "/srv/project-d",
    });

    await expect(
      central.createProjectNodePathMapping({
        projectId: project.id,
        nodeId: remoteNode.id,
        path: "/srv/project-d-other",
      }),
    ).rejects.toThrow("already exists");

    await expect(
      central.updateProjectNodePathMapping({
        projectId: project.id,
        nodeId: "node_missing",
        path: "/y",
      }),
    ).rejects.toThrow("Node not found");
  });

  it("cleans up mappings when project or node is deleted", async () => {
    const projectPath = join(tempDir, "project-e");
    mkdirSync(projectPath);
    const project = await central.registerProject({ name: "Project E", path: projectPath });
    const remoteNode = await central.registerNode({
      name: "remote-e",
      type: "remote",
      url: "https://remote-e.example",
      apiKey: "secret",
    });

    await central.createProjectNodePathMapping({
      projectId: project.id,
      nodeId: remoteNode.id,
      path: "/srv/project-e",
    });

    await central.unregisterNode(remoteNode.id);
    expect(await central.getProjectNodePathMapping(project.id, remoteNode.id)).toBeUndefined();

    const localNode = (await central.listNodes()).find((node) => node.type === "local");
    expect(localNode).toBeDefined();

    await central.unregisterProject(project.id);
    expect(await central.getProjectNodePathMapping(project.id, localNode!.id)).toBeUndefined();
  });
});
