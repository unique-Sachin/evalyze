import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { RunnableSequence } from '@langchain/core/runnables';
import { 
  getRandomQuestion, 
  getInterviewGreeting, 
  getQuestionById,
  evaluateAndStoreAnswer,
  generateFinalAnalysisFromEvaluations
} from './question-client';

// Initialize Gemini LLM
const model = new ChatGoogleGenerativeAI({
  model: 'gemini-2.0-flash',
  temperature: 0.1,
  maxOutputTokens: 500,
  apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
});

export interface InterviewContext {
  roleId: string;
  conversationHistory: Array<{ role: 'user' | 'agent'; content: string }>;
  currentQuestionId?: string;
  askedQuestionIds: string[];
  userResponses: string[];
  followUpCount?: number; // Track follow-ups for current question
  remainingTimeSeconds?: number; // Track remaining interview time
  interviewId?: string; // Interview ID for storing evaluations
}

export interface InterviewerResponse {
  message: string;
  questionId?: string;
  isFollowUp: boolean;
  shouldContinue: boolean;
}

/**
 * Generate the next interviewer response based on context
 */
export async function generateInterviewerResponse(
  context: InterviewContext,
  latestUserResponse?: string
): Promise<InterviewerResponse> {
  try {
    // First interview message - start with greeting
    if (context.conversationHistory.length === 0) {
      const greeting = await getInterviewGreeting(context.roleId);
      const firstQuestion = await getRandomQuestion(context.roleId, context.askedQuestionIds);
      
      if (!firstQuestion) {
        return {
          message: greeting,
          shouldContinue: false,
          isFollowUp: false
        };
      }

      return {
        message: `${greeting}\n\nLet's start with our first question: ${firstQuestion.question}`,
        questionId: firstQuestion.id,
        shouldContinue: true,
        isFollowUp: false
      };
    }

    // If we have a latest response, evaluate it and decide next action
    if (latestUserResponse && context.currentQuestionId && context.interviewId) {
      console.log('🔍 Processing answer:', {
        hasResponse: !!latestUserResponse,
        questionId: context.currentQuestionId,
        interviewId: context.interviewId,
        responsePreview: latestUserResponse.substring(0, 50)
      });
      
      // Check remaining time - if less than 2 minutes, gracefully conclude
      const remainingTimeMinutes = Math.floor((context.remainingTimeSeconds || 0) / 60);
      
      if (remainingTimeMinutes < 1) {
        return {
          message: "Thank you for that answer. I see we're running low on time, so let's conclude the interview here. You've provided great insights today. We'll analyze your responses and get back to you soon with feedback.",
          shouldContinue: false,
          isFollowUp: false
        };
      }
      
      // Get current question details from DB
      const currentQuestion = await getQuestionById(context.currentQuestionId);
      
      if (!currentQuestion) {
        console.error('Current question not found in DB');
        return {
          message: "I'm having trouble processing that. Let's move on to the next question.",
          shouldContinue: true,
          isFollowUp: false
        };
      }

      // Evaluate the answer and store it in database
      const evaluation = await evaluateAndStoreAnswer(
        context.interviewId,
        context.currentQuestionId,
        latestUserResponse,
        currentQuestion.answer,
        currentQuestion.question,
        currentQuestion.expectedTopics,
        context.followUpCount ? context.followUpCount > 0 : false
      );

      if (!evaluation) {
        console.error('Failed to evaluate answer');
        return {
          message: "I'm having trouble evaluating that. Let's move on to the next question.",
          shouldContinue: true,
          isFollowUp: false
        };
      }

      // Initialize follow-up counter if not exists
      const currentFollowUpCount = context.followUpCount || 0;
      
      // Strict limit: Only allow 1 follow-up per question
      // Also check if response is too short or score is low
      const responseWordCount = latestUserResponse.trim().split(/\s+/).length;
      const shouldConsiderFollowUp = 
        currentFollowUpCount < 1 && 
        (responseWordCount < 50 || evaluation.score < 6) &&
        currentQuestion.followUps.length > 0;
      
      // Generate appropriate acknowledgment based on score
      let acknowledgment = generateAcknowledgment(evaluation.score);
      
      if (shouldConsiderFollowUp) {
        // Use LLM to decide whether to ask follow-up based on evaluation
        const decision = await decideNextAction(context, latestUserResponse, evaluation);
        acknowledgment = decision.acknowledgment;
        
        if (decision.shouldAskFollowUp && currentQuestion.followUps.length > 0) {
          // Get a follow-up question from DB
          const followUpIndex = Math.min(currentFollowUpCount, currentQuestion.followUps.length - 1);
          const followUpData = currentQuestion.followUps[followUpIndex];
          
          if (followUpData) {
            // Increment follow-up counter
            context.followUpCount = currentFollowUpCount + 1;
            
            return {
              message: `${acknowledgment} ${followUpData.followUp}`,
              questionId: context.currentQuestionId,
              shouldContinue: true,
              isFollowUp: true
            };
          }
        }
      }

      // Reset follow-up counter for next question
      context.followUpCount = 0;

      // Move to next question
      const nextQuestion = await getRandomQuestion(context.roleId, context.askedQuestionIds);
      
      if (!nextQuestion) {
        return {
          message: `${acknowledgment} That concludes our technical interview. Thank you for your thoughtful responses! We'll analyze your performance and get back to you soon.`,
          shouldContinue: false,
          isFollowUp: false
        };
      }

      return {
        message: `${acknowledgment} Let's move on to the next topic. ${nextQuestion.question}`,
        questionId: nextQuestion.id,
        shouldContinue: true,
        isFollowUp: false
      };
    }

    // Fallback
    console.log('⚠️ Falling back to generic response. Context:', {
      hasResponse: !!latestUserResponse,
      hasQuestionId: !!context.currentQuestionId,
      hasInterviewId: !!context.interviewId,
      conversationLength: context.conversationHistory.length
    });
    
    return {
      message: "I'm processing your response. Please continue.",
      shouldContinue: true,
      isFollowUp: false
    };

  } catch (error) {
    console.error('Failed to generate interviewer response:', error);
    return {
      message: "I apologize, I'm having trouble processing that. Could you please rephrase your answer?",
      shouldContinue: true,
      isFollowUp: false
    };
  }
}

