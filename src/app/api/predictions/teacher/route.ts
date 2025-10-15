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

    // Get all predictions for students uploaded by this teacher
    const predictions = await db.prediction.findMany({
      where: {
        student: {
          uploadedBy: payload.userId,
        },
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            program: true,
            currentYear: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      predictions: predictions.map(prediction => ({
        id: prediction.id,
        riskPercent: prediction.riskPercent,
        riskCategory: prediction.riskCategory,
        features: prediction.features,
        explanation: prediction.explanation,
        modelVersion: prediction.modelVersion,
        createdAt: prediction.createdAt,
        student: prediction.student,
      })),
    });
  } catch (error: any) {
    console.error('Error fetching teacher predictions:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
