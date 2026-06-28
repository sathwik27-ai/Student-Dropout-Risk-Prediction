import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { db } from '@/lib/db';

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

    const body = await request.json();
    const { targetCareer, program, currentYear, totalYears, interests, goals } = body;

    if (!targetCareer || !program) {
      return NextResponse.json(
        { success: false, message: 'Target career and program are required' },
        { status: 400 }
      );
    }

    // Generate a simple roadmap
    const roadmapContent = {
      title: `${targetCareer} Career Roadmap`,
      description: `Personalized roadmap for ${program} students targeting ${targetCareer}`,
      semesters: [
        {
          semester: `Year ${currentYear || 1} - Fall`,
          focus: `Core ${program} fundamentals`,
          courses: [
            `${program} Core Course`,
            'Mathematics',
            'Communication Skills'
          ],
          projects: [
            'Foundation Project',
            'Team Collaboration Project'
          ],
          certifications: [
            'Basic Programming Certification'
          ],
          skills: [
            'Problem Solving',
            'Critical Thinking',
            'Teamwork'
          ],
          resources: [
            `${program} Textbook`,
            'Online Tutorials'
          ],
          weeklyHours: 20,
          milestones: [
            'Complete core courses',
            'Submit first project',
            'Achieve target GPA'
          ]
        },
        {
          semester: `Year ${currentYear || 1} - Spring`,
          focus: `Advanced ${program} topics`,
          courses: [
            `Advanced ${program} Course`,
            'Elective Course',
            'Lab Work'
          ],
          projects: [
            'Advanced Project',
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
      ]
    };

    // Save roadmap to database
    const roadmap = await db.roadmap.create({
      data: {
        studentId: payload.userId,
        title: roadmapContent.title,
        description: roadmapContent.description,
        targetCareer,
        program,
        currentYear: currentYear || 1,
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
    console.error('Error generating roadmap:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to generate roadmap: ' + error.message },
      { status: 500 }
    );
  }
}