import PageLayout from "@/components/PageLayout";
import Container from "@/components/Container";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Star, Building2, Quote, ArrowRight, CheckCircle2, MapPin, Briefcase, DollarSign, Globe, ChevronDown, ChevronUp } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useEffect, useState } from "react";

type Company = {
  id: number;
  name: string;
  logoUrl: string | null;
  description: string | null;
  website: string | null;
  industry: string | null;
  town: string | null;
  status: "pending" | "approved" | "suspended";
  createdAt: Date;
};

type CompanyJob = {
  id: number;
  title: string;
  location: string | null;
  jobType: string | null;
  salaryRange: string | null;
  description: string | null;
  postedAt: Date;
  company: string;
  logoUrl: string | null;
};

function getInitials(name: string) {
  return (name || "C").split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

const COMPANY_COLORS = [
  "from-blue-500 to-blue-600",
  "from-pink-500 to-pink-600",
  "from-green-500 to-green-600",
  "from-orange-500 to-orange-600",
  "from-indigo-500 to-indigo-600",
  "from-teal-500 to-teal-600",
  "from-purple-500 to-purple-600",
  "from-red-500 to-red-600",
];

/** Max characters shown before truncating a long testimonial. */
const REVIEW_CHAR_LIMIT = 120;

/**
 * Renders a testimonial comment with a "Read more / Show less" toggle when the
 * comment is longer than REVIEW_CHAR_LIMIT characters.
 */
function CollapsibleReview({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = text.length > REVIEW_CHAR_LIMIT;

  const visible = expanded ? text : text.slice(0, REVIEW_CHAR_LIMIT);
  const trailing = expanded ? "" : isLong ? "…" : "";

  return (
    <div className="mb-6">
      <p className="text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors duration-300">
        "{visible}{trailing}"
      </p>
      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="mt-2 inline-flex items-center gap-1 text-primary hover:text-accent font-semibold text-sm transition-colors duration-300"
        >
          {expanded ? (
            <>
              Show less
              <ChevronUp className="w-4 h-4" />
            </>
          ) : (
            <>
              Read more
              <ChevronDown className="w-4 h-4" />
            </>
          )}
        </button>
      )}
    </div>
  );
}

