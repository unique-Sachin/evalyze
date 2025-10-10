import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface UseFullscreenInterviewProps {
  interviewId: string | null;
  isInterviewActive: boolean;
  onForceExit?: () => void;
  maxExitAttempts?: number; // Maximum allowed exit attempts before auto-termination
}

// Log fullscreen violation to proctoring system
const logFullscreenViolation = async (interviewId: string, attemptNumber: number) => {
  try {
    // This would call your proctoring API to record the violation
    await fetch('/api/proctoring', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'logViolation',
        interviewId,
        violationType: 'FULLSCREEN_EXIT',
        severity: attemptNumber >= 3 ? 'HIGH' : 'MEDIUM',
        metadata: {
          attemptNumber,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent
        }
      })
    });
    console.log(`Fullscreen exit violation #${attemptNumber} logged for interview ${interviewId}`);
  } catch (error) {
    console.error('Failed to log fullscreen violation:', error);
  }
};

export function useFullscreenInterview({
  interviewId,
  isInterviewActive,
  onForceExit,
  maxExitAttempts = 3 // Default: 3 attempts before auto-termination
}: UseFullscreenInterviewProps) {
  const router = useRouter();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showExitWarning, setShowExitWarning] = useState(false);
  const [exitAttempts, setExitAttempts] = useState(0);

  // Enter fullscreen
  const enterFullscreen = useCallback(async () => {
    try {
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        await elem.requestFullscreen();
      } else if ('webkitRequestFullscreen' in elem) {
        await (elem as HTMLElement & { webkitRequestFullscreen: () => Promise<void> }).webkitRequestFullscreen();
      } else if ('msRequestFullscreen' in elem) {
        await (elem as HTMLElement & { msRequestFullscreen: () => Promise<void> }).msRequestFullscreen();
      }
      setIsFullscreen(true);
      return true;
    } catch (error) {
      console.error('Failed to enter fullscreen:', error);
      return false;
    }
  }, []);

  // Exit fullscreen
  const exitFullscreen = useCallback(async () => {
    try {
      // Check if document is actually in fullscreen before attempting to exit
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        ('webkitFullscreenElement' in document && (document as Document & { webkitFullscreenElement: Element | null }).webkitFullscreenElement) ||
        ('msFullscreenElement' in document && (document as Document & { msFullscreenElement: Element | null }).msFullscreenElement)
      );

      if (!isCurrentlyFullscreen) {
        // Already exited fullscreen, just update state
        setIsFullscreen(false);
        return;
      }

      // Actually in fullscreen, so exit it
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if ('webkitExitFullscreen' in document) {
        await (document as Document & { webkitExitFullscreen: () => Promise<void> }).webkitExitFullscreen();
      } else if ('msExitFullscreen' in document) {
        await (document as Document & { msExitFullscreen: () => Promise<void> }).msExitFullscreen();
      }
      setIsFullscreen(false);
    } catch (error) {
      console.error('Failed to exit fullscreen:', error);
      // Even if there's an error, update state to reflect we're not in fullscreen
      setIsFullscreen(false);
    }
  }, []);

  // Handle fullscreen change
  const handleFullscreenChange = useCallback(() => {
    const isCurrentlyFullscreen = !!(
      document.fullscreenElement ||
      ('webkitFullscreenElement' in document && (document as Document & { webkitFullscreenElement: Element | null }).webkitFullscreenElement) ||
      ('msFullscreenElement' in document && (document as Document & { msFullscreenElement: Element | null }).msFullscreenElement)
    );
    
    setIsFullscreen(isCurrentlyFullscreen);

    // If user exited fullscreen during active interview
    if (!isCurrentlyFullscreen && isInterviewActive) {
      const newExitCount = exitAttempts + 1;
      setExitAttempts(newExitCount);
      
      // Log the violation to proctoring system
      if (interviewId) {
        logFullscreenViolation(interviewId, newExitCount);
      }
      
      // Auto-terminate if too many attempts
      if (newExitCount >= maxExitAttempts) {
        console.warn(`Maximum fullscreen exit attempts (${maxExitAttempts}) reached. Terminating interview.`);
        setShowExitWarning(false);
        if (onForceExit) {
          onForceExit();
        }
        if (interviewId) {
          router.push(`/interview/${interviewId}`);
        }
        return;
      }
      
      setShowExitWarning(true);
    }
  }, [isInterviewActive, exitAttempts, maxExitAttempts, interviewId, onForceExit, router]);

  // Handle warning dialog response
  const handleContinueInterview = useCallback(async () => {
    setShowExitWarning(false);
    // Try to re-enter fullscreen
    const success = await enterFullscreen();
    if (!success) {
      // If can't re-enter fullscreen, end interview
      if (onForceExit) {
        onForceExit();
      }
      if (interviewId) {
        router.push(`/interview/${interviewId}`);
      }
    }
  }, [enterFullscreen, onForceExit, interviewId, router]);

  const handleEndInterview = useCallback(async () => {
    setShowExitWarning(false);
    await exitFullscreen();
    if (onForceExit) {
      onForceExit();
    }
    // Navigate to interview results
    if (interviewId) {
      router.push(`/interview/${interviewId}`);
    } else {
      router.push('/dashboard');
    }
  }, [exitFullscreen, onForceExit, interviewId, router]);

  // Set up fullscreen event listeners
  useEffect(() => {
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, [handleFullscreenChange]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isFullscreen) {
        exitFullscreen();
      }
    };
  }, [isFullscreen, exitFullscreen]);

  return {
    isFullscreen,
    showExitWarning,
    exitAttempts,
    enterFullscreen,
    exitFullscreen,
    handleContinueInterview,
    handleEndInterview,
    setShowExitWarning
  };
}
