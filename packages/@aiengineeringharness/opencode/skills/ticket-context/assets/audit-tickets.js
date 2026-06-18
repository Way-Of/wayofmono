#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

let grayMatter;
try {
  grayMatter = require('gray-matter');
} catch (e) {
  console.error('❌ gray-matter not found. Install it: npm install -g gray-matter');
  process.exit(1);
}

const VALID_STATUSES = [
  'Backlog', 'Planned', 'Ready', 'In Progress',
  'Submitted for Review', 'In Review', 'Approved', 'Done',
  'Blocked', 'Changes Requested'
];
const VALID_PRIORITIES = ['Critical', 'High', 'Medium', 'Low'];
const VALID_TYPES = ['Feature', 'Bug', 'TechDebt', 'Epic', 'Improvement', 'Compliance', 'Task'];
const VALID_PROJECTS = ['WOMONO', 'WOW', 'OPT'];
const VALID_NAMESPACES = ['womono', 'wow', 'opticat'];
const VALID_CATEGORIES = ['feature', 'bug', 'infrastructure', 'compliance', 'system'];
const REQUIRED_FIELDS = ['title', 'type', 'priority', 'status', 'project', 'created'];

const args = process.argv.slice(2);
const ticketsDir = args.find(a => !a.startsWith('--')) || '.';
const doFix = args.includes('--fix');
const doHelp = args.includes('--help');

if (doHelp) {
  console.log(`
Ticket Frontmatter Audit & Fix Tool

Usage:
  node audit-tickets.js [path] [options]

Arguments:
  path        Path to tickets directory (default: current dir)

Options:
  --fix       Auto-fix issues (add missing frontmatter, fix invalid values)
  --help      Show this help

Description:
  Scans markdown files in the given directory, parses YAML frontmatter,
  and validates required fields. With --fix, it attempts to auto-repair
  tickets by extracting metadata from content.
`);
  process.exit(0);
}

function findTicketFiles(dir) {
  const results = [];
  const patterns = [/^[A-Z]+-\d+.*\.md$/, /^\d+.*\.md$/];
  
  if (!fs.existsSync(dir)) {
    return [];
  }
  
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const full = path.join(dir, file);
    if (fs.statSync(full).isFile() && file.endsWith('.md')) {
      if (file === 'TODO.md' || file === '.gitkeep' || file.includes('template')) continue;
      // Match either PREFIX-NNN pattern or numeric prefix pattern
      if (patterns.some(p => p.test(file))) {
        results.push(full);
      }
    }
  }
  return results.sort();
}

function parseMetaSection(content) {
  const meta = {};

  const createdMatch = content.match(/\*\*Created\*\*:\s*(\S+)/);
  if (createdMatch) meta.created = createdMatch[1];

  const priorityMatch = content.match(/\*\*Priority\*\*:\s*(\S+)/);
  if (priorityMatch) {
    const p = priorityMatch[1].toLowerCase();
    if (VALID_PRIORITIES.some(vp => vp.toLowerCase() === p)) {
      meta.priority = VALID_PRIORITIES.find(vp => vp.toLowerCase() === p) || priorityMatch[1];
    }
  }

  return meta;
}

