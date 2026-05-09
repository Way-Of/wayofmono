import type { Task, TaskDetail, WorkflowStep } from "@fusion/core";
import type { PluginDashboardViewContext } from "@fusion/dashboard/app/plugins/types";
import { createElement } from "react";
import { DependencyGraph } from "./DependencyGraph";

function createWorkflowStepNameLookup(workflowSteps: WorkflowStep[] | undefined): ReadonlyMap<string, string> {
  return new Map((workflowSteps ?? []).map((step) => [step.id, step.name] as const));
}

export function DependencyGraphDashboardView({ context }: { context?: PluginDashboardViewContext }) {
  return createElement(DependencyGraph, {
    tasks: context?.tasks ?? [],
    projectId: context?.projectId,
    workflowStepNameLookup: createWorkflowStepNameLookup(context?.workflowSteps),
    onOpenDetail: context?.openTaskDetail as ((task: Task | TaskDetail) => void) | undefined,
  });
}

export { DependencyGraph };
