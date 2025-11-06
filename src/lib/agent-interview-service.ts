/**
 * Agent Interview Service - LangGraph-based dynamic interview system
 * 
 * Uses LangGraph to orchestrate a multi-agent interview process:
 * 1. ProfileAnalyzer: Analyzes resume and job description
 * 2. QuestionGenerator: Creates personalized questions
 * 3. Evaluator: Evaluates answers and generates follow-ups
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { StateGraph, END, START, Annotation } from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { prisma } from "./prisma";

// ===== STATE INTERFACE =====
export interface AgentInterviewState {
  // Input
  agentInterviewId: string;
  roleId: string;
  resumeText: string;
  jobDescription: string;
  
  // Profile Analysis
  profileAnalysis?: {
    skills: string[];
    experience: { role: string; years: number; highlights: string[] }[];
    strengths: string[];
    gaps: string[];
    keyProjects: string[];
  };
  
  // Question Generation
  currentQuestionIndex: number;
  totalQuestionsPlanned: number;
  questionsGenerated: Array<{
    questionText: string;
    questionType: string;
    category: string;
    difficulty: string;
    generatedReason: string;
    expectedTopics: string[];
    requiresCoding: boolean;
    codeLanguage?: string;
    correctCode?: string;
    evaluationCriteria?: {
      mustHave: string[];
      shouldHave: string[];
      bonus: string[];
    };
  }>;
  
  // Current Question Flow
  currentQuestionId?: string;
  candidateAnswer?: string;
  
  // Evaluation
  currentEvaluation?: {
    score: number;
    relevance: number;
    accuracy: number;
    completeness: number;
    depth: number;
    feedback: string;
    strengths: string[];
    improvements: string[];
    missingTopics: string[];
    needsFollowUp: boolean;
    followUpReason?: string;
  };
  
  // Overall Progress
  interviewComplete: boolean;
  finalRecommendation?: {
    overallFeedback: string;
    recommendation: string;
    hiringDecision: string;
    technicalScore: number;
    communicationScore: number;
    problemSolvingScore: number;
  };
}

// ===== LLM CONFIGURATION =====
const gpt4o = new ChatOpenAI({
  modelName: "gpt-4o",
  temperature: 0.7,
  maxTokens: 2000,
});

const gpt4oMini = new ChatOpenAI({
  modelName: "gpt-4o-mini",
  temperature: 0.3,
  maxTokens: 1000,
});

// ===== AGENT NODES =====

/**
 * Node 1: Profile Analyzer
 * Analyzes candidate's resume against job description to identify strengths, gaps, and focus areas
 */
async function profileAnalyzerNode(state: AgentInterviewState): Promise<Partial<AgentInterviewState>> {
  console.log("🔍 ProfileAnalyzer: Analyzing candidate profile...");
  
  const systemPrompt = `You are an expert technical recruiter and hiring manager. 
Analyze the candidate's resume against the job description to create a comprehensive profile analysis.

Focus on:
1. Technical skills and proficiency levels
2. Relevant work experience with quantifiable achievements
3. Key strengths that align with the role
4. Skill gaps or areas needing validation
5. Notable projects or accomplishments

Provide structured, actionable insights for interview planning.`;

  const userPrompt = `Job Description:
${state.jobDescription}

Candidate Resume:
${state.resumeText}

Provide a detailed analysis in JSON format with these fields:
- skills: Array of technical skills with proficiency indicators
- experience: Array of { role, years, highlights }
- strengths: Top 3-5 strengths relevant to this role
- gaps: Areas where candidate needs validation or may lack experience
- keyProjects: Notable projects mentioned in resume`;

  const response = await gpt4o.invoke([
    new SystemMessage(systemPrompt),
    new HumanMessage(userPrompt),
  ]);

  const content = response.content as string;
  
  // Parse JSON from response (handle markdown code blocks)
  let profileAnalysis;
  try {
    const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
    profileAnalysis = JSON.parse(jsonMatch ? jsonMatch[1] : content);
  } catch (error) {
    console.error("Failed to parse profile analysis:", error);
    // Fallback to basic structure
    profileAnalysis = {
      skills: ["Programming", "Problem Solving"],
      experience: [],
      strengths: ["Technical knowledge"],
      gaps: ["Needs assessment"],
      keyProjects: [],
    };
  }

  // Store profile analysis in database
  await prisma.agentInterview.update({
    where: { id: state.agentInterviewId },
    data: { profileAnalysis },
  });

  console.log("✅ ProfileAnalyzer: Analysis complete");
  
  return { profileAnalysis };
}

