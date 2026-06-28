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

    // Get the latest prediction for the user
    const prediction = await db.prediction.findFirst({
      where: {
        studentId: payload.userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!prediction) {
      return NextResponse.json(
        { success: false, message: 'No predictions found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      prediction: {
        id: prediction.id,
        riskPercent: prediction.riskPercent,
        riskCategory: prediction.riskCategory,
        features: prediction.features,
        explanation: prediction.explanation,
        createdAt: prediction.createdAt,
      },
    });
  } catch (error: any) {
    console.error('Error fetching latest prediction:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}