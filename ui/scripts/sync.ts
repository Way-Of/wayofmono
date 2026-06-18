import chokidar from 'chokidar'
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { PrismaClient } from '@prisma/client'
import matter from 'gray-matter'
import { getConfig } from '../src/lib/env'

const config = getConfig()
const THOUGHTS_ROOT = config.thoughtsRoot

const prisma = new PrismaClient()

const DEBOUNCE_MS = 300
const recentWrites = new Map<string, { hash: string; timestamp: number }>()

const FRONTMATTER_TO_CAMEL: Record<string, string> = {
  'title': 'title',
  'type': 'type',
  'priority': 'priority',
  'status': 'status',
  'assignee': 'assignee',
  'reporter': 'reporter',
  'project': 'project',
  'namespace': 'namespace',
  'category': 'category',
  'parent_ticket': 'parentTicket',
  'shared_tickets': 'sharedTickets',
  'pr_url': 'prUrl',
  'github_issue': 'githubIssue',
  'created': 'created',
  'updated': 'updated',
  'reviewed_by': 'reviewedBy',
  'reviewed_at': 'reviewedAt',
  'review_status': 'reviewStatus',
  'review_comments': 'reviewComments',
}

const ARRAY_FIELDS = new Set(['sharedTickets', 'personalBreakdown', 'linkedDocs'])

function shouldSkip(filePath: string, content: string): boolean {
  const hash = crypto.createHash('md5').update(content).digest('hex')
  const existing = recentWrites.get(filePath)
  if (existing && existing.hash === hash && (Date.now() - existing.timestamp) < DEBOUNCE_MS) {
    return true
  }
  recentWrites.set(filePath, { hash, timestamp: Date.now() })
  return false
}

function parseJsonArray(val: string | null | undefined): string[] {
  if (!val) return []
  try {
    const parsed = JSON.parse(val)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function serializeArray(val: string[] | undefined): string {
  return JSON.stringify(val ?? [])
}

async function syncFile(filePath: string, event: string) {
  const ticketId = path.basename(filePath, '.md')
  if (!ticketId || ticketId === 'personal-ticket-template') return

  if (event === 'unlink') {
    await prisma.ticket.delete({ where: { id: ticketId } }).catch(() => {})
    console.log(`[sync] Deleted ticket ${ticketId} from DB (file removed)`)
    return
  }

  let content: string
  try {
    content = fs.readFileSync(filePath, 'utf8')
  } catch {
    return
  }

  if (shouldSkip(filePath, content)) return

  try {
    const { data: frontmatter, content: body } = matter(content)

    const ticket: Record<string, any> = {
      id: ticketId,
      description: body || '',
      personalBreakdown: [],
      linkedDocs: [],
      filePath: path.relative(THOUGHTS_ROOT, filePath),
    }

    let project = 'wayofmono'
    const relPath = path.relative(THOUGHTS_ROOT, filePath)
    const parts = relPath.split(path.sep)
    if (parts.length >= 1 && config.projects.includes(parts[0])) {
      project = parts[0]
    }
    ticket.project = project

    for (const [fmKey, camelKey] of Object.entries(FRONTMATTER_TO_CAMEL)) {
      let val = frontmatter[fmKey]
      if (val === undefined || val === null) continue

      if (camelKey === 'assignee' || camelKey === 'reporter') {
        val = String(val).replace(/^@/, '')
      }

      if (ARRAY_FIELDS.has(camelKey)) {
        ticket[camelKey] = Array.isArray(val) ? val : []
      } else {
        ticket[camelKey] = val
      }
    }

    await prisma.ticket.upsert({
      where: { id: ticketId },
      update: {
        title: ticket.title || ticketId,
        type: ticket.type || 'Task',
        priority: ticket.priority || 'Medium',
        status: ticket.status || 'Backlog',
        assignee: ticket.assignee || null,
        reporter: ticket.reporter || null,
        project: ticket.project,
        namespace: ticket.namespace || null,
        category: ticket.category || null,
        parentTicket: ticket.parentTicket || null,
        sharedTickets: serializeArray(ticket.sharedTickets),
        prUrl: ticket.prUrl || null,
        githubIssue: ticket.githubIssue || null,
        created: ticket.created || null,
        updated: ticket.updated || null,
        reviewedBy: ticket.reviewedBy || null,
        reviewedAt: ticket.reviewedAt || null,
        reviewStatus: ticket.reviewStatus || null,
        reviewComments: ticket.reviewComments || null,
        description: ticket.description,
        personalBreakdown: serializeArray(ticket.personalBreakdown),
        linkedDocs: serializeArray(ticket.linkedDocs),
        filePath: ticket.filePath || null,
      },
      create: {
        id: ticketId,
        title: ticket.title || ticketId,
        type: ticket.type || 'Task',
        priority: ticket.priority || 'Medium',
        status: ticket.status || 'Backlog',
        assignee: ticket.assignee || null,
        reporter: ticket.reporter || null,
        project: ticket.project,
        namespace: ticket.namespace || null,
        category: ticket.category || null,
        parentTicket: ticket.parentTicket || null,
        sharedTickets: serializeArray(ticket.sharedTickets),
        prUrl: ticket.prUrl || null,
        githubIssue: ticket.githubIssue || null,
        created: ticket.created || null,
        updated: ticket.updated || null,
        reviewedBy: ticket.reviewedBy || null,
        reviewedAt: ticket.reviewedAt || null,
        reviewStatus: ticket.reviewStatus || null,
        reviewComments: ticket.reviewComments || null,
        description: ticket.description,
        personalBreakdown: serializeArray(ticket.personalBreakdown),
        linkedDocs: serializeArray(ticket.linkedDocs),
        filePath: ticket.filePath || null,
      },
    })

    console.log(`[sync] ${event === 'add' ? 'Added' : 'Updated'} ticket ${ticketId}`)
  } catch (err) {
    console.error(`[sync] Error syncing ${filePath}:`, err)
  }
}

const watchPattern = path.join(THOUGHTS_ROOT, '**', 'shared', 'tickets', '*.md')

console.log(`[sync] Watching: ${watchPattern}`)

const watcher = chokidar.watch(watchPattern, {
  ignoreInitial: true,
  awaitWriteFinish: {
    stabilityThreshold: 200,
    pollInterval: 100,
  },
})

watcher
  .on('add', (filePath) => syncFile(filePath, 'add'))
  .on('change', (filePath) => syncFile(filePath, 'change'))
  .on('unlink', (filePath) => syncFile(filePath, 'unlink'))
  .on('error', (err) => console.error('[sync] Watcher error:', err))

process.on('SIGINT', async () => {
  console.log('\n[sync] Shutting down...')
  await watcher.close()
  await prisma.$disconnect()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  console.log('\n[sync] Shutting down...')
  await watcher.close()
  await prisma.$disconnect()
  process.exit(0)
})
