import { useCompanyAuth } from "@/_core/hooks/useCompanyAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
} from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/useMobile";
import { useLocation } from "wouter";
import { CSSProperties, useEffect, useRef, useState } from "react";
import {
  BarChart3,
  Briefcase,
  Building2,
  ExternalLink,
  LogOut,
  Star,
  UserCog,
  Users,
} from "lucide-react";
import { CompanyChatWidget } from "./CompanyChatWidget";

type CompanyLayoutProps = {
  children: React.ReactNode;
};

const NAV_ITEMS = [
  { icon: BarChart3, label: "Dashboard", path: "/client/dashboard" },
  { icon: Briefcase, label: "My Job Postings", path: "/client/dashboard/jobs" },
  { icon: Users, label: "Applicants", path: "/client/dashboard/applicants" },
  { icon: Star, label: "Leave a Review", path: "/client/dashboard/reviews" },
  { icon: UserCog, label: "Company Profile", path: "/client/dashboard/profile" },
];

const SIDEBAR_WIDTH_KEY = "company-sidebar-width";
const DEFAULT_WIDTH = 280;
const MIN_WIDTH = 200;
const MAX_WIDTH = 480;

/**
 * Company (Client) dashboard shell. Auth-gated with useCompanyAuth. Provides a
 * dedicated sidebar navigation for the company — no job-seeker/public nav.
 */
export default function CompanyLayout({ children }: CompanyLayoutProps) {
  const { company, loading, logout } = useCompanyAuth();
  const [location, setLocation] = useLocation();
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_WIDTH_KEY);
    return saved ? parseInt(saved, 10) : DEFAULT_WIDTH;
  });
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    localStorage.setItem(SIDEBAR_WIDTH_KEY, sidebarWidth.toString());
  }, [sidebarWidth]);

  useEffect(() => {
    if (!isResizing) return;
    const handleMouseMove = (e: MouseEvent) => {
      const sidebarLeft = sidebarRef.current?.getBoundingClientRect().left ?? 0;
      const newWidth = e.clientX - sidebarLeft;
      if (newWidth >= MIN_WIDTH && newWidth <= MAX_WIDTH) {
        setSidebarWidth(newWidth);
      }
    };
    const handleMouseUp = () => setIsResizing(false);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading company portal…</p>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 p-8 max-w-md text-center">
          <Building2 className="w-12 h-12 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">
            Sign in as a company to continue
          </h1>
          <p className="text-sm text-muted-foreground">
            Access to this dashboard requires a company account.
          </p>
          <button
            onClick={() => setLocation("/client/login")}
            className="mt-2 bg-gradient-to-r from-primary to-accent text-white font-semibold px-6 py-2.5 rounded-lg hover:shadow-lg transition-all duration-300"
          >
            Go to Company Login
          </button>
        </div>
      </div>
    );
  }

  const activeItem = NAV_ITEMS.find((item) => item.path === location);
  const initials = (company.name || "C")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <SidebarProvider
      style={{ "--sidebar-width": `${sidebarWidth}px` } as CSSProperties}
    >
      <div className="relative" ref={sidebarRef}>
        <Sidebar collapsible="icon" className="border-r">
          <SidebarHeader className="h-16 justify-center">
            <div className="flex items-center gap-3 px-2 transition-all w-full">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold shadow-lg shrink-0">
                <Building2 className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-bold tracking-tight truncate bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Company Portal
                </span>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent className="gap-0">
            <SidebarMenu className="px-2 py-1">
              {NAV_ITEMS.map((item) => {
                const isActive = location === item.path;
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      isActive={isActive}
                      onClick={() => setLocation(item.path)}
                      tooltip={item.label}
                      className={`h-10 transition-all font-normal ${
                        isActive ? "font-semibold" : ""
                      }`}
                    >
                      <item.icon
                        className={`h-4 w-4 ${isActive ? "text-primary" : ""}`}
                      />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>

            <div className="px-3 py-4 mt-2">
              <button
                onClick={() => setLocation("/")}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors w-full px-2 py-2 rounded-lg hover:bg-accent/50"
              >
                <ExternalLink className="h-4 w-4" />
                View Public Site
              </button>
            </div>
          </SidebarContent>

          <SidebarFooter className="p-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 rounded-lg px-1 py-1 hover:bg-accent/50 transition-colors w-full text-left focus:outline-none">
                  <Avatar className="h-9 w-9 border shrink-0">
                    {company.logoUrl ? (
                      <AvatarImage
                        src={company.logoUrl}
                        alt={company.name}
                        className="object-cover"
                      />
                    ) : null}
                    <AvatarFallback className="text-xs font-medium bg-gradient-to-br from-purple-500 to-accent text-white">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate leading-none">
                        {company.name || "-"}
                      </p>
                      <Badge
                        variant="secondary"
                        className="text-[10px] px-1.5 py-0 bg-primary/10 text-primary"
                      >
                        {company.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-1.5">
                      {company.ownerEmail || "-"}
                    </p>
                  </div>
                </button>
              </DropdownMenuTrigger>
<DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={() => setLocation("/")}
                  className="cursor-pointer gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  View Public Site
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setLocation("/client/login")}
                  className="cursor-pointer gap-2"
                >
                  <Building2 className="h-4 w-4" />
                  Switch Account
                </DropdownMenuItem>
<DropdownMenuItem
onClick={async () => {
                    await logout();
                    setLocation("/");
                  }}
                  className="cursor-pointer gap-2 text-destructive focus:text-destructive"
                >
                  <LogOut className="h-4 w-4" />
                  Log Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>
        <div
          className={`absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-primary/20 transition-colors ${
            isResizing ? "" : ""
          }`}
          onMouseDown={() => setIsResizing(true)}
          style={{ zIndex: 50 }}
        />
      </div>

      <SidebarInset>
        {isMobile && (
          <div className="flex border-b h-14 items-center justify-between bg-background/95 px-2 backdrop-blur sticky top-0 z-40">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="h-9 w-9 rounded-lg bg-background" />
              <span className="tracking-tight text-foreground font-semibold">
                {activeItem?.label ?? "Company"}
              </span>
            </div>
          </div>
        )}
<main className="flex-1 p-4 md:p-6 bg-secondary/5 min-h-screen">
          {children}
        </main>
      </SidebarInset>
      <CompanyChatWidget />
    </SidebarProvider>
  );
}
