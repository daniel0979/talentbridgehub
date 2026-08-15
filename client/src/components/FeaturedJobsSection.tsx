import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { trpc } from "@/lib/trpc";
import { MapPin, Briefcase, DollarSign, Clock, ArrowRight } from "lucide-react";
import { Link } from "wouter";

type FeaturedJob = {
  id: number;
  title: string;
  location: string | null;
  jobType: string | null;
  salaryRange: string | null;
  postedAt: Date;
  company: string;
  logoUrl: string | null;
};

function getInitials(name: string) {
  return (name || "C")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function FeaturedJobsSection() {
  const { data: jobs, isLoading } = trpc.jobs.featured.useQuery({ limit: 6 });

  return (
    <section className="py-20 bg-gradient-to-b from-background to-secondary/10">
      <div className="container">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Featured Opportunities
            </h2>
            <p className="text-muted-foreground text-lg">
              Latest job openings from top companies
            </p>
          </div>
          <Link href="/jobs">
            <Button
              variant="outline"
              size="lg"
              asChild
              className="bg-gradient-to-r from-primary/10 to-accent/10 border-2 border-primary/30 hover:border-primary/60 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 group"
            >
              <span className="cursor-pointer flex items-center gap-2">
                View All Jobs
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
              </span>
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="p-6 border-2 border-secondary/20">
                <Skeleton className="h-6 w-2/3 mb-4" />
                <Skeleton className="h-4 w-1/2 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4 mb-4" />
                <Skeleton className="h-8 w-full" />
              </Card>
            ))}
          </div>
        ) : !jobs || jobs.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary/10 to-accent/10 rounded-full flex items-center justify-center mb-4">
              <Briefcase className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">
              No jobs available yet
            </h3>
            <p className="text-muted-foreground mb-6">
              Check back soon — companies are posting new opportunities every day.
            </p>
            <Link href="/jobs">
              <Button className="bg-gradient-to-r from-primary to-accent text-white font-semibold px-6 rounded-lg hover:shadow-lg transition-all duration-300">
                Browse All Jobs
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job, idx) => (
              <Link key={job.id} href={`/jobs/${job.id}`}>
                <Card
                  className="p-6 hover:shadow-xl transition-all duration-300 hover:border-primary/50 hover:-translate-y-2 cursor-pointer group bg-gradient-to-br from-white to-secondary/5 border-2 border-secondary/20 animate-in fade-in slide-in-from-bottom-3 duration-700 relative overflow-hidden h-full"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="relative z-10 flex flex-col h-full">
{/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors duration-300">
                          {job.title}
                        </h3>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6 border border-secondary/30 shrink-0">
                            {job.logoUrl ? (
                              <AvatarImage src={job.logoUrl} alt={job.company} className="object-contain" />
                            ) : null}
                            <AvatarFallback className="text-[9px] font-bold bg-gradient-to-br from-primary to-accent text-white">
                              {getInitials(job.company)}
                            </AvatarFallback>
                          </Avatar>
                          <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                            {job.company}
                          </p>
                        </div>
                      </div>
                      {job.jobType && (
                        <Badge
                          variant="secondary"
                          className="bg-gradient-to-r from-primary/20 to-accent/20 text-primary border-primary/30 group-hover:from-primary/30 group-hover:to-accent/30 transition-all duration-300 ml-2"
                        >
                          {job.jobType}
                        </Badge>
                      )}
                    </div>

                    {/* Details */}
                    <div className="space-y-2 mb-4 text-sm text-muted-foreground">
                      {job.location && (
                        <div className="flex items-center gap-2 group-hover:text-foreground transition-colors duration-300">
                          <MapPin className="w-4 h-4 text-primary" />
                          {job.location}
                        </div>
                      )}
                      {job.salaryRange && (
                        <div className="flex items-center gap-2 group-hover:text-foreground transition-colors duration-300">
                          <DollarSign className="w-4 h-4 text-accent" />
                          {job.salaryRange}
                        </div>
                      )}
<div className="flex items-center gap-2 group-hover:text-foreground transition-colors duration-300">
                        <Clock className="w-4 h-4 text-purple-500" />
                        {String(new Date(job.postedAt).toLocaleDateString())}
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-secondary/20 mt-auto">
                      <Badge
                        variant="outline"
                        className="bg-blue-50 text-blue-700 border-blue-200 group-hover:bg-blue-100 transition-colors duration-300"
                      >
                        New
                      </Badge>
                      <span className="text-primary font-semibold text-sm flex items-center gap-1 group-hover:gap-2 transition-all duration-300">
                        Apply
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
