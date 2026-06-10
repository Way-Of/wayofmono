import { NextRequest, NextResponse } from "next/server";
import { getDevelopers, getTickets, getDocs, getDashboardStats } from "@/lib/thoughts";

export async function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get('type') || 'dashboard';

  try {
    switch (type) {
      case 'developers': {
        const devs = await getDevelopers();
        return NextResponse.json(devs);
      }
      case 'tickets': {
        const tickets = await getTickets();
        return NextResponse.json(tickets);
      }
      case 'docs': {
        const docs = await getDocs();
        return NextResponse.json(docs);
      }
      case 'dashboard': {
        const [stats, tickets] = await Promise.all([getDashboardStats(), getTickets()]);
        return NextResponse.json({ stats, tickets });
      }
      default:
        return NextResponse.json({ error: 'Unknown type' }, { status: 400 });
    }
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
