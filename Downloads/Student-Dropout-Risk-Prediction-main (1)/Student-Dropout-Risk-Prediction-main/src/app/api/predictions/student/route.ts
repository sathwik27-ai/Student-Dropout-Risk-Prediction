import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { PredictionEngine } from '@/lib/prediction-engine';

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

    // Get predictions for the student
    const predictions = await db.prediction.findMany({
      where: {
        studentId: payload.userId,
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
      })),
    });
  } catch (error: any) {
    console.error('Error fetching student predictions:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    // Generate new prediction for the student
    const prediction = await PredictionEngine.generatePrediction(payload.userId);

    return NextResponse.json({
      success: true,
      prediction: {
        id: prediction.id,
        riskPercent: prediction.riskPercent,
        riskCategory: prediction.riskCategory,
        features: prediction.features,
        explanation: prediction.explanation,
        createdAt: prediction.createdAt,
      }
    });
  } catch (error: any) {
    console.error('Error generating student prediction:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to generate prediction' },
      { status: 500 }
    );
  }
}
