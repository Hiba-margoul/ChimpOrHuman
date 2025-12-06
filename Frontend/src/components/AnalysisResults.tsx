import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2 } from "lucide-react";

interface AnalysisResultsProps {
  label: string;
  confidence: number;
  scores: {
    humain: number;
    chimp: number;
    chien: number;
  };
}

export const AnalysisResults = ({ label, confidence, scores }: AnalysisResultsProps) => {
  const speciesData = [
    {
      name: "Homo Sapiens",
      key: "humain",
      score: scores.humain,
      indicatorClass: "bg-species-human",
      bgColor: "bg-species-human/10",
    },
    {
      name: "Chimpanzee",
      key: "chimp",
      score: scores.chimp,
      indicatorClass: "bg-species-chimp",
      bgColor: "bg-species-chimp/10",
    },
   
  ];

  const getSpeciesLabel = (apiLabel: string) => {
    const normalized = apiLabel.toLowerCase();
    if (normalized.includes("humain") || normalized.includes("human")) return "HUMAN";
    if (normalized.includes("chimp")) return "CHIMPANZEE";
    return apiLabel.toUpperCase();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="p-6 bg-card/40 backdrop-blur-glass border-border/50 shadow-2xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6 text-accent" />
            <h3 className="text-xl font-semibold text-foreground">Analysis Complete</h3>
          </div>
        </div>

        <div className="flex items-center gap-4 p-4 bg-gradient-primary rounded-lg border border-primary/20">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Predicted Species</p>
            <Badge className="text-lg px-4 py-1.5 bg-primary hover:bg-primary font-bold">
              {getSpeciesLabel(label)}
            </Badge>
          </div>
          <div className="h-12 w-px bg-border/50" />
          <div>
            <p className="text-sm text-muted-foreground mb-1">Global Confidence</p>
            <p className="text-2xl font-bold text-foreground">
              {(confidence * 100).toFixed(1)}%
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-medium text-muted-foreground">Detailed Breakdown</h4>
          {speciesData.map((species, index) => (
            <motion.div
              key={species.key}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 + 0.2 }}
              className="space-y-2"
            >
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-foreground">{species.name}</span>
                <span className="text-sm font-bold text-foreground">
                  {(species.score * 100).toFixed(1)}%
                </span>
              </div>
              <div className={`p-1 rounded-full ${species.bgColor}`}>
                <Progress
                  value={species.score * 100}
                  className="h-3 bg-secondary/30"
                  indicatorClassName={`${species.indicatorClass} transition-all duration-1000 ease-out`}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
};
