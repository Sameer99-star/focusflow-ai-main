import { useState, useEffect, useCallback } from "react";
import { Play, Pause, RotateCcw, Check, Coffee, Brain, Target, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface TimerProps {
  onComplete?: () => void;
  className?: string;
  compact?: boolean;
}

type TimerMode = "focus" | "break";

const FOCUS_PRESETS = [
  { label: "25m", minutes: 25, description: "Short sprint" },
  { label: "45m", minutes: 45, description: "Deep work" },
  { label: "1h", minutes: 60, description: "Flow state" },
  { label: "90m", minutes: 90, description: "Ultra focus" },
];

const BREAK_PRESETS = [
  { label: "5m", minutes: 5, description: "Quick break" },
  { label: "10m", minutes: 10, description: "Stretch & water" },
  { label: "15m", minutes: 15, description: "Walk around" },
  { label: "30m", minutes: 30, description: "Long break" },
];

export function Timer({ onComplete, className, compact = false }: TimerProps) {
  const [mode, setMode] = useState<TimerMode>("focus");
  const [selectedMinutes, setSelectedMinutes] = useState(25);
  const [customMinutes, setCustomMinutes] = useState("");
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);

  const totalSeconds = selectedMinutes * 60;
  const progress = ((totalSeconds - timeLeft) / totalSeconds) * 100;
  const presets = mode === "focus" ? FOCUS_PRESETS : BREAK_PRESETS;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handlePresetSelect = (minutes: number) => {
    setSelectedMinutes(minutes);
    setTimeLeft(minutes * 60);
    setCustomMinutes("");
    setIsRunning(false);
    setIsComplete(false);
  };

  const handleCustomTime = () => {
    const mins = parseInt(customMinutes);
    if (mins > 0 && mins <= 180) {
      setSelectedMinutes(mins);
      setTimeLeft(mins * 60);
      setIsRunning(false);
      setIsComplete(false);
    }
  };

  const handleStart = () => {
    setIsRunning(true);
    setIsComplete(false);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = useCallback(() => {
    setTimeLeft(selectedMinutes * 60);
    setIsRunning(false);
    setIsComplete(false);
  }, [selectedMinutes]);

  const switchMode = (newMode: TimerMode) => {
    setMode(newMode);
    const defaultMinutes = newMode === "focus" ? 25 : 5;
    setSelectedMinutes(defaultMinutes);
    setTimeLeft(defaultMinutes * 60);
    setCustomMinutes("");
    setIsRunning(false);
    setIsComplete(false);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      setIsComplete(true);
      if (mode === "focus") {
        setSessionsCompleted((prev) => prev + 1);
      }
      onComplete?.();
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, onComplete, mode]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && !e.target?.toString().includes("Input")) {
        e.preventDefault();
        if (isRunning) {
          handlePause();
        } else {
          handleStart();
        }
      }
      if (e.code === "KeyR" && !e.target?.toString().includes("Input")) {
        handleReset();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isRunning, handleReset]);

  if (compact) {
    return (
      <div className={cn("bg-card rounded-2xl p-6 shadow-soft-lg border border-border", className)}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {mode === "focus" ? (
              <Brain className="w-5 h-5 text-primary" />
            ) : (
              <Coffee className="w-5 h-5 text-accent" />
            )}
            <span className="font-medium">{mode === "focus" ? "Focus" : "Break"}</span>
          </div>
          <span className="text-2xl font-semibold">{formatTime(timeLeft)}</span>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={isRunning ? handlePause : handleStart}
            variant={mode === "focus" ? "hero" : "accent"}
            className="flex-1"
          >
            {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
          <Button onClick={handleReset} variant="outline" size="icon">
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={cn(
        "bg-card rounded-3xl p-8 md:p-12 shadow-soft-lg border border-border",
        "transition-all duration-300 w-full max-w-4xl mx-auto",
        isRunning && mode === "focus" && "shadow-glow",
        isRunning && mode === "break" && "shadow-glow-accent",
        className
      )}
    >
      {/* Header with stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-1">
            {mode === "focus" ? "Focus Session" : "Break Time"}
          </h2>
          <p className="text-muted-foreground">
            {mode === "focus" 
              ? "Stay focused and minimize distractions" 
              : "Rest your mind and recharge"
            }
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-secondary/50 rounded-xl">
            <Flame className="w-5 h-5 text-orange-500" />
            <span className="font-semibold">{sessionsCompleted}</span>
            <span className="text-muted-foreground text-sm">sessions today</span>
          </div>
        </div>
      </div>

      {/* Mode toggle */}
      <div className="flex rounded-2xl bg-secondary/50 p-1.5 mb-8 max-w-md mx-auto">
        <button
          onClick={() => switchMode("focus")}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all duration-200",
            mode === "focus"
              ? "bg-primary text-primary-foreground shadow-soft-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Brain className="w-4 h-4" />
          Focus Mode
        </button>
        <button
          onClick={() => switchMode("break")}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all duration-200",
            mode === "break"
              ? "bg-accent text-accent-foreground shadow-soft-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Coffee className="w-4 h-4" />
          Break Mode
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-center">
        {/* Left side - Timer display */}
        <div className="flex flex-col items-center">
          {/* Timer circle */}
          <div className="relative w-64 h-64 md:w-72 md:h-72">
            {/* Background circle */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="50%"
                cy="50%"
                r="45%"
                fill="none"
                stroke="hsl(var(--progress-track))"
                strokeWidth="12"
              />
              <circle
                cx="50%"
                cy="50%"
                r="45%"
                fill="none"
                stroke={mode === "focus" ? "hsl(var(--primary))" : "hsl(var(--accent))"}
                strokeWidth="12"
                strokeLinecap="round"
                pathLength="100"
                strokeDasharray="100"
                strokeDashoffset={100 - progress}
                className="transition-all duration-1000 ease-out"
                style={{
                  filter: isRunning 
                    ? `drop-shadow(0 0 12px hsl(var(--${mode === "focus" ? "primary" : "accent"}) / 0.5))` 
                    : "none"
                }}
              />
            </svg>

            {/* Time display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              {isComplete ? (
                <div className="text-center animate-scale-in">
                  <Check className="w-16 h-16 text-success mx-auto mb-3" />
                  <span className="text-xl font-semibold text-success">
                    {mode === "focus" ? "Great work!" : "Refreshed!"}
                  </span>
                </div>
              ) : (
                <>
                  <span className="text-5xl md:text-6xl font-bold tracking-tight text-foreground">
                    {formatTime(timeLeft)}
                  </span>
                  <span className={cn(
                    "text-sm mt-2 font-medium",
                    mode === "focus" ? "text-primary" : "text-accent"
                  )}>
                    {isRunning 
                      ? mode === "focus" ? "Stay focused" : "Relax"
                      : "Ready to start"
                    }
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-4 mt-8">
            {isRunning ? (
              <Button
                onClick={handlePause}
                variant="secondary"
                size="lg"
                className="w-40 h-14 text-lg rounded-xl"
              >
                <Pause className="w-6 h-6 mr-2" />
                Pause
              </Button>
            ) : (
              <Button
                onClick={handleStart}
                variant={mode === "focus" ? "hero" : "accent"}
                size="lg"
                className="w-40 h-14 text-lg rounded-xl"
              >
                <Play className="w-6 h-6 mr-2" />
                Start
              </Button>
            )}
            
            <Button
              onClick={handleReset}
              variant="outline"
              size="lg"
              className="h-14 w-14 rounded-xl"
            >
              <RotateCcw className="w-6 h-6" />
            </Button>
          </div>
        </div>

        {/* Right side - Presets and custom */}
        <div className="space-y-6">
          {/* Presets */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Quick presets</h3>
            <div className="grid grid-cols-2 gap-3">
              {presets.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => handlePresetSelect(preset.minutes)}
                  className={cn(
                    "p-4 rounded-xl text-left transition-all duration-200 border-2",
                    selectedMinutes === preset.minutes && customMinutes === ""
                      ? mode === "focus"
                        ? "bg-primary/10 border-primary text-foreground"
                        : "bg-accent/10 border-accent text-foreground"
                      : "bg-secondary/50 border-transparent hover:bg-secondary text-muted-foreground hover:text-foreground"
                  )}
                >
                  <div className="text-2xl font-bold">{preset.label}</div>
                  <div className="text-xs opacity-80">{preset.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom time input */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Custom duration</h3>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Input
                  type="number"
                  min="1"
                  max="180"
                  placeholder="Enter minutes (1-180)"
                  value={customMinutes}
                  onChange={(e) => setCustomMinutes(e.target.value)}
                  className="h-12 text-lg pr-16"
                  onKeyDown={(e) => e.key === "Enter" && handleCustomTime()}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                  min
                </span>
              </div>
              <Button 
                variant="outline" 
                size="lg"
                onClick={handleCustomTime}
                disabled={!customMinutes || parseInt(customMinutes) <= 0}
                className="h-12 px-6"
              >
                <Target className="w-5 h-5 mr-2" />
                Set
              </Button>
            </div>
          </div>

          {/* Mode suggestion after complete */}
          {isComplete && (
            <div className="p-4 bg-secondary/50 rounded-xl animate-fade-in">
              <p className="text-sm text-muted-foreground mb-3">
                {mode === "focus" 
                  ? "You've completed a focus session! Take a break to recharge." 
                  : "Break's over! Ready to get back to work?"
                }
              </p>
              <Button
                variant={mode === "focus" ? "accent" : "hero"}
                className="w-full"
                onClick={() => switchMode(mode === "focus" ? "break" : "focus")}
              >
                {mode === "focus" ? (
                  <>
                    <Coffee className="w-4 h-4 mr-2" />
                    Start break
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4 mr-2" />
                    Back to focus
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
