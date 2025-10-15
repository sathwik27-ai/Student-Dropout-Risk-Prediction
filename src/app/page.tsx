'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, Users, TrendingUp, Brain, BookOpen, BarChart3, Shield, Zap, ChartLine, Upload, User, UsersIcon } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-600 to-pink-600 text-white py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Predict Student Success with
            <br />
            <span className="text-yellow-300">AI-Powered Insights</span>
          </h1>
          <p className="text-xl mb-8 max-w-3xl mx-auto opacity-90">
            StudentBuilder helps educational institutions identify at-risk students, 
            provide personalized interventions, and create individualized career roadmaps 
            using advanced machine learning and AI.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button className="bg-white text-purple-600 hover:bg-gray-100 text-lg px-8 py-3">
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Powerful Features for Educational Success</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our comprehensive platform provides all the tools you need to support student success 
              and improve retention rates.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: ChartLine,
                title: 'Predictive Analytics',
                description: 'Advanced ML algorithms to identify students at risk of dropping out with high accuracy.'
              },
              {
                icon: Upload,
                title: 'Batch Student Upload',
                description: 'Upload CSV files with student data for bulk predictions and analysis.'
              },
              {
                icon: BookOpen,
                title: 'Resource Recommendations',
                description: 'Personalized book, video, and course recommendations based on learning gaps.'
              },
              {
                icon: GraduationCap,
                title: 'Career Roadmaps',
                description: 'Year-by-year planning for specific career paths with required skills and courses.'
              },
              {
                icon: Brain,
                title: 'Topic Analysis',
                description: 'Identify topics where students struggle and provide targeted learning resources.'
              },
              {
                icon: Shield,
                title: 'Role-Based Access',
                description: 'Different interfaces for students and teachers with appropriate permissions.'
              }
            ].map((feature, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-all hover:-translate-y-1">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4">
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Role Selection Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Choose Your Path</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Select your role to access the right tools and features for your needs.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-8 hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mb-6 mx-auto">
                  <User className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Student Portal</h3>
                <p className="text-gray-600 mb-6">
                  Access your personalized learning resources, track your progress, 
                  and get AI-powered recommendations for your academic success.
                </p>
                <div className="space-y-3 text-left mb-6">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">Personalized risk assessments</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">Custom learning recommendations</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">Career roadmap planning</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">Progress tracking and analytics</span>
                  </div>
                </div>
                <Link href="/login?role=student">
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                    Enter Student Portal
                  </Button>
                </Link>
              </div>
            </Card>

            <Card className="p-8 hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mb-6 mx-auto">
                  <UsersIcon className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Teacher Portal</h3>
                <p className="text-gray-600 mb-6">
                  Manage your students, upload data for predictions, analyze performance, 
                  and provide targeted interventions.
                </p>
                <div className="space-y-3 text-left mb-6">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-sm">Batch student data upload</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-sm">Class-wide analytics and insights</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-sm">Risk identification and alerts</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-sm">Resource management tools</span>
                  </div>
                </div>
                <Link href="/login?role=teacher">
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800">
                    Enter Teacher Portal
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-purple-600 to-pink-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl font-bold mb-4">Ready to Transform Student Success?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of educators using StudentBuilder to improve student outcomes and retention rates.
          </p>
          <Link href="/login">
            <Button className="bg-white text-purple-600 hover:bg-gray-100 text-lg px-8 py-3">
              Start Your Free Trial
              <TrendingUp className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <GraduationCap className="h-6 w-6" />
            <span className="text-xl font-bold">StudentBuilder</span>
          </div>
          <p className="text-gray-400">
            Empowering educational institutions with AI-driven insights
          </p>
        </div>
      </footer>
    </div>
  );
}