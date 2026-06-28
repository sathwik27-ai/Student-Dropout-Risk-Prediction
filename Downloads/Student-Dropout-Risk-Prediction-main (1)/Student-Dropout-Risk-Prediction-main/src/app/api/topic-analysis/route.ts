import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

function getTokenFromRequest(request: NextRequest) {
  return (
    request.cookies.get('auth-token')?.value ||
    request.headers.get('authorization')?.replace('Bearer ', '') ||
    null
  );
}

// POST /api/topic-analysis - Analyze student performance for a specific topic
export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    const payload = token ? verifyToken(token) : null;

    if (!payload || payload.role !== 'TEACHER') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized. Only teachers can analyze topics.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { topic } = body;

    if (!topic) {
      return NextResponse.json(
        { success: false, message: 'Topic is required' },
        { status: 400 }
      );
    }

    // Get all students
    const students = await db.student.findMany({
      include: {
        predictions: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    // Filter students by topic (simplified - in real app, this would be more sophisticated)
    const topicStudents = students.filter(student => 
      student.program.toLowerCase().includes(topic.toLowerCase()) ||
      student.department?.toLowerCase().includes(topic.toLowerCase())
    );

    // Calculate performance metrics
    const weakStudents = topicStudents.filter(student => student.gpa < 3.0);
    const strongStudents = topicStudents.filter(student => student.gpa >= 3.5);
    const avgGPA = topicStudents.length > 0 
      ? topicStudents.reduce((sum, student) => sum + student.gpa, 0) / topicStudents.length 
      : 0;
    
    const avgUnderstanding = Math.min(Math.round(avgGPA * 25), 100); // Convert GPA to understanding percentage

    // Get risk distribution
    const riskDistribution = {
      low: topicStudents.filter(s => s.predictions[0]?.riskCategory === 'LOW').length,
      medium: topicStudents.filter(s => s.predictions[0]?.riskCategory === 'MEDIUM').length,
      high: topicStudents.filter(s => s.predictions[0]?.riskCategory === 'HIGH').length,
    };

    // Get recommended resources for this topic
    const resources = await db.resource.findMany({
      where: {
        topic: {
          contains: topic,
          mode: 'insensitive'
        },
        isActive: true
      },
      orderBy: { rating: 'desc' },
      take: 10
    });

    const analysis = {
      topic,
      totalStudents: topicStudents.length,
      weakStudents: weakStudents.length,
      strongStudents: strongStudents.length,
      avgUnderstanding,
      avgGPA: Math.round(avgGPA * 100) / 100,
      riskDistribution,
      weakStudentDetails: weakStudents.map(student => ({
        id: student.id,
        name: student.name,
        email: student.email,
        program: student.program,
        currentYear: student.currentYear,
        gpa: student.gpa,
        attendancePercentage: student.attendancePercentage,
        riskCategory: student.predictions[0]?.riskCategory,
        riskPercent: student.predictions[0]?.riskPercent
      })),
      recommendations: {
        books: resources.filter(r => r.type === 'BOOK'),
        videos: resources.filter(r => r.type === 'VIDEO'),
        courses: resources.filter(r => r.type === 'COURSE')
      }
    };

    return NextResponse.json({
      success: true,
      analysis
    });
  } catch (error) {
    console.error('Error analyzing topic:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to analyze topic' },
      { status: 500 }
    );
  }
}