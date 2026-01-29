import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VideoData {
  id: string;
  title: string;
  duration: number;
  thumbnailUrl?: string;
}

// Extract playlist ID from URL
function extractPlaylistId(url: string): string | null {
  const match = url.match(/[?&]list=([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

// Parse ISO 8601 duration to minutes
function parseDuration(isoDuration: string): number {
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 5; // Default to 5 minutes if parsing fails

  const hours = parseInt(match[1] || "0", 10);
  const minutes = parseInt(match[2] || "0", 10);
  const seconds = parseInt(match[3] || "0", 10);

  return Math.max(1, Math.ceil(hours * 60 + minutes + seconds / 60));
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ error: "URL is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const playlistId = extractPlaylistId(url);
    if (!playlistId) {
      return new Response(
        JSON.stringify({ error: "Invalid playlist URL" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const apiKey = Deno.env.get("YOUTUBE_API_KEY");
    
    // If no API key, return mock data for demo purposes
    if (!apiKey) {
      console.log("No YouTube API key found, returning demo data");
      
      // Generate demo playlist data
      const demoVideos: VideoData[] = [
        { id: "demo1", title: "Introduction to the Course", duration: 15 },
        { id: "demo2", title: "Setting Up Your Environment", duration: 12 },
        { id: "demo3", title: "Core Concepts - Part 1", duration: 25 },
        { id: "demo4", title: "Core Concepts - Part 2", duration: 22 },
        { id: "demo5", title: "Hands-On Practice Session", duration: 30 },
        { id: "demo6", title: "Advanced Techniques", duration: 28 },
        { id: "demo7", title: "Real-World Project", duration: 45 },
        { id: "demo8", title: "Best Practices & Tips", duration: 18 },
        { id: "demo9", title: "Common Mistakes to Avoid", duration: 15 },
        { id: "demo10", title: "Final Project & Wrap-Up", duration: 35 },
      ];

      const totalDuration = demoVideos.reduce((sum, v) => sum + v.duration, 0);

      return new Response(
        JSON.stringify({
          title: "Demo Learning Playlist",
          videos: demoVideos,
          totalDuration,
          isDemo: true,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch playlist info
    const playlistUrl = `https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=${playlistId}&key=${apiKey}`;
    const playlistRes = await fetch(playlistUrl);
    const playlistData = await playlistRes.json();

    if (!playlistData.items || playlistData.items.length === 0) {
      return new Response(
        JSON.stringify({ error: "Playlist not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const playlistTitle = playlistData.items[0].snippet.title;

    // Fetch playlist items (videos)
    const videos: VideoData[] = [];
    let nextPageToken = "";
    
    do {
      const itemsUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&maxResults=50&playlistId=${playlistId}&key=${apiKey}${nextPageToken ? `&pageToken=${nextPageToken}` : ""}`;
      const itemsRes = await fetch(itemsUrl);
      const itemsData = await itemsRes.json();

      if (itemsData.items) {
        const videoIds = itemsData.items.map((item: any) => item.contentDetails.videoId).join(",");
        
        // Get video durations
        const videosUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,snippet&id=${videoIds}&key=${apiKey}`;
        const videosRes = await fetch(videosUrl);
        const videosData = await videosRes.json();

        for (const video of videosData.items || []) {
          videos.push({
            id: video.id,
            title: video.snippet.title,
            duration: parseDuration(video.contentDetails.duration),
            thumbnailUrl: video.snippet.thumbnails?.medium?.url,
          });
        }
      }

      nextPageToken = itemsData.nextPageToken || "";
    } while (nextPageToken && videos.length < 200); // Limit to 200 videos

    const totalDuration = videos.reduce((sum, v) => sum + v.duration, 0);

    return new Response(
      JSON.stringify({
        title: playlistTitle,
        videos,
        totalDuration,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error parsing YouTube playlist:", error);
    return new Response(
      JSON.stringify({ error: "Failed to parse playlist" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
