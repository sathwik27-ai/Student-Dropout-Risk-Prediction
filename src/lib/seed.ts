import { db } from './db';
import { hashPassword } from './auth';

async function seedDatabase() {
  try {
    console.log('Seeding database...');

    // Create sample users
    const teacherPassword = await hashPassword('teacher123');
    const studentPassword = await hashPassword('student123');

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
      }
    });

    const student1 = await db.user.upsert({
      where: { email: 'alice@university.edu' },
      update: {},
      create: {
        email: 'alice@university.edu',
        name: 'Alice Johnson',
        passwordHash: studentPassword,
        role: 'STUDENT',
        program: 'B.Tech',
        department: 'Computer Science',
        enrollmentYear: 2022,
        currentYear: 3,
        gpa: 3.8,
        attendancePercentage: 92,
        assignmentsMissed: 1,
      }
    });

    const student2 = await db.user.upsert({
      where: { email: 'bob@university.edu' },
      update: {},
      create: {
        email: 'bob@university.edu',
        name: 'Bob Smith',
        passwordHash: studentPassword,
        role: 'STUDENT',
        program: 'B.Tech',
        department: 'Computer Science',
        enrollmentYear: 2022,
        currentYear: 3,
        gpa: 2.4,
        attendancePercentage: 65,
        assignmentsMissed: 8,
      }
    });

    // Create sample students (for teacher uploads)
    const sampleStudents = [
      {
        email: 'carol@university.edu',
        name: 'Carol Williams',
        program: 'MBBS',
        department: 'Medical',
        currentYear: 2,
        gpa: 3.5,
        attendancePercentage: 88,
        assignmentsMissed: 2,
        socioEconomicStatus: 'Middle',
        distanceFromCollegeKm: 5,
        monthlyIncome: 50000,
        priorBacklogs: 0,
        extracurricularHours: 10,
        mentalHealthScore: 75,
        uploadedBy: teacher.id,
      },
      {
        email: 'david@university.edu',
        name: 'David Brown',
        program: 'B.Tech',
        department: 'Electrical Engineering',
        currentYear: 3,
        gpa: 2.8,
        attendancePercentage: 70,
        assignmentsMissed: 5,
        socioEconomicStatus: 'Low',
        distanceFromCollegeKm: 20,
        monthlyIncome: 30000,
        priorBacklogs: 2,
        extracurricularHours: 5,
        mentalHealthScore: 60,
        uploadedBy: teacher.id,
      }
    ];

    for (const studentData of sampleStudents) {
      await db.student.upsert({
        where: { email: studentData.email },
        update: {},
        create: studentData
      });
    }

    // Skip predictions for now due to schema constraints
    // TODO: Fix schema relationships for predictions

    // Create sample resources
    const resources = [
      {
        title: 'Introduction to Algorithms',
        type: 'BOOK',
        topic: 'Algorithms',
        description: 'Comprehensive guide to algorithms',
        author: 'Thomas H. Cormen',
        difficulty: 'Advanced',
        rating: 4.8,
        url: 'https://example.com/book1'
      },
      {
        title: 'Data Structures and Algorithm Analysis',
        type: 'BOOK',
        topic: 'Data Structures',
        description: 'Practical approach to data structures',
        author: 'Mark Allen Weiss',
        difficulty: 'Intermediate',
        rating: 4.5,
        url: 'https://example.com/book2'
      },
      {
        title: 'Machine Learning Yearning',
        type: 'BOOK',
        topic: 'Machine Learning',
        description: 'Beginner-friendly ML guide',
        author: 'Andrew Ng',
        difficulty: 'Beginner',
        rating: 4.7,
        url: 'https://example.com/book3'
      },
      {
        title: 'Data Structures Full Course',
        type: 'VIDEO',
        topic: 'Data Structures',
        description: 'Complete video tutorial on data structures',
        provider: 'FreeCodeCamp',
        duration: '6 hours',
        difficulty: 'Intermediate',
        rating: 4.9,
        url: 'https://www.youtube.com/watch?v=92S4zgXN17o'
      },
      {
        title: 'Algorithmic Thinking',
        type: 'VIDEO',
        topic: 'Algorithms',
        description: 'MIT course on algorithmic thinking',
        provider: 'MIT OpenCourseWare',
        duration: '2 hours',
        difficulty: 'Advanced',
        rating: 4.7,
        url: 'https://www.youtube.com/watch?v=6Jx_IKu4d2M'
      },
      {
        title: 'Machine Learning Specialization',
        type: 'VIDEO',
        topic: 'Machine Learning',
        description: 'Stanford ML specialization',
        provider: 'Stanford University',
        duration: '10 hours',
        difficulty: 'Beginner',
        rating: 4.8,
        url: 'https://www.youtube.com/watch?v=4qVRBY1Aa4M'
      },
      {
        title: 'Data Structures and Algorithms',
        type: 'COURSE',
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
        type: 'COURSE',
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
        type: 'COURSE',
        topic: 'Web Development',
        description: 'Complete web development bootcamp',
        provider: 'Udemy',
        instructor: 'Angela Yu',
        duration: '4 months',
        difficulty: 'Beginner',
        rating: 4.8,
        url: 'https://www.udemy.com/course/the-complete-web-developer-in-2023/'
      }
    ];

    for (const resource of resources) {
      try {
        await db.resource.create({
          data: resource
        });
      } catch (error) {
        // Resource already exists, skip it
        console.log(`Resource "${resource.title}" already exists, skipping...`);
      }
    }

    // Create sample intervention templates
    const templates = [
      {
        name: 'High Risk Alert',
        description: 'Template for high-risk students',
        riskCategory: 'HIGH',
        subject: 'Urgent: Academic Performance Review',
        body: 'Dear Student, Your recent academic performance indicates you may be at risk. Please schedule a meeting with your academic advisor immediately.',
      },
      {
        name: 'Medium Risk Warning',
        description: 'Template for medium-risk students',
        riskCategory: 'MEDIUM',
        subject: 'Academic Performance Check-in',
        body: 'Dear Student, We noticed some areas where you might need additional support. Please consider attending tutoring sessions and office hours.',
      }
    ];

    for (const template of templates) {
      await db.interventionTemplate.create({
        data: template
      });
    }

    console.log('Database seeded successfully!');
    console.log('Teacher login: teacher@university.edu / teacher123');
    console.log('Student login: alice@university.edu / student123');
    console.log('Student login: bob@university.edu / student123');

  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

// Run seed function if called directly
if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { seedDatabase };