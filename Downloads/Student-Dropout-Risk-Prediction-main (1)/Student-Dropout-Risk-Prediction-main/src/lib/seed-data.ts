import { db } from './db';
import { hashPassword } from './auth';

export async function seedDatabase() {
  try {
    // Create sample users
    const teacherPassword = await hashPassword('teacher123');
    const studentPassword = await hashPassword('student123');

    // Create teacher
    const teacher = await db.user.upsert({
      where: { email: 'teacher@university.edu' },
      update: {},
      create: {
        email: 'teacher@university.edu',
        name: 'Dr. Sarah Johnson',
        passwordHash: teacherPassword,
        role: 'TEACHER',
        program: 'Computer Science',
        department: 'Computer Science',
        enrollmentYear: 2020,
      },
    });

    // Create sample students
    const students = [
      {
        email: 'alice@university.edu',
        name: 'Alice Johnson',
        passwordHash: studentPassword,
        role: 'STUDENT' as const,
        program: 'B.Tech',
        department: 'Computer Science',
        enrollmentYear: 2022,
        currentYear: 3,
        gpa: 3.8,
        attendancePercentage: 92,
        assignmentsMissed: 1,
      },
      {
        email: 'bob@university.edu',
        name: 'Bob Smith',
        passwordHash: studentPassword,
        role: 'STUDENT' as const,
        program: 'B.Tech',
        department: 'Computer Science',
        enrollmentYear: 2022,
        currentYear: 3,
        gpa: 2.4,
        attendancePercentage: 65,
        assignmentsMissed: 8,
      },
      {
        email: 'carol@university.edu',
        name: 'Carol Williams',
        passwordHash: studentPassword,
        role: 'STUDENT' as const,
        program: 'MBBS',
        department: 'Medical',
        enrollmentYear: 2021,
        currentYear: 2,
        gpa: 3.5,
        attendancePercentage: 88,
        assignmentsMissed: 2,
      },
    ];

    for (const studentData of students) {
      await db.user.upsert({
        where: { email: studentData.email },
        update: {},
        create: studentData,
      });
    }

    // Create sample resources
    const resources = [
      {
        title: 'Introduction to Algorithms',
        type: 'BOOK' as const,
        topic: 'Algorithms',
        description: 'Comprehensive guide to algorithms',
        author: 'Thomas H. Cormen',
        difficulty: 'Advanced',
        rating: 4.8,
        url: 'https://example.com/book1'
      },
      {
        title: 'Data Structures and Algorithm Analysis',
        type: 'BOOK' as const,
        topic: 'Data Structures',
        description: 'Practical approach to data structures',
        author: 'Mark Allen Weiss',
        difficulty: 'Intermediate',
        rating: 4.5,
        url: 'https://example.com/book2'
      },
      {
        title: 'Machine Learning Yearning',
        type: 'BOOK' as const,
        topic: 'Machine Learning',
        description: 'Beginner-friendly ML guide',
        author: 'Andrew Ng',
        difficulty: 'Beginner',
        rating: 4.7,
        url: 'https://example.com/book3'
      },
      {
        title: 'Data Structures Full Course',
        type: 'VIDEO' as const,
        topic: 'Data Structures',
        description: 'Complete course on data structures',
        provider: 'FreeCodeCamp',
        duration: '6 hours',
        rating: 4.9,
        url: 'https://www.youtube.com/watch?v=92S4zgXN17o'
      },
      {
        title: 'Algorithmic Thinking',
        type: 'VIDEO' as const,
        topic: 'Algorithms',
        description: 'MIT course on algorithmic thinking',
        provider: 'MIT OpenCourseWare',
        duration: '2 hours',
        rating: 4.7,
        url: 'https://www.youtube.com/watch?v=6Jx_IKu4d2M'
      },
      {
        title: 'Machine Learning Specialization',
        type: 'VIDEO' as const,
        topic: 'Machine Learning',
        description: 'Stanford ML specialization',
        provider: 'Stanford University',
        duration: '10 hours',
        rating: 4.8,
        url: 'https://www.youtube.com/watch?v=4qVRBY1Aa4M'
      },
      {
        title: 'Data Structures and Algorithms',
        type: 'COURSE' as const,
        topic: 'Data Structures',
        description: 'University of California San Diego course',
        provider: 'Coursera',
        instructor: 'University of California San Diego',
        duration: '6 months',
        difficulty: 'Intermediate',
        rating: 4.7,
        url: 'https://www.coursera.org/specializations/data-structures-algorithms'
      },
      {
        title: 'Machine Learning',
        type: 'COURSE' as const,
        topic: 'Machine Learning',
        description: 'Andrew Ng\'s famous ML course',
        provider: 'Coursera',
        instructor: 'Andrew Ng',
        duration: '11 weeks',
        difficulty: 'Beginner',
        rating: 4.9,
        url: 'https://www.coursera.org/learn/machine-learning'
      },
      {
        title: 'Full Stack Web Development',
        type: 'COURSE' as const,
        topic: 'Web Development',
        description: 'Complete web development bootcamp',
        provider: 'Udemy',
        instructor: 'Angela Yu',
        duration: '4 months',
        difficulty: 'Beginner',
        rating: 4.8,
        url: 'https://www.udemy.com/course/the-complete-web-developer-in-2023/'
      },
    ];

    for (const resourceData of resources) {
      await db.resource.upsert({
        where: { title: resourceData.title },
        update: {},
        create: resourceData,
      });
    }

    console.log('Database seeded successfully');
    return { teacher, students };
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}