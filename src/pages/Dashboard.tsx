import { Link2, Plus, Sparkles, Brain, Coffee, Play, Pause, RotateCcw, Flame } from "lucide-react";
import { ProgressBar } from "@/components/ProgressBar";
import { RoadmapCard } from "@/components/RoadmapCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect, useCallback } from "react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { useRoadmap } from "@/hooks/use-roadmap";

// Compact Dashboard Timer Component
function DashboardTimer() {
  const [mode, setMode] = useState<"focus" | "break">("focus");
  const [selectedMinutes, setSelectedMinutes] = useState(25);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);

  const totalSeconds = selectedMinutes * 60;
  const progress = ((totalSeconds - timeLeft) / totalSeconds) * 100;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handlePresetSelect = (minutes: number) => {
    setSelectedMinutes(minutes);
    setTimeLeft(minutes * 60);
    setIsRunning(false);
  };

  const handleReset = useCallback(() => {
    setTimeLeft(selectedMinutes * 60);
    setIsRunning(false);
  }, [selectedMinutes]);

  const switchMode = (newMode: "focus" | "break") => {
    setMode(newMode);
    const defaultMinutes = newMode === "focus" ? 25 : 5;
    setSelectedMinutes(defaultMinutes);
    setTimeLeft(defaultMinutes * 60);
    setIsRunning(false);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      if (mode === "focus") {
        setSessionsCompleted((prev) => prev + 1);
        toast({
          title: "Session complete! 🎉",
          description: "Great work! Take a short break before continuing.",
        });
      }
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, mode]);

  const focusPresets = [
    { label: "25m", minutes: 25 },
    { label: "45m", minutes: 45 },
  ];

  const breakPresets = [
    { label: "5m", minutes: 5 },
    { label: "10m", minutes: 10 },
  ];

  const presets = mode === "focus" ? focusPresets : breakPresets;

  return (
    <div className="bg-card rounded-2xl p-5 border border-border shadow-soft-md">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-foreground">Focus Session</h3>
          <p className="text-xs text-muted-foreground">Stay focused and minimize distractions</p>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-secondary/50 rounded-lg">
          <Flame className="w-4 h-4 text-orange-500" />
          <span className="font-semibold text-sm">{sessionsCompleted}</span>
          <span className="text-muted-foreground text-xs">sessions</span>
        </div>
      </div>

      {/* Mode toggle */}
      <div className="flex rounded-xl bg-secondary/50 p-1 mb-4">
        <button
          onClick={() => switchMode("focus")}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all",
            mode === "focus"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Brain className="w-3.5 h-3.5" />
          Focus
        </button>
        <button
          onClick={() => switchMode("break")}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all",
            mode === "break"
              ? "bg-accent text-accent-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Coffee className="w-3.5 h-3.5" />
          Break
        </button>
      </div>

      {/* Timer display */}
      <div className="relative w-36 h-36 mx-auto mb-4">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="50%"
            cy="50%"
            r="45%"
            fill="none"
            stroke="hsl(var(--secondary))"
            strokeWidth="8"
          />
          <circle
            cx="50%"
            cy="50%"
            r="45%"
            fill="none"
            stroke={mode === "focus" ? "hsl(var(--primary))" : "hsl(var(--accent))"}
            strokeWidth="8"
            strokeLinecap="round"
            pathLength="100"
            strokeDasharray="100"
            strokeDashoffset={100 - progress}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold tracking-tight text-foreground">
            {formatTime(timeLeft)}
          </span>
          <span className={cn(
            "text-xs font-medium",
            mode === "focus" ? "text-primary" : "text-accent"
          )}>
            {isRunning ? (mode === "focus" ? "Focusing" : "Resting") : "Ready"}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-2 justify-center mb-4">
        <Button
          onClick={() => setIsRunning(!isRunning)}
          variant={mode === "focus" ? "default" : "accent"}
          size="sm"
          className="w-24"
        >
          {isRunning ? <Pause className="w-4 h-4 mr-1" /> : <Play className="w-4 h-4 mr-1" />}
          {isRunning ? "Pause" : "Start"}
        </Button>
        <Button onClick={handleReset} variant="outline" size="sm">
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>

      {/* Quick presets */}
      <div className="flex gap-2 justify-center">
        {presets.map((preset) => (
          <button
            key={preset.label}
            onClick={() => handlePresetSelect(preset.minutes)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
              selectedMinutes === preset.minutes
                ? mode === "focus"
                  ? "bg-primary/10 text-primary border border-primary/30"
                  : "bg-accent/10 text-accent border border-accent/30"
                : "bg-secondary/50 text-muted-foreground hover:text-foreground border border-transparent"
            )}
          >
            {preset.label}
          </button>
        ))}
        <Link
          to="/timer"
          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-secondary/50 text-muted-foreground hover:text-foreground transition-all"
        >
          More →
        </Link>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [url, setUrl] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const { activeRoadmap, stats, isLoading, toggleSessionComplete } = useRoadmap();

  const handleImport = async () => {
    if (!url.trim()) {
      toast({
        title: "Enter a URL",
        description: "Please paste a YouTube playlist or course URL to import.",
        variant: "destructive",
      });
      return;
    }

    // Redirect to roadmap page for import
    window.location.href = "/roadmap";
  };

  // Progress stats
  const currentDay = stats?.currentDay || 1;
  const totalDays = stats?.totalDays || 14;
  const courseName = activeRoadmap?.title || "No active roadmap";

  return (
    <div className="min-h-screen p-6 lg:p-8 animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-1">Welcome back!</h1>
        <p className="text-muted-foreground text-sm lg:text-base">
          You're making great progress. Keep up the momentum!
        </p>
      </div>

      {/* Main Progress Bar */}
      <div className="bg-card rounded-2xl p-5 lg:p-6 border border-border shadow-soft-md mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-foreground">Overall Progress</h2>
          <span className="text-xs lg:text-sm text-muted-foreground">{courseName}</span>
        </div>
        <ProgressBar currentDay={currentDay} totalDays={totalDays} />
      </div>

      {/* URL Import */}
      <div className="bg-card rounded-2xl p-5 lg:p-6 border border-border shadow-soft-md mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
            <Link2 className="w-5 h-5 text-accent" />
          </div>
          <div className="min-w-0">
            <h2 className="font-semibold text-foreground">Import New Content</h2>
            <p className="text-xs lg:text-sm text-muted-foreground truncate">
              Paste any YouTube playlist, course, or webpage URL
            </p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <Input
            type="url"
            placeholder="https://youtube.com/playlist?list=..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1 min-w-0"
          />
          <Button 
            onClick={handleImport} 
            disabled={isImporting}
            variant="default"
            className="shrink-0"
          >
            {isImporting ? (
              <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Import
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid xl:grid-cols-3 gap-6">
        {/* Roadmap */}
        <div className="xl:col-span-2 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg lg:text-xl font-semibold text-foreground">Your Roadmap</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/roadmap">View All</Link>
            </Button>
          </div>
          
          {isLoading ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-card rounded-xl p-5 border border-border animate-pulse h-48" />
              ))}
            </div>
          ) : activeRoadmap && activeRoadmap.days.length > 0 ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {activeRoadmap.days.slice(0, 4).map((day) => (
                <RoadmapCard
                  key={day.id}
                  day={day.dayNumber}
                  sessions={day.sessions.map(s => ({
                    id: s.id,
                    title: s.title,
                    duration: s.duration,
                    completed: s.completed,
                  }))}
                  isToday={day.isToday}
                  isCompleted={day.isCompleted}
                  onToggleSession={toggleSessionComplete}
                />
              ))}
            </div>
          ) : (
            <div className="bg-card rounded-xl p-8 border border-dashed border-border text-center">
              <p className="text-muted-foreground mb-4">No roadmap yet. Import a YouTube playlist to get started!</p>
              <Button asChild>
                <Link to="/roadmap">Create Roadmap</Link>
              </Button>
            </div>
          )}
        </div>

        {/* Timer & AI Mentor */}
        <div className="space-y-6 min-w-0">
          <DashboardTimer />

          {/* AI Mentor Quick Access */}
          <div className="bg-card rounded-2xl p-5 border border-border shadow-soft-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center animate-glow-pulse shrink-0">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-foreground">AI Mentor</h3>
                <p className="text-xs text-muted-foreground">Get personalized guidance</p>
              </div>
            </div>

            <div className="space-y-2">
              <Link 
                to="/mentor"
                className="w-full text-left p-3 rounded-lg bg-secondary/50 hover:bg-secondary text-sm text-foreground transition-colors block"
              >
                "What should I focus on today?"
              </Link>
              <Link 
                to="/mentor"
                className="w-full text-left p-3 rounded-lg bg-secondary/50 hover:bg-secondary text-sm text-foreground transition-colors block"
              >
                "I missed yesterday's sessions"
              </Link>
              <Link 
                to="/mentor"
                className="w-full text-left p-3 rounded-lg bg-secondary/50 hover:bg-secondary text-sm text-foreground transition-colors block"
              >
                "Adjust my schedule"
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
