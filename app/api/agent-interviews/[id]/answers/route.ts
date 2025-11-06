/**
 * API endpoint for Agent Interview Answer Submission
 * 
 * POST /api/agent-interviews/[id]/answers - Submit an answer and get next question
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth";
import {
  submitAgentAnswer,
  getAgentInterviewState,
} from "@/src/lib/agent-interview-service";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: agentInterviewId } = await params;
    const body = await req.json();
    const { questionId, answer } = body;

    if (!questionId || !answer) {
      return NextResponse.json(
        { error: "Missing required fields: questionId, answer" },
        { status: 400 }
      );
    }

    // Verify interview belongs to current user
    const agentInterview = await getAgentInterviewState(agentInterviewId);

    if (!agentInterview) {
      return NextResponse.json(
        { error: "Agent interview not found" },
        { status: 404 }
      );
    }

    if (agentInterview.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized access to this interview" },
        { status: 403 }
      );
    }

    if (agentInterview.status === "COMPLETED") {
      return NextResponse.json(
        { error: "This interview has already been completed" },
        { status: 400 }
      );
    }

    console.log(
      `Submitting answer for interview ${agentInterviewId}, question ${questionId}`
    );

    // Submit answer and get evaluation + next question
    const result = await submitAgentAnswer(
      agentInterviewId,
      questionId,
      answer
    );

    return NextResponse.json({
      success: true,
      evaluation: result.evaluation,
      nextQuestion: result.nextQuestion,
      interviewComplete: result.interviewComplete,
    });
  } catch (error) {
    console.error("Error submitting agent answer:", error);
    return NextResponse.json(
      {
        error: "Failed to submit answer",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
