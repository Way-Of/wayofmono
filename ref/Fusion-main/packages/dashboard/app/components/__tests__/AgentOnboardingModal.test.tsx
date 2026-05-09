import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AgentOnboardingModal } from "../AgentOnboardingModal";

let streamHandlers: any;
let respondCount = 0;

vi.mock("../../api", () => ({
  startAgentOnboardingStreaming: vi.fn().mockResolvedValue({ sessionId: "onb-1" }),
  fetchModels: vi.fn().mockResolvedValue({ models: [], favoriteProviders: [], favoriteModels: [] }),
  connectAgentOnboardingStream: vi.fn().mockImplementation((_sessionId, _projectId, handlers) => {
    streamHandlers = handlers;
    setTimeout(() => handlers.onQuestion?.({ id: "q1", type: "text", question: "What should this agent primarily help with?" }), 0);
    return { close: vi.fn(), isConnected: vi.fn(() => true) };
  }),
  respondToAgentOnboarding: vi.fn().mockImplementation(() => {
    respondCount += 1;
    if (respondCount === 1) {
      setTimeout(() => streamHandlers?.onQuestion?.({ id: "q2", type: "text", question: "Second question" }), 0);
    } else {
      setTimeout(() => streamHandlers?.onSummary?.({
        name: "Docs Reviewer",
        role: "reviewer",
        instructionsText: "Review docs",
        thinkingLevel: "medium",
        maxTurns: 20,
      }), 0);
    }
    return Promise.resolve({ type: "question", data: {} });
  }),
  retryAgentOnboardingSession: vi.fn().mockResolvedValue({ success: true }),
  stopAgentOnboardingGeneration: vi.fn().mockResolvedValue({ success: true }),
  cancelAgentOnboarding: vi.fn().mockResolvedValue(undefined),
  createAgent: vi.fn().mockResolvedValue({ id: "agent-1" }),
}));

describe("AgentOnboardingModal", () => {
  it("walks onboarding flow through summary and create", async () => {
    const onCreated = vi.fn();
    render(
      <AgentOnboardingModal
        isOpen={true}
        onClose={vi.fn()}
        onCreated={onCreated}
        addToast={vi.fn()}
        existingAgents={[]}
      />,
    );

    fireEvent.change(screen.getByLabelText("What do you want this agent to do?"), { target: { value: "Review docs" } });
    fireEvent.click(screen.getByText("Start onboarding"));

    await screen.findByText("What should this agent primarily help with?");
    fireEvent.change(screen.getByLabelText("What should this agent primarily help with?"), { target: { value: "Docs" } });
    fireEvent.click(screen.getByText("Continue"));

    await screen.findByText("Second question");
    fireEvent.change(screen.getByLabelText("Second question"), { target: { value: "More docs" } });
    fireEvent.click(screen.getByText("Continue"));

    await screen.findByText("Review generated configuration");
    fireEvent.click(screen.getByText("Create agent"));

    await waitFor(() => {
      expect(onCreated).toHaveBeenCalled();
    });
  });
});
