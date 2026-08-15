import { useAdminAuth } from "@/_core/hooks/useAdminAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/useMobile";
import {
  Activity,
  BarChart3,
  Bell,
  Briefcase,
  Building2,
  FileText,
  LayoutDashboard,
  LogOut,
  Settings,
  ShieldCheck,
  Sparkles,
  Tags,
  Users,
  Send,
} from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

const SIDEBAR_WIDTH_KEY = "admin-sidebar-width";
const DEFAULT_WIDTH = 280;
const MIN_WIDTH = 200;
const MAX_WIDTH = 480;

type NavItem = {
  icon: typeof LayoutDashboard;
  label: string;
  path: string;
  superAdminOnly?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin/dashboard" },
  { icon: Users, label: "Job Seekers", path: "/admin/job-seekers" },
  { icon: Building2, label: "Companies", path: "/admin/companies" },
{ icon: Briefcase, label: "Job Postings", path: "/admin/job-postings" },
  { icon: Send, label: "Applications", path: "/admin/applications" },
  { icon: Bell, label: "Notifications", path: "/admin/notifications" },
  { icon: FileText, label: "Career Tips", path: "/admin/career-tips" },
  { icon: Sparkles, label: "Partners", path: "/admin/partners" },
  { icon: Tags, label: "Categories & Locations", path: "/admin/categories" },
  { icon: ShieldCheck, label: "Admin Users", path: "/admin/admin-users", superAdminOnly: true },
  { icon: Activity, label: "Activity Log", path: "/admin/activity-log" },
  { icon: Settings, label: "Settings", path: "/admin/settings" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_WIDTH_KEY);
    return saved ? parseInt(saved, 10) : DEFAULT_WIDTH;
  });
  const { admin, loading } = useAdminAuth();

  useEffect(() => {
    localStorage.setItem(SIDEBAR_WIDTH_KEY, sidebarWidth.toString());
  }, [sidebarWidth]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading admin portal…</p>
        </div>
      </div>
    );
  }

  if (!admin) {
    return null;
  }

  return (
    <SidebarProvider
      style={{ "--sidebar-width": `${sidebarWidth}px` } as CSSProperties}
    >
      <AdminLayoutContent setSidebarWidth={setSidebarWidth}>
        {children}
      </AdminLayoutContent>
    </SidebarProvider>
  );
}

function AdminLayoutContent({
  children,
  setSidebarWidth,
}: {
  children: React.ReactNode;
  setSidebarWidth: (width: number) => void;
}) {
  const { admin, logout } = useAdminAuth();
  const [location, setLocation] = useLocation();
  const unreadQuery = trpc.admin.notifications.unreadCount.useQuery(undefined, {
    refetchInterval: 30000,
  });
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const isMobile = useIsMobile();
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const visibleItems = admin?.role === "super_admin"
    ? NAV_ITEMS
    : NAV_ITEMS.filter((item) => !item.superAdminOnly);

  const activeItem = visibleItems.find((item) => item.path === location);
  const unreadCount = unreadQuery.data ?? 0;

  useEffect(() => {
    if (isCollapsed) setIsResizing(false);
  }, [isCollapsed]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const sidebarLeft = sidebarRef.current?.getBoundingClientRect().left ?? 0;
      const newWidth = e.clientX - sidebarLeft;
      if (newWidth >= MIN_WIDTH && newWidth <= MAX_WIDTH) {
        setSidebarWidth(newWidth);
      }
    };
    const handleMouseUp = () => setIsResizing(false);

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, setSidebarWidth]);

  return (
    <>
      <div className="relative" ref={sidebarRef}>
        <Sidebar collapsible="icon" className="border-r-0" disableTransition={isResizing}>
          <SidebarHeader className="h-16 justify-center">
            <div className="flex items-center gap-3 px-2 transition-all w-full">
              <button
                onClick={toggleSidebar}
                className="h-8 w-8 flex items-center justify-center hover:bg-accent rounded-lg transition-colors shrink-0"
                aria-label="Toggle navigation"
              >
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </button>
              {!isCollapsed ? (
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-bold tracking-tight truncate bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    TalentBridge Admin
                  </span>
                </div>
              ) : null}
            </div>
          </SidebarHeader>

          <SidebarContent className="gap-0">
            <SidebarMenu className="px-2 py-1">
              {visibleItems.map((item) => {
                const isActive = location === item.path;
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      isActive={isActive}
                      onClick={() => setLocation(item.path)}
                      tooltip={item.label}
                      className={`h-10 transition-all font-normal ${isActive ? "font-semibold" : ""}`}
                    >
                      <item.icon className={`h-4 w-4 ${isActive ? "text-primary" : ""}`} />
                      <span>{item.label}</span>
                      {item.path === "/admin/notifications" && unreadCount > 0 ? (
                        <Badge className="ml-auto h-5 min-w-5 justify-center rounded-full bg-amber-500 px-1.5 text-[10px] text-white group-data-[collapsible=icon]:hidden">
                          {unreadCount > 99 ? "99+" : unreadCount}
                        </Badge>
                      ) : null}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="p-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 rounded-lg px-1 py-1 hover:bg-accent/50 transition-colors w-full text-left group-data-[collapsible=icon]:justify-center focus:outline-none">
                  <Avatar className="h-9 w-9 border shrink-0">
                    <AvatarFallback className="text-xs font-medium bg-gradient-to-br from-primary to-accent text-white">
                      {admin?.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate leading-none">
                        {admin?.name || "-"}
                      </p>
                      <Badge
                        variant="secondary"
                        className="text-[10px] px-1.5 py-0 bg-primary/10 text-primary"
                      >
                        {admin?.role === "super_admin" ? "Super" : "Admin"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-1.5">
                      {admin?.email || "-"}
                    </p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={logout}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>
        <div
          className={`absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-primary/20 transition-colors ${isCollapsed ? "hidden" : ""}`}
          onMouseDown={() => {
            if (isCollapsed) return;
            setIsResizing(true);
          }}
          style={{ zIndex: 50 }}
        />
      </div>

      <SidebarInset>
        {isMobile && (
          <div className="flex border-b h-14 items-center justify-between bg-background/95 px-2 backdrop-blur sticky top-0 z-40">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="h-9 w-9 rounded-lg bg-background" />
              <span className="tracking-tight text-foreground font-semibold">
                {activeItem?.label ?? "Admin"}
              </span>
            </div>
          </div>
        )}
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </SidebarInset>
    </>
  );
}
