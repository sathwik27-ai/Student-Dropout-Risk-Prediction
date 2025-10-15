import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}

export async function createUser(userData: {
  email: string;
  name: string;
  password: string;
  role?: 'STUDENT' | 'TEACHER' | 'ADMIN';
  program?: string;
  department?: string;
  enrollmentYear?: number;
}) {
  const existingUser = await db.user.findUnique({
    where: { email: userData.email }
  });

  if (existingUser) {
    throw new Error('User already exists');
  }

  const passwordHash = await hashPassword(userData.password);

  const user = await db.user.create({
    data: {
      email: userData.email,
      name: userData.name,
      passwordHash,
      role: userData.role || 'STUDENT',
      program: userData.program,
      department: userData.department,
      enrollmentYear: userData.enrollmentYear,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      program: true,
      department: true,
      enrollmentYear: true,
      createdAt: true,
    }
  });

  return user;
}

export async function authenticateUser(email: string, password: string) {
  const user = await db.user.findUnique({
    where: { email }
  });

  if (!user) {
    throw new Error('Invalid credentials');
  }

  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) {
    throw new Error('Invalid credentials');
  }

  const { passwordHash, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

export async function getUserById(id: string) {
  return db.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      program: true,
      department: true,
      enrollmentYear: true,
      currentYear: true,
      gpa: true,
      attendancePercentage: true,
      assignmentsMissed: true,
      createdAt: true,
    }
  });
}