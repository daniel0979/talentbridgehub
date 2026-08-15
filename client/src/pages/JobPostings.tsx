import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Plus,
  Pencil,
  Trash2,
  MapPin,
  DollarSign,
  Briefcase,
  Building2,
  CheckCircle2,
  X,
  Save,
  Eye,
  Clock,
  ListChecks,
  Target,
} from "lucide-react";
import { useCompanyAuth } from "@/_core/hooks/useCompanyAuth";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface JobForm {
  title: string;
  location: string;
  jobType: string;
  salaryRange: string;
  description: string;
  categoryId: string;
  responsibilities: string[];
  requirements: string[];
}

const CATEGORIES = [
  "Technology",
  "Design",
  "Marketing",
  "Finance",
  "Engineering",
  "Healthcare",
  "Sales",
  "Education",
  "Human Resources",
  "Customer Support",
];

const JOB_TYPES = ["Full-time", "Part-time", "Contract", "Freelance", "Internship"];

const EMPTY_FORM: JobForm = {
  title: "",
  location: "",
  jobType: "Full-time",
  salaryRange: "",
  description: "",
  categoryId: "",
  responsibilities: [],
  requirements: [],
};

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

/** Dynamic add/remove list editor for responsibilities / requirements. */
function ListEditor({
  label,
  icon,
  items,
  onChange,
  placeholder,
}: {
  label: string;
  icon: React.ReactNode;
  items: string[];
  onChange: (items: string[]) => void;
  placeholder: string;
}) {
  const addItem = () => onChange([...items, ""]);
  const updateItem = (idx: number, value: string) =>
    onChange(items.map((item, i) => (i === idx ? value : item)));
  const removeItem = (idx: number) => onChange(items.filter((_, i) => i !== idx));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
          {icon}
          {label}
        </Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addItem}
          className="border-2 border-primary/30 text-primary hover:border-primary/50 hover:bg-primary/5 transition-colors duration-300"
        >
          <Plus className="w-4 h-4" />
          Add Item
        </Button>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground bg-secondary/30 border border-secondary/40 rounded-lg px-4 py-3">
          No items added yet. Click "Add Item" to add {label.toLowerCase()} for this role.
        </p>
      ) : (
        <div className="space-y-2">
          {items.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="w-8 h-8 shrink-0 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center text-primary font-semibold text-sm">
                {idx + 1}
              </div>
              <Input
                type="text"
                value={item}
                placeholder={placeholder}
                onChange={(e) => updateItem(idx, e.target.value)}
                className="border-2 border-secondary/30 focus:border-primary/50 rounded-lg"
              />
              <button
                type="button"
                onClick={() => removeItem(idx)}
                className="p-2 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors duration-300 shrink-0"
                title={`Remove ${label.toLowerCase()} item`}
              >
                <Trash2 className="w-4 h-4 text-destructive" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function JobPostings() {
  const { company } = useCompanyAuth();
  const utils = trpc.useUtils();
  const jobsQuery = trpc.company.jobs.mine.useQuery();
  const jobs = jobsQuery.data ?? [];

  const [showForm, setShowForm] = useState(false);
  const [editingJobId, setEditingJobId] = useState<number | null>(null);
  const [form, setForm] = useState<JobForm>(EMPTY_FORM);
  const [formError, setFormError] = useState("");

  const createMutation = trpc.company.jobs.create.useMutation({
    onSuccess: async () => {
      await utils.company.jobs.mine.invalidate();
      toast.success("Job posted successfully!");
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const updateMutation = trpc.company.jobs.update.useMutation({
    onSuccess: async () => {
      await utils.company.jobs.mine.invalidate();
      toast.success("Job updated successfully!");
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const deleteMutation = trpc.company.jobs.delete.useMutation({
    onSuccess: async () => {
      await utils.company.jobs.mine.invalidate();
      toast.success("Job deleted successfully!");
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingJobId(null);
    setFormError("");
    setShowForm(false);
  };

  const openCreateForm = () => {
    setForm(EMPTY_FORM);
    setEditingJobId(null);
    setFormError("");
    setShowForm(true);
  };

  const openEditForm = (job: (typeof jobs)[number]) => {
    setEditingJobId(job.id);
    setForm({
      title: job.title,
      location: job.location ?? "",
      jobType: job.jobType ?? "Full-time",
      salaryRange: job.salaryRange ?? "",
      description: job.description ?? "",
      categoryId: job.categoryId ? String(job.categoryId) : "",
      responsibilities: Array.isArray(job.responsibilities) ? job.responsibilities : [],
      requirements: Array.isArray(job.requirements) ? job.requirements : [],
    });
    setFormError("");
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim() || !form.salaryRange.trim() || !form.location.trim()) {
      setFormError("Please fill in all the required job fields.");
      return;
    }
    setFormError("");

    const clean = (items: string[]) =>
      items.map((item) => item.trim()).filter(Boolean);

    const payload = {
      title: form.title.trim(),
      location: form.location.trim(),
      jobType: form.jobType,
      salaryRange: form.salaryRange.trim(),
      description: form.description.trim(),
      responsibilities: clean(form.responsibilities),
      requirements: clean(form.requirements),
      categoryId: form.categoryId ? Number(form.categoryId) : undefined,
    };

    if (editingJobId) {
      updateMutation.mutate({ id: editingJobId, ...payload });
    } else {
      createMutation.mutate(payload);
    }
    resetForm();
  };

  const handleDelete = (job: (typeof jobs)[number]) => {
    if (!window.confirm(`Are you sure you want to delete the job "${job.title}"?`)) return;
    deleteMutation.mutate({ id: job.id });
  };

  const companyName = company?.name ?? "Your Company";
  const companyLogo = company?.logoUrl ?? null;
  const initials = (companyName.split(" ").map((n) => n[0]).slice(0, 2).join("") || "C").toUpperCase();

  return (
    <>
      {/* Header */}
      <section className="relative py-12 md:py-16 bg-gradient-to-br from-white via-secondary/10 to-primary/8 overflow-hidden">
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
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary font-semibold px-4 py-1.5 rounded-full mb-4">
                  <Briefcase className="w-4 h-4" />
                  My Job Postings
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                  Manage Your Job Postings
                </h1>
                <p className="text-muted-foreground">
                  Post new jobs, add responsibilities and requirements, and edit or delete your listings.
                </p>
              </div>
            </div>
            <Button
              onClick={openCreateForm}
              className="bg-gradient-to-r from-primary to-accent text-white font-bold px-6 py-3 rounded-xl hover:shadow-lg hover:shadow-primary/40 transition-all duration-300 transform hover:scale-105 active:scale-95 shrink-0"
            >
              <Plus className="w-4 h-4" />
              Post a New Job
            </Button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-8 bg-gradient-to-b from-secondary/5 to-background border-b border-secondary/20">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl flex items-center justify-center text-primary">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-foreground">
                    {jobsQuery.isLoading ? <Skeleton className="h-8 w-12" /> : jobs.filter((j) => j.status === "approved").length}
                  </p>
                  <p className="text-sm text-muted-foreground">Approved</p>
                </div>
              </div>
            </Card>
            <Card className="p-6 bg-white border-2 border-secondary/20">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl flex items-center justify-center text-primary">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-foreground">
                    {jobsQuery.isLoading ? <Skeleton className="h-8 w-12" /> : jobs.filter((j) => j.status === "pending").length}
                  </p>
                  <p className="text-sm text-muted-foreground">Pending Review</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Post/Edit form */}
      {showForm && (
        <section className="py-10 bg-background">
          <div className="container">
            <Card className="p-8 bg-white border-2 border-primary/20 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-foreground">
                  {editingJobId ? "Edit Job Posting" : "Post a New Job"}
                </h2>
                <button
                  onClick={resetForm}
                  className="p-2 rounded-lg hover:bg-secondary/30 transition-colors duration-300"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-foreground">
                      Job Title <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      type="text"
                      placeholder="e.g. Senior Frontend Engineer"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      className="border-2 border-secondary/30 focus:border-primary/50 rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-foreground">
                      Location / Town <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary" />
                      <Input
                        type="text"
                        placeholder="Remote or city"
                        value={form.location}
                        onChange={(e) => setForm({ ...form, location: e.target.value })}
                        className="pl-10 border-2 border-secondary/30 focus:border-primary/50 rounded-lg"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-foreground">
                      Job Type
                    </Label>
                    <Select
                      value={form.jobType}
                      onValueChange={(v) => setForm({ ...form, jobType: v })}
                    >
                      <SelectTrigger className="w-full border-2 border-secondary/30 focus:border-primary/50 rounded-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {JOB_TYPES.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-foreground">
                      Category
                    </Label>
                    <Select
                      value={form.categoryId}
                      onValueChange={(v) => setForm({ ...form, categoryId: v })}
                    >
                      <SelectTrigger className="w-full border-2 border-secondary/30 focus:border-primary/50 rounded-lg">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((c, i) => (
                          <SelectItem key={c} value={String(i + 1)}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-foreground">
                      Salary Range <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-accent" />
                      <Input
                        type="text"
                        placeholder="e.g. $90k - $130k"
                        value={form.salaryRange}
                        onChange={(e) => setForm({ ...form, salaryRange: e.target.value })}
                        className="pl-10 border-2 border-secondary/30 focus:border-primary/50 rounded-lg"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-foreground">
                    Job Description <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    placeholder="Describe the role and what makes it exciting..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="border-2 border-secondary/30 focus:border-primary/50 rounded-lg min-h-[120px]"
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2 border-t border-secondary/20">
                  <ListEditor
                    label="Key Responsibilities"
                    icon={<ListChecks className="w-4 h-4 text-primary" />}
                    items={form.responsibilities}
                    onChange={(items) => setForm({ ...form, responsibilities: items })}
                    placeholder="e.g. Build and ship new features end-to-end"
                  />
                  <ListEditor
                    label="Requirements"
                    icon={<Target className="w-4 h-4 text-accent" />}
                    items={form.requirements}
                    onChange={(items) => setForm({ ...form, requirements: items })}
                    placeholder="e.g. 3+ years of experience with React"
                  />
                </div>

                {formError && (
                  <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm animate-in fade-in slide-in-from-top-2 duration-300">
                    {formError}
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <Button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="bg-gradient-to-r from-primary to-accent text-white font-bold px-6 py-3 rounded-lg hover:shadow-lg hover:shadow-primary/40 transition-all duration-300 flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {editingJobId ? "Save Changes" : "Post Job"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                    className="border-2 border-secondary/30 hover:border-primary/50 transition-colors duration-300"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </section>
      )}

      {/* Jobs listing */}
      <section className="py-12 bg-gradient-to-b from-background to-secondary/10">
        <div className="container">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-1">
                Your Job Posts
              </h2>
              <p className="text-muted-foreground text-sm">
                You can edit or delete these jobs. {jobs.length} total
              </p>
            </div>
          </div>

          {jobsQuery.isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="p-6 border-2 border-secondary/20">
                  <Skeleton className="h-6 w-2/3 mb-4" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-4/5 mb-4" />
                  <Skeleton className="h-10 w-full" />
                </Card>
              ))}
            </div>
          ) : jobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map((job) => (
                <Card
                  key={job.id}
                  className="p-6 hover:shadow-xl transition-all duration-300 hover:border-primary/50 hover:-translate-y-2 group bg-gradient-to-br from-white to-secondary/5 border-2 border-primary/30 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12 border-2 border-secondary/30 shadow shrink-0">
                          {companyLogo ? (
                            <AvatarImage src={companyLogo} alt={companyName} className="object-contain bg-white" />
                          ) : null}
                          <AvatarFallback className="text-sm font-bold bg-gradient-to-br from-primary to-accent text-white">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors duration-300 leading-snug">
                            {job.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">{job.company}</p>
                        </div>
                      </div>
                      <Badge
                        variant="secondary"
                        className={statusBadgeClass(job.status)}
                      >
                        {job.status}
                      </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {job.description}
                    </p>

                    <div className="space-y-2 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-primary" />
                        {job.location || "—"}
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-accent" />
                        {job.salaryRange || "—"}
                      </div>
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-purple-500" />
                        {job.jobType || "—"}
                      </div>
                      {job.responsibilities && job.responsibilities.length > 0 && (
                        <div className="flex items-center gap-2">
                          <ListChecks className="w-4 h-4 text-primary" />
                          {job.responsibilities.length} responsibilit{job.responsibilities.length === 1 ? "y" : "ies"}
                        </div>
                      )}
                      {job.requirements && job.requirements.length > 0 && (
                        <div className="flex items-center gap-2">
                          <Target className="w-4 h-4 text-accent" />
                          {job.requirements.length} requirement{job.requirements.length === 1 ? "" : "s"}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-secondary/20 mb-3">
                      <span>{formatRelative(job.createdAt)}</span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" />
                        {job.applicationCount ?? 0} application{job.applicationCount === 1 ? "" : "s"}
                      </span>
                    </div>

                    {/* Edit / Delete controls */}
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditForm(job)}
                        className="flex-1 border-2 border-primary/30 text-primary hover:border-primary/50 hover:bg-primary/5 transition-colors duration-300"
                      >
                        <Pencil className="w-4 h-4" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(job)}
                        disabled={deleteMutation.isPending}
                        className="flex-1 border-2 border-destructive/30 text-destructive hover:border-destructive/50 hover:bg-destructive/5 transition-colors duration-300"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-10 text-center bg-white border-2 border-secondary/20">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary/10 to-accent/10 rounded-full flex items-center justify-center mb-4">
                <Plus className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                You haven't posted any jobs yet
              </h3>
              <p className="text-muted-foreground mb-6">
                Post your first job to start reaching top talent.
              </p>
              <Button
                onClick={openCreateForm}
                className="bg-gradient-to-r from-primary to-accent text-white font-semibold px-6 rounded-lg hover:shadow-lg transition-all duration-300"
              >
                <Plus className="w-4 h-4" />
                Post a Job
              </Button>
            </Card>
          )}
        </div>
      </section>
    </>
  );
}

