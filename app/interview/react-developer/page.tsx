"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Mic, MicOff, Volume2, VolumeX, Phone, PhoneOff, Bot, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { InterviewNavbar } from "../_components/InterviewNavbar";
import { LiveTranscript } from "../_components/LiveTranscript";
import { InterviewCompletionDialog } from "@/components/InterviewCompletionDialog";
import { useDeepgramVoiceAgent, type InterviewAnalysis } from "@/src/hooks/useDeepgramVoiceAgent";
import { ProctoringVideoPreview } from "@/components/ProctoringVideoPreview";
import { FullscreenExitWarning } from "@/components/FullscreenExitWarning";
import { useFullscreenInterview } from "@/src/hooks/useFullscreenInterview";
import CodeSandbox, { type CodeSandboxRef } from "@/components/CodeSandbox";
import { ProctoringAcknowledgementDialog } from "@/components/ProctoringAcknowledgementDialog";

export default function ReactDeveloperInterviewPage() {
  const router = useRouter();
  const codeSandboxRef = useRef<CodeSandboxRef>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [showCompletion, setShowCompletion] = useState(false);
  const [showEndConfirmation, setShowEndConfirmation] = useState(false);
  const [showProctoringAcknowledgement, setShowProctoringAcknowledgement] = useState(false);
  const [hasAcknowledged, setHasAcknowledged] = useState(false);

  const {
    isConnected,
    agentStatus,
    transcript,
    interimTranscript,
    isInterimFinal,
    isProcessing,
    remainingTime,
    isTimeUp,
    interviewId,
    currentQuestionRequiresCoding, // Track if current question is a coding question
    startConnection,
    stopConnection,
    submitCodeAnswer, // Function to submit code
    proctoring
  } = useDeepgramVoiceAgent({
    roleId: 'react-developer',
    interviewDuration: 60, // 60 minutes
    enableProctoring: true,
    onStatusChange: (_status: string) => {
      console.log('Agent status changed:', _status);
    },
    onTranscriptUpdate: (_message) => {
      console.log('New transcript message:', _message);
    },
    onError: (error: Error) => {
      console.error('Voice agent error:', error);
      toast.error('Voice agent error: ' + error.message);
    },
    onInterviewComplete: (analysis: InterviewAnalysis) => {
      console.log('Interview completed with analysis:', analysis);
      setShowCompletion(true);
      toast.success('Interview completed! Choose your next step.');
    },
    onTimeWarning: (minutes: number) => {
      if (minutes === 5) {
        toast.warning('⏰ 5 minutes remaining in the interview!', {
          duration: 5000
        });
      } else if (minutes === 2) {
        toast.warning('⚠️ Only 2 minutes left!', {
          duration: 5000
        });
      } else if (minutes === 1) {
        toast.error('⚠️ Final minute! Interview will end soon.', {
          duration: 5000
        });
      }
    }
  });

  // Fullscreen management
  const {
    showExitWarning,
    exitAttempts,
    enterFullscreen,
    handleContinueInterview,
    handleEndInterview: handleFullscreenEndInterview,
  } = useFullscreenInterview({
    interviewId,
    isInterviewActive: isConnected,
    maxExitAttempts: 2,
    onForceExit: () => {
      stopConnection();
      setShowCompletion(true);
    }
  });

  const handleAcceptProctoring = async () => {
    setShowProctoringAcknowledgement(false);
    
    // Enter fullscreen mode
    const success = await enterFullscreen();
    if (success) {
      setHasAcknowledged(true);
      toast.success('Fullscreen enabled. Starting interview...');
      
      // Automatically start the interview after accepting
      try {
        await startConnection();
        toast.success('Voice interview started!');
      } catch (error) {
        console.error('Failed to start interview:', error);
        toast.error('Failed to start interview. Please check your microphone permissions.');
      }
    } else {
      toast.error('Failed to enter fullscreen. Please allow fullscreen access.');
      setShowProctoringAcknowledgement(true);
    }
  };

  const handleDeclineProctoring = () => {
    toast.error('You must accept the proctoring terms to continue.');
    router.push('/dashboard');
  };

  const handleStartInterview = async () => {
    // Show proctoring acknowledgement first
    if (!hasAcknowledged) {
      setShowProctoringAcknowledgement(true);
      return;
    }
    
    try {
      await startConnection();
      toast.success('Voice interview started!');
    } catch (error) {
      console.error('Failed to start interview:', error);
      toast.error('Failed to start interview. Please check your microphone permissions.');
    }
  };

  const handleEndInterview = () => {
    setShowEndConfirmation(true);
  };

  const confirmEndInterview = () => {
    stopConnection();
    setShowEndConfirmation(false);
    setShowCompletion(true);
    toast.info('Interview ended');
  };

  const handleNewInterview = () => {
    // Reset all state and reload page to start fresh
    window.location.reload();
  };

  const cancelEndInterview = () => {
    setShowEndConfirmation(false);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    toast.info(isMuted ? 'Microphone unmuted' : 'Microphone muted');
  };

  const toggleSpeaker = () => {
    setIsSpeakerOn(!isSpeakerOn);
    toast.info(isSpeakerOn ? 'Speaker muted' : 'Speaker unmuted');
  };

  const handleSubmitCode = async () => {
    if (!codeSandboxRef.current || !currentQuestionRequiresCoding) return;
    
    try {
      const code = codeSandboxRef.current.getCode();
      
      if (!code.trim()) {
        toast.error('Please write some code before submitting');
        return;
      }
      
      toast.success('Code submitted! Processing...');
      await submitCodeAnswer(code);
    } catch (error) {
      console.error('Failed to submit code:', error);
      toast.error('Failed to submit code. Please try again.');
    }
  };

  const getStatusText = () => {
    switch (agentStatus) {
      case 'listening':
        return 'Listening...';
      case 'thinking':
        return 'Thinking...';
      case 'speaking':
        return 'Speaking...';
      default:
        return 'Idle';
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Interview Navbar */}
      <InterviewNavbar
        title="React.js Developer Interview"
        subtitle="Code and explain your solution"
        status={agentStatus}
        statusText={getStatusText()}
        showTimer={isConnected}
        remainingTime={remainingTime}
        isTimeUp={isTimeUp}
      />

      {/* Main Content - Three Columns */}
      <div className="flex-1 overflow-hidden p-6 flex gap-6">
        {/* Left Side: Participant Cards & Controls */}
        <div className="w-80 flex flex-col gap-3 overflow-y-auto">
          {/* AI Interviewer Card */}
          <Card className="border-2 border-blue-200 dark:border-blue-800">
            <CardContent className="p-0 relative aspect-video bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative z-10 w-16 h-16 rounded-xl flex items-center justify-center bg-blue-600">
                  <Bot className="h-8 w-8 text-white" />
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-2.5 pt-6">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white text-sm leading-tight">AI Interviewer</h3>
                  <p className="text-[10px] text-gray-300 leading-tight mt-0.5">Conducting the interview</p>
                </div>
                <div className="mt-1">
                  <Badge variant="outline" className="border-white/30 bg-white/10 backdrop-blur-sm text-white text-[10px] px-1.5 py-0 leading-tight h-5">
                    {agentStatus === 'listening' && '🎤 Listening'}
                    {agentStatus === 'thinking' && '💭 Thinking'}
                    {agentStatus === 'speaking' && '🎙️ Speaking'}
                    {agentStatus === 'idle' && 'Idle'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Candidate's Proctoring Video Preview */}
          {proctoring && (
            <ProctoringVideoPreview
              videoRef={proctoring.videoRef}
              metrics={proctoring.metrics}
              isActive={proctoring.isActive}
              name="You"
              subtitle="Interviewee"
            />
          )}

          {/* Control Buttons */}
          <Card className="p-3">
            <CardContent className="p-0 space-y-2">
              {!isConnected ? (
                <Button
                  onClick={handleStartInterview}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  size="sm"
                >
                  <Phone className="mr-2 h-4 w-4" />
                  Start Interview
                </Button>
              ) : (
                <Button
                  onClick={handleEndInterview}
                  variant="destructive"
                  className="w-full"
                  size="sm"
                >
                  <PhoneOff className="mr-2 h-4 w-4" />
                  End Interview
                </Button>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={toggleMute}
                  variant={isMuted ? 'destructive' : 'outline'}
                  className="flex-1"
                  disabled={!isConnected || currentQuestionRequiresCoding}
                  size="sm"
                >
                  {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
                <Button
                  onClick={toggleSpeaker}
                  variant={!isSpeakerOn ? 'destructive' : 'outline'}
                  className="flex-1"
                  disabled={!isConnected}
                  size="sm"
                >
                  {isSpeakerOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                </Button>
              </div>

              {/* Coding Question Indicator */}
              {currentQuestionRequiresCoding && isConnected && (
                <div className="flex items-center gap-2 text-xs bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-md p-2">
                  <span className="text-amber-600 dark:text-amber-400">💻</span>
                  <span className="text-amber-700 dark:text-amber-300 font-medium">
                    Voice disabled - Coding question active
                  </span>
                </div>
              )}

              {/* Processing Indicator */}
              {isProcessing && (
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground animate-pulse py-2">
                  <span className="h-2 w-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="h-2 w-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="h-2 w-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Interview Info */}
          <Card className="p-3">
            <CardContent className="p-0">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="font-semibold">60 minutes</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Focus:</span>
                  <span className="font-semibold">React Development</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Messages:</span>
                  <span className="font-semibold">{transcript.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Middle: CodeSandbox */}
        <div className="flex-1 min-w-0 flex flex-col gap-3">
          <Card className="flex-1 overflow-hidden relative">
            <div className="h-full w-full bg-card relative">
              {/* Stable key prevents re-mounting on parent re-renders */}
              <CodeSandbox key="react-code-editor" ref={codeSandboxRef} editorHeight={800} />
              
              {/* Disabled Overlay - Shows when interview not started or question is not coding */}
              {(!isConnected || !currentQuestionRequiresCoding) && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
                     style={{ pointerEvents: 'all' }}>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-xl max-w-md text-center">
                    <div className="mb-4">
                      {!isConnected ? (
                        <>
                          <Phone className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            Interview Not Started
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                            Start the interview to begin coding
                          </p>
                        </>
                      ) : (
                        <>
                          <Mic className="h-12 w-12 mx-auto mb-3 text-blue-500" />
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            Voice Question Active
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                            Please answer the current question verbally. The code editor will be enabled for coding questions.
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
          
          {/* Submit Code Button - Only visible for coding questions */}
          {currentQuestionRequiresCoding && isConnected && (
            <Button
              onClick={handleSubmitCode}
              disabled={isProcessing}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              size="lg"
            >
              <Send className="mr-2 h-5 w-5" />
              {isProcessing ? 'Submitting...' : 'Submit Code & Continue'}
            </Button>
          )}
        </div>

        {/* Right Side: Live Transcript */}
        <div className="w-96">
          <LiveTranscript
            messages={transcript}
            interimTranscript={interimTranscript ? {
              content: interimTranscript,
              isFinal: isInterimFinal
            } : null}
            agentStatus={agentStatus}
            title="Live Transcript"
            emptyMessage="Transcript will appear here once the interview starts..."
            showMessageCount={true}
            agentColor="green"
            userColor="indigo"
            autoScroll={true}
          />
        </div>
      </div>

     
      {/* Proctoring Acknowledgement Dialog */}
        <ProctoringAcknowledgementDialog
        open={showProctoringAcknowledgement}
        onAccept={handleAcceptProctoring}
        onDecline={handleDeclineProctoring}
        />

      {/* Fullscreen Exit Warning */}
      <FullscreenExitWarning
        open={showExitWarning}
        exitAttempts={exitAttempts}
        maxAttempts={2}
        onContinue={handleContinueInterview}
        onEndInterview={handleFullscreenEndInterview}
      />

      {/* Interview Completion Dialog */}
      <InterviewCompletionDialog 
        open={showCompletion}
        onOpenChange={setShowCompletion}
        interviewId={interviewId}
        onNewInterview={handleNewInterview}
      />

      {/* End Interview Confirmation Dialog */}
      <Dialog open={showEndConfirmation} onOpenChange={setShowEndConfirmation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>End Interview?</DialogTitle>
            <DialogDescription>
              Are you sure you want to end this interview? Your progress will be saved and you&apos;ll be able to view the full details.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={cancelEndInterview}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmEndInterview}>
              End Interview
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
