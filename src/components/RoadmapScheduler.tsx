import { useState } from "react";
import { 
  Link2, 
  Youtube, 
  Globe, 
  Loader2, 
  Sparkles, 
  Calendar, 
  Clock, 
  ListOrdered,
  ChevronRight,
  Plus,
  Trash2,
  GripVertical
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface ScheduleItem {
  id: string;
  title: string;
  duration: number;
  day: number;
}

interface RoadmapSchedulerProps {
  onScheduleCreated?: (items: ScheduleItem[]) => void;
}

type Step = "input" | "configure" | "preview";

export function RoadmapScheduler({ onScheduleCreated }: RoadmapSchedulerProps) {
  const [step, setStep] = useState<Step>("input");
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [detectedType, setDetectedType] = useState<"youtube" | "generic" | null>(null);
  
  // Manual input fields
  const [itemCount, setItemCount] = useState("10");
  const [avgDuration, setAvgDuration] = useState("30");
  const [dailyLimit, setDailyLimit] = useState(90);
  
  // Generated schedule
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);
  const [manualItems, setManualItems] = useState<{ title: string; duration: string }[]>([
    { title: "", duration: "30" }
  ]);

  const detectUrlType = (inputUrl: string) => {
    if (inputUrl.includes("youtube.com") || inputUrl.includes("youtu.be")) {
      return "youtube";
    }
    return "generic";
  };

  const handleUrlSubmit = () => {
    if (!url) return;
    
    setIsLoading(true);
    const type = detectUrlType(url);
    setDetectedType(type);
    
    // Simulate URL parsing
    setTimeout(() => {
      setIsLoading(false);
      setStep("configure");
    }, 1500);
  };

  const handleAddManualItem = () => {
    setManualItems([...manualItems, { title: "", duration: "30" }]);
  };

  const handleRemoveManualItem = (index: number) => {
    setManualItems(manualItems.filter((_, i) => i !== index));
  };

  const handleManualItemChange = (index: number, field: "title" | "duration", value: string) => {
    const updated = [...manualItems];
    updated[index][field] = value;
    setManualItems(updated);
  };

  const generateSchedule = () => {
    setIsLoading(true);
    
    setTimeout(() => {
      let items: ScheduleItem[] = [];
      
      if (manualItems.some(item => item.title)) {
        // Use manual items
        let currentDay = 1;
        let dayMinutes = 0;
        
        manualItems.forEach((item, index) => {
          if (item.title) {
            const duration = parseInt(item.duration) || 30;
            
            if (dayMinutes + duration > dailyLimit) {
              currentDay++;
              dayMinutes = 0;
            }
            
            items.push({
              id: `item-${index}`,
              title: item.title,
              duration,
              day: currentDay
            });
            
            dayMinutes += duration;
          }
        });
      } else {
        // Generate from count/duration
        const count = parseInt(itemCount) || 10;
        const duration = parseInt(avgDuration) || 30;
        
        let currentDay = 1;
        let dayMinutes = 0;
        
        for (let i = 1; i <= count; i++) {
          if (dayMinutes + duration > dailyLimit) {
            currentDay++;
            dayMinutes = 0;
          }
          
          items.push({
            id: `item-${i}`,
            title: `Session ${i}`,
            duration,
            day: currentDay
          });
          
          dayMinutes += duration;
        }
      }
      
      setScheduleItems(items);
      setIsLoading(false);
      setStep("preview");
    }, 1000);
  };

  const handleConfirm = () => {
    onScheduleCreated?.(scheduleItems);
  };

  const totalDays = Math.max(...scheduleItems.map(s => s.day), 0);
  const totalMinutes = scheduleItems.reduce((sum, s) => sum + s.duration, 0);

  return (
    <div className="bg-card rounded-3xl border border-border shadow-soft-lg overflow-hidden">
      {/* Progress steps */}
      <div className="flex border-b border-border bg-secondary/30">
        {[
          { key: "input", label: "Add Source", icon: Link2 },
          { key: "configure", label: "Configure", icon: ListOrdered },
          { key: "preview", label: "Preview", icon: Calendar },
        ].map((s, index) => (
          <div
            key={s.key}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium transition-colors",
              step === s.key 
                ? "bg-primary/10 text-primary border-b-2 border-primary" 
                : "text-muted-foreground"
            )}
          >
            <s.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{s.label}</span>
            {index < 2 && <ChevronRight className="w-4 h-4 ml-2 opacity-30" />}
          </div>
        ))}
      </div>

      <div className="p-6 md:p-8">
        {/* Step 1: Input URL */}
        {step === "input" && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Create Your Learning Schedule
              </h2>
              <p className="text-muted-foreground">
                Paste a URL or manually add your learning sessions
              </p>
            </div>

            {/* URL Input */}
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder="Paste YouTube playlist or any URL..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="h-14 pl-12 text-lg"
                    onKeyDown={(e) => e.key === "Enter" && handleUrlSubmit()}
                  />
                </div>
                <Button
                  onClick={handleUrlSubmit}
                  disabled={!url || isLoading}
                  className="h-14 px-6"
                  variant="hero"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Detect
                    </>
                  )}
                </Button>
              </div>

              {/* Supported sources */}
              <div className="flex flex-wrap gap-3 justify-center">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary/50 rounded-full text-xs text-muted-foreground">
                  <Youtube className="w-4 h-4 text-red-500" />
                  YouTube Playlists
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary/50 rounded-full text-xs text-muted-foreground">
                  <Globe className="w-4 h-4 text-blue-500" />
                  Any Website
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-4 text-muted-foreground">Or add manually</span>
              </div>
            </div>

            {/* Manual entry */}
            <Button 
              variant="outline" 
              className="w-full h-14"
              onClick={() => setStep("configure")}
            >
              <Plus className="w-5 h-5 mr-2" />
              Add sessions manually
            </Button>
          </div>
        )}

        {/* Step 2: Configure */}
        {step === "configure" && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-1">
                  Configure Your Schedule
                </h2>
                <p className="text-muted-foreground">
                  {detectedType === "youtube" 
                    ? "We detected a YouTube playlist" 
                    : "Set up your learning sessions"
                  }
                </p>
              </div>
              {detectedType && (
                <div className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl",
                  detectedType === "youtube" ? "bg-red-500/10 text-red-600" : "bg-blue-500/10 text-blue-600"
                )}>
                  {detectedType === "youtube" ? (
                    <Youtube className="w-5 h-5" />
                  ) : (
                    <Globe className="w-5 h-5" />
                  )}
                  <span className="font-medium capitalize">{detectedType}</span>
                </div>
              )}
            </div>

            {/* Daily limit setting */}
            <div className="p-4 bg-secondary/30 rounded-xl">
              <div className="flex items-center gap-3 mb-3">
                <Clock className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium">Daily study limit</span>
              </div>
              <div className="flex gap-2">
                {[60, 90, 120, 180].map((limit) => (
                  <button
                    key={limit}
                    onClick={() => setDailyLimit(limit)}
                    className={cn(
                      "flex-1 py-3 rounded-xl text-sm font-medium transition-all",
                      dailyLimit === limit
                        ? "bg-primary text-primary-foreground"
                        : "bg-card border border-border hover:border-primary/50"
                    )}
                  >
                    {limit} min
                  </button>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-4 text-muted-foreground">Sessions</span>
              </div>
            </div>

            {/* Manual items list */}
            <div className="space-y-3">
              {manualItems.map((item, index) => (
                <div key={index} className="flex items-center gap-3 group">
                  <GripVertical className="w-5 h-5 text-muted-foreground/50 cursor-grab" />
                  <div className="flex-1 flex gap-3">
                    <Input
                      placeholder={`Session ${index + 1} title`}
                      value={item.title}
                      onChange={(e) => handleManualItemChange(index, "title", e.target.value)}
                      className="flex-1"
                    />
                    <div className="relative w-24">
                      <Input
                        type="number"
                        min="1"
                        max="180"
                        value={item.duration}
                        onChange={(e) => handleManualItemChange(index, "duration", e.target.value)}
                        className="pr-8"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                        min
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveManualItem(index)}
                    disabled={manualItems.length === 1}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              ))}
              
              <Button
                variant="outline"
                onClick={handleAddManualItem}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add session
              </Button>
            </div>

            {/* Quick fill option */}
            <div className="p-4 bg-secondary/30 rounded-xl">
              <p className="text-sm text-muted-foreground mb-3">Or generate sessions automatically:</p>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground mb-1 block">Number of sessions</label>
                  <Input
                    type="number"
                    min="1"
                    max="100"
                    value={itemCount}
                    onChange={(e) => setItemCount(e.target.value)}
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground mb-1 block">Avg. duration (min)</label>
                  <Input
                    type="number"
                    min="5"
                    max="180"
                    value={avgDuration}
                    onChange={(e) => setAvgDuration(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep("input")} className="flex-1">
                Back
              </Button>
              <Button 
                variant="hero" 
                onClick={generateSchedule}
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Calendar className="w-5 h-5 mr-2" />
                    Generate Schedule
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Preview */}
        {step === "preview" && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Your Schedule is Ready! 🎉
              </h2>
              <p className="text-muted-foreground">
                Review and confirm your learning roadmap
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-primary/10 rounded-xl text-center">
                <div className="text-3xl font-bold text-primary">{scheduleItems.length}</div>
                <div className="text-sm text-muted-foreground">Sessions</div>
              </div>
              <div className="p-4 bg-accent/10 rounded-xl text-center">
                <div className="text-3xl font-bold text-accent">{totalDays}</div>
                <div className="text-sm text-muted-foreground">Days</div>
              </div>
              <div className="p-4 bg-secondary rounded-xl text-center">
                <div className="text-3xl font-bold text-foreground">{Math.round(totalMinutes / 60)}h</div>
                <div className="text-sm text-muted-foreground">Total time</div>
              </div>
            </div>

            {/* Schedule preview */}
            <div className="max-h-64 overflow-y-auto space-y-2 pr-2">
              {Array.from({ length: totalDays }, (_, i) => i + 1).map((day) => {
                const daySessions = scheduleItems.filter(s => s.day === day);
                const dayTotal = daySessions.reduce((sum, s) => sum + s.duration, 0);
                
                return (
                  <div key={day} className="p-4 bg-secondary/30 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">Day {day}</span>
                      <span className="text-sm text-muted-foreground">{dayTotal} min</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {daySessions.map((session) => (
                        <div 
                          key={session.id}
                          className="px-3 py-1.5 bg-card rounded-lg text-sm flex items-center gap-2"
                        >
                          <span>{session.title}</span>
                          <span className="text-muted-foreground">({session.duration}m)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep("configure")} className="flex-1">
                Edit
              </Button>
              <Button variant="hero" onClick={handleConfirm} className="flex-1">
                <Sparkles className="w-5 h-5 mr-2" />
                Start Learning
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}