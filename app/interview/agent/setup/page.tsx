"use client";

/**
 * Agent Interview Setup Page
 * Allows candidates to upload resume and job description before starting the interview
 */

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, FileText, Briefcase, Sparkles } from "lucide-react";
import { toast } from "sonner";

function AgentInterviewSetupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleIdFromUrl = searchParams.get("role");
  
  const [roleId, setRoleId] = useState(roleIdFromUrl || "");
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const roles = [
    { id: "react-developer", title: "React Developer" },
    { id: "genai-developer", title: "GenAI Developer" },
    { id: "system-design", title: "System Design" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!roleId) {
      toast.error("Role not specified. Please go back to dashboard.");
      return;
    }

    if (resumeText.trim().length < 50) {
      toast.error("Please provide more details in your resume (at least 50 characters)");
      return;
    }

    if (jobDescription.trim().length < 50) {
      toast.error("Please provide more details in the job description (at least 50 characters)");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/agent-interviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          roleId,
          resumeText: resumeText.trim(),
          jobDescription: jobDescription.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create agent interview");
      }

      toast.success("Interview created! Analyzing your profile...");
      
      // Navigate to the interview page
      router.push(`/interview/agent/${data.agentInterviewId}`);
    } catch (error) {
      console.error("Error creating agent interview:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create interview");
    } finally {
      setIsSubmitting(false);
    }
  };

  const placeholderResume = `Example:

Software Engineer with 5+ years of experience in full-stack development.

Skills:
- React, TypeScript, Node.js, Python
- AWS, Docker, Kubernetes
- System Design, Microservices

Experience:
- Senior Software Engineer at TechCorp (2021-Present)
  - Led development of customer-facing dashboard using React and TypeScript
  - Improved application performance by 40% through optimization
  - Mentored 3 junior developers

- Software Engineer at StartupXYZ (2019-2021)
  - Built RESTful APIs using Node.js and Express
  - Implemented CI/CD pipelines using GitHub Actions`;

  const placeholderJD = `Example:

We are looking for a Senior React Developer to join our team.

Requirements:
- 3+ years of experience with React and TypeScript
- Strong understanding of state management (Redux, Zustand)
- Experience with testing frameworks (Jest, React Testing Library)
- Knowledge of performance optimization techniques
- Excellent communication skills

Nice to have:
- Experience with Next.js
- Familiarity with backend technologies (Node.js, GraphQL)
- System design knowledge`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container max-w-5xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold">AI Agent Interview</h1>
          </div>
          <p className="text-xl text-muted-foreground">
            Personalized interview based on your resume and job description
          </p>
        </div>

        {/* Role Selection Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Select Interview Role</CardTitle>
            <CardDescription>Choose the position you&apos;re preparing for</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {roles.map((role) => (
                <Button
                  key={role.id}
                  variant={roleId === role.id ? "default" : "outline"}
                  className="h-auto py-4"
                  onClick={() => setRoleId(role.id)}
                >
                  <div className="text-center">
                    <div className="font-semibold">{role.title}</div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <FileText className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="font-semibold">Profile Analysis</p>
                  <p className="text-sm text-muted-foreground">AI analyzes your background</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <p className="font-semibold">Custom Questions</p>
                  <p className="text-sm text-muted-foreground">Tailored to your profile</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Briefcase className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="font-semibold">Real-time Feedback</p>
                  <p className="text-sm text-muted-foreground">Instant evaluation</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Resume Input */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Your Resume / Background
              </CardTitle>
              <CardDescription>
                Paste your resume text or describe your professional background
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder={placeholderResume}
                rows={12}
                className="font-mono text-sm"
                required
              />
              <p className="text-xs text-muted-foreground mt-2">
                {resumeText.length} characters (minimum 50)
              </p>
            </CardContent>
          </Card>

          {/* Job Description Input */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Job Description
              </CardTitle>
              <CardDescription>
                Paste the job description you&apos;re preparing for
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder={placeholderJD}
                rows={12}
                className="font-mono text-sm"
                required
              />
              <p className="text-xs text-muted-foreground mt-2">
                {jobDescription.length} characters (minimum 50)
              </p>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="flex-1"
            >
              Go Back
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || resumeText.length < 50 || jobDescription.length < 50}
              className="flex-1"
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Interview...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Start AI Interview
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Footer Note */}
        <Card className="mt-8 border-dashed">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground text-center">
              <strong>Privacy Note:</strong> Your data is used solely for generating personalized interview questions
              and will be stored securely. The AI will analyze your background to create the most relevant questions.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function AgentInterviewSetupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <AgentInterviewSetupContent />
    </Suspense>
  );
}
