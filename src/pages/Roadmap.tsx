import { useState } from "react";
import {
  Calendar,
  Clock,
  Pause,
  Play,
  RotateCcw,
  Plus,
  Sparkles,
  ArrowLeft,
  Download,
  Youtube,
} from "lucide-react";

import { RoadmapScheduler } from "@/components/RoadmapScheduler";
import { RoadmapDesigner } from "@/components/roadmap/RoadmapDesigner";
import { CalendarExportDialog } from "@/components/roadmap/CalendarExportDialog";
import { YouTubeImportDialog } from "@/components/roadmap/YouTubeImportDialog";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ProgressBar";
import { cn } from "@/lib/utils";
import { useRoadmap } from "@/hooks/use-roadmap";

/* =========================
   TYPES
========================= */

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

/* =========================
   PAGE
========================= */

export default function Roadmap() {
  /* ---------------- STATE ---------------- */

  const [viewMode, setViewMode] = useState<ViewMode>("roadmap");

  const [isPaused, setIsPaused] = useState(false);

  const [localDailyLimit, setLocalDailyLimit] = useState(60);

  const [pendingDailyLimit, setPendingDailyLimit] =
    useState<number | null>(null);

  const [showRebalanceConfirm, setShowRebalanceConfirm] = useState(false);

  const [calendarDialogOpen, setCalendarDialogOpen] = useState(false);

  const [youtubeDialogOpen, setYoutubeDialogOpen] = useState(false);

  /* ---------------- HOOK ---------------- */

  const { 
  activeRoadmap, 
  stats, 
  createRoadmap, 
  toggleSessionComplete,
  rebalanceActiveRoadmap
} = useRoadmap();


  /* ---------------- DATA MAPPING ---------------- */

  const roadmapData: DayData[] =
    activeRoadmap?.days.map((day) => ({
      day: day.dayNumber,
      sessions: day.sessions.map((s) => ({
        id: s.id,
        title: s.title,
        duration: s.duration,
        completed: s.completed,
      })),
      isToday: day.isToday,
      isCompleted: day.isCompleted,
    })) || [];

  const dailyLimit = activeRoadmap?.dailyLimit || localDailyLimit;
  const courseName = activeRoadmap?.title || "Roadmap";

  const completedDays = stats?.completedDays || 0;
  const totalDays = stats?.totalDays || 0;
  const completedSessions = stats?.completedSessions || 0;
  const totalSessions = stats?.totalSessions || 0;

  /* ---------------- HANDLERS ---------------- */

  const handleYoutubeImport = async (
    videos: { id: string; title: string; duration: number }[],
    playlistTitle: string
  ) => {
    await createRoadmap(playlistTitle, videos, dailyLimit);
  };

  /* =====================================================
     SCHEDULER VIEW
  ===================================================== */

  if (viewMode === "scheduler") {
    return (
      <div className="min-h-screen p-6">
        <Button variant="ghost" onClick={() => setViewMode("roadmap")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <RoadmapScheduler
          onScheduleCreated={() => setViewMode("roadmap")}
        />
      </div>
    );
  }

  /* =====================================================
     DESIGNER VIEW
  ===================================================== */

  if (viewMode === "designer") {
    return (
      <div className="min-h-screen p-6">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => setViewMode("roadmap")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="flex gap-2">
            {[60, 90, 120, 180].map((limit) => (
              <Button
                key={limit}
                size="sm"
                variant={dailyLimit === limit ? "default" : "outline"}
                onClick={() => {
                  setPendingDailyLimit(limit);
                  setShowRebalanceConfirm(true);
                }}
              >
                {limit}m
              </Button>
            ))}
          </div>
        </div>

        <RoadmapDesigner
          initialData={roadmapData}
          dailyLimit={dailyLimit}
          onSave={() => setViewMode("roadmap")}
        />
      </div>
    );
  }

  /* =====================================================
     MAIN ROADMAP VIEW
  ===================================================== */

  return (
    <div className="min-h-screen p-6">

      {/* ================= HEADER ================= */}

      <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
        <h1 className="text-2xl font-bold">Your Roadmap</h1>

        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setYoutubeDialogOpen(true)} variant="outline">
            <Youtube className="w-4 h-4 mr-2" />
            Import
          </Button>

          <Button onClick={() => setCalendarDialogOpen(true)} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>

          <Button onClick={() => setViewMode("scheduler")} variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            New
          </Button>

          <Button onClick={() => setViewMode("designer")}>
            <Sparkles className="w-4 h-4 mr-2" />
            Design
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

      {/* ================= DIALOGS ================= */}

      <CalendarExportDialog
        open={calendarDialogOpen}
        onOpenChange={setCalendarDialogOpen}
        roadmapData={roadmapData}
        courseName={courseName}
      />

      <YouTubeImportDialog
        open={youtubeDialogOpen}
        onOpenChange={setYoutubeDialogOpen}
        onImport={handleYoutubeImport}
      />

      {/* ================= STATS ================= */}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<Calendar className="w-4 h-4" />}
          label="Days"
          value={`${completedDays}/${totalDays}`}
        />
        <StatCard
          icon={<Sparkles className="w-4 h-4" />}
          label="Sessions"
          value={`${completedSessions}/${totalSessions}`}
        />
        <StatCard
          icon={<Clock className="w-4 h-4" />}
          label="Daily Limit"
          value={`${dailyLimit} min`}
        />
        <StatCard
          icon={<Calendar className="w-4 h-4" />}
          label="Remaining"
          value={`${totalDays - completedDays} days`}
        />
      </div>

      {/* ================= PROGRESS ================= */}

      <ProgressBar currentDay={completedDays + 1} totalDays={totalDays} />

      {/* ================= DAY GRID ================= */}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
        {roadmapData.map((day) => (
          <div
            key={day.day}
            className="bg-card border rounded-xl p-4 cursor-pointer hover:shadow-md"
            onClick={() => setViewMode("designer")}
          >
            <h3 className="font-semibold mb-2">Day {day.day}</h3>

            {day.sessions.map((session) => (
              <div
                key={session.id}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSessionComplete(session.id);
                }}
                className="text-sm flex justify-between py-1"
              >
                <span
                  className={cn(session.completed && "line-through opacity-50")}
                >
                  {session.title}
                </span>
                <span>{session.duration}m</span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* ================= REBALANCE MODAL ================= */}

      {showRebalanceConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-card rounded-xl p-6 border">
            <p className="mb-4">
              Change daily limit to {pendingDailyLimit} minutes?
            </p>

            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowRebalanceConfirm(false)}
              >
                Cancel
              </Button>

              <Button
  onClick={async () => {
    if (!pendingDailyLimit) return;

    await rebalanceActiveRoadmap(pendingDailyLimit);

    setPendingDailyLimit(null);
    setShowRebalanceConfirm(false);
  }}
>
  Yes
</Button>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* =====================================================
   SMALL STAT CARD
===================================================== */

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-card border rounded-xl p-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
        {icon}
        {label}
      </div>
      <div className="text-lg font-bold">{value}</div>
    </div>
  );
}
