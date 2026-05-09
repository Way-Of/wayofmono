import "./OAuthManualCodeForm.css";

interface OAuthManualCodeFormProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  prompt: string;
  placeholder?: string;
  helpText?: string;
  disabled?: boolean;
  submitLabel?: string;
  "data-testid"?: string;
}

export function OAuthManualCodeForm({
  value,
  onChange,
  onSubmit,
  prompt,
  placeholder,
  helpText,
  disabled = false,
  submitLabel = "Submit code",
  "data-testid": testId,
}: OAuthManualCodeFormProps) {
  return (
    <div className="oauth-manual-code" data-testid={testId}>
      <p className="oauth-manual-code__prompt">{prompt}</p>
      <textarea
        className="form-input oauth-manual-code__input"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={3}
        spellCheck={false}
        disabled={disabled}
      />
      <div className="oauth-manual-code__actions">
        <button
          type="button"
          className="btn btn-sm"
          onClick={onSubmit}
          disabled={disabled}
        >
          {submitLabel}
        </button>
      </div>
      {helpText && <p className="oauth-manual-code__help">{helpText}</p>}
    </div>
  );
}
