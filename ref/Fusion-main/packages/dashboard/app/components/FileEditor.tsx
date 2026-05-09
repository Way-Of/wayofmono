import { useState, useCallback, useMemo, useRef, type UIEvent } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FileEdit, Eye, WrapText } from "lucide-react";

interface FileEditorProps {
  content: string;
  onChange: (content: string) => void;
  readOnly?: boolean;
  filePath?: string;
  showLineNumbers?: boolean;
}

function isMarkdownFile(filePath?: string): boolean {
  if (!filePath) return false;
  const lowerPath = filePath.toLowerCase();
  return lowerPath.endsWith(".md") || lowerPath.endsWith(".markdown") || lowerPath.endsWith(".mdx");
}

export function FileEditor({ content, onChange, readOnly, filePath, showLineNumbers = false }: FileEditorProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [wordWrap, setWordWrap] = useState(true);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const isMarkdown = isMarkdownFile(filePath);

  // For markdown files in readOnly mode, default to preview
  const effectiveShowPreview = isMarkdown && (readOnly ? true : showPreview);
  const shouldRenderLineNumbers = showLineNumbers && !readOnly && !effectiveShowPreview;
  const lineCount = useMemo(() => {
    if (!shouldRenderLineNumbers) {
      return 0;
    }

    return content.split("\n").length;
  }, [content, shouldRenderLineNumbers]);

  const handleEditClick = useCallback(() => {
    setShowPreview(false);
  }, []);

  const handlePreviewClick = useCallback(() => {
    setShowPreview(true);
  }, []);

  const handleWordWrapToggle = useCallback(() => {
    setWordWrap((prev) => !prev);
  }, []);

  const handleTextareaScroll = useCallback((event: UIEvent<HTMLTextAreaElement>) => {
    if (!lineNumbersRef.current) {
      return;
    }

    lineNumbersRef.current.scrollTop = event.currentTarget.scrollTop;
  }, []);

  return (
    <div className="file-editor-container">
      {isMarkdown ? (
        <div className="file-editor-toolbar">
          <div className="file-editor-mode-toggle">
            {!readOnly && (
              <button
                className={`btn btn-sm ${!effectiveShowPreview ? "btn-primary" : ""}`}
                onClick={handleEditClick}
                disabled={!effectiveShowPreview}
                aria-label="Edit mode"
              >
                <FileEdit size={14} />
                Edit
              </button>
            )}
            <button
              className={`btn btn-sm ${effectiveShowPreview ? "btn-primary" : ""}`}
              onClick={handlePreviewClick}
              disabled={effectiveShowPreview}
              aria-label="Preview mode"
            >
              <Eye size={14} />
              Preview
            </button>
          </div>
          {!readOnly && (
            <button
              className={`btn btn-sm ${wordWrap ? "btn-primary" : ""}`}
              onClick={handleWordWrapToggle}
              aria-label="Toggle word wrap"
              title="Toggle word wrap"
            >
              <WrapText size={14} />
            </button>
          )}
        </div>
      ) : (
        !readOnly && (
          <div className="file-editor-toolbar">
            <div className="file-editor-mode-toggle" />
            <button
              className={`btn btn-sm ${wordWrap ? "btn-primary" : ""}`}
              onClick={handleWordWrapToggle}
              aria-label="Toggle word wrap"
              title="Toggle word wrap"
            >
              <WrapText size={14} />
            </button>
          </div>
        )
      )}

      {effectiveShowPreview ? (
        <div className="file-editor-preview markdown-body">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {content}
          </ReactMarkdown>
        </div>
      ) : (
        <div className={`file-editor-textarea-shell ${shouldRenderLineNumbers ? "file-editor-textarea-shell--line-numbers" : ""}`}>
          {shouldRenderLineNumbers && (
            <div className="file-editor-line-numbers" ref={lineNumbersRef} aria-hidden="true">
              {Array.from({ length: lineCount }, (_, index) => (
                <div key={`line-${index + 1}`} className="file-editor-line-number">
                  {index + 1}
                </div>
              ))}
            </div>
          )}
          <textarea
            className={`file-editor-textarea ${wordWrap ? "file-editor-textarea--wrap" : ""}`}
            value={content}
            onChange={(e) => onChange(e.target.value)}
            onScroll={handleTextareaScroll}
            readOnly={readOnly}
            spellCheck={false}
            aria-label={filePath ? `Editor for ${filePath}` : "File editor"}
          />
        </div>
      )}
    </div>
  );
}
