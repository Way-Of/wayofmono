import { getTaskCompletionBlocker, type Task, type TaskStore } from "@fusion/core";

export async function getTaskCompletionBlockerForStore(
  store: Pick<TaskStore, "getTask">,
  task: Task,
): Promise<string | undefined> {
  return getTaskCompletionBlocker(task, {
    resolveTask: async (dependencyId) => {
      try {
        return await store.getTask(dependencyId);
      } catch {
        return null;
      }
    },
  });
}
