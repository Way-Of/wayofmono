import React, { useState, useRef, useEffect } from "react";
import type { ChatMessage, SessionInfo, ThemeConfig, ToolCall } from "../types.js";
import { MessageBubble } from "./MessageBubble.js";
import { ChatInput } from "./ChatInput.js";
import { SessionList } from "./SessionList.js";
import { ToolCallCard } from "./ToolCallCard.js";

const styles = {
  container: (theme: ThemeConfig) => ({
    display: "flex",
    height: "100vh",
    background: theme.mode === "dark" ? "#0a0a0a" : "#ffffff",
    color: theme.mode === "dark" ? "#e0e0e0" : "#1a1a1a",
    fontFamily: "system-ui, -apple-system, sans-serif",
  }),
  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column" as const,
    height: "100%",
  },
  messages: {
    flex: 1,
    overflowY: "auto" as const,
    padding: "16px",
  },
  empty: (theme: ThemeConfig) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    color: theme.mode === "dark" ? "#555" : "#aaa",
    fontSize: "14px",
  }),
};

const defaultTheme: ThemeConfig = { mode: "dark" };

export function ChatContainer() {
  const [theme] = useState<ThemeConfig>(defaultTheme);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessions] = useState<SessionInfo[]>([]);
  const [activeSession, setActiveSession] = useState<string>();
  const [streamingContent, setStreamingContent] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  const handleSend = (text: string) => {
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
  };

  const handleCommand = (command: string, args: string) => {
    const cmdMsg: ChatMessage = {
      id: `cmd-${Date.now()}`,
      role: "system",
      content: `/${command} ${args}`,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, cmdMsg]);
  };

  const handleSessionSelect = (sessionId: string) => {
    setActiveSession(sessionId);
  };

  const handleNewSession = () => {
    setMessages([]);
    setActiveSession(undefined);
  };

  return (
    <div style={styles.container(theme)}>
      <SessionList
        sessions={sessions}
        activeSessionId={activeSession}
        onSelect={handleSessionSelect}
        onNew={handleNewSession}
        theme={theme}
      />
      <div style={styles.main}>
        <div style={styles.messages}>
          {messages.length === 0 && !streamingContent && (
            <div style={styles.empty(theme)}>
              Start a conversation with Wo
            </div>
          )}
          {messages.map((msg) => (
            <React.Fragment key={msg.id}>
              <MessageBubble message={msg} theme={theme} />
              {msg.toolCalls?.map((tc) => (
                <ToolCallCard key={tc.id} toolCall={tc} theme={theme} />
              ))}
            </React.Fragment>
          ))}
          {streamingContent && (
            <MessageBubble
              message={{
                id: "streaming",
                role: "assistant",
                content: streamingContent,
                timestamp: Date.now(),
                streaming: true,
              }}
              theme={theme}
            />
          )}
          <div ref={messagesEndRef} />
        </div>
        <ChatInput
          onSend={handleSend}
          onCommand={handleCommand}
          theme={theme}
        />
      </div>
    </div>
  );
}
