import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./use-auth";
import { toast } from "./use-toast";

export interface Session {
  id: string;
  title: string;
  duration: number;
  completed: boolean;
  youtubeVideoId?: string;
  orderIndex: number;
}

export interface DayData {
  id: string;
  dayNumber: number;
  sessions: Session[];
  isToday?: boolean;
  isCompleted?: boolean;
}

export interface RoadmapData {
  id: string;
  title: string;
  description?: string;
  dailyLimit: number;
  startDate?: string;
  sourceUrl?: string;
  isPaused?: boolean;
  days: DayData[];
}

export function useRoadmap() {
  const { user } = useAuth();
  const [roadmaps, setRoadmaps] = useState<RoadmapData[]>([]);
  const [activeRoadmap, setActiveRoadmap] = useState<RoadmapData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all roadmaps for the user
  const fetchRoadmaps = useCallback(async () => {
    if (!user) {
      setRoadmaps([]);
      setActiveRoadmap(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      // Fetch roadmaps
      const { data: roadmapsData, error: roadmapsError } = await supabase
        .from("roadmaps")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (roadmapsError) throw roadmapsError;

      if (!roadmapsData || roadmapsData.length === 0) {
        setRoadmaps([]);
        setActiveRoadmap(null);
        setIsLoading(false);
        return;
      }

      // Fetch all days for these roadmaps
      const roadmapIds = roadmapsData.map(r => r.id);
      const { data: daysData, error: daysError } = await supabase
        .from("roadmap_days")
        .select("*")
        .in("roadmap_id", roadmapIds)
        .order("day_number", { ascending: true });

      if (daysError) throw daysError;

      // Fetch all sessions for these days
      const dayIds = (daysData || []).map(d => d.id);
      const { data: sessionsData, error: sessionsError } = await supabase
        .from("sessions")
        .select("*")
        .in("day_id", dayIds)
        .order("order_index", { ascending: true });

      if (sessionsError) throw sessionsError;

      // Build the roadmap structure
      const today = new Date().toISOString().split("T")[0];
      
      const formattedRoadmaps: RoadmapData[] = roadmapsData.map(roadmap => {
        const roadmapDays = (daysData || []).filter(d => d.roadmap_id === roadmap.id);
        
        // Determine which day is "today" based on start_date
        let todayDayNumber = 1;
        if (roadmap.start_date) {
          const startDate = new Date(roadmap.start_date);
          const currentDate = new Date(today);
          const diffTime = currentDate.getTime() - startDate.getTime();
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          todayDayNumber = Math.max(1, diffDays + 1);
        }

        const days: DayData[] = roadmapDays.map(day => {
          const daySessions = (sessionsData || []).filter(s => s.day_id === day.id);
          const allCompleted = daySessions.length > 0 && daySessions.every(s => s.is_completed);

          return {
            id: day.id,
            dayNumber: day.day_number,
            sessions: daySessions.map(s => ({
              id: s.id,
              title: s.title,
              duration: s.duration,
              completed: s.is_completed || false,
              youtubeVideoId: s.youtube_video_id || undefined,
              orderIndex: s.order_index,
            })),
            isToday: day.day_number === todayDayNumber,
            isCompleted: day.is_completed || allCompleted,
          };
        });

        return {
          id: roadmap.id,
          title: roadmap.title,
          description: roadmap.description || undefined,
          dailyLimit: roadmap.daily_limit || 60,
          startDate: roadmap.start_date || undefined,
          sourceUrl: roadmap.source_url || undefined,
          days,
        };
      });

      setRoadmaps(formattedRoadmaps);
      setActiveRoadmap(formattedRoadmaps[0] || null);
    } catch (error) {
      console.error("Error fetching roadmaps:", error);
      toast({
        title: "Error",
        description: "Failed to load roadmaps",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Toggle session completion
  const toggleSessionComplete = useCallback(async (sessionId: string) => {
      if (activeRoadmap?.isPaused) {
    toast({
      title: "Roadmap is paused",
      description: "Resume the roadmap to mark sessions complete",
    });
    return;
  }

    if (!activeRoadmap) return;

    // Find the session
    let targetSession: Session | null = null;
    let targetDayId: string | null = null;

    for (const day of activeRoadmap.days) {
      const session = day.sessions.find(s => s.id === sessionId);
      if (session) {
        targetSession = session;
        targetDayId = day.id;
        break;
      }
    }

    if (!targetSession || !targetDayId) return;

    const newCompleted = !targetSession.completed;

    // Optimistic update
    setActiveRoadmap(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        days: prev.days.map(day => {
          if (day.id !== targetDayId) return day;
          
          const updatedSessions = day.sessions.map(s => 
            s.id === sessionId ? { ...s, completed: newCompleted } : s
          );
          const allCompleted = updatedSessions.every(s => s.completed);
          
          return {
            ...day,
            sessions: updatedSessions,
            isCompleted: allCompleted,
          };
        }),
      };
    });

    // Update in database
    try {
      const { error } = await supabase
        .from("sessions")
        .update({ is_completed: newCompleted })
        .eq("id", sessionId);

      if (error) throw error;

      // Check if all sessions in the day are completed
      const day = activeRoadmap.days.find(d => d.id === targetDayId);
      if (day) {
        const updatedSessions = day.sessions.map(s => 
          s.id === sessionId ? { ...s, completed: newCompleted } : s
        );
        const allCompleted = updatedSessions.every(s => s.completed);

        // Update day completion status
        await supabase
          .from("roadmap_days")
          .update({ is_completed: allCompleted })
          .eq("id", targetDayId);
      }
    } catch (error) {
      console.error("Error updating session:", error);
      // Revert optimistic update
      fetchRoadmaps();
      toast({
        title: "Error",
        description: "Failed to update session",
        variant: "destructive",
      });
    }
  }, [activeRoadmap, fetchRoadmaps]);

  // Create a new roadmap from imported data
  const createRoadmap = useCallback(async (
    title: string,
    videos: { id: string; title: string; duration: number }[],
    dailyLimit: number = 60,
    sourceUrl?: string
  ) => {
    if (!user) return null;

    try {
      // Create roadmap
      const { data: roadmap, error: roadmapError } = await supabase
        .from("roadmaps")
        .insert({
          user_id: user.id,
          title,
          daily_limit: dailyLimit,
          source_url: sourceUrl,
          start_date: new Date().toISOString().split("T")[0],
        })
        .select()
        .single();

      if (roadmapError) throw roadmapError;

      // Distribute videos across days based on daily limit
      const days: { dayNumber: number; sessions: typeof videos }[] = [];
      let currentDay = 1;
      let currentDayDuration = 0;
      let currentDaySessions: typeof videos = [];

      for (const video of videos) {
        if (currentDayDuration + video.duration > dailyLimit && currentDaySessions.length > 0) {
          days.push({ dayNumber: currentDay, sessions: [...currentDaySessions] });
          currentDay++;
          currentDayDuration = 0;
          currentDaySessions = [];
        }
        
        currentDaySessions.push(video);
        currentDayDuration += video.duration;
      }

      if (currentDaySessions.length > 0) {
        days.push({ dayNumber: currentDay, sessions: currentDaySessions });
      }

      // Create days
      for (const day of days) {
        const { data: dayData, error: dayError } = await supabase
          .from("roadmap_days")
          .insert({
            roadmap_id: roadmap.id,
            day_number: day.dayNumber,
          })
          .select()
          .single();

        if (dayError) throw dayError;

        // Create sessions for this day
        const sessionsToInsert = day.sessions.map((video, index) => ({
          day_id: dayData.id,
          title: video.title,
          duration: video.duration,
          youtube_video_id: video.id,
          order_index: index,
          is_completed: false,
        }));

        const { error: sessionsError } = await supabase
          .from("sessions")
          .insert(sessionsToInsert);

        if (sessionsError) throw sessionsError;
      }

      // Refresh roadmaps
      await fetchRoadmaps();

      toast({
        title: "Roadmap created!",
        description: `${title} with ${videos.length} sessions across ${days.length} days`,
      });

      return roadmap;
    } catch (error) {
      console.error("Error creating roadmap:", error);
      toast({
        title: "Error",
        description: "Failed to create roadmap",
        variant: "destructive",
      });
      return null;
    }
  }, [user, fetchRoadmaps]);

  // Delete a roadmap
  const deleteRoadmap = useCallback(async (roadmapId: string) => {
    try {
      const { error } = await supabase
        .from("roadmaps")
        .delete()
        .eq("id", roadmapId);

      if (error) throw error;

      await fetchRoadmaps();
      
      toast({
        title: "Roadmap deleted",
        description: "Your roadmap has been removed",
      });
    } catch (error) {
      console.error("Error deleting roadmap:", error);
      toast({
        title: "Error",
        description: "Failed to delete roadmap",
        variant: "destructive",
      });
    }
  }, [fetchRoadmaps]);

  // Initial fetch
  useEffect(() => {
    fetchRoadmaps();
  }, [fetchRoadmaps]);

  // Calculate stats
  const stats = activeRoadmap ? {
    totalDays: activeRoadmap.days.length,
    completedDays: activeRoadmap.days.filter(d => d.isCompleted).length,
    totalSessions: activeRoadmap.days.flatMap(d => d.sessions).length,
    completedSessions: activeRoadmap.days.flatMap(d => d.sessions).filter(s => s.completed).length,
    currentDay: activeRoadmap.days.find(d => d.isToday)?.dayNumber || 1,
  } : null;
    const rebalanceActiveRoadmap = useCallback(
    async (newDailyLimit: number) => {
      if (!activeRoadmap || !user) return;

      try {
        // 1. Update daily limit
        await supabase
          .from("roadmaps")
          .update({ daily_limit: newDailyLimit })
          .eq("id", activeRoadmap.id);

        // 2. Collect all sessions (flatten)
        const allSessions = activeRoadmap.days
          .flatMap(d => d.sessions)
          .sort((a, b) => a.orderIndex - b.orderIndex);

        // 3. Delete old days
        await supabase
          .from("roadmap_days")
          .delete()
          .eq("roadmap_id", activeRoadmap.id);

        // 4. Recreate days based on new limit
        let dayNumber = 1;
        let dayDuration = 0;
        let currentDaySessions: Session[] = [];

        const newDays: { dayNumber: number; sessions: Session[] }[] = [];

        for (const session of allSessions) {
          if (
            dayDuration + session.duration > newDailyLimit &&
            currentDaySessions.length > 0
          ) {
            newDays.push({
              dayNumber,
              sessions: [...currentDaySessions],
            });
            dayNumber++;
            dayDuration = 0;
            currentDaySessions = [];
          }

          currentDaySessions.push(session);
          dayDuration += session.duration;
        }

        if (currentDaySessions.length > 0) {
          newDays.push({
            dayNumber,
            sessions: currentDaySessions,
          });
        }

        // 5. Insert new days & move sessions
        for (const day of newDays) {
          const { data: dayRow } = await supabase
            .from("roadmap_days")
            .insert({
              roadmap_id: activeRoadmap.id,
              day_number: day.dayNumber,
            })
            .select()
            .single();

          if (!dayRow) continue;

          for (let i = 0; i < day.sessions.length; i++) {
            await supabase
              .from("sessions")
              .update({
                day_id: dayRow.id,
                order_index: i,
              })
              .eq("id", day.sessions[i].id);
          }
        }

        await fetchRoadmaps();

        toast({
          title: "Roadmap rebalanced",
          description: `Daily limit updated to ${newDailyLimit} minutes`,
        });
      } catch (err) {
        console.error(err);
        toast({
          title: "Error",
          description: "Failed to rebalance roadmap",
          variant: "destructive",
        });
      }
    },
    [activeRoadmap, user, fetchRoadmaps]
  );


  return {
  roadmaps,
  activeRoadmap,
  setActiveRoadmap,
  isLoading,
  stats,
  toggleSessionComplete,
  createRoadmap,
  rebalanceActiveRoadmap,
  deleteRoadmap,
  refetch: fetchRoadmaps,
 };
}