/**
 * Client-side API wrapper for question and evaluation operations
 * These functions call server-side API routes instead of direct Prisma access
 */

export interface QuestionWithFollowUps {
  id: string;
  question: string;
  answer: string | null;
  category: string;
  difficulty: string;
  expectedTopics: string[];
  timeEstimate: number | null;
  requiresCoding: boolean; // TRUE = coding question, FALSE = conversational
  codeLanguage: string | null; // e.g., 'javascript', 'typescript', 'python'
  correctCode: string | null; // Model solution for coding questions
  evaluationCriteria: string | null; // Criteria for code evaluation
  followUps: {
    id: string;
    followUp: string;
    answer: string | null;
    order: number;
  }[];
}

export interface AnswerEvaluationResult {
  score: number;
  relevance: number;
  accuracy: number;
  completeness: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  missingTopics: string[];
}

/**
 * Get a random question for a role, excluding already asked questions
 */
export async function getRandomQuestion(
  roleId: string,
  excludeIds: string[] = []
): Promise<QuestionWithFollowUps | null> {
  try {
    const excludeIdsParam = excludeIds.length > 0 ? `&excludeIds=${excludeIds.join(',')}` : '';
    const response = await fetch(`/api/questions?roleId=${roleId}${excludeIdsParam}`);
    
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('Failed to fetch question');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to get random question:', error);
    return null;
  }
}

/**
 * Get a specific question by ID
 */
export async function getQuestionById(questionId: string): Promise<QuestionWithFollowUps | null> {
  try {
    const response = await fetch(`/api/questions?questionId=${questionId}`);
    
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('Failed to fetch question');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to get question by ID:', error);
    return null;
  }
}

/**
 * Get interview greeting for a role
 */
export async function getInterviewGreeting(roleId: string): Promise<string> {
  try {
    const response = await fetch(`/api/questions?action=greeting&roleId=${roleId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch greeting');
    }
    
    const data = await response.json();
    return data.greeting || "Hello! I'm your AI interviewer. Let's begin the interview.";
  } catch (error) {
    console.error('Failed to get interview greeting:', error);
    return "Hello! I'm your AI interviewer. Let's begin the interview.";
  }
}

/**
 * Evaluate and store an answer (handles both text and code)
 */
export async function evaluateAndStoreAnswer(
  interviewId: string,
  questionId: string,
  candidateAnswer: string,
  expectedAnswer: string | null,
  questionText: string,
  expectedTopics: string[],
  isFollowUp: boolean = false,
  followUpId?: string,
  requiresCoding?: boolean,
  codeLanguage?: string,
  evaluationCriteria?: {
    mustHave?: string[];
    shouldHave?: string[];
    bonus?: string[];
  }
): Promise<AnswerEvaluationResult | null> {
  try {
    const response = await fetch('/api/evaluations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        interviewId,
        questionId,
        candidateAnswer,
        expectedAnswer,
        questionText,
        expectedTopics,
        isFollowUp,
        followUpId,
        requiresCoding,
        codeLanguage,
        evaluationCriteria
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to evaluate answer');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to evaluate and store answer:', error);
    return null;
  }
}

/**
 * Get all evaluations for an interview
 */
export async function getInterviewEvaluations(interviewId: string) {
  try {
    const response = await fetch(`/api/evaluations?interviewId=${interviewId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch evaluations');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to get interview evaluations:', error);
    return [];
  }
}

/**
 * Generate final analysis from stored evaluations
 */
export async function generateFinalAnalysisFromEvaluations(interviewId: string) {
  try {
    const response = await fetch('/api/evaluations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'finalAnalysis',
        interviewId
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to generate final analysis');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to generate final analysis:', error);
    return null;
  }
}
