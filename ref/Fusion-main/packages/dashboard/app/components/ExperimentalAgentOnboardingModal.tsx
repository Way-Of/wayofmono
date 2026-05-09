import { useCallback, useEffect, useMemo, useState } from "react";
import type { Agent, AgentOnboardingSummary, ConversationHistoryEntry, ExistingAgentOnboardingConfig, OnboardingMode } from "../api";
import {
  cancelAgentOnboarding,
  connectAgentOnboardingStream,
  respondToAgentOnboarding,
  startAgentOnboardingStreaming,
} from "../api";
import { AGENT_PRESETS } from "./agent-presets";
import { ConversationHistory } from "./ConversationHistory";
import "./ExperimentalAgentOnboardingModal.css";

type ViewState = "initial" | "loading" | "question" | "summary" | "error";

interface ExperimentalAgentOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUseDraft: (summary: AgentOnboardingSummary) => void;
  projectId?: string;
  existingAgents: Agent[];
  mode?: OnboardingMode;
  existingAgentConfig?: ExistingAgentOnboardingConfig;
}

export function ExperimentalAgentOnboardingModal({
  isOpen,
  onClose,
  onUseDraft,
  projectId,
  existingAgents,
  mode = "create",
  existingAgentConfig,
}: ExperimentalAgentOnboardingModalProps) {
  const [viewState, setViewState] = useState<ViewState>("initial");
  const [intent, setIntent] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [currentQuestionId, setCurrentQuestionId] = useState("answer");
  const [answer, setAnswer] = useState("");
  const [summary, setSummary] = useState<AgentOnboardingSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<ConversationHistoryEntry[]>([]);
  const isEditMode = mode === "edit";

  const resetState = useCallback(() => {
    setViewState("initial");
    setIntent("");
    setSessionId(null);
    setCurrentQuestion("");
    setCurrentQuestionId("answer");
    setAnswer("");
    setSummary(null);
    setError(null);
    setHistory([]);
  }, []);

  const templateOptions = useMemo(
    () => AGENT_PRESETS.map((preset) => ({ id: preset.id, label: preset.name, description: preset.description })),
    [],
  );

  useEffect(() => {
    if (!sessionId) return;
    const stream = connectAgentOnboardingStream(sessionId, projectId, {
      onThinking: (data) => {
        setHistory((current) => {
          const next = [...current];
          const last = next[next.length - 1];
          if (last && !last.question) {
            next[next.length - 1] = { ...last, thinkingOutput: `${last.thinkingOutput ?? ""}${data}` };
            return next;
          }
          return [...next, { response: {}, thinkingOutput: data }];
        });
      },
      onQuestion: (q) => {
        setCurrentQuestion(q.question);
        setCurrentQuestionId(q.id);
        setViewState("question");
      },
      onSummary: (nextSummary) => {
        setSummary(nextSummary);
        setViewState("summary");
      },
      onError: (message) => {
        setError(message);
        setViewState("error");
      },
    });
    return () => stream.close();
  }, [sessionId, projectId]);

  const handleClose = async () => {
    try {
      if (sessionId) {
        await cancelAgentOnboarding(sessionId, projectId);
      }
    } catch {
      // Best-effort server-side cleanup; always allow modal dismissal.
    } finally {
      resetState();
      onClose();
    }
  };

  useEffect(() => {
    if (!isOpen) {
      resetState();
    }
  }, [isOpen, resetState]);

  if (!isOpen) return null;

  const renderSummaryValue = (value: string | number | null | undefined) => {
    if (value === undefined || value === null || value === "") {
      return <em className="experimental-agent-onboarding-modal__summary-empty">Not set</em>;
    }
    return <span>{value}</span>;
  };

  const start = async () => {
    setViewState("loading");
    setError(null);
    try {
      const result = await startAgentOnboardingStreaming(
        intent,
        {
          mode,
          existingAgentConfig,
          existingAgents: existingAgents.map((agent) => ({ id: agent.id, name: agent.name, role: agent.role })),
          templates: templateOptions,
        },
        projectId,
      );
      setSessionId(result.sessionId);
    } catch (err) {
      setError((err as Error).message);
      setViewState("error");
    }
  };

  const submitAnswer = async () => {
    if (!sessionId) return;
    setViewState("loading");
    setError(null);
    try {
      const responsePayload = { [currentQuestionId]: answer };
      setHistory((current) => [
        ...current,
        {
          question: { id: currentQuestionId, type: "text", question: currentQuestion },
          response: responsePayload,
        },
      ]);
      await respondToAgentOnboarding(sessionId, responsePayload, projectId);
      setAnswer("");
    } catch (err) {
      setError((err as Error).message);
      setViewState("error");
    }
  };

  const handleConfirmDraft = async () => {
    if (!summary) return;
    onUseDraft(summary);
    await handleClose();
  };

  return (
    <div className="modal-overlay open" role="presentation">
      <div className="modal modal-lg experimental-agent-onboarding-modal" role="dialog" aria-modal="true" aria-label="AI Interview">
        <div className="modal-header">
          <h3>AI Interview</h3>
          <button className="modal-close" onClick={() => void handleClose()} aria-label="Close">×</button>
        </div>

        {history.length > 0 && <ConversationHistory entries={history} />}

        {viewState === "initial" && (
          <div className="form-group">
            <label htmlFor="agent-onboarding-intent">{isEditMode ? "What should this agent change or improve?" : "What should this new agent own?"}</label>
            <textarea id="agent-onboarding-intent" className="input experimental-agent-onboarding-modal__textarea" value={intent} onChange={(e) => setIntent(e.target.value)} />
            <div className="modal-actions">
              <button className="btn" onClick={() => void handleClose()}>Cancel</button>
              <button className="btn btn-primary" disabled={!intent.trim()} onClick={() => void start()}>{isEditMode ? "Start interview" : "Start onboarding"}</button>
            </div>
          </div>
        )}

        {(viewState === "loading" || viewState === "question") && (
          <div className="form-group">
            <label htmlFor="agent-onboarding-answer">{currentQuestion || "Thinking..."}</label>
            <textarea id="agent-onboarding-answer" className="input experimental-agent-onboarding-modal__textarea" value={answer} onChange={(e) => setAnswer(e.target.value)} />
            <div className="modal-actions">
              <button className="btn" onClick={() => void handleClose()}>Cancel</button>
              <button className="btn btn-primary" disabled={viewState === "loading" || !answer.trim()} onClick={() => void submitAnswer()}>Continue</button>
            </div>
          </div>
        )}

        {viewState === "summary" && summary && (
          <div className="form-group">
            <label>{isEditMode ? "Updated draft ready for review" : "Draft ready for review"}</label>
            <p className="experimental-agent-onboarding-modal__summary-intro">
              Review this generated draft. Nothing is applied until you confirm.
            </p>
            <div className="experimental-agent-onboarding-modal__summary card">
              <div className="experimental-agent-onboarding-modal__summary-section">
                <h4>Identity</h4>
                <dl className="experimental-agent-onboarding-modal__summary-list">
                  <div><dt>Name</dt><dd>{renderSummaryValue(summary.name)}</dd></div>
                  <div><dt>Role</dt><dd>{renderSummaryValue(summary.role)}</dd></div>
                  <div><dt>Title</dt><dd>{renderSummaryValue(summary.title)}</dd></div>
                  <div><dt>Icon</dt><dd>{renderSummaryValue(summary.icon)}</dd></div>
                  <div><dt>Reports To</dt><dd>{renderSummaryValue(summary.reportsTo)}</dd></div>
                </dl>
              </div>

              <div className="experimental-agent-onboarding-modal__summary-section">
                <h4>Configuration</h4>
                <dl className="experimental-agent-onboarding-modal__summary-list">
                  <div><dt>Inline Instructions</dt><dd className="experimental-agent-onboarding-modal__summary-block">{renderSummaryValue(summary.instructionsText)}</dd></div>
                  <div><dt>Soul</dt><dd className="experimental-agent-onboarding-modal__summary-block">{renderSummaryValue(summary.soul)}</dd></div>
                  <div><dt>Agent Memory</dt><dd className="experimental-agent-onboarding-modal__summary-block">{renderSummaryValue(summary.memory)}</dd></div>
                  <div><dt>Skills</dt><dd>{renderSummaryValue(summary.skills?.join(", "))}</dd></div>
                  <div><dt>Thinking Level</dt><dd>{renderSummaryValue(summary.thinkingLevel)}</dd></div>
                  <div><dt>Max Turns</dt><dd>{renderSummaryValue(summary.maxTurns)}</dd></div>
                  <div><dt>Template</dt><dd>{renderSummaryValue(summary.templateId)}</dd></div>
                  <div><dt>Pattern Agent</dt><dd>{renderSummaryValue(summary.patternAgentId)}</dd></div>
                </dl>
              </div>

              {(summary.heartbeatProcedurePath || summary.heartbeatIntervalMs || summary.heartbeatEnabled !== undefined || summary.modelHint || summary.runtimeHint) && (
                <div className="experimental-agent-onboarding-modal__summary-section">
                  <h4>Runtime Hints</h4>
                  <dl className="experimental-agent-onboarding-modal__summary-list">
                    <div><dt>Heartbeat Procedure Path</dt><dd>{renderSummaryValue(summary.heartbeatProcedurePath)}</dd></div>
                    <div><dt>Heartbeat Interval</dt><dd>{renderSummaryValue(summary.heartbeatIntervalMs ? `${summary.heartbeatIntervalMs}ms` : undefined)}</dd></div>
                    <div><dt>Heartbeat Enabled</dt><dd>{renderSummaryValue(summary.heartbeatEnabled === undefined ? undefined : summary.heartbeatEnabled ? "yes" : "no")}</dd></div>
                    <div><dt>Model Hint</dt><dd>{renderSummaryValue(summary.modelHint)}</dd></div>
                    <div><dt>Runtime Hint</dt><dd>{renderSummaryValue(summary.runtimeHint)}</dd></div>
                  </dl>
                </div>
              )}

              {summary.rationale && (
                <div className="experimental-agent-onboarding-modal__summary-section">
                  <h4>Rationale</h4>
                  <p className="experimental-agent-onboarding-modal__summary-block">{summary.rationale}</p>
                </div>
              )}
            </div>
            <div className="modal-actions">
              <button className="btn" onClick={() => void handleClose()}>Cancel</button>
              <button className="btn btn-primary" onClick={() => void handleConfirmDraft()}>{isEditMode ? "Apply draft to settings form" : "Apply draft to agent form"}</button>
            </div>
          </div>
        )}

        {viewState === "error" && error && (
          <div className="form-group">
            <div className="form-error">{error}</div>
            <div className="modal-actions">
              <button className="btn" onClick={() => void handleClose()}>Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
