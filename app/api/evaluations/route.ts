import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/src/lib/auth';
import { 
  evaluateAnswer, 
  storeAnswerEvaluation,
  getInterviewEvaluations,
  generateFinalAnalysisFromEvaluations
} from '@/src/lib/answer-evaluation-service';

/**
 * POST /api/evaluations - Evaluate and store an answer
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      action,
      interviewId,
      questionId,
      candidateAnswer,
      expectedAnswer,
      questionText,
      expectedTopics,
      isFollowUp,
      followUpId
    } = body;

    // Generate final analysis from stored evaluations
    if (action === 'finalAnalysis') {
      if (!interviewId) {
        return NextResponse.json(
          { error: 'interviewId is required' },
          { status: 400 }
        );
      }

      const analysis = await generateFinalAnalysisFromEvaluations(interviewId);
      return NextResponse.json(analysis);
    }

    // Evaluate and store an answer
    if (!interviewId || !questionId || !candidateAnswer || !questionText) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Evaluate the answer
    const evaluation = await evaluateAnswer(
      candidateAnswer,
      expectedAnswer || null,
      questionText,
      expectedTopics || [],
      isFollowUp || false
    );

    // Store the evaluation
    await storeAnswerEvaluation(
      interviewId,
      questionId,
      candidateAnswer,
      expectedAnswer || null,
      evaluation,
      isFollowUp || false,
      followUpId
    );

    return NextResponse.json(evaluation);
  } catch (error) {
    console.error('Evaluation error:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/evaluations?interviewId=xxx - Get all evaluations for an interview
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const interviewId = searchParams.get('interviewId');

    if (!interviewId) {
      return NextResponse.json(
        { error: 'interviewId is required' },
        { status: 400 }
      );
    }

    const evaluations = await getInterviewEvaluations(interviewId);
    return NextResponse.json(evaluations);
  } catch (error) {
    console.error('Get evaluations error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
