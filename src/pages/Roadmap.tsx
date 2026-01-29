import { useState } from "react";
import { Calendar, Clock, Pause, Play, RotateCcw, Plus, Sparkles, ArrowLeft, Download, Youtube } from "lucide-react";
import { RoadmapScheduler } from "@/components/RoadmapScheduler";
import { RoadmapDesigner } from "@/components/roadmap/RoadmapDesigner";
import { CalendarExportDialog } from "@/components/roadmap/CalendarExportDialog";
import { YouTubeImportDialog } from "@/components/roadmap/YouTubeImportDialog";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ProgressBar";
import { cn } from "@/lib/utils";
import { useRoadmap } from "@/hooks/use-roadmap";

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

type ViewMode = "roadmap" | "scheduler" | "designer";

export default function Roadmap() {
  const [isPaused, setIsPaused] = useState(false);
  const [localDailyLimit, setLocalDailyLimit] = useState(60);
  const [viewMode, setViewMode] = useState<ViewMode>("roadmap");
  const [calendarDialogOpen, setCalendarDialogOpen] = useState(false);
  const [youtubeDialogOpen, setYoutubeDialogOpen] = useState(false);

  const { 
    activeRoadmap, 
    stats, 
    isLoading, 
    createRoadmap, 
    toggleSessionComplete 
  } = useRoadmap();

  // Convert activeRoadmap to display format for existing components
  const roadmapData: DayData[] = activeRoadmap?.days.map(day => ({
    day: day.dayNumber,
    sessions: day.sessions.map(s => ({
      id: s.id,
      title: s.title,
      duration: s.duration,
      completed: s.completed,
    })),
    isToday: day.isToday,
    isCompleted: day.isCompleted,
  })) || [];

  const dailyLimit = activeRoadmap?.dailyLimit || localDailyLimit;
  const courseName = activeRoadmap?.title || "No active roadmap";
  const setDailyLimit = setLocalDailyLimit;

  const handleYoutubeImport = async (videos: { id: string; title: string; duration: number }[], playlistTitle: string) => {
    await createRoadmap(playlistTitle, videos, dailyLimit);
  };

  const completedDays = stats?.completedDays || 0;
  const totalDays = stats?.totalDays || 0;
  const completedSessions = stats?.completedSessions || 0;
  const totalSessions = stats?.totalSessions || 0;

  // Scheduler view
  if (viewMode === "scheduler") {
    return (
      <div className="min-h-screen p-4 md:p-8 animate-fade-in">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <Button 
              variant="ghost" 
              onClick={() => setViewMode("roadmap")}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Roadmap
            </Button>
          </div>
          <RoadmapScheduler 
            onScheduleCreated={(items) => {
              console.log("Schedule created:", items);
              setViewMode("roadmap");
            }}
          />
        </div>
      </div>
    );
  }

  // Designer view
  if (viewMode === "designer") {
    return (
      <div className="min-h-screen p-4 md:p-8 animate-fade-in">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                onClick={() => setViewMode("roadmap")}
                size="icon"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">
                  Schedule Designer
                </h1>
                <p className="text-muted-foreground">
                  Drag and drop to customize your learning schedule
                </p>
              </div>
            </div>

            {/* Daily limit selector */}
            <div className="flex items-center gap-3 bg-card p-3 rounded-xl border border-border">
              <Clock className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Daily limit:</span>
              <div className="flex items-center gap-1.5">
                {[60, 90, 120, 180].map((limit) => (
                  <button
                    key={limit}
                    onClick={() => setDailyLimit(limit)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200",
                      dailyLimit === limit
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                    )}
                  >
                    {limit}m
                  </button>
                ))}
              </div>
            </div>
          </div>

          <RoadmapDesigner 
            initialData={roadmapData}
            dailyLimit={dailyLimit}
            onSave={(_data) => {
              // For now just close the designer - data sync can be added later
              setViewMode("roadmap");
            }}
          />
        </div>
      </div>
    );
  }

  // Main roadmap view
  return (
    <div className="min-h-screen p-4 md:p-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Your Roadmap</h1>
          <p className="text-muted-foreground">
            React Fundamentals Course • {totalDays} days • {totalSessions} sessions
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setYoutubeDialogOpen(true)}
          >
            <Youtube className="w-4 h-4 mr-2" />
            Import YouTube
          </Button>
          <Button
            variant="outline"
            onClick={() => setCalendarDialogOpen(true)}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button
            variant="outline"
            onClick={() => setViewMode("scheduler")}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Schedule
          </Button>
          <Button
            variant="hero"
            onClick={() => setViewMode("designer")}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Design Mode
          </Button>
          <Button 
            variant={isPaused ? "default" : "outline"}
            onClick={() => setIsPaused(!isPaused)}
          >
            {isPaused ? (
              <>
                <Play className="w-4 h-4 mr-2" />
                Resume
              </>
            ) : (
              <>
                <Pause className="w-4 h-4 mr-2" />
                Pause
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Calendar Export Dialog */}
      <CalendarExportDialog
        open={calendarDialogOpen}
        onOpenChange={setCalendarDialogOpen}
        roadmapData={roadmapData}
        courseName={courseName}
      />

      {/* YouTube Import Dialog */}
      <YouTubeImportDialog
        open={youtubeDialogOpen}
        onOpenChange={setYoutubeDialogOpen}
        onImport={handleYoutubeImport}
      />

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-card p-4 rounded-2xl border border-border shadow-soft-sm">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
            <Calendar className="w-4 h-4" />
            Progress
          </div>
          <div className="text-2xl font-bold text-foreground">
            {completedDays}/{totalDays} days
          </div>
          <div className="h-1.5 rounded-full bg-secondary mt-2 overflow-hidden">
            <div 
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${(completedDays / totalDays) * 100}%` }}
            />
          </div>
        </div>
        <div className="bg-card p-4 rounded-2xl border border-border shadow-soft-sm">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
            <Sparkles className="w-4 h-4" />
            Sessions
          </div>
          <div className="text-2xl font-bold text-foreground">
            {completedSessions}/{totalSessions}
          </div>
          <div className="h-1.5 rounded-full bg-secondary mt-2 overflow-hidden">
            <div 
              className="h-full rounded-full bg-success transition-all duration-500"
              style={{ width: `${(completedSessions / totalSessions) * 100}%` }}
            />
          </div>
        </div>
        <div className="bg-card p-4 rounded-2xl border border-border shadow-soft-sm">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
            <Clock className="w-4 h-4" />
            Daily Limit
          </div>
          <div className="text-2xl font-bold text-foreground">{dailyLimit} min</div>
          <p className="text-xs text-muted-foreground mt-1">
            {Math.floor(dailyLimit / 60)}h {dailyLimit % 60}m per day
          </p>
        </div>
        <div className="bg-card p-4 rounded-2xl border border-border shadow-soft-sm">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
            <Calendar className="w-4 h-4" />
            Est. Finish
          </div>
          <div className="text-2xl font-bold text-foreground">Jan 27</div>
          <p className="text-xs text-muted-foreground mt-1">
            {totalDays - completedDays} days remaining
          </p>
        </div>
      </div>

      {/* Progress overview */}
      <div className="bg-card rounded-2xl p-6 border border-border shadow-soft-md mb-8">
        <ProgressBar currentDay={completedDays + 1} totalDays={totalDays} />
      </div>

      {/* Quick access to designer */}
      <div 
        onClick={() => setViewMode("designer")}
        className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-6 border border-primary/20 mb-8 cursor-pointer hover:border-primary/40 transition-all group"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-lg">Customize Your Schedule</h3>
              <p className="text-muted-foreground text-sm">
                Drag & drop sessions, add new content, and rebalance your learning path
              </p>
            </div>
          </div>
          <Button variant="ghost" className="shrink-0">
            Open Designer →
          </Button>
        </div>
      </div>

      {/* Settings bar */}
      <div className="flex flex-wrap items-center gap-4 md:gap-6 mb-8 p-4 bg-card rounded-xl border border-border">
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Daily limit:</span>
          <div className="flex items-center gap-2">
            {[60, 90, 120, 180].map((limit) => (
              <button
                key={limit}
                onClick={() => setDailyLimit(limit)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200",
                  dailyLimit === limit
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                )}
              >
                {limit}m
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1" />
        <Button variant="outline" size="sm">
          <RotateCcw className="w-4 h-4 mr-2" />
          Rebalance Days
        </Button>
      </div>

      {/* Roadmap preview grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {roadmapData.slice(0, 8).map((day, index) => (
          <div 
            key={day.day} 
            className="animate-fade-in-up"
            style={{ animationDelay: `${index * 0.05}s` }}
            onClick={() => setViewMode("designer")}
          >
            <div className={cn(
              "bg-card rounded-xl p-5 border transition-all duration-200 cursor-pointer group hover:border-primary/30 hover:shadow-soft-md",
              day.isToday && "border-primary shadow-glow",
              day.isCompleted && "border-success/50",
              !day.isToday && !day.isCompleted && "border-border"
            )}>
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div 
                    className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center font-semibold transition-transform group-hover:scale-110",
                      day.isToday && "bg-primary text-primary-foreground",
                      day.isCompleted && "bg-success text-success-foreground",
                      !day.isToday && !day.isCompleted && "bg-secondary text-secondary-foreground"
                    )}
                  >
                    {day.day}
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">
                      {day.isToday ? "Today" : `Day ${day.day}`}
                    </h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {day.sessions.reduce((acc, s) => acc + s.duration, 0)} min
                    </p>
                  </div>
                </div>
              </div>

              {/* Sessions */}
              <div className="space-y-2">
                {day.sessions.map((session) => (
                  <div 
                    key={session.id}
                    className={cn(
                      "flex items-center gap-2 p-2 rounded-lg text-sm transition-colors",
                      session.completed 
                        ? "bg-success/5 text-muted-foreground" 
                        : "bg-secondary/50"
                    )}
                  >
                    <div className={cn(
                      "w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0",
                      session.completed 
                        ? "bg-success text-success-foreground" 
                        : "border border-muted-foreground/30"
                    )}>
                      {session.completed && <span className="text-[10px]">✓</span>}
                    </div>
                    <span className={cn(
                      "flex-1 truncate",
                      session.completed && "line-through"
                    )}>
                      {session.title}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {session.duration}m
                    </span>
                  </div>
                ))}
              </div>

              {/* Progress */}
              <div className="mt-4 pt-3 border-t border-border">
                <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                  <div 
                    className={cn(
                      "h-full rounded-full transition-all duration-300",
                      day.isCompleted ? "bg-success" : "bg-primary"
                    )}
                    style={{ 
                      width: `${(day.sessions.filter(s => s.completed).length / day.sessions.length) * 100}%` 
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* View all CTA */}
      {roadmapData.length > 8 && (
        <div className="mt-6 text-center">
          <Button variant="outline" onClick={() => setViewMode("designer")}>
            View All {roadmapData.length} Days →
          </Button>
        </div>
      )}

      {/* Helper text */}
      <p className="text-center text-sm text-muted-foreground mt-8">
        💡 Click on any day card or use "Design Mode" to customize your schedule with drag & drop
      </p>
    </div>
  );
}
