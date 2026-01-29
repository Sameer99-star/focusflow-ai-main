import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Clock, BookOpen } from "lucide-react";

interface AddSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (title: string, duration: number) => void;
  day: number;
}

export function AddSessionDialog({ open, onOpenChange, onAdd, day }: AddSessionDialogProps) {
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState("30");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && duration) {
      onAdd(title.trim(), parseInt(duration) || 30);
      setTitle("");
      setDuration("30");
      onOpenChange(false);
    }
  };

  const presets = [
    { label: "Quick (15m)", duration: 15 },
    { label: "Standard (30m)", duration: 30 },
    { label: "Extended (45m)", duration: 45 },
    { label: "Deep (60m)", duration: 60 },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            Add Session to Day {day}
          </DialogTitle>
          <DialogDescription>
            Create a new learning session for your roadmap.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Session Title
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Introduction to Hooks"
              className="h-12"
              autoFocus
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Duration (minutes)
            </label>
            <div className="flex gap-2 mb-3">
              {presets.map((preset) => (
                <button
                  key={preset.duration}
                  type="button"
                  onClick={() => setDuration(preset.duration.toString())}
                  className={`flex-1 py-2 px-2 text-xs font-medium rounded-lg transition-all ${
                    parseInt(duration) === preset.duration
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="number"
                min="1"
                max="180"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim()}>
              Add Session
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