/**
 * Node 2: Question Generator
 * Generates personalized questions based on profile analysis and role requirements
 */
async function questionGeneratorNode(state: AgentInterviewState): Promise<Partial<AgentInterviewState>> {
  console.log("💡 QuestionGenerator: Creating personalized questions...");
  
  const systemPrompt = `You are an expert technical interviewer designing personalized interview questions.
Create questions that:
1. Validate key skills mentioned in the resume
2. Probe areas where the candidate might lack depth
3. Assess problem-solving and system design thinking
4. Mix technical, coding, and behavioral questions

Generate 5-7 questions total, balanced across difficulty levels.`;

  const userPrompt = `Role: ${state.roleId}
Profile Analysis:
${JSON.stringify(state.profileAnalysis, null, 2)}

Job Description:
${state.jobDescription}

Generate an array of interview questions in JSON format. Each question should have:
- questionText: The question to ask
- questionType: 'technical' | 'behavioral' | 'coding' | 'system_design'
- category: Specific topic/area
- difficulty: 'easy' | 'medium' | 'hard'
- generatedReason: Why this question is relevant (1 sentence)
- expectedTopics: Array of topics/concepts the answer should cover
- requiresCoding: true if this is a coding challenge
- codeLanguage: (if coding) 'javascript' | 'typescript' | 'python'
- correctCode: (if coding) Reference solution
- evaluationCriteria: (if coding) { mustHave: [], shouldHave: [], bonus: [] }

Generate questions that progressively assess the candidate's capabilities.`;

  const response = await gpt4o.invoke([
    new SystemMessage(systemPrompt),
    new HumanMessage(userPrompt),
  ]);

  const content = response.content as string;
  
  // Parse questions array
  let questionsGenerated;
  try {
    const jsonMatch = content.match(/```(?:json)?\s*(\[[\s\S]*\])\s*```/);
    questionsGenerated = JSON.parse(jsonMatch ? jsonMatch[1] : content);
  } catch (error) {
    console.error("Failed to parse questions:", error);
    questionsGenerated = [];
  }

  // Store questions in database
  await Promise.all(
    questionsGenerated.map((q: {
      questionText: string;
      questionType: string;
      category: string;
      difficulty: string;
      generatedReason: string;
      expectedTopics: string[];
      requiresCoding: boolean;
      codeLanguage?: string;
      correctCode?: string;
      evaluationCriteria?: unknown;
    }, index: number) =>
      prisma.agentQuestion.create({
        data: {
          agentInterviewId: state.agentInterviewId,
          questionText: q.questionText,
          questionType: q.questionType,
          category: q.category,
          difficulty: q.difficulty,
          orderIndex: index,
          generatedReason: q.generatedReason,
          expectedTopics: q.expectedTopics || [],
          requiresCoding: q.requiresCoding || false,
          codeLanguage: q.codeLanguage,
          correctCode: q.correctCode,
          evaluationCriteria: q.evaluationCriteria as any,
        },
      })
    )
  );

  console.log(`✅ QuestionGenerator: Generated ${questionsGenerated.length} questions`);

  return {
    questionsGenerated,
    totalQuestionsPlanned: questionsGenerated.length,
    currentQuestionIndex: 0,
  };
}

/**
 * Node 3: Evaluator
 * Evaluates candidate's answer and determines if follow-up is needed
 */
