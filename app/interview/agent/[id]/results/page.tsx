"use client";

/**
 * Agent Interview Results Page
 * Shows detailed breakdown of questions, answers, and evaluations
 */

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { 
  Loader2, 
  ArrowLeft, 
  CheckCircle2, 
  TrendingUp, 
  TrendingDown,
  Award,
  Calendar,
  Clock,
  Code,
  MessageSquare,
  Sparkles
} from "lucide-react";
import { toast } from "sonner";

interface Question {
  id: string;
  questionText: string;
  questionType: string;
  category: string;
  difficulty: string;
  generatedReason: string;
  expectedTopics: string[];
  requiresCoding: boolean;
  codeLanguage?: string;
  orderIndex: number;
  answer?: {
    answerText?: string;
    codeSubmitted?: string;
    score: number;
    relevance: number;
    accuracy: number;
    completeness: number;
    depth: number;
    feedback: string;
    strengths: string[];
    improvements: string[];
    missingTopics: string[];
    answeredAt: string;
  };
}

interface AgentInterview {
  id: string;
  roleId: string;
  status: string;
  startedAt: string;
  completedAt?: string;
  resumeText: string;
  jobDescription: string;
  profileAnalysis: {
    skills: Array<string | { name: string; proficiency?: string }>;
    experience?: Array<{ role: string; years: number; highlights: string[] }>;
    strengths: string[];
    gaps: string[];
    keyProjects?: string[];
  };
  totalQuestions: number;
  questionsAnswered: number;
  averageScore?: number;
  technicalScore?: number;
  communicationScore?: number;
  problemSolvingScore?: number;
  overallFeedback?: string;
  recommendation?: string;
  hiringDecision?: string;
  questions: Question[];
}

