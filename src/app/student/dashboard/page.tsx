'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, AlertTriangle, BookOpen, Target, Calendar, Award, Clock, Download, GraduationCap, Brain, Video, PlayCircle, Star, Search, Filter, LogOut, Home, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const [predictions, setPredictions] = useState<any[]>([]);
  const [roadmaps, setRoadmaps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [isGeneratingRoadmap, setIsGeneratingRoadmap] = useState(false);
  const [showRoadmapForm, setShowRoadmapForm] = useState(false);
  const [selectedRoadmap, setSelectedRoadmap] = useState<any>(null);
  const [showRoadmapDetails, setShowRoadmapDetails] = useState(false);
  const [roadmapForm, setRoadmapForm] = useState({
    targetCareer: '',
    program: '',
    currentYear: 1,
    totalYears: 4,
    interests: '',
    goals: ''
  });
  const [userInputs, setUserInputs] = useState({
    gpa: user?.gpa || 0,
    attendance: user?.attendancePercentage || 0,
    assignmentsMissed: user?.assignmentsMissed || 0
  });
  const [showInputForm, setShowInputForm] = useState(false);
  const [bookSearchTerm, setBookSearchTerm] = useState('');
  const [selectedBook, setSelectedBook] = useState<any>(null);
  const [showBookDetails, setShowBookDetails] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [videoSearchTerm, setVideoSearchTerm] = useState('');
  const [courseSearchTerm, setCourseSearchTerm] = useState('');

  useEffect(() => {
    fetchStudentData();
  }, []);

  // Add role-based access control
  useEffect(() => {
    if (user) {
      // Check if user is a student
      if (user.role !== 'STUDENT') {
        // Redirect teachers to teacher dashboard
        window.location.href = '/teacher/dashboard';
        return;
      }
    }
  }, [user]);

  const fetchStudentData = async () => {
    try {
      // Fetch predictions
      const predResponse = await fetch('/api/predictions/student');
      if (predResponse.ok) {
        const predData = await predResponse.json();
        setPredictions(predData.predictions || []);
      }

      // Fetch roadmaps
      const roadmapResponse = await fetch('/api/roadmaps/student');
      if (roadmapResponse.ok) {
        const roadmapData = await roadmapResponse.json();
        setRoadmaps(roadmapData.roadmaps || []);
      }
    } catch (error) {
      console.error('Error fetching student data:', error);
    } finally {
      setLoading(false);
    }
  };

  const latestPrediction = predictions[0];
  const riskCategory = latestPrediction?.riskCategory || 'LOW';
  const riskPercent = latestPrediction?.riskPercent || 15;

  const getRiskColor = (category: string) => {
    switch (category) {
      case 'HIGH': return 'text-red-600 bg-red-50';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-green-600 bg-green-50';
    }
  };

  const getRiskIcon = (category: string) => {
    switch (category) {
      case 'HIGH': return <AlertTriangle className="h-5 w-5" />;
      case 'MEDIUM': return <TrendingUp className="h-5 w-5" />;
      default: return <Award className="h-5 w-5" />;
    }
  };

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  const handleGenerateRoadmap = async () => {
    if (!roadmapForm.targetCareer || !roadmapForm.program) {
      alert('Please fill in target career and program');
      return;
    }

    setIsGeneratingRoadmap(true);
    try {
      const response = await fetch('/api/roadmaps/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(roadmapForm),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Refresh roadmaps
          await fetchStudentData();
          setShowRoadmapForm(false);
          setRoadmapForm({
            targetCareer: '',
            program: '',
            currentYear: 1,
            totalYears: 4,
            interests: '',
            goals: ''
          });
          alert('Roadmap generated successfully!');
        } else {
          alert('Failed to generate roadmap: ' + data.message);
        }
      } else {
        alert('Failed to generate roadmap');
      }
    } catch (error) {
      console.error('Error generating roadmap:', error);
      alert('Error generating roadmap');
    } finally {
      setIsGeneratingRoadmap(false);
    }
  };

  const handleViewRoadmapDetails = (roadmap: any) => {
    setSelectedRoadmap(roadmap);
    setShowRoadmapDetails(true);
  };

  const handleDeleteRoadmap = async (roadmapId: string) => {
    if (!confirm('Are you sure you want to delete this roadmap?')) return;
    
    try {
      const response = await fetch(`/api/roadmaps/${roadmapId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchStudentData();
        alert('Roadmap deleted successfully!');
      } else {
        alert('Failed to delete roadmap');
      }
    } catch (error) {
      console.error('Error deleting roadmap:', error);
      alert('Error deleting roadmap');
    }
  };

  const handleUpdateUserInputs = async () => {
    try {
      const response = await fetch('/api/students/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userInputs),
      });

      if (response.ok) {
        await fetchStudentData();
        setShowInputForm(false);
        alert('Data updated successfully!');
      } else {
        alert('Failed to update data');
      }
    } catch (error) {
      console.error('Error updating data:', error);
      alert('Error updating data');
    }
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
      alert('Thank you for your feedback! Our AI assistant will help you with your query.');
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
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone and will remove all your data including predictions, roadmaps, and academic records.')) {
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

  // Department-based recommendations
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
    course.instructor.toLowerCase().includes(courseSearchTerm.toLowerCase()) ||
    course.topic.toLowerCase().includes(courseSearchTerm.toLowerCase())
  );

  const topics = [
    { name: 'Data Structures', understanding: 85 },
    { name: 'Algorithms', understanding: 78 },
    { name: 'Machine Learning', understanding: 65 },
    { name: 'Web Development', understanding: 90 }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Student Dashboard</h1>
                <p className="text-sm text-blue-100">Welcome back, {user?.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-white/80 hover:text-white transition-colors">
                <Home className="h-5 w-5" />
              </Link>
              <Button 
                variant="outline" 
                className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                onClick={() => setShowFeedbackModal(true)}
              >
                <Brain className="h-4 w-4 mr-2" />
                AI Help
              </Button>
              <Button 
                variant="outline" 
                className="bg-red-500/20 border-red-300/30 text-red-200 hover:bg-red-500/30"
                onClick={handleDeleteAccount}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Account
              </Button>
              <Badge className="bg-white/20 text-white border-white/30">{user?.program}</Badge>
              <Badge className="bg-gradient-to-r from-green-400 to-emerald-500 text-white border-0">Student</Badge>
              <Button variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Risk Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-amber-500 to-orange-600 text-white border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-amber-100">Risk Level</CardTitle>
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                {getRiskIcon(riskCategory)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{riskPercent}%</div>
              <Badge className={`${getRiskColor(riskCategory)} bg-white/20 text-white border-white/30 mt-2`}>
                {riskCategory} Risk
              </Badge>
              <Progress value={riskPercent} className="mt-2 bg-white/20" />
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-100">Current GPA</CardTitle>
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Award className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{userInputs.gpa || user?.gpa || '0.0'}</div>
              <p className="text-xs text-blue-100">Click to update</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-100">Attendance</CardTitle>
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Clock className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{userInputs.attendance || user?.attendancePercentage || '0'}%</div>
              <Progress value={userInputs.attendance || user?.attendancePercentage || 0} className="mt-2 bg-white/20" />
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-100">Assignments</CardTitle>
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <BookOpen className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{userInputs.assignmentsMissed || user?.assignmentsMissed || '0'}</div>
              <p className="text-xs text-purple-100">Missed this semester</p>
            </CardContent>
          </Card>
        </div>

        {/* Update Data Button */}
        <div className="flex justify-center mb-6">
          <Button 
            onClick={() => setShowInputForm(!showInputForm)}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
          >
            Update My Data
          </Button>
        </div>

        {/* User Input Form */}
        {showInputForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Update Your Academic Data</CardTitle>
              <CardDescription>Enter your current academic information for better predictions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="gpa">Current GPA</Label>
                  <Input
                    id="gpa"
                    type="number"
                    step="0.1"
                    min="0"
                    max="4"
                    value={userInputs.gpa}
                    onChange={(e) => setUserInputs({...userInputs, gpa: parseFloat(e.target.value) || 0})}
                    placeholder="Enter your GPA"
                  />
                </div>
                <div>
                  <Label htmlFor="attendance">Attendance %</Label>
                  <Input
                    id="attendance"
                    type="number"
                    min="0"
                    max="100"
                    value={userInputs.attendance}
                    onChange={(e) => setUserInputs({...userInputs, attendance: parseInt(e.target.value) || 0})}
                    placeholder="Enter attendance %"
                  />
                </div>
                <div>
                  <Label htmlFor="assignments">Assignments Missed</Label>
                  <Input
                    id="assignments"
                    type="number"
                    min="0"
                    value={userInputs.assignmentsMissed}
                    onChange={(e) => setUserInputs({...userInputs, assignmentsMissed: parseInt(e.target.value) || 0})}
                    placeholder="Enter missed assignments"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button onClick={handleUpdateUserInputs} className="bg-green-500 hover:bg-green-600">
                  Update Data
                </Button>
                <Button variant="outline" onClick={() => setShowInputForm(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-gradient-to-r from-blue-100 to-cyan-100 p-1 rounded-lg">
            <TabsTrigger value="overview" className="bg-white/50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white">Overview</TabsTrigger>
            <TabsTrigger value="predictions" className="bg-white/50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white">Predictions</TabsTrigger>
            <TabsTrigger value="books" className="bg-white/50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white">Books</TabsTrigger>
            <TabsTrigger value="videos" className="bg-white/50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white">Videos</TabsTrigger>
            <TabsTrigger value="courses" className="bg-white/50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white">Courses</TabsTrigger>
            <TabsTrigger value="roadmap" className="bg-white/50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white">Roadmap</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Prediction */}
              <Card>
                <CardHeader>
                  <CardTitle>Latest Risk Assessment</CardTitle>
                  <CardDescription>
                    Based on your recent academic performance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {latestPrediction ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span>Success Probability</span>
                        <span className="text-2xl font-bold text-green-600">
                          {100 - riskPercent}%
                        </span>
                      </div>
                      <Progress value={100 - riskPercent} className="h-2" />
                      <div className="text-sm text-gray-600">
                        <p>Risk Category: <span className="font-semibold">{riskCategory}</span></p>
                        <p>Assessment Date: {new Date(latestPrediction.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500">No predictions available yet</p>
                  )}
                </CardContent>
              </Card>

              {/* Topic Performance */}
              <Card>
                <CardHeader>
                  <CardTitle>Topic Understanding</CardTitle>
                  <CardDescription>
                    Your performance across different subjects
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {topics.map((topic, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{topic.name}</span>
                        <div className="flex items-center space-x-2">
                          <Progress value={topic.understanding} className="w-20 h-2" />
                          <span className="text-sm font-semibold">{topic.understanding}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recommended Resources */}
            <Card>
              <CardHeader>
                <CardTitle>Recommended Resources</CardTitle>
                <CardDescription>
                  Personalized learning materials based on your performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-3">
                    <h4 className="font-medium flex items-center">
                      <BookOpen className="h-4 w-4 mr-2 text-blue-600" />
                      Books
                    </h4>
                    {filteredBooks.slice(0, 2).map((book) => (
                      <div key={book.id} className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                        <BookOpen className="h-8 w-8 text-blue-600" />
                        <div>
                          <p className="font-medium text-sm">{book.title}</p>
                          <p className="text-xs text-gray-500">{book.author}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-medium flex items-center">
                      <Video className="h-4 w-4 mr-2 text-red-600" />
                      Videos
                    </h4>
                    {filteredVideos.slice(0, 2).map((video) => (
                      <div key={video.id} className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg">
                        <PlayCircle className="h-8 w-8 text-red-600" />
                        <div>
                          <p className="font-medium text-sm">{video.title}</p>
                          <p className="text-xs text-gray-500">{video.channel}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-medium flex items-center">
                      <GraduationCap className="h-4 w-4 mr-2 text-green-600" />
                      Courses
                    </h4>
                    {filteredCourses.slice(0, 2).map((course) => (
                      <div key={course.id} className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                        <GraduationCap className="h-8 w-8 text-green-600" />
                        <div>
                          <p className="font-medium text-sm">{course.title}</p>
                          <p className="text-xs text-gray-500">{course.provider}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="predictions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Prediction History</CardTitle>
                <CardDescription>
                  Track your risk assessment over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                {predictions.length > 0 ? (
                  <div className="space-y-4">
                    {predictions.map((prediction, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">Risk Assessment</p>
                          <p className="text-sm text-gray-500">
                            {new Date(prediction.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge className={getRiskColor(prediction.riskCategory)}>
                            {prediction.riskCategory}
                          </Badge>
                          <p className="text-sm text-gray-500 mt-1">{prediction.riskPercent}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No predictions available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="books" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Book Recommendations</CardTitle>
                <CardDescription>
                  Discover books tailored to your learning needs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search books..."
                        value={bookSearchTerm}
                        onChange={(e) => setBookSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                    <SelectTrigger className="w-full md:w-48">
                      <SelectValue placeholder="Filter by topic" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Topics</SelectItem>
                      <SelectItem value="Algorithms">Algorithms</SelectItem>
                      <SelectItem value="Data Structures">Data Structures</SelectItem>
                      <SelectItem value="Machine Learning">Machine Learning</SelectItem>
                      <SelectItem value="Web Development">Web Development</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredBooks.map((book) => (
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
                          <div className="flex gap-1">
                            <Button 
                              size="sm" 
                              className="bg-gradient-to-r from-purple-600 to-pink-600"
                              onClick={() => handleViewBookDetails(book)}
                            >
                              Details
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleOpenExternalLink(book.url)}
                            >
                              Buy
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="videos" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Educational Videos</CardTitle>
                <CardDescription>
                  Watch recommended videos to enhance your learning
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search videos..."
                        value={videoSearchTerm}
                        onChange={(e) => setVideoSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select>
                    <SelectTrigger className="w-full md:w-48">
                      <SelectValue placeholder="Filter by topic" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Topics</SelectItem>
                      <SelectItem value="Data Structures">Data Structures</SelectItem>
                      <SelectItem value="Algorithms">Algorithms</SelectItem>
                      <SelectItem value="Machine Learning">Machine Learning</SelectItem>
                      <SelectItem value="Web Development">Web Development</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredVideos.map((video) => (
                    <Card key={video.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="w-12 h-16 bg-red-100 rounded flex items-center justify-center">
                            <PlayCircle className="h-6 w-6 text-red-600" />
                          </div>
                          <div className="text-right">
                            <div className="flex items-center">
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                              <span className="ml-1 text-sm font-semibold">{video.rating}</span>
                            </div>
                            <span className="text-xs text-gray-500">{video.duration}</span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <h3 className="font-semibold mb-1">{video.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">by {video.channel}</p>
                        <div className="flex items-center justify-between">
                          <Badge variant="outline">{video.topic}</Badge>
                          <Button 
                            size="sm" 
                            className="bg-gradient-to-r from-red-600 to-pink-600"
                            onClick={() => handleOpenExternalLink(video.url)}
                          >
                            Watch
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="courses" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Course Registration</CardTitle>
                <CardDescription>
                  Enroll in courses to enhance your skills
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search courses..."
                        value={courseSearchTerm}
                        onChange={(e) => setCourseSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                    <SelectTrigger className="w-full md:w-48">
                      <SelectValue placeholder="Filter by topic" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Topics</SelectItem>
                      <SelectItem value="Algorithms">Algorithms</SelectItem>
                      <SelectItem value="Data Structures">Data Structures</SelectItem>
                      <SelectItem value="Machine Learning">Machine Learning</SelectItem>
                      <SelectItem value="Web Development">Web Development</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-6">
                  {filteredCourses.map((course) => (
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
                                  <Clock className="h-4 w-4 mr-1 text-gray-400" />
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
                              <Button 
                                className="bg-gradient-to-r from-purple-600 to-pink-600"
                                onClick={() => handleOpenExternalLink(course.url)}
                              >
                                Enroll Now
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="roadmap" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Career Roadmap</CardTitle>
                <CardDescription>
                  Personalized learning path for your career goals
                </CardDescription>
              </CardHeader>
              <CardContent>
                {roadmaps.length > 0 ? (
                  <div className="space-y-6">
                    {roadmaps.map((roadmap, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <h3 className="text-lg font-semibold mb-2">{roadmap.title}</h3>
                        <p className="text-gray-600 mb-4">{roadmap.description}</p>
                        <div className="flex items-center justify-between">
                          <Badge variant="outline">{roadmap.targetCareer}</Badge>
                          <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            className="bg-gradient-to-r from-purple-600 to-pink-600"
                            onClick={() => handleViewRoadmapDetails(roadmap)}
                          >
                            View Details
                          </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => handleDeleteRoadmap(roadmap.id)}
                            >
                              Delete
                          </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Roadmap Yet</h3>
                    <p className="text-gray-500 mb-4">
                      Generate your personalized career roadmap to get started
                    </p>
                    <Button 
                      className="bg-gradient-to-r from-purple-600 to-pink-600"
                      onClick={() => setShowRoadmapForm(true)}
                    >
                      Generate Roadmap
                    </Button>
                  </div>
                )}

                {/* Roadmap Generation Form */}
                {showRoadmapForm && (
                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle>Generate New Roadmap</CardTitle>
                      <CardDescription>
                        Fill in your details to create a personalized career roadmap
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="targetCareer">Target Career *</Label>
                          <Input
                            id="targetCareer"
                            placeholder="e.g., Software Engineer, Data Scientist"
                            value={roadmapForm.targetCareer}
                            onChange={(e) => setRoadmapForm({...roadmapForm, targetCareer: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="program">Program *</Label>
                          <Input
                            id="program"
                            placeholder="e.g., B.Tech, Computer Science"
                            value={roadmapForm.program}
                            onChange={(e) => setRoadmapForm({...roadmapForm, program: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="currentYear">Current Year</Label>
                          <Select 
                            value={roadmapForm.currentYear.toString()} 
                            onValueChange={(value) => setRoadmapForm({...roadmapForm, currentYear: parseInt(value)})}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">Year 1</SelectItem>
                              <SelectItem value="2">Year 2</SelectItem>
                              <SelectItem value="3">Year 3</SelectItem>
                              <SelectItem value="4">Year 4</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="totalYears">Total Years</Label>
                          <Select 
                            value={roadmapForm.totalYears.toString()} 
                            onValueChange={(value) => setRoadmapForm({...roadmapForm, totalYears: parseInt(value)})}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="2">2 Years</SelectItem>
                              <SelectItem value="3">3 Years</SelectItem>
                              <SelectItem value="4">4 Years</SelectItem>
                              <SelectItem value="5">5 Years</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="interests">Interests</Label>
                        <Input
                          id="interests"
                          placeholder="e.g., Machine Learning, Web Development, Mobile Apps"
                          value={roadmapForm.interests}
                          onChange={(e) => setRoadmapForm({...roadmapForm, interests: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="goals">Career Goals</Label>
                        <Input
                          id="goals"
                          placeholder="e.g., Work at a tech company, Start my own business"
                          value={roadmapForm.goals}
                          onChange={(e) => setRoadmapForm({...roadmapForm, goals: e.target.value})}
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button 
                          variant="outline" 
                          onClick={() => setShowRoadmapForm(false)}
                        >
                          Cancel
                        </Button>
                        <Button 
                          className="bg-gradient-to-r from-purple-600 to-pink-600"
                          onClick={handleGenerateRoadmap}
                          disabled={isGeneratingRoadmap}
                        >
                          {isGeneratingRoadmap ? 'Generating...' : 'Generate Roadmap'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Roadmap Details Modal */}
                {showRoadmapDetails && selectedRoadmap && (
                  <Card className="mt-6">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>{selectedRoadmap.title}</CardTitle>
                          <CardDescription>{selectedRoadmap.description}</CardDescription>
                        </div>
                        <Button 
                          variant="outline" 
                          onClick={() => setShowRoadmapDetails(false)}
                        >
                          Close
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {/* Roadmap Info */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                          <div>
                            <p className="text-sm font-medium text-gray-500">Target Career</p>
                            <p className="text-lg font-semibold">{selectedRoadmap.targetCareer}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Program</p>
                            <p className="text-lg font-semibold">{selectedRoadmap.program}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Current Year</p>
                            <p className="text-lg font-semibold">Year {selectedRoadmap.currentYear}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Total Years</p>
                            <p className="text-lg font-semibold">{selectedRoadmap.totalYears} Years</p>
                          </div>
                        </div>

                        {/* Semesters */}
                        {selectedRoadmap.content?.semesters && (
                          <div className="space-y-4">
                            <h3 className="text-xl font-semibold">Semester Breakdown</h3>
                            {selectedRoadmap.content.semesters.map((semester: any, index: number) => (
                              <Card key={index} className="border-l-4 border-l-blue-500">
                                <CardHeader>
                                  <CardTitle className="text-lg">{semester.semester}</CardTitle>
                                  <CardDescription className="font-medium">{semester.focus}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {/* Courses */}
                                    <div>
                                      <h4 className="font-semibold text-blue-600 mb-2 flex items-center">
                                        <BookOpen className="h-4 w-4 mr-2" />
                                        Courses
                                      </h4>
                                      <ul className="space-y-1">
                                        {semester.courses?.map((course: string, i: number) => (
                                          <li key={i} className="text-sm text-gray-600">• {course}</li>
                                        ))}
                                      </ul>
                                    </div>

                                    {/* Projects */}
                                    <div>
                                      <h4 className="font-semibold text-green-600 mb-2 flex items-center">
                                        <Target className="h-4 w-4 mr-2" />
                                        Projects
                                      </h4>
                                      <ul className="space-y-1">
                                        {semester.projects?.map((project: string, i: number) => (
                                          <li key={i} className="text-sm text-gray-600">• {project}</li>
                                        ))}
                                      </ul>
                                    </div>

                                    {/* Certifications */}
                                    <div>
                                      <h4 className="font-semibold text-purple-600 mb-2 flex items-center">
                                        <Award className="h-4 w-4 mr-2" />
                                        Certifications
                                      </h4>
                                      <ul className="space-y-1">
                                        {semester.certifications?.map((cert: string, i: number) => (
                                          <li key={i} className="text-sm text-gray-600">• {cert}</li>
                                        ))}
                                      </ul>
                                    </div>

                                    {/* Skills */}
                                    <div>
                                      <h4 className="font-semibold text-orange-600 mb-2 flex items-center">
                                        <Brain className="h-4 w-4 mr-2" />
                                        Skills
                                      </h4>
                                      <div className="flex flex-wrap gap-1">
                                        {semester.skills?.map((skill: string, i: number) => (
                                          <Badge key={i} variant="secondary" className="text-xs">{skill}</Badge>
                                        ))}
                                      </div>
                                    </div>

                                    {/* Resources */}
                                    <div>
                                      <h4 className="font-semibold text-red-600 mb-2 flex items-center">
                                        <BookOpen className="h-4 w-4 mr-2" />
                                        Resources
                                      </h4>
                                      <ul className="space-y-1">
                                        {semester.resources?.map((resource: string, i: number) => (
                                          <li key={i} className="text-sm text-gray-600">• {resource}</li>
                                        ))}
                                      </ul>
                                    </div>

                                    {/* Weekly Hours */}
                                    <div>
                                      <h4 className="font-semibold text-indigo-600 mb-2 flex items-center">
                                        <Clock className="h-4 w-4 mr-2" />
                                        Time Commitment
                                      </h4>
                                      <p className="text-sm text-gray-600">{semester.weeklyHours} hours/week</p>
                                    </div>
                                  </div>

                                  {/* Milestones */}
                                  <div className="mt-4 pt-4 border-t">
                                    <h4 className="font-semibold text-gray-700 mb-2 flex items-center">
                                      <Calendar className="h-4 w-4 mr-2" />
                                      Milestones
                                    </h4>
                                    <ul className="space-y-1">
                                      {semester.milestones?.map((milestone: string, i: number) => (
                                        <li key={i} className="text-sm text-gray-600 flex items-center">
                                          <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                                          {milestone}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Book Details Modal */}
      {showBookDetails && selectedBook && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">{selectedBook.title}</CardTitle>
                  <CardDescription className="text-lg">by {selectedBook.author}</CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowBookDetails(false)}
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-20 bg-blue-100 rounded flex items-center justify-center">
                  <BookOpen className="h-8 w-8 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="font-semibold">{selectedBook.rating}</span>
                    <Badge variant="outline">{selectedBook.difficulty}</Badge>
                    <Badge variant="secondary">{selectedBook.topic}</Badge>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-gray-600">{selectedBook.description}</p>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={() => handleOpenExternalLink(selectedBook.url)}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  View Book
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setShowBookDetails(false)}
                >
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

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
                Ask our AI assistant for help with your studies, career guidance, or any questions you have.
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
                    placeholder="Ask about study tips, career advice, course recommendations, or any other questions..."
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