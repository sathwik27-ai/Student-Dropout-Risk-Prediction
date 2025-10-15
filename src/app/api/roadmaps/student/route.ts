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

    // Get all roadmaps for the student
    const roadmaps = await db.roadmap.findMany({
      where: {
        studentId: payload.userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      roadmaps: roadmaps.map(roadmap => ({
        id: roadmap.id,
        title: roadmap.title,
        description: roadmap.description,
        targetCareer: roadmap.targetCareer,
        program: roadmap.program,
        currentYear: roadmap.currentYear,
        totalYears: roadmap.totalYears,
        content: roadmap.content,
        status: roadmap.status,
        isAccepted: roadmap.isAccepted,
        generatedBy: roadmap.generatedBy,
        createdAt: roadmap.createdAt,
        updatedAt: roadmap.updatedAt,
      })),
    });
  } catch (error: any) {
    console.error('Error fetching student roadmaps:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
