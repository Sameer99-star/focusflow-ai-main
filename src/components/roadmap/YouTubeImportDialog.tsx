import { useState } from "react";
import { Youtube, Loader2, Clock, Video, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import {
  isYouTubeUrl,
  isPlaylistUrl,
  formatDuration,
  fetchPlaylistFromEdge,
} from "@/lib/youtube";

interface VideoData {
  id: string;
  title: string;
  duration: number;
  thumbnailUrl?: string;
}

interface YouTubeImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (videos: VideoData[], playlistTitle: string) => void;
}

export function YouTubeImportDialog({
  open,
  onOpenChange,
  onImport,
}: YouTubeImportDialogProps) {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<{
    title: string;
    videos: VideoData[];
    totalDuration: number;
  } | null>(null);

  const handleParse = async () => {
    setError(null);

    if (!url.trim()) {
      setError("Please enter a YouTube URL");
      return;
    }

    if (!isYouTubeUrl(url)) {
      setError("Please enter a valid YouTube URL");
      return;
    }

    if (!isPlaylistUrl(url)) {
      setError("Please enter a playlist URL (not a single video)");
      return;
    }

    setIsLoading(true);

    try {
      const data = await fetchPlaylistFromEdge(url);

      if (data?.error) {
        const msg = data.error.toLowerCase();

        if (msg.includes("not found") || msg.includes("private")) {
          setError("This playlist is private, deleted, or unavailable");
        } else if (msg.includes("invalid")) {
          setError("Invalid playlist URL");
        } else {
          setError("Failed to fetch playlist. Please try again.");
        }
        return;
      }

      setPreview({
        title: data.title,
        videos: data.videos,
        totalDuration: data.totalDuration,
      });
    } catch (err: any) {
  console.error("YouTube parse error:", err);

  const message = err?.message?.toLowerCase?.() || "";

  if (
    message.includes("private") ||
    message.includes("not found") ||
    message.includes("playlist")
  ) {
    setError("This playlist is private, deleted, or unavailable");
  } else {
    setError("Something went wrong while parsing the playlist");
  }
}
 finally {
      setIsLoading(false);
    }
  };

  const handleImport = () => {
    if (!preview) return;

    onImport(preview.videos, preview.title);
    onOpenChange(false);
    setUrl("");
    setPreview(null);

    toast({
      title: "Playlist imported! 🎉",
      description: `${preview.videos.length} videos added to your schedule.`,
    });
  };

  const handleClose = () => {
    setUrl("");
    setError(null);
    setPreview(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Youtube className="w-5 h-5 text-destructive" />
            Import YouTube Playlist
          </DialogTitle>
          <DialogDescription>
            Paste a YouTube playlist URL to automatically create learning sessions
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!preview ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="youtube-url">Playlist URL</Label>
                <Input
                  id="youtube-url"
                  placeholder="https://youtube.com/playlist?list=..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}

              <Button
                onClick={handleParse}
                disabled={isLoading || !url.trim()}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Parsing playlist...
                  </>
                ) : (
                  "Parse Playlist"
                )}
              </Button>
            </>
          ) : (
            <>
              <div className="p-4 rounded-xl bg-muted/50 border border-border">
                <h3 className="font-semibold text-foreground mb-3">
                  {preview.title}
                </h3>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Video className="w-4 h-4" />
                    {preview.videos.length} videos
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    {formatDuration(preview.totalDuration)} total
                  </div>
                </div>
              </div>

              <div className="max-h-60 overflow-y-auto space-y-2">
                {preview.videos.slice(0, 10).map((video, index) => (
                  <div
                    key={video.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <span className="text-sm text-muted-foreground w-6">
                      {index + 1}.
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {video.title}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {video.duration}m
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setPreview(null)}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button onClick={handleImport} className="flex-1">
                  Import {preview.videos.length} Videos
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
