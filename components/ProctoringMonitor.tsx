'use client';

import { useEffect } from 'react';
import { ProctoringVideoPreview } from './ProctoringVideoPreview';
import type { ProctoringEvent, ProctoringMetrics } from '../src/hooks/useMediaPipeProctoring';

interface ProctoringMonitorProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  metrics: ProctoringMetrics;
  isActive: boolean;
  onEvent?: (event: ProctoringEvent) => void;
}

export function ProctoringMonitor({
  videoRef,
  metrics,
  isActive,
  onEvent
}: ProctoringMonitorProps) {
  // Show toast for violations (debounced)
  useEffect(() => {
    if (!onEvent || !isActive) return;
    // Event handling is done externally via onEvent callback
    // Toast notifications would be triggered when violations occur
  }, [onEvent, isActive]);

  return (
    <ProctoringVideoPreview
      videoRef={videoRef}
      metrics={metrics}
      isActive={isActive}
    />
  );
}
