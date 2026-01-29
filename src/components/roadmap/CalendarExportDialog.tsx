import { useState } from "react";
import { Calendar, Download, ExternalLink, Copy, Check, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  generateICalContent, 
  downloadICalFile, 
  generateScheduleSummary 
} from "@/lib/calendar";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

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

interface CalendarExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roadmapData: DayData[];
  courseName: string;
}

export function CalendarExportDialog({ 
  open, 
  onOpenChange, 
  roadmapData,
  courseName 
}: CalendarExportDialogProps) {
  const [startDate, setStartDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [startHour, setStartHour] = useState("09");
  const [copied, setCopied] = useState(false);

  const totalSessions = roadmapData.reduce((sum, d) => sum + d.sessions.length, 0);
  const totalMinutes = roadmapData.reduce(
    (sum, d) => sum + d.sessions.reduce((s, session) => s + session.duration, 0),
    0
  );

  const handleDownloadICS = () => {
    const content = generateICalContent(
      roadmapData,
      courseName,
      new Date(startDate),
      parseInt(startHour)
    );
    downloadICalFile(content, `${courseName.toLowerCase().replace(/\s+/g, '-')}-schedule.ics`);
    
    toast({
      title: "Calendar exported! 📅",
      description: "Your .ics file has been downloaded. Import it into your calendar app.",
    });
  };

  const handleCopySummary = () => {
    const summary = generateScheduleSummary(roadmapData, courseName);
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    
    toast({
      title: "Copied to clipboard!",
      description: "Schedule summary copied.",
    });
  };

  const handleOpenGoogleCalendar = () => {
    // First download the .ics file
    handleDownloadICS();
    
    // Then open Google Calendar import page
    window.open('https://calendar.google.com/calendar/u/0/r/settings/export', '_blank');
    
    toast({
      title: "Opening Google Calendar",
      description: "Import the downloaded .ics file in Google Calendar settings.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Export to Calendar
          </DialogTitle>
          <DialogDescription>
            Add your learning schedule to your favorite calendar app
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Schedule summary */}
          <div className="bg-secondary/30 rounded-xl p-4">
            <h4 className="font-medium text-foreground mb-3">{courseName}</h4>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">{roadmapData.length}</div>
                <div className="text-xs text-muted-foreground">Days</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">{totalSessions}</div>
                <div className="text-xs text-muted-foreground">Sessions</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">
                  {Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m
                </div>
                <div className="text-xs text-muted-foreground">Total</div>
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Start Date
              </label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-11"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Day 1 of your schedule will start on this date
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Daily Start Time
              </label>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <select
                  value={startHour}
                  onChange={(e) => setStartHour(e.target.value)}
                  className="flex-1 h-11 px-3 rounded-lg border border-input bg-background text-foreground"
                >
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={i.toString().padStart(2, '0')}>
                      {i.toString().padStart(2, '0')}:00
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Sessions will be scheduled starting at this time each day
              </p>
            </div>
          </div>

          {/* Export options */}
          <div className="space-y-3">
            <Button 
              onClick={handleDownloadICS} 
              className="w-full h-12"
              variant="hero"
            >
              <Download className="w-4 h-4 mr-2" />
              Download .ics File
            </Button>

            <Button 
              onClick={handleOpenGoogleCalendar}
              variant="outline"
              className="w-full h-12"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Import to Google Calendar
            </Button>

            <Button 
              onClick={handleCopySummary}
              variant="outline"
              className="w-full h-12"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2 text-success" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Schedule Summary
                </>
              )}
            </Button>
          </div>

          {/* Help text */}
          <div className="text-center text-xs text-muted-foreground">
            <p>The .ics file works with Apple Calendar, Outlook,</p>
            <p>Google Calendar, and most calendar apps.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
