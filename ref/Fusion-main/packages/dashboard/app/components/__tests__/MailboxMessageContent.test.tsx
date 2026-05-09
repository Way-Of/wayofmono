import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup, screen } from "@testing-library/react";
import { MailboxMessageContent } from "../MailboxMessageContent";

afterEach(() => {
  cleanup();
});

describe("MailboxMessageContent", () => {
  it("renders plain-text messages unchanged", () => {
    render(<MailboxMessageContent content="Hello, this is plain text." />);
    expect(screen.getByText("Hello, this is plain text.")).toBeInTheDocument();
  });

  it("renders headings as semantic heading elements", () => {
    render(<MailboxMessageContent content={"# Status Update\n\nDetails below."} />);
    const heading = screen.getByRole("heading", { level: 1, name: "Status Update" });
    expect(heading).toBeInTheDocument();
  });

  it("renders bold and italic emphasis", () => {
    const { container } = render(
      <MailboxMessageContent content="This is **bold** and *italic*." />,
    );
    expect(container.querySelector("strong")?.textContent).toBe("bold");
    expect(container.querySelector("em")?.textContent).toBe("italic");
  });

  it("renders unordered lists", () => {
    render(<MailboxMessageContent content={"- one\n- two\n- three"} />);
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(3);
    expect(items[0]?.textContent).toBe("one");
  });

  it("renders inline code with code element", () => {
    const { container } = render(
      <MailboxMessageContent content="Run `pnpm test` to verify." />,
    );
    const code = container.querySelector("code");
    expect(code?.textContent).toBe("pnpm test");
  });

  it("renders fenced code blocks inside the markdown <pre> wrapper", () => {
    const content = "```\nnpm install\n```";
    const { container } = render(<MailboxMessageContent content={content} />);
    const pre = container.querySelector("pre.mailbox-markdown-pre");
    expect(pre).not.toBeNull();
    expect(pre?.textContent).toContain("npm install");
  });

  it("renders links with target=_blank and noopener noreferrer", () => {
    render(
      <MailboxMessageContent content="See [docs](https://example.com/docs)." />,
    );
    const link = screen.getByRole("link", { name: "docs" });
    expect(link.getAttribute("href")).toBe("https://example.com/docs");
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.getAttribute("rel")).toContain("noopener");
    expect(link.getAttribute("rel")).toContain("noreferrer");
  });

  it("renders GFM tables with the mailbox-scoped class", () => {
    const content = ["| col a | col b |", "| --- | --- |", "| 1 | 2 |"].join("\n");
    const { container } = render(<MailboxMessageContent content={content} />);
    const table = container.querySelector("table.mailbox-markdown-table");
    expect(table).not.toBeNull();
    expect(table?.querySelectorAll("th")).toHaveLength(2);
    expect(table?.querySelectorAll("tbody td")).toHaveLength(2);
  });

  it("does NOT execute raw HTML in messages", () => {
    const content = "<script>window.__pwned = true;</script>Hello";
    const { container } = render(<MailboxMessageContent content={content} />);
    // ReactMarkdown defaults disallow raw HTML — the <script> tag should be
    // rendered as escaped text, not as a real script element.
    expect(container.querySelector("script")).toBeNull();
    expect(
      (globalThis as unknown as { __pwned?: boolean }).__pwned,
    ).toBeUndefined();
    expect(container.textContent).toContain("Hello");
  });

  it("forwards testId to the wrapper", () => {
    render(<MailboxMessageContent content="x" testId="mailbox-message-body" />);
    expect(screen.getByTestId("mailbox-message-body")).toBeInTheDocument();
  });
});
