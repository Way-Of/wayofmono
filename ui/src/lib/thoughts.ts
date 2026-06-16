import fs from 'fs/promises';
import path from 'path';

const THOUGHTS_ROOT = process.env.THOUGHTS_ROOT || path.join(process.cwd(), '..', 'thoughts');
const PROJECTS = ['wayofmono', 'wow', 'opticat'] as const;
type ProjectSlug = (typeof PROJECTS)[number];

const GITHUB_REPO = 'Way-Of/f-rr-d';
const GITHUB_BRANCH = 'main';
const GITHUB_API_BASE = 'https://api.github.com';
const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com';

// Simple in-memory cache for GitHub fetches (5 min TTL)
const GITHUB_CACHE_TTL = 5 * 60 * 1000;
let githubCache: { tickets: Record<string, unknown>[]; timestamp: number; branch: string } | null = null;

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

export async function getDevelopers(source: 'local' | 'github' = 'local', branch = GITHUB_BRANCH, accessToken?: string) {
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

  if (source === 'local') {
    for (const project of PROJECTS) {
      const projectPath = path.join(THOUGHTS_ROOT, project);
      try {
        const entries = await fs.readdir(projectPath, { withFileTypes: true });
        for (const entry of entries) {
          if (!entry.isDirectory() || entry.name.startsWith('.') || entry.name === 'global' || entry.name === 'shared' || entry.name === 'docs' || entry.name === 'ticket-executor' || entry.name === 'enforcement-ticket' || entry.name === 'installation-tickets') continue;
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

    for (const dev of devs) {
      dev.projects = [...new Set(PROJECTS.filter(p => {
        try { fs.access(path.join(THOUGHTS_ROOT, p, dev.id)); return true; }
        catch { return false; }
      }))];
    }
  } else {
    // Fetch developers from GitHub by reading config.md files from each developer folder
    const projects = PROJECTS;
    
    for (const project of projects) {
      const devsPath = `thoughts/${project}`;
      const treeUrl = `${GITHUB_API_BASE}/repos/${GITHUB_REPO}/git/trees/${branch}:${devsPath}?recursive=1`;
      
      const headers: Record<string, string> = {};
      if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
      
      let treeData;
      try {
        const response = await fetch(treeUrl, { signal: AbortSignal.timeout(10000), headers });
        if (!response.ok) continue;
        treeData = await response.json();
      } catch { continue; }

      // Find developer directories (not global, shared, docs)
      const devDirs = new Set<string>();
      for (const item of treeData.tree || []) {
        if (item.type === 'tree') {
          const parts = item.path.split('/');
          if (parts.length === 3 && parts[0] === 'thoughts' && parts[1] === project) {
            const dirName = parts[2];
            if (!dirName.startsWith('.') && dirName !== 'global' && dirName !== 'shared' && dirName !== 'docs') {
              devDirs.add(dirName);
            }
          }
        }
      }

      // For each developer dir, try to read config.md
      for (const devName of devDirs) {
        if (seen.has(devName)) continue;
        seen.add(devName);

        let pincode = '';
        try {
          const rawUrl = `${GITHUB_RAW_BASE}/${GITHUB_REPO}/${branch}/thoughts/${project}/${devName}/config.md`;
          const rawHeaders: Record<string, string> = {};
          if (accessToken) rawHeaders['Authorization'] = `Bearer ${accessToken}`;
          const response = await fetch(rawUrl, { signal: AbortSignal.timeout(5000), headers: rawHeaders });
          if (response.ok) {
            const content = await response.text();
            const { frontmatter } = parseFrontmatter(content);
            pincode = String(frontmatter['pincode'] || '');
          }
        } catch { /* no config or failed */ }

        devs.push({
          id: devName,
          githubUsername: devName,
          displayName: devName.charAt(0).toUpperCase() + devName.slice(1),
          role: 'Developer',
          pincode,
          avatarUrl: '',
          projects: [project],
          isActive: true,
        });
      }
    }

    // Apply known role overrides
    const craig = devs.find(d => d.id === 'craig');
    if (craig) { craig.role = 'CTO'; craig.githubUsername = 'craigmartin'; }

    const zerwiz = devs.find(d => d.id === 'zerwiz');
    if (zerwiz) { zerwiz.role = 'Lead'; zerwiz.githubUsername = 'zerwiz'; }

    const andre = devs.find(d => d.id === 'andre');
    if (andre) { andre.role = 'Senior'; andre.githubUsername = 'Epileptickk'; }

    const tomas = devs.find(d => d.id === 'tomas');
    if (tomas) { tomas.role = 'Developer'; tomas.githubUsername = 'tomchi-debug'; }

    // Add all projects for each dev (from GitHub tree)
    for (const dev of devs) {
      dev.projects = [...new Set(PROJECTS.filter(p => {
        try { 
          // We can't easily check without another API call, so include all
          return true; 
        } catch { return false; }
      }))];
    }
  }

  return devs;
}

export async function getTickets(source: 'local' | 'github' = 'local', branch = GITHUB_BRANCH, accessToken?: string) {
  const tickets: Record<string, unknown>[] = [];
  const seenIds = new Set<string>();

  if (source === 'local') {
    for (const project of PROJECTS) {
      const ticketsDir = path.join(THOUGHTS_ROOT, project, 'shared', 'tickets');
      try {
        await walkDir(ticketsDir, tickets, seenIds, project);
      } catch { /* no tickets dir */ }
    }
  } else {
    // Check cache first (invalidate if branch changed)
    const now = Date.now();
    if (githubCache && githubCache.branch === branch && (now - githubCache.timestamp) < GITHUB_CACHE_TTL) {
      console.log('Using cached GitHub tickets for branch:', branch);
      return githubCache.tickets;
    }
    
    await walkGitHubDir(GITHUB_API_BASE, GITHUB_REPO, branch, tickets, seenIds, 'thoughts', accessToken);
    
    // Cache the results
    if (tickets.length > 0) {
      githubCache = { tickets: [...tickets], timestamp: now, branch };
    }
    
    // Fallback to local if GitHub returns no tickets
    if (tickets.length === 0) {
      console.warn('GitHub returned no tickets, falling back to local');
      for (const project of PROJECTS) {
        const ticketsDir = path.join(THOUGHTS_ROOT, project, 'shared', 'tickets');
        try {
          await walkDir(ticketsDir, tickets, seenIds, project);
        } catch { /* no tickets dir */ }
      }
    }
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

async function walkGitHubDir(apiBase: string, repo: string, branch: string, result: Record<string, unknown>[], seenIds: Set<string>, path = 'thoughts', accessToken?: string) {
  const treeUrl = `${apiBase}/repos/${repo}/git/trees/${branch}:${path}?recursive=1`;
  let treeData;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);
  
  const headers: Record<string, string> = {};
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
    headers['Accept'] = 'application/vnd.github+json';
  }
  
  try {
    const response = await fetch(treeUrl, { signal: controller.signal, headers });
    clearTimeout(timeoutId);
    if (!response.ok) {
      if (response.status === 404) return;
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }
    treeData = await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('Failed to fetch GitHub tree:', error);
    return;
  }

  for (const item of treeData.tree) {
    if (item.type === 'tree') {
      await walkGitHubDir(apiBase, repo, branch, result, seenIds, item.path, accessToken);
    } else if (item.type === 'blob' && item.path.endsWith('.md') && !item.path.endsWith('personal-ticket-template.md')) {
      const rawUrl = `${GITHUB_RAW_BASE}/${repo}/${branch}/${item.path}`;
      let content;
      
      const fileController = new AbortController();
      const fileTimeoutId = setTimeout(() => fileController.abort(), 5000);
      
      try {
        const response = await fetch(rawUrl, { signal: fileController.signal, headers });
        clearTimeout(fileTimeoutId);
        if (!response.ok) throw new Error(`Failed to fetch ${item.path}: ${response.status}`);
        content = await response.text();
      } catch (error) {
        clearTimeout(fileTimeoutId);
        console.error(`Failed to fetch GitHub file ${item.path}:`, error);
        continue;
      }

      const { frontmatter, body } = parseFrontmatter(content);
      
      const id = item.path.split('/').pop()?.replace(/\.md$/, '') || '';
      if (!id || seenIds.has(id)) continue;
      seenIds.add(id);

      const project = item.path.includes('wayofmono') ? 'wayofmono' :
                      item.path.includes('wow') ? 'wow' :
                      item.path.includes('opticat') ? 'opticat' : 'wayofmono';

      result.push({
        id,
        title: frontmatter['title'] || id,
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

  const results: {
    name: string;
    path: string;
    exists: boolean;
    skillCount: number;
    skills: Record<string, unknown>[];
    health: string;
  }[] = [];

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