async function evaluatorNode(state: AgentInterviewState): Promise<Partial<AgentInterviewState>> {
  console.log("📊 Evaluator: Analyzing answer...");
  
  if (!state.currentQuestionId || !state.candidateAnswer) {
    console.log("⚠️ No answer to evaluate, skipping...");
    return {};
  }

  const currentQuestion = state.questionsGenerated[state.currentQuestionIndex];
  
  const systemPrompt = `You are an expert technical interviewer evaluating candidate responses.
Provide detailed, constructive feedback focusing on:
1. Technical accuracy and depth
2. Communication clarity
3. Problem-solving approach
4. Completeness of the answer

Be fair but thorough. Identify specific strengths and areas for improvement.`;

  const userPrompt = `Question: ${currentQuestion.questionText}
Question Type: ${currentQuestion.questionType}
Expected Topics: ${currentQuestion.expectedTopics.join(", ")}
${currentQuestion.requiresCoding ? `Coding Language: ${currentQuestion.codeLanguage}\nReference Solution:\n${currentQuestion.correctCode}` : ""}

Candidate's Answer:
${state.candidateAnswer}

Evaluate this answer and provide JSON output with:
- score: Overall score 0-10
- relevance: How relevant to the question (0-10)
- accuracy: Technical accuracy (0-10)
- completeness: Coverage of expected topics (0-10)
- depth: Depth of understanding (0-10)
- feedback: Detailed feedback paragraph
- strengths: Array of specific strengths
- improvements: Array of specific areas to improve
- missingTopics: Expected topics not covered
- needsFollowUp: true if a follow-up question would be valuable
- followUpReason: (if needsFollowUp) Why follow-up is needed`;

  const response = await gpt4oMini.invoke([
    new SystemMessage(systemPrompt),
    new HumanMessage(userPrompt),
  ]);

  const content = response.content as string;
  
  // Parse evaluation
  let evaluation;
  try {
    const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
    evaluation = JSON.parse(jsonMatch ? jsonMatch[1] : content);
  } catch (error) {
    console.error("Failed to parse evaluation:", error);
    evaluation = {
      score: 5,
      relevance: 5,
      accuracy: 5,
      completeness: 5,
      depth: 5,
      feedback: "Unable to evaluate properly.",
      strengths: [],
      improvements: [],
      missingTopics: [],
      needsFollowUp: false,
    };
  }

  // Store answer evaluation in database (use upsert to handle retries)
  await prisma.agentAnswer.upsert({
    where: {
      questionId: state.currentQuestionId,
    },
    create: {
      agentInterviewId: state.agentInterviewId,
      questionId: state.currentQuestionId,
      answerText: currentQuestion.requiresCoding ? null : state.candidateAnswer,
      codeSubmitted: currentQuestion.requiresCoding ? state.candidateAnswer : null,
      score: evaluation.score,
      relevance: evaluation.relevance,
      accuracy: evaluation.accuracy,
      completeness: evaluation.completeness,
      depth: evaluation.depth,
      feedback: evaluation.feedback,
      strengths: evaluation.strengths || [],
      improvements: evaluation.improvements || [],
      missingTopics: evaluation.missingTopics || [],
      needsFollowUp: evaluation.needsFollowUp || false,
      followUpReason: evaluation.followUpReason,
    },
    update: {
      answerText: currentQuestion.requiresCoding ? null : state.candidateAnswer,
      codeSubmitted: currentQuestion.requiresCoding ? state.candidateAnswer : null,
      score: evaluation.score,
      relevance: evaluation.relevance,
      accuracy: evaluation.accuracy,
      completeness: evaluation.completeness,
      depth: evaluation.depth,
      feedback: evaluation.feedback,
      strengths: evaluation.strengths || [],
      improvements: evaluation.improvements || [],
      missingTopics: evaluation.missingTopics || [],
      needsFollowUp: evaluation.needsFollowUp || false,
      followUpReason: evaluation.followUpReason,
      evaluatedAt: new Date(),
    },
  });

  console.log(`✅ Evaluator: Score ${evaluation.score}/10`);

  return {
    currentEvaluation: evaluation,
    currentQuestionIndex: state.currentQuestionIndex + 1,
  };
}

/**
 * Node 4: Final Recommendation
 * Generates overall interview summary and hiring recommendation
 */