export default function Companies() {
  const reviewsQuery = trpc.companies.reviews.useQuery();
  const reviews = reviewsQuery.data ?? [];

  const companiesQuery = trpc.companies.all.useQuery();
  const companies = companiesQuery.data ?? [];

  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  const testimonials = reviews;

  return (
    <PageLayout>
      {/* Hero */}
      <section className="relative py-16 md:py-20 bg-gradient-to-br from-white via-secondary/10 to-primary/8 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/15 to-accent/10 rounded-full blur-3xl -mr-48 -mt-48" />
        <Container className="relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary font-semibold px-4 py-1.5 rounded-full mb-6">
              <Building2 className="w-4 h-4" />
              Approved Employers
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Companies Hiring Through{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                TalentBridgeHub
              </span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Explore approved employer profiles and their currently available roles.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/client/signup">
                <Button className="bg-gradient-to-r from-primary to-accent text-white font-bold px-8 py-3 rounded-xl hover:shadow-lg hover:shadow-primary/40 transition-all duration-300 transform hover:scale-105 active:scale-95">
                  Become a Partner
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/jobs">
                <Button
                  variant="outline"
                  className="border-2 border-primary/30 text-primary hover:border-primary/50 hover:bg-primary/5 font-semibold px-8 py-3 rounded-xl transition-all duration-300"
                >
                  Browse Jobs
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* Stats */}
      <section className="py-12 bg-gradient-to-r from-primary via-primary to-accent text-white">
        <Container>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { number: `${companies.length}`, label: "Approved companies" },
              { number: "Roles", label: "Employer job posts" },
              { number: "Review", label: "Application progress" },
              { number: "Direct", label: "Employer messaging" },
            ].map((stat, idx) => (
              <div key={idx} className="animate-in fade-in slide-in-from-bottom-3 duration-700" style={{ animationDelay: `${idx * 100}ms` }}>
                <div className="text-3xl md:text-4xl font-bold mb-2">{stat.number}</div>
                <p className="text-white/80 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Partner Companies Showcase */}
      <section className="py-20 bg-gradient-to-b from-background to-secondary/10">
        <Container>
          <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Approved Employer Directory
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Browse organisations that have been approved to publish opportunities on the platform.
            </p>
          </div>

          {companiesQuery.isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="p-8 border-2 border-secondary/20">
                  <Skeleton className="h-16 w-16 rounded-xl mb-4" />
                  <Skeleton className="h-7 w-2/3 mb-3" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4 mb-4" />
                  <Skeleton className="h-10 w-full" />
                </Card>
              ))}
            </div>
          ) : companies.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary/10 to-accent/10 rounded-full flex items-center justify-center mb-4">
                <Building2 className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                No companies yet
              </h3>
              <p className="text-muted-foreground mb-6">
                Registered companies will appear here once they're approved.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {companies.map((company, idx) => (
                <Card
                  key={company.id}
                  onClick={() => setSelectedCompany(company)}
                  className="p-8 hover:shadow-2xl transition-all duration-300 hover:border-primary/50 hover:-translate-y-2 cursor-pointer group bg-gradient-to-br from-white to-secondary/5 border-2 border-secondary/20 relative overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-700"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-5">
                      <Avatar className={`w-16 h-16 rounded-xl bg-gradient-to-br ${COMPANY_COLORS[idx % COMPANY_COLORS.length]} flex items-center justify-center text-white font-bold text-xl group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                        {company.logoUrl ? (
                          <AvatarImage src={company.logoUrl} alt={company.name} className="object-contain bg-white" />
                        ) : null}
                        <AvatarFallback className="bg-transparent text-white font-bold">
                          {getInitials(company.name)}
                        </AvatarFallback>
                      </Avatar>
                      <Badge
                        variant="secondary"
                        className="bg-gradient-to-r from-primary/20 to-accent/20 text-primary border-primary/30 group-hover:from-primary/30 group-hover:to-accent/30 transition-all duration-300 text-xs"
                      >
                        {company.industry || "Company"}
                      </Badge>
                    </div>

                    <h3 className="text-2xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors duration-300">
                      {company.name}
                    </h3>

                    {company.description && (
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-2 group-hover:text-foreground transition-colors duration-300">
                        {company.description}
                      </p>
                    )}

                    {company.town && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4 group-hover:text-foreground transition-colors duration-300">
                        <MapPin className="w-4 h-4 text-primary" />
                        {company.town}
                      </div>
                    )}

                    <span className="inline-flex items-center gap-1 text-primary font-semibold text-sm group-hover:gap-2 transition-all duration-300">
                      View Open Positions
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Container>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gradient-to-b from-background to-secondary/20">
        <Container>
          <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary font-semibold px-4 py-1.5 rounded-full mb-6">
              <Quote className="w-4 h-4" />
              Employer Feedback
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Feedback from Employers
            </h2>
            <p className="text-muted-foreground text-lg">
              Feedback is shown only when it has been submitted through TalentBridgeHub.
            </p>
          </div>

          {reviewsQuery.isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, index) => (
                <Card key={index} className="p-6 border-2 border-secondary/20">
                  <Skeleton className="mb-4 h-5 w-24" />
                  <Skeleton className="mb-2 h-4 w-full" />
                  <Skeleton className="mb-6 h-4 w-4/5" />
                  <Skeleton className="h-10 w-36" />
                </Card>
              ))}
            </div>
          ) : testimonials.length === 0 ? (
            <Card className="mx-auto max-w-2xl p-8 text-center border-2 border-secondary/20 bg-white">
              <Quote className="mx-auto mb-3 h-8 w-8 text-primary" />
              <h3 className="text-lg font-bold text-foreground">No employer feedback published yet</h3>
              <p className="mt-2 text-muted-foreground">
                TalentBridgeHub will display feedback only after it is submitted by a verified employer.
              </p>
            </Card>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((item, idx) => {
              const displayName = item.companyName;
              const rating = item.rating;
              const stars = Math.round(rating);
              const quote = item.content;
              const initials = (displayName || "C").slice(0, 2).toUpperCase();
              const logoUrl = item.logoUrl;

              return (
                <Card
                  key={(item as any).id}
                  className="p-6 hover:shadow-lg transition-all duration-300 hover:border-primary/30 hover:-translate-y-2 cursor-pointer group bg-gradient-to-br from-white to-secondary/5 border border-secondary/20 animate-in fade-in slide-in-from-bottom-3 duration-700"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  {/* Quote icon */}
                  <div className="flex items-center justify-between mb-4">
                    <Quote className="w-8 h-8 text-primary/40 group-hover:text-primary transition-colors duration-300" />
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 transition-all duration-300 ${
                            i < stars
                              ? "fill-accent text-accent group-hover:scale-110"
                              : "text-muted-foreground"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

{/* Content */}
                  <CollapsibleReview text={quote} />

                  {/* Author */}
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      {logoUrl ? (
                        <AvatarImage
                          src={logoUrl}
                          alt={displayName}
                          className="object-contain bg-white"
                        />
                      ) : null}
                      <AvatarFallback
                        className={`bg-gradient-to-br ${
                          "from-primary to-accent"
                        } text-white font-semibold`}
                      >
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
                        {displayName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Employer
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
          )}
        </Container>
      </section>

      {/* Why partner with us */}
      <section className="py-20 bg-white">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Why Partner With Us?
            </h2>
            <p className="text-muted-foreground text-lg">
              Everything you need to hire great talent, faster.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Reach Top Talent",
                description:
                  "Access a large, engaged community of qualified professionals actively seeking their next opportunity.",
              },
              {
                title: "Fast Hiring Process",
                description:
                  "Post jobs in minutes and receive qualified applications quickly with our smart matching technology.",
              },
              {
                title: "Dedicated Support",
                description:
                  "Our team is here to help you at every step, from posting your first job to onboarding new hires.",
              },
            ].map((feature, idx) => (
              <Card
                key={idx}
                className="p-8 bg-white border-2 border-secondary/20 hover:border-primary/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group"
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-accent text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/client/signup">
              <Button className="bg-gradient-to-r from-primary to-accent text-white font-bold px-10 py-4 rounded-xl hover:shadow-lg hover:shadow-primary/40 transition-all duration-300 transform hover:scale-105 active:scale-95">
                Get Started Today
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </Container>
      </section>

      {/* Company Jobs Modal */}
      <CompanyJobsDialog company={selectedCompany} onClose={() => setSelectedCompany(null)} />
    </PageLayout>
  );
}

function CompanyJobsDialog({
  company,
  onClose,
}: {
  company: Company | null;
  onClose: () => void;
}) {
  const jobsQuery = trpc.companies.jobs.useQuery(
    { companyId: company?.id ?? 0 },
    { enabled: !!company }
  );
  const jobs = jobsQuery.data ?? [];

  // Reset loading state when the dialog opens with a new company.
  useEffect(() => {
    if (company) {
      jobsQuery.refetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [company?.id]);

  return (
    <Dialog open={!!company} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <Avatar className={`w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
              {company?.logoUrl ? (
                <AvatarImage src={company.logoUrl} alt={company?.name ?? ""} className="object-contain bg-white" />
              ) : null}
              <AvatarFallback className="bg-transparent text-white font-bold">
                {getInitials(company?.name ?? "")}
              </AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle className="text-2xl font-bold">
                {company?.name}
              </DialogTitle>
              <DialogDescription className="flex items-center gap-2">
                {company?.industry && <Badge variant="secondary">{company?.industry}</Badge>}
                {company?.town && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {company?.town}
                  </span>
                )}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {company?.website && (
          <a
            href={company.website}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-primary hover:text-accent font-medium text-sm transition-colors duration-300"
          >
            <Globe className="w-4 h-4" />
            {company.website}
          </a>
        )}

        {company?.description && (
          <p className="text-muted-foreground text-sm leading-relaxed">
            {company.description}
          </p>
        )}

        <div className="mt-2">
          <h4 className="text-lg font-bold text-foreground mb-4">
            Open Positions ({jobsQuery.isLoading ? "…" : jobs.length})
          </h4>

          {jobsQuery.isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="p-4 border-2 border-secondary/20">
                  <Skeleton className="h-5 w-2/3 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </Card>
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-14 h-14 mx-auto bg-gradient-to-br from-primary/10 to-accent/10 rounded-full flex items-center justify-center mb-3">
                <Briefcase className="w-7 h-7 text-primary" />
              </div>
              <p className="text-muted-foreground">
                No open positions at the moment.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {jobs.map((job) => (
                <Link key={job.id} href={`/jobs/${job.id}`}>
                  <Card className="p-5 hover:shadow-xl transition-all duration-300 hover:border-primary/50 hover:-translate-y-1 cursor-pointer group bg-gradient-to-br from-white to-secondary/5 border-2 border-secondary/20">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h5 className="font-semibold text-foreground group-hover:text-primary transition-colors duration-300 mb-2">
                          {job.title}
                        </h5>
                        <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                          {job.location && (
                            <span className="inline-flex items-center gap-1.5">
                              <MapPin className="w-4 h-4 text-primary" />
                              {job.location}
                            </span>
                          )}
                          {job.jobType && (
                            <span className="inline-flex items-center gap-1.5">
                              <Briefcase className="w-4 h-4 text-accent" />
                              {job.jobType}
                            </span>
                          )}
                          {job.salaryRange && (
                            <span className="inline-flex items-center gap-1.5">
                              <DollarSign className="w-4 h-4 text-green-500" />
                              {job.salaryRange}
                            </span>
                          )}
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-primary shrink-0 group-hover:translate-x-1 transition-transform duration-300" />
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
