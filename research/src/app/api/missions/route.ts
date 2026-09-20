// src/app/api/missions/route.ts
import { prisma } from '../../../lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const missions = await prisma.mission.findMany({
      include: {
        project: true,
        scenario: true,
        tasks: true,
        risk_assessments: true,
      },
    })
    return NextResponse.json(missions)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: 'Failed to fetch missions', detail: message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (!body.objective || !body.projectId || !body.scenarioId) {
      return NextResponse.json(
        { error: 'objective, projectId, and scenarioId are required' },
        { status: 400 }
      )
    }

    const mission = await prisma.mission.create({
      data: {
        objective: body.objective,
        projectId: body.projectId,
        scenarioId: body.scenarioId,
        status: body.status ?? 'planned',
      },
    })
    return NextResponse.json(mission, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: 'Failed to create mission', detail: message }, { status: 500 })
  }
}
