import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { db } from '@/lib/db';
import { PredictionEngine } from '@/lib/prediction-engine';

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

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file provided' },
        { status: 400 }
      );
    }

    if (!file.name.endsWith('.csv')) {
      return NextResponse.json(
        { success: false, message: 'Only CSV files are allowed' },
        { status: 400 }
      );
    }

    // Read CSV file
    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      return NextResponse.json(
        { success: false, message: 'CSV file must contain at least a header and one data row' },
        { status: 400 }
      );
    }

    // Parse CSV
    const headers = lines[0].split(',').map(h => h.trim());
    const students = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      if (values.length !== headers.length) continue;

      const student: any = {};
      headers.forEach((header, index) => {
        const value = values[index];
        
        // Convert numeric fields
        if (header === 'currentYear' || header === 'assignmentsMissed' || header === 'priorBacklogs') {
          student[header] = parseInt(value) || 0;
        } else if (header === 'gpa' || header === 'attendancePercentage' || 
                   header === 'distanceFromCollegeKm' || header === 'monthlyIncome' ||
                   header === 'extracurricularHours' || header === 'mentalHealthScore') {
          student[header] = parseFloat(value) || 0;
        } else {
          student[header] = value;
        }
      });

      // Validate required fields
      if (!student.name || !student.email || !student.program) {
        continue;
      }

      students.push(student);
    }

    if (students.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No valid student data found in CSV' },
        { status: 400 }
      );
    }

    // Create batch job
    const batchJob = await db.batchJob.create({
      data: {
        userId: payload.userId,
        fileName: file.name,
        totalRows: students.length,
        status: 'PROCESSING',
        startedAt: new Date(),
      },
    });

    // Process students in background
    processStudentsAsync(payload.userId, students, batchJob.id);

    return NextResponse.json({
      success: true,
      message: `Upload started for ${students.length} students`,
      jobId: batchJob.id,
      count: students.length,
    });
  } catch (error: any) {
    console.error('Error uploading students:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function processStudentsAsync(userId: string, students: any[], jobId: string) {
  try {
    let processedCount = 0;
    
    for (const studentData of students) {
      try {
        // Check if student already exists
        const existingStudent = await db.student.findUnique({
          where: { email: studentData.email },
        });

        if (!existingStudent) {
          // Create new student
          const student = await db.student.create({
            data: {
              ...studentData,
              uploadedBy: userId,
            },
          });

          // Generate prediction
          await PredictionEngine.generatePrediction(student.id);
        }

        processedCount++;
        
        // Update batch job progress
        await db.batchJob.update({
          where: { id: jobId },
          data: {
            processedRows: processedCount,
            progress: (processedCount / students.length) * 100,
          },
        });
      } catch (error) {
        console.error('Error processing student:', studentData.email, error);
      }
    }

    // Mark batch job as completed
    await db.batchJob.update({
      where: { id: jobId },
      data: {
        status: 'COMPLETED',
        progress: 100,
        completedAt: new Date(),
      },
    });
  } catch (error) {
    console.error('Error in batch processing:', error);
    
    // Mark batch job as failed
    await db.batchJob.update({
      where: { id: jobId },
      data: {
        status: 'FAILED',
        error: 'Processing failed',
        completedAt: new Date(),
      },
    });
  }
}