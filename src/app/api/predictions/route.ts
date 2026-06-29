import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

// Simple prediction model (in production, this would be a trained ML model)
function calculateRiskScore(student: any): { riskPercent: number; riskCategory: 'LOW' | 'MEDIUM' | 'HIGH'; features: any; explanation: any } {
  // Extract features
  const gpa = student.gpa || 0;
  const attendance = student.attendancePercentage || 0;
  const assignmentsMissed = student.assignmentsMissed || 0;
  const priorBacklogs = student.priorBacklogs || 0;
  const mentalHealthScore = student.mentalHealthScore || 50;
  
  // Calculate risk factors
  const gpaRisk = gpa < 2.0 ? 40 : gpa < 3.0 ? 25 : gpa < 3.5 ? 15 : 5;
  const attendanceRisk = attendance < 60 ? 35 : attendance < 75 ? 20 : attendance < 85 ? 10 : 5;
  const assignmentsRisk = Math.min(assignmentsMissed * 5, 30);
  const backlogRisk = priorBacklogs * 8;
  const mentalHealthRisk = mentalHealthScore < 30 ? 25 : mentalHealthScore < 50 ? 15 : 5;
  
  // Calculate total risk
  const totalRisk = Math.min(gpaRisk + attendanceRisk + assignmentsRisk + backlogRisk + mentalHealthRisk, 100);
  
  // Determine category
  let riskCategory: 'LOW' | 'MEDIUM' | 'HIGH';
  if (totalRisk <= 33) {
    riskCategory = 'LOW';
  } else if (totalRisk <= 66) {
    riskCategory = 'MEDIUM';
  } else {
    riskCategory = 'HIGH';
  }
  
  // Generate explanation
  const features = {
    gpa,
    attendance,
    assignmentsMissed,
    priorBacklogs,
    mentalHealthScore
  };
  
  const explanation = {
    topFactors: [
      { name: 'GPA', impact: gpaRisk, description: gpa < 3.0 ? 'Low GPA increases dropout risk' : 'Good GPA reduces risk' },
      { name: 'Attendance', impact: attendanceRisk, description: attendance < 75 ? 'Poor attendance is a strong indicator' : 'Regular attendance shows commitment' },
      { name: 'Assignments', impact: assignmentsRisk, description: assignmentsMissed > 3 ? 'Missing assignments indicates disengagement' : 'Consistent submission shows engagement' }
    ],
    recommendations: generateRecommendations(riskCategory, features)
  };
  
  return {
    riskPercent: Math.round(totalRisk),
    riskCategory,
    features,
    explanation
  };
}

function generateRecommendations(riskCategory: string, features: any): string[] {
  const recommendations = [];
  
  if (features.gpa < 3.0) {
    recommendations.push('Focus on improving GPA through tutoring and study groups');
  }
  
  if (features.attendance < 75) {
    recommendations.push('Improve class attendance and participation');
  }
  
  if (features.assignmentsMissed > 3) {
    recommendations.push('Complete all assignments on time and seek help when needed');
  }
  
  if (features.priorBacklogs > 0) {
    recommendations.push('Clear backlogged courses with academic support');
  }
  
  if (features.mentalHealthScore < 50) {
    recommendations.push('Seek counseling and mental health support services');
  }
  
  if (riskCategory === 'HIGH') {
    recommendations.push('Schedule immediate meeting with academic advisor');
    recommendations.push('Consider reduced course load for next semester');
  } else if (riskCategory === 'MEDIUM') {
    recommendations.push('Regular check-ins with faculty mentors');
    recommendations.push('Join study groups for difficult subjects');
  } else {
    recommendations.push('Maintain current academic performance');
    recommendations.push('Consider advanced coursework or research opportunities');
  }
  
  return recommendations;
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.cookies.get('auth-token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
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

    const body = await request.json();
    const { studentId, studentData } = body;

    let student;
    
    if (studentId) {
      // Use existing student
      student = await db.student.findUnique({
        where: { id: studentId }
      });
      
      if (!student) {
        return NextResponse.json(
          { success: false, message: 'Student not found' },
          { status: 404 }
        );
      }
    } else if (studentData) {
      // Use provided student data
      student = studentData;
    } else {
      return NextResponse.json(
        { success: false, message: 'Student ID or data required' },
        { status: 400 }
      );
    }

    // Calculate prediction
    const prediction = calculateRiskScore(student);

    // Save prediction to database
    const savedPrediction = await db.prediction.create({
      data: {
        studentId: studentId || 'temp',
        riskPercent: prediction.riskPercent,
        riskCategory: prediction.riskCategory,
        features: prediction.features,
        explanation: prediction.explanation,
      }
    });

    return NextResponse.json({
      success: true,
      prediction: {
        ...prediction,
        id: savedPrediction.id,
        createdAt: savedPrediction.createdAt
      }
    });

  } catch (error: any) {
    console.error('Prediction error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.cookies.get('auth-token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
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

    // Get predictions based on user role
    let predictions;
    
    if (payload.role === 'STUDENT') {
      // Students can only see their own predictions
      predictions = await db.prediction.findMany({
        where: { studentId: payload.userId },
        orderBy: { createdAt: 'desc' },
        take: 10
      });
    } else {
      // Teachers can see all predictions
      predictions = await db.prediction.findMany({
        orderBy: { createdAt: 'desc' },
        take: 50
      });
    }

    return NextResponse.json({
      success: true,
      predictions
    });

  } catch (error: any) {
    console.error('Get predictions error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}