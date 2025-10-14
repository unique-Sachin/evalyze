import { Briefcase, Sparkles, Code } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface RoleConfig {
  id: string;
  title: string;
  icon: LucideIcon;
  description: string;
  defaultTopic: string;
  duration: string;
  difficulty: string;
  topics: string[];
  color: string;
  bgColor: string;
  borderColor: string;
}

// Centralized role configurations
// Add new interview roles here
export const INTERVIEW_ROLES: Record<string, RoleConfig> = {
  "system-design": {
    id: "system-design",
    title: "System Design Engineer",
    icon: Briefcase,
    description: "Practice system design interviews with questions on scalability, architecture, and distributed systems.",
    defaultTopic: "Design a scalable URL shortener service",
    duration: "45-60 min",
    difficulty: "Advanced",
    topics: ["Scalability", "Architecture", "Distributed Systems", "Database Design"],
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20"
  },
  "genai-developer": {
    id: "genai-developer",
    title: "Gen AI Developer",
    icon: Sparkles,
    description: "Master GenAI interviews covering LLMs, prompt engineering, RAG, and AI application development.",
    defaultTopic: "Explain how RAG (Retrieval Augmented Generation) works",
    duration: "45-60 min",
    difficulty: "Intermediate",
    topics: ["LLMs", "Prompt Engineering", "RAG", "AI Applications"],
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/20"
  }
  ,
  "react-developer": {
    id: "react-developer",
    title: "React.js Developer",
  icon: Code,
    description: "Live React coding interview with a built-in code sandbox. Test your skills in real time.",
    defaultTopic: "Build a counter component with increment/decrement buttons.",
    duration: "30-45 min",
    difficulty: "Intermediate",
    topics: ["React", "Hooks", "Components", "JSX", "State Management"],
    color: "text-cyan-500",
    bgColor: "bg-cyan-500/10",
    borderColor: "border-cyan-500/20"
  }
  // Add more roles here in the future:
  // "backend-engineer": { ... },
  // "frontend-developer": { ... },
  // etc.
};

export type RoleId = keyof typeof INTERVIEW_ROLES;

// Helper function to validate if a role exists
export function isValidRole(role: string): role is RoleId {
  return role in INTERVIEW_ROLES;
}

// Helper function to get role config safely
export function getRoleConfig(role: string): RoleConfig | null {
  return isValidRole(role) ? INTERVIEW_ROLES[role] : null;
}

// Get all available roles as an array
export function getAllRoles(): RoleConfig[] {
  return Object.values(INTERVIEW_ROLES);
}
