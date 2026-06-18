import { NextResponse } from "next/server";
import { getConfig } from "@/lib/env";
import { getTickets } from "@/lib/thoughts";
import { execSync } from "child_process";
import path from "path";
import fs from "fs";

export async function GET() {
  const config = getConfig();
  const checks: Record<string, unknown> = {};

  // 1. Database check
  try {
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();
    await prisma.$queryRaw`SELECT 1`;
    await prisma.$disconnect();
    checks.database = { status: "ok", url: config.databaseUrl };
  } catch (error) {
    checks.database = { status: "error", error: String(error) };
  }

  // 2. Thoughts repo check
  const thoughtsRoot = config.thoughtsRoot;
  try {
    const hasGit = fs.existsSync(path.join(thoughtsRoot, ".git"));
    if (hasGit) {
      const branch = execSync(`git -C "${thoughtsRoot}" rev-parse --abbrev-ref HEAD`, { encoding: "utf8" }).trim();
      const hash = execSync(`git -C "${thoughtsRoot}" rev-parse HEAD`, { encoding: "utf8" }).trim();
      checks.thoughts = { status: "ok", root: thoughtsRoot, branch, hash };
    } else {
      checks.thoughts = { status: "missing", root: thoughtsRoot };
    }
  } catch (error) {
    checks.thoughts = { status: "error", error: String(error) };
  }

  // 3. GitHub API check
  const headers: Record<string, string> = { Accept: "application/vnd.github+json" };
  const token = process.env.GITHUB_TOKEN;
  if (token) headers["Authorization"] = `Bearer ${token}`;
  try {
    const rateResp = await fetch("https://api.github.com/rate_limit", { headers, signal: AbortSignal.timeout(5000) });
    if (rateResp.ok) {
      const rateData = await rateResp.json();
      const core = rateData.resources?.core;
      checks.githubApi = {
        status: "ok",
        authenticated: !!token,
        rateLimit: core?.limit || 60,
        rateRemaining: core?.remaining || 0,
        rateReset: core?.reset ? new Date(core.reset * 1000).toISOString() : null,
      };
    } else {
      checks.githubApi = { status: "error", code: rateResp.status, authenticated: !!token };
    }
  } catch (error) {
    checks.githubApi = { status: "error", error: String(error), authenticated: !!token };
  }

  // 4. Data source check
  try {
    const { sourceInfo } = await getTickets("github", config.github.branch);
    checks.dataSource = sourceInfo;
  } catch {
    checks.dataSource = { status: "error" };
  }

  return NextResponse.json({
    status: checks.database?.status === "ok" ? "ok" : "degraded",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    config: {
      thoughtsRoot: config.thoughtsRoot,
      githubRepo: config.github.repo,
      githubBranch: config.github.branch,
      githubTokenAvailable: !!token,
    },
    ...checks,
  });
}
