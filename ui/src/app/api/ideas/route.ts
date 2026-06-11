import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const IDEAS_FILE = path.join(process.cwd(), "..", "thoughts", "shared", "ideas.json");

async function readIdeas(): Promise<unknown[]> {
  try {
    const data = await fs.readFile(IDEAS_FILE, "utf8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeIdeas(ideas: unknown[]): Promise<void> {
  await fs.mkdir(path.dirname(IDEAS_FILE), { recursive: true });
  await fs.writeFile(IDEAS_FILE, JSON.stringify(ideas, null, 2), "utf8");
}

export async function GET() {
  const ideas = await readIdeas();
  return NextResponse.json(ideas);
}

export async function POST(request: NextRequest) {
  try {
    const idea = await request.json();
    const ideas = await readIdeas();
    ideas.push(idea);
    await writeIdeas(ideas);
    return NextResponse.json({ success: true, idea });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
