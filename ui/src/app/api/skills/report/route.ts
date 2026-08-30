import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clientId, tool, skills } = body;

    if (!clientId || !tool || !Array.isArray(skills)) {
      return NextResponse.json(
        { error: "Missing required fields: clientId, tool, skills" },
        { status: 400 },
      );
    }

    const report = await db.skillReport.create({
      data: {
        clientId,
        tool,
        count: skills.length,
        skills: JSON.stringify(skills),
      },
    });

    return NextResponse.json({ success: true, id: report.id });
  } catch (error) {
    console.error("Skill report error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function GET() {
  try {
    const reports = await db.skillReport.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    const parsed = reports.map((r) => ({
      id: r.id,
      clientId: r.clientId,
      tool: r.tool,
      count: r.count,
      skills: JSON.parse(r.skills),
      createdAt: r.createdAt.toISOString(),
    }));

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Skill report GET error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