/**
 * Generate a natural, encouraging acknowledgment based on answer score
 */
function generateAcknowledgment(score: number): string {
  if (score >= 9) {
    const excellent = [
      "Excellent explanation!",
      "Great answer!",
      "That's a very comprehensive response.",
      "Outstanding! You covered that really well."
    ];
    return excellent[Math.floor(Math.random() * excellent.length)];
  } else if (score >= 7) {
    const good = [
      "Good answer!",
      "Nice explanation.",
      "That's a solid response.",
      "Well explained."
    ];
    return good[Math.floor(Math.random() * good.length)];
  } else if (score >= 5) {
    const okay = [
      "Thank you for that answer.",
      "I see, thanks for sharing.",
      "Okay, got it.",
      "Thanks for explaining that."
    ];
    return okay[Math.floor(Math.random() * okay.length)];
  } else {
    const needs_improvement = [
      "I see. Let me ask you a follow-up question.",
      "Okay, let me help you explore this further.",
      "I understand. Let's dig a bit deeper.",
      "Thanks. Let me clarify with another question."
    ];
    return needs_improvement[Math.floor(Math.random() * needs_improvement.length)];
  }
}

/**
 * Decide whether to ask follow-up or move to next question
 */
async function decideNextAction(
  context: InterviewContext,
  userResponse: string,
  evaluation?: { score: number; feedback: string }
): Promise<{ shouldAskFollowUp: boolean; acknowledgment: string }> {
  try {
    const prompt = PromptTemplate.fromTemplate(`You are an experienced technical interviewer conducting a professional interview.

The candidate just answered a question.

EVALUATION SCORE: {score}/10

DECISION CRITERIA:
- Ask follow-up ONLY if the score is below 6/10 AND we haven't asked a follow-up yet
- If score >= 6, move on to next question
- Currently at {followUpCount} follow-ups (max 1 allowed)

IMPORTANT FOR ACKNOWLEDGMENT:
- Keep it brief, natural, and encouraging (max 5-7 words)
- Don't reveal the score or provide detailed critique
- Don't sound robotic or overly formal
- Examples: "Got it, thanks!", "Interesting approach.", "I see, thanks for that."

Respond ONLY in this JSON format:
{{
  "should_ask_followup": false,
  "acknowledgment": "Your brief acknowledgment here"
}}
`);

    const chain = RunnableSequence.from([
      prompt,
      model,
      new StringOutputParser(),
    ]);

    const result = await chain.invoke({ 
      score: evaluation?.score || 5,
      followUpCount: context.followUpCount || 0,
    });
    console.log('LLM decision result:', result);
    const cleaned = result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleaned);

    return {
      shouldAskFollowUp: parsed.should_ask_followup === true,
      acknowledgment: parsed.acknowledgment || generateAcknowledgment(evaluation?.score || 5)
    };

  } catch (error) {
    console.error('Failed to decide next action:', error);
    // Default behavior: DON'T ask follow-up if score is decent, move to next question
    return {
      shouldAskFollowUp: evaluation ? evaluation.score < 6 : false,
      acknowledgment: generateAcknowledgment(evaluation?.score || 5)
    };
  }
}

