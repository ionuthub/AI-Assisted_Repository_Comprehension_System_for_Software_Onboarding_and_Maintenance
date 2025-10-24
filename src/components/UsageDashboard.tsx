import { Card } from "@/components/ui/card";
import { AlertCircle, TrendingUp, Zap, AlertTriangle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import type { UsageStats, UsageLimits } from "@/lib/utils";
import { formatCost, formatUsagePercentage } from "@/lib/utils";

interface UsageDashboardProps {
  stats: UsageStats;
  limits: UsageLimits;
  warningLevel: 'safe' | 'warning' | 'exceeded';
}

export default function UsageDashboard({ stats, limits, warningLevel }: UsageDashboardProps) {
  const linePercentage = (stats.lineExplanations / limits.maxLineExplanations) * 100;
  const filePercentage = (stats.fileExplanations / limits.maxFileExplanations) * 100;
  const costPercentage = (stats.estimatedCost / limits.maxDailyCost) * 100;
  const repoPercentage = (stats.repositoriesAnalyzed / limits.maxRepositoriesPerDay) * 100;
  const projectPercentage = (stats.projectsGenerated / limits.maxProjectsPerDay) * 100;

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return "bg-destructive";
    if (percentage >= 80) return "bg-yellow-500";
    return "bg-primary";
  };

  const getWarningIcon = () => {
    if (warningLevel === 'exceeded') return <AlertCircle className="w-5 h-5 text-destructive" />;
    if (warningLevel === 'warning') return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    return <TrendingUp className="w-5 h-5 text-primary" />;
  };

  return (
    <Card className="p-6 bg-card border-border">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Zap className="w-6 h-6 text-primary" />
              Usage & Costs
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Track your API usage and estimated costs
            </p>
          </div>
          <div className="flex items-center gap-2">
            {getWarningIcon()}
            <span className="text-sm font-semibold text-foreground capitalize">
              {warningLevel === 'exceeded' ? 'Limit Exceeded' : warningLevel === 'warning' ? 'Warning' : 'Safe'}
            </span>
          </div>
        </div>

        {/* Cost Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-secondary/50 rounded-lg p-4">
            <p className="text-xs text-muted-foreground mb-1">Estimated Daily Cost</p>
            <p className="text-2xl font-bold text-foreground">{formatCost(stats.estimatedCost)}</p>
            <p className="text-xs text-muted-foreground mt-1">of {formatCost(limits.maxDailyCost)} daily limit</p>
          </div>
          <div className="bg-secondary/50 rounded-lg p-4">
            <p className="text-xs text-muted-foreground mb-1">Line Explanations</p>
            <p className="text-2xl font-bold text-foreground">{stats.lineExplanations}</p>
            <p className="text-xs text-muted-foreground mt-1">of {limits.maxLineExplanations} limit</p>
          </div>
          <div className="bg-secondary/50 rounded-lg p-4">
            <p className="text-xs text-muted-foreground mb-1">File Explanations</p>
            <p className="text-2xl font-bold text-foreground">{stats.fileExplanations}</p>
            <p className="text-xs text-muted-foreground mt-1">of {limits.maxFileExplanations} limit</p>
          </div>
        </div>

        {/* Usage Bars */}
        <div className="space-y-4">
          {/* Cost Progress */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-semibold text-foreground">Daily Cost Usage</label>
              <span className="text-xs text-muted-foreground">{formatUsagePercentage(costPercentage)}</span>
            </div>
            <Progress value={Math.min(costPercentage, 100)} className="h-2" />
          </div>

          {/* Line Explanations Progress */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-semibold text-foreground">Line Explanations</label>
              <span className="text-xs text-muted-foreground">{formatUsagePercentage(linePercentage)}</span>
            </div>
            <Progress value={Math.min(linePercentage, 100)} className="h-2" />
          </div>

          {/* File Explanations Progress */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-semibold text-foreground">File Explanations</label>
              <span className="text-xs text-muted-foreground">{formatUsagePercentage(filePercentage)}</span>
            </div>
            <Progress value={Math.min(filePercentage, 100)} className="h-2" />
          </div>

          {/* Repositories Progress */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-semibold text-foreground">Repositories (Daily)</label>
              <span className="text-xs text-muted-foreground">{formatUsagePercentage(repoPercentage)}</span>
            </div>
            <Progress value={Math.min(repoPercentage, 100)} className="h-2" />
          </div>

          {/* Projects Progress */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-semibold text-foreground">Projects Generated (Daily)</label>
              <span className="text-xs text-muted-foreground">{formatUsagePercentage(projectPercentage)}</span>
            </div>
            <Progress value={Math.min(projectPercentage, 100)} className="h-2" />
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">💡 Tip:</span> Usage resets daily at midnight UTC. 
            Costs are estimated based on Google Gemini API pricing. Actual charges may vary.
          </p>
        </div>
      </div>
    </Card>
  );
}
