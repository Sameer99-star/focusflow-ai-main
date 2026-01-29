import { 
  LayoutDashboard, 
  Map, 
  Timer, 
  Brain, 
  Settings, 
  LogOut,
  ChevronLeft,
  Sparkles
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const mainNavItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Roadmap", url: "/roadmap", icon: Map },
  { title: "Focus Timer", url: "/timer", icon: Timer },
  { title: "AI Mentor", url: "/mentor", icon: Brain },
];

const bottomNavItems = [
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const isCollapsed = state === "collapsed";

  const handleLogout = async () => {
    await signOut();
    navigate("/");
    toast({
      title: "Signed out",
      description: "You've been successfully signed out.",
    });
  };

  return (
    <Sidebar 
      className="border-r border-sidebar-border"
      collapsible="icon"
    >
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-glow">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          {!isCollapsed && (
            <div className="animate-fade-in">
              <h1 className="font-semibold text-sidebar-foreground">FocusFlow</h1>
              <p className="text-xs text-muted-foreground">AI Learning</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          {!isCollapsed && (
            <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
              Main
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    tooltip={isCollapsed ? item.title : undefined}
                  >
                    <NavLink 
                      to={item.url} 
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                        "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      )}
                      activeClassName="bg-primary text-primary-foreground shadow-soft-sm"
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      {!isCollapsed && <span className="font-medium">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-2">
        <SidebarMenu>
          {/* User info */}
          {!isCollapsed && user && (
            <SidebarMenuItem>
              <div className="px-3 py-2 mb-2 rounded-lg bg-sidebar-accent/50">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {user.email?.split("@")[0]}
                </p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
            </SidebarMenuItem>
          )}

          {/* Theme toggle */}
          {!isCollapsed && (
            <SidebarMenuItem>
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-sm text-muted-foreground">Theme</span>
                <ThemeToggle />
              </div>
            </SidebarMenuItem>
          )}

          {bottomNavItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton 
                asChild
                tooltip={isCollapsed ? item.title : undefined}
              >
                <NavLink 
                  to={item.url}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground transition-all duration-200"
                  activeClassName="bg-sidebar-accent text-sidebar-foreground"
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {!isCollapsed && <span>{item.title}</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
          
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              tooltip={isCollapsed ? "Logout" : undefined}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && <span>Logout</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        {/* Collapse trigger */}
        <div className="mt-2 pt-2 border-t border-sidebar-border">
          <SidebarTrigger className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground transition-all duration-200">
            <ChevronLeft className={cn(
              "w-4 h-4 transition-transform duration-200",
              isCollapsed && "rotate-180"
            )} />
            {!isCollapsed && <span className="text-sm">Collapse</span>}
          </SidebarTrigger>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
