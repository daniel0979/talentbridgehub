import { useAuth } from "@/_core/hooks/useAuth";
import { useJobSeekerAuth } from "@/_core/hooks/useJobSeekerAuth";
import { useCompanyAuth } from "@/_core/hooks/useCompanyAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { startLogin } from "@/const";
import { Menu, X, ChevronDown, User, Briefcase, Building2, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import AuthModal from "./AuthModal";

export default function Navigation() {
  const { isAuthenticated, logout } = useAuth();
  const {
    jobSeeker,
    isAuthenticated: isJobSeekerAuthenticated,
    logout: logoutJobSeeker,
  } = useJobSeekerAuth();
  const {
    company,
    isAuthenticated: isCompanyAuthenticated,
    logout: logoutCompany,
  } = useCompanyAuth();
const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [location, setLocation] = useLocation();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [findWorkDropdown, setFindWorkDropdown] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Jobs", href: "/jobs" },
    { label: "Companies", href: "/companies" },
    { label: "Career Tips", href: "/tips" },
  ];

  const jobCategories = [
    { label: "Tech & Engineering", href: "/jobs?category=tech" },
    { label: "Design", href: "/jobs?category=design" },
    { label: "Marketing", href: "/jobs?category=marketing" },
    { label: "Finance", href: "/jobs?category=finance" },
    { label: "View All Jobs", href: "/jobs" },
  ];

  const isActive = (href: string) => location === href;

  const jobSeekerInitials = (jobSeeker?.name || "JS")
    .split(" ")
    .map(n => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

const handleJobSeekerLogout = async () => {
    await logoutJobSeeker();
    setMobileMenuOpen(false);
    setLocation("/");
  };

  const handleCompanyLogout = async () => {
    await logoutCompany();
    setMobileMenuOpen(false);
    setLocation("/");
  };

  const companyInitials = (company?.name || "C")
    .split(" ")
    .map(n => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <>
      <nav
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-gradient-to-r from-primary/98 via-primary/95 to-primary/90 backdrop-blur-lg shadow-2xl border-b border-primary/30"
            : "bg-white border-b border-secondary/20"
        }`}
      >
        <div className="container flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/">
            <span
              className={`flex items-center gap-2 text-xl font-bold transition-all duration-300 cursor-pointer group ${
                scrolled
                  ? "text-white"
                  : "bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300 ${
                  scrolled
                    ? "bg-white text-primary"
                    : "bg-gradient-to-br from-primary to-accent text-white"
                }`}
              >
                TB
              </div>
              <span className="hidden sm:inline">TalentBridgeHub</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(link => (
              <Link key={link.href} href={link.href}>
                <span
                  className={`font-medium transition-all duration-300 cursor-pointer relative group ${
                    scrolled
                      ? isActive(link.href)
                        ? "text-white"
                        : "text-white/70 hover:text-white"
                      : isActive(link.href)
                        ? "text-primary"
                        : "text-foreground/70 hover:text-primary"
                  }`}
                >
                  {link.label}
                  {isActive(link.href) && (
                    <div
                      className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-accent transition-all duration-300`}
                    />
                  )}
                </span>
              </Link>
            ))}

            {/* Find Work Dropdown */}
            <div className="relative group">
              <button
                onClick={() => setFindWorkDropdown(!findWorkDropdown)}
                className={`font-medium transition-all duration-300 flex items-center gap-1 ${
                  scrolled
                    ? "text-white/70 hover:text-white"
                    : "text-foreground/70 hover:text-primary"
                }`}
              >
                Find Work
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-300 ${
                    findWorkDropdown ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Dropdown Menu */}
              {findWorkDropdown && (
                <div className="absolute top-full left-0 mt-2 w-56 rounded-xl shadow-2xl border-2 border-primary/20 animate-in fade-in slide-in-from-top-2 duration-300 z-50 bg-white">
                  <div className="p-2">
                    {jobCategories.map((category, idx) => (
                      <Link key={category.href} href={category.href}>
                        <span
                          className={`block px-4 py-3 rounded-lg transition-all duration-300 cursor-pointer font-medium ${
                            idx === jobCategories.length - 1
                              ? "border-t border-secondary/20 mt-2 pt-3 text-primary hover:bg-primary/10"
                              : "text-foreground/70 hover:text-primary hover:bg-primary/5"
                          }`}
                          onClick={() => setFindWorkDropdown(false)}
                        >
                          {category.label}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Employer portal */}
            <Link
              href="/client/login"
              className={`font-bold transition-all duration-300 px-4 py-2 rounded-lg ${
                scrolled
                  ? "text-white hover:bg-white/10"
                  : "text-primary hover:bg-primary/10"
              }`}
            >
              EMPLOYERS
            </Link>
          </div>

{/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {isCompanyAuthenticated && company ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2.5 rounded-full px-2 py-1.5 transition-all duration-300 hover:bg-white/10 cursor-pointer">
                    <Avatar className="w-9 h-9 border-2 border-white/60 shadow-md">
                      {company.logoUrl ? (
                        <AvatarImage
                          src={company.logoUrl}
                          alt={company.name}
                          className="object-cover"
                        />
                      ) : null}
                      <AvatarFallback className="bg-gradient-to-br from-purple-500 to-accent text-white text-sm font-bold">
                        {companyInitials}
                      </AvatarFallback>
                    </Avatar>
                    <span
                      className={`hidden lg:inline font-semibold text-sm ${
                        scrolled ? "text-white" : "text-foreground"
                      }`}
                    >
                      {company.name.split(" ")[0]}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 ${
                        scrolled ? "text-white/80" : "text-muted-foreground"
                      }`}
                    />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 mt-2">
                  <DropdownMenuLabel className="font-semibold">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-primary" />
                      <span className="truncate">{company.name}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <Link href="/client/dashboard">
                    <DropdownMenuItem className="cursor-pointer gap-2">
                      <Briefcase className="w-4 h-4" />
                      Company Dashboard
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer gap-2 text-destructive focus:text-destructive"
                    onClick={handleCompanyLogout}
                  >
                    <LogOut className="w-4 h-4" />
                    Log Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : isJobSeekerAuthenticated && jobSeeker ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2.5 rounded-full px-2 py-1.5 transition-all duration-300 hover:bg-white/10 cursor-pointer">
                    <Avatar className="w-9 h-9 border-2 border-white/60 shadow-md">
                      {jobSeeker.photoUrl ? (
                        <AvatarImage
                          src={jobSeeker.photoUrl}
                          alt={jobSeeker.name}
                        />
                      ) : null}
                      <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-sm font-bold">
                        {jobSeekerInitials}
                      </AvatarFallback>
                    </Avatar>
                    <span
                      className={`hidden lg:inline font-semibold text-sm ${
                        scrolled ? "text-white" : "text-foreground"
                      }`}
                    >
                      {jobSeeker.name.split(" ")[0]}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 ${
                        scrolled ? "text-white/80" : "text-muted-foreground"
                      }`}
                    />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 mt-2">
<DropdownMenuLabel className="font-semibold">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-primary" />
                      <span className="truncate">{jobSeeker.name}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <Link href="/dashboard">
                    <DropdownMenuItem className="cursor-pointer gap-2">
                      <Briefcase className="w-4 h-4" />
                      My Dashboard
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/profile">
                    <DropdownMenuItem className="cursor-pointer gap-2">
                      <User className="w-4 h-4" />
                      Edit Your Profile
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/profile/applications">
                    <DropdownMenuItem className="cursor-pointer gap-2">
                      <Briefcase className="w-4 h-4" />
                      Your Applied Companies
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer gap-2 text-destructive focus:text-destructive"
                    onClick={handleJobSeekerLogout}
                  >
                    <LogOut className="w-4 h-4" />
                    Log Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : isAuthenticated ? (
              <Button
                onClick={() => logout()}
                className={`font-semibold transition-all duration-300 ${
                  scrolled
                    ? "bg-white text-primary hover:bg-white/90 shadow-lg"
                    : "bg-gradient-to-r from-primary to-accent text-white hover:shadow-lg"
                }`}
              >
                Sign Out
              </Button>
            ) : (
              <Button
                onClick={() => setAuthModalOpen(true)}
                className={`font-semibold transition-all duration-300 ${
                  scrolled
                    ? "bg-white text-primary hover:bg-white/90 shadow-lg"
                    : "bg-gradient-to-r from-primary to-accent text-white hover:shadow-lg"
                }`}
              >
                Sign In
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`md:hidden p-2 rounded-lg transition-all duration-300 ${
              scrolled
                ? "text-white hover:bg-white/10"
                : "text-foreground hover:bg-secondary/30"
            }`}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div
            className={`md:hidden border-t transition-all duration-300 ${
              scrolled
                ? "bg-gradient-to-r from-primary/95 to-primary/90 border-primary/30"
                : "bg-white border-secondary/20"
            }`}
          >
            <div className="container py-4 space-y-3">
              {navLinks.map(link => (
                <Link key={link.href} href={link.href}>
                  <span
                    className={`block py-2 px-4 rounded-lg font-medium transition-all duration-300 cursor-pointer ${
                      scrolled
                        ? isActive(link.href)
                          ? "bg-white/20 text-white"
                          : "text-white/70 hover:bg-white/10 hover:text-white"
                        : isActive(link.href)
                          ? "bg-primary/10 text-primary"
                          : "text-foreground/70 hover:bg-secondary/30 hover:text-primary"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </span>
                </Link>
              ))}

              {/* Mobile Find Work */}
              <div className="py-2">
                <button
                  onClick={() => setFindWorkDropdown(!findWorkDropdown)}
                  className={`w-full text-left py-2 px-4 rounded-lg font-medium transition-all duration-300 flex items-center justify-between ${
                    scrolled
                      ? "text-white/70 hover:bg-white/10 hover:text-white"
                      : "text-foreground/70 hover:bg-secondary/30 hover:text-primary"
                  }`}
                >
                  Find Work
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-300 ${
                      findWorkDropdown ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {findWorkDropdown && (
                  <div className="mt-2 space-y-1 pl-4">
                    {jobCategories.map(category => (
                      <Link key={category.href} href={category.href}>
                        <span
                          className={`block py-2 px-4 rounded-lg text-sm transition-all duration-300 cursor-pointer ${
                            scrolled
                              ? "text-white/60 hover:text-white hover:bg-white/10"
                              : "text-foreground/60 hover:text-primary hover:bg-primary/5"
                          }`}
                          onClick={() => {
                            setMobileMenuOpen(false);
                            setFindWorkDropdown(false);
                          }}
                        >
                          {category.label}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Mobile employer portal */}
              <Link
                href="/client/login"
                className={`block py-2 px-4 rounded-lg font-bold transition-all duration-300 ${
                  scrolled
                    ? "text-white hover:bg-white/10"
                    : "text-primary hover:bg-primary/10"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                EMPLOYERS
              </Link>

<div className="pt-2 border-t border-white/10">
                {isCompanyAuthenticated && company ? (
                  <>
                    {/* Company account options */}
                    <div
                      className={`flex items-center gap-3 px-4 py-3 mb-2 rounded-lg ${
                        scrolled ? "bg-white/10 text-white" : "bg-secondary/30"
                      }`}
                    >
                      <Avatar className="w-10 h-10 border-2 border-white/60">
                        {company.logoUrl ? (
                          <AvatarImage
                            src={company.logoUrl}
                            alt={company.name}
                            className="object-cover"
                          />
                        ) : null}
                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-accent text-white text-sm font-bold">
                          {companyInitials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate">
                          {company.name}
                        </p>
                        <p className="text-xs opacity-70 truncate">
                          {company.ownerEmail}
                        </p>
                      </div>
                    </div>
                    <Link href="/client/dashboard">
                      <span
                        className={`flex items-center gap-2 py-2 px-4 rounded-lg font-medium transition-all duration-300 cursor-pointer ${
                          scrolled
                            ? "text-white/70 hover:bg-white/10 hover:text-white"
                            : "text-foreground/70 hover:bg-secondary/30 hover:text-primary"
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Briefcase className="w-4 h-4" />
                        Company Dashboard
                      </span>
                    </Link>
                    <Button
                      onClick={handleCompanyLogout}
                      className="w-full mt-2 bg-gradient-to-r from-primary to-accent text-white font-semibold"
                    >
                      <LogOut className="w-4 h-4" />
                      Log Out
                    </Button>
                  </>
                ) : isJobSeekerAuthenticated && jobSeeker ? (
                  <>
                    {/* Job seeker profile options */}
                    <div
                      className={`flex items-center gap-3 px-4 py-3 mb-2 rounded-lg ${
                        scrolled ? "bg-white/10 text-white" : "bg-secondary/30"
                      }`}
                    >
                      <Avatar className="w-10 h-10 border-2 border-white/60">
                        {jobSeeker.photoUrl ? (
                          <AvatarImage
                            src={jobSeeker.photoUrl}
                            alt={jobSeeker.name}
                          />
                        ) : null}
                        <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-sm font-bold">
                          {jobSeekerInitials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate">
                          {jobSeeker.name}
                        </p>
                        <p className="text-xs opacity-70 truncate">
                          {jobSeeker.email}
                        </p>
                      </div>
                    </div>
<Link href="/dashboard">
                      <span
                        className={`flex items-center gap-2 py-2 px-4 rounded-lg font-medium transition-all duration-300 cursor-pointer ${
                          scrolled
                            ? "text-white/70 hover:bg-white/10 hover:text-white"
                            : "text-foreground/70 hover:bg-secondary/30 hover:text-primary"
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Briefcase className="w-4 h-4" />
                        My Dashboard
                      </span>
                    </Link>
                    <Link href="/profile">
                      <span
                        className={`flex items-center gap-2 py-2 px-4 rounded-lg font-medium transition-all duration-300 cursor-pointer ${
                          scrolled
                            ? "text-white/70 hover:bg-white/10 hover:text-white"
                            : "text-foreground/70 hover:bg-secondary/30 hover:text-primary"
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <User className="w-4 h-4" />
                        Edit Your Profile
                      </span>
                    </Link>
                    <Link href="/profile/applications">
                      <span
                        className={`flex items-center gap-2 py-2 px-4 rounded-lg font-medium transition-all duration-300 cursor-pointer ${
                          scrolled
                            ? "text-white/70 hover:bg-white/10 hover:text-white"
                            : "text-foreground/70 hover:bg-secondary/30 hover:text-primary"
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Briefcase className="w-4 h-4" />
                        Your Applied Companies
                      </span>
                    </Link>
                    <Button
                      onClick={handleJobSeekerLogout}
                      className="w-full mt-2 bg-gradient-to-r from-primary to-accent text-white font-semibold"
                    >
                      <LogOut className="w-4 h-4" />
                      Log Out
                    </Button>
                  </>
                ) : isAuthenticated ? (
                  <Button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full bg-gradient-to-r from-primary to-accent text-white font-semibold"
                  >
                    Sign Out
                  </Button>
                ) : (
                  <Button
                    onClick={() => {
                      setAuthModalOpen(true);
                      setMobileMenuOpen(false);
                    }}
                    className="w-full bg-gradient-to-r from-primary to-accent text-white font-semibold"
                  >
                    Sign In
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </>
  );
}
