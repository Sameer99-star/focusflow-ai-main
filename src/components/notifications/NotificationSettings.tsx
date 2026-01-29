import { useState, useEffect } from "react";
import { Bell, BellOff, Clock, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useNotifications } from "@/hooks/use-notifications";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface NotificationSettingsData {
  push_enabled: boolean;
  reminder_time: string;
  reminder_minutes_before: number;
}

export function NotificationSettings() {
  const { permission, isSupported, requestPermission } = useNotifications();
  const { user } = useAuth();
  const [settings, setSettings] = useState<NotificationSettingsData>({
    push_enabled: true,
    reminder_time: "09:00",
    reminder_minutes_before: 15,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      loadSettings();
    }
  }, [user]);

  const loadSettings = async () => {
    if (!user) return;
    setIsLoading(true);
    
    const { data, error } = await supabase
      .from("notification_settings")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!error && data) {
      setSettings({
        push_enabled: data.push_enabled ?? true,
        reminder_time: data.reminder_time?.slice(0, 5) ?? "09:00",
        reminder_minutes_before: data.reminder_minutes_before ?? 15,
      });
    }
    setIsLoading(false);
  };

  const saveSettings = async () => {
    if (!user) return;
    setIsSaving(true);

    const { error } = await supabase
      .from("notification_settings")
      .update({
        push_enabled: settings.push_enabled,
        reminder_time: settings.reminder_time + ":00",
        reminder_minutes_before: settings.reminder_minutes_before,
      })
      .eq("user_id", user.id);

    if (error) {
      toast({
        title: "Error saving settings",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Settings saved! ✨",
        description: "Your notification preferences have been updated.",
      });
    }
    setIsSaving(false);
  };

  const handleEnableNotifications = async () => {
    const granted = await requestPermission();
    if (granted) {
      setSettings((prev) => ({ ...prev, push_enabled: true }));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Permission status */}
      {!isSupported ? (
        <div className="p-4 rounded-xl bg-muted/50 border border-border">
          <div className="flex items-center gap-3 text-muted-foreground">
            <BellOff className="w-5 h-5" />
            <p className="text-sm">Your browser doesn't support notifications.</p>
          </div>
        </div>
      ) : permission === "denied" ? (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30">
          <div className="flex items-center gap-3 text-destructive">
            <BellOff className="w-5 h-5" />
            <div>
              <p className="text-sm font-medium">Notifications are blocked</p>
              <p className="text-xs mt-1 opacity-80">
                Please enable notifications in your browser settings.
              </p>
            </div>
          </div>
        </div>
      ) : permission === "default" ? (
        <div className="p-4 rounded-xl bg-primary/10 border border-primary/30">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  Enable push notifications
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Get reminded about your learning sessions
                </p>
              </div>
            </div>
            <Button onClick={handleEnableNotifications} size="sm">
              Enable
            </Button>
          </div>
        </div>
      ) : null}

      {/* Settings */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-base">Push Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Receive browser notifications for reminders
            </p>
          </div>
          <Switch
            checked={settings.push_enabled && permission === "granted"}
            onCheckedChange={(checked) =>
              setSettings((prev) => ({ ...prev, push_enabled: checked }))
            }
            disabled={permission !== "granted"}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label className="text-base">Daily Reminder Time</Label>
            <p className="text-sm text-muted-foreground">
              When should we remind you to study?
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <Input
              type="time"
              value={settings.reminder_time}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, reminder_time: e.target.value }))
              }
              className="w-28"
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label className="text-base">Reminder Before Session</Label>
            <p className="text-sm text-muted-foreground">
              Minutes before a scheduled session starts
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min={5}
              max={60}
              value={settings.reminder_minutes_before}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  reminder_minutes_before: parseInt(e.target.value) || 15,
                }))
              }
              className="w-20"
            />
            <span className="text-sm text-muted-foreground">min</span>
          </div>
        </div>
      </div>

      {/* Save button */}
      <Button onClick={saveSettings} disabled={isSaving} className="w-full">
        {isSaving ? (
          <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
        ) : (
          <>
            <Save className="w-4 h-4 mr-2" />
            Save Notification Settings
          </>
        )}
      </Button>
    </div>
  );
}