/**
 * Analyze the complete interview performance
 * Now uses stored evaluations instead of analyzing conversation history
 */
export async function analyzeInterviewPerformance(
  context: InterviewContext
): Promise<InterviewAnalysis> {
  try {
    // If we have an interview ID, use evaluation-based analysis
    if (context.interviewId) {
      const analysis = await generateFinalAnalysisFromEvaluations(context.interviewId);
      
      if (analysis) {
        return analysis as InterviewAnalysis;
      }
    }

    // Fallback to old method if no interview ID or no evaluations
    return await analyzeLegacyConversationHistory(context);

  } catch (error) {
    console.error('Failed to analyze interview:', error);
    return createFallbackAnalysis();
  }
}

/**
 * Legacy method: Analyze from conversation history
 * Used as fallback when evaluation-based analysis is not available
 */
async function analyzeLegacyConversationHistory(
  context: InterviewContext
): Promise<InterviewAnalysis> {
  try {
    const prompt = PromptTemplate.fromTemplate(`You are an expert technical interviewer analyzing a candidate's complete interview performance.

ROLE: {roleId}

CONVERSATION HISTORY:
{conversationHistory}

Provide a comprehensive analysis of the candidate's interview performance.

Evaluate on these criteria (score 1-10):
- TECHNICAL_KNOWLEDGE: Depth and accuracy of technical knowledge
- COMMUNICATION: Clarity and effectiveness of communication
- PROBLEM_SOLVING: Analytical thinking and problem-solving approach
- EXPERIENCE: Demonstrated practical experience

Respond in this EXACT JSON format:
{{
  "technical_knowledge": [score 1-10],
  "communication": [score 1-10],
  "problem_solving": [score 1-10],
  "experience": [score 1-10],
  "overall_score": [average of all scores],
  "summary": "[3-4 sentences overall assessment]",
  "strengths": ["[3-4 key strengths]"],
  "areas_for_improvement": ["[2-3 areas to improve]"],
  "key_insights": ["[3-4 notable observations]"],
  "hiring_recommendation": "strong_yes|yes|maybe|no|strong_no"
}}
`);

    const chain = RunnableSequence.from([
      prompt,
      model,
      new StringOutputParser(),
    ]);

    const conversationText = context.conversationHistory
      .map(msg => `${msg.role.toUpperCase()}: ${msg.content}`)
      .join('\n\n');

    const result = await chain.invoke({
      roleId: context.roleId,
      conversationHistory: conversationText
    });

    const cleaned = result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const analysis = JSON.parse(cleaned);

    return {
      technical_knowledge: ensureValidScore(analysis.technical_knowledge),
      communication: ensureValidScore(analysis.communication),
      problem_solving: ensureValidScore(analysis.problem_solving),
      experience: ensureValidScore(analysis.experience),
      overall_score: ensureValidScore(analysis.overall_score),
      summary: analysis.summary || 'Interview completed successfully.',
      strengths: ensureArray(analysis.strengths, 3),
      areas_for_improvement: ensureArray(analysis.areas_for_improvement, 2),
      key_insights: ensureArray(analysis.key_insights, 3),
      hiring_recommendation: analysis.hiring_recommendation || 'maybe'
    };

  } catch (error) {
    console.error('Failed to analyze conversation history:', error);
    return createFallbackAnalysis();
  }
}

export interface InterviewAnalysis {
  technical_knowledge: number;
  communication: number;
  problem_solving: number;
  experience: number;
  overall_score: number;
  summary: string;
  strengths: string[];
  areas_for_improvement: string[];
  key_insights: string[];
  hiring_recommendation: string;
}

function ensureValidScore(score: unknown): number {
  const num = typeof score === 'number' ? score : parseFloat(String(score)) || 7;
  return Math.max(1, Math.min(10, num));
}

function ensureArray(arr: unknown, minLength: number = 3): string[] {
  if (Array.isArray(arr) && arr.length >= minLength) {
    return arr.slice(0, 5);
  }
  return ['Performance was satisfactory'];
}

function createFallbackAnalysis(): InterviewAnalysis {
  return {
    technical_knowledge: 0,
    communication: 0,
    problem_solving: 0,
    experience: 0,
    overall_score: 0,
    summary: 'Failed to analyze interview performance.',
    strengths: [],
    areas_for_improvement: [],
    key_insights: [],
    hiring_recommendation: 'N/A'
  };
}
