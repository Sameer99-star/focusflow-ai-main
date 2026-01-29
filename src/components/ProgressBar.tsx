import { Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ProgressBarProps {
  currentDay: number;
  totalDays: number;
  className?: string;
}

export function ProgressBar({ currentDay, totalDays, className }: ProgressBarProps) {
  const percentage = Math.min((currentDay / totalDays) * 100, 100);
  const estimatedFinish = new Date();
  estimatedFinish.setDate(estimatedFinish.getDate() + (totalDays - currentDay));

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div 
          className={cn(
            "relative w-full group cursor-pointer",
            className
          )}
        >
          {/* Track */}
          <div className="h-3 rounded-full bg-progress-track overflow-hidden transition-all duration-200 group-hover:shadow-glow">
            {/* Fill */}
            <div 
              className="h-full rounded-full bg-primary transition-all duration-500 ease-out relative overflow-hidden"
              style={{ width: `${percentage}%` }}
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-foreground/20 to-transparent animate-pulse-soft" />
            </div>
          </div>

          {/* Day indicator */}
          <div className="flex items-center justify-between mt-2">
            <span className="text-sm font-medium text-muted-foreground">
              Day {currentDay} / {totalDays}
            </span>
            
            {/* Trophy indicator at current position */}
            <div 
              className="absolute top-1/2 -translate-y-1/2 transition-all duration-500 ease-out"
              style={{ left: `calc(${percentage}% - 10px)` }}
            >
              <div className="bg-primary rounded-full p-1.5 shadow-glow animate-float">
                <Trophy className="w-4 h-4 text-primary-foreground" />
              </div>
            </div>

            <span className="text-sm font-semibold text-primary">
              {percentage.toFixed(0)}%
            </span>
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent 
        side="bottom" 
        className="bg-card border border-border shadow-soft-lg p-3"
      >
        <div className="space-y-1">
          <p className="text-sm font-medium">
            <span className="text-primary">{percentage.toFixed(1)}%</span> complete
          </p>
          <p className="text-xs text-muted-foreground">
            Estimated finish: {estimatedFinish.toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric',
              year: 'numeric'
            })}
          </p>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
