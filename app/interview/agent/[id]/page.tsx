"use client";

/**
 * Agent Interview Page
 * Conducts the AI-powered interview with voice interaction
 */

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, Mic, MicOff, Sparkles, CheckCircle2, AlertCircle, Code } from "lucide-react";
import { toast } from "sonner";
import CodeSandbox from "@/components/CodeSandbox";

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
  answer?: {
    score: number;
    feedback: string;
    strengths: string[];
    improvements: string[];
  };
}

interface AgentInterview {
  id: string;
  roleId: string;
  status: string;
  profileAnalysis: {
    skills: Array<string | { name: string; proficiency?: string }>;
    strengths: string[];
    gaps: string[];
  };
  totalQuestions: number;
  questionsAnswered: number;
  questions: Question[];
  technicalScore?: number;
  communicationScore?: number;
  problemSolvingScore?: number;
  overallFeedback?: string;
  recommendation?: string;
}

export default function AgentInterviewPage() {
  const params = useParams();
  const router = useRouter();
  const interviewId = params.id as string;

  const [interview, setInterview] = useState<AgentInterview | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEvaluation, setShowEvaluation] = useState(false);

  // Fetch interview data
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
      
      // Find first unanswered question
      const firstUnanswered = data.agentInterview.questions.findIndex(
        (q: Question) => !q.answer
      );
      setCurrentQuestionIndex(firstUnanswered >= 0 ? firstUnanswered : 0);
    } catch (error) {
      console.error("Error fetching interview:", error);
      toast.error(error instanceof Error ? error.message : "Failed to load interview");
      setTimeout(() => router.push("/dashboard"), 2000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartListening = () => {
    setIsListening(true);
    toast.success("🎤 Listening... Speak your answer");
  };

  const handleStopListening = () => {
    setIsListening(false);
    toast.info("🛑 Stopped listening");
  };

  const handleSubmitAnswer = async () => {
    if (!interview || !currentAnswer.trim()) {
      toast.error("Please provide an answer before submitting");
      return;
    }

    const currentQuestion = interview.questions[currentQuestionIndex];
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/agent-interviews/${interviewId}/answers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          questionId: currentQuestion.id,
          answer: currentAnswer.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit answer");
      }

      // Show evaluation
      const updatedQuestions = [...interview.questions];
      updatedQuestions[currentQuestionIndex] = {
        ...currentQuestion,
        answer: data.evaluation,
      };

      setInterview({
        ...interview,
        questions: updatedQuestions,
        questionsAnswered: interview.questionsAnswered + 1,
      });

      setShowEvaluation(true);
      toast.success("Answer evaluated successfully!");

      // Auto-advance after 5 seconds
      setTimeout(() => {
        if (data.interviewComplete) {
          toast.success("Interview complete! Generating final recommendation...");
          setTimeout(() => fetchInterview(), 2000);
        } else {
          handleNextQuestion();
        }
      }, 5000);
    } catch (error) {
      console.error("Error submitting answer:", error);
      toast.error(error instanceof Error ? error.message : "Failed to submit answer");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextQuestion = () => {
    setCurrentAnswer("");
    setShowEvaluation(false);
    setCurrentQuestionIndex((prev) => prev + 1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg text-muted-foreground">Loading your personalized interview...</p>
        </div>
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
          <p className="text-lg">Interview not found</p>
          <Button onClick={() => router.push("/dashboard")} className="mt-4">
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const currentQuestion = interview.questions[currentQuestionIndex];
  const progress = (currentQuestionIndex / interview.totalQuestions) * 100;
  const isComplete = interview.status === "COMPLETED";

  if (isComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
              <CardTitle className="text-2xl">Interview Complete!</CardTitle>
            </div>
            <CardDescription>
              Your personalized interview has been completed and evaluated.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Scores */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-500/10 rounded-lg">
                <p className="text-sm text-muted-foreground">Technical</p>
                <p className="text-3xl font-bold">{interview.technicalScore?.toFixed(1) || "N/A"}</p>
              </div>
              <div className="text-center p-4 bg-purple-500/10 rounded-lg">
                <p className="text-sm text-muted-foreground">Communication</p>
                <p className="text-3xl font-bold">{interview.communicationScore?.toFixed(1) || "N/A"}</p>
              </div>
              <div className="text-center p-4 bg-green-500/10 rounded-lg">
                <p className="text-sm text-muted-foreground">Problem Solving</p>
                <p className="text-3xl font-bold">{interview.problemSolvingScore?.toFixed(1) || "N/A"}</p>
              </div>
            </div>

            {/* Overall Feedback */}
            {interview.overallFeedback && (
              <div>
                <h3 className="font-semibold mb-2">Overall Feedback</h3>
                <p className="text-sm text-muted-foreground">{interview.overallFeedback}</p>
              </div>
            )}

            {/* Recommendation */}
            {interview.recommendation && (
              <div>
                <h3 className="font-semibold mb-2">Recommendation</h3>
                <Badge variant="outline" className="text-lg px-4 py-2">
                  {interview.recommendation.replace("_", " ").toUpperCase()}
                </Badge>
              </div>
            )}

            <Button onClick={() => router.push("/dashboard")} className="w-full" size="lg">
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary" />
              <h1 className="text-2xl font-bold">AI Agent Interview</h1>
            </div>
            <Badge variant="outline">
              Question {currentQuestionIndex + 1} of {interview.totalQuestions}
            </Badge>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Question */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Question</CardTitle>
                  <div className="flex gap-2">
                    <Badge variant="secondary">{currentQuestion.questionType}</Badge>
                    <Badge variant="outline">{currentQuestion.difficulty}</Badge>
                  </div>
                </div>
                <CardDescription>
                  {currentQuestion.category} • {currentQuestion.generatedReason}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-lg mb-4">{currentQuestion.questionText}</p>
                
                {currentQuestion.expectedTopics.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">Expected Topics:</p>
                    <div className="flex flex-wrap gap-2">
                      {currentQuestion.expectedTopics.map((topic, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Coding Interface */}
            {currentQuestion.requiresCoding && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="w-5 h-5" />
                    Code Editor ({currentQuestion.codeLanguage})
                  </CardTitle>
                  <CardDescription>
                    Write your solution below. Click Submit when ready.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border rounded-lg overflow-hidden">
                    <CodeSandbox />
                  </div>
                  
                  <div className="flex gap-2">
                    <textarea
                      value={currentAnswer}
                      onChange={(e) => setCurrentAnswer(e.target.value)}
                      placeholder="Paste your code here or use the code editor above..."
                      rows={6}
                      className="flex-1 p-4 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  <Button
                    onClick={handleSubmitAnswer}
                    disabled={!currentAnswer.trim() || isSubmitting}
                    className="w-full"
                    size="lg"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Evaluating Code...
                      </>
                    ) : (
                      <>
                        <Code className="mr-2 h-4 w-4" />
                        Submit Code
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Answer Input (for non-coding) */}
            {!currentQuestion.requiresCoding && (
              <Card>
                <CardHeader>
                  <CardTitle>Your Answer</CardTitle>
                  <CardDescription>
                    {isListening ? "🎤 Listening... Speak your answer" : "Type or speak your answer"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <textarea
                    value={currentAnswer}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                    placeholder="Type your answer here or use voice input..."
                    rows={8}
                    className="w-full p-4 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                    disabled={isListening || isSubmitting}
                  />
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={isListening ? handleStopListening : handleStartListening}
                      variant={isListening ? "destructive" : "outline"}
                      className="flex-1"
                    >
                      {isListening ? (
                        <>
                          <MicOff className="mr-2 h-4 w-4" />
                          Stop Listening
                        </>
                      ) : (
                        <>
                          <Mic className="mr-2 h-4 w-4" />
                          Start Voice Input
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={handleSubmitAnswer}
                      disabled={!currentAnswer.trim() || isSubmitting}
                      className="flex-1"
                      size="lg"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Evaluating...
                        </>
                      ) : (
                        "Submit Answer"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Evaluation */}
            {showEvaluation && currentQuestion.answer && (
              <Card className="border-green-500/50 bg-green-500/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    Evaluation Results
                  </CardTitle>
                  <CardDescription>Score: {currentQuestion.answer.score.toFixed(1)}/10</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Feedback</h4>
                    <p className="text-sm text-muted-foreground">{currentQuestion.answer.feedback}</p>
                  </div>
                  
                  {currentQuestion.answer.strengths.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2 text-green-600">Strengths</h4>
                      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                        {currentQuestion.answer.strengths.map((s, idx) => (
                          <li key={idx}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {currentQuestion.answer.improvements.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2 text-amber-600">Areas for Improvement</h4>
                      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                        {currentQuestion.answer.improvements.map((i, idx) => (
                          <li key={idx}>{i}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <Button onClick={handleNextQuestion} className="w-full">
                    Next Question →
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {interview.profileAnalysis.skills.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Key Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {interview.profileAnalysis.skills.slice(0, 5).map((skill, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {typeof skill === 'string' ? skill : skill.name || JSON.stringify(skill)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {interview.profileAnalysis.strengths.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Strengths</h4>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      {interview.profileAnalysis.strengths.map((s, idx) => (
                        <li key={idx}>• {s}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {interview.questions.map((q, idx) => (
                    <div
                      key={q.id}
                      className={`flex items-center gap-2 text-sm ${
                        idx === currentQuestionIndex ? "font-bold text-primary" : ""
                      }`}
                    >
                      {q.answer ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      ) : idx === currentQuestionIndex ? (
                        <div className="w-4 h-4 rounded-full border-2 border-primary" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-muted" />
                      )}
                      <span className="truncate">Q{idx + 1}: {q.category}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