export default function AgentInterviewResultsPage() {
  const params = useParams();
  const router = useRouter();
  const interviewId = params.id as string;

  const [interview, setInterview] = useState<AgentInterview | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchInterview();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interviewId]);

  const fetchInterview = async () => {
    try {
      const response = await fetch(`/api/agent-interviews?id=${interviewId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load interview");
      }

      setInterview(data.agentInterview);
    } catch (error) {
      console.error("Error fetching interview:", error);
      toast.error(error instanceof Error ? error.message : "Failed to load interview");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-600";
    if (score >= 6) return "text-blue-600";
    if (score >= 4) return "text-amber-600";
    return "text-red-600";
  };

  const getRecommendationBadge = (recommendation?: string) => {
    if (!recommendation) return null;
    
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", color: string }> = {
      strong_yes: { variant: "default", color: "bg-green-500" },
      yes: { variant: "default", color: "bg-blue-500" },
      maybe: { variant: "secondary", color: "bg-amber-500" },
      no: { variant: "destructive", color: "bg-red-500" },
      strong_no: { variant: "destructive", color: "bg-red-700" },
    };

    const config = variants[recommendation] || { variant: "outline" as const, color: "" };
    
    return (
      <Badge variant={config.variant} className={`${config.color} text-white px-4 py-2 text-base`}>
        {recommendation.replace(/_/g, " ").toUpperCase()}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg text-muted-foreground">Loading interview results...</p>
        </div>
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-lg mb-4">Interview not found</p>
            <Button onClick={() => router.push("/history")}>
              Back to History
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const answeredQuestions = interview.questions.filter(q => q.answer);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push("/history")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to History
          </Button>

          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Sparkles className="w-8 h-8 text-primary" />
                <h1 className="text-3xl font-bold">AI Agent Interview Results</h1>
              </div>
              <div className="flex items-center gap-4 text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">{formatDate(interview.startedAt)}</span>
                </div>
                {interview.completedAt && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">
                      Completed {formatDate(interview.completedAt)}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <Badge variant={interview.status === "COMPLETED" ? "default" : "secondary"}>
              {interview.status}
            </Badge>
          </div>
        </div>

        {/* Overall Scores */}
        {interview.status === "COMPLETED" && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Overall Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Average Score</p>
                  <p className="text-4xl font-bold">{interview.averageScore?.toFixed(1) || "N/A"}</p>
                  <p className="text-xs text-muted-foreground">out of 10</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-purple-500/10 to-purple-500/5 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Technical</p>
                  <p className="text-4xl font-bold">{interview.technicalScore?.toFixed(1) || "N/A"}</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Communication</p>
                  <p className="text-4xl font-bold">{interview.communicationScore?.toFixed(1) || "N/A"}</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-amber-500/10 to-amber-500/5 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Problem Solving</p>
                  <p className="text-4xl font-bold">{interview.problemSolvingScore?.toFixed(1) || "N/A"}</p>
                </div>
              </div>

              {interview.recommendation && (
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium mb-1">Recommendation</p>
                    <p className="text-xs text-muted-foreground">{interview.hiringDecision || "Pending review"}</p>
                  </div>
                  {getRecommendationBadge(interview.recommendation)}
                </div>
              )}

              {interview.overallFeedback && (
                <div className="mt-4 p-4 bg-muted/30 rounded-lg">
                  <p className="text-sm font-medium mb-2">Overall Feedback</p>
                  <p className="text-sm text-muted-foreground">{interview.overallFeedback}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Profile Analysis */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Profile Analysis</CardTitle>
            <CardDescription>AI-generated insights from your resume and job description</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {interview.profileAnalysis.skills.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Key Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {interview.profileAnalysis.skills.map((skill, idx) => (
                    <Badge key={idx} variant="secondary">
                      {typeof skill === 'string' ? skill : skill.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {interview.profileAnalysis.strengths.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  Strengths
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {interview.profileAnalysis.strengths.map((s, idx) => (
                    <li key={idx}>• {s}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {interview.profileAnalysis.gaps.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-amber-600" />
                  Areas to Validate
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {interview.profileAnalysis.gaps.map((g, idx) => (
                    <li key={idx}>• {g}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Questions & Answers */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <MessageSquare className="w-6 h-6" />
            Questions & Answers ({answeredQuestions.length}/{interview.totalQuestions})
          </h2>

          {interview.questions.map((question, idx) => (
            <Card key={question.id} className={question.answer ? "" : "opacity-60"}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">Q{idx + 1}</Badge>
                      <Badge variant="secondary">{question.questionType}</Badge>
                      <Badge variant="outline">{question.difficulty}</Badge>
                      {question.requiresCoding && (
                        <Badge variant="default" className="bg-purple-500">
                          <Code className="w-3 h-3 mr-1" />
                          {question.codeLanguage}
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg">{question.questionText}</CardTitle>
                    <CardDescription className="mt-2">
                      {question.category} • {question.generatedReason}
                    </CardDescription>
                  </div>
                  {question.answer && (
                    <div className="text-right">
                      <p className={`text-3xl font-bold ${getScoreColor(question.answer.score)}`}>
                        {question.answer.score.toFixed(1)}
                      </p>
                      <p className="text-xs text-muted-foreground">/ 10</p>
                    </div>
                  )}
                </div>

                {question.expectedTopics.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs font-medium mb-1 text-muted-foreground">Expected Topics:</p>
                    <div className="flex flex-wrap gap-1">
                      {question.expectedTopics.map((topic, topicIdx) => (
                        <Badge key={topicIdx} variant="outline" className="text-xs">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardHeader>

              {question.answer && (
                <CardContent className="space-y-4">
                  <Separator />
                  
                  {/* Answer */}
                  <div>
                    <h4 className="font-semibold mb-2">Your Answer:</h4>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-sm whitespace-pre-wrap">
                        {question.requiresCoding 
                          ? question.answer.codeSubmitted 
                          : question.answer.answerText}
                      </p>
                    </div>
                  </div>

                  {/* Detailed Scores */}
                  <div className="grid grid-cols-4 gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Relevance</p>
                      <Progress value={question.answer.relevance * 10} className="h-2" />
                      <p className="text-xs font-medium mt-1">{question.answer.relevance.toFixed(1)}/10</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Accuracy</p>
                      <Progress value={question.answer.accuracy * 10} className="h-2" />
                      <p className="text-xs font-medium mt-1">{question.answer.accuracy.toFixed(1)}/10</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Completeness</p>
                      <Progress value={question.answer.completeness * 10} className="h-2" />
                      <p className="text-xs font-medium mt-1">{question.answer.completeness.toFixed(1)}/10</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Depth</p>
                      <Progress value={question.answer.depth * 10} className="h-2" />
                      <p className="text-xs font-medium mt-1">{question.answer.depth.toFixed(1)}/10</p>
                    </div>
                  </div>

                  {/* Feedback */}
                  <div>
                    <h4 className="font-semibold mb-2">Feedback:</h4>
                    <p className="text-sm text-muted-foreground">{question.answer.feedback}</p>
                  </div>

                  {/* Strengths & Improvements */}
                  <div className="grid md:grid-cols-2 gap-4">
                    {question.answer.strengths.length > 0 && (
                      <div className="p-3 bg-green-500/5 border border-green-500/20 rounded-lg">
                        <h4 className="font-semibold text-sm mb-2 flex items-center gap-1 text-green-600">
                          <CheckCircle2 className="w-4 h-4" />
                          Strengths
                        </h4>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          {question.answer.strengths.map((s, sIdx) => (
                            <li key={sIdx}>• {s}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {question.answer.improvements.length > 0 && (
                      <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg">
                        <h4 className="font-semibold text-sm mb-2 flex items-center gap-1 text-amber-600">
                          <TrendingUp className="w-4 h-4" />
                          Areas for Improvement
                        </h4>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          {question.answer.improvements.map((i, iIdx) => (
                            <li key={iIdx}>• {i}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {question.answer.missingTopics.length > 0 && (
                    <div className="p-3 bg-red-500/5 border border-red-500/20 rounded-lg">
                      <h4 className="font-semibold text-sm mb-2 text-red-600">Missing Topics:</h4>
                      <div className="flex flex-wrap gap-2">
                        {question.answer.missingTopics.map((topic, tIdx) => (
                          <Badge key={tIdx} variant="destructive" className="text-xs">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground">
                    Answered: {formatDate(question.answer.answeredAt)}
                  </div>
                </CardContent>
              )}

              {!question.answer && (
                <CardContent>
                  <p className="text-sm text-muted-foreground italic">Not answered yet</p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4">
          <Button
            variant="outline"
            onClick={() => router.push("/history")}
            className="flex-1"
          >
            Back to History
          </Button>
          {interview.status === "IN_PROGRESS" && (
            <Button
              onClick={() => router.push(`/interview/agent/${interview.id}`)}
              className="flex-1"
            >
              Continue Interview
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
