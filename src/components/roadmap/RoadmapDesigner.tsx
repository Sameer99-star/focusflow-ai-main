import { useState, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { 
  Plus, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Sparkles,
  RotateCcw,
  Save,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DroppableDay } from "./DroppableDay";
import { DraggableSession } from "./DraggableSession";
import { AddSessionDialog } from "./AddSessionDialog";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Session {
  id: string;
  title: string;
  duration: number;
  completed: boolean;
}

interface DayData {
  day: number;
  sessions: Session[];
  isToday?: boolean;
  isCompleted?: boolean;
}

interface RoadmapDesignerProps {
  initialData?: DayData[];
  dailyLimit?: number;
  onSave?: (data: DayData[]) => void;
}

export function RoadmapDesigner({ 
  initialData = [], 
  dailyLimit = 90,
  onSave 
}: RoadmapDesignerProps) {
  const [days, setDays] = useState<DayData[]>(initialData);
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number>(1);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const findDayBySessionId = (id: string): number | null => {
    for (const day of days) {
      if (day.sessions.some(s => s.id === id)) {
        return day.day;
      }
    }
    return null;
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const dayNum = findDayBySessionId(active.id as string);
    if (dayNum) {
      const day = days.find(d => d.day === dayNum);
      const session = day?.sessions.find(s => s.id === active.id);
      if (session) {
        setActiveSession(session);
      }
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeDay = findDayBySessionId(activeId);
    let overDay: number | null = null;

    // Check if dropping on a day container
    if (overId.startsWith("day-")) {
      overDay = parseInt(overId.replace("day-", ""));
    } else {
      overDay = findDayBySessionId(overId);
    }

    if (activeDay && overDay && activeDay !== overDay) {
      setDays(prev => {
        const newDays = [...prev];
        const activeDayData = newDays.find(d => d.day === activeDay);
        const overDayData = newDays.find(d => d.day === overDay);

        if (!activeDayData || !overDayData) return prev;

        const sessionIndex = activeDayData.sessions.findIndex(s => s.id === activeId);
        if (sessionIndex === -1) return prev;

        const [session] = activeDayData.sessions.splice(sessionIndex, 1);
        
        // Find insert position
        const overIndex = overDayData.sessions.findIndex(s => s.id === overId);
        if (overIndex !== -1) {
          overDayData.sessions.splice(overIndex, 0, session);
        } else {
          overDayData.sessions.push(session);
        }

        return newDays;
      });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveSession(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    const activeDay = findDayBySessionId(activeId);
    const overDay = findDayBySessionId(overId);

    if (activeDay && overDay && activeDay === overDay) {
      setDays(prev => {
        const newDays = [...prev];
        const dayData = newDays.find(d => d.day === activeDay);
        if (!dayData) return prev;

        const oldIndex = dayData.sessions.findIndex(s => s.id === activeId);
        const newIndex = dayData.sessions.findIndex(s => s.id === overId);

        dayData.sessions = arrayMove(dayData.sessions, oldIndex, newIndex);
        return newDays;
      });
    }
  };

  const handleAddDay = () => {
    const newDay = days.length + 1;
    setDays(prev => [...prev, { day: newDay, sessions: [] }]);
    toast({
      title: "Day added",
      description: `Day ${newDay} has been added to your roadmap.`,
    });
  };

  const handleDeleteDay = (dayNum: number) => {
    if (days.length <= 1) return;
    setDays(prev => {
      const filtered = prev.filter(d => d.day !== dayNum);
      // Renumber days
      return filtered.map((d, i) => ({ ...d, day: i + 1 }));
    });
  };

  const handleAddSession = (day: number) => {
    setSelectedDay(day);
    setAddDialogOpen(true);
  };

  const handleCreateSession = (title: string, duration: number) => {
    const newSession: Session = {
      id: `session-${Date.now()}`,
      title,
      duration,
      completed: false,
    };

    setDays(prev => {
      const newDays = [...prev];
      const dayData = newDays.find(d => d.day === selectedDay);
      if (dayData) {
        dayData.sessions.push(newSession);
      }
      return newDays;
    });

    toast({
      title: "Session added",
      description: `"${title}" has been added to Day ${selectedDay}.`,
    });
  };

  const handleDeleteSession = (sessionId: string) => {
    setDays(prev => {
      return prev.map(day => ({
        ...day,
        sessions: day.sessions.filter(s => s.id !== sessionId),
      }));
    });
  };

  const handleToggleComplete = (sessionId: string) => {
    setDays(prev => {
      return prev.map(day => ({
        ...day,
        sessions: day.sessions.map(s => 
          s.id === sessionId ? { ...s, completed: !s.completed } : s
        ),
      }));
    });
  };

  const handleRebalance = useCallback(() => {
    const allSessions = days.flatMap(d => d.sessions);
    const newDays: DayData[] = [];
    
    let currentDay = 1;
    let currentMinutes = 0;
    let currentSessions: Session[] = [];

    allSessions.forEach(session => {
      if (currentMinutes + session.duration > dailyLimit && currentSessions.length > 0) {
        newDays.push({ day: currentDay, sessions: currentSessions });
        currentDay++;
        currentMinutes = 0;
        currentSessions = [];
      }
      currentSessions.push(session);
      currentMinutes += session.duration;
    });

    if (currentSessions.length > 0) {
      newDays.push({ day: currentDay, sessions: currentSessions });
    }

    setDays(newDays);
    toast({
      title: "Schedule rebalanced",
      description: `Sessions have been distributed across ${newDays.length} days.`,
    });
  }, [days, dailyLimit]);

  const handleSave = () => {
    onSave?.(days);
    toast({
      title: "Roadmap saved! ✨",
      description: "Your learning schedule has been saved.",
    });
  };

  // Stats
  const totalSessions = days.reduce((sum, d) => sum + d.sessions.length, 0);
  const completedSessions = days.reduce((sum, d) => sum + d.sessions.filter(s => s.completed).length, 0);
  const totalMinutes = days.reduce((sum, d) => sum + d.sessions.reduce((s, session) => s + session.duration, 0), 0);

  return (
    <div className="space-y-6">
      {/* Stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card p-4 rounded-2xl border border-border">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
            <Calendar className="w-4 h-4" />
            Days
          </div>
          <div className="text-2xl font-bold text-foreground">{days.length}</div>
        </div>
        <div className="bg-card p-4 rounded-2xl border border-border">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
            <Sparkles className="w-4 h-4" />
            Sessions
          </div>
          <div className="text-2xl font-bold text-foreground">{totalSessions}</div>
        </div>
        <div className="bg-card p-4 rounded-2xl border border-border">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
            <CheckCircle2 className="w-4 h-4" />
            Completed
          </div>
          <div className="text-2xl font-bold text-foreground">
            {completedSessions}/{totalSessions}
          </div>
        </div>
        <div className="bg-card p-4 rounded-2xl border border-border">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
            <Clock className="w-4 h-4" />
            Total Time
          </div>
          <div className="text-2xl font-bold text-foreground">
            {Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="outline" onClick={handleAddDay}>
          <Plus className="w-4 h-4 mr-2" />
          Add Day
        </Button>
        <Button variant="outline" onClick={handleRebalance}>
          <RotateCcw className="w-4 h-4 mr-2" />
          Rebalance
        </Button>
        <div className="flex-1" />
        <Button variant="hero" onClick={handleSave}>
          <Save className="w-4 h-4 mr-2" />
          Save Roadmap
        </Button>
      </div>

      {/* Drag and drop grid */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {days.map((day) => (
            <DroppableDay
              key={day.day}
              day={day.day}
              sessions={day.sessions}
              isToday={day.isToday}
              isCompleted={day.isCompleted}
              onAddSession={handleAddSession}
              onDeleteSession={handleDeleteSession}
              onToggleComplete={handleToggleComplete}
            />
          ))}
        </div>

        <DragOverlay>
          {activeSession && (
            <DraggableSession session={activeSession} isDragging />
          )}
        </DragOverlay>
      </DndContext>

      {/* Empty state */}
      {days.length === 0 && (
        <div className="text-center py-16 bg-card rounded-2xl border-2 border-dashed border-border">
          <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No days yet</h3>
          <p className="text-muted-foreground mb-4">Start building your learning roadmap</p>
          <Button onClick={handleAddDay}>
            <Plus className="w-4 h-4 mr-2" />
            Add First Day
          </Button>
        </div>
      )}

      {/* Helper text */}
      {days.length > 0 && (
        <p className="text-center text-sm text-muted-foreground">
          💡 Drag and drop sessions between days to customize your schedule
        </p>
      )}

      {/* Add Session Dialog */}
      <AddSessionDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onAdd={handleCreateSession}
        day={selectedDay}
      />
    </div>
  );
}
