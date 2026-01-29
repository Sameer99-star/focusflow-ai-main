import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Check, Clock, Plus, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { DraggableSession } from "./DraggableSession";
import { Button } from "@/components/ui/button";

interface Session {
  id: string;
  title: string;
  duration: number;
  completed: boolean;
}

interface DroppableDayProps {
  day: number;
  sessions: Session[];
  isToday?: boolean;
  isCompleted?: boolean;
  onAddSession?: (day: number) => void;
  onDeleteSession?: (id: string) => void;
  onToggleComplete?: (id: string) => void;
}

export function DroppableDay({ 
  day, 
  sessions, 
  isToday = false,
  isCompleted = false,
  onAddSession,
  onDeleteSession,
  onToggleComplete 
}: DroppableDayProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `day-${day}`,
  });

  const totalMinutes = sessions.reduce((acc, s) => acc + s.duration, 0);
  const completedSessions = sessions.filter(s => s.completed).length;
  const progress = sessions.length > 0 ? (completedSessions / sessions.length) * 100 : 0;

  return (
    <div 
      ref={setNodeRef}
      className={cn(
        "bg-card rounded-2xl p-5 border-2 transition-all duration-200",
        isOver && "border-primary bg-primary/5 scale-[1.02]",
        isToday && !isOver && "border-primary/50 shadow-glow",
        isCompleted && !isOver && "border-success/30",
        !isToday && !isCompleted && !isOver && "border-border hover:border-border/80"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div 
            className={cn(
              "w-11 h-11 rounded-xl flex items-center justify-center font-bold text-lg transition-colors",
              isToday && "bg-primary text-primary-foreground",
              isCompleted && "bg-success text-success-foreground",
              !isToday && !isCompleted && "bg-secondary text-secondary-foreground"
            )}
          >
            {day}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground">
                {isToday ? "Today" : `Day ${day}`}
              </h3>
              {isCompleted && (
                <span className="flex items-center gap-1 text-xs bg-success/10 text-success px-2 py-0.5 rounded-full">
                  <Check className="w-3 h-3" />
                  Done
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {totalMinutes} min
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {sessions.length} sessions
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sessions */}
      <SortableContext 
        items={sessions.map(s => s.id)} 
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2 min-h-[80px]">
          {sessions.length === 0 ? (
            <div className={cn(
              "h-20 rounded-xl border-2 border-dashed flex items-center justify-center text-sm transition-colors",
              isOver ? "border-primary bg-primary/5 text-primary" : "border-muted-foreground/20 text-muted-foreground"
            )}>
              {isOver ? "Drop here!" : "Drop sessions here"}
            </div>
          ) : (
            sessions.map((session) => (
              <DraggableSession 
                key={session.id} 
                session={session}
                onDelete={onDeleteSession}
                onToggleComplete={onToggleComplete}
              />
            ))
          )}
        </div>
      </SortableContext>

      {/* Add session button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onAddSession?.(day)}
        className="w-full mt-3 text-muted-foreground hover:text-foreground"
      >
        <Plus className="w-4 h-4 mr-1" />
        Add Session
      </Button>

      {/* Progress bar */}
      {sessions.length > 0 && (
        <div className="mt-4 pt-3 border-t border-border">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium text-foreground">
              {completedSessions}/{sessions.length} complete
            </span>
          </div>
          <div className="h-2 rounded-full bg-secondary overflow-hidden">
            <div 
              className={cn(
                "h-full rounded-full transition-all duration-500 ease-out",
                isCompleted ? "bg-success" : "bg-primary"
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
