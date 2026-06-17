import { NextRequest, NextResponse } from "next/server";
import { getDevelopers, getTickets, getDocs, getDashboardStats, getSkills } from "@/lib/thoughts";
import fs from "fs/promises";
import path from "path";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const IDEAS_FILE = path.join(process.cwd(), "..", "thoughts", "shared", "ideas.json");

export async function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get('type') || 'dashboard';
  const source = request.nextUrl.searchParams.get('source') || 'local';
  const branch = request.nextUrl.searchParams.get('branch') || 'main';
  
  // Get session for authenticated GitHub API calls
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
        const effectiveSource = source === 'github' && !accessToken ? 'local' : source;
        const tickets = await getTickets(effectiveSource as 'local' | 'github', branch, accessToken);
        return NextResponse.json(tickets);
      }
      case 'docs': {
        const docs = await getDocs();
        return NextResponse.json(docs);
      }
      case 'dashboard': {
        const effectiveSource = source === 'github' && !accessToken ? 'local' : source;
        const [stats, tickets] = await Promise.all([getDashboardStats(), getTickets(effectiveSource as 'local' | 'github', branch, accessToken)]);
        return NextResponse.json({ stats, tickets });
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
