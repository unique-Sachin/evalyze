"use client";

import { AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface FullscreenExitWarningProps {
  open: boolean;
  exitAttempts: number;
  maxAttempts?: number;
  onContinue: () => void;
  onEndInterview: () => void;
}

export function FullscreenExitWarning({
  open,
  exitAttempts,
  maxAttempts = 5,
  onContinue,
  onEndInterview,
}: FullscreenExitWarningProps) {
  const remainingAttempts = maxAttempts - exitAttempts;
  const isCritical = remainingAttempts <= 2;
  
  return (
    <Dialog open={open} modal>
      <DialogContent
        className="max-w-md"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        showCloseButton={false}
      >
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-3 rounded-full ${isCritical ? 'bg-red-600/20' : 'bg-red-500/10'}`}>
              <AlertTriangle className={`h-6 w-6 ${isCritical ? 'text-red-600' : 'text-red-500'}`} />
            </div>
            <div>
              <DialogTitle className="text-xl">
                {isCritical ? '⚠️ CRITICAL WARNING' : 'Fullscreen Exit Detected'}
              </DialogTitle>
              <DialogDescription className="mt-1">
                {exitAttempts === 1
                  ? "You have exited fullscreen mode"
                  : isCritical
                    ? `FINAL WARNING: ${remainingAttempts} attempt${remainingAttempts === 1 ? '' : 's'} remaining before automatic termination`
                    : `Warning: ${exitAttempts} fullscreen exit attempts detected`}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {isCritical && (
            <div className="bg-red-100 dark:bg-red-950/40 border-2 border-red-600 dark:border-red-700 rounded-lg p-4 animate-pulse">
              <p className="text-sm text-red-900 dark:text-red-100 font-bold mb-2">
                🚨 AUTOMATIC TERMINATION IMMINENT
              </p>
              <p className="text-sm text-red-800 dark:text-red-200">
                You have only <strong>{remainingAttempts}</strong> attempt{remainingAttempts === 1 ? '' : 's'} remaining. 
                One more violation will automatically end your interview and you will be redirected to results.
              </p>
            </div>
          )}
          
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-sm text-red-900 dark:text-red-100 font-medium mb-2">
              ⚠️ Interview Integrity Requirement
            </p>
            <p className="text-sm text-red-800 dark:text-red-200">
              For security and proctoring purposes, this interview must remain in fullscreen mode. 
              <strong> All exit attempts are being recorded</strong> and WILL negatively affect your final evaluation.
            </p>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <p className="text-sm text-yellow-900 dark:text-yellow-100 font-medium mb-2">
              📊 Violation Details:
            </p>
            <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1 ml-4">
              <li>• <strong>Total Exits:</strong> {exitAttempts}</li>
              <li>• <strong>Remaining Attempts:</strong> {remainingAttempts}</li>
              <li>• <strong>Severity:</strong> {isCritical ? 'CRITICAL' : exitAttempts >= 3 ? 'HIGH' : 'MEDIUM'}</li>
              <li>• <strong>Impact:</strong> All violations recorded in proctoring report</li>
            </ul>
          </div>

          {exitAttempts > 2 && !isCritical && (
            <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3">
              <p className="text-sm text-orange-900 dark:text-orange-100">
                <strong>Warning:</strong> Multiple exit attempts have been recorded. This is significantly impacting your integrity score.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 mt-4">
          <Button
            variant="destructive"
            onClick={onEndInterview}
            className="flex-1"
          >
            End Interview & View Results
          </Button>
          <Button
            onClick={onContinue}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            Return to Fullscreen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
