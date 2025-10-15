'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GraduationCap, LogOut, Home, Users, TrendingUp, AlertTriangle, Upload, BarChart3, BookOpen, Download, Eye, Search, Filter, Brain, Video, PlayCircle, Star, FileText, Calendar, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface Student {
  id: string;
  name: string;
  email: string;
  program: string;
  currentYear: number;
  gpa: number;
  attendancePercentage: number;
  assignmentsMissed: number;
  riskPercent?: number;
  riskCategory?: string;
}

interface BatchJob {
  id: string;
  fileName: string;
  totalRows: number;
  processedRows: number;
  status: string;
  progress: number;
  createdAt: string;
}

export default function TeacherDashboard() {
  const { user, logout } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [batchJobs, setBatchJobs] = useState<BatchJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    highRiskStudents: 0,
    averageGPA: 0,
    averageAttendance: 0,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [bookSearchTerm, setBookSearchTerm] = useState('');
  const [videoSearchTerm, setVideoSearchTerm] = useState('');
  const [courseSearchTerm, setCourseSearchTerm] = useState('');
  const [selectedBook, setSelectedBook] = useState<any>(null);
  const [showBookDetails, setShowBookDetails] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [topicAnalysis, setTopicAnalysis] = useState<any>(null);
  const [analyzingTopic, setAnalyzingTopic] = useState(false);

  useEffect(() => {
    if (user) {
      // Check if user is a teacher
      if (user.role !== 'TEACHER') {
        // Redirect students to student dashboard
        window.location.href = '/student/dashboard';
        return;
      }
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // Fetch students
      const studentsResponse = await fetch('/api/students');
      if (studentsResponse.ok) {
        const studentsData = await studentsResponse.json();
        setStudents(studentsData.students || []);
        
        // Calculate stats
        const totalStudents = studentsData.students?.length || 0;
        const highRiskStudents = studentsData.students?.filter((s: Student) => 
          s.riskCategory === 'HIGH'
        ).length || 0;
        const averageGPA = studentsData.students?.reduce((sum: number, s: Student) => 
          sum + s.gpa, 0) / totalStudents || 0;
        const averageAttendance = studentsData.students?.reduce((sum: number, s: Student) => 
          sum + s.attendancePercentage, 0) / totalStudents || 0;

        setStats({
          totalStudents,
          highRiskStudents,
          averageGPA: averageGPA.toFixed(2),
          averageAttendance: averageAttendance.toFixed(0),
        });
      }

      // Fetch batch jobs
      const jobsResponse = await fetch('/api/batch-jobs');
      if (jobsResponse.ok) {
        const jobsData = await jobsResponse.json();
        setBatchJobs(jobsData.jobs || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload/students', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Successfully uploaded ${result.count} students`);
        fetchDashboardData();
      } else {
        const error = await response.json();
        alert(`Upload failed: ${error.message}`);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Upload failed. Please try again.');
    }
  };

  const getRiskColor = (category: string) => {
    switch (category) {
      case 'LOW': return 'text-green-600 bg-green-50';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-50';
      case 'HIGH': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const analyzeTopic = () => {
    if (!selectedTopic) return;
    
    setAnalyzingTopic(true);
    
    // Simulate API call
    setTimeout(() => {
      const topicStudents = students.filter(s => 
        s.program.toLowerCase().includes(selectedTopic.toLowerCase())
      );
      
      const weakStudents = topicStudents.filter(s => s.gpa < 3.0);
      const strongStudents = topicStudents.filter(s => s.gpa >= 3.5);
      
      const avgUnderstanding = topicStudents.length > 0 
        ? topicStudents.reduce((sum, s) => sum + s.gpa, 0) / topicStudents.length * 25
        : 0;
      
      setTopicAnalysis({
        topic: selectedTopic,
        totalStudents: topicStudents.length,
        weakStudents: weakStudents.length,
        strongStudents: strongStudents.length,
        avgUnderstanding: Math.round(avgUnderstanding),
        weakStudentDetails: weakStudents
      });
      
      setAnalyzingTopic(false);
    }, 800);
  };

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  const handleViewBookDetails = (book: any) => {
    setSelectedBook(book);
    setShowBookDetails(true);
  };

  const handleOpenExternalLink = (url: string) => {
    window.open(url, '_blank');
  };

  const handleSubmitFeedback = async () => {
    if (!feedbackMessage.trim()) return;
    
    setIsSubmittingFeedback(true);
    try {
      // Simulate AI response
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Here you would integrate with actual AI service
      alert('Thank you for your feedback! Our AI assistant will help you with your teaching and student management needs.');
      setFeedbackMessage('');
      setShowFeedbackModal(false);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Error submitting feedback. Please try again.');
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone and will remove all your data including uploaded students, batch jobs, and analytics.')) {
      return;
    }

    try {
      const response = await fetch(`/api/users/${user?.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Account deleted successfully. You will be redirected to the login page.');
        await logout();
        window.location.href = '/login';
      } else {
        const error = await response.json();
        alert(`Error deleting account: ${error.message}`);
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Error deleting account. Please try again.');
    }
  };

  // Department-based recommendations for teachers
  const getDepartmentRecommendations = (department: string) => {
    const recommendations = {
      'Computer Science': {
        books: [
          { id: 1, title: 'Introduction to Algorithms', author: 'Thomas H. Cormen', topic: 'Algorithms', difficulty: 'Advanced', rating: 4.8, description: 'Comprehensive guide to algorithms and data structures', url: 'https://mitpress.mit.edu/9780262046305/introduction-to-algorithms/' },
          { id: 2, title: 'Data Structures and Algorithm Analysis', author: 'Mark Allen Weiss', topic: 'Data Structures', difficulty: 'Intermediate', rating: 4.5, description: 'In-depth analysis of data structures and their implementations', url: 'https://www.pearson.com/us/higher-education/program/Weiss-Data-Structures-and-Algorithm-Analysis-in-C-4th-Edition/PGM1767999.html' },
          { id: 3, title: 'Clean Code', author: 'Robert C. Martin', topic: 'Software Engineering', difficulty: 'Intermediate', rating: 4.6, description: 'A Handbook of Agile Software Craftsmanship', url: 'https://www.oreilly.com/library/view/clean-code/9780136083238/' },
          { id: 4, title: 'System Design Interview', author: 'Alex Xu', topic: 'System Design', difficulty: 'Advanced', rating: 4.8, description: 'Complete guide to system design interviews', url: 'https://www.amazon.com/System-Design-Interview-insiders-Second/dp/B08CMF2CQF' },
          { id: 5, title: 'Cracking the Coding Interview', author: 'Gayle Laakmann McDowell', topic: 'Interview Prep', difficulty: 'Intermediate', rating: 4.7, description: '189 Programming Questions and Solutions', url: 'https://www.crackingthecodinginterview.com/' },
          { id: 6, title: 'Computer Networks', author: 'Andrew S. Tanenbaum', topic: 'Networking', difficulty: 'Advanced', rating: 4.5, description: 'Comprehensive guide to computer networking', url: 'https://www.pearson.com/us/higher-education/program/Tanenbaum-Computer-Networks-5th-Edition/PGM1767999.html' },
        ],
        videos: [
          { id: 1, title: 'Data Structures Full Course', channel: 'FreeCodeCamp', topic: 'Data Structures', duration: '6 hours', rating: 4.9, url: 'https://www.youtube.com/watch?v=RBSGKlAvoiM' },
          { id: 2, title: 'Algorithmic Thinking', channel: 'MIT OpenCourseWare', topic: 'Algorithms', duration: '2 hours', rating: 4.7, url: 'https://www.youtube.com/watch?v=HtSuA80QTyo' },
          { id: 3, title: 'Web Development Full Course', channel: 'freeCodeCamp.org', topic: 'Web Development', duration: '8 hours', rating: 4.9, url: 'https://www.youtube.com/watch?v=pQN-pnXPaVg' },
          { id: 4, title: 'System Design Interview', channel: 'Gaurav Sen', topic: 'System Design', duration: '3 hours', rating: 4.8, url: 'https://www.youtube.com/watch?v=UzLMhqg3WcY' },
          { id: 5, title: 'Python Programming', channel: 'Programming with Mosh', topic: 'Python', duration: '4 hours', rating: 4.8, url: 'https://www.youtube.com/watch?v=_uQrJ0TkZlc' },
          { id: 6, title: 'Database Design', channel: 'Caleb Curry', topic: 'Database', duration: '2 hours', rating: 4.6, url: 'https://www.youtube.com/watch?v=ztHopE5Wnpc' },
        ],
        courses: [
          { id: 1, title: 'Data Structures and Algorithms', provider: 'Coursera', instructor: 'University of California San Diego', topic: 'Data Structures', duration: '6 months', level: 'Intermediate', rating: 4.7, url: 'https://www.coursera.org/specializations/data-structures-algorithms' },
          { id: 2, title: 'Full Stack Web Development', provider: 'Udemy', instructor: 'Angela Yu', topic: 'Web Development', duration: '4 months', level: 'Beginner', rating: 4.8, url: 'https://www.udemy.com/course/the-complete-web-development-bootcamp/' },
          { id: 3, title: 'Python for Everybody', provider: 'Coursera', instructor: 'University of Michigan', topic: 'Python Programming', duration: '4 months', level: 'Beginner', rating: 4.8, url: 'https://www.coursera.org/specializations/python' },
          { id: 4, title: 'React Development', provider: 'Meta', instructor: 'Meta', topic: 'Frontend Development', duration: '3 months', level: 'Intermediate', rating: 4.7, url: 'https://www.coursera.org/professional-certificates/meta-front-end-developer' },
          { id: 5, title: 'AWS Cloud Practitioner', provider: 'AWS Training', instructor: 'Amazon Web Services', topic: 'Cloud Computing', duration: '2 months', level: 'Beginner', rating: 4.6, url: 'https://aws.amazon.com/training/digital/aws-cloud-practitioner/' },
          { id: 6, title: 'Database Systems', provider: 'Stanford', instructor: 'Jennifer Widom', topic: 'Database', duration: '3 months', level: 'Intermediate', rating: 4.8, url: 'https://www.coursera.org/learn/database-systems' },
        ]
      },
      'Engineering': {
        books: [
          { id: 1, title: 'Engineering Mathematics', author: 'K.A. Stroud', topic: 'Mathematics', difficulty: 'Intermediate', rating: 4.4, description: 'Comprehensive mathematics for engineers', url: 'https://www.amazon.com/Engineering-Mathematics-K-Stroud/dp/0230278921' },
          { id: 2, title: 'Mechanics of Materials', author: 'Ferdinand P. Beer', topic: 'Mechanics', difficulty: 'Advanced', rating: 4.5, description: 'Fundamentals of mechanics and materials', url: 'https://www.amazon.com/Mechanics-Materials-Ferdinand-P-Beer/dp/0073398233' },
          { id: 3, title: 'Thermodynamics', author: 'Yunus A. Cengel', topic: 'Thermodynamics', difficulty: 'Advanced', rating: 4.6, description: 'An engineering approach to thermodynamics', url: 'https://www.amazon.com/Thermodynamics-Engineering-Approach-Yunus-Cengel/dp/0073398179' },
          { id: 4, title: 'Electrical Engineering', author: 'Allan R. Hambley', topic: 'Electrical', difficulty: 'Intermediate', rating: 4.3, description: 'Principles and applications of electrical engineering', url: 'https://www.amazon.com/Electrical-Engineering-Principles-Applications-Allan/dp/0133116644' },
          { id: 5, title: 'Civil Engineering Materials', author: 'Peter A. Claisse', topic: 'Materials', difficulty: 'Intermediate', rating: 4.2, description: 'Understanding civil engineering materials', url: 'https://www.amazon.com/Civil-Engineering-Materials-Peter-Claisse/dp/0128027518' },
          { id: 6, title: 'Control Systems Engineering', author: 'Norman S. Nise', topic: 'Control Systems', difficulty: 'Advanced', rating: 4.4, description: 'Analysis and design of control systems', url: 'https://www.amazon.com/Control-Systems-Engineering-Norman-Nise/dp/1118170512' },
        ],
        videos: [
          { id: 1, title: 'Engineering Mathematics', channel: 'Khan Academy', topic: 'Mathematics', duration: '5 hours', rating: 4.7, url: 'https://www.youtube.com/watch?v=WUvTyaaNkzM' },
          { id: 2, title: 'Mechanics of Materials', channel: 'Structurefree', topic: 'Mechanics', duration: '3 hours', rating: 4.6, url: 'https://www.youtube.com/watch?v=U7cZ0Ht3uC4' },
          { id: 3, title: 'Thermodynamics', channel: 'LearnChemE', topic: 'Thermodynamics', duration: '4 hours', rating: 4.5, url: 'https://www.youtube.com/watch?v=7FIV2ZvqxmQ' },
          { id: 4, title: 'Electrical Engineering Basics', channel: 'The Engineering Mindset', topic: 'Electrical', duration: '2 hours', rating: 4.8, url: 'https://www.youtube.com/watch?v=J04L2i2wccg' },
          { id: 5, title: 'Civil Engineering', channel: 'Practical Engineering', topic: 'Civil', duration: '3 hours', rating: 4.7, url: 'https://www.youtube.com/watch?v=U7cZ0Ht3uC4' },
          { id: 6, title: 'Control Systems', channel: 'Brian Douglas', topic: 'Control', duration: '2 hours', rating: 4.6, url: 'https://www.youtube.com/watch?v=U7cZ0Ht3uC4' },
        ],
        courses: [
          { id: 1, title: 'Mechanical Engineering', provider: 'MIT OpenCourseWare', instructor: 'MIT', topic: 'Mechanical', duration: '4 months', level: 'Advanced', rating: 4.8, url: 'https://ocw.mit.edu/courses/mechanical-engineering/' },
          { id: 2, title: 'Electrical Engineering', provider: 'Coursera', instructor: 'Georgia Tech', topic: 'Electrical', duration: '6 months', level: 'Intermediate', rating: 4.7, url: 'https://www.coursera.org/specializations/electrical-engineering' },
          { id: 3, title: 'Civil Engineering', provider: 'edX', instructor: 'MIT', topic: 'Civil', duration: '5 months', level: 'Intermediate', rating: 4.6, url: 'https://www.edx.org/course/civil-engineering' },
          { id: 4, title: 'Chemical Engineering', provider: 'Coursera', instructor: 'University of Minnesota', topic: 'Chemical', duration: '4 months', level: 'Advanced', rating: 4.5, url: 'https://www.coursera.org/specializations/chemical-engineering' },
          { id: 5, title: 'Aerospace Engineering', provider: 'MIT OpenCourseWare', instructor: 'MIT', topic: 'Aerospace', duration: '6 months', level: 'Advanced', rating: 4.8, url: 'https://ocw.mit.edu/courses/aeronautics-and-astronautics/' },
          { id: 6, title: 'Biomedical Engineering', provider: 'Coursera', instructor: 'Johns Hopkins', topic: 'Biomedical', duration: '5 months', level: 'Advanced', rating: 4.7, url: 'https://www.coursera.org/specializations/biomedical-engineering' },
        ]
      },
      'Business': {
        books: [
          { id: 1, title: 'Business Model Generation', author: 'Alexander Osterwalder', topic: 'Business Strategy', difficulty: 'Intermediate', rating: 4.5, description: 'A handbook for visionaries and game changers', url: 'https://www.amazon.com/Business-Model-Generation-Visionaries-Changers/dp/0470876417' },
          { id: 2, title: 'The Lean Startup', author: 'Eric Ries', topic: 'Entrepreneurship', difficulty: 'Beginner', rating: 4.6, description: 'How today\'s entrepreneurs use continuous innovation', url: 'https://www.amazon.com/Lean-Startup-Entrepreneurs-Continuous-Innovation/dp/0307887898' },
          { id: 3, title: 'Good to Great', author: 'Jim Collins', topic: 'Management', difficulty: 'Intermediate', rating: 4.4, description: 'Why some companies make the leap and others don\'t', url: 'https://www.amazon.com/Good-Great-Jim-Collins/dp/0066620996' },
          { id: 4, title: 'Financial Management', author: 'Eugene F. Brigham', topic: 'Finance', difficulty: 'Advanced', rating: 4.3, description: 'Theory and practice of financial management', url: 'https://www.amazon.com/Financial-Management-Theory-Practice-Brigham/dp/130563229X' },
          { id: 5, title: 'Marketing Management', author: 'Philip Kotler', topic: 'Marketing', difficulty: 'Advanced', rating: 4.5, description: 'Analysis, planning, implementation and control', url: 'https://www.amazon.com/Marketing-Management-Philip-Kotler/dp/0132102927' },
          { id: 6, title: 'Operations Management', author: 'Jay Heizer', topic: 'Operations', difficulty: 'Intermediate', rating: 4.2, description: 'Sustainability and supply chain management', url: 'https://www.amazon.com/Operations-Management-Sustainability-Supply-Chain/dp/0134163515' },
        ],
        videos: [
          { id: 1, title: 'Business Strategy', channel: 'Harvard Business Review', topic: 'Strategy', duration: '2 hours', rating: 4.7, url: 'https://www.youtube.com/watch?v=U7cZ0Ht3uC4' },
          { id: 2, title: 'Entrepreneurship', channel: 'Y Combinator', topic: 'Startups', duration: '3 hours', rating: 4.8, url: 'https://www.youtube.com/watch?v=U7cZ0Ht3uC4' },
          { id: 3, title: 'Financial Analysis', channel: 'Corporate Finance Institute', topic: 'Finance', duration: '4 hours', rating: 4.6, url: 'https://www.youtube.com/watch?v=U7cZ0Ht3uC4' },
          { id: 4, title: 'Digital Marketing', channel: 'HubSpot Academy', topic: 'Marketing', duration: '3 hours', rating: 4.7, url: 'https://www.youtube.com/watch?v=U7cZ0Ht3uC4' },
          { id: 5, title: 'Supply Chain Management', channel: 'MIT OpenCourseWare', topic: 'Operations', duration: '2 hours', rating: 4.5, url: 'https://www.youtube.com/watch?v=U7cZ0Ht3uC4' },
          { id: 6, title: 'Leadership Skills', channel: 'TED', topic: 'Leadership', duration: '1 hour', rating: 4.8, url: 'https://www.youtube.com/watch?v=U7cZ0Ht3uC4' },
        ],
        courses: [
          { id: 1, title: 'Business Strategy', provider: 'Coursera', instructor: 'University of Virginia', topic: 'Strategy', duration: '4 months', level: 'Intermediate', rating: 4.7, url: 'https://www.coursera.org/specializations/business-strategy' },
          { id: 2, title: 'Entrepreneurship', provider: 'Udemy', instructor: 'Chris Haroun', topic: 'Startups', duration: '3 months', level: 'Beginner', rating: 4.6, url: 'https://www.udemy.com/course/complete-entrepreneurship-course/' },
          { id: 3, title: 'Financial Management', provider: 'Coursera', instructor: 'University of Illinois', topic: 'Finance', duration: '5 months', level: 'Advanced', rating: 4.8, url: 'https://www.coursera.org/specializations/financial-management' },
          { id: 4, title: 'Digital Marketing', provider: 'Google', instructor: 'Google', topic: 'Marketing', duration: '2 months', level: 'Beginner', rating: 4.7, url: 'https://learndigital.withgoogle.com/digitalgarage/course/digital-marketing' },
          { id: 5, title: 'Operations Management', provider: 'edX', instructor: 'MIT', topic: 'Operations', duration: '4 months', level: 'Intermediate', rating: 4.6, url: 'https://www.edx.org/course/operations-management' },
          { id: 6, title: 'Leadership Development', provider: 'Coursera', instructor: 'Northwestern University', topic: 'Leadership', duration: '3 months', level: 'Intermediate', rating: 4.8, url: 'https://www.coursera.org/specializations/leadership-development' },
        ]
      },
      'Medicine': {
        books: [
          { id: 1, title: 'Gray\'s Anatomy', author: 'Henry Gray', topic: 'Anatomy', difficulty: 'Advanced', rating: 4.8, description: 'The anatomical basis of clinical practice', url: 'https://www.amazon.com/Grays-Anatomy-Anatomical-Clinical-Practice/dp/0702052302' },
          { id: 2, title: 'Harrison\'s Principles of Internal Medicine', author: 'J. Larry Jameson', topic: 'Internal Medicine', difficulty: 'Advanced', rating: 4.7, description: 'Comprehensive internal medicine textbook', url: 'https://www.amazon.com/Harrisons-Principles-Internal-Medicine-Twenty-First/dp/1264268505' },
          { id: 3, title: 'Robbins and Cotran Pathologic Basis of Disease', author: 'Vinay Kumar', topic: 'Pathology', difficulty: 'Advanced', rating: 4.6, description: 'Fundamental pathology textbook', url: 'https://www.amazon.com/Robbins-Cotran-Pathologic-Basis-Disease/dp/0323531138' },
          { id: 4, title: 'First Aid for the USMLE Step 1', author: 'Tao Le', topic: 'USMLE Prep', difficulty: 'Advanced', rating: 4.9, description: 'Essential preparation for medical licensing exam', url: 'https://www.amazon.com/First-Aid-USMLE-Step-2023/dp/1264285108' },
          { id: 5, title: 'Clinical Microbiology Made Ridiculously Simple', author: 'Mark Gladwin', topic: 'Microbiology', difficulty: 'Intermediate', rating: 4.5, description: 'Easy-to-understand microbiology concepts', url: 'https://www.amazon.com/Clinical-Microbiology-Made-Ridiculously-Simple/dp/1935660150' },
          { id: 6, title: 'Pharmacology', author: 'Richard A. Harvey', topic: 'Pharmacology', difficulty: 'Advanced', rating: 4.4, description: 'Comprehensive pharmacology textbook', url: 'https://www.amazon.com/Pharmacology-Richard-Harvey/dp/0323398187' },
        ],
        videos: [
          { id: 1, title: 'Anatomy and Physiology', channel: 'Crash Course', topic: 'Anatomy', duration: '5 hours', rating: 4.8, url: 'https://www.youtube.com/watch?v=U7cZ0Ht3uC4' },
          { id: 2, title: 'Medical School Lectures', channel: 'Lecturio Medical', topic: 'Medicine', duration: '10 hours', rating: 4.7, url: 'https://www.youtube.com/watch?v=U7cZ0Ht3uC4' },
          { id: 3, title: 'Pathology', channel: 'Pathology Simplified', topic: 'Pathology', duration: '3 hours', rating: 4.6, url: 'https://www.youtube.com/watch?v=U7cZ0Ht3uC4' },
          { id: 4, title: 'USMLE Preparation', channel: 'Boards and Beyond', topic: 'USMLE', duration: '4 hours', rating: 4.8, url: 'https://www.youtube.com/watch?v=U7cZ0Ht3uC4' },
          { id: 5, title: 'Clinical Skills', channel: 'Geeky Medics', topic: 'Clinical', duration: '2 hours', rating: 4.7, url: 'https://www.youtube.com/watch?v=U7cZ0Ht3uC4' },
          { id: 6, title: 'Pharmacology', channel: 'Dr. Najeeb', topic: 'Pharmacology', duration: '6 hours', rating: 4.9, url: 'https://www.youtube.com/watch?v=U7cZ0Ht3uC4' },
        ],
        courses: [
          { id: 1, title: 'Anatomy and Physiology', provider: 'Coursera', instructor: 'University of Michigan', topic: 'Anatomy', duration: '4 months', level: 'Intermediate', rating: 4.8, url: 'https://www.coursera.org/specializations/anatomy-physiology' },
          { id: 2, title: 'Medical Terminology', provider: 'edX', instructor: 'Doane University', topic: 'Medical Terms', duration: '2 months', level: 'Beginner', rating: 4.6, url: 'https://www.edx.org/course/medical-terminology' },
          { id: 3, title: 'Clinical Research', provider: 'Coursera', instructor: 'Johns Hopkins', topic: 'Research', duration: '3 months', level: 'Advanced', rating: 4.7, url: 'https://www.coursera.org/specializations/clinical-research' },
          { id: 4, title: 'Public Health', provider: 'Coursera', instructor: 'Johns Hopkins', topic: 'Public Health', duration: '4 months', level: 'Intermediate', rating: 4.8, url: 'https://www.coursera.org/specializations/public-health' },
          { id: 5, title: 'Global Health', provider: 'edX', instructor: 'Harvard', topic: 'Global Health', duration: '3 months', level: 'Intermediate', rating: 4.7, url: 'https://www.edx.org/course/global-health' },
          { id: 6, title: 'Medical Ethics', provider: 'Coursera', instructor: 'University of Manchester', topic: 'Ethics', duration: '2 months', level: 'Intermediate', rating: 4.5, url: 'https://www.coursera.org/learn/medical-ethics' },
        ]
      }
    };
    
    return recommendations[department] || recommendations['Computer Science'];
  };

  // Get department-specific recommendations
  const departmentRecs = getDepartmentRecommendations(user?.department || 'Computer Science');
  const books = departmentRecs.books;
  const videos = departmentRecs.videos;
  const courses = departmentRecs.courses;

  // Filter functions
  const filteredBooks = books.filter(book => 
    book.title.toLowerCase().includes(bookSearchTerm.toLowerCase()) ||
    book.author.toLowerCase().includes(bookSearchTerm.toLowerCase()) ||
    book.topic.toLowerCase().includes(bookSearchTerm.toLowerCase())
  );

  const filteredVideos = videos.filter(video => 
    video.title.toLowerCase().includes(videoSearchTerm.toLowerCase()) ||
    video.channel.toLowerCase().includes(videoSearchTerm.toLowerCase()) ||
    video.topic.toLowerCase().includes(videoSearchTerm.toLowerCase())
  );

  const filteredCourses = courses.filter(course => 
    course.title.toLowerCase().includes(courseSearchTerm.toLowerCase()) ||
    course.provider.toLowerCase().includes(courseSearchTerm.toLowerCase()) ||
    course.instructor.toLowerCase().includes(courseSearchTerm.toLowerCase()) ||
    course.topic.toLowerCase().includes(courseSearchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Teacher Dashboard</h1>
                <p className="text-sm text-purple-100">Welcome back, {user?.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-white/80 hover:text-white transition-colors">
                <Home className="h-5 w-5" />
              </Link>
              <Button 
                variant="outline" 
                size="sm"
                className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                onClick={() => setShowFeedbackModal(true)}
              >
                <Brain className="h-4 w-4 mr-2" />
                AI Help
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="bg-red-500/20 border-red-300/30 text-red-200 hover:bg-red-500/30"
                onClick={handleDeleteAccount}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Account
              </Button>
              <Badge className="bg-white/20 text-white border-white/30">{user?.department}</Badge>
              <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0">Teacher</Badge>
              <Button variant="outline" size="sm" className="bg-white/10 border-white/30 text-white hover:bg-white/20" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-100">Total Students</CardTitle>
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Users className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stats.totalStudents}</div>
              <p className="text-xs text-blue-100">In your classes</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500 to-pink-600 text-white border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-100">High Risk Students</CardTitle>
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stats.highRiskStudents}</div>
              <p className="text-xs text-red-100">Need immediate attention</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-100">Average GPA</CardTitle>
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stats.averageGPA}</div>
              <p className="text-xs text-green-100">Across all students</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-100">Average Attendance</CardTitle>
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <BarChart3 className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stats.averageAttendance}%</div>
              <p className="text-xs text-purple-100">Class attendance rate</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="students" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-gradient-to-r from-purple-100 to-pink-100 p-1 rounded-lg">
            <TabsTrigger value="students" className="bg-white/50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">Students</TabsTrigger>
            <TabsTrigger value="upload" className="bg-white/50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">Upload</TabsTrigger>
            <TabsTrigger value="predictions" className="bg-white/50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">Predictions</TabsTrigger>
            <TabsTrigger value="topics" className="bg-white/50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">Topic Analysis</TabsTrigger>
            <TabsTrigger value="resources" className="bg-white/50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">Resources</TabsTrigger>
            <TabsTrigger value="analytics" className="bg-white/50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="students" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Student Overview</span>
                </CardTitle>
                <CardDescription>
                  Monitor student performance and risk levels
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search students..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select>
                    <SelectTrigger className="w-full md:w-48">
                      <SelectValue placeholder="Filter by program" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Programs</SelectItem>
                      <SelectItem value="B.Tech">B.Tech</SelectItem>
                      <SelectItem value="MBBS">MBBS</SelectItem>
                      <SelectItem value="B.Com">B.Com</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-4">
                  {students.length > 0 ? (
                    students.map((student) => (
                      <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <h4 className="font-medium">{student.name}</h4>
                            <Badge variant="outline">{student.program}</Badge>
                            <Badge variant="outline">Year {student.currentYear}</Badge>
                          </div>
                          <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
                            <span>GPA: {student.gpa}</span>
                            <span>Attendance: {student.attendancePercentage}%</span>
                            <span>Missed: {student.assignmentsMissed} assignments</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          {student.riskCategory && (
                            <Badge className={getRiskColor(student.riskCategory)}>
                              {student.riskCategory} - {student.riskPercent}%
                            </Badge>
                          )}
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 mb-4">No students found</p>
                      <Button onClick={() => document.querySelector('[data-value="upload"]')?.click()} className="bg-gradient-to-r from-purple-600 to-pink-600">
                        Upload Student Data
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="upload" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Upload className="h-5 w-5" />
                  <span>Upload Student Data</span>
                </CardTitle>
                <CardDescription>
                  Upload CSV files with student information for bulk predictions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">
                    Drag and drop your CSV file here, or click to browse
                  </p>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload">
                    <Button asChild className="bg-gradient-to-r from-purple-600 to-pink-600">
                      <span>Choose File</span>
                    </Button>
                  </label>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">CSV Format Requirements:</h4>
                  <p className="text-sm text-gray-600 mb-2">
                    Your CSV file should include the following columns:
                  </p>
                  <div className="text-xs font-mono bg-white p-2 rounded border">
                    name, email, program, currentYear, gpa, attendancePercentage, assignmentsMissed
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Uploads */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Uploads</CardTitle>
                <CardDescription>
                  Track your batch upload history
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {batchJobs.length > 0 ? (
                    batchJobs.map((job) => (
                      <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{job.fileName}</h4>
                          <p className="text-sm text-gray-600">
                            {job.processedRows} / {job.totalRows} rows processed
                          </p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Badge variant={job.status === 'COMPLETED' ? 'default' : 'secondary'}>
                            {job.status}
                          </Badge>
                          {job.status === 'COMPLETED' && (
                            <Button size="sm" variant="outline">
                              <Download className="h-4 w-4 mr-1" />
                              Download Results
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No uploads yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="predictions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Batch Predictions</span>
                </CardTitle>
                <CardDescription>
                  Generate predictions for multiple students at once
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">Generate predictions for your students</p>
                  <Button onClick={() => window.location.href = '/api/predictions/batch'} className="bg-gradient-to-r from-purple-600 to-pink-600">
                    Generate Batch Predictions
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="topics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="h-5 w-5" />
                  <span>Topic Analysis</span>
                </CardTitle>
                <CardDescription>
                  Analyze student understanding across different topics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div>
                    <Label htmlFor="topic-select">Select Topic</Label>
                    <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a topic..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Data Structures">Data Structures</SelectItem>
                        <SelectItem value="Algorithms">Algorithms</SelectItem>
                        <SelectItem value="Machine Learning">Machine Learning</SelectItem>
                        <SelectItem value="Web Development">Web Development</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button
                      onClick={analyzeTopic}
                      disabled={!selectedTopic || analyzingTopic}
                      className="bg-gradient-to-r from-purple-600 to-pink-600"
                    >
                      {analyzingTopic ? 'Analyzing...' : 'Analyze Topic'}
                    </Button>
                  </div>
                </div>
                
                {topicAnalysis && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {topicAnalysis.totalStudents}
                        </div>
                        <div className="text-sm text-gray-600">Total Students</div>
                      </div>
                      <div className="text-center p-4 bg-red-50 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">
                          {topicAnalysis.weakStudents}
                        </div>
                        <div className="text-sm text-gray-600">Need Help</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {topicAnalysis.strongStudents}
                        </div>
                        <div className="text-sm text-gray-600">Excelled</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {topicAnalysis.avgUnderstanding}%
                        </div>
                        <div className="text-sm text-gray-600">Avg Understanding</div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold mb-4">Students Who Need Help</h3>
                      <div className="space-y-3">
                        {topicAnalysis.weakStudentDetails.map((student: any, index: number) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                            <div>
                              <p className="font-medium">{student.name}</p>
                              <p className="text-sm text-gray-500">
                                {student.program} - Year {student.currentYear}
                              </p>
                            </div>
                            <div className="text-right">
                              <span className="text-lg font-bold text-red-600">
                                {student.gpa}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resources" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Learning Resources</CardTitle>
                <CardDescription>
                  Manage and recommend learning materials
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="books" className="w-full">
                  <TabsList>
                    <TabsTrigger value="books">Books</TabsTrigger>
                    <TabsTrigger value="videos">Videos</TabsTrigger>
                    <TabsTrigger value="courses">Courses</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="books" className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {books.map((book) => (
                        <Card key={book.id} className="hover:shadow-lg transition-shadow">
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div className="w-12 h-16 bg-blue-100 rounded flex items-center justify-center">
                                <BookOpen className="h-6 w-6 text-blue-600" />
                              </div>
                              <div className="text-right">
                                <div className="flex items-center">
                                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                  <span className="ml-1 text-sm font-semibold">{book.rating}</span>
                                </div>
                                <span className="text-xs text-gray-500">{book.difficulty}</span>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <h3 className="font-semibold mb-1">{book.title}</h3>
                            <p className="text-sm text-gray-600 mb-2">by {book.author}</p>
                            <div className="flex items-center justify-between">
                              <Badge variant="outline">{book.topic}</Badge>
                              <Button size="sm" className="bg-gradient-to-r from-purple-600 to-pink-600">
                                Recommend
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="videos" className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {videos.map((video) => (
                        <Card key={video.id} className="hover:shadow-lg transition-shadow">
                          <CardContent className="p-6">
                            <div className="flex items-start space-x-4">
                              <div className="w-20 h-14 bg-red-100 rounded flex items-center justify-center flex-shrink-0">
                                <PlayCircle className="h-8 w-8 text-red-600" />
                              </div>
                              <div className="flex-1">
                                <h3 className="font-semibold mb-1">{video.title}</h3>
                                <p className="text-sm text-gray-600 mb-2">{video.channel}</p>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3 text-xs text-gray-500">
                                    <span>{video.duration}</span>
                                    <div className="flex items-center">
                                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                      <span className="ml-1">{video.rating}</span>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Badge variant="outline">{video.topic}</Badge>
                                    <Button size="sm" className="bg-gradient-to-r from-purple-600 to-pink-600">
                                      Recommend
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="courses" className="mt-6">
                    <div className="space-y-6">
                      {courses.map((course) => (
                        <Card key={course.id} className="hover:shadow-lg transition-shadow">
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start space-x-4">
                                <div className="w-16 h-16 bg-green-100 rounded flex items-center justify-center flex-shrink-0">
                                  <GraduationCap className="h-8 w-8 text-green-600" />
                                </div>
                                <div className="flex-1">
                                  <h3 className="font-semibold text-lg mb-1">{course.title}</h3>
                                  <p className="text-gray-600 mb-2">{course.instructor}</p>
                                  <p className="text-sm text-gray-500 mb-3">{course.provider}</p>
                                  <div className="flex items-center space-x-4 text-sm">
                                    <span className="flex items-center">
                                      <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                                      {course.duration}
                                    </span>
                                    <span className="flex items-center">
                                      <Brain className="h-4 w-4 mr-1 text-gray-400" />
                                      {course.level}
                                    </span>
                                    <span className="flex items-center">
                                      <Star className="h-4 w-4 mr-1 text-yellow-500 fill-current" />
                                      {course.rating}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <Badge variant="outline" className="mb-2">{course.topic}</Badge>
                                <div>
                                  <Button className="bg-gradient-to-r from-purple-600 to-pink-600">
                                    Recommend
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {/* Risk Distribution */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                  <CardTitle className="text-lg">Risk Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                  <div className="space-y-4">
                    {['LOW', 'MEDIUM', 'HIGH'].map((risk) => {
                      const count = students.filter(s => s.riskCategory === risk).length;
                      const percentage = students.length > 0 ? (count / students.length) * 100 : 0;
                      return (
                        <div key={risk} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full ${
                              risk === 'LOW' ? 'bg-green-500' : 
                              risk === 'MEDIUM' ? 'bg-yellow-500' : 'bg-red-500'
                            }`} />
                            <span className="text-sm font-medium">{risk} Risk</span>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold">{count}</div>
                            <div className="text-xs text-gray-500">{percentage.toFixed(1)}%</div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">GPA Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { range: '3.5-4.0', min: 3.5, max: 4.0, color: 'bg-green-500' },
                      { range: '3.0-3.5', min: 3.0, max: 3.5, color: 'bg-yellow-500' },
                      { range: '2.5-3.0', min: 2.5, max: 3.0, color: 'bg-orange-500' },
                      { range: 'Below 2.5', min: 0, max: 2.5, color: 'bg-red-500' },
                    ].map((range) => {
                      const count = students.filter(s => s.gpa >= range.min && s.gpa < range.max).length;
                      const percentage = students.length > 0 ? (count / students.length) * 100 : 0;
                      return (
                        <div key={range.range} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full ${range.color}`} />
                            <span className="text-sm font-medium">{range.range}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold">{count}</div>
                            <div className="text-xs text-gray-500">{percentage.toFixed(1)}%</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Attendance Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { range: '90-100%', min: 90, max: 100, color: 'bg-green-500' },
                      { range: '80-90%', min: 80, max: 90, color: 'bg-yellow-500' },
                      { range: '70-80%', min: 70, max: 80, color: 'bg-orange-500' },
                      { range: 'Below 70%', min: 0, max: 70, color: 'bg-red-500' },
                    ].map((range) => {
                      const count = students.filter(s => s.attendancePercentage >= range.min && s.attendancePercentage < range.max).length;
                      const percentage = students.length > 0 ? (count / students.length) * 100 : 0;
                      return (
                        <div key={range.range} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full ${range.color}`} />
                            <span className="text-sm font-medium">{range.range}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold">{count}</div>
                            <div className="text-xs text-gray-500">{percentage.toFixed(1)}%</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Program-wise Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Program-wise Analysis</CardTitle>
                <CardDescription>Performance breakdown by academic program</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.from(new Set(students.map(s => s.program))).map((program) => {
                    const programStudents = students.filter(s => s.program === program);
                    const avgGPA = programStudents.reduce((sum, s) => sum + s.gpa, 0) / programStudents.length;
                    const avgAttendance = programStudents.reduce((sum, s) => sum + s.attendancePercentage, 0) / programStudents.length;
                    const highRiskCount = programStudents.filter(s => s.riskCategory === 'HIGH').length;
                    
                    return (
                      <div key={program} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold">{program}</h4>
                          <Badge variant="outline">{programStudents.length} students</Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{avgGPA.toFixed(2)}</div>
                            <div className="text-xs text-gray-500">Avg GPA</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">{avgAttendance.toFixed(1)}%</div>
                            <div className="text-xs text-gray-500">Avg Attendance</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-red-600">{highRiskCount}</div>
                            <div className="text-xs text-gray-500">High Risk</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">
                              {programStudents.length > 0 ? ((highRiskCount / programStudents.length) * 100).toFixed(1) : 0}%
                            </div>
                            <div className="text-xs text-gray-500">Risk Rate</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Top Performers and At-Risk Students */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Top Performers</CardTitle>
                  <CardDescription>Students with highest GPA and attendance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {students
                      .sort((a, b) => (b.gpa + b.attendancePercentage) - (a.gpa + a.attendancePercentage))
                      .slice(0, 5)
                      .map((student, index) => (
                        <div key={student.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                          <div>
                            <div className="font-medium">{student.name}</div>
                            <div className="text-sm text-gray-500">{student.program}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-semibold">GPA: {student.gpa}</div>
                            <div className="text-sm text-gray-500">Attendance: {student.attendancePercentage}%</div>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">At-Risk Students</CardTitle>
                  <CardDescription>Students requiring immediate attention</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {students
                      .filter(s => s.riskCategory === 'HIGH')
                      .sort((a, b) => b.riskPercent! - a.riskPercent!)
                      .slice(0, 5)
                      .map((student) => (
                        <div key={student.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                          <div>
                            <div className="font-medium">{student.name}</div>
                            <div className="text-sm text-gray-500">{student.program}</div>
                          </div>
                          <div className="text-right">
                            <Badge className="bg-red-100 text-red-800">{student.riskCategory}</Badge>
                            <div className="text-sm text-gray-500 mt-1">{student.riskPercent}% risk</div>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* AI Help Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Brain className="h-5 w-5 mr-2 text-purple-600" />
                AI Assistant Help
              </CardTitle>
              <CardDescription>
                Ask our AI assistant for help with teaching strategies, student management, or any educational questions you have.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="feedback">Your Question or Feedback</Label>
                  <textarea
                    id="feedback"
                    className="w-full mt-1 p-3 border border-gray-300 rounded-md resize-none"
                    rows={4}
                    placeholder="Ask about teaching methods, student engagement, curriculum planning, or any other educational questions..."
                    value={feedbackMessage}
                    onChange={(e) => setFeedbackMessage(e.target.value)}
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={handleSubmitFeedback}
                    disabled={!feedbackMessage.trim() || isSubmittingFeedback}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {isSubmittingFeedback ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <Brain className="h-4 w-4 mr-2" />
                        Get AI Help
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setShowFeedbackModal(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}