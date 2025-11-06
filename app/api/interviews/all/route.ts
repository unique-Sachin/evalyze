/**
 * API endpoint to fetch all interviews (regular + agent) for history page
 * GET /api/interviews/all - Returns combined list of interviews
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch regular interviews
    const regularInterviews = await prisma.interview.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        roleId: true,
        status: true,
        startedAt: true,
        completedAt: true,
        durationMinutes: true,
        overallScore: true,
        totalQuestions: true,
        _count: {
          select: {
            messages: true,
          },
        },
      },
      orderBy: { startedAt: "desc" },
    });

    // Fetch agent interviews
    const agentInterviews = await prisma.agentInterview.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        roleId: true,
        status: true,
        startedAt: true,
        completedAt: true,
        totalQuestions: true,
        questionsAnswered: true,
        averageScore: true,
        technicalScore: true,
        recommendation: true,
      },
      orderBy: { startedAt: "desc" },
    });

    // Combine and format
    const allInterviews = [
      ...regularInterviews.map((interview) => ({
        ...interview,
        type: "regular" as const,
        completedAt: interview.completedAt?.toISOString() || null,
        startedAt: interview.startedAt.toISOString(),
      })),
      ...agentInterviews.map((interview: typeof agentInterviews[0]) => ({
        id: interview.id,
        roleId: interview.roleId,
        status: interview.status,
        startedAt: interview.startedAt.toISOString(),
        completedAt: interview.completedAt?.toISOString() || null,
        durationMinutes: null,
        overallScore: interview.averageScore || null,
        totalQuestions: interview.totalQuestions,
        type: "agent" as const,
        _count: {
          messages: interview.questionsAnswered,
        },
        technicalScore: interview.technicalScore,
        recommendation: interview.recommendation,
      })),
    ].sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());

    return NextResponse.json(allInterviews);
  } catch (error) {
    console.error("Error fetching all interviews:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch interviews",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
