// src/app/api/createUser/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { did, email } = await req.json(); // Parse JSON body
    const user = await prisma.user.upsert({
      where: { id: did },
      update: {},
      create: {
        id: did,
        email: email || null,
      },
    });
    console.log(user);
    return NextResponse.json({ user }, { status: 200 }); // Use NextResponse for sending response
  } catch (error) {
    console.error('Failed to create user:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}