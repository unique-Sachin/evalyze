"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, FileText, Home, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

interface InterviewCompletionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  interviewId: string | null;
  onNewInterview: () => void;
}

export function InterviewCompletionDialog({
  open,
  onOpenChange,
  interviewId,
  onNewInterview
}: InterviewCompletionDialogProps) {
  const router = useRouter();

  const handleViewResults = () => {
    if (interviewId) {
      onOpenChange(false);
      router.push(`/interview/${interviewId}`);
    }
  };

  const handleNewInterview = () => {
    onOpenChange(false);
    onNewInterview();
  };

  const handleGoHome = () => {
    onOpenChange(false);
    router.push('/dashboard');
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="rounded-full bg-green-100 dark:bg-green-900/20 p-3">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl">Interview Complete!</DialogTitle>
          <DialogDescription className="text-center">
            Great job! Your interview has been successfully completed and analyzed.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-4">
          {/* View Results */}
          <Card className="cursor-pointer hover:bg-accent transition-colors" onClick={handleViewResults}>
            <CardContent className="p-4">
              <Button 
                variant="ghost" 
                className="w-full justify-start h-auto py-3"
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewResults();
                }}
              >
                <FileText className="h-5 w-5 mr-3 text-blue-600" />
                <div className="text-left">
                  <div className="font-semibold">View Results</div>
                  <div className="text-sm text-muted-foreground">
                    See your detailed performance analysis
                  </div>
                </div>
              </Button>
            </CardContent>
          </Card>

          {/* Take Another Interview */}
          <Card className="cursor-pointer hover:bg-accent transition-colors" onClick={handleNewInterview}>
            <CardContent className="p-4">
              <Button 
                variant="ghost" 
                className="w-full justify-start h-auto py-3"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNewInterview();
                }}
              >
                <RefreshCw className="h-5 w-5 mr-3 text-green-600" />
                <div className="text-left">
                  <div className="font-semibold">Take Another Interview</div>
                  <div className="text-sm text-muted-foreground">
                    Start a fresh interview session
                  </div>
                </div>
              </Button>
            </CardContent>
          </Card>

          {/* Go to Home */}
          <Card className="cursor-pointer hover:bg-accent transition-colors" onClick={handleGoHome}>
            <CardContent className="p-4">
              <Button 
                variant="ghost" 
                className="w-full justify-start h-auto py-3"
                onClick={(e) => {
                  e.stopPropagation();
                  handleGoHome();
                }}
              >
                <Home className="h-5 w-5 mr-3 text-purple-600" />
                <div className="text-left">
                  <div className="font-semibold">Go to Dashboard</div>
                  <div className="text-sm text-muted-foreground">
                    Return to your dashboard
                  </div>
                </div>
              </Button>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
