import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'No token provided' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    // Get the latest roadmap for the user
    const roadmap = await db.roadmap.findFirst({
      where: {
        studentId: payload.userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!roadmap) {
      return NextResponse.json(
        { success: false, message: 'No roadmap found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      roadmap: {
        id: roadmap.id,
        title: roadmap.title,
        description: roadmap.description,
        targetCareer: roadmap.targetCareer,
        content: roadmap.content,
        status: roadmap.status,
        isAccepted: roadmap.isAccepted,
        createdAt: roadmap.createdAt,
      },
    });
  } catch (error: any) {
    console.error('Error fetching latest roadmap:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}