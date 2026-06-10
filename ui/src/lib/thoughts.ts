import fs from 'fs/promises';
import path from 'path';

const THOUGHTS_ROOT = path.join(process.cwd(), '..', 'thoughts');
const PROJECTS = ['wayofmono', 'wow', 'opticat'] as const;
type ProjectSlug = (typeof PROJECTS)[number];

interface Frontmatter {
  [key: string]: unknown;
}

function parseFrontmatter(content: string): { frontmatter: Frontmatter; body: string } {
  const frontmatter: Frontmatter = {};
  let body = content;

  if (content.startsWith('---')) {
    const endIdx = content.indexOf('---', 3);
    if (endIdx !== -1) {
      const fmRaw = content.slice(3, endIdx).trim();
      body = content.slice(endIdx + 3).trim();
      for (const line of fmRaw.split('\n')) {
        const colonIdx = line.indexOf(':');
        if (colonIdx !== -1) {
          const key = line.slice(0, colonIdx).trim();
          let val: unknown = line.slice(colonIdx + 1).trim();
          if (typeof val === 'string') {
            if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
            else if (val.startsWith('[') && val.endsWith(']')) {
              try { val = JSON.parse(val); } catch { /* string */ }
            }
          }
          frontmatter[key] = val;
        }
      }
    }
  }

  return { frontmatter, body };
}

export async function getDevelopers() {
  const devs: {
    id: string;
    githubUsername: string;
    displayName: string;
    role: string;
    pincode: string;
    avatarUrl: string;
    projects: string[];
    isActive: boolean;
  }[] = [];
  const seen = new Set<string>();

  for (const project of PROJECTS) {
    const projectPath = path.join(THOUGHTS_ROOT, project);
    try {
      const entries = await fs.readdir(projectPath, { withFileTypes: true });
      for (const entry of entries) {
        if (!entry.isDirectory() || entry.name.startsWith('.') || entry.name === 'global' || entry.name === 'shared' || entry.name === 'docs') continue;
        if (seen.has(entry.name)) continue;
        seen.add(entry.name);

        let pincode = '';
        try {
          const configPath = path.join(projectPath, entry.name, 'config.md');
          const configContent = await fs.readFile(configPath, 'utf8');
          const { frontmatter } = parseFrontmatter(configContent);
          pincode = String(frontmatter['pincode'] || '');
        } catch { /* no config */ }

        devs.push({
          id: entry.name,
          githubUsername: entry.name,
          displayName: entry.name.charAt(0).toUpperCase() + entry.name.slice(1),
          role: 'Developer',
          pincode,
          avatarUrl: '',
          projects: [project],
          isActive: true,
        });
      }
    } catch { /* no project dir */ }
  }

  const craig = devs.find(d => d.id === 'craig');
  if (craig) { craig.role = 'CTO'; craig.githubUsername = 'craigmartin'; }

  const zerwiz = devs.find(d => d.id === 'zerwiz');
  if (zerwiz) { zerwiz.role = 'Lead'; zerwiz.githubUsername = 'zerwiz'; }

  const andre = devs.find(d => d.id === 'andre');
  if (andre) { andre.role = 'Senior'; andre.githubUsername = 'Epileptickk'; }

  const tomas = devs.find(d => d.id === 'tomas');
  if (tomas) { tomas.role = 'Developer'; tomas.githubUsername = 'tomchi-debug'; }

  for (const dev of devs) {
    dev.projects = [...new Set(PROJECTS.filter(p => {
      try { fs.access(path.join(THOUGHTS_ROOT, p, dev.id)); return true; }
      catch { return false; }
    }))];
  }

  return devs;
}

export async function getTickets() {
  const tickets: Record<string, unknown>[] = [];
  const seenIds = new Set<string>();

  for (const project of PROJECTS) {
    const ticketsDir = path.join(THOUGHTS_ROOT, project, 'shared', 'tickets');
    try {
      await walkDir(ticketsDir, tickets, seenIds, project);
    } catch { /* no tickets dir */ }
  }

  return tickets;
}

async function walkDir(dir: string, result: Record<string, unknown>[], seenIds: Set<string>, project: string) {
  let entries;
  try { entries = await fs.readdir(dir, { withFileTypes: true }); }
  catch { return; }

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walkDir(fullPath, result, seenIds, project);
    } else if (entry.name.endsWith('.md') && entry.name !== 'personal-ticket-template.md') {
      const content = await fs.readFile(fullPath, 'utf8');
      const { frontmatter, body } = parseFrontmatter(content);

      const id = entry.name.replace(/\.md$/, '');
      if (seenIds.has(id)) continue;
      seenIds.add(id);

      result.push({
        id,
        title: frontmatter['title'] || entry.name,
        type: frontmatter['type'] || 'Task',
        priority: frontmatter['priority'] || 'Medium',
        status: frontmatter['status'] || 'Backlog',
        assignee: String(frontmatter['assignee'] || '').replace('@', ''),
        reporter: String(frontmatter['reporter'] || '').replace('@', ''),
        project,
        namespace: frontmatter['namespace'] || '',
        category: frontmatter['category'] || '',
        parentTicket: frontmatter['parent_ticket'] || '',
        sharedTickets: Array.isArray(frontmatter['shared_tickets']) ? frontmatter['shared_tickets'] : [],
        prUrl: frontmatter['pr_url'] || '',
        githubIssue: frontmatter['github_issue'] || '',
        created: frontmatter['created'] || '',
        updated: frontmatter['updated'] || '',
        reviewedBy: frontmatter['reviewed_by'] || '',
        reviewedAt: frontmatter['reviewed_at'] || '',
        reviewStatus: frontmatter['review_status'] || 'Pending',
        reviewComments: frontmatter['review_comments'] || '',
        description: body,
        personalBreakdown: [],
        linkedDocs: [],
      });
    }
  }
}

