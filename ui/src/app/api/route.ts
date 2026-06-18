import { NextRequest, NextResponse } from "next/server";
import { getDevelopers, getDocs, getDashboardStats, getSkills } from "@/lib/thoughts";
import { getAllTickets, getTicketCount, bootstrapTicketsFromFiles } from "@/lib/tickets-db";
import { walkAllTicketFiles } from "@/lib/tickets-fs";
import fs from "fs/promises";
import path from "path";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const IDEAS_FILE = path.join(process.cwd(), "..", "thoughts", "shared", "ideas.json");

export async function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get('type') || 'dashboard';
  const source = request.nextUrl.searchParams.get('source') || 'local';
  const branch = request.nextUrl.searchParams.get('branch') || 'main';

  const session = await getServerSession(authOptions);
  const accessToken = (session as any)?.accessToken;

  try {
    switch (type) {
      case 'developers': {
        const effectiveSource = source === 'github' && !accessToken ? 'local' : source;
        const devs = await getDevelopers(effectiveSource as 'local' | 'github', branch, accessToken);
        return NextResponse.json(devs);
      }
      case 'tickets': {
        const count = await getTicketCount();
        if (count === 0) {
          const imported = await bootstrapTicketsFromFiles(walkAllTicketFiles);
          console.log(`[api] Bootstrapped ${imported} tickets from filesystem`);
        }
        const tickets = await getAllTickets();
        return NextResponse.json({
          tickets,
          sourceInfo: {
            requested: source,
            actual: 'local',
            tokenAvailable: false,
            tokenSource: null,
            reason: 'Prisma/SQLite read-cache',
          },
        });
      }
      case 'docs': {
        const docs = await getDocs();
        return NextResponse.json(docs);
      }
      case 'dashboard': {
        const tickets = await getAllTickets();
        const stats = await getDashboardStats(tickets);
        return NextResponse.json({ stats, tickets, sourceInfo: {
          requested: source,
          actual: 'local',
          tokenAvailable: false,
          tokenSource: null,
          reason: 'Prisma/SQLite read-cache',
        }});
      }
      case 'skills': {
        const skills = await getSkills();
        return NextResponse.json(skills);
      }
      case 'ideas': {
        try {
          const data = await fs.readFile(IDEAS_FILE, "utf8");
          return NextResponse.json(JSON.parse(data));
        } catch {
          return NextResponse.json([]);
        }
      }
      default:
        return NextResponse.json({ error: 'Unknown type' }, { status: 400 });
    }
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
