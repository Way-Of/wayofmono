import { useState, useCallback, useMemo } from "react";
import { Check, Loader2 } from "lucide-react";
import { validateProjectPath, validateProjectName, suggestProjectName } from "../utils/projectDetection";
import type { ProjectCreateInput, NodeInfo } from "../api";
import { DirectoryPicker } from "./DirectoryPicker";

export interface SetupProjectFormProps {
  /** Called when the form is submitted with valid data */
  onSubmit: (input: ProjectCreateInput) => void;
  /** Called when validation state changes */
  onValidationChange?: (isValid: boolean) => void;
  /** Existing projects for duplicate checking */
  existingProjects?: { name: string; path: string }[];
  /** Loading state while submitting */
  isSubmitting?: boolean;
  /** Optional default path value */
  defaultPath?: string;
  /** Available nodes for the node selector */
  nodes?: NodeInfo[];
  /** Currently selected node ID (for controlled/default state) */
  selectedNodeId?: string;
}

/**
 * SetupProjectForm - Manual project registration form
 *
 * Form for manually registering a new project with:
 * - Node selector for runtime node selection
 * - Directory picker for path selection (node-aware)
 * - Name input with auto-suggestion
 * - Isolation mode selector
 * - Real-time validation
 */
export function SetupProjectForm({
  onSubmit,
  onValidationChange,
  existingProjects = [],
  isSubmitting = false,
  defaultPath = "",
  nodes = [],
  selectedNodeId,
}: SetupProjectFormProps) {
  const [path, setPath] = useState(defaultPath);
  const [name, setName] = useState("");
  const [isolationMode, setIsolationMode] = useState<"in-process" | "child-process">("in-process");
  const [pathError, setPathError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [touched, setTouched] = useState({ path: false, name: false });
  const [nodeId, setNodeId] = useState(selectedNodeId ?? "");

  // Compute the local node ID from the nodes list
  const localNodeId = useMemo(() => nodes.find((n) => n.type === "local")?.id, [nodes]);

  // Validate path
  const validatePath = useCallback((value: string) => {
    const result = validateProjectPath(value);
    setPathError(result.valid ? null : (result.error ?? null));
    return result.valid;
  }, []);

  // Validate name
  const validateNameField = useCallback((value: string) => {
    const result = validateProjectName(value, existingProjects);
    setNameError(result.valid ? null : (result.error ?? null));
    return result.valid;
  }, [existingProjects]);

  // Auto-suggest name from path
  const handlePathChange = useCallback((value: string) => {
    setPath(value);
    setTouched((prev) => ({ ...prev, path: true }));

    const isValid = validatePath(value);

    // Auto-suggest name if name is empty and path is valid
    if (isValid && !name && value) {
      const suggested = suggestProjectName(value);
      if (suggested) {
        setName(suggested);
      }
    }
  }, [name, validatePath]);

  const handleNameChange = useCallback((value: string) => {
    setName(value);
    setTouched((prev) => ({ ...prev, name: true }));
    validateNameField(value);
  }, [validateNameField]);

  // Check overall form validity
  const isFormValid = useMemo(() => {
    const pathResult = validateProjectPath(path);
    const nameResult = validateProjectName(name, existingProjects);
    return pathResult.valid && nameResult.valid && !isSubmitting;
  }, [path, name, existingProjects, isSubmitting]);

  // Report validation state to parent
  useMemo(() => {
    onValidationChange?.(isFormValid);
  }, [isFormValid, onValidationChange]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();

    const isPathValid = validatePath(path);
    const isNameValid = validateNameField(name);

    if (isPathValid && isNameValid) {
      onSubmit({
        name,
        path,
        isolationMode,
        nodeId: nodeId || undefined,
      });
    }
  }, [path, name, isolationMode, nodeId, onSubmit, validatePath, validateNameField]);

  return (
    <form onSubmit={handleSubmit} className="setup-project-form">
      {/* Node selector */}
      <div className="form-group">
        <div className="project-node-selector">
          <span className="project-node-selector__label">Runtime Node</span>
          <select
            value={nodeId}
            onChange={(e) => setNodeId(e.target.value)}
            disabled={isSubmitting}
          >
            <option value="">Local node</option>
            {nodes.map((node) => (
              <option key={node.id} value={node.id}>
                {node.name} ({node.type})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Path input */}
      <div className="form-group">
        <label htmlFor="project-path">
          Directory Path <span className="required">*</span>
        </label>
        <DirectoryPicker
          value={path}
          onChange={handlePathChange}
          nodeId={nodeId || undefined}
          localNodeId={localNodeId}
          placeholder="/path/to/your/project"
        />
        {pathError && touched.path && (
          <div className="field-error">
            <span>{pathError}</span>
          </div>
        )}
        <div className="field-hint">
          Enter the absolute path to your project directory
        </div>
      </div>

      {/* Name input */}
      <div className="form-group">
        <label htmlFor="project-name">
          Project Name <span className="required">*</span>
        </label>
        <div className={`input-wrapper ${nameError && touched.name ? "error" : ""}`}>
          <input
            id="project-name"
            type="text"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            onBlur={() => {
              setTouched((prev) => ({ ...prev, name: true }));
              validateNameField(name);
            }}
            placeholder="my-project"
            disabled={isSubmitting}
          />
          {name && !nameError && touched.name && (
            <Check size={16} className="input-success-icon" />
          )}
        </div>
        {nameError && touched.name && (
          <div className="field-error">
            <span>{nameError}</span>
          </div>
        )}
        <div className="field-hint">
          Use letters, numbers, hyphens, and underscores only
        </div>
      </div>

      {/* Isolation mode */}
      <div className="form-group">
        <label>Execution Mode</label>
        <div className="radio-group">
          <label className={`radio-option ${isolationMode === "in-process" ? "selected" : ""}`}>
            <input
              type="radio"
              name="isolation-mode"
              value="in-process"
              checked={isolationMode === "in-process"}
              onChange={() => setIsolationMode("in-process")}
              disabled={isSubmitting}
            />
            <div className="radio-content">
              <strong>In-Process (Default)</strong>
              <span>Fast, low overhead. Tasks run in the main process.</span>
            </div>
          </label>
          <label className={`radio-option ${isolationMode === "child-process" ? "selected" : ""}`}>
            <input
              type="radio"
              name="isolation-mode"
              value="child-process"
              checked={isolationMode === "child-process"}
              onChange={() => setIsolationMode("child-process")}
              disabled={isSubmitting}
            />
            <div className="radio-content">
              <strong>Child Process (Isolated)</strong>
              <span>Strong isolation. Tasks run in separate processes.</span>
            </div>
          </label>
        </div>
      </div>

      {/* Submit button */}
      <div className="form-actions">
        <button
          type="submit"
          className="btn btn-primary"
          disabled={!isFormValid || isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="spin" />
              Creating...
            </>
          ) : (
            "Create Project"
          )}
        </button>
      </div>
    </form>
  );
}
