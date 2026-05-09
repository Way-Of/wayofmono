import { useEffect, useMemo, useState } from "react";
import { ExternalLink, RefreshCw, Settings } from "lucide-react";
import { fetchSettings } from "../api";
import { useEvals } from "../hooks/useEvals";
import type { SectionId } from "./SettingsModal";
import "./EvalsView.css";

interface EvalsViewProps {
  projectId?: string;
  onOpenSettings?: (section?: SectionId) => void;
  onOpenTaskDetail?: (taskId: string) => void;
}

export function EvalsView({ projectId, onOpenSettings, onOpenTaskDetail }: EvalsViewProps) {
  const { loading, error, results, runs, filters, setFilters, selectedEvalId, setSelectedEvalId, selectedEval, refresh } = useEvals({ projectId });
  const [scheduledEnabled, setScheduledEnabled] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchSettings(projectId)
      .then((settings) => {
        if (cancelled) return;
        const enabled = (settings as { evalSettings?: { enabled?: boolean } }).evalSettings?.enabled;
        setScheduledEnabled(enabled ?? false);
      })
      .catch(() => {
        if (!cancelled) setScheduledEnabled(false);
      });
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  const hasResults = results.length > 0;
  const selectedSummary = useMemo(() => results.find((result) => result.id === selectedEvalId) ?? null, [results, selectedEvalId]);

  if (!scheduledEnabled) {
    return (
      <section className="evals-view card" data-testid="evals-disabled">
        <h2 className="evals-title">Scheduled evals are disabled</h2>
        <p className="evals-empty-copy">Enable Scheduled Evals to review scored tasks, evidence, and follow-up recommendations.</p>
        <button className="btn btn-primary" type="button" onClick={() => onOpenSettings?.("scheduled-evals")}> 
          <Settings size={16} />
          Open Scheduled Evals Settings
        </button>
      </section>
    );
  }

  return (
    <section className="evals-view" data-testid="evals-view">
      <div className="evals-list card">
        <div className="evals-toolbar">
          <input
            className="input"
            placeholder="Search task or rationale"
            value={filters.q}
            onChange={(event) => setFilters((prev) => ({ ...prev, q: event.target.value }))}
          />
          <select
            className="select"
            value={filters.runId}
            onChange={(event) => setFilters((prev) => ({ ...prev, runId: event.target.value }))}
          >
            <option value="">All runs</option>
            {runs.map((run) => (
              <option key={run.id} value={run.id}>{run.id}</option>
            ))}
          </select>
          <input className="input" placeholder="Min score" value={filters.scoreMin} onChange={(event) => setFilters((prev) => ({ ...prev, scoreMin: event.target.value }))} />
          <input className="input" placeholder="Max score" value={filters.scoreMax} onChange={(event) => setFilters((prev) => ({ ...prev, scoreMax: event.target.value }))} />
          <button className="btn btn-icon" type="button" onClick={() => void refresh()} aria-label="Refresh evals"><RefreshCw size={16} /></button>
        </div>

        {loading && <p className="evals-state" data-testid="evals-loading">Loading evals…</p>}
        {error && <p className="evals-state evals-state--error">{error}</p>}
        {!loading && !error && !hasResults && (
          <p className="evals-state">No evals yet. Scheduled evals review tasks completed since the last run.</p>
        )}

        <ul className="evals-results" data-testid="evals-results">
          {results.map((result) => (
            <li key={result.id}>
              <button className={`evals-result ${result.id === selectedEvalId ? "evals-result--active" : ""}`} type="button" onClick={() => setSelectedEvalId(result.id)}>
                <span className="evals-result-title">{result.taskTitle}</span>
                <span className="evals-result-meta">{result.taskId} · {result.runId} · {result.overallScore ?? "n/a"}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="evals-detail card" data-testid="evals-detail">
        {!selectedEval && <p className="evals-state">Select an evaluation to inspect scores, rationale, and evidence.</p>}
        {selectedEval && (
          <>
            <h3 className="evals-detail-title">{selectedSummary?.taskTitle ?? selectedEval.taskTitle}</h3>
            <p className="evals-result-meta">{selectedEval.taskId} · {selectedEval.runId}</p>
            <p className="evals-score">Overall score: {selectedEval.overallScore ?? "n/a"}</p>
            <ul className="evals-categories">
              {selectedEval.categoryScores.map((score) => (
                <li key={score.category}>{score.category}: {score.finalScore}</li>
              ))}
            </ul>
            <p className="evals-rationale">{selectedEval.rationale || "No rationale recorded."}</p>

            <div>
              <h4>Evidence</h4>
              <ul className="evals-links">
                {selectedEval.evidence.map((item, index) => {
                  const taskId = typeof item.metadata?.taskId === "string" ? item.metadata.taskId : undefined;
                  const url = typeof item.metadata?.url === "string" ? item.metadata.url : undefined;
                  return (
                    <li key={`${item.ref}-${index}`}>
                      {taskId ? (
                        <button type="button" className="btn" onClick={() => onOpenTaskDetail?.(taskId)}>{item.ref}</button>
                      ) : url ? (
                        <a href={url} target="_blank" rel="noreferrer" className="evals-external-link">{item.ref}<ExternalLink size={14} /></a>
                      ) : (
                        <span>{item.ref}</span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>

            <div>
              <h4>Suggested follow-up tasks</h4>
              <ul className="evals-follow-ups">
                {selectedEval.followUps.length === 0 && <li>None</li>}
                {selectedEval.followUps.map((followUp) => (
                  <li key={followUp.suggestionId}><strong>{followUp.title}</strong><p>{followUp.rationale}</p></li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
