// src/app/api/scenarios/route.ts
import { prisma } from '../../../lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const scenarios = await prisma.scenario.findMany({
      include: {
        project: true,
      },
    })
    return NextResponse.json(scenarios)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: 'Failed to fetch scenarios', detail: message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (!body.name || !body.projectId) {
      return NextResponse.json(
        { error: 'name and projectId are required' },
        { status: 400 }
      )
    }

    const scenario = await prisma.scenario.create({
      data: {
        name: body.name,
        projectId: body.projectId,
        seed: body.seed ?? 0,
      },
    })
    return NextResponse.json(scenario, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: 'Failed to create scenario', detail: message }, { status: 500 })
  }
}