export async function getDocs() {
  const docs: Record<string, unknown>[] = [];

  for (const project of PROJECTS) {
    const docsDir = path.join(THOUGHTS_ROOT, project, 'docs');
    try {
      await walkDocsDir(docsDir, docs, project);
    } catch { /* no docs dir */ }
  }

  return docs;
}

async function walkDocsDir(dir: string, result: Record<string, unknown>[], project: string, prefix = '') {
  let entries;
  try { entries = await fs.readdir(dir, { withFileTypes: true }); }
  catch { return; }

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walkDocsDir(fullPath, result, project, `${prefix}${entry.name}/`);
    } else if (entry.name.endsWith('.md')) {
      const content = await fs.readFile(fullPath, 'utf8');
      const { frontmatter, body } = parseFrontmatter(content);

      const id = entry.name.replace(/\.md$/, '');

      result.push({
        id,
        title: frontmatter['title'] || id,
        type: prefix.split('/')[0] || 'reference',
        project,
        path: `${project}/docs/${prefix}${entry.name}`,
        updated: frontmatter['updated'] || '',
        author: frontmatter['author'] || '',
        summary: body.slice(0, 200),
        body,
      });
    }
  }
}

export async function getSkills() {
  const homedir = (await import('os')).homedir();
  const dirs = [
    { name: 'Pi', path: path.join(homedir, '.pi', 'agent', 'skills') },
    { name: 'OpenCode', path: path.join(homedir, '.config', 'opencode', 'skills') },
    { name: 'Gemini CLI', path: path.join(homedir, '.gemini', 'skills') },
    { name: 'Codex', path: path.join(homedir, '.codex', 'skills') },
    { name: 'Claude Code', path: path.join(homedir, '.claude', 'skills') },
    { name: 'Antigravity', path: path.join(homedir, '.antigravity', 'skills') },
  ];

  const results = [];

  for (const tool of dirs) {
    let exists = false;
    let skills: Record<string, unknown>[] = [];
    try {
      const entries = await fs.readdir(tool.path, { withFileTypes: true });
      exists = true;
      for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        const skillPath = path.join(tool.path, entry.name);
        const files = await fs.readdir(skillPath);
        const skillMd = files.find(f => f.toLowerCase() === 'skill.md');
        let description = '';
        let allowedTools = '';
        let docsUrl = '';
        if (skillMd) {
          const content = await fs.readFile(path.join(skillPath, skillMd), 'utf8');
          const { frontmatter } = parseFrontmatter(content);
          description = String(frontmatter['description'] || '');
          allowedTools = String(frontmatter['allowed-tools'] || '');
          docsUrl = String(frontmatter['docs-url'] || '');
        }
        let lastModified = '';
        try {
          const stat = await fs.stat(skillPath);
          lastModified = stat.mtime.toISOString().slice(0, 10);
        } catch { /* ignore */ }
        skills.push({
          name: entry.name,
          description,
          allowedTools,
          docsUrl,
          fileCount: files.length,
          lastModified,
          hasFrontmatter: !!skillMd,
        });
      }
    } catch { /* dir not found */ }
    results.push({
      name: tool.name,
      path: tool.path,
      exists,
      skillCount: skills.length,
      skills,
      health: !exists ? 'missing' : skills.length === 0 ? 'empty' : skills.every(s => s.description && s.description !== '>') ? 'healthy' : 'partial',
    });
  }

  return results;
}

export async function getDashboardStats() {
  const tickets = await getTickets();
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  return {
    totalTickets: tickets.length,
    inProgress: tickets.filter(t => t.status === 'In Progress').length,
    inReview: tickets.filter(t => t.status === 'In Review').length,
    blocked: tickets.filter(t => t.status === 'Blocked').length,
    doneThisWeek: tickets.filter(t => {
      if (t.status !== 'Done') return false;
      const updated = new Date(String(t.updated));
      return updated >= weekAgo;
    }).length,
    reviewQueue: tickets.filter(t => t.status === 'In Review' && t.reviewStatus === 'Pending').length,
  };
}
