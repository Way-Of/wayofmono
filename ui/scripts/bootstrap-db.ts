import { PrismaClient } from '@prisma/client'
import path from 'path'
import fs from 'fs'
import matter from 'gray-matter'
import { getConfig } from '../src/lib/env'
import { buildPathIndex } from '../src/lib/tickets-fs'

const config = getConfig()
const THOUGHTS_ROOT = config.thoughtsRoot
const PROJECTS = config.projects

const prisma = new PrismaClient()

const SKIP_FILES = new Set(['personal-ticket-template.md'])

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

async function bootstrap() {
  const existingCount = await prisma.ticket.count()
  if (existingCount > 0) {
    console.log(`[bootstrap] DB already has ${existingCount} tickets. Skipping bootstrap.`)
    console.log('[bootstrap] Run with --force to re-import.')
    await prisma.$disconnect()
    return
  }

  let imported = 0
  let skipped = 0

  for (const project of PROJECTS) {
    const ticketsDir = path.join(THOUGHTS_ROOT, project, 'shared', 'tickets')
    if (!fs.existsSync(ticketsDir)) {
      console.log(`[bootstrap] No tickets dir for ${project}: ${ticketsDir}`)
      continue
    }

    const files = fs.readdirSync(ticketsDir)
    for (const file of files) {
      if (!file.endsWith('.md')) continue
      if (SKIP_FILES.has(file)) continue

      const ticketId = file.replace(/\.md$/, '')
      const filePath = path.join(ticketsDir, file)

      try {
        const content = fs.readFileSync(filePath, 'utf8')
        const { data: frontmatter, content: body } = matter(content)

        const ticket: Record<string, any> = {
          id: ticketId,
          description: body || '',
          personalBreakdown: [],
          linkedDocs: [],
          filePath: path.relative(THOUGHTS_ROOT, filePath),
          project,
        }

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
          update: {},
        })

        imported++
        process.stdout.write('.')
      } catch (err) {
        console.error(`\n[bootstrap] Error importing ${file}:`, err)
        skipped++
      }
    }
  }

  const index = buildPathIndex()
  console.log(`\n[bootstrap] Done! Imported ${imported} tickets, skipped ${skipped}, indexed ${index.size} paths.`)

  await prisma.$disconnect()
}

const force = process.argv.includes('--force')
if (force) {
  console.log('[bootstrap] --force: clearing existing tickets...')
  prisma.ticket.deleteMany({}).then(() => bootstrap())
} else {
  bootstrap()
}
