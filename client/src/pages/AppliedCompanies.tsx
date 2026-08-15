import { useJobSeekerAuth } from "@/_core/hooks/useJobSeekerAuth";
import PageLayout from "@/components/PageLayout";
import Container from "@/components/Container";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Briefcase,
  Building2,
  MapPin,
  CheckCircle2,
  Clock,
  Send,
  ArrowRight,
  FileText,
  XCircle,
} from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const statusStyles: Record<string, string> = {
  submitted: "bg-amber-100 text-amber-700 border-amber-200",
  reviewed: "bg-blue-100 text-blue-700 border-blue-200",
  shortlisted: "bg-purple-100 text-purple-700 border-purple-200",
  interview: "bg-cyan-100 text-cyan-700 border-cyan-200",
  offered: "bg-green-100 text-green-700 border-green-200",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
};

function getInitials(name: string) {
  return (name || "C")
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

export default function AppliedCompanies() {
  const { jobSeeker, loading } = useJobSeekerAuth();
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();

  const applicationsQuery = trpc.jobSeeker.applications.mine.useQuery(undefined, {
    enabled: Boolean(jobSeeker),
  });
  const applications = applicationsQuery.data ?? [];

  const withdrawMutation = trpc.jobSeeker.applications.withdraw.useMutation({
    onSuccess: async () => {
      toast.success("Application withdrawn.");
      await utils.jobSeeker.applications.mine.invalidate();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to withdraw application.");
    },
  });

  const handleWithdraw = (id: number, jobTitle: string) => {
    if (!window.confirm(`Withdraw your application for "${jobTitle}"?`)) return;
    withdrawMutation.mutate({ id });
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <p className="text-muted-foreground">Loading your applications…</p>
        </div>
      </PageLayout>
    );
  }

  if (!jobSeeker) {
    return (
      <PageLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-2xl font-bold text-foreground mb-3">
            Sign in to view your applications
          </h1>
          <p className="text-muted-foreground mb-6">
            Please sign in or create an account to see the jobs you've applied
            to.
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

  return (
    <PageLayout>
      <section className="relative py-14 md:py-18 bg-gradient-to-br from-white via-secondary/10 to-primary/8 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/15 to-accent/10 rounded-full blur-3xl -mr-48 -mt-48" />
        <Container className="relative z-10">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary font-semibold px-4 py-1.5 rounded-full mb-4">
                <Briefcase className="w-4 h-4" />
                Your Applications
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                Jobs You've{" "}
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Applied To
                </span>
              </h1>
              <p className="text-muted-foreground">
                Track the status of every application you've submitted.
              </p>
            </div>

            {applicationsQuery.isLoading ? (
              <div className="space-y-5">
                {Array.from({ length: 2 }).map((_, i) => (
                  <Card key={i} className="p-6 border-2 border-secondary/20">
                    <Skeleton className="h-6 w-2/3 mb-3" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </Card>
                ))}
              </div>
            ) : applications.length > 0 ? (
              <div className="space-y-5">
                {applications.map((app) => (
                  <Card
                    key={app.id}
                    className="p-6 bg-white border-2 border-secondary/20 hover:border-primary/40 hover:shadow-xl transition-all duration-300 group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-lg shadow-lg shrink-0 group-hover:scale-110 transition-transform duration-300">
                        {getInitials(app.companyName)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                          <div>
                            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                              <Building2 className="w-4 h-4 text-primary" />
                              {app.companyName}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-0.5">
                              {app.jobTitle}
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

                        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-4 text-sm text-muted-foreground">
                          {app.jobLocation && (
                            <span className="flex items-center gap-1.5">
                              <MapPin className="w-4 h-4 text-primary" />
                              {app.jobLocation}
                            </span>
                          )}
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-accent" />
                            Applied {formatDate(app.createdAt)}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-secondary/20">
                          {app.resumeUrl && (
                            <a
                              href={app.resumeUrl}
                              download
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-accent transition-colors"
                            >
                              <FileText className="w-4 h-4" />
                              View Resume
                            </a>
                          )}
                          {app.coverLetter && (
                            <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                              <FileText className="w-4 h-4" />
                              Cover letter attached
                            </span>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleWithdraw(app.id, app.jobTitle)}
                            disabled={withdrawMutation.isPending}
                            className="ml-auto border-2 border-destructive/30 text-destructive hover:border-destructive/50 hover:bg-destructive/5 transition-colors duration-300"
                          >
                            <XCircle className="w-4 h-4" />
                            Withdraw
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-10 text-center bg-white border-2 border-secondary/20">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary/10 to-accent/10 rounded-full flex items-center justify-center mb-4">
                  <Send className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  No applications yet
                </h3>
                <p className="text-muted-foreground mb-6">
                  Browse jobs and apply to start tracking your applications
                  here.
                </p>
                <Button
                  onClick={() => setLocation("/jobs")}
                  className="bg-gradient-to-r from-primary to-accent text-white font-semibold px-6 rounded-lg hover:shadow-lg transition-all duration-300"
                >
                  Browse Jobs
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Card>
            )}

            <div className="mt-8 flex items-center gap-3 p-4 rounded-xl bg-green-50 border border-green-200 text-green-700">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              Your applications are tracked here. We'll notify you when a
              company responds.
            </div>
          </div>
        </Container>
      </section>
    </PageLayout>
  );
}
