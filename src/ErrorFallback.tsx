import { Warning, ArrowClockwise } from "@phosphor-icons/react";

export const ErrorFallback = ({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-destructive/10 border border-destructive rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Warning className="w-4 h-4 text-destructive" />
            <h3 className="font-semibold text-destructive">Runtime Error</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Something unexpected happened while running the application.
          </p>
        </div>
        
        <div className="bg-card border rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-sm text-muted-foreground mb-2">Error Details:</h3>
          <pre className="text-xs text-destructive bg-muted/50 p-3 rounded border overflow-auto max-h-32">
            {error.message}
          </pre>
        </div>
        
        <button 
          onClick={resetErrorBoundary} 
          className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
        >
          <ArrowClockwise className="w-4 h-4" />
          Try Again
        </button>
      </div>
    </div>
  );
}
