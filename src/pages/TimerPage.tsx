import { Timer } from "@/components/Timer";
import { toast } from "@/hooks/use-toast";
import { Music, Volume2, VolumeX, Maximize2, Minimize2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function TimerPage() {
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [selectedSound, setSelectedSound] = useState("None");

  const handleComplete = () => {
    toast({
      title: "Session complete! 🎉",
      description: "Great work! Take a well-deserved break.",
    });
  };

  return (
    <div 
      className={cn(
        "min-h-screen p-4 md:p-8 transition-all duration-500",
        isFocusMode && "bg-background"
      )}
    >
      {/* Controls */}
      <div 
        className={cn(
          "fixed top-4 right-4 md:top-8 md:right-8 flex items-center gap-2 z-10 transition-opacity duration-300",
          isFocusMode && "opacity-20 hover:opacity-100"
        )}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsSoundEnabled(!isSoundEnabled)}
          className="rounded-full"
        >
          {isSoundEnabled ? (
            <Volume2 className="w-5 h-5" />
          ) : (
            <VolumeX className="w-5 h-5" />
          )}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsFocusMode(!isFocusMode)}
          className="rounded-full"
        >
          {isFocusMode ? (
            <Minimize2 className="w-5 h-5" />
          ) : (
            <Maximize2 className="w-5 h-5" />
          )}
        </Button>
      </div>

      {/* Current session info */}
      <div 
        className={cn(
          "text-center mb-6 md:mb-8 animate-fade-in transition-opacity duration-300 pt-12 md:pt-0",
          isFocusMode && "opacity-0"
        )}
      >
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          Focus Timer
        </h1>
        <p className="text-muted-foreground">
          Stay productive with timed focus and break sessions
        </p>
      </div>

      {/* Timer */}
      <div className="animate-scale-in max-w-4xl mx-auto">
        <Timer onComplete={handleComplete} />
      </div>

      {/* Ambient sound options */}
      <div 
        className={cn(
          "mt-8 md:mt-12 max-w-md mx-auto transition-opacity duration-300",
          isFocusMode && "opacity-0 pointer-events-none"
        )}
      >
        <div className="flex items-center justify-center gap-2 mb-4">
          <Music className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Ambient sounds</span>
        </div>
        
        <div className="flex flex-wrap items-center justify-center gap-2">
          {["None", "Rain", "Café", "Forest", "Waves", "Lo-fi"].map((sound) => (
            <button
              key={sound}
              onClick={() => setSelectedSound(sound)}
              className={cn(
                "px-4 py-2 rounded-xl text-sm transition-all duration-200",
                selectedSound === sound
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              )}
            >
              {sound}
            </button>
          ))}
        </div>
      </div>

      {/* Keyboard shortcuts hint */}
      <div 
        className={cn(
          "fixed bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 text-xs text-muted-foreground transition-opacity duration-300",
          isFocusMode && "opacity-0"
        )}
      >
        Press <kbd className="px-1.5 py-0.5 bg-secondary rounded text-foreground font-mono mx-1">Space</kbd> to start/pause • 
        <kbd className="px-1.5 py-0.5 bg-secondary rounded text-foreground font-mono mx-1">R</kbd> to reset
      </div>
    </div>
  );
}
