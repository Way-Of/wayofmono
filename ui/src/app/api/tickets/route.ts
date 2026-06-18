import { NextRequest, NextResponse } from 'next/server'
import { getAllTickets, upsertTicket, getTicketById, TicketRecord } from '@/lib/tickets-db'
import { writeTicketFile, findTicketPathById, parseTicketFile } from '@/lib/tickets-fs'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const project = searchParams.get('project')
  const priority = searchParams.get('priority')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '50')

  let tickets = await getAllTickets()

  if (status && status !== 'all') {
    tickets = tickets.filter(t => t.status === status)
  }
  if (project && project !== 'all') {
    tickets = tickets.filter(t => t.project === project)
  }
  if (priority && priority !== 'all') {
    tickets = tickets.filter(t => t.priority === priority)
  }

  const total = tickets.length
  const start = (page - 1) * limit
  const paged = tickets.slice(start, start + limit)

  return NextResponse.json({
    tickets: paged,
    total,
    page,
    limit,
    sourceInfo: {
      requested: 'local',
      actual: 'local',
      tokenAvailable: false,
      tokenSource: null,
      reason: 'Prisma/SQLite read-cache',
    },
  })
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, updatedFields } = body

    if (!id || !updatedFields) {
      return NextResponse.json({ error: 'Missing id or updatedFields' }, { status: 400 })
    }

    const existing = await getTicketById(id)
    if (!existing) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    const allowedFields = [
      'status', 'priority', 'type', 'assignee', 'reporter',
      'reviewStatus', 'reviewComments', 'category', 'namespace',
      'title', 'description', 'prUrl', 'githubIssue',
    ]

    const filtered: Record<string, any> = {}
    for (const [key, val] of Object.entries(updatedFields)) {
      if (allowedFields.includes(key)) {
        filtered[key] = val
      }
    }

    const merged: TicketRecord = {
      ...existing,
      ...filtered,
      updated: new Date().toISOString().split('T')[0],
    }

    if (merged.reviewStatus === 'Approved') {
      merged.status = 'Done'
    }
    if (merged.reviewStatus === 'Changes Requested') {
      merged.status = 'Changes Requested'
    }

    const wrote = writeTicketFile(merged)
    if (!wrote) {
      return NextResponse.json({ error: 'Failed to write ticket file' }, { status: 500 })
    }

    await upsertTicket(merged)

    return NextResponse.json({ success: true, ticket: merged })
  } catch (err) {
    console.error('PATCH /api/tickets error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      id, title, type, priority, status, assignee, reporter,
      project, namespace, category, description,
    } = body

    if (!id || !title || !project) {
      return NextResponse.json({ error: 'Missing required fields: id, title, project' }, { status: 400 })
    }

    const existing = await getTicketById(id)
    if (existing) {
      return NextResponse.json({ error: 'Ticket already exists' }, { status: 409 })
    }

    const newTicket: TicketRecord = {
      id,
      title,
      type: type || 'Task',
      priority: priority || 'Medium',
      status: status || 'Backlog',
      assignee: assignee || '',
      reporter: reporter || '',
      project,
      namespace: namespace || '',
      category: category || '',
      parentTicket: '',
      sharedTickets: [],
      prUrl: '',
      githubIssue: '',
      created: new Date().toISOString().split('T')[0],
      updated: new Date().toISOString().split('T')[0],
      reviewedBy: '',
      reviewedAt: '',
      reviewStatus: 'Pending',
      reviewComments: '',
      description: description || '',
      personalBreakdown: [],
      linkedDocs: [],
    }

    const wrote = writeTicketFile(newTicket)
    if (!wrote) {
      return NextResponse.json({ error: 'Failed to create ticket file' }, { status: 500 })
    }

    await upsertTicket(newTicket)

    return NextResponse.json({ success: true, ticket: newTicket }, { status: 201 })
  } catch (err) {
    console.error('POST /api/tickets error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
