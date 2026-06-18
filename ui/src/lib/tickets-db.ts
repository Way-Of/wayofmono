import { prisma } from './prisma'
import { getConfig } from './env'

const config = getConfig()
const PROJECTS = config.projects

export interface TicketRecord {
  id: string
  title: string
  type: string
  priority: string
  status: string
  assignee: string
  reporter: string
  project: string
  namespace: string
  category: string
  parentTicket: string
  sharedTickets: string[]
  prUrl: string
  githubIssue: string
  created: string
  updated: string
  reviewedBy: string
  reviewedAt: string
  reviewStatus: string
  reviewComments: string
  description: string
  personalBreakdown: string[]
  linkedDocs: string[]
  filePath?: string
}

function mapRowToTicket(row: any): TicketRecord {
  return {
    id: row.id,
    title: row.title,
    type: row.type,
    priority: row.priority,
    status: row.status,
    assignee: row.assignee ?? '',
    reporter: row.reporter ?? '',
    project: row.project,
    namespace: row.namespace ?? '',
    category: row.category ?? '',
    parentTicket: row.parentTicket ?? '',
    sharedTickets: parseJsonArray(row.sharedTickets),
    prUrl: row.prUrl ?? '',
    githubIssue: row.githubIssue ?? '',
    created: row.created ?? '',
    updated: row.updated ?? '',
    reviewedBy: row.reviewedBy ?? '',
    reviewedAt: row.reviewedAt ?? '',
    reviewStatus: row.reviewStatus ?? 'Pending',
    reviewComments: row.reviewComments ?? '',
    description: row.description ?? '',
    personalBreakdown: parseJsonArray(row.personalBreakdown),
    linkedDocs: parseJsonArray(row.linkedDocs),
    filePath: row.filePath ?? undefined,
  }
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

function serializeArray(val: string[]): string {
  return JSON.stringify(val)
}

export async function getAllTickets(): Promise<TicketRecord[]> {
  const rows = await prisma.ticket.findMany({
    orderBy: [{ priority: 'desc' }, { created: 'desc' }],
  })
  return rows.map(mapRowToTicket)
}

export async function getTicketById(id: string): Promise<TicketRecord | null> {
  const row = await prisma.ticket.findUnique({ where: { id } })
  return row ? mapRowToTicket(row) : null
}

export async function upsertTicket(data: TicketRecord): Promise<TicketRecord> {
  const row = await prisma.ticket.upsert({
    where: { id: data.id },
    create: {
      id: data.id,
      title: data.title,
      type: data.type,
      priority: data.priority,
      status: data.status,
      assignee: data.assignee || null,
      reporter: data.reporter || null,
      project: data.project,
      namespace: data.namespace || null,
      category: data.category || null,
      parentTicket: data.parentTicket || null,
      sharedTickets: serializeArray(data.sharedTickets),
      prUrl: data.prUrl || null,
      githubIssue: data.githubIssue || null,
      created: data.created || null,
      updated: data.updated || null,
      reviewedBy: data.reviewedBy || null,
      reviewedAt: data.reviewedAt || null,
      reviewStatus: data.reviewStatus || null,
      reviewComments: data.reviewComments || null,
      description: data.description,
      personalBreakdown: serializeArray(data.personalBreakdown),
      linkedDocs: serializeArray(data.linkedDocs),
      filePath: data.filePath || null,
    },
    update: {
      title: data.title,
      type: data.type,
      priority: data.priority,
      status: data.status,
      assignee: data.assignee || null,
      reporter: data.reporter || null,
      project: data.project,
      namespace: data.namespace || null,
      category: data.category || null,
      parentTicket: data.parentTicket || null,
      sharedTickets: serializeArray(data.sharedTickets),
      prUrl: data.prUrl || null,
      githubIssue: data.githubIssue || null,
      created: data.created || null,
      updated: data.updated || null,
      reviewedBy: data.reviewedBy || null,
      reviewedAt: data.reviewedAt || null,
      reviewStatus: data.reviewStatus || null,
      reviewComments: data.reviewComments || null,
      description: data.description,
      personalBreakdown: serializeArray(data.personalBreakdown),
      linkedDocs: serializeArray(data.linkedDocs),
      filePath: data.filePath || null,
    },
  })
  return mapRowToTicket(row)
}

export async function deleteTicket(id: string): Promise<void> {
  await prisma.ticket.delete({ where: { id } }).catch(() => {})
}

export async function getTicketCount(): Promise<number> {
  return prisma.ticket.count()
}

export async function bootstrapTicketsFromFiles(
  walkFn: () => Promise<TicketRecord[]>
): Promise<number> {
  const count = await getTicketCount()
  if (count > 0) return count

  const tickets = await walkFn()
  for (const ticket of tickets) {
    await upsertTicket(ticket)
  }
  return tickets.length
}
