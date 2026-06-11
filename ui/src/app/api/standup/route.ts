import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const STANDUP_FILE = path.join(process.cwd(), "..", "thoughts", "shared", "standup.json");

async function readStandups(): Promise<unknown[]> {
  try {
    const data = await fs.readFile(STANDUP_FILE, "utf8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeStandups(entries: unknown[]): Promise<void> {
  await fs.mkdir(path.dirname(STANDUP_FILE), { recursive: true });
  await fs.writeFile(STANDUP_FILE, JSON.stringify(entries, null, 2), "utf8");
}

export async function GET() {
  try {
    const entries = await readStandups();
    return NextResponse.json(entries);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { author, yesterday, today, blockers } = body;

    if (!author || !today) {
      return NextResponse.json(
        { error: "Missing required fields: author, today" },
        { status: 400 },
      );
    }

    const entry = {
      id: `STANDUP-${Date.now()}`,
      author,
      date: new Date().toISOString().slice(0, 10),
      yesterday: yesterday || "",
      today,
      blockers: blockers || "",
      createdAt: new Date().toISOString(),
    };

    const entries = await readStandups();
    entries.unshift(entry);
    await writeStandups(entries);

    return NextResponse.json({ success: true, id: entry.id });
  } catch (error) {
    console.error("Standup POST error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
