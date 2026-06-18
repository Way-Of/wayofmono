import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

const NOTIFICATIONS_DIR = path.join(os.homedir(), '.config', 'wodev', 'notifications');
const READ_FILE = path.join(NOTIFICATIONS_DIR, 'read.json');

interface Notification {
  id: string;
  type: 'review' | 'ticket_update' | 'ticket_created' | 'mention' | 'idea' | 'news';
  title: string;
  body: string;
  ticketId?: string;
  ideaId?: string;
  createdAt: string;
  read: boolean;
}

async function ensureDir() {
  try {
    await fs.mkdir(NOTIFICATIONS_DIR, { recursive: true });
  } catch {}
}

async function getReadSet(): Promise<Set<string>> {
  try {
    const content = await fs.readFile(READ_FILE, 'utf-8');
    const data = JSON.parse(content);
    return new Set(data.readIds || []);
  } catch {
    return new Set();
  }
}

async function saveReadSet(readIds: Set<string>): Promise<void> {
  await ensureDir();
  await fs.writeFile(READ_FILE, JSON.stringify({ readIds: [...readIds] }), 'utf-8');
}

async function generateNotifications(tickets: any[], userId: string): Promise<Notification[]> {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  
  const notifications: Notification[] = [];
  
  // Review notifications
  for (const ticket of tickets) {
    if (ticket.status === 'In Review' && ticket.reviewStatus === 'Pending') {
      notifications.push({
        id: `review-${ticket.id}`,
        type: 'review',
        title: 'Review Required',
        body: `${ticket.title} needs your review`,
        ticketId: ticket.id,
        createdAt: ticket.updated || new Date().toISOString(),
        read: false,
      });
    }
  }
  
  // Recent ticket updates
  for (const ticket of tickets) {
    if (!ticket.updated) continue;
    const updated = new Date(ticket.updated);
    if (updated >= weekAgo) {
      notifications.push({
        id: `update-${ticket.id}`,
        type: 'ticket_update',
        title: 'Ticket Updated',
        body: `${ticket.title} was updated`,
        ticketId: ticket.id,
        createdAt: ticket.updated,
        read: false,
      });
    }
  }
  
  // Sort by date descending
  notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  return notifications;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get('userId') || 'current';
  
  // In production, fetch from thoughts/GitHub
  // For now, return mock data - real implementation would fetch tickets
  const readSet = await getReadSet();
  
  return NextResponse.json({
    readIds: [...readSet],
    unreadCount: 0, // Will be calculated client-side
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, notificationId } = body;
    
    if (action === 'mark-read' && notificationId) {
      const readSet = await getReadSet();
      readSet.add(notificationId);
      await saveReadSet(readSet);
      return NextResponse.json({ success: true });
    }
    
    if (action === 'mark-all-read' && Array.isArray(body.notificationIds)) {
      const readSet = await getReadSet();
      for (const id of body.notificationIds) readSet.add(id);
      await saveReadSet(readSet);
      return NextResponse.json({ success: true });
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}