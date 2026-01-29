import { useState, useEffect, useCallback } from "react";
import { toast } from "@/hooks/use-toast";

interface NotificationPermissionState {
  permission: NotificationPermission;
  isSupported: boolean;
}

export function useNotifications() {
  const [state, setState] = useState<NotificationPermissionState>({
    permission: "default",
    isSupported: false,
  });

  useEffect(() => {
    const isSupported = "Notification" in window;
    setState({
      permission: isSupported ? Notification.permission : "denied",
      isSupported,
    });
  }, []);

  const requestPermission = useCallback(async () => {
    if (!state.isSupported) {
      toast({
        title: "Notifications not supported",
        description: "Your browser doesn't support push notifications.",
        variant: "destructive",
      });
      return false;
    }

    const permission = await Notification.requestPermission();
    setState((prev) => ({ ...prev, permission }));

    if (permission === "granted") {
      toast({
        title: "Notifications enabled! 🔔",
        description: "You'll receive reminders for your learning sessions.",
      });
      return true;
    } else if (permission === "denied") {
      toast({
        title: "Notifications blocked",
        description: "Please enable notifications in your browser settings.",
        variant: "destructive",
      });
      return false;
    }
    return false;
  }, [state.isSupported]);

  const showNotification = useCallback(
    (title: string, options?: NotificationOptions) => {
      if (state.permission !== "granted") return null;

      const notification = new Notification(title, {
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        ...options,
      });

      return notification;
    },
    [state.permission]
  );

  const scheduleNotification = useCallback(
    (title: string, scheduledTime: Date, options?: NotificationOptions) => {
      const now = new Date();
      const delay = scheduledTime.getTime() - now.getTime();

      if (delay <= 0) return null;

      const timeoutId = setTimeout(() => {
        showNotification(title, options);
      }, delay);

      return timeoutId;
    },
    [showNotification]
  );

  return {
    permission: state.permission,
    isSupported: state.isSupported,
    requestPermission,
    showNotification,
    scheduleNotification,
  };
}
