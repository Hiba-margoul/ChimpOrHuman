import { useState } from "react";
import { motion } from "framer-motion";
import { Dna, Activity } from "lucide-react";
import { SequenceInput } from "@/components/SequenceInput";
import { AnalysisResults } from "@/components/AnalysisResults";
import { useToast } from "@/hooks/use-toast";
import dnaHelix from "@/assets/dna-helix.png";

interface AnalysisResponse {
  label: string;
  confidence: number;
  scores: {
    humain: number;
    chimp: number;
    chien: number;
  };
}

const Index = () => {
  const [sequence, setSequence] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<AnalysisResponse | null>(null);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!sequence.trim()) {
      toast({
        title: "Empty Sequence",
        description: "Please paste a DNA sequence before analyzing.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setResults(null);

    try {
      const response = await fetch("http://127.0.0.1:5000/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sequence: sequence.trim() }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data: AnalysisResponse = await response.json();
      setResults(data);
      
      toast({
        title: "Analysis Complete",
        description: `Predicted species: ${data.label} with ${(data.confidence * 100).toFixed(1)}% confidence.`,
      });
    } catch (error) {
      console.error("Analysis error:", error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error 
          ? error.message.includes("fetch") 
            ? "Unable to connect to the server. Make sure the Flask API is running on http://127.0.0.1:5000"
            : error.message
          : "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setSequence("");
    setResults(null);
  };

  return (
    <div className="min-h-screen bg-gradient-bg relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-bio-purple/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-bio-emerald/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-bio-blue/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex justify-center mb-6">
            <div className="relative">
              <img 
                src={dnaHelix} 
                alt="DNA Helix" 
                className="w-32 h-32 object-contain opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-accent opacity-20 blur-2xl" />
            </div>
          </div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-accent bg-clip-text text-transparent"
          >
            Genomic Sequence Classifier
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Deep Learning powered analysis for Mitochondrial DNA differentiation
            <br />
            <span className="text-primary font-semibold">Human vs Chimpanzee vs Dog</span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-center justify-center gap-2 mt-4 text-sm text-muted-foreground"
          >
            <Activity className="h-4 w-4 text-accent" />
            <span>Powered by Neural Networks</span>
            <Dna className="h-4 w-4 text-primary ml-2" />
          </motion.div>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="max-w-4xl mx-auto space-y-8"
        >
          <SequenceInput
            sequence={sequence}
            onSequenceChange={setSequence}
            onAnalyze={handleAnalyze}
            onClear={handleClear}
            isLoading={isLoading}
          />

          {results && (
            <AnalysisResults
              label={results.label}
              confidence={results.confidence}
              scores={results.scores}
            />
          )}
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-16 text-sm text-muted-foreground"
        >
          <p>Advanced genomic classification using state-of-the-art deep learning models</p>
        </motion.div>
      </div>
    </div>
  );
};

export default Index;
