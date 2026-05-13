const ansiPattern = /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g;

export function stripAnsi(text: string): string {
  return text.replace(ansiPattern, "");
}

export function visibleWidth(text: string): number {
  let width = 0;
  const stripped = stripAnsi(text);
  for (const char of stripped) {
    width += char.charCodeAt(0) > 0xff ? 2 : 1;
  }
  return width;
}

export function truncateToWidth(text: string, maxWidth: number, ellipsis = "…"): string {
  if (maxWidth <= 0) return "";
  if (visibleWidth(text) <= maxWidth) return text;

  const ellipsisWidth = visibleWidth(ellipsis);
  const available = maxWidth - ellipsisWidth;

  if (available <= 0) return ellipsis.slice(0, maxWidth);

  let result = "";
  let currentWidth = 0;
  const stripped = stripAnsi(text);

  for (const char of stripped) {
    const charWidth = char.charCodeAt(0) > 0xff ? 2 : 1;
    if (currentWidth + charWidth > available) break;
    result += char;
    currentWidth += charWidth;
  }

  return result + ellipsis;
}

export function wrapTextWithAnsi(text: string, width: number): string[] {
  const lines: string[] = [];
  const words = text.split(" ");

  let currentLine = "";

  for (const word of words) {
    const wordWidth = visibleWidth(word);
    const lineWidth = visibleWidth(currentLine);

    if (lineWidth + wordWidth + (currentLine ? 1 : 0) > width) {
      if (currentLine) lines.push(currentLine.trimEnd());
      currentLine = word;
    } else {
      currentLine += (currentLine ? " " : "") + word;
    }
  }

  if (currentLine) lines.push(currentLine.trimEnd());

  return lines.length > 0 ? lines : [""];
}
