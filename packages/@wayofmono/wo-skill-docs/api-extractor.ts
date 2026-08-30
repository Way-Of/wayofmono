import ts from "typescript";
import { readFileSync, existsSync } from "fs";
import { join, resolve } from "path";

/**
 * Supercharged API Extractor for WayOfMono.
 * Uses TypeScript Compiler API for deep symbol analysis.
 */

interface ApiSymbol {
  name: string;
  kind: string;
  docs: string;
  parameters?: Array<{ name: string; type: string; optional: boolean }>;
  returnType?: string;
  properties?: Array<{ name: string; type: string; docs: string; optional: boolean }>;
}

function extractApi(filePaths: string[]) {
  const resolvedPaths = filePaths.map(p => resolve(p));
  const program = ts.createProgram(resolvedPaths, {
    target: ts.ScriptTarget.ESNext,
    module: ts.ModuleKind.CommonJS,
    allowJs: true,
  });

  const checker = program.getTypeChecker();
  const results: Record<string, ApiSymbol[]> = {};

  for (const filePath of resolvedPaths) {
    const sourceFile = program.getSourceFile(filePath);
    if (!sourceFile) continue;

    const symbols: ApiSymbol[] = [];

    ts.forEachChild(sourceFile, (node) => {
      if (!isNodeExported(node)) return;

      if (ts.isFunctionDeclaration(node) && node.name) {
        const symbol = checker.getSymbolAtLocation(node.name);
        if (symbol) symbols.push(serializeFunction(checker, symbol, node));
      } else if (ts.isClassDeclaration(node) && node.name) {
        const symbol = checker.getSymbolAtLocation(node.name);
        if (symbol) symbols.push(serializeClass(checker, symbol, node));
      } else if (ts.isInterfaceDeclaration(node) && node.name) {
        const symbol = checker.getSymbolAtLocation(node.name);
        if (symbol) symbols.push(serializeInterface(checker, symbol, node));
      } else if (ts.isTypeAliasDeclaration(node) && node.name) {
        const symbol = checker.getSymbolAtLocation(node.name);
        if (symbol) symbols.push(serializeTypeAlias(checker, symbol, node));
      }
    });

    results[filePath] = symbols;
  }

  return results;
}

function isNodeExported(node: ts.Node): boolean {
  return (
    (ts.getCombinedModifierFlags(node as ts.Declaration) & ts.ModifierFlags.Export) !== 0 ||
    (!!node.parent && node.parent.kind === ts.SyntaxKind.SourceFile)
  );
}

function serializeFunction(checker: ts.TypeChecker, symbol: ts.Symbol, node: ts.FunctionDeclaration): ApiSymbol {
  return {
    name: symbol.getName(),
    kind: "Function",
    docs: ts.displayPartsToString(symbol.getDocumentationComment(checker)),
    parameters: node.parameters.map((p) => ({
      name: p.name.getText(),
      type: checker.typeToString(checker.getTypeAtLocation(p)),
      optional: !!p.questionToken || !!p.initializer,
    })),
    returnType: checker.typeToString(checker.getReturnTypeOfSignature(checker.getSignatureFromDeclaration(node)!)),
  };
}

function serializeClass(checker: ts.TypeChecker, symbol: ts.Symbol, node: ts.ClassDeclaration): ApiSymbol {
  const properties: any[] = [];
  checker.getPropertiesOfType(checker.getDeclaredTypeOfSymbol(symbol)).forEach((prop) => {
    properties.push({
      name: prop.getName(),
      type: checker.typeToString(checker.getTypeOfSymbolAtLocation(prop, node)),
      docs: ts.displayPartsToString(prop.getDocumentationComment(checker)),
      optional: !!(prop.flags & ts.SymbolFlags.Optional),
    });
  });

  return {
    name: symbol.getName(),
    kind: "Class",
    docs: ts.displayPartsToString(symbol.getDocumentationComment(checker)),
    properties,
  };
}

function serializeInterface(checker: ts.TypeChecker, symbol: ts.Symbol, node: ts.InterfaceDeclaration): ApiSymbol {
  const properties: any[] = [];
  checker.getPropertiesOfType(checker.getDeclaredTypeOfSymbol(symbol)).forEach((prop) => {
    properties.push({
      name: prop.getName(),
      type: checker.typeToString(checker.getTypeOfSymbolAtLocation(prop, node)),
      docs: ts.displayPartsToString(prop.getDocumentationComment(checker)),
      optional: !!(prop.flags & ts.SymbolFlags.Optional),
    });
  });

  return {
    name: symbol.getName(),
    kind: "Interface",
    docs: ts.displayPartsToString(symbol.getDocumentationComment(checker)),
    properties,
  };
}

function serializeTypeAlias(checker: ts.TypeChecker, symbol: ts.Symbol, node: ts.TypeAliasDeclaration): ApiSymbol {
  return {
    name: symbol.getName(),
    kind: "TypeAlias",
    docs: ts.displayPartsToString(symbol.getDocumentationComment(checker)),
    returnType: checker.typeToString(checker.getTypeAtLocation(node)),
  };
}

// Main
const args = process.argv.slice(2);
if (args.length === 0) {
  console.log("Usage: npx tsx api-extractor.ts <files...>");
  process.exit(1);
}

try {
  const apiData = extractApi(args);
  console.log(JSON.stringify(apiData, null, 2));
} catch (err: any) {
  console.error(`Extraction failed: ${err.message}`);
  process.exit(1);
}
