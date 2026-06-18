import { NextResponse } from "next/server";
import { execSync } from "child_process";
import path from "path";
import fs from "fs";
import { getConfig } from "@/lib/env";

export async function POST() {
  try {
    const config = getConfig();
    const thoughtsRoot = config.thoughtsRoot;
    const thoughtsParent = path.dirname(thoughtsRoot);

    // Auto-clone if repo doesn't exist
    if (!fs.existsSync(path.join(thoughtsRoot, ".git"))) {
      const repoUrl = `https://github.com/${config.github.repo}.git`;
      const token = process.env.GITHUB_TOKEN;
      const authUrl = token
        ? `https://x-access-token:${token}@github.com/${config.github.repo}.git`
        : repoUrl;

      try {
        fs.mkdirSync(thoughtsParent, { recursive: true });
        const cloneOutput = execSync(`git clone "${authUrl}" "${thoughtsRoot}" --branch ${config.github.branch} --single-branch`, {
          encoding: "utf8",
          stdio: "pipe",
          timeout: 60000,
        });
        return NextResponse.json({
          success: true,
          message: `f-rr-d cloned from ${config.github.repo} (${config.github.branch})`,
          updated: true,
          branch: config.github.branch,
          cloneOutput: cloneOutput.trim(),
        });
      } catch (cloneError) {
        return NextResponse.json(
          {
            success: false,
            message: `Could not clone f-rr-d from ${repoUrl}. Configure THOUGHTS_ROOT env or clone manually to ${thoughtsRoot}`,
            error: String(cloneError),
          },
          { status: 404 },
        );
      }
    }

    const currentBranch = execSync(`git -C "${thoughtsRoot}" rev-parse --abbrev-ref HEAD`, {
      encoding: "utf8",
    }).trim();

    const beforeHash = execSync(`git -C "${thoughtsRoot}" rev-parse HEAD`, {
      encoding: "utf8",
    }).trim();

    if (currentBranch !== "main") {
      execSync(`git -C "${thoughtsRoot}" checkout main`, {
        encoding: "utf8",
        stdio: "pipe",
      });
    }

    const pullOutput = execSync(`git -C "${thoughtsRoot}" pull --ff-only origin main`, {
      encoding: "utf8",
      stdio: "pipe",
    });

    const afterHash = execSync(`git -C "${thoughtsRoot}" rev-parse HEAD`, {
      encoding: "utf8",
    }).trim();

    const updated = beforeHash !== afterHash;

    return NextResponse.json({
      success: true,
      message: updated ? "f-rr-d updated to latest main" : "f-rr-d is already up to date",
      updated,
      branch: "main",
      beforeHash,
      afterHash,
      pullOutput: pullOutput.trim(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: `Failed to update f-rr-d: ${String(error)}`,
      },
      { status: 500 },
    );
  }
}
