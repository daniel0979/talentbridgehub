import PageLayout from "@/components/PageLayout";
import Container from "@/components/Container";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import AuthModal from "@/components/AuthModal";
import ApplyJobDialog from "@/components/ApplyJobDialog";
import { useJobSeekerAuth } from "@/_core/hooks/useJobSeekerAuth";
import {
  MapPin,
  Briefcase,
  DollarSign,
  Clock,
  Building2,
  ArrowLeft,
  ArrowRight,
  Calendar,
  CheckCircle2,
  UserPlus,
  Send,
} from "lucide-react";
import { Link, useParams } from "wouter";
import { useState } from "react";

function getInitials(name: string) {
  return (name || "C").split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

export default function JobDetail() {
  const params = useParams();
const jobId = Number(params.id);
  const { isAuthenticated, loading } = useJobSeekerAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);

  const jobQuery = trpc.jobs.byId.useQuery(
    { id: jobId },
    { enabled: !Number.isNaN(jobId) }
  );

  const similarJobsQuery = trpc.jobs.search.useQuery(
    { limit: 100 },
    { enabled: !Number.isNaN(jobId) }
  );

  const job = jobQuery.data;

  if (Number.isNaN(jobId) || jobQuery.isError) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground mb-4">Job Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The job you're looking for doesn't exist or has been removed.
            </p>
            <Link href="/jobs">
              <Button className="bg-gradient-to-r from-primary to-accent text-white font-semibold px-6 rounded-lg hover:shadow-lg transition-all duration-300">
                <ArrowLeft className="w-4 h-4" />
                Back to Jobs
              </Button>
            </Link>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (jobQuery.isLoading || !job) {
    return (
      <PageLayout>
        <div className="container py-20 space-y-8">
          <Skeleton className="h-8 w-40" />
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <Skeleton className="h-20 w-20 rounded-2xl" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-8 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Guests must create an account before viewing job details.
  if (!loading && !isAuthenticated) {
    return (
      <PageLayout>
        <section className="relative py-20 bg-gradient-to-br from-white via-secondary/10 to-primary/8 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/15 to-accent/10 rounded-full blur-3xl -mr-48 -mt-48" />
          <Container className="relative z-10">
            <div className="max-w-xl mx-auto text-center">
              <Card className="p-10 bg-white border-2 border-primary/20 shadow-2xl rounded-2xl">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg">
                  <UserPlus className="w-8 h-8" />
                </div>
                <h1 className="text-3xl font-bold text-foreground mb-3">
                  Create an Account to View This Job
                </h1>
                <p className="text-muted-foreground mb-8 leading-relaxed">
                  You need a JobSeeker account to see job details and apply.
                  It takes less than a minute to sign up.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    onClick={() => setAuthModalOpen(true)}
                    className="bg-gradient-to-r from-primary to-accent text-white font-bold px-8 py-3 rounded-xl hover:shadow-lg hover:shadow-primary/40 transition-all duration-300 transform hover:scale-105 active:scale-95"
                  >
                    Create Account / Sign In
                  </Button>
                  <Link href="/jobs">
                    <Button
                      variant="outline"
                      className="border-2 border-primary/30 text-primary hover:border-primary/50 hover:bg-primary/5 font-semibold px-8 py-3 rounded-xl transition-all duration-300"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back to Jobs
                    </Button>
                  </Link>
                </div>
              </Card>
            </div>
          </Container>
        </section>
        <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
      </PageLayout>
    );
  }

  const similarJobs = (similarJobsQuery.data ?? [])
    .filter((j) => j.id !== job.id)
    .slice(0, 3);

  return (
    <PageLayout>
      {/* Header */}
      <section className="relative py-16 bg-gradient-to-br from-white via-secondary/10 to-primary/8 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/15 to-accent/10 rounded-full blur-3xl -mr-48 -mt-48" />
        <Container className="relative z-10">
          <Link
            href="/jobs"
            className="inline-flex items-center gap-2 text-primary hover:text-accent font-medium mb-8 transition-colors duration-300"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to all jobs
          </Link>

          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <Avatar className="h-20 w-20 rounded-2xl border-2 border-secondary/30 shadow-xl shrink-0">
              {job.logoUrl ? (
                <AvatarImage src={job.logoUrl} alt={job.company} className="object-contain bg-white" />
              ) : null}
              <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-primary to-accent text-white">
                {getInitials(job.company)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                  {job.title}
                </h1>
                {job.jobType && (
                  <Badge
                    variant="secondary"
                    className="bg-gradient-to-r from-primary/20 to-accent/20 text-primary border-primary/30 px-3 py-1"
                  >
                    {job.jobType}
                  </Badge>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-muted-foreground">
                <span className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-primary" />
                  {job.company}
                </span>
                {job.location && (
                  <span className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    {job.location}
                  </span>
                )}
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-purple-500" />
                  Posted {job.postedAt ? new Date(job.postedAt).toLocaleDateString() : "recently"}
                </span>
              </div>
            </div>
<Button
              onClick={() => setApplyDialogOpen(true)}
              className="bg-gradient-to-r from-primary to-accent text-white font-bold px-8 py-3 rounded-xl hover:shadow-lg hover:shadow-primary/40 transition-all duration-300 transform hover:scale-105 active:scale-95 shrink-0"
            >
              Apply Now
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </Container>
      </section>

      {/* Body */}
      <section className="py-16 bg-background">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Job description */}
              <Card className="p-8 bg-white border-2 border-secondary/20">
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  Job Description
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-6 whitespace-pre-line">
                  {job.description || "No description provided."}
                </p>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  {job.company} is looking for a talented {job.title} to join a
                  dynamic and collaborative team. In this role, you'll work with
                  cross-functional partners to deliver high-impact results and
                  help shape the future of the company.
                </p>

{job.responsibilities && job.responsibilities.length > 0 && (
                  <>
                    <h3 className="text-xl font-bold text-foreground mb-4">
                      Key Responsibilities
                    </h3>
                    <ul className="space-y-3 mb-6">
                      {job.responsibilities.map((item: string, idx: number) => (
                        <li
                          key={idx}
                          className="flex items-start gap-3 text-muted-foreground"
                        >
                          <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </>
                )}

                {job.requirements && job.requirements.length > 0 && (
                  <>
                    <h3 className="text-xl font-bold text-foreground mb-4">
                      Requirements
                    </h3>
                    <ul className="space-y-3">
                      {job.requirements.map((item: string, idx: number) => (
                        <li
                          key={idx}
                          className="flex items-start gap-3 text-muted-foreground"
                        >
                          <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </Card>

              {/* Similar jobs */}
              {similarJobs.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-6">
                    Similar Jobs
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {similarJobs.map((similar) => (
                      <Link key={similar.id} href={`/jobs/${similar.id}`}>
                        <Card className="p-5 hover:shadow-xl transition-all duration-300 hover:border-primary/50 hover:-translate-y-1 cursor-pointer group bg-gradient-to-br from-white to-secondary/5 border-2 border-secondary/20 h-full">
                          <div className="flex items-center gap-3 mb-3">
                            <Avatar className="h-10 w-10 rounded-lg border shrink-0">
                              {similar.logoUrl ? (
                                <AvatarImage src={similar.logoUrl} alt={similar.company} className="object-contain bg-white" />
                              ) : null}
                              <AvatarFallback className="text-sm font-bold bg-gradient-to-br from-primary to-accent text-white">
                                {getInitials(similar.company)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors duration-300 leading-snug">
                                {similar.title}
                              </h3>
                              <p className="text-xs text-muted-foreground">
                                {similar.company}
                              </p>
                            </div>
                          </div>
                          {similar.location && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                              <MapPin className="w-3.5 h-3.5 text-primary" />
                              {similar.location}
                            </div>
                          )}
                          {similar.salaryRange && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <DollarSign className="w-3.5 h-3.5 text-accent" />
                              {similar.salaryRange}
                            </div>
                          )}
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Job details */}
              <Card className="p-6 bg-white border-2 border-secondary/20">
                <h3 className="text-lg font-bold text-foreground mb-5">
                  Job Overview
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Briefcase className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Job Type</p>
                      <p className="font-semibold text-foreground">{job.jobType || "-"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Salary</p>
                      <p className="font-semibold text-foreground">{job.salaryRange || "-"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Location</p>
                      <p className="font-semibold text-foreground">{job.location || "-"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Posted</p>
                      <p className="font-semibold text-foreground">
                        {job.postedAt ? new Date(job.postedAt).toLocaleDateString() : "-"}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Apply card */}
              <Card className="p-6 bg-gradient-to-br from-primary to-accent text-white border-2 border-transparent">
                <h3 className="text-lg font-bold mb-3">Ready to Apply?</h3>
                <p className="text-white/80 text-sm mb-5 leading-relaxed">
                  Don't miss out on this opportunity. Apply today and take the next step in your career.
                </p>
<Button
                  onClick={() => setApplyDialogOpen(true)}
                  className="w-full bg-white text-primary hover:bg-white/90 font-bold py-3 rounded-lg shadow-lg transition-all duration-300"
                >
                  Apply Now
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Card>
            </div>
          </div>
        </Container>
      </section>

      {/* Apply dialog */}
      <ApplyJobDialog
        jobId={job.id}
        jobTitle={job.title}
        companyName={job.company}
        open={applyDialogOpen}
        onOpenChange={setApplyDialogOpen}
      />
    </PageLayout>
  );
}
