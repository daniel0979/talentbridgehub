import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Users,
  FileText,
  Search,
  RotateCcw,
  Send,
  Mail,
  Briefcase,
  MessageSquare,
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

function formatDate(value: Date | string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
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

export default function Applications() {
  const utils = trpc.useUtils();
  const applicationsQuery = trpc.admin.management.applications.list.useQuery();
  const applications = applicationsQuery.data ?? [];

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<(typeof applications)[number] | null>(
    null
  );

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return applications.filter((app) => {
      if (statusFilter !== "all" && app.status !== statusFilter) return false;
      if (
        term &&
        !`${app.seekerName} ${app.seekerEmail} ${app.jobTitle} ${app.companyName}`
          .toLowerCase()
          .includes(term)
      ) {
        return false;
      }
      return true;
    });
  }, [applications, searchTerm, statusFilter]);

  const updateMutation = trpc.admin.management.applications.updateStatus.useMutation({
    onSuccess: async () => {
      toast.success("Application status updated.");
      await utils.admin.management.applications.list.invalidate();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to update status.");
    },
  });

  const counts = useMemo(() => {
    const submitted = applications.filter((a) => a.status === "submitted").length;
    const active = applications.filter((a) =>
      ["reviewed", "shortlisted", "interview", "offered"].includes(a.status)
    ).length;
    const rejected = applications.filter((a) => a.status === "rejected").length;
    return { submitted, active, rejected };
  }, [applications]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Applications</h1>
        <p className="text-muted-foreground mt-1">
          All job applications submitted across the platform.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-2 border-secondary/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center text-white shadow-lg shrink-0">
                <Send className="w-6 h-6" />
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground leading-none">
                  {applicationsQuery.isLoading ? (
                    <Skeleton className="h-8 w-12" />
                  ) : (
                    applications.length
                  )}
                </p>
                <p className="text-sm text-muted-foreground mt-2">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-2 border-secondary/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center text-white shadow-lg shrink-0">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground leading-none">
                  {applicationsQuery.isLoading ? (
                    <Skeleton className="h-8 w-12" />
                  ) : (
                    counts.submitted
                  )}
                </p>
                <p className="text-sm text-muted-foreground mt-2">New</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-2 border-secondary/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-accent rounded-xl flex items-center justify-center text-white shadow-lg shrink-0">
                <Briefcase className="w-6 h-6" />
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground leading-none">
                  {applicationsQuery.isLoading ? (
                    <Skeleton className="h-8 w-12" />
                  ) : (
                    counts.active
                  )}
                </p>
                <p className="text-sm text-muted-foreground mt-2">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* List */}
      <Card className="border-2 border-secondary/20">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Applications List
          </CardTitle>
          <CardDescription>
            {filtered.length > 0
              ? `Showing ${filtered.length} of ${applications.length} applications.`
              : "No applications submitted yet."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search seeker, email, job, company..."
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border-2 border-secondary/30 bg-background focus:border-primary/50 focus:outline-none focus:ring-0"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-44 border-2 border-secondary/30 focus:border-primary/50 rounded-lg">
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
            {searchTerm && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSearchTerm("")}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Clear
              </Button>
            )}
          </div>

          {applicationsQuery.isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              No applications found.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job Seeker</TableHead>
                    <TableHead>Job</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Applied</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell>
                        <p className="text-sm font-medium text-foreground truncate">
                          {app.seekerName}
                        </p>
                        {app.seekerHeadline && (
                          <p className="text-xs text-muted-foreground truncate max-w-[160px]">
                            {app.seekerHeadline}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-foreground truncate max-w-[180px]">
                          {app.jobTitle}
                        </p>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-muted-foreground truncate">
                          {app.companyName}
                        </p>
                      </TableCell>
                      <TableCell>
                        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Mail className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate max-w-[160px]">
                            {app.seekerEmail}
                          </span>
                        </p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="secondary"
                            className={`${statusStyles[app.status] ?? "bg-secondary text-muted-foreground"} border capitalize`}
                          >
                            {app.status}
                          </Badge>
<Select
                            value={app.status}
onValueChange={(v) =>
                              updateMutation.mutate({
                                id: app.id,
                                status: v as (typeof STATUS_OPTIONS)[number],
                              })
                            }
                          >
                            <SelectTrigger className="w-28 h-7 border-2 border-secondary/30 focus:border-primary/50 rounded-lg text-xs">
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
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground whitespace-nowrap">
                          {formatDate(app.createdAt)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelected(app)}
                          className="border-2 border-primary/30 text-primary hover:border-primary/50 hover:bg-primary/5"
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail drawer */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground">
              Application Details
            </DialogTitle>
            <DialogDescription>
              {selected ? (
                <>
                  {selected.seekerName} · {selected.jobTitle} ·{" "}
                  {selected.companyName}
                </>
              ) : (
                "Application details"
              )}
            </DialogDescription>
          </DialogHeader>

          {selected && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge
                  variant="secondary"
                  className={`${statusStyles[selected.status] ?? "bg-secondary text-muted-foreground"} border capitalize`}
                >
                  {selected.status}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Applied {formatDate(selected.createdAt)}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-2 text-sm">
                <p className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="w-4 h-4 text-primary" />
                  {selected.seekerEmail}
                </p>
                {selected.seekerLocation && (
                  <p className="flex items-center gap-2 text-muted-foreground">
                    <Briefcase className="w-4 h-4 text-primary" />
                    {selected.seekerLocation}
                  </p>
                )}
              </div>

              {selected.seekerPhoto && (
                <img
                  src={selected.seekerPhoto}
                  alt={selected.seekerName}
                  className="w-16 h-16 rounded-full object-cover border-2 border-primary/20"
                />
              )}

              {(selected.seekerSkills as unknown as string) ? (
                <div className="flex flex-wrap gap-1.5">
                  {parseSkills(selected.seekerSkills as unknown as string).map(
                    (skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center rounded-md bg-primary/10 text-primary px-2 py-0.5 text-xs font-medium"
                      >
                        {skill}
                      </span>
                    )
                  )}
                </div>
              ) : null}

              <div className="flex flex-wrap gap-3 pt-2 border-t border-secondary/20">
                {selected.resumeUrl && (
                  <a
                    href={selected.resumeUrl}
                    download
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-accent transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                    View Resume / CV
                  </a>
                )}
                {selected.seekerResume &&
                  selected.seekerResume !== selected.resumeUrl && (
                    <a
                      href={selected.seekerResume}
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

              {selected.coverLetter && (
                <div className="p-4 rounded-lg bg-secondary/10 border border-secondary/20">
                  <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1.5 uppercase tracking-wide">
                    <MessageSquare className="w-3.5 h-3.5" />
                    Cover Letter
                  </p>
                  <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">
                    {selected.coverLetter}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
