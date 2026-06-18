import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { getConfig } from './env'
import type { TicketRecord } from './tickets-db'

const config = getConfig()
const THOUGHTS_ROOT = config.thoughtsRoot
const PROJECTS = config.projects

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

const CAMEL_TO_FRONTMATTER: Record<string, string> = {
  'title': 'title',
  'type': 'type',
  'priority': 'priority',
  'status': 'status',
  'assignee': 'assignee',
  'reporter': 'reporter',
  'project': 'project',
  'namespace': 'namespace',
  'category': 'category',
  'parentTicket': 'parent_ticket',
  'sharedTickets': 'shared_tickets',
  'prUrl': 'pr_url',
  'githubIssue': 'github_issue',
  'created': 'created',
  'updated': 'updated',
  'reviewedBy': 'reviewed_by',
  'reviewedAt': 'reviewed_at',
  'reviewStatus': 'review_status',
  'reviewComments': 'review_comments',
}

const ARRAY_FIELDS = new Set(['sharedTickets', 'personalBreakdown', 'linkedDocs'])

export function parseTicketFile(filePath: string, project: string): TicketRecord | null {
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    const { data, content: body } = matter(content)

    const id = path.basename(filePath, '.md')

    const ticket: Record<string, any> = {
      id,
      project,
      description: body || '',
      personalBreakdown: [],
      linkedDocs: [],
    }

    for (const [fmKey, camelKey] of Object.entries(FRONTMATTER_TO_CAMEL)) {
      let val = data[fmKey]
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

    ticket.filePath = path.relative(THOUGHTS_ROOT, filePath)

    return ticket as TicketRecord
  } catch (err) {
    console.error(`Error parsing ticket file ${filePath}:`, err)
    return null
  }
}

export function writeTicketFile(ticket: TicketRecord): boolean {
  try {
    const filePath = resolveTicketPath(ticket)
    if (!filePath) return false

    const frontmatter: Record<string, any> = {}
    for (const [camelKey, fmKey] of Object.entries(CAMEL_TO_FRONTMATTER)) {
      let val = (ticket as any)[camelKey]
      if (val === undefined || val === null || val === '') continue

      if (camelKey === 'assignee' || camelKey === 'reporter') {
        if (val) val = `@${val}`
      }

      if (ARRAY_FIELDS.has(camelKey)) {
        val = Array.isArray(val) ? val : []
      }

      frontmatter[fmKey] = val
    }

    const newContent = matter.stringify(ticket.description || '', frontmatter)
    fs.writeFileSync(filePath, newContent, 'utf8')
    return true
  } catch (err) {
    console.error(`Error writing ticket file for ${ticket.id}:`, err)
    return false
  }
}

export function resolveTicketPath(ticket: TicketRecord): string | null {
  if (ticket.filePath) {
    const absolute = path.join(THOUGHTS_ROOT, ticket.filePath)
    if (fs.existsSync(absolute)) return absolute
  }

  const extMatch = ticket.id.match(/^([A-Z]+-\d+)/)
  if (!extMatch) return null

  for (const project of PROJECTS) {
    const ticketsDir = path.join(THOUGHTS_ROOT, project, 'shared', 'tickets')
    if (!fs.existsSync(ticketsDir)) continue
    const files = fs.readdirSync(ticketsDir)
    for (const file of files) {
      if (!file.endsWith('.md')) continue
      if (file.startsWith(extMatch[1])) {
        return path.join(ticketsDir, file)
      }
    }
  }

  return null
}

export function findTicketPathById(id: string): string | null {
  const prefix = id.match(/^([A-Z]+-\d+)/)?.[1]
  if (!prefix) return null

  for (const project of PROJECTS) {
    const ticketsDir = path.join(THOUGHTS_ROOT, project, 'shared', 'tickets')
    if (!fs.existsSync(ticketsDir)) continue
    const files = fs.readdirSync(ticketsDir)
    for (const file of files) {
      if (!file.endsWith('.md')) continue
      if (file.startsWith(prefix)) {
        return path.join(ticketsDir, file)
      }
    }
  }

  return null
}

export function walkAllTicketFiles(): TicketRecord[] {
  const tickets: TicketRecord[] = []
  const seenIds = new Set<string>()

  for (const project of PROJECTS) {
    const ticketsDir = path.join(THOUGHTS_ROOT, project, 'shared', 'tickets')
    if (!fs.existsSync(ticketsDir)) continue

    const files = fs.readdirSync(ticketsDir)
    for (const file of files) {
      if (!file.endsWith('.md')) continue
      if (SKIP_FILES.has(file)) continue

      const id = file.replace(/\.md$/, '')
      if (seenIds.has(id)) continue
      seenIds.add(id)

      const ticket = parseTicketFile(path.join(ticketsDir, file), project)
      if (ticket) tickets.push(ticket)
    }
  }

  return tickets
}

export function buildPathIndex(): Map<string, string> {
  const index = new Map<string, string>()

  for (const project of PROJECTS) {
    const ticketsDir = path.join(THOUGHTS_ROOT, project, 'shared', 'tickets')
    if (!fs.existsSync(ticketsDir)) continue

    const files = fs.readdirSync(ticketsDir)
    for (const file of files) {
      if (!file.endsWith('.md')) continue
      if (SKIP_FILES.has(file)) continue
      const id = file.replace(/\.md$/, '')
      if (!index.has(id)) {
        index.set(id, path.join(ticketsDir, file))
      }
    }
  }

  return index
}