async function finalRecommendationNode(state: AgentInterviewState): Promise<Partial<AgentInterviewState>> {
  console.log("🎯 Generating final recommendation...");
  
  // Fetch all answers from database
  const answers = await prisma.agentAnswer.findMany({
    where: { agentInterviewId: state.agentInterviewId },
    include: { question: true },
  });

  const avgScore = answers.reduce((sum: number, a: any) => sum + a.score, 0) / answers.length;
  const technicalAnswers = answers.filter((a: any) => 
    a.question.questionType === 'technical' || a.question.questionType === 'coding'
  );
  const technicalScore = technicalAnswers.length 
    ? technicalAnswers.reduce((sum: number, a: any) => sum + a.score, 0) / technicalAnswers.length
    : 0;

  const systemPrompt = `You are a senior hiring manager providing final interview recommendations.
Based on all answers and evaluations, provide:
1. Overall assessment of the candidate
2. Hiring recommendation (strong_yes, yes, maybe, no, strong_no)
3. Hiring decision (proceed_to_next_round, reject, needs_more_evaluation)
4. Specific scores for technical skills, communication, and problem-solving

Be data-driven and provide clear reasoning.`;

  const userPrompt = `Candidate Profile:
${JSON.stringify(state.profileAnalysis, null, 2)}

Interview Performance Summary:
Average Score: ${avgScore.toFixed(1)}/10
Technical Score: ${technicalScore.toFixed(1)}/10
Questions Answered: ${answers.length}

Detailed Answers:
${answers.map((a: any, i: number) => `
Question ${i + 1}: ${a.question.questionText}
Score: ${a.score}/10
Strengths: ${a.strengths.join(", ")}
Improvements: ${a.improvements.join(", ")}
`).join("\n")}

Provide final recommendation in JSON format:
- overallFeedback: Comprehensive summary paragraph
- recommendation: 'strong_yes' | 'yes' | 'maybe' | 'no' | 'strong_no'
- hiringDecision: 'proceed_to_next_round' | 'reject' | 'needs_more_evaluation'
- technicalScore: 0-10
- communicationScore: 0-10
- problemSolvingScore: 0-10`;

  const response = await gpt4o.invoke([
    new SystemMessage(systemPrompt),
    new HumanMessage(userPrompt),
  ]);

  const content = response.content as string;
  
  let finalRecommendation;
  try {
    const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
    finalRecommendation = JSON.parse(jsonMatch ? jsonMatch[1] : content);
  } catch (error) {
    console.error("Failed to parse recommendation:", error);
    finalRecommendation = {
      overallFeedback: "Unable to generate recommendation.",
      recommendation: "needs_more_evaluation",
      hiringDecision: "needs_more_evaluation",
      technicalScore: avgScore,
      communicationScore: 5,
      problemSolvingScore: 5,
    };
  }

  // Update database with final results
  await prisma.agentInterview.update({
    where: { id: state.agentInterviewId },
    data: {
      status: "COMPLETED",
      completedAt: new Date(),
      totalQuestions: answers.length,
      questionsAnswered: answers.length,
      averageScore: avgScore,
      technicalScore: finalRecommendation.technicalScore,
      communicationScore: finalRecommendation.communicationScore,
      problemSolvingScore: finalRecommendation.problemSolvingScore,
      overallFeedback: finalRecommendation.overallFeedback,
      recommendation: finalRecommendation.recommendation,
      hiringDecision: finalRecommendation.hiringDecision,
    },
  });

  console.log("✅ Final recommendation complete");

  return {
    finalRecommendation,
    interviewComplete: true,
  };
}

// ===== ROUTING LOGIC =====

function shouldContinueInterview(state: AgentInterviewState): string {
  // If no questions generated yet, go to question generator
  if (!state.questionsGenerated || state.questionsGenerated.length === 0) {
    return "questionGenerator";
  }
  
  // If all questions answered, generate final recommendation
  if (state.currentQuestionIndex >= state.totalQuestionsPlanned) {
    return "recommendationGenerator";
  }
  
  // If answer needs evaluation, go to evaluator
  if (state.candidateAnswer && state.currentQuestionId) {
    return "evaluator";
  }
  
  // Interview complete
  if (state.interviewComplete) {
    return END;
  }
  
  // Default: waiting for next answer
  return END;
}

// ===== GRAPH CONSTRUCTION =====

// Define state annotation
const AgentStateAnnotation = Annotation.Root({
  agentInterviewId: Annotation<string>(),
  roleId: Annotation<string>(),
  resumeText: Annotation<string>(),
  jobDescription: Annotation<string>(),
  profileAnalysis: Annotation<AgentInterviewState['profileAnalysis']>(),
  currentQuestionIndex: Annotation<number>(),
  totalQuestionsPlanned: Annotation<number>(),
  questionsGenerated: Annotation<AgentInterviewState['questionsGenerated']>(),
  currentQuestionId: Annotation<string | undefined>(),
  candidateAnswer: Annotation<string | undefined>(),
  currentEvaluation: Annotation<AgentInterviewState['currentEvaluation']>(),
  interviewComplete: Annotation<boolean>(),
  recommendation: Annotation<AgentInterviewState['finalRecommendation']>(),
});

