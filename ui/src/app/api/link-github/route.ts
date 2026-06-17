import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import os from 'os';

const LINKS_FILE = path.join(os.homedir(), '.config', 'wodev', 'github-links.json');

interface LinkMappings {
  links: Record<string, string>; // pincodeDevId → githubUsername
}

function loadLinks(): LinkMappings {
  try {
    const raw = fs.readFileSync(LINKS_FILE, 'utf8');
    return JSON.parse(raw);
  } catch {
    return { links: {} };
  }
}

function saveLinks(data: LinkMappings): void {
  const dir = path.dirname(LINKS_FILE);
  try { fs.mkdirSync(dir, { recursive: true }); } catch {}
  fs.writeFileSync(LINKS_FILE, JSON.stringify(data, null, 2), 'utf8');
}

export async function POST(req: NextRequest) {
  try {
    const { devId, githubUsername } = await req.json();
    if (!devId || !githubUsername) {
      return NextResponse.json({ error: 'devId and githubUsername required' }, { status: 400 });
    }
    const data = loadLinks();
    data.links[devId] = githubUsername;
    saveLinks(data);
    console.log(`[Link-GitHub] Mapped pincode dev "${devId}" → GitHub user "${githubUsername}"`);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[Link-GitHub] POST error:', e);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const devId = req.nextUrl.searchParams.get('devId');
  const data = loadLinks();
  if (devId) {
    const gh = data.links[devId] || null;
    return NextResponse.json({ devId, githubUsername: gh });
  }
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest) {
  try {
    const { devId } = await req.json();
    if (!devId) {
      return NextResponse.json({ error: 'devId required' }, { status: 400 });
    }
    const data = loadLinks();
    delete data.links[devId];
    saveLinks(data);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[Link-GitHub] DELETE error:', e);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  return POST(req);
}
