import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

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

    // Only teachers can access student list
    if (payload.role === 'STUDENT') {
      return NextResponse.json(
        { success: false, message: 'Access denied' },
        { status: 403 }
      );
    }

    // Get all students
    const students = await db.student.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100
    });

    return NextResponse.json({
      success: true,
      students
    });

  } catch (error: any) {
    console.error('Get students error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
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

    // Only teachers can create students
    if (payload.role === 'STUDENT') {
      return NextResponse.json(
        { success: false, message: 'Access denied' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { 
      email, 
      name, 
      program, 
      department, 
      currentYear, 
      gpa, 
      attendancePercentage, 
      assignmentsMissed,
      socioEconomicStatus,
      distanceFromCollegeKm,
      monthlyIncome,
      priorBacklogs,
      extracurricularHours,
      mentalHealthScore
    } = body;

    // Validate required fields
    if (!email || !name || !program || !currentYear) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if student already exists
    const existingStudent = await db.student.findUnique({
      where: { email }
    });

    if (existingStudent) {
      return NextResponse.json(
        { success: false, message: 'Student with this email already exists' },
        { status: 400 }
      );
    }

    // Create student
    const student = await db.student.create({
      data: {
        email,
        name,
        program,
        department,
        currentYear,
        gpa: gpa || 0,
        attendancePercentage: attendancePercentage || 0,
        assignmentsMissed: assignmentsMissed || 0,
        socioEconomicStatus,
        distanceFromCollegeKm,
        monthlyIncome,
        priorBacklogs: priorBacklogs || 0,
        extracurricularHours: extracurricularHours || 0,
        mentalHealthScore: mentalHealthScore || 50,
        uploadedBy: payload.userId,
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Student created successfully',
      student
    });

  } catch (error: any) {
    console.error('Create student error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}