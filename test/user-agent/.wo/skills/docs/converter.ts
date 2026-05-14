import { execSync } from "child_process";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, extname, basename } from "path";

/**
 * Universal Documentation Converter for WayOfMono.
 * Handles Markdown to PDF, Word, HTML, and Text.
 */

const format = process.argv[2];
const inputFile = process.argv[3];
const outputFile = process.argv[4];

if (!format || !inputFile || !outputFile) {
  console.log("Usage: npx tsx converter.ts <pdf|docx|html|txt> <input.md> <output>");
  process.exit(1);
}

if (!existsSync(inputFile)) {
  console.error(`Input file not found: ${inputFile}`);
  process.exit(1);
}

function convert() {
  console.log(`Converting ${inputFile} to ${format} format...`);

  try {
    switch (format) {
      case "pdf":
      case "docx":
      case "html":
        // Check for pandoc
        try {
          execSync(`pandoc --version`, { stdio: "ignore" });
          execSync(`pandoc "${inputFile}" -o "${outputFile}"`);
          console.log(`Success: ${outputFile} generated via pandoc.`);
        } catch (e) {
          console.error("Error: 'pandoc' is required for PDF/Word conversion.");
          console.log("Install it with: sudo apt-get install pandoc (on Linux)");
          process.exit(1);
        }
        break;

      case "txt":
        // Strip basic markdown symbols for plain text
        const content = readFileSync(inputFile, "utf-8");
        const plainText = content
          .replace(/#+\s/g, "") // Headers
          .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1") // Links
          .replace(/`{1,3}/g, ""); // Code
        writeFileSync(outputFile, plainText);
        console.log(`Success: ${outputFile} generated.`);
        break;

      default:
        console.error(`Unsupported format: ${format}`);
        process.exit(1);
    }
  } catch (err: any) {
    console.error(`Conversion failed: ${err.message}`);
    process.exit(1);
  }
}

convert();
