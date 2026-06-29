import { NextRequest, NextResponse } from 'next/server';
import { createUser } from '@/lib/auth';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  password: z.string().min(6),
  role: z.enum(['STUDENT', 'TEACHER']).optional(),
  program: z.string().optional(),
  department: z.string().optional(),
  enrollmentYear: z.number().min(2000).max(2030).optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Set environment variables if not already set
    if (!process.env.DATABASE_URL) {
      process.env.DATABASE_URL = 'file:./db/custom.db';
      console.log('Set DATABASE_URL fallback');
    }

    if (!process.env.JWT_SECRET) {
      process.env.JWT_SECRET = 'your-super-secret-jwt-key-change-in-production';
      console.log('Set JWT_SECRET fallback');
    }

    let body;
    try {
      body = await request.json();
    } catch (jsonError) {
      console.error('JSON parsing error:', jsonError);
      return NextResponse.json(
        { success: false, message: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    console.log('Registration attempt with data:', body);
    
    const validatedData = registerSchema.parse(body);
    console.log('Validation successful:', validatedData);

    const user = await createUser(validatedData);

    return NextResponse.json({
      success: true,
      message: 'User registered successfully',
      user,
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    
    if (error.message === 'User already exists') {
      return NextResponse.json(
        { success: false, message: 'User already exists' },
        { status: 400 }
      );
    }

    if (error instanceof z.ZodError) {
      const errorMessages = error.issues.map(issue => {
        if (issue.code === 'invalid_string' && issue.validation === 'email') {
          return `Invalid email format: ${issue.message}`;
        }
        return `${issue.path.join('.')}: ${issue.message}`;
      });
      
      return NextResponse.json(
        { 
          success: false, 
          message: 'Validation failed', 
          errors: errorMessages,
          details: error.issues 
        },
        { status: 400 }
      );
    }

    // More specific error handling
    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, message: 'Email already exists' },
        { status: 400 }
      );
    }

    if (error.message?.includes('Environment variable not found')) {
      return NextResponse.json(
        { success: false, message: 'Database configuration error. Please restart the server.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}