import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const roadmapId = params.id;

    // Check if roadmap exists and belongs to the user
    const roadmap = await db.roadmap.findFirst({
      where: {
        id: roadmapId,
        studentId: session.user.id,
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