const workflow = new StateGraph(AgentStateAnnotation)
  .addNode("profileAnalyzer", profileAnalyzerNode)
  .addNode("questionGenerator", questionGeneratorNode)
  .addNode("evaluator", evaluatorNode)
  .addNode("recommendationGenerator", finalRecommendationNode)
  .addEdge(START, "profileAnalyzer")
  .addEdge("profileAnalyzer", "questionGenerator")
  .addConditionalEdges("questionGenerator", shouldContinueInterview, {
    questionGenerator: "questionGenerator",
    evaluator: "evaluator",
    recommendationGenerator: "recommendationGenerator",
    [END]: END,
  })
  .addConditionalEdges("evaluator", shouldContinueInterview, {
    questionGenerator: "questionGenerator",
    evaluator: "evaluator",
    recommendationGenerator: "recommendationGenerator",
    [END]: END,
  })
  .addEdge("recommendationGenerator", END);

export const agentInterviewGraph = workflow.compile();

// ===== PUBLIC API =====

/**
 * Initialize a new agent interview session
 */
export async function initializeAgentInterview(
  userId: string,
  roleId: string,
  resumeText: string,
  jobDescription: string
): Promise<string> {
  // Create agent interview in database
  const agentInterview = await prisma.agentInterview.create({
    data: {
      userId,
      roleId,
      resumeText,
      jobDescription,
      status: "IN_PROGRESS",
    },
  });

  // Run profile analysis and question generation
  const initialState: AgentInterviewState = {
    agentInterviewId: agentInterview.id,
    roleId,
    resumeText,
    jobDescription,
    currentQuestionIndex: 0,
    totalQuestionsPlanned: 0,
    questionsGenerated: [],
    interviewComplete: false,
  };

  // Execute graph up to question generation
  await agentInterviewGraph.invoke(initialState);

  return agentInterview.id;
}

/**
 * Submit an answer and get evaluation + next question
 */
export async function submitAgentAnswer(
  agentInterviewId: string,
  questionId: string,
  answer: string
): Promise<{
  evaluation: any;
  nextQuestion: any | null;
  interviewComplete: boolean;
}> {
  // Get current state from database
  const agentInterview = await prisma.agentInterview.findUnique({
    where: { id: agentInterviewId },
    include: { questions: true, answers: true },
  });

  if (!agentInterview) {
    throw new Error("Agent interview not found");
  }

  // Find the question being answered
  const question = agentInterview.questions.find((q: any) => q.id === questionId);
  if (!question) {
    throw new Error("Question not found");
  }

  const currentQuestionIndex = agentInterview.questions.findIndex((q: any) => q.id === questionId);

  const state: AgentInterviewState = {
    agentInterviewId,
    roleId: agentInterview.roleId,
    resumeText: agentInterview.resumeText,
    jobDescription: agentInterview.jobDescription,
    profileAnalysis: agentInterview.profileAnalysis as any,
    currentQuestionIndex,
    totalQuestionsPlanned: agentInterview.questions.length,
    questionsGenerated: agentInterview.questions.map((q: any) => ({
      questionText: q.questionText,
      questionType: q.questionType,
      category: q.category,
      difficulty: q.difficulty,
      generatedReason: q.generatedReason,
      expectedTopics: q.expectedTopics,
      requiresCoding: q.requiresCoding,
      codeLanguage: q.codeLanguage || undefined,
      correctCode: q.correctCode || undefined,
      evaluationCriteria: q.evaluationCriteria as any,
    })),
    currentQuestionId: questionId,
    candidateAnswer: answer,
    interviewComplete: false,
  };

  // Run evaluation directly (don't invoke full graph)
  const evaluationResult = await evaluatorNode(state);

  // Check if interview is complete
  const interviewComplete = currentQuestionIndex + 1 >= agentInterview.questions.length;

  if (interviewComplete) {
    // Generate final recommendation
    await finalRecommendationNode(state);
  }

  // Get next question if available
  const nextQuestion = interviewComplete 
    ? null 
    : agentInterview.questions[currentQuestionIndex + 1];

  return {
    evaluation: evaluationResult.currentEvaluation,
    nextQuestion,
    interviewComplete,
  };
}

/**
 * Get current interview state
 */
export async function getAgentInterviewState(agentInterviewId: string) {
  const agentInterview = await prisma.agentInterview.findUnique({
    where: { id: agentInterviewId },
    include: {
      questions: {
        orderBy: { orderIndex: 'asc' },
        include: { answer: true },
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return agentInterview;
}
