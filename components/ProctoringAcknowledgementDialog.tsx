"use client";

import { useState } from "react";
import { Shield, Eye, AlertTriangle, Camera, CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface ProctoringAcknowledgementDialogProps {
  open: boolean;
  onAccept: () => void | Promise<void>;
  onDecline: () => void;
}

export function ProctoringAcknowledgementDialog({
  open,
  onAccept,
  onDecline,
}: ProctoringAcknowledgementDialogProps) {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const scrolledToBottom =
      target.scrollHeight - target.scrollTop <= target.clientHeight + 50;
    if (scrolledToBottom && !hasScrolledToBottom) {
      setHasScrolledToBottom(true);
    }
  };

  const handleAccept = async () => {
    setIsAccepting(true);
    try {
      await onAccept();
    } finally {
      setIsAccepting(false);
    }
  };

  return (
    <Dialog open={open} modal>
      <DialogContent 
        className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        showCloseButton={false}
      >
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-full bg-orange-500/10">
              <Shield className="h-6 w-6 text-orange-500" />
            </div>
            <div>
              <DialogTitle className="text-2xl">Interview Proctoring Notice</DialogTitle>
              <DialogDescription className="mt-1">
                Please read and acknowledge before proceeding
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div 
          className="flex-1 overflow-y-auto space-y-4 pr-2"
          onScroll={handleScroll}
        >
          <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-1">
                  This Interview is Being Proctored
                </h3>
                <p className="text-sm text-orange-800 dark:text-orange-200">
                  Advanced AI-powered monitoring will be active throughout your interview session.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-base flex items-center gap-2">
              <Camera className="h-4 w-4" />
              What We Monitor
            </h4>
            
            <div className="space-y-3 ml-6">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-4 w-4 text-blue-500 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-medium text-sm">Face Detection</p>
                  <p className="text-sm text-muted-foreground">
                    Ensures only one person is present during the interview
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-4 w-4 text-blue-500 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-medium text-sm">Gaze & Attention Tracking</p>
                  <p className="text-sm text-muted-foreground">
                    Monitors eye movement and focus to ensure engagement
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-4 w-4 text-blue-500 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-medium text-sm">Multiple Faces Detection</p>
                  <p className="text-sm text-muted-foreground">
                    Alerts if more than one person is detected on camera
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-4 w-4 text-blue-500 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-medium text-sm">Looking Away Detection</p>
                  <p className="text-sm text-muted-foreground">
                    Tracks when you look away from the screen for extended periods
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-4 w-4 text-blue-500 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-medium text-sm">Tab Switching Detection</p>
                  <p className="text-sm text-muted-foreground">
                    Monitors if you switch to other browser tabs or applications
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <h4 className="font-semibold text-base flex items-center gap-2">
              <Eye className="h-4 w-4" />
              How Violations Affect Your Score
            </h4>
            
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4 space-y-2">
              <p className="text-sm font-medium text-red-900 dark:text-red-100">
                ⚠️ The following behaviors will be flagged and may negatively impact your evaluation:
              </p>
              <ul className="text-sm text-red-800 dark:text-red-200 space-y-1 ml-4 list-disc">
                <li>Looking away from the screen for extended periods</li>
                <li>Multiple people detected on camera</li>
                <li>No face detected (leaving camera view)</li>
                <li>Switching browser tabs or applications</li>
                <li>Using external devices or materials</li>
              </ul>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                <span className="font-semibold">Integrity Score:</span> Your final report will include an integrity score based on proctoring data. Excessive violations may result in interview disqualification.
              </p>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <h4 className="font-semibold text-base">Best Practices</h4>
            <ul className="space-y-2 ml-4 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span>✓</span>
                <span>Ensure you are in a quiet, well-lit environment</span>
              </li>
              <li className="flex gap-2">
                <span>✓</span>
                <span>Position your camera to clearly show your face</span>
              </li>
              <li className="flex gap-2">
                <span>✓</span>
                <span>Stay focused on the interview window throughout the session</span>
              </li>
              <li className="flex gap-2">
                <span>✓</span>
                <span>Keep your face visible at all times</span>
              </li>
              <li className="flex gap-2">
                <span>✓</span>
                <span>Avoid using external materials or devices</span>
              </li>
            </ul>
          </div>

          <Separator />

          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-2">
            <h4 className="font-semibold text-base">Your Privacy</h4>
            <p className="text-sm text-muted-foreground">
              All proctoring data is processed in real-time and stored securely. Video footage is not recorded, only metadata such as attention scores and violation events. This data is used solely for interview integrity assessment and will not be shared with third parties.
            </p>
          </div>

          {!hasScrolledToBottom && (
            <div className="sticky bottom-0 left-0 right-0 py-2 text-center">
              <Badge variant="outline" className="animate-pulse">
                Please scroll to read the full notice ↓
              </Badge>
            </div>
          )}
        </div>

        <DialogFooter className="mt-4 gap-2">
          <Button variant="outline" onClick={onDecline}>
            Decline & Exit
          </Button>
          <Button 
            onClick={handleAccept}
            disabled={!hasScrolledToBottom || isAccepting}
            className="bg-green-600 hover:bg-green-700"
          >
            {isAccepting ? 'Entering Fullscreen...' : 'I Understand & Accept'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
