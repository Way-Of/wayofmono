import { getScopedItem, removeScopedItem, setScopedItem } from "../utils/projectStorage";

// Storage keys — each modal type has independent storage
export const STORED_PLANNING_KEY = "kb-planning-last-description";
export const STORED_SUBTASK_KEY = "kb-subtask-last-description";
export const STORED_MISSION_KEY = "kb-mission-last-goal";

// Planning persistence

export function savePlanningDescription(description: string, projectId?: string): void {
  setScopedItem(STORED_PLANNING_KEY, description, projectId);
}

export function getPlanningDescription(projectId?: string): string {
  return getScopedItem(STORED_PLANNING_KEY, projectId) || "";
}

export function clearPlanningDescription(projectId?: string): void {
  removeScopedItem(STORED_PLANNING_KEY, projectId);
}

// Subtask persistence

export function saveSubtaskDescription(description: string, projectId?: string): void {
  setScopedItem(STORED_SUBTASK_KEY, description, projectId);
}

export function getSubtaskDescription(projectId?: string): string {
  return getScopedItem(STORED_SUBTASK_KEY, projectId) || "";
}

export function clearSubtaskDescription(projectId?: string): void {
  removeScopedItem(STORED_SUBTASK_KEY, projectId);
}

// Mission persistence

export function saveMissionGoal(goal: string, projectId?: string): void {
  setScopedItem(STORED_MISSION_KEY, goal, projectId);
}

export function getMissionGoal(projectId?: string): string {
  return getScopedItem(STORED_MISSION_KEY, projectId) || "";
}

export function clearMissionGoal(projectId?: string): void {
  removeScopedItem(STORED_MISSION_KEY, projectId);
}
