import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Check, GripVertical, PlayCircle, Clock, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Session {
  id: string;
  title: string;
  duration: number;
  completed: boolean;
}

interface DraggableSessionProps {
  session: Session;
  isDragging?: boolean;
  onDelete?: (id: string) => void;
  onToggleComplete?: (id: string) => void;
}

export function DraggableSession({ 
  session, 
  isDragging,
  onDelete,
  onToggleComplete 
}: DraggableSessionProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: session.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group flex items-center gap-2 p-3 rounded-xl border transition-all duration-200",
        session.completed 
          ? "bg-success/5 border-success/20" 
          : "bg-card border-border hover:border-primary/30 hover:shadow-soft-sm",
        isDragging && "shadow-soft-lg scale-105 z-50 rotate-1"
      )}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-secondary/80 transition-colors"
      >
        <GripVertical className="w-4 h-4 text-muted-foreground" />
      </button>

      {/* Completion toggle */}
      <button
        onClick={() => onToggleComplete?.(session.id)}
        className={cn(
          "w-6 h-6 rounded-full flex items-center justify-center transition-all flex-shrink-0",
          session.completed 
            ? "bg-success text-success-foreground" 
            : "border-2 border-muted-foreground/30 hover:border-primary"
        )}
      >
        {session.completed && <Check className="w-3.5 h-3.5" />}
      </button>

      {/* Session info */}
      <div className="flex-1 min-w-0">
        <span className={cn(
          "text-sm font-medium truncate block",
          session.completed && "line-through text-muted-foreground"
        )}>
          {session.title}
        </span>
      </div>

      {/* Duration */}
      <div className="flex items-center gap-1 text-xs text-muted-foreground bg-secondary/50 px-2 py-1 rounded-lg">
        <Clock className="w-3 h-3" />
        {session.duration}m
      </div>

      {/* Delete button */}
      <button
        onClick={() => onDelete?.(session.id)}
        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-destructive/10 transition-all"
      >
        <Trash2 className="w-3.5 h-3.5 text-destructive" />
      </button>
    </div>
  );
}
