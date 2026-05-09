import { useState, useEffect, useCallback } from "react";
import { getErrorMessage } from "@fusion/core";
import type { FileContentResponse, SaveFileResponse } from "../api";
import { fetchWorkspaceFileContent, saveWorkspaceFileContent } from "../api";

interface UseWorkspaceFileEditorReturn {
  content: string;
  setContent: (content: string) => void;
  originalContent: string;
  loading: boolean;
  saving: boolean;
  error: string | null;
  save: () => Promise<void>;
  hasChanges: boolean;
  mtime: string | null;
}

/**
 * Hook for editing a file in a selected workspace.
 *
 * @param workspace - The workspace identifier ("project" or task ID)
 * @param filePath - The selected file path
 * @param enabled - Whether loading is enabled
 * @param projectId - Optional project ID for multi-project scoping
 */
export function useWorkspaceFileEditor(
  workspace: string,
  filePath: string | null,
  enabled: boolean,
  projectId?: string,
): UseWorkspaceFileEditorReturn {
  const [content, setContentState] = useState<string>("");
  const [originalContent, setOriginalContent] = useState<string>("");
  const [mtime, setMtime] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setContent = useCallback((newContent: string) => {
    setContentState(newContent);
    setError(null);
  }, []);

  useEffect(() => {
    if (!enabled || !workspace || !filePath) {
      setContentState("");
      setOriginalContent("");
      setMtime(null);
      setError(null);
      return;
    }

    let cancelled = false;

    async function loadFile() {
      setLoading(true);
      setError(null);

      try {
        const response: FileContentResponse = await fetchWorkspaceFileContent(workspace, filePath!, projectId);

        if (!cancelled) {
          setContentState(response.content);
          setOriginalContent(response.content);
          setMtime(response.mtime);
        }
      } catch (err) {
        if (!cancelled) {
          setError(getErrorMessage(err) || "Failed to load file");
          setContentState("");
          setOriginalContent("");
          setMtime(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadFile();

    return () => {
      cancelled = true;
    };
  }, [workspace, filePath, enabled, projectId]);

  const hasChanges = content !== originalContent;

  const save = useCallback(async () => {
    if (!workspace || !filePath || !hasChanges) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response: SaveFileResponse = await saveWorkspaceFileContent(workspace, filePath, content, projectId);
      setOriginalContent(content);
      setMtime(response.mtime);
    } catch (err) {
      setError(getErrorMessage(err) || "Failed to save file");
      throw err;
    } finally {
      setSaving(false);
    }
  }, [workspace, filePath, content, hasChanges, projectId]);

  return {
    content,
    setContent,
    originalContent,
    loading,
    saving,
    error,
    save,
    hasChanges,
    mtime,
  };
}
