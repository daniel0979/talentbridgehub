import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  Mail,
  Phone,
  MapPin,
  FileText,
  MessageSquare,
  Layers,
  Briefcase,
  Send,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

const STATUS_OPTIONS = [
  "submitted",
  "reviewed",
  "shortlisted",
  "interview",
  "offered",
  "rejected",
] as const;

const statusStyles: Record<string, string> = {
  submitted: "bg-amber-100 text-amber-700 border-amber-200",
  reviewed: "bg-blue-100 text-blue-700 border-blue-200",
  shortlisted: "bg-purple-100 text-purple-700 border-purple-200",
  interview: "bg-cyan-100 text-cyan-700 border-cyan-200",
  offered: "bg-green-100 text-green-700 border-green-200",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
};

function getInitials(name: string) {
  return (name || "A")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function parseSkills(skills: string | null | undefined): string[] {
  if (!skills) return [];
  try {
    const parsed = JSON.parse(skills);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function formatDate(value: Date | string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function CompanyApplicants() {
  const utils = trpc.useUtils();
  const applicantsQuery = trpc.company.applications.forCompany.useQuery();
  const applicants = applicantsQuery.data ?? [];

  const [statusFilter, setStatusFilter] = useState("all");
  const [jobFilter, setJobFilter] = useState("all");

  const jobs = useMemo(() => {
    const map = new Map<number, string>();
    applicants.forEach((a) => map.set(a.jobId, a.jobTitle));
    return Array.from(map.entries()).map(([id, title]) => ({ id, title }));
  }, [applicants]);

  const filtered = applicants.filter((app) => {
    if (statusFilter !== "all" && app.status !== statusFilter) return false;
    if (jobFilter !== "all" && app.jobId !== Number(jobFilter)) return false;
    return true;
  });

  const updateMutation = trpc.company.applications.updateStatus.useMutation({
    onSuccess: async () => {
      toast.success("Application status updated.");
      await utils.company.applications.forCompany.invalidate();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to update status.");
    },
  });

const handleStatusChange = (
    appId: number,
    status: (typeof STATUS_OPTIONS)[number]
  ) => {
    updateMutation.mutate({ id: appId, status });
  };

  const counts = useMemo(() => {
    const submitted = applicants.filter((a) => a.status === "submitted").length;
    const interviewing = applicants.filter(
      (a) => a.status === "interview" || a.status === "offered"
    ).length;
    const shortlisted = applicants.filter(
      (a) => a.status === "shortlisted"
    ).length;
    return { submitted, interviewing, shortlisted };
  }, [applicants]);

  return (
    <>
      {/* Header */}
      <section className="relative py-12 md:py-16 bg-gradient-to-br from-white via-secondary/10 to-primary/8 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/15 to-accent/10 rounded-full blur-3xl -mr-48 -mt-48" />
        <div className="container relative z-10">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary font-semibold px-4 py-1.5 rounded-full mb-4">
            <Users className="w-4 h-4" />
            Applicants
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Review Job Applicants
          </h1>
          <p className="text-muted-foreground">
            View resumes, cover letters, and manage the status of every
            application you receive.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-8 bg-gradient-to-b from-secondary/5 to-background border-b border-secondary/20">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 bg-white border-2 border-secondary/20">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center text-white">
                  <Send className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-foreground">
                    {applicantsQuery.isLoading ? (
                      <Skeleton className="h-8 w-12" />
                    ) : (
                      applicants.length
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
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center text-white">
                  <Layers className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-foreground">
                    {applicantsQuery.isLoading ? (
                      <Skeleton className="h-8 w-12" />
                    ) : (
                      counts.submitted
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground">New</p>
                </div>
              </div>
            </Card>
            <Card className="p-6 bg-white border-2 border-secondary/20">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-accent rounded-xl flex items-center justify-center text-white">
                  <Briefcase className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-foreground">
                    {applicantsQuery.isLoading ? (
                      <Skeleton className="h-8 w-12" />
                    ) : (
                      counts.interviewing
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Interview / Offer
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 bg-white border-b border-secondary/20">
        <div className="container">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <p className="text-sm font-semibold text-muted-foreground mb-2">
                Filter by Status
              </p>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full border-2 border-secondary/30 focus:border-primary/50 rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s} className="capitalize">
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-muted-foreground mb-2">
                Filter by Job
              </p>
              <Select value={jobFilter} onValueChange={setJobFilter}>
                <SelectTrigger className="w-full border-2 border-secondary/30 focus:border-primary/50 rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All jobs</SelectItem>
                  {jobs.map((job) => (
                    <SelectItem key={job.id} value={String(job.id)}>
                      {job.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Applications list */}
      <section className="py-12 bg-gradient-to-b from-background to-secondary/10">
        <div className="container">
          <h2 className="text-2xl font-bold text-foreground mb-6">
            Applications ({filtered.length})
          </h2>

          {applicantsQuery.isLoading ? (
            <div className="space-y-5">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="p-6 border-2 border-secondary/20">
                  <Skeleton className="h-6 w-1/3 mb-4" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </Card>
              ))}
            </div>
          ) : filtered.length > 0 ? (
            <div className="space-y-5">
              {filtered.map((app) => {
                const skills = parseSkills(app.seekerSkills);
                return (
                  <Card
                    key={app.id}
                    className="p-6 bg-white border-2 border-secondary/20 hover:border-primary/40 hover:shadow-xl transition-all duration-300 group"
                  >
                    <div className="flex items-start gap-4">
                      <Avatar className="h-14 w-14 rounded-xl border-2 border-secondary/30 shadow shrink-0">
                        {app.seekerPhoto ? (
                          <AvatarImage
                            src={app.seekerPhoto}
                            alt={app.seekerName}
                            className="object-cover"
                          />
                        ) : null}
                        <AvatarFallback className="font-bold bg-gradient-to-br from-primary to-accent text-white">
                          {getInitials(app.seekerName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                          <div>
                            <h3 className="text-lg font-semibold text-foreground">
                              {app.seekerName}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-0.5">
                              Applied for{" "}
                              <span className="font-medium text-foreground">
                                {app.jobTitle}
                              </span>
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              className={`${
                                statusStyles[app.status] ??
                                "bg-secondary text-muted-foreground"
                              } border capitalize shrink-0`}
                            >
                              {app.status}
                            </Badge>
                            <Select
                              value={app.status}
onValueChange={(v) =>
                                handleStatusChange(
                                  app.id,
                                  v as (typeof STATUS_OPTIONS)[number]
                                )
                              }
                            >
                              <SelectTrigger className="w-36 h-8 border-2 border-secondary/30 focus:border-primary/50 rounded-lg text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {STATUS_OPTIONS.map((s) => (
                                  <SelectItem key={s} value={s} className="capitalize">
                                    {s}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {/* Contact + info */}
                        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <Mail className="w-4 h-4 text-primary" />
                            {app.seekerEmail}
                          </span>
                          {app.seekerPhone && (
                            <span className="flex items-center gap-1.5">
                              <Phone className="w-4 h-4 text-primary" />
                              {app.seekerPhone}
                            </span>
                          )}
                          {app.seekerLocation && (
                            <span className="flex items-center gap-1.5">
                              <MapPin className="w-4 h-4 text-accent" />
                              {app.seekerLocation}
                            </span>
                          )}
                          <span className="flex items-center gap-1.5">
                            <Send className="w-4 h-4 text-accent" />
                            Applied {formatDate(app.createdAt)}
                          </span>
                        </div>

                        {app.seekerHeadline && (
                          <p className="text-sm text-foreground/70 mt-3">
                            {app.seekerHeadline}
                          </p>
                        )}

                        {skills.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {skills.slice(0, 6).map((skill) => (
                              <span
                                key={skill}
                                className="inline-flex items-center rounded-md bg-primary/10 text-primary px-2 py-0.5 text-xs font-medium"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Resume + cover letter */}
                        <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-secondary/20">
                          {app.resumeUrl ? (
                            <a
                              href={app.resumeUrl}
                              download
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-accent transition-colors"
                            >
                              <FileText className="w-4 h-4" />
                              View Resume / CV
                            </a>
                          ) : (
                            <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                              <FileText className="w-4 h-4" />
                              No resume attached
                            </span>
                          )}
                          {app.seekerResume && app.seekerResume !== app.resumeUrl && (
                            <a
                              href={app.seekerResume}
                              download
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-accent transition-colors"
                            >
                              <FileText className="w-4 h-4" />
                              Profile Resume
                            </a>
                          )}
                        </div>

                        {app.coverLetter && (
                          <div className="mt-4 p-4 rounded-lg bg-secondary/10 border border-secondary/20">
                            <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1.5 uppercase tracking-wide">
                              <MessageSquare className="w-3.5 h-3.5" />
                              Cover Letter
                            </p>
                            <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line line-clamp-4">
                              {app.coverLetter}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="p-10 text-center bg-white border-2 border-secondary/20">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary/10 to-accent/10 rounded-full flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                No applications found
              </h3>
              <p className="text-muted-foreground">
                {applicants.length === 0
                  ? "You haven't received any applications yet."
                  : "Try adjusting your filters."}
              </p>
            </Card>
          )}
        </div>
      </section>
    </>
  );
}
