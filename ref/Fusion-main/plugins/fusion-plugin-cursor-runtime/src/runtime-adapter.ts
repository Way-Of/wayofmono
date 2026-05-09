export class CursorRuntimeAdapter {
  readonly id = "cursor";
  readonly name = "Cursor Runtime";

  async createSession(options: { defaultModelId?: string; systemPrompt?: string }) {
    return {
      session: {
        model: options.defaultModelId ?? "cursor/default",
        systemPrompt: options.systemPrompt,
        messages: [],
      },
      sessionFile: undefined,
    };
  }

  async promptWithFallback(): Promise<void> {
    // TODO(FN-3396): Implement Cursor agent prompt streaming once a stable
    // invocation contract beyond probe/discovery commands is confirmed.
    return;
  }

  describeModel(session: { model?: string }) {
    return `cursor/${session.model ?? "default"}`;
  }
}
