// src/app/api/createUser/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const user = await prisma.user.create({
      data: { id: userId }
    });

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    // Properly format the error object
    const errorMessage = error instanceof Error ? error.message : 'Failed to create user';
    console.error('Failed to create user:', { error: errorMessage });
    
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}