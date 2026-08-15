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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Briefcase,
  Check,
  X,
  Pencil,
  Trash2,
  MapPin,
  Clock,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

function formatDate(value: Date | string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function statusBadgeClass(status: string) {
  if (status === "approved") return "bg-green-100 text-green-700 border-green-200";
  if (status === "rejected") return "bg-destructive/10 text-destructive border-destructive/30";
  if (status === "pending") return "bg-amber-100 text-amber-700 border-amber-200";
  return "bg-secondary text-muted-foreground border-secondary";
}

type JobRow = {
  id: number;
  title: string;
  location: string | null;
  jobType: string | null;
  salaryRange: string | null;
  description: string | null;
  categoryId: number | null;
  status: string;
  applicationCount: number | null;
  postedAt: Date | string | null;
  createdAt: Date | string | null;
  companyId: number;
  company: string;
  logoUrl: string | null;
};

export default function JobPostings() {
  const utils = trpc.useUtils();
  const jobsQuery = trpc.admin.management.jobs.list.useQuery();
  const jobs = jobsQuery.data ?? [];

  const [editing, setEditing] = useState<JobRow | null>(null);

  const updateStatus = trpc.admin.management.jobs.updateStatus.useMutation({
    onSuccess: async () => {
      await utils.admin.management.jobs.list.invalidate();
      toast.success("Job status updated");
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = trpc.admin.management.jobs.delete.useMutation({
    onSuccess: async () => {
      await utils.admin.management.jobs.list.invalidate();
      toast.success("Job deleted");
    },
    onError: (err) => toast.error(err.message),
  });

  const updateMutation = trpc.admin.management.jobs.update.useMutation({
    onSuccess: async () => {
      await utils.admin.management.jobs.list.invalidate();
      setEditing(null);
      toast.success("Job updated");
    },
    onError: (err) => toast.error(err.message),
  });

  const pendingCount = jobs.filter((j) => j.status === "pending").length;
  const approvedCount = jobs.filter((j) => j.status === "approved").length;
  const rejectedCount = jobs.filter((j) => j.status === "rejected").length;

  const statCards = [
    {
      label: "Total Job Posts",
      value: jobs.length,
      icon: Briefcase,
      color: "from-blue-500 to-blue-600",
    },
    {
      label: "Pending",
      value: pendingCount,
      icon: Clock,
      color: "from-amber-500 to-amber-600",
    },
    {
      label: "Approved",
      value: approvedCount,
      icon: Check,
      color: "from-emerald-500 to-emerald-600",
    },
    {
      label: "Rejected",
      value: rejectedCount,
      icon: X,
      color: "from-rose-500 to-rose-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Job Postings</h1>
        <p className="text-muted-foreground mt-1">
          Review, approve, edit, or delete all job postings.
        </p>
      </div>

      {/* Count cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card
            key={stat.label}
            className="border-2 border-secondary/20 hover:border-primary/40 transition-all duration-300 hover:-translate-y-1"
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center text-white shadow-lg shrink-0`}
                >
                  <stat.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-foreground leading-none">
                    {jobsQuery.isLoading ? (
                      <Skeleton className="h-8 w-12" />
                    ) : (
                      stat.value
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* List */}
      <Card className="border-2 border-secondary/20">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-primary" />
            Job Postings List
          </CardTitle>
          <CardDescription>
            {jobs.length > 0
              ? `Showing ${jobs.length} job postings.`
              : "No job postings yet."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {jobsQuery.isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              No job postings yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Posted</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobs.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {job.title}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {job.salaryRange || "—"}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-7 w-7 border">
                            {job.logoUrl ? (
                              <AvatarImage
                                src={job.logoUrl}
                                alt={job.company}
                                className="object-cover"
                              />
                            ) : null}
                            <AvatarFallback className="text-[10px] font-medium bg-gradient-to-br from-purple-500 to-accent text-white">
                              {(job.company || "?").charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-muted-foreground truncate">
                            {job.company}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-xs text-muted-foreground">
                          <p className="flex items-center gap-1.5">
                            <MapPin className="w-3 h-3 shrink-0" />
                            {job.location || "—"}
                          </p>
                          <p className="flex items-center gap-1.5">
                            <Clock className="w-3 h-3 shrink-0" />
                            {job.jobType || "—"}
                          </p>
                          <p className="flex items-center gap-1.5">
                            <Wallet className="w-3 h-3 shrink-0" />
                            {job.applicationCount ?? 0} applications
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={statusBadgeClass(job.status)}
                        >
                          {job.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground whitespace-nowrap">
                          {formatDate(job.createdAt)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {job.status !== "approved" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-2 border-green-300 text-green-700 hover:border-green-400 hover:bg-green-50 transition-colors duration-300"
                              onClick={() =>
                                updateStatus.mutate({
                                  id: job.id,
                                  status: "approved",
                                })
                              }
                              disabled={updateStatus.isPending}
                            >
                              <Check className="w-3.5 h-3.5" />
                              Approve
                            </Button>
                          )}
                          {job.status !== "rejected" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-2 border-destructive/30 text-destructive hover:border-destructive/50 hover:bg-destructive/5 transition-colors duration-300"
                              onClick={() =>
                                updateStatus.mutate({
                                  id: job.id,
                                  status: "rejected",
                                })
                              }
                              disabled={updateStatus.isPending}
                            >
                              <X className="w-3.5 h-3.5" />
                              Reject
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-2 border-primary/30 text-primary hover:border-primary/50 hover:bg-primary/5 transition-colors duration-300"
                            onClick={() => setEditing(job)}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-2 border-destructive/30 text-destructive hover:border-destructive/50 hover:bg-destructive/5 transition-colors duration-300"
                            onClick={() => {
                              if (confirm(`Delete job "${job.title}"?`)) {
                                deleteMutation.mutate({ id: job.id });
                              }
                            }}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit dialog */}
      <Dialog
        open={editing !== null}
        onOpenChange={(open) => {
          if (!open) setEditing(null);
        }}
      >
        <DialogContent className="sm:max-w-lg">
{editing && (
            <EditJobForm
              job={editing}
              isSaving={updateMutation.isPending}
              onCancel={() => setEditing(null)}
              onSave={(values) =>
                updateMutation.mutate({ id: editing.id, ...values })
              }
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function EditJobForm({
  job,
  isSaving,
  onCancel,
  onSave,
}: {
  job: JobRow;
  isSaving: boolean;
  onCancel: () => void;
  onSave: (values: {
    title: string;
    location: string;
    jobType: string;
    salaryRange: string;
    description: string;
  }) => void;
}) {
  const [title, setTitle] = useState(job.title ?? "");
  const [location, setLocation] = useState(job.location ?? "");
  const [jobType, setJobType] = useState(job.jobType ?? "");
  const [salaryRange, setSalaryRange] = useState(job.salaryRange ?? "");
  const [description, setDescription] = useState(job.description ?? "");

  const handleSubmit = () => {
    onSave({
      title,
      location,
      jobType,
      salaryRange,
      description,
    });
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Edit Job Posting</DialogTitle>
        <DialogDescription>
          Update the details for "{job.title}".
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="title">Job Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Senior Frontend Engineer"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Yangon"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="jobType">Job Type</Label>
          <Input
            id="jobType"
            value={jobType}
            onChange={(e) => setJobType(e.target.value)}
            placeholder="e.g. Full-time"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="salaryRange">Salary (MMK)</Label>
          <Input
            id="salaryRange"
            value={salaryRange}
            onChange={(e) => setSalaryRange(e.target.value)}
            placeholder="e.g. 5 - 8 lakhs"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Job description"
            className="min-h-[100px]"
          />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
<Button
          onClick={handleSubmit}
          disabled={isSaving}
          className="bg-gradient-to-r from-primary to-accent text-white"
        >
          {isSaving ? "Saving…" : "Save Changes"}
        </Button>
      </DialogFooter>
    </>
  );
}
