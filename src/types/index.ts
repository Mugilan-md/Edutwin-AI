export type UserRole = "student" | "faculty" | "admin";

export interface Profile {
  id: string;
  full_name: string;
  email?: string;
  role: UserRole;
  department: string;
  year?: number;
  register_no?: string;
  created_at?: string;
  updated_at?: string;
}

export type ActivityCategory =
  | "hackathon"
  | "paper_presentation"
  | "workshop"
  | "certification"
  | "sports"
  | "community"
  | "leadership"
  | "other";

export type ActivityStatus = "pending" | "approved" | "rejected";

export interface ActivityMetadata {
  text: string;
  organization?: string;
  date?: string;
  credits?: number | null;
  feedback?: string | null;
  aiConfidence?: number;
  aiSuggestedCredits?: number;
  sentimentScore?: number;
}

export interface Activity {
  id: string;
  student_id: string;
  title: string;
  category: ActivityCategory | string;
  description: string;
  certificate_url?: string;
  status: ActivityStatus;
  created_at?: string;
  updated_at?: string;
  profiles?: Profile | null;
}

export interface NAACDepartmentMetric {
  department: string;
  totalStudents: number;
  totalActivities: number;
  totalCredits: number;
  avgCreditPerStudent: number;
  score: number;
}

export interface NAACSummary {
  overallCGPA: number;
  totalActivities: number;
  activeStudents: number;
  departmentMetrics: NAACDepartmentMetric[];
}

export interface CareerMatch {
  role: string;
  matchPercentage: number;
  matchingSkills: string[];
  missingSkills: string[];
  recommendation: string;
}
