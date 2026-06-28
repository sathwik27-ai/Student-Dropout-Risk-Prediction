'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, User, UsersIcon } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const { user, isLoading, login, register } = useAuth();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedRole, setSelectedRole] = useState(searchParams?.get('role') || '');
  const [loginRole, setLoginRole] = useState('');

  // Don't auto-redirect - require manual role selection every time
  // This ensures users consciously choose their role each time they login

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    // Ensure role is selected
    if (!loginRole) {
      setError('Please select your role (Student or Teacher) to continue');
      setIsSubmitting(false);
      return;
    }

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    // Validate email and password are provided
    if (!email || !password) {
      setError('Please enter both email and password');
      setIsSubmitting(false);
      return;
    }

    const result = await login(email, password, loginRole as 'STUDENT' | 'TEACHER');
    
    if (result.success) {
      setSuccess('Login successful! Redirecting to your dashboard...');
      // Auto-redirect based on selected role after successful login
      setTimeout(() => {
        if (result.user?.role === 'STUDENT') {
          window.location.href = '/student/dashboard';
        } else if (result.user?.role === 'TEACHER') {
          window.location.href = '/teacher/dashboard';
        }
      }, 1500);
    } else {
      setError(result.message);
    }
    
    setIsSubmitting(false);
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    const formData = new FormData(e.currentTarget);
    const userData = {
      email: formData.get('email') as string,
      name: formData.get('name') as string,
      password: formData.get('password') as string,
      role: formData.get('role') as 'STUDENT' | 'TEACHER' | undefined,
      program: formData.get('program') as string || undefined,
      department: formData.get('department') as string || undefined,
      enrollmentYear: formData.get('enrollmentYear') ? parseInt(formData.get('enrollmentYear') as string) : undefined,
    };

    const result = await register(userData);
    
    if (result.success) {
      setSuccess('Registration successful! Please login with your credentials.');
      // Clear the form after successful registration
      if (e.currentTarget) {
        e.currentTarget.reset();
      }
      // Switch to login tab after successful registration
      setTimeout(() => {
        const loginTab = document.querySelector('[data-state="active"]')?.parentElement?.querySelector('[value="login"]');
        if (loginTab) {
          (loginTab as HTMLElement).click();
        }
      }, 2000);
    } else {
      setError(result.message);
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">StudentBuilder</span>
          </Link>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to access your dashboard</p>
        </div>

        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-lg">
            <CardTitle className="text-2xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Sign In to StudentBuilder
            </CardTitle>
            <CardDescription className="text-gray-600">
              Choose your role and sign in to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md text-green-700 text-sm">
                {success}
              </div>
            )}
            
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Sign In</TabsTrigger>
                <TabsTrigger value="register">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  {/* Role Selection for Login */}
                  <div className="space-y-2">
                    <Label className="text-base font-semibold">Select Your Role <span className="text-red-500">*</span></Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div 
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          loginRole === 'STUDENT' 
                            ? 'border-blue-600 bg-blue-50 shadow-md' 
                            : 'border-gray-200 hover:border-blue-300 hover:shadow-sm'
                        }`}
                        onClick={() => setLoginRole('STUDENT')}
                      >
                        <User className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                        <p className="font-medium text-center">Student</p>
                        <p className="text-xs text-gray-500 text-center">Access your dashboard</p>
                      </div>
                      <div 
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          loginRole === 'TEACHER' 
                            ? 'border-purple-600 bg-purple-50 shadow-md' 
                            : 'border-gray-200 hover:border-purple-300 hover:shadow-sm'
                        }`}
                        onClick={() => setLoginRole('TEACHER')}
                      >
                        <UsersIcon className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                        <p className="font-medium text-center">Teacher</p>
                        <p className="text-xs text-gray-500 text-center">Manage students</p>
                      </div>
                    </div>
                    {loginRole && (
                      <p className="text-sm text-green-600 text-center">
                        ✓ Selected: {loginRole === 'STUDENT' ? 'Student' : 'Teacher'}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Enter your password"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700" disabled={isSubmitting || !loginRole}>
                    {isSubmitting ? 'Signing in...' : loginRole ? `Sign In as ${loginRole === 'STUDENT' ? 'Student' : 'Teacher'}` : 'Please Select Your Role First'}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  {/* Role Selection */}
                  <div className="space-y-2">
                    <Label>Select Your Role</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div 
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          selectedRole === 'STUDENT' 
                            ? 'border-blue-600 bg-blue-50' 
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                        onClick={() => setSelectedRole('STUDENT')}
                      >
                        <User className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                        <p className="font-medium text-center">Student</p>
                        <p className="text-xs text-gray-500 text-center">Access your learning resources</p>
                      </div>
                      <div 
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          selectedRole === 'TEACHER' 
                            ? 'border-purple-600 bg-purple-50' 
                            : 'border-gray-200 hover:border-purple-300'
                        }`}
                        onClick={() => setSelectedRole('TEACHER')}
                      >
                        <UsersIcon className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                        <p className="font-medium text-center">Teacher</p>
                        <p className="text-xs text-gray-500 text-center">Manage students and predictions</p>
                      </div>
                    </div>
                    <input type="hidden" name="role" value={selectedRole} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reg-name">Full Name</Label>
                    <Input
                      id="reg-name"
                      name="name"
                      type="text"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-email">Email</Label>
                    <Input
                      id="reg-email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-password">Password</Label>
                    <Input
                      id="reg-password"
                      name="password"
                      type="password"
                      placeholder="Create a password (min 6 characters)"
                      required
                      minLength={6}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="program">Program</Label>
                      <Input
                        id="program"
                        name="program"
                        type="text"
                        placeholder="e.g., B.Tech"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="enrollmentYear">Year</Label>
                      <Input
                        id="enrollmentYear"
                        name="enrollmentYear"
                        type="number"
                        placeholder="e.g., 2023"
                        min="2000"
                        max="2030"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      name="department"
                      type="text"
                      placeholder="e.g., Computer Science"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700" 
                    disabled={isSubmitting || !selectedRole}
                  >
                    {isSubmitting ? 'Creating account...' : 'Create Account'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
            
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                Select your role and enter your credentials to continue.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link href="/" className="text-sm text-gray-600 hover:text-purple-600 transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}