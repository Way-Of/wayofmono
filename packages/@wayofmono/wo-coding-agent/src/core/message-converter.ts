export class MessageConverter {
  static toProviderFormat(messages: unknown[], provider: string): unknown[] {
    return messages.map((msg) => {
      if (typeof msg === "string") return { role: "user", content: msg };
      return msg;
    });
  }

  static fromProviderFormat(messages: unknown[]): unknown[] {
    return messages;
  }
}
