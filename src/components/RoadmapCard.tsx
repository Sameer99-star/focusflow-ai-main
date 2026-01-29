import { Check, Clock, PlayCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Session {
  id: string;
  title: string;
  duration: number;
  completed: boolean;
}

interface RoadmapCardProps {
  day: number;
  sessions: Session[];
  isToday?: boolean;
  isCompleted?: boolean;
  className?: string;
  onToggleSession?: (sessionId: string) => void;
}

export function RoadmapCard({ 
  day, 
  sessions, 
  isToday = false, 
  isCompleted = false,
  className,
  onToggleSession,
}: RoadmapCardProps) {
  const totalMinutes = sessions.reduce((acc, s) => acc + s.duration, 0);
  const completedSessions = sessions.filter(s => s.completed).length;

  return (
    <div 
      className={cn(
        "bg-card rounded-xl p-5 border transition-all duration-200 card-hover",
        isToday && "border-primary shadow-glow",
        isCompleted && "border-success/50",
        !isToday && !isCompleted && "border-border",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div 
            className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center font-semibold",
              isToday && "bg-primary text-primary-foreground",
              isCompleted && "bg-success text-success-foreground",
              !isToday && !isCompleted && "bg-secondary text-secondary-foreground"
            )}
          >
            {day}
          </div>
          <div>
            <h3 className="font-medium text-foreground">
              {isToday ? "Today" : `Day ${day}`}
            </h3>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {totalMinutes} min
            </p>
          </div>
        </div>

        {isCompleted && (
          <div className="bg-success/10 text-success rounded-full p-1.5">
            <Check className="w-4 h-4" />
          </div>
        )}
      </div>

      {/* Sessions */}
      <div className="space-y-2">
        {sessions.map((session) => (
          <button 
            key={session.id}
            onClick={() => onToggleSession?.(session.id)}
            className={cn(
              "w-full flex items-center gap-3 p-3 rounded-lg transition-colors duration-150 text-left",
              session.completed 
                ? "bg-success/5 text-muted-foreground" 
                : "bg-secondary/50 hover:bg-secondary",
              onToggleSession && "cursor-pointer hover:ring-1 hover:ring-primary/20"
            )}
          >
            <div className={cn(
              "w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-colors",
              session.completed 
                ? "bg-success text-success-foreground" 
                : "border-2 border-muted-foreground/30"
            )}>
              {session.completed && <Check className="w-3 h-3" />}
            </div>
            <span className={cn(
              "text-sm flex-1 truncate",
              session.completed && "line-through"
            )}>
              {session.title}
            </span>
            <span className="text-xs text-muted-foreground">
              {session.duration}m
            </span>
          </button>
        ))}
      </div>

      {/* Progress indicator */}
      <div className="mt-4 pt-3 border-t border-border">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-medium text-foreground">
            {completedSessions}/{sessions.length}
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-progress-track overflow-hidden">
          <div 
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${(completedSessions / sessions.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
