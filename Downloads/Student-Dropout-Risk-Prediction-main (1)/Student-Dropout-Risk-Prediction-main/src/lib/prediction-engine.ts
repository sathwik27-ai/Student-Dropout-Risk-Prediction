import { db } from './db';

interface StudentFeatures {
  gpa: number;
  attendancePercentage: number;
  assignmentsMissed: number;
  currentYear: number;
  socioEconomicStatus?: string;
  distanceFromCollegeKm?: number;
  monthlyIncome?: number;
  priorBacklogs?: number;
  extracurricularHours?: number;
  mentalHealthScore?: number;
}

export class PredictionEngine {
  // Simple risk calculation based on multiple factors
  static calculateRisk(features: StudentFeatures): {
    riskPercent: number;
    riskCategory: 'LOW' | 'MEDIUM' | 'HIGH';
    explanation: any;
  } {
    let riskScore = 0;
    const factors: any = {};

    // GPA factor (0-30 points)
    if (features.gpa >= 3.5) {
      factors.gpa = { impact: 5, weight: 0.3, description: 'Excellent academic performance' };
    } else if (features.gpa >= 3.0) {
      factors.gpa = { impact: 15, weight: 0.3, description: 'Good academic performance' };
    } else if (features.gpa >= 2.5) {
      factors.gpa = { impact: 25, weight: 0.3, description: 'Average academic performance' };
    } else {
      factors.gpa = { impact: 35, weight: 0.3, description: 'Poor academic performance' };
    }
    riskScore += factors.gpa.impact;

    // Attendance factor (0-25 points)
    if (features.attendancePercentage >= 90) {
      factors.attendance = { impact: 5, weight: 0.25, description: 'Excellent attendance' };
    } else if (features.attendancePercentage >= 80) {
      factors.attendance = { impact: 10, weight: 0.25, description: 'Good attendance' };
    } else if (features.attendancePercentage >= 70) {
      factors.attendance = { impact: 20, weight: 0.25, description: 'Average attendance' };
    } else {
      factors.attendance = { impact: 30, weight: 0.25, description: 'Poor attendance' };
    }
    riskScore += factors.attendance.impact;

    // Assignments factor (0-20 points)
    if (features.assignmentsMissed <= 2) {
      factors.assignments = { impact: 5, weight: 0.2, description: 'Consistent assignment completion' };
    } else if (features.assignmentsMissed <= 5) {
      factors.assignments = { impact: 10, weight: 0.2, description: 'Some missed assignments' };
    } else if (features.assignmentsMissed <= 10) {
      factors.assignments = { impact: 20, weight: 0.2, description: 'Many missed assignments' };
    } else {
      factors.assignments = { impact: 30, weight: 0.2, description: 'Poor assignment completion' };
    }
    riskScore += factors.assignments.impact;

    // Year factor (0-15 points)
    if (features.currentYear <= 2) {
      factors.year = { impact: 10, weight: 0.15, description: 'Early years - adjustment period' };
    } else if (features.currentYear <= 3) {
      factors.year = { impact: 15, weight: 0.15, description: 'Middle years - critical period' };
    } else {
      factors.year = { impact: 5, weight: 0.15, description: 'Final years - completion focus' };
    }
    riskScore += factors.year.impact;

    // Additional factors
    if (features.priorBacklogs !== undefined) {
      if (features.priorBacklogs === 0) {
        factors.backlogs = { impact: 0, weight: 0.1, description: 'No academic backlogs' };
      } else if (features.priorBacklogs <= 2) {
        factors.backlogs = { impact: 10, weight: 0.1, description: 'Few academic backlogs' };
      } else {
        factors.backlogs = { impact: 20, weight: 0.1, description: 'Multiple academic backlogs' };
      }
      riskScore += factors.backlogs.impact;
    }

    // Normalize risk score to 0-100
    const maxPossibleScore = 100;
    const riskPercent = Math.min(Math.round((riskScore / maxPossibleScore) * 100), 100);

    // Determine risk category
    let riskCategory: 'LOW' | 'MEDIUM' | 'HIGH';
    if (riskPercent <= 33) {
      riskCategory = 'LOW';
    } else if (riskPercent <= 66) {
      riskCategory = 'MEDIUM';
    } else {
      riskCategory = 'HIGH';
    }

    // Generate explanation
    const explanation = {
      overallRisk: riskPercent,
      category: riskCategory,
      keyFactors: Object.entries(factors)
        .sort(([, a], [, b]) => (b as any).impact - (a as any).impact)
        .slice(0, 3)
        .map(([key, factor]) => ({
          factor: key,
          impact: (factor as any).impact,
          description: (factor as any).description,
        })),
      recommendations: this.generateRecommendations(riskCategory, factors),
    };

    return {
      riskPercent,
      riskCategory,
      explanation,
    };
  }

  static generateRecommendations(category: string, factors: any): string[] {
    const recommendations: string[] = [];

    if (category === 'HIGH') {
      recommendations.push('Immediate academic counseling recommended');
      recommendations.push('Consider reducing course load');
      recommendations.push('Schedule regular meetings with academic advisor');
    }

    if (factors.gpa?.impact > 20) {
      recommendations.push('Focus on improving study habits');
      recommendations.push('Seek tutoring for difficult subjects');
      recommendations.push('Form study groups with peers');
    }

    if (factors.attendance?.impact > 15) {
      recommendations.push('Improve class attendance');
      recommendations.push('Address any transportation or health issues');
      recommendations.push('Set up attendance reminders');
    }

    if (factors.assignments?.impact > 15) {
      recommendations.push('Create assignment schedule');
      recommendations.push('Break down large assignments into smaller tasks');
      recommendations.push('Seek help early when facing difficulties');
    }

    if (recommendations.length === 0) {
      recommendations.push('Continue current academic performance');
      recommendations.push('Maintain good study habits');
      recommendations.push('Stay engaged in extracurricular activities');
    }

    return recommendations;
  }

  static async generatePrediction(userId: string): Promise<any> {
    try {
      // Get user data
      const user = await db.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Prepare features
      const features: StudentFeatures = {
        gpa: user.gpa || 3.0,
        attendancePercentage: user.attendancePercentage || 80,
        assignmentsMissed: user.assignmentsMissed || 0,
        currentYear: user.currentYear || 1,
        socioEconomicStatus: user.socioEconomicStatus || undefined,
        distanceFromCollegeKm: user.distanceFromCollegeKm || undefined,
        monthlyIncome: user.monthlyIncome || undefined,
        priorBacklogs: user.priorBacklogs || undefined,
        extracurricularHours: user.extracurricularHours || undefined,
        mentalHealthScore: user.mentalHealthScore || undefined,
      };

      // Calculate prediction
      const prediction = this.calculateRisk(features);

      // Save prediction to database
      const savedPrediction = await db.prediction.create({
        data: {
          studentId: userId,
          riskPercent: prediction.riskPercent,
          riskCategory: prediction.riskCategory,
          features: features,
          explanation: prediction.explanation,
          modelVersion: 'v1.0',
        },
      });

      return {
        id: savedPrediction.id,
        riskPercent: savedPrediction.riskPercent,
        riskCategory: savedPrediction.riskCategory,
        features: savedPrediction.features,
        explanation: savedPrediction.explanation,
        createdAt: savedPrediction.createdAt,
      };
    } catch (error) {
      console.error('Error generating prediction:', error);
      throw error;
    }
  }
}