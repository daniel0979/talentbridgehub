import { useJobSeekerAuth } from "@/_core/hooks/useJobSeekerAuth";
import PageLayout from "@/components/PageLayout";
import Container from "@/components/Container";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  User,
  Briefcase,
  MapPin,
  Mail,
  Phone,
  FileText,
  ArrowRight,
  Sparkles,
  Send,
  Pencil,
  Tag,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

const statusStyles: Record<string, string> = {
  submitted: "bg-amber-100 text-amber-700 border-amber-200",
  reviewed: "bg-blue-100 text-blue-700 border-blue-200",
  shortlisted: "bg-purple-100 text-purple-700 border-purple-200",
  interview: "bg-cyan-100 text-cyan-700 border-cyan-200",
  offered: "bg-green-100 text-green-700 border-green-200",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
};

function getInitials(name: string) {
  return (name || "U")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatDate(value: Date | string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function JobSeekerDashboard() {
  const { jobSeeker, loading } = useJobSeekerAuth();
  const [, setLocation] = useLocation();

  const applicationsQuery = trpc.jobSeeker.applications.mine.useQuery(undefined, {
    enabled: Boolean(jobSeeker),
  });
  const applications = applicationsQuery.data ?? [];

  if (loading) {
    return (
      <PageLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <p className="text-muted-foreground">Loading your dashboard…</p>
        </div>
      </PageLayout>
    );
  }

  if (!jobSeeker) {
    return (
      <PageLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-2xl font-bold text-foreground mb-3">
            Sign in to view your dashboard
          </h1>
          <p className="text-muted-foreground mb-6">
            Please sign in or create an account to access your job seeker
            dashboard.
          </p>
          <Button
            onClick={() => setLocation("/")}
            className="bg-gradient-to-r from-primary to-accent text-white font-semibold"
          >
            Go to Home
          </Button>
        </div>
      </PageLayout>
    );
  }

  const activeCount = applications.filter(
    (a) => a.status !== "rejected"
  ).length;
  const interviewCount = applications.filter(
    (a) => a.status === "interview" || a.status === "offered"
  ).length;

  return (
    <PageLayout>
      <section className="relative py-14 md:py-18 bg-gradient-to-br from-white via-secondary/10 to-primary/8 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/15 to-accent/10 rounded-full blur-3xl -mr-48 -mt-48" />
        <Container className="relative z-10">
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center gap-6 mb-8">
              <Avatar className="h-20 w-20 rounded-2xl border-2 border-primary/30 shadow-xl shrink-0">
                {jobSeeker.photoUrl ? (
                  <AvatarImage
                    src={jobSeeker.photoUrl}
                    alt={jobSeeker.name}
                    className="object-cover"
                  />
                ) : null}
                <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-primary to-accent text-white">
                  {getInitials(jobSeeker.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary font-semibold px-4 py-1.5 rounded-full mb-3">
                  <User className="w-4 h-4" />
                  Job Seeker Dashboard
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-1">
                  Welcome, {jobSeeker.name.split(" ")[0]}!
                </h1>
                <p className="text-muted-foreground">
                  {jobSeeker.headline || "Manage your profile and track your applications."}
                </p>
              </div>
              <Link href="/profile">
                <Button className="bg-gradient-to-r from-primary to-accent text-white font-bold px-6 py-3 rounded-xl hover:shadow-lg hover:shadow-primary/40 transition-all duration-300 transform hover:scale-105 active:scale-95 shrink-0">
                  <Pencil className="w-4 h-4" />
                  Edit Profile
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
              <Card className="p-6 bg-white border-2 border-secondary/20">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center text-white">
                    <Send className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-foreground">
                      {applicationsQuery.isLoading ? (
                        <Skeleton className="h-8 w-12" />
                      ) : (
                        applications.length
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Total Applications
                    </p>
                  </div>
                </div>
              </Card>
              <Card className="p-6 bg-white border-2 border-secondary/20">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl flex items-center justify-center text-primary">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-foreground">
                      {applicationsQuery.isLoading ? (
                        <Skeleton className="h-8 w-12" />
                      ) : (
                        activeCount
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground">Active</p>
                  </div>
                </div>
              </Card>
              <Card className="p-6 bg-white border-2 border-secondary/20">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-accent/30 to-primary/30 rounded-xl flex items-center justify-center text-accent">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-foreground">
                      {applicationsQuery.isLoading ? (
                        <Skeleton className="h-8 w-12" />
                      ) : (
                        interviewCount
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Interview / Offer
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Profile summary */}
              <div className="space-y-6">
                <Card className="p-6 bg-white border-2 border-primary/20">
                  <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" />
                    Profile Summary
                  </h2>
                  <div className="space-y-3 text-sm">
                    <p className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="w-4 h-4 text-primary shrink-0" />
                      <span className="truncate">{jobSeeker.email}</span>
                    </p>
                    {jobSeeker.phone && (
                      <p className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="w-4 h-4 text-primary shrink-0" />
                        {jobSeeker.phone}
                      </p>
                    )}
                    {jobSeeker.location && (
                      <p className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="w-4 h-4 text-primary shrink-0" />
                        {jobSeeker.location}
                      </p>
                    )}
                    {jobSeeker.desiredCategory && (
                      <p className="flex items-center gap-2 text-muted-foreground">
                        <Tag className="w-4 h-4 text-accent shrink-0" />
                        {jobSeeker.desiredCategory}
                      </p>
                    )}
                    {jobSeeker.resumeUrl && (
                      <a
                        href={jobSeeker.resumeUrl}
                        download
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 text-primary hover:text-accent transition-colors font-medium"
                      >
                        <FileText className="w-4 h-4 shrink-0" />
                        View saved resume
                      </a>
                    )}
                  </div>
                  {jobSeeker.skills && jobSeeker.skills.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-secondary/20">
                      <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                        Skills
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {jobSeeker.skills.slice(0, 6).map((skill) => (
                          <span
                            key={skill}
                            className="inline-flex items-center gap-1 rounded-md bg-primary/10 text-primary px-2 py-1 text-xs font-medium"
                          >
                            <Sparkles className="w-3 h-3" />
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              </div>

              {/* Recent applications */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-foreground">
                    Recent Applications
                  </h2>
                  <Link href="/profile/applications">
                    <span className="text-sm font-medium text-primary hover:text-accent flex items-center gap-1 transition-colors">
                      View all
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </Link>
                </div>

                {applicationsQuery.isLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Card key={i} className="p-5 border-2 border-secondary/20">
                        <Skeleton className="h-5 w-2/3 mb-3" />
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-1/2" />
                      </Card>
                    ))}
                  </div>
                ) : applications.length > 0 ? (
                  <div className="space-y-4">
                    {applications.slice(0, 3).map((app) => (
                      <Card
                        key={app.id}
                        className="p-5 bg-white border-2 border-secondary/20 hover:border-primary/40 hover:shadow-lg transition-all duration-300 group"
                      >
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                          <div>
                            <h3 className="font-semibold text-foreground">
                              {app.jobTitle}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-0.5">
                              {app.companyName}
                              {app.jobLocation ? ` · ${app.jobLocation}` : ""}
                            </p>
                          </div>
                          <Badge
                            className={`${
                              statusStyles[app.status] ??
                              "bg-secondary text-muted-foreground"
                            } border shrink-0 capitalize`}
                          >
                            {app.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-3">
                          Applied {formatDate(app.createdAt)}
                        </p>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="p-10 text-center bg-white border-2 border-secondary/20">
                    <div className="w-14 h-14 mx-auto bg-gradient-to-br from-primary/10 to-accent/10 rounded-full flex items-center justify-center mb-4">
                      <Send className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-2">
                      No applications yet
                    </h3>
                    <p className="text-muted-foreground mb-5 text-sm">
                      Browse jobs and apply to start tracking them here.
                    </p>
                    <Link href="/jobs">
                      <Button className="bg-gradient-to-r from-primary to-accent text-white font-semibold px-6 rounded-lg hover:shadow-lg transition-all duration-300">
                        Browse Jobs
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </Container>
      </section>
    </PageLayout>
  );
}
