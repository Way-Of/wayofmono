# @wayofmono/lens

Diagnostic and analysis tooling for the Wo ecosystem. Provides file-level diagnostic analysis, inline annotations, and code quality insights.

```
npm install @wayofmono/lens
```

## Usage

```ts
import { LensDiagnostic, analyzeFile, formatDiagnostic } from "@wayofmono/lens";

// Analyze a file
const diagnostics = await analyzeFile("src/main.ts");
diagnostics.forEach((d) => console.log(formatDiagnostic(d)));

// Diagnostic type
interface LensDiagnostic {
  file: string;
  severity: "error" | "warning" | "info";
  message: string;
  line?: number;
  column?: number;
  code?: string;
}
```

## API

| Function | Description |
|----------|-------------|
| `analyzeFile(path)` | Run diagnostics on a file |
| `analyzeProject(cwd)` | Run diagnostics on all files in project |
| `formatDiagnostic(diag)` | Format diagnostic for display |
| `formatDiagnostics(diags)` | Format multiple diagnostics |
| `createDiagnosticDisplay(diags)` | Create display component for diagnostics |

## Types

`LensDiagnostic`, `LensConfig`, `LensResult`

## Integration

Lens diagnostics are consumed by wo-agent-core's `ResourceDiagnostic` type and displayed in wo-tui's footer/status bar widget. Use `pi.ui.notify()` or `pi.sendMessage()` to deliver diagnostics during agent operation.
