import { useEffect, useMemo, useState } from "react";
import type { Task, TaskPriority } from "@fusion/core";
import { fetchTasks } from "../api";
import { useMobileScrollLock } from "../hooks/useMobileScrollLock";
import type { ResearchRunDetail } from "../research-types";
import "./ResearchTaskActionModal.css";

type Mode = "create" | "enrich";

interface ResearchTaskActionModalProps {
  open: boolean;
  mode: Mode;
  run: ResearchRunDetail;
  finding: { id: string; heading?: string; content?: string };
  projectId?: string;
  onClose: () => void;
  onConfirm: (payload: { taskId?: string; title?: string; description?: string; priority?: TaskPriority; attachExport: boolean }) => Promise<void>;
}

export function ResearchTaskActionModal({ open, mode, run, finding, projectId, onClose, onConfirm }: ResearchTaskActionModalProps) {
  useMobileScrollLock(open);
  const [attachExport, setAttachExport] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("normal");
  const [taskId, setTaskId] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [saving, setSaving] = useState(false);

  const preview = useMemo(() => {
    const firstSentence = (finding.content ?? "").split(/(?<=[.!?])\s+/)[0] ?? "";
    return `${finding.heading || "Research finding"} — ${firstSentence}`.trim();
  }, [finding.content, finding.heading]);

  useEffect(() => {
    if (!open) return;
    setAttachExport(false);
    setTitle(`Research: ${finding.heading || run.title}`);
    setDescription(preview);
    setPriority("normal");
    setTaskId("");

    if (mode === "enrich") {
      setLoadingTasks(true);
      void fetchTasks(50, 0, projectId)
        .then((rows) => setTasks(rows.filter((task) => task.column !== "archived")))
        .finally(() => setLoadingTasks(false));
    }
  }, [open, mode, projectId, finding.heading, preview, run.title]);

  if (!open) return null;

  return (
    <div className="modal-overlay open" role="presentation" onClick={onClose}>
      <div className="modal modal-lg research-task-action-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <h3>{mode === "create" ? "Create task from finding" : "Enrich existing task"}</h3>
          <button className="modal-close" type="button" aria-label="Close" onClick={onClose}>×</button>
        </div>

        <div className="research-task-action-modal__body">
          <div className="card research-task-action-modal__preview">
            <p><strong>Run:</strong> {run.id}</p>
            <p><strong>Finding:</strong> {finding.id}{finding.heading ? ` — ${finding.heading}` : ""}</p>
            <p>{preview || "No preview available."}</p>
          </div>

          {mode === "create" ? (
            <>
              <label className="research-task-action-modal__field">Title
                <input className="input" value={title} onChange={(event) => setTitle(event.target.value)} />
              </label>
              <label className="research-task-action-modal__field">Description
                <textarea className="input research-task-action-modal__textarea" value={description} onChange={(event) => setDescription(event.target.value)} />
              </label>
              <label className="research-task-action-modal__field">Priority
                <select className="select" value={priority} onChange={(event) => setPriority(event.target.value as TaskPriority)}>
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </label>
            </>
          ) : (
            <label className="research-task-action-modal__field">Target task
              <input
                className="input"
                list="research-task-action-task-list"
                value={taskId}
                placeholder={loadingTasks ? "Loading tasks…" : "Enter task ID"}
                onChange={(event) => setTaskId(event.target.value)}
              />
              <datalist id="research-task-action-task-list">
                {tasks.map((task) => (
                  <option key={task.id} value={task.id}>{task.title}</option>
                ))}
              </datalist>
            </label>
          )}

          <label className="checkbox-label">
            <input type="checkbox" checked={attachExport} onChange={(event) => setAttachExport(event.target.checked)} />
            <span>Attach markdown export artifact</span>
          </label>
        </div>

        <div className="modal-actions">
          <button className="btn" type="button" onClick={onClose}>Cancel</button>
          <button
            className="btn btn-primary"
            type="button"
            disabled={saving || (mode === "enrich" && !taskId)}
            onClick={() => {
              setSaving(true);
              void onConfirm({
                taskId: mode === "enrich" ? taskId : undefined,
                title: mode === "create" ? title.trim() : undefined,
                description: mode === "create" ? description.trim() : undefined,
                priority: mode === "create" ? priority : undefined,
                attachExport,
              }).finally(() => setSaving(false));
            }}
          >
            {mode === "create" ? "Create Task" : "Enrich Task"}
          </button>
        </div>
      </div>
    </div>
  );
}
