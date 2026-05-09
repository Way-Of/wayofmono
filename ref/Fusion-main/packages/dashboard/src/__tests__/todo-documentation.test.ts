// @vitest-environment node

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = path.resolve(__dirname, "../../../../");

function readDoc(relativePath: string): string {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

function normalizeRoutePath(routePath: string): string {
  return routePath === "/" ? "" : routePath;
}

describe("todo documentation contract", () => {
  it("includes canonical Todo View guide and required cross-references", () => {
    const todoGuide = readDoc("docs/todo-view.md");
    const docsIndex = readDoc("docs/README.md");
    const dashboardGuide = readDoc("docs/dashboard-guide.md");
    const taskManagement = readDoc("docs/task-management.md");
    const settingsReference = readDoc("docs/settings-reference.md");

    expect(todoGuide).toContain("# Todo View");
    expect(todoGuide).toContain("## Overview");
    expect(todoGuide).toContain("## Enablement (`experimentalFeatures.todoView`)");
    expect(todoGuide).toContain("## List management");
    expect(todoGuide).toContain("## Item management");
    expect(todoGuide).toContain("## Planning integration");
    expect(todoGuide).toContain("## Task creation and agent delegation actions");
    expect(todoGuide).toContain("## API reference (current implementation)");
    expect(todoGuide).toContain("## Storage linkage");

    expect(docsIndex).toContain("[Todo View](./todo-view.md)");
    expect(dashboardGuide).toContain("canonical [Todo View guide](./todo-view.md)");
    expect(taskManagement).toContain("see [Todo View](./todo-view.md)");
    expect(settingsReference).toContain("todoView` (enables dashboard Todo View; see [Todo View](./todo-view.md))");
  });

  it("documents the same todo API endpoints implemented by todo-routes", () => {
    const todoGuide = readDoc("docs/todo-view.md");
    const routeSource = readDoc("packages/dashboard/src/todo-routes.ts");

    const implementedRoutes = new Set<string>();
    const routeRegex = /router\.(get|post|patch|delete)\(\s*"([^"]+)"/g;

    for (const match of routeSource.matchAll(routeRegex)) {
      const method = match[1].toUpperCase();
      const pathLiteral = normalizeRoutePath(match[2]);
      implementedRoutes.add(`${method} /api/todos${pathLiteral}`);
    }

    const documentedRoutes = new Set<string>();
    const documentedRegex = /- `([A-Z]+)\s+([^`]+)`/g;
    for (const match of todoGuide.matchAll(documentedRegex)) {
      const method = match[1];
      const routePath = match[2].trim();
      if (routePath.startsWith("/api/todos")) {
        documentedRoutes.add(`${method} ${routePath}`);
      }
    }

    expect(documentedRoutes).toEqual(implementedRoutes);
    expect(todoGuide).toContain("PATCH /api/todos/items/:id");
    expect(todoGuide).not.toContain("/api/todos/items/:id/toggle");
  });
});
