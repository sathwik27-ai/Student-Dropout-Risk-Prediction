import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { db } from '@/lib/db';

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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

    const userId = params.id;

    // Check if user is trying to delete their own account or is an admin
    if (payload.userId !== userId && payload.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized to delete this account' },
        { status: 403 }
      );
    }

    // Check if user exists
    const existingUser = await db.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Delete related data first (cascade delete)
    await db.prediction.deleteMany({
      where: { studentId: userId },
    });

    await db.roadmap.deleteMany({
      where: { studentId: userId },
    });

    await db.student.deleteMany({
      where: { uploadedBy: userId },
    });

    await db.batch_job.deleteMany({
      where: { userId: userId },
    });

    // Finally delete the user
    await db.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({
      success: true,
      message: 'Account deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting account:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
