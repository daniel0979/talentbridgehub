import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Briefcase,
  Building2,
  CheckCircle2,
  Clock,
  Users,
  Plus,
  UserCog,
  ArrowRight,
  LayoutDashboard,
  Star,
  MapPin,
  DollarSign,
  Eye,
} from "lucide-react";
import { Link } from "wouter";
import { useCompanyAuth } from "@/_core/hooks/useCompanyAuth";

function formatRelative(date: Date | string | null | undefined) {
  if (!date) return "—";
  const d = new Date(date);
  const diff = Date.now() - d.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function statusBadgeClass(status: string) {
  if (status === "approved") return "bg-green-100 text-green-700 border-green-200";
  if (status === "pending") return "bg-amber-100 text-amber-700 border-amber-200";
  if (status === "rejected") return "bg-destructive/10 text-destructive border-destructive/30";
  return "bg-secondary text-muted-foreground border-secondary";
}

export default function ClientDashboard() {
  const { company } = useCompanyAuth();
  const jobsQuery = trpc.company.jobs.mine.useQuery();
  const jobs = jobsQuery.data ?? [];
  const applicationsQuery = trpc.company.applications.forCompany.useQuery();
  const applications = applicationsQuery.data ?? [];

  const companyName = company?.name ?? "Your Company";
  const companyLogo = company?.logoUrl ?? null;
  const initials = (companyName.split(" ").map((n) => n[0]).slice(0, 2).join("") || "C").toUpperCase();

  const approvedJobs = jobs.filter((j) => j.status === "approved");
  const pendingJobs = jobs.filter((j) => j.status === "pending");
  const recentJobs = jobs.slice(0, 3);

  const quickActions = [
    {
      label: "Post a New Job",
      description: "Create a new job posting",
      href: "/client/dashboard/jobs",
      icon: Plus,
      color: "from-primary to-accent",
    },
    {
      label: "View Applicants",
      description: "Review applications you've received",
      href: "/client/dashboard/applicants",
      icon: Users,
      color: "from-purple-500 to-indigo-500",
    },
    {
      label: "Edit Company Profile",
      description: "Update your logo and company info",
      href: "/client/dashboard/profile",
      icon: UserCog,
      color: "from-pink-500 to-orange-500",
    },
    {
      label: "Leave a Review",
      description: "Share feedback about JobSeeker",
      href: "/client/dashboard/reviews",
      icon: Star,
      color: "from-green-500 to-teal-500",
    },
  ];

  return (
    <>
      {/* Welcome header */}
      <section className="relative py-10 md:py-14 bg-gradient-to-br from-white via-secondary/10 to-primary/8 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/15 to-accent/10 rounded-full blur-3xl -mr-48 -mt-48" />
        <div className="container relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-primary/30 shadow-lg">
                {companyLogo ? (
                  <AvatarImage src={companyLogo} alt={companyName} className="object-contain bg-white" />
                ) : null}
                <AvatarFallback className="text-xl font-bold bg-gradient-to-br from-primary to-accent text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary font-semibold px-4 py-1.5 rounded-full mb-3">
                  <LayoutDashboard className="w-4 h-4" />
                  Company Dashboard
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                  Welcome back, {companyName}
                </h1>
                <p className="text-muted-foreground">
                  Here's your company hiring at a glance.
                </p>
              </div>
            </div>
            <Link href="/client/dashboard/jobs">
              <Button className="bg-gradient-to-r from-primary to-accent text-white font-bold px-6 py-3 rounded-xl hover:shadow-lg hover:shadow-primary/40 transition-all duration-300 transform hover:scale-105 active:scale-95 shrink-0">
                <Plus className="w-4 h-4" />
                Post a New Job
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-8 bg-gradient-to-b from-secondary/5 to-background border-b border-secondary/20">
        <div className="container">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 bg-white border-2 border-secondary/20">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center text-white">
                  <Briefcase className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-foreground">
                    {jobsQuery.isLoading ? <Skeleton className="h-8 w-12" /> : jobs.length}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Jobs</p>
                </div>
              </div>
            </Card>
            <Card className="p-6 bg-white border-2 border-secondary/20">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-700">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-foreground">
                    {jobsQuery.isLoading ? <Skeleton className="h-8 w-12" /> : approvedJobs.length}
                  </p>
                  <p className="text-sm text-muted-foreground">Approved Jobs</p>
                </div>
              </div>
            </Card>
            <Card className="p-6 bg-white border-2 border-secondary/20">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-amber-700">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-foreground">
                    {jobsQuery.isLoading ? <Skeleton className="h-8 w-12" /> : pendingJobs.length}
                  </p>
                  <p className="text-sm text-muted-foreground">Pending Review</p>
                </div>
              </div>
            </Card>
            <Card className="p-6 bg-white border-2 border-secondary/20">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-700">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-foreground">
                    {applicationsQuery.isLoading ? <Skeleton className="h-8 w-12" /> : applications.length}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Applicants</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-12 bg-gradient-to-b from-background to-secondary/10">
        <div className="container grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent job postings */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-1">
                  Recent Job Postings
                </h2>
                <p className="text-muted-foreground text-sm">
                  Your latest job listings and their status
                </p>
              </div>
              <Link
                href="/client/dashboard/jobs"
                className="inline-flex items-center gap-1 text-primary hover:text-accent font-semibold text-sm transition-colors duration-300"
              >
                View all
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {jobsQuery.isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="p-5 border-2 border-secondary/20">
                    <Skeleton className="h-5 w-2/3 mb-3" />
                    <Skeleton className="h-4 w-full" />
                  </Card>
                ))}
              </div>
            ) : jobs.length > 0 ? (
              <div className="space-y-4">
                {recentJobs.map((job) => (
                  <Card
                    key={job.id}
                    className="p-5 hover:shadow-xl transition-all duration-300 hover:border-primary/50 group bg-white border-2 border-secondary/20"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <Avatar className="h-10 w-10 border border-secondary/30 shrink-0">
                            {companyLogo ? (
                              <AvatarImage src={companyLogo} alt={companyName} className="object-contain bg-white" />
                            ) : null}
                            <AvatarFallback className="text-xs font-bold bg-gradient-to-br from-primary to-accent text-white">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors duration-300">
                            {job.title}
                          </h3>
                        </div>
                        <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-muted-foreground">
                          {job.location && (
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-primary" />
                              {job.location}
                            </span>
                          )}
                          {job.salaryRange && (
                            <span className="inline-flex items-center gap-1">
                              <DollarSign className="w-3.5 h-3.5 text-accent" />
                              {job.salaryRange}
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1 text-xs">
                            <Clock className="w-3.5 h-3.5 text-purple-500" />
                            {formatRelative(job.createdAt)}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-3 shrink-0">
                        <Badge variant="secondary" className={statusBadgeClass(job.status)}>
                          {job.status}
                        </Badge>
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <Eye className="w-3.5 h-3.5" />
                          {job.applicationCount ?? 0} application{job.applicationCount === 1 ? "" : "s"}
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-10 text-center bg-white border-2 border-secondary/20">
                <div className="w-14 h-14 mx-auto bg-gradient-to-br from-primary/10 to-accent/10 rounded-full flex items-center justify-center mb-4">
                  <Briefcase className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">
                  No jobs posted yet
                </h3>
                <p className="text-muted-foreground mb-6">
                  Post your first job to start attracting top talent.
                </p>
                <Link href="/client/dashboard/jobs">
                  <Button className="bg-gradient-to-r from-primary to-accent text-white font-semibold px-6 rounded-lg hover:shadow-lg transition-all duration-300">
                    <Plus className="w-4 h-4" />
                    Go to Job Postings
                  </Button>
                </Link>
              </Card>
            )}
          </div>

          {/* Quick actions */}
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-6">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {quickActions.map((action, idx) => (
                <Link key={action.href} href={action.href}>
                  <Card
                    className="p-5 hover:shadow-xl transition-all duration-300 hover:border-primary/50 hover:-translate-y-1 cursor-pointer group bg-white border-2 border-secondary/20 h-full animate-in fade-in slide-in-from-bottom-3 duration-700"
                    style={{ animationDelay: `${idx * 75}ms` }}
                  >
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center text-white mb-3 group-hover:scale-110 transition-transform duration-300`}>
                      <action.icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
                      {action.label}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {action.description}
                    </p>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

