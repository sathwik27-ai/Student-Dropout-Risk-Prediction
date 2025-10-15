import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { gpa, attendance, assignmentsMissed } = body;

    // Update user data
    const updatedUser = await db.user.update({
      where: { id: session.user.id },
      data: {
        gpa: gpa || 0,
        attendancePercentage: attendance || 0,
        assignmentsMissed: assignmentsMissed || 0,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Student data updated successfully',
      user: updatedUser,
    });
  } catch (error: any) {
    console.error('Error updating student data:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
