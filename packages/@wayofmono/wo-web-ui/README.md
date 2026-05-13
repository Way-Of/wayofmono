# @wayofmono/wo-web-ui

Web UI Components for the Wo ecosystem. React-based chat interface with message bubbles, session management, tool call visualization, and dark/light theme support.

```
npm install @wayofmono/wo-web-ui
```

Requires `react` and `react-dom` (v18 or v19).

## Usage

```tsx
import { ChatContainer, MessageBubble, ChatInput, SessionList, ToolCallCard } from "@wayofmono/wo-web-ui";
import type { ChatMessage, SessionInfo, ToolCall, ThemeConfig } from "@wayofmono/wo-web-ui";

// Full chat interface
function App() {
  return <ChatContainer />;
}

// Custom composition
function CustomChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const theme: ThemeConfig = { mode: "dark" };

  return (
    <div>
      <div className="messages">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} theme={theme} />
        ))}
      </div>
      <ChatInput
        onSend={(text) => setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: "user",
          content: text,
          timestamp: Date.now(),
        }])}
        onCommand={(cmd, args) => console.log(`/${cmd} ${args}`)}
        theme={theme}
      />
    </div>
  );
}
```

## Components

### ChatContainer
Full chat interface with message list, streaming support, session sidebar, and input.

```tsx
<ChatContainer />
```

### MessageBubble
Single message bubble with role-based styling and streaming indicator.

```tsx
<MessageBubble message={message} theme={theme} />
```

Props: `message: ChatMessage`, `theme: ThemeConfig`

### ChatInput
Multi-line textarea input with Enter-to-send, Shift+Enter for newline, and slash-command support.

```tsx
<ChatInput onSend={handleSend} onCommand={handleCommand} disabled={false} theme={theme} />
```

Props: `onSend`, `onCommand?`, `disabled?`, `theme`

### SessionList
Sidebar listing sessions with timestamps and create-new button.

```tsx
<SessionList sessions={sessions} activeSessionId={id} onSelect={handleSelect} onNew={handleNew} theme={theme} />
```

Props: `sessions`, `activeSessionId?`, `onSelect`, `onNew`, `theme`

### ToolCallCard
Collapsible card showing tool call status, arguments, and results.

```tsx
<ToolCallCard toolCall={toolCall} theme={theme} />
```

Props: `toolCall: ToolCall`, `theme`

## Types

| Type | Description |
|------|-------------|
| `ChatMessage` | `{ id, role, content, timestamp, toolCalls?, toolResult?, streaming? }` |
| `ToolCall` | `{ id, name, args, status, result? }` |
| `ToolResult` | `{ toolCallId, content, isError? }` |
| `SessionInfo` | `{ id, name, createdAt, updatedAt, branch? }` |
| `DiagnosticInfo` | `{ file, severity, message, line?, column? }` |
| `ThemeConfig` | `{ mode: "light" \| "dark", primaryColor?, fontSize? }` |
| `WebSocketMessage` | `{ type, payload }` |
| `MessageBubbleProps` | Props interface for MessageBubble |
| `ChatInputProps` | Props interface for ChatInput |
| `SessionListProps` | Props interface for SessionList |
| `ToolCallCardProps` | Props interface for ToolCallCard |
