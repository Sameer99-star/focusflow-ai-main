import { useState, useEffect } from "react";
import { Moon, Sun, Bell, Clock, User, Shield, Trash2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useTheme } from "@/hooks/use-theme";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { NotificationSettings } from "@/components/notifications/NotificationSettings";
import { useNavigate } from "react-router-dom";

export default function Settings() {
  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [reducedMotion, setReducedMotion] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("user_id", user.id)
      .maybeSingle();

    if (data) {
      setDisplayName(data.display_name || "");
    }
  };

  const saveProfile = async () => {
    if (!user) return;
    setIsSaving(true);

    const { error } = await supabase
      .from("profiles")
      .update({ display_name: displayName })
      .eq("user_id", user.id);

    if (error) {
      toast({
        title: "Error saving profile",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Profile saved! ✨",
        description: "Your profile has been updated.",
      });
    }
    setIsSaving(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
    toast({
      title: "Signed out",
      description: "You've been successfully signed out.",
    });
  };

  return (
    <div className="min-h-screen p-8 max-w-3xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
        <p className="text-muted-foreground">Customize your learning experience</p>
      </div>

      {/* Profile Section */}
      <section className="bg-card rounded-2xl p-6 border border-border shadow-soft-md mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <User className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">Profile</h2>
        </div>

        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Display Name</Label>
            <Input 
              id="name" 
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your display name"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={user?.email || ""} disabled />
            <p className="text-xs text-muted-foreground">Email cannot be changed</p>
          </div>

          <Button onClick={saveProfile} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Profile"}
          </Button>
        </div>
      </section>

      {/* Appearance Section */}
      <section className="bg-card rounded-2xl p-6 border border-border shadow-soft-md mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
            {theme === "dark" ? (
              <Moon className="w-5 h-5 text-accent" />
            ) : (
              <Sun className="w-5 h-5 text-accent" />
            )}
          </div>
          <h2 className="text-lg font-semibold text-foreground">Appearance</h2>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">Dark Mode</Label>
              <p className="text-sm text-muted-foreground">
                Easier on the eyes during night sessions
              </p>
            </div>
            <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">Reduced Motion</Label>
              <p className="text-sm text-muted-foreground">
                Minimize animations for better focus
              </p>
            </div>
            <Switch checked={reducedMotion} onCheckedChange={setReducedMotion} />
          </div>
        </div>
      </section>

      {/* Notifications Section */}
      <section className="bg-card rounded-2xl p-6 border border-border shadow-soft-md mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
            <Bell className="w-5 h-5 text-success" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">Notifications</h2>
        </div>

        <NotificationSettings />
      </section>

      {/* Security Section */}
      <section className="bg-card rounded-2xl p-6 border border-border shadow-soft-md mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
            <Shield className="w-5 h-5 text-warning" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">Security</h2>
        </div>

        <div className="space-y-4">
          <Button variant="outline" className="w-full justify-start" onClick={handleSignOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </section>

      {/* Danger Zone */}
      <section className="bg-card rounded-2xl p-6 border border-destructive/30 shadow-soft-md">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
            <Trash2 className="w-5 h-5 text-destructive" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">Danger Zone</h2>
        </div>

        <div className="space-y-4">
          <Button variant="outline" className="w-full justify-start text-destructive hover:bg-destructive/10">
            Reset All Progress
          </Button>
          <Button variant="outline" className="w-full justify-start text-destructive hover:bg-destructive/10">
            Delete Account
          </Button>
        </div>
      </section>
    </div>
  );
}
