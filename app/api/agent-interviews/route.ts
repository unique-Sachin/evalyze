/**
 * API endpoint for Agent Interviews
 * 
 * POST /api/agent-interviews - Create a new agent interview with resume + JD
 * GET /api/agent-interviews?id=xxx - Get interview details
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth";
import {
  initializeAgentInterview,
  getAgentInterviewState,
} from "@/src/lib/agent-interview-service";

/**
 * POST /api/agent-interviews
 * Create a new agent interview session
 * 
 * Body:
 * - roleId: string (e.g., "react-developer", "genai-developer")
 * - resumeText: string (extracted resume text)
 * - jobDescription: string (job description text)
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { roleId, resumeText, jobDescription } = body;

    if (!roleId || !resumeText || !jobDescription) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          required: ["roleId", "resumeText", "jobDescription"],
        },
        { status: 400 }
      );
    }

    // Validate that resume and job description have sufficient content
    if (resumeText.trim().length < 50) {
      return NextResponse.json(
        { error: "Resume text is too short. Please provide more details." },
        { status: 400 }
      );
    }

    if (jobDescription.trim().length < 50) {
      return NextResponse.json(
        { error: "Job description is too short. Please provide more details." },
        { status: 400 }
      );
    }

    console.log(
      `Creating agent interview for user ${session.user.id}, role: ${roleId}`
    );

    // Initialize the agent interview (runs profile analysis and question generation)
    const agentInterviewId = await initializeAgentInterview(
      session.user.id,
      roleId,
      resumeText,
      jobDescription
    );

    // Get the created interview with generated questions
    const agentInterview = await getAgentInterviewState(agentInterviewId);

    if (!agentInterview) {
      return NextResponse.json(
        { error: "Failed to create agent interview" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        agentInterviewId,
        profileAnalysis: agentInterview.profileAnalysis,
        totalQuestions: agentInterview.questions.length,
        firstQuestion: agentInterview.questions[0] || null,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating agent interview:", error);
    return NextResponse.json(
      {
        error: "Failed to create agent interview",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/agent-interviews?id=xxx
 * Get agent interview details
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const agentInterviewId = searchParams.get("id");

    if (!agentInterviewId) {
      return NextResponse.json(
        { error: "Missing agent interview ID" },
        { status: 400 }
      );
    }

    const agentInterview = await getAgentInterviewState(agentInterviewId);

    if (!agentInterview) {
      return NextResponse.json(
        { error: "Agent interview not found" },
        { status: 404 }
      );
    }

    // Verify that the interview belongs to the current user
    if (agentInterview.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized access to this interview" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      agentInterview: {
        id: agentInterview.id,
        roleId: agentInterview.roleId,
        status: agentInterview.status,
        startedAt: agentInterview.startedAt,
        completedAt: agentInterview.completedAt,
        profileAnalysis: agentInterview.profileAnalysis,
        totalQuestions: agentInterview.totalQuestions,
        questionsAnswered: agentInterview.questionsAnswered,
        averageScore: agentInterview.averageScore,
        technicalScore: agentInterview.technicalScore,
        communicationScore: agentInterview.communicationScore,
        problemSolvingScore: agentInterview.problemSolvingScore,
        overallFeedback: agentInterview.overallFeedback,
        recommendation: agentInterview.recommendation,
        hiringDecision: agentInterview.hiringDecision,
        questions: agentInterview.questions.map((q: any) => ({
          id: q.id,
          questionText: q.questionText,
          questionType: q.questionType,
          category: q.category,
          difficulty: q.difficulty,
          orderIndex: q.orderIndex,
          generatedReason: q.generatedReason,
          expectedTopics: q.expectedTopics,
          requiresCoding: q.requiresCoding,
          codeLanguage: q.codeLanguage,
          answer: q.answer,
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching agent interview:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch agent interview",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
