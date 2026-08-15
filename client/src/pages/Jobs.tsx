import PageLayout from "@/components/PageLayout";
import Container from "@/components/Container";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPin, Briefcase, DollarSign, Search, ArrowRight, Building2 } from "lucide-react";
import { Link } from "wouter";
import { useEffect, useState } from "react";

const SALARY_RANGES = [
  { label: "Any salary", value: "all" },
  { label: "MMK 500k+", value: "500" },
  { label: "MMK 800k+", value: "800" },
  { label: "MMK 1M+", value: "1000" },
  { label: "MMK 1.5M+", value: "1500" },
  { label: "MMK 2M+", value: "2000" },
];

type JobResult = {
  id: number;
  title: string;
  location: string | null;
  jobType: string | null;
  salaryRange: string | null;
  postedAt: Date;
  company: string;
  companyId: number;
  logoUrl: string | null;
  description: string | null;
  categoryId: number | null;
};

function getInitials(name: string) {
  return (name || "C").split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

function JobCard({ job }: { job: JobResult }) {
  return (
    <Link href={`/jobs/${job.id}`}>
      <Card className="p-6 hover:shadow-xl transition-all duration-300 hover:border-primary/50 hover:-translate-y-2 cursor-pointer group bg-gradient-to-br from-white to-secondary/5 border-2 border-secondary/20 relative overflow-hidden h-full">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="relative z-10 flex flex-col h-full">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 border-2 border-secondary/30 shadow shrink-0">
                {job.logoUrl ? (
                  <AvatarImage src={job.logoUrl} alt={job.company} className="object-contain bg-white" />
                ) : null}
                <AvatarFallback className="text-sm font-bold bg-gradient-to-br from-primary to-accent text-white">
                  {getInitials(job.company)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-1 group-hover:text-primary transition-colors duration-300 leading-snug">
                  {job.title}
                </h3>
                <p className="text-sm text-muted-foreground flex items-center gap-1 group-hover:text-foreground transition-colors duration-300">
                  <Building2 className="w-3.5 h-3.5" />
                  {job.company}
                </p>
              </div>
            </div>
            {job.jobType && (
              <Badge
                variant="secondary"
                className="bg-gradient-to-r from-primary/20 to-accent/20 text-primary border-primary/30 group-hover:from-primary/30 group-hover:to-accent/30 transition-all duration-300 ml-2 shrink-0"
              >
                {job.jobType}
              </Badge>
            )}
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-4 group-hover:text-foreground transition-colors duration-300">
            {job.description || "No description provided."}
          </p>

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
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-secondary/20 mt-auto">
            <span className="text-xs text-muted-foreground">
              {job.postedAt ? new Date(job.postedAt).toLocaleDateString() : ""}
            </span>
            <span className="text-primary font-semibold text-sm flex items-center gap-1 group-hover:gap-2 transition-all duration-300">
              View Details
              <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}

export default function Jobs() {
  const categoriesQuery = trpc.categories.list.useQuery();
  const categories = categoriesQuery.data ?? [];

  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState("all");
  const [location, setLocation] = useState("all");
  const [salary, setSalary] = useState("all");
  const [searchParams, setSearchParams] = useState<{
    keyword?: string;
    categoryId?: number;
    location?: string;
  }>({});

  const jobsQuery = trpc.jobs.search.useQuery(
    {
      keyword: searchParams.keyword,
      location: searchParams.location,
      categoryId: searchParams.categoryId,
      limit: 100,
    },
    { enabled: true }
  );

  const results: JobResult[] = jobsQuery.data ?? [];

  // Client-side salary filtering on top of the server results.
  const filteredResults = results.filter((job) => {
    if (!job.salaryRange) return true;
    if (salary === "all") return true;
    const min = parseInt(salary, 10);
    const match = job.salaryRange.match(/(\d+(?:\.\d+)?)\s*([kKmM])?/);
    if (match) {
      const amount = parseFloat(match[1]);
      const suffix = match[2]?.toLowerCase();
      const low = suffix === "m" ? amount * 1000 : amount;
      if (low < min) return false;
    }
    return true;
  });

  const handleSearch = () => {
    setSearchParams({
      keyword: keyword || undefined,
      location: location === "all" ? undefined : location,
      categoryId: category === "all" ? undefined : Number(category),
    });
  };

  const handleReset = () => {
    setKeyword("");
    setCategory("all");
    setLocation("all");
    setSalary("all");
    setSearchParams({});
  };

  return (
    <PageLayout>
      {/* Hero */}
      <section className="relative py-16 md:py-20 bg-gradient-to-br from-white via-secondary/10 to-primary/8 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/15 to-accent/10 rounded-full blur-3xl -mr-48 -mt-48" />
        <Container className="relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Explore{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Approved Jobs
              </span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Search current opportunities published by approved employers on TalentBridgeHub.
            </p>
          </div>
        </Container>
      </section>

      {/* Search & Filter Bar */}
      <section className="py-8 bg-gradient-to-b from-secondary/5 to-background border-b border-secondary/20">
        <Container>
          <Card className="p-6 bg-gradient-to-br from-white to-secondary/5 border-2 border-secondary/20">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
              {/* Keyword */}
              <div className="lg:col-span-2 space-y-2">
                <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Search className="w-4 h-4 text-primary" />
                  Keywords
                </label>
                <Input
                  type="text"
                  placeholder="Job title, company, or skills..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="border-2 border-secondary/30 focus:border-primary/50 rounded-lg"
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">
                  Category
                </label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="w-full border-2 border-secondary/30 focus:border-primary/50 rounded-lg">
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">
                  Location
                </label>
                <Input
                  type="text"
                  placeholder="All locations"
                  value={location === "all" ? "" : location}
                  onChange={(e) => setLocation(e.target.value || "all")}
                  className="border-2 border-secondary/30 focus:border-primary/50 rounded-lg"
                />
              </div>

              {/* Salary */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">
                  Salary
                </label>
                <Select value={salary} onValueChange={setSalary}>
                  <SelectTrigger className="w-full border-2 border-secondary/30 focus:border-primary/50 rounded-lg">
                    <SelectValue placeholder="Any salary" />
                  </SelectTrigger>
                  <SelectContent>
                    {SALARY_RANGES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-secondary/20">
              <Button
                onClick={handleSearch}
                className="bg-gradient-to-r from-primary to-accent text-white font-semibold px-6 rounded-lg hover:shadow-lg transition-all duration-300"
              >
                <Search className="w-4 h-4" />
                Search Jobs
              </Button>
              <Button
                variant="outline"
                onClick={handleReset}
                className="border-2 border-secondary/30 hover:border-primary/50 transition-colors duration-300"
              >
                Reset
              </Button>
              <span className="ml-auto text-sm text-muted-foreground self-center">
                {jobsQuery.isLoading
                  ? "Loading…"
                  : `Showing ${filteredResults.length} job${filteredResults.length !== 1 ? "s" : ""}`}
              </span>
            </div>
          </Card>
        </Container>
      </section>

      {/* Results */}
      <section className="py-16 bg-gradient-to-b from-background to-secondary/10">
        <Container>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                {filteredResults.length > 0 ? "Available Jobs" : "No Jobs Found"}
              </h2>
              <p className="text-muted-foreground">
                {filteredResults.length > 0
                  ? "Browse through the latest opportunities"
                  : "Try adjusting your search or filters to find more opportunities."}
              </p>
            </div>
          </div>

          {jobsQuery.isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="p-6 border-2 border-secondary/20">
                  <Skeleton className="h-6 w-2/3 mb-4" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-4/5 mb-4" />
                  <Skeleton className="h-10 w-full" />
                </Card>
              ))}
            </div>
          ) : filteredResults.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResults.map((job, idx) => (
                <div
                  key={job.id}
                  className="animate-in fade-in slide-in-from-bottom-3 duration-700"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <JobCard job={job} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary/10 to-accent/10 rounded-full flex items-center justify-center mb-6">
                <Search className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                No matching jobs
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                We couldn't find any jobs matching your criteria. Try changing your search terms or resetting the filters.
              </p>
              <Button
                onClick={handleReset}
                className="bg-gradient-to-r from-primary to-accent text-white font-semibold px-6 rounded-lg hover:shadow-lg transition-all duration-300"
              >
                Reset Filters
              </Button>
            </div>
          )}
        </Container>
      </section>
    </PageLayout>
  );
}
