import { describe, expect, it, vi, beforeEach } from "vitest";

const { execMock, readFileMock, pingMock, versionMock, inspectMock, dockerCtor } = vi.hoisted(() => {
  const execMock = vi.fn();
  const readFileMock = vi.fn();
  const pingMock = vi.fn();
  const versionMock = vi.fn();
  const inspectMock = vi.fn();
  const dockerCtor = vi.fn().mockImplementation(() => ({
    ping: pingMock,
    version: versionMock,
    getContainer: vi.fn(() => ({ inspect: inspectMock })),
  }));
  return { execMock, readFileMock, pingMock, versionMock, inspectMock, dockerCtor };
});

vi.mock("dockerode", () => ({ default: dockerCtor }));
vi.mock("node:child_process", () => ({ exec: execMock }));
vi.mock("node:fs/promises", () => ({ readFile: readFileMock }));

import { DockerClientService } from "../docker-client";

describe("DockerClientService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    execMock.mockImplementation((cmd: string, _opts: unknown, cb: (err: unknown, out: { stdout: string; stderr: string }) => void) => cb(null, { stdout: "", stderr: "" }));
    pingMock.mockResolvedValue(undefined);
    versionMock.mockResolvedValue({ Version: "24.0.0", ApiVersion: "1.43", Os: "linux" });
    readFileMock.mockResolvedValue(Buffer.from("x"));
  });

  it.each([
    [undefined, undefined],
    [{ host: "tcp://1.2.3.4:2376" }, { host: "tcp://1.2.3.4:2376" }],
  ])("creates docker instance for mode", async (hostConfig, expected) => {
    const service = new DockerClientService();
    await service.testConnection(hostConfig as never);
    if (expected) expect(dockerCtor).toHaveBeenCalledWith(expected);
    else expect(dockerCtor).toHaveBeenCalledWith();
  });

  it("returns success connection result", async () => {
    const service = new DockerClientService();
    const result = await service.testConnection();
    expect(result.success).toBe(true);
    expect(result.dockerVersion).toBe("24.0.0");
    expect(result.apiVersion).toBe("1.43");
    expect(result.operatingSystem).toBe("linux");
    expect(result.isLocalDaemon).toBe(true);
  });

  it("marks remote host as non-local daemon", async () => {
    const service = new DockerClientService();
    const result = await service.testConnection({ host: "tcp://1.2.3.4:2376" });
    expect(result.success).toBe(true);
    expect(result.isLocalDaemon).toBe(false);
  });

  it.each([
    { mode: "context", hostConfig: { context: "my-remote" } },
    {
      mode: "host+tls",
      hostConfig: {
        host: "tcp://1.2.3.4:2376",
        tlsVerify: true,
        tlsCaPath: "/ca.pem",
        tlsCertPath: "/cert.pem",
        tlsKeyPath: "/key.pem",
      },
    },
  ])("covers additional mode $mode", async ({ hostConfig }) => {
    if ((hostConfig as any).context) {
      execMock.mockImplementation((cmd: string, _opts: unknown, cb: (err: unknown, out: { stdout: string; stderr: string }) => void) => {
        if (cmd.includes("context inspect")) cb(null, { stdout: '[{"Endpoints":{"docker":{"Host":"tcp://ctx:2376"}}}]', stderr: "" });
        else cb(null, { stdout: "", stderr: "" });
      });
    }
    const service = new DockerClientService();
    await service.testConnection(hostConfig as any);
    expect(dockerCtor).toHaveBeenCalled();
  });

  it("uses docker context", async () => {
    execMock.mockImplementation((cmd: string, _opts: unknown, cb: (err: unknown, out: { stdout: string; stderr: string }) => void) => {
      if (cmd.includes("context inspect")) cb(null, { stdout: '[{"Endpoints":{"docker":{"Host":"tcp://ctx:2376"}}}]', stderr: "" });
      else cb(null, { stdout: "", stderr: "" });
    });
    const service = new DockerClientService();
    await service.testConnection({ context: "my-remote" });
    expect(execMock.mock.calls[0][0]).toContain("docker context inspect");
    expect(dockerCtor).toHaveBeenCalledWith({ host: "tcp://ctx:2376" });
  });

  it("supports host with tls", async () => {
    const service = new DockerClientService();
    await service.testConnection({ host: "tcp://1.2.3.4:2376", tlsVerify: true, tlsCaPath: "/ca.pem", tlsCertPath: "/cert.pem", tlsKeyPath: "/key.pem" });
    expect(readFileMock).toHaveBeenCalledTimes(3);
  });

  it("returns failure when ping fails", async () => {
    pingMock.mockRejectedValue(new Error("connect ECONNREFUSED"));
    const service = new DockerClientService();
    const result = await service.testConnection();
    expect(result.success).toBe(false);
    expect(result.error).toContain("ECONNREFUSED");
  });

  it("lists contexts and ENOENT fallback", async () => {
    execMock.mockImplementationOnce((cmd: string, _opts: unknown, cb: (err: unknown, out: { stdout: string; stderr: string }) => void) => cb(null, { stdout: '{"Name":"default","Current":true}\n{"Name":"remote","DockerHost":"tcp://1.2.3.4:2376","Current":false}\n', stderr: "" }));
    const service = new DockerClientService();
    const contexts = await service.listContexts();
    expect(contexts).toHaveLength(2);

    execMock.mockImplementationOnce((_cmd: string, _opts: unknown, cb: (err: unknown) => void) => cb(new Error("ENOENT")));
    const fallback = await service.listContexts();
    expect(fallback[0].name).toBe("default");
  });

  it("gets container info and not found", async () => {
    inspectMock.mockResolvedValue({ Id: "abc", Name: "/container", Created: "2020-01-01T00:00:00Z", Config: { Image: "img:latest" }, State: { Status: "running", Running: true, Paused: false, Restarting: false, Dead: false } });
    const service = new DockerClientService();
    const container = await service.getContainerInfo("abc");
    expect(container?.name).toBe("container");

    inspectMock.mockRejectedValue(new Error("404 no such container"));
    const missing = await service.getContainerInfo("missing");
    expect(missing).toBeNull();
  });

  it("does not use execSync", async () => {
    const source = await import("node:fs/promises").then((m) => m.readFile(new URL("../docker-client.ts", import.meta.url), "utf8"));
    expect(source.includes("execSync")).toBe(false);
  });
});
