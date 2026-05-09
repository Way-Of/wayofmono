import type { Task, Column } from "@fusion/core";

function getTaskPriorityRank(priority: Task["priority"] | null | undefined): number {
  if (priority === "urgent") return 3;
  if (priority === "high") return 2;
  if (priority === "low") return 0;
  return 1;
}

function compareTaskPriority(a: Task["priority"] | null | undefined, b: Task["priority"] | null | undefined): number {
  return getTaskPriorityRank(b) - getTaskPriorityRank(a);
}

function compareTaskIdNumeric(a: string, b: string): number {
  const aNum = Number.parseInt(a.slice(a.lastIndexOf("-") + 1), 10);
  const bNum = Number.parseInt(b.slice(b.lastIndexOf("-") + 1), 10);

  if (Number.isFinite(aNum) && Number.isFinite(bNum) && aNum !== bNum) {
    return aNum - bNum;
  }

  return a.localeCompare(b);
}

function getDoneSortTimestamp(task: Task): number {
  const timestamp = task.columnMovedAt ?? task.updatedAt ?? task.createdAt;
  const parsed = Date.parse(timestamp);
  return Number.isFinite(parsed) ? parsed : 0;
}

function isMergeActiveStatus(status: string | null | undefined): boolean {
  return status === "merging" || status === "merging-pr" || status === "merging-fix";
}

export function sortTasksForDisplayColumn(tasks: readonly Task[], column: Column): Task[] {
  if (column === "todo") {
    return [...tasks].sort((a, b) => {
      const priorityCmp = compareTaskPriority(a.priority, b.priority);
      if (priorityCmp !== 0) return priorityCmp;
      if (a.createdAt !== b.createdAt) return a.createdAt.localeCompare(b.createdAt);
      return compareTaskIdNumeric(a.id, b.id);
    });
  }

  return [...tasks].sort((a, b) => {
    if (column === "done") {
      const timestampCmp = getDoneSortTimestamp(b) - getDoneSortTimestamp(a);
      if (timestampCmp !== 0) return timestampCmp;
      return compareTaskIdNumeric(a.id, b.id);
    }

    if (column === "in-review") {
      const aIsMerging = isMergeActiveStatus(a.status);
      const bIsMerging = isMergeActiveStatus(b.status);
      if (aIsMerging !== bIsMerging) return aIsMerging ? -1 : 1;
    }

    const priorityCmp = compareTaskPriority(a.priority, b.priority);
    if (priorityCmp !== 0) return priorityCmp;
    return compareTaskIdNumeric(a.id, b.id);
  });
}
