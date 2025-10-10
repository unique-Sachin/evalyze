import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/src/lib/auth';
import { 
  getRandomQuestion, 
  getQuestionById, 
  getInterviewGreeting 
} from '@/src/lib/question-service';

/**
 * GET /api/questions?roleId=xxx&excludeIds=id1,id2
 * Get a random question for a role, optionally excluding some IDs
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const roleId = searchParams.get('roleId');
    const questionId = searchParams.get('questionId');
    const action = searchParams.get('action');
    const excludeIdsParam = searchParams.get('excludeIds');

    // Get greeting for a role
    if (action === 'greeting' && roleId) {
      const greeting = await getInterviewGreeting(roleId);
      return NextResponse.json({ greeting });
    }

    // Get specific question by ID
    if (questionId) {
      const question = await getQuestionById(questionId);
      if (!question) {
        return NextResponse.json({ error: 'Question not found' }, { status: 404 });
      }
      return NextResponse.json(question);
    }

    // Get random question
    if (!roleId) {
      return NextResponse.json(
        { error: 'roleId is required' },
        { status: 400 }
      );
    }

    const excludeIds = excludeIdsParam ? excludeIdsParam.split(',') : [];
    const question = await getRandomQuestion(roleId, excludeIds);

    if (!question) {
      return NextResponse.json({ error: 'No questions available' }, { status: 404 });
    }

    return NextResponse.json(question);
  } catch (error) {
    console.error('Get questions error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
