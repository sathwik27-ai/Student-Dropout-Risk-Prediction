import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/auth';
import { verifyToken } from '@/lib/auth';

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

    // Only teachers can create batch jobs
    if (payload.role === 'STUDENT') {
      return NextResponse.json(
        { success: false, message: 'Access denied' },
        { status: 403 }
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

    // Validate file type
    if (!file.name.endsWith('.csv')) {
      return NextResponse.json(
        { success: false, message: 'Only CSV files are allowed' },
        { status: 400 }
      );
    }

    // Read CSV content
    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      return NextResponse.json(
        { success: false, message: 'CSV file must contain header and at least one row of data' },
        { status: 400 }
      );
    }

    // Parse CSV
    const headers = lines[0].split(',').map(h => h.trim());
    const students = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      if (values.length === headers.length) {
        const student: any = {};
        headers.forEach((header, index) => {
          const value = values[index];
          // Convert numeric fields
          if (['gpa', 'attendancePercentage', 'assignmentsMissed', 'priorBacklogs', 'mentalHealthScore'].includes(header)) {
            student[header] = parseFloat(value) || 0;
          } else {
            student[header] = value;
          }
        });
        students.push(student);
      }
    }

    if (students.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No valid student data found in CSV' },
        { status: 400 }
      );
    }

    if (students.length > 1000) {
      return NextResponse.json(
        { success: false, message: 'Maximum 1000 students allowed per batch' },
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
      }
    });

    // Process batch asynchronously (in production, use a job queue)
    processBatchJob(batchJob.id, students);

    return NextResponse.json({
      success: true,
      jobId: batchJob.id,
      message: `Batch job created for ${students.length} students`,
      estimatedTime: Math.ceil(students.length / 10) // seconds
    });

  } catch (error: any) {
    console.error('Batch prediction error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function processBatchJob(jobId: string, students: any[]) {
  try {
    const results = [];
    
    for (let i = 0; i < students.length; i++) {
      const student = students[i];
      
      // Calculate prediction (same logic as single prediction)
      const prediction = calculateRiskScore(student);
      
      // Save student if not exists
      let savedStudent = await db.student.findUnique({
        where: { email: student.email }
      });
      
      if (!savedStudent) {
        savedStudent = await db.student.create({
          data: {
            email: student.email,
            name: student.name,
            program: student.program,
            department: student.department,
            currentYear: student.currentYear,
            gpa: student.gpa,
            attendancePercentage: student.attendancePercentage,
            assignmentsMissed: student.assignmentsMissed,
            priorBacklogs: student.priorBacklogs,
            mentalHealthScore: student.mentalHealthScore,
          }
        });
      }
      
      // Save prediction
      const savedPrediction = await db.prediction.create({
        data: {
          studentId: savedStudent.id,
          riskPercent: prediction.riskPercent,
          riskCategory: prediction.riskCategory,
          features: prediction.features,
          explanation: prediction.explanation,
        }
      });
      
      results.push({
        studentId: savedStudent.id,
        name: student.name,
        email: student.email,
        riskPercent: prediction.riskPercent,
        riskCategory: prediction.riskCategory,
        recommendations: prediction.explanation.recommendations
      });
      
      // Update progress
      await db.batchJob.update({
        where: { id: jobId },
        data: {
          processedRows: i + 1,
          progress: ((i + 1) / students.length) * 100,
        }
      });
    }
    
    // Generate CSV result
    const csvContent = generateCSV(results);
    
    // Save result file (in production, use cloud storage)
    const resultFileName = `batch_results_${jobId}.csv`;
    
    // Update job as completed
    await db.batchJob.update({
      where: { id: jobId },
      data: {
        status: 'COMPLETED',
        progress: 100,
        resultFile: resultFileName,
        completedAt: new Date(),
      }
    });
    
  } catch (error) {
    console.error('Batch processing error:', error);
    await db.batchJob.update({
      where: { id: jobId },
      data: {
        status: 'FAILED',
        error: error.message,
        completedAt: new Date(),
      }
    });
  }
}

function calculateRiskScore(student: any): { riskPercent: number; riskCategory: 'LOW' | 'MEDIUM' | 'HIGH'; features: any; explanation: any } {
  // Same logic as single prediction
  const gpa = student.gpa || 0;
  const attendance = student.attendancePercentage || 0;
  const assignmentsMissed = student.assignmentsMissed || 0;
  const priorBacklogs = student.priorBacklogs || 0;
  const mentalHealthScore = student.mentalHealthScore || 50;
  
  const gpaRisk = gpa < 2.0 ? 40 : gpa < 3.0 ? 25 : gpa < 3.5 ? 15 : 5;
  const attendanceRisk = attendance < 60 ? 35 : attendance < 75 ? 20 : attendance < 85 ? 10 : 5;
  const assignmentsRisk = Math.min(assignmentsMissed * 5, 30);
  const backlogRisk = priorBacklogs * 8;
  const mentalHealthRisk = mentalHealthScore < 30 ? 25 : mentalHealthScore < 50 ? 15 : 5;
  
  const totalRisk = Math.min(gpaRisk + attendanceRisk + assignmentsRisk + backlogRisk + mentalHealthRisk, 100);
  
  let riskCategory: 'LOW' | 'MEDIUM' | 'HIGH';
  if (totalRisk <= 33) {
    riskCategory = 'LOW';
  } else if (totalRisk <= 66) {
    riskCategory = 'MEDIUM';
  } else {
    riskCategory = 'HIGH';
  }
  
  const features = {
    gpa,
    attendance,
    assignmentsMissed,
    priorBacklogs,
    mentalHealthScore
  };
  
  const explanation = {
    topFactors: [
      { name: 'GPA', impact: gpaRisk },
      { name: 'Attendance', impact: attendanceRisk },
      { name: 'Assignments', impact: assignmentsRisk }
    ],
    recommendations: []
  };
  
  return {
    riskPercent: Math.round(totalRisk),
    riskCategory,
    features,
    explanation
  };
}

function generateCSV(results: any[]): string {
  const headers = ['Student ID', 'Name', 'Email', 'Risk Percent', 'Risk Category', 'Recommendations'];
  const rows = results.map(result => [
    result.studentId,
    result.name,
    result.email,
    result.riskPercent,
    result.riskCategory,
    result.recommendations.join('; ')
  ]);
  
  return [headers, ...rows].map(row => row.join(',')).join('\n');
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

    // Get batch jobs for the user
    const batchJobs = await db.batchJob.findMany({
      where: { userId: payload.userId },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    return NextResponse.json({
      success: true,
      batchJobs
    });

  } catch (error: any) {
    console.error('Get batch jobs error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}