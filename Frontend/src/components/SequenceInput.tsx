import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Trash2, Sparkles } from "lucide-react";

interface SequenceInputProps {
  sequence: string;
  onSequenceChange: (value: string) => void;
  onAnalyze: () => void;
  onClear: () => void;
  isLoading: boolean;
}

export const SequenceInput = ({
  sequence,
  onSequenceChange,
  onAnalyze,
  onClear,
  isLoading,
}: SequenceInputProps) => {
  return (
    <Card className="p-6 bg-card/40 backdrop-blur-glass border-border/50 shadow-2xl">
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-muted-foreground mb-2 block">
            DNA Sequence Input
          </label>
          <Textarea
            placeholder="Paste FASTA or raw sequence (e.g., ATCGATCGATCG...)"
            value={sequence}
            onChange={(e) => onSequenceChange(e.target.value)}
            className="min-h-[200px] bg-secondary/50 border-border/30 focus:border-primary/50 focus:ring-primary/20 font-mono text-sm resize-none"
            disabled={isLoading}
          />
        </div>
        
        <div className="flex gap-3">
          <Button
            onClick={onClear}
            variant="secondary"
            size="lg"
            disabled={isLoading || !sequence}
            className="flex-1 bg-secondary/50 hover:bg-secondary border border-border/30"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Clear
          </Button>
          
          <Button
            onClick={onAnalyze}
            size="lg"
            disabled={isLoading || !sequence}
            className="flex-[2] bg-gradient-accent hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing Neural Network...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Analyze Sequence
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
};
