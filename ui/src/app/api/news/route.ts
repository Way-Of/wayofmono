import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const NEWS_FILE = path.join(process.cwd(), "..", "thoughts", "shared", "news.json");

async function readNews(): Promise<unknown[]> {
  try {
    const data = await fs.readFile(NEWS_FILE, "utf8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeNews(items: unknown[]): Promise<void> {
  await fs.mkdir(path.dirname(NEWS_FILE), { recursive: true });
  await fs.writeFile(NEWS_FILE, JSON.stringify(items, null, 2), "utf8");
}

export async function GET() {
  try {
    const items = await readNews();
    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const item = await request.json();
    const { title, body, author, pinned } = item;

    if (!title || !body || !author) {
      return NextResponse.json(
        { error: "Missing required fields: title, body, author" },
        { status: 400 },
      );
    }

    const entry = {
      id: `NEWS-${Date.now()}`,
      title,
      body,
      author,
      createdAt: new Date().toISOString(),
      pinned: pinned || false,
    };

    const items = await readNews();
    items.unshift(entry);
    await writeNews(items);

    return NextResponse.json({ success: true, id: entry.id });
  } catch (error) {
    console.error("News POST error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
