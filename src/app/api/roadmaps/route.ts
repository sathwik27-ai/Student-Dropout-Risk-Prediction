import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import ZAI from 'z-ai-web-dev-sdk';

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
    const { targetCareer, program, currentYear, totalYears, interests, goals } = body;

    if (!targetCareer || !program) {
      return NextResponse.json(
        { success: false, message: 'Target career and program are required' },
        { status: 400 }
      );
    }

    // Get student data
    const student = await db.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        name: true,
        program: true,
        currentYear: true,
        gpa: true,
        department: true,
      }
    });

    if (!student) {
      return NextResponse.json(
        { success: false, message: 'Student not found' },
        { status: 404 }
      );
    }

    // Generate roadmap using template-based approach (fallback when AI is not available)
    const roadmapContent = generateDefaultRoadmap(targetCareer, program, currentYear || student.currentYear || 1, totalYears || 4, interests, goals);

    // Save roadmap to database
    const roadmap = await db.roadmap.create({
      data: {
        studentId: payload.userId,
        title: roadmapContent.title || `${targetCareer} Career Roadmap`,
        description: roadmapContent.description || `Personalized roadmap for ${targetCareer}`,
        targetCareer,
        program,
        currentYear: currentYear || student.currentYear || 1,
        totalYears: totalYears || 4,
        content: roadmapContent,
        status: 'DRAFT',
        generatedBy: 'template',
      }
    });

    return NextResponse.json({
      success: true,
      roadmap: {
        id: roadmap.id,
        title: roadmap.title,
        description: roadmap.description,
        targetCareer: roadmap.targetCareer,
        program: roadmap.program,
        content: roadmap.content,
        status: roadmap.status,
        createdAt: roadmap.createdAt,
      }
    });

  } catch (error: any) {
    console.error('Roadmap generation error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to generate roadmap' },
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

    // Get roadmaps for the student
    const roadmaps = await db.roadmap.findMany({
      where: { studentId: payload.userId },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    return NextResponse.json({
      success: true,
      roadmaps
    });

  } catch (error: any) {
    console.error('Get roadmaps error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

function generateDefaultRoadmap(targetCareer: string, program: string, currentYear: number, totalYears: number, interests?: string, goals?: string) {
  const semesters = [];
  
  for (let year = currentYear; year <= totalYears; year++) {
    semesters.push(
      {
        semester: `Year ${year} - Fall`,
        focus: `Core ${program} fundamentals`,
        courses: [
          `${program} Core Course ${year}`,
          'Mathematics',
          'Communication Skills'
        ],
        projects: [
          `Foundation Project ${year}`,
          'Team Collaboration Project'
        ],
        certifications: [
          year === 1 ? 'Basic Programming' : 'Advanced Certification'
        ],
        skills: [
          'Problem Solving',
          'Team Work',
          'Technical Writing'
        ],
        resources: [
          'Textbook 1',
          'Online Course Platform'
        ],
        weeklyHours: 20,
        milestones: [
          'Complete core courses',
          'Submit first project',
          'Achieve target GPA'
        ]
      },
      {
        semester: `Year ${year} - Spring`,
        focus: `Advanced ${program} topics`,
        courses: [
          `Advanced ${program} Course`,
          'Elective Course',
          'Lab Work'
        ],
        projects: [
          `Advanced Project ${year}`,
          'Research Project'
        ],
        certifications: [
          'Industry Certification'
        ],
        skills: [
          'Advanced Technical Skills',
          'Research Methods',
          'Presentation Skills'
        ],
        resources: [
          'Advanced Textbook',
          'Industry Resources'
        ],
        weeklyHours: 25,
        milestones: [
          'Complete advanced courses',
          'Present research project',
          'Obtain certification'
        ]
      }
    );
  }

  return {
    title: `${targetCareer} Career Roadmap`,
    description: `Personalized ${totalYears}-year roadmap for ${program} students targeting ${targetCareer}${interests ? ` with interests in ${interests}` : ''}${goals ? ` and goals: ${goals}` : ''}`,
    semesters
  };
}