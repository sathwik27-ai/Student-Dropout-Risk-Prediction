import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { db } from '@/lib/db';

function getTokenFromRequest(request: NextRequest) {
  return (
    request.cookies.get('auth-token')?.value ||
    request.headers.get('authorization')?.replace('Bearer ', '') ||
    null
  );
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = getTokenFromRequest(request);
    const payload = token ? verifyToken(token) : null;
    
    if (!payload?.userId) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const roadmapId = params.id;

    // Check if roadmap exists and belongs to the user
    const roadmap = await db.roadmap.findFirst({
      where: {
        id: roadmapId,
        studentId: payload.userId,
      },
    });

    if (!roadmap) {
      return NextResponse.json(
        { success: false, message: 'Roadmap not found or unauthorized' },
        { status: 404 }
      );
    }

    // Delete the roadmap
    await db.roadmap.delete({
      where: { id: roadmapId },
    });

    return NextResponse.json({
      success: true,
      message: 'Roadmap deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting roadmap:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
