import { prisma } from './prisma';
import { ChatGroq } from '@langchain/groq';
import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { RunnableSequence } from '@langchain/core/runnables';

// Initialize Groq LLM for evaluation (Fast & Free!)
const evaluationModel = new ChatGroq({
  model: 'llama-3.1-8b-instant', // Fast Llama 3.1 model
  apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY,
  temperature: 0.1,
  maxTokens: 800,
});

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
 * Evaluate a candidate's answer against the expected answer
 */
export async function evaluateAnswer(
  candidateAnswer: string,
  expectedAnswer: string | null,
  questionText: string,
  expectedTopics: string[],
  isFollowUp: boolean = false
): Promise<AnswerEvaluationResult> {
  try {
    const prompt = PromptTemplate.fromTemplate(`You are an expert technical interviewer evaluating a candidate's answer.

QUESTION: {question}

EXPECTED ANSWER: {expectedAnswer}

EXPECTED TOPICS TO COVER: {expectedTopics}

CANDIDATE'S ANSWER: {candidateAnswer}

IS FOLLOW-UP QUESTION: {isFollowUp}

Evaluate the candidate's answer based on:
1. RELEVANCE (1-10): How relevant is the answer to the question?
2. ACCURACY (1-10): How technically accurate is the answer?
3. COMPLETENESS (1-10): Did they cover all important aspects?
4. OVERALL SCORE (1-10): Weighted average of the above

Also provide:
- Brief constructive feedback (2-3 sentences)
- 2-3 strengths (what they did well)
- 1-2 improvements (what they could improve)
- Missing topics (from expected topics list that weren't covered)

Respond in this EXACT JSON format:
{{
  "relevance": [score 1-10],
  "accuracy": [score 1-10],
  "completeness": [score 1-10],
  "score": [overall score 1-10],
  "feedback": "[constructive feedback]",
  "strengths": ["strength 1", "strength 2"],
  "improvements": ["improvement 1", "improvement 2"],
  "missing_topics": ["topic 1", "topic 2"]
}}
`);

    const chain = RunnableSequence.from([
      prompt,
      evaluationModel,
      new StringOutputParser(),
    ]);

    const result = await chain.invoke({
      question: questionText,
      expectedAnswer: expectedAnswer || 'No specific expected answer provided. Evaluate based on technical accuracy and depth.',
      expectedTopics: expectedTopics.join(', ') || 'General technical knowledge',
      candidateAnswer,
      isFollowUp: isFollowUp ? 'Yes' : 'No'
    });



    const cleaned = result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const evaluation = JSON.parse(cleaned);

    console.log('Raw evaluation result:', evaluation);

    return {
      score: ensureValidScore(evaluation.score),
      relevance: ensureValidScore(evaluation.relevance),
      accuracy: ensureValidScore(evaluation.accuracy),
      completeness: ensureValidScore(evaluation.completeness),
      feedback: evaluation.feedback || 'Good attempt.',
      strengths: ensureArray(evaluation.strengths, 2),
      improvements: ensureArray(evaluation.improvements, 1),
      missingTopics: Array.isArray(evaluation.missing_topics) ? evaluation.missing_topics : []
    };

  } catch (error) {
    console.error('Failed to evaluate answer:', error);
    return createFallbackEvaluation();
  }
}

/**
 * Store answer evaluation in database
 */
export async function storeAnswerEvaluation(
  interviewId: string,
  questionId: string,
  candidateAnswer: string,
  expectedAnswer: string | null,
  evaluation: AnswerEvaluationResult,
  isFollowUp: boolean = false,
  followUpId?: string
) {
  try {
    return await prisma.answerEvaluation.create({
      data: {
        interviewId,
        questionId,
        followUpId,
        candidateAnswer,
        expectedAnswer,
        isFollowUp,
        score: evaluation.score,
        relevance: evaluation.relevance,
        accuracy: evaluation.accuracy,
        completeness: evaluation.completeness,
        feedback: evaluation.feedback,
        strengths: evaluation.strengths,
        improvements: evaluation.improvements,
        missingTopics: evaluation.missingTopics,
      },
    });
  } catch (error) {
    console.error('Failed to store answer evaluation:', error);
    throw error; // Re-throw to let caller handle it
  }
}

/**
 * Get all evaluations for an interview
 */
export async function getInterviewEvaluations(interviewId: string) {
  return await prisma.answerEvaluation.findMany({
    where: { interviewId },
    orderBy: { answeredAt: 'asc' },
  });
}

