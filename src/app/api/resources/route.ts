import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';

// GET /api/resources - Get all resources with optional filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as 'BOOK' | 'VIDEO' | 'COURSE' | null;
    const topic = searchParams.get('topic');
    const search = searchParams.get('search');

    // Build where clause
    const where: any = {
      isActive: true,
    };

    if (type) {
      where.type = type;
    }

    if (topic) {
      where.topic = {
        contains: topic,
        mode: 'insensitive'
      };
    }

    if (search) {
      where.OR = [
        {
          title: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          description: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          author: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          provider: {
            contains: search,
            mode: 'insensitive'
          }
        }
      ];
    }

    const resources = await db.resource.findMany({
      where,
      orderBy: [
        { rating: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    return NextResponse.json({
      success: true,
      resources
    });
  } catch (error) {
    console.error('Error fetching resources:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch resources' },
      { status: 500 }
    );
  }
}

// POST /api/resources - Create a new resource (teachers only)
export async function POST(request: NextRequest) {
  try {
    const session = await auth(request);
    
    if (!session?.user || session.user.role !== 'TEACHER') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized. Only teachers can add resources.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      title,
      type,
      topic,
      description,
      url,
      author,
      provider,
      duration,
      difficulty,
      rating,
      tags
    } = body;

    // Validate required fields
    if (!title || !type || !topic) {
      return NextResponse.json(
        { success: false, message: 'Title, type, and topic are required' },
        { status: 400 }
      );
    }

    const resource = await db.resource.create({
      data: {
        title,
        type,
        topic,
        description,
        url,
        author,
        provider,
        duration,
        difficulty,
        rating,
        tags
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Resource created successfully',
      resource
    });
  } catch (error) {
    console.error('Error creating resource:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create resource' },
      { status: 500 }
    );
  }
}