function extractTitle(content) {
  const match = content.match(/^#\s+(.+)/m);
  return match ? match[1].trim() : '';
}

function extractStatusFromTasks(content) {
  const lines = content.split('\n');
  let total = 0;
  let done = 0;
  for (const line of lines) {
    if (/^\s*-\s*\[.\]\s/.test(line)) {
      total++;
      if (/^\s*-\s*\[x\]\s/i.test(line)) done++;
    }
  }
  if (total === 0) return null;
  if (done === total && total > 0) return 'Done';
  if (done > 0) return 'In Progress';
  return 'Backlog';
}

function buildFixFrontmatter(data, content, filename) {
  // Normalize all values (Date objects → ISO strings)
  const d = {};
  for (const [k, v] of Object.entries(data)) {
    if (v instanceof Date) d[k] = v.toISOString().slice(0, 10);
    else if (v === null || v === undefined) d[k] = '';
    else d[k] = v;
  }

  const title = d.title || extractTitle(content) || filename.replace(/\.md$/, '').replace(/[-_]/g, ' ');
  
  let type = d.type || 'Task';
  let priority = d.priority || 'Medium';
  let status = d.status || extractStatusFromTasks(content) || 'Backlog';
  
  // Fix invalid status values
  if (status === 'Open') status = 'Backlog';
  if (status === 'Closed') status = 'Done';

  const idMatch = filename.match(/^([A-Z]+)-(\d+)/);
  let project = d.project || 'WOMONO';
  let namespace = d.namespace || 'womono';
  
  if (idMatch) {
    const prefix = idMatch[1];
    if (prefix === 'WOW') { project = 'WOW'; namespace = 'wow'; }
    else if (prefix === 'OPT') { project = 'OPT'; namespace = 'opticat'; }
    else if (prefix === 'WOMONO') { project = 'WOMONO'; namespace = 'womono'; }
  }

  const metaSection = parseMetaSection(content);
  const created = d.created || metaSection.created || new Date().toISOString().slice(0, 10);

  return {
    title,
    type,
    priority,
    status,
    assignee: d.assignee || '',
    reporter: d.reporter || '',
    project,
    namespace,
    category: d.category || 'feature',
    parent_ticket: d.parent_ticket || '',
    shared_tickets: d.shared_tickets || '[]',
    pr_url: d.pr_url || '',
    github_issue: d.github_issue || '',
    created,
    updated: d.updated || new Date().toISOString().slice(0, 10),
    reviewed_by: d.reviewed_by || '',
    reviewed_at: d.reviewed_at || '',
    completed: d.completed || ''
  };
}

function auditFile(filepath, fix) {
  const filename = path.basename(filepath);
  const content = fs.readFileSync(filepath, 'utf-8');
  const lines = content.split('\n');
  const errors = [];
  const warnings = [];
  let parsed;
  let hasFrontmatter = false;
  let rawData = {};

  if (content.trimStart().startsWith('---')) {
    hasFrontmatter = true;
    try {
      parsed = grayMatter(content);
    } catch (e) {
      // Fallback: extract fields from raw frontmatter using regex
      const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
      if (fmMatch) {
        const fmContent = fmMatch[1];
        for (const line of fmContent.split('\n')) {
          const m = line.match(/^(\w+):\s*(.+)/);
          if (m) rawData[m[1]] = m[2].replace(/^"(.*)"$/, '$1');
        }
        parsed = { data: rawData, content: content.replace(/^---[\s\S]*?---\n*/, '') };
      } else {
        errors.push(`YAML parse error: ${e.message}`);
        return { file: filename, errors, warnings, hasFrontmatter, needsFix: true, content, data: rawData };
      }
    }
  } else {
    parsed = { data: {}, content: content };
  }

  const data = parsed.data;

  // Normalize Date objects to YYYY-MM-DD strings before validation
  for (const key of Object.keys(data)) {
    if (data[key] instanceof Date) {
      data[key] = data[key].toISOString().slice(0, 10);
    }
  }

  if (!hasFrontmatter) {
    errors.push('No YAML frontmatter found');
  }

  for (const field of REQUIRED_FIELDS) {
    if (!data[field] || data[field] === '') {
      errors.push(`Missing required field: ${field}`);
    }
  }

  if (data.status && !VALID_STATUSES.includes(data.status)) {
    if (fix && ['Open', 'Closed'].includes(data.status)) {
      warnings.push(`Invalid status will be fixed: "${data.status}" → ${data.status === 'Open' ? 'Backlog' : 'Done'}`);
    } else {
      errors.push(`Invalid status: "${data.status}" (valid: ${VALID_STATUSES.join(', ')})`);
    }
  }

  if (data.priority && !VALID_PRIORITIES.includes(data.priority)) {
    errors.push(`Invalid priority: "${data.priority}" (valid: ${VALID_PRIORITIES.join(', ')})`);
  }

  if (data.type && !VALID_TYPES.includes(data.type) && !String(data.type).includes('|')) {
    errors.push(`Invalid type: "${data.type}" (valid: ${VALID_TYPES.join(', ')})`);
  }

  if (data.project && !VALID_PROJECTS.includes(data.project)) {
    errors.push(`Invalid project: "${data.project}" (valid: ${VALID_PROJECTS.join(', ')})`);
  }

  const pipeFields = ['type', 'priority', 'status', 'project', 'namespace', 'category'];
  for (const field of pipeFields) {
    if (data[field] && String(data[field]).includes(' | ')) {
      warnings.push(`Pipe syntax in ${field}: "${data[field]}" (template placeholder)`);
    }
  }

  const dateFields = ['created', 'updated', 'reviewed_at', 'completed'];
  for (const field of dateFields) {
    const val = data[field];
    if (val === undefined || val === null || val === '') continue;
    const dateStr = String(val);
    if (!/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
      warnings.push(`Invalid date format for ${field}: "${dateStr}" (expected YYYY-MM-DD)`);
    }
  }

  const needsFix = errors.length > 0 || (hasFrontmatter && warnings.some(w => w.includes('Pipe syntax') || w.includes('Invalid') || w.includes('status will be fixed')));

  return { file: filename, errors, warnings, hasFrontmatter, data, content, needsFix, filepath };
}

function writeFixedTicket(filepath, report) {
  const filename = path.basename(filepath);
  const content = report.content;
  const fixedData = buildFixFrontmatter(report.data, content, filename);

  // Build YAML manually (avoids adding extra deps)
  let yaml = '---\n';
  for (const [key, val] of Object.entries(fixedData)) {
    if (typeof val === 'string') {
      if (val.includes(':') || val.includes('#') || val === '' || val.includes('[') || val.includes(']')) {
        yaml += `${key}: "${val}"\n`;
      } else {
        yaml += `${key}: ${val}\n`;
      }
    } else {
      yaml += `${key}: ${JSON.stringify(val)}\n`;
    }
  }
  yaml += '---\n\n';

  // Remove old frontmatter if it existed
  let body = content;
  if (report.hasFrontmatter) {
    try {
      const parsed = grayMatter(content);
      body = parsed.content;
    } catch (e) {
      body = content.replace(/^---[\s\S]*?---\n*/, '');
    }
  }

  // Clean leading blank lines from body
  body = body.replace(/^\n+/, '');

  fs.writeFileSync(filepath, yaml + body, 'utf-8');
  return fixedData;
}

// --- Main ---
const ticketFiles = findTicketFiles(ticketsDir);

if (ticketFiles.length === 0) {
  console.log(`No ticket files found in ${path.resolve(ticketsDir)}`);
  console.log('Expected filenames matching PREFIX-NNN-*.md or NNN-*.md patterns');
  process.exit(0);
}

console.log(`=== Ticket Frontmatter Audit ===`);
console.log(`Directory: ${path.resolve(ticketsDir)}`);
console.log(`Files found: ${ticketFiles.length}\n`);

let totalErrors = 0;
let totalWarnings = 0;
let fixedCount = 0;
const allReports = [];

for (const filepath of ticketFiles) {
  const report = auditFile(filepath, doFix);
  allReports.push(report);

  if (report.errors.length > 0) {
    totalErrors += report.errors.length;
    console.log(`  ✗ ${report.file} (${report.errors.length} errors)`);
    for (const err of report.errors) {
      console.log(`      ERROR: ${err}`);
    }
  } else if (report.warnings.length > 0) {
    totalWarnings += report.warnings.length;
    console.log(`  ⚠ ${report.file} (${report.warnings.length} warnings)`);
    for (const warn of report.warnings) {
      console.log(`      WARN: ${warn}`);
    }
  } else {
    console.log(`  ✓ ${report.file}`);
  }
}

console.log('\n=== Summary ===');
console.log(`Files scanned: ${ticketFiles.length}`);
console.log(`Errors: ${totalErrors}`);
console.log(`Warnings: ${totalWarnings}`);

if (doFix) {
  console.log('\n--- Fixing Tickets ---');
  for (const report of allReports) {
    if (report.needsFix) {
      const fixed = writeFixedTicket(report.filepath, report);
      console.log(`  ✓ Fixed: ${report.file} (status: ${fixed.status}, priority: ${fixed.priority})`);
      fixedCount++;
    }
  }
  console.log(`\nFixed: ${fixedCount} tickets`);
} else {
  console.log('\nRun with --fix to auto-repair tickets');
}

if (totalErrors > 0) {
  console.log('\n❌ Issues found');
  process.exit(1);
} else {
  console.log('\n✅ All clear');
  process.exit(0);
}