/**
 * Calculate aggregate statistics from evaluations
 */
export async function calculateInterviewStatistics(interviewId: string) {
  const evaluations = await getInterviewEvaluations(interviewId);

  if (evaluations.length === 0) {
    return {
      averageScore: 0,
      averageRelevance: 0,
      averageAccuracy: 0,
      averageCompleteness: 0,
      totalQuestions: 0,
      totalFollowUps: 0,
    };
  }

  const mainQuestionEvaluations = evaluations.filter(e => !e.isFollowUp);
  const followUpEvaluations = evaluations.filter(e => e.isFollowUp);

  const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);
  const avg = (arr: number[]) => arr.length > 0 ? sum(arr) / arr.length : 0;

  return {
    averageScore: avg(evaluations.map(e => e.score)),
    averageRelevance: avg(evaluations.map(e => e.relevance)),
    averageAccuracy: avg(evaluations.map(e => e.accuracy)),
    averageCompleteness: avg(evaluations.map(e => e.completeness)),
    totalQuestions: mainQuestionEvaluations.length,
    totalFollowUps: followUpEvaluations.length,
    allEvaluations: evaluations,
  };
}

/**
 * Generate final interview analysis from evaluations
 */
export async function generateFinalAnalysisFromEvaluations(interviewId: string) {
  const stats = await calculateInterviewStatistics(interviewId);
  
  if (!stats.allEvaluations || stats.allEvaluations.length === 0) {
    return null;
  }

  // Aggregate all strengths and improvements
  const allStrengths = stats.allEvaluations.flatMap(e => e.strengths);
  const allImprovements = stats.allEvaluations.flatMap(e => e.improvements);
  const allMissingTopics = stats.allEvaluations.flatMap(e => e.missingTopics);

  // Get unique and most frequent items
  const topStrengths = getTopItems(allStrengths, 5);
  const topImprovements = getTopItems(allImprovements, 4);
  const topMissingTopics = getTopItems(allMissingTopics, 3);

  // Calculate hiring recommendation based on average score
  let recommendation = 'maybe';
  if (stats.averageScore >= 9) recommendation = 'strong_yes';
  else if (stats.averageScore >= 7.5) recommendation = 'yes';
  else if (stats.averageScore >= 6) recommendation = 'maybe';
  else if (stats.averageScore >= 4) recommendation = 'no';
  else recommendation = 'strong_no';

  return {
    technical_knowledge: stats.averageAccuracy,
    communication: stats.averageRelevance,
    problem_solving: stats.averageCompleteness,
    experience: stats.averageScore,
    overall_score: stats.averageScore,
    summary: `Candidate completed ${stats.totalQuestions} main questions and ${stats.totalFollowUps} follow-ups with an average score of ${stats.averageScore.toFixed(1)}/10.`,
    strengths: topStrengths,
    areas_for_improvement: topImprovements,
    key_insights: [
      `Accuracy: ${stats.averageAccuracy.toFixed(1)}/10`,
      `Relevance: ${stats.averageRelevance.toFixed(1)}/10`,
      `Completeness: ${stats.averageCompleteness.toFixed(1)}/10`,
      ...topMissingTopics.map(t => `Could improve on: ${t}`)
    ].slice(0, 5),
    hiring_recommendation: recommendation
  };
}

// Helper functions
function ensureValidScore(score: unknown): number {
  const num = typeof score === 'number' ? score : parseFloat(String(score)) || 5;
  return Math.max(1, Math.min(10, num));
}

function ensureArray(arr: unknown, minLength: number = 2): string[] {
  if (Array.isArray(arr) && arr.length >= minLength) {
    return arr.slice(0, 5);
  }
  if (Array.isArray(arr) && arr.length > 0) {
    return arr;
  }
  return [];
}

function createFallbackEvaluation(): AnswerEvaluationResult {
  return {
    score: 5,
    relevance: 5,
    accuracy: 5,
    completeness: 5,
    feedback: 'Unable to evaluate answer automatically.',
    strengths: ['Provided an answer'],
    improvements: ['Could provide more detail'],
    missingTopics: []
  };
}

function getTopItems(items: string[], count: number): string[] {
  // Count frequency of each item
  const frequency = items.reduce((acc, item) => {
    acc[item] = (acc[item] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Sort by frequency and get top items
  return Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([item]) => item);
}
