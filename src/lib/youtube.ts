// YouTube URL parsing utilities

export interface YouTubeVideo {
  id: string;
  title: string;
  duration: number; // in minutes
  thumbnailUrl?: string;
}

export interface PlaylistInfo {
  id: string;
  title: string;
  videos: YouTubeVideo[];
  totalDuration: number;
}

// Extract playlist ID from various YouTube URL formats
export function extractPlaylistId(url: string): string | null {
  const patterns = [
    /[?&]list=([a-zA-Z0-9_-]+)/,
    /youtube\.com\/playlist\?list=([a-zA-Z0-9_-]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return null;
}

// Extract video ID from various YouTube URL formats
export function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return null;
}

// Check if URL is a YouTube URL
export function isYouTubeUrl(url: string): boolean {
  return /(?:youtube\.com|youtu\.be)/.test(url);
}

// Check if URL is a playlist
export function isPlaylistUrl(url: string): boolean {
  return extractPlaylistId(url) !== null;
}

// Parse ISO 8601 duration to minutes
export function parseDuration(isoDuration: string): number {
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;

  const hours = parseInt(match[1] || "0", 10);
  const minutes = parseInt(match[2] || "0", 10);
  const seconds = parseInt(match[3] || "0", 10);

  return Math.ceil(hours * 60 + minutes + seconds / 60);
}

// Format minutes to readable duration
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}
export async function fetchPlaylistFromEdge(url: string) {
  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
  const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error("Supabase env variables missing");
  }

  const res = await fetch(
    `${SUPABASE_URL}/functions/v1/parse-youtube`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        "apikey": SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ url }),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Edge function error: ${text}`);
  }

  return await res.json();
}

