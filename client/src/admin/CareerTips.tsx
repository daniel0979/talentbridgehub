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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FileText,
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Clock,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

const TIP_CATEGORIES = [
  "Resume",
  "Interview",
  "Salary",
  "Career Growth",
  "Job Search",
];

function formatDate(value: Date | string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

type TipRow = {
  id: number;
  title: string;
  category: string;
  readTime: string;
  excerpt: string;
  content: string[];
  status: "draft" | "published";
  createdAt: Date | string;
  updatedAt: Date | string;
};

const emptyForm = {
  title: "",
  category: "Career Growth",
  readTime: "5 min read",
  excerpt: "",
  content: [""],
  status: "draft" as "draft" | "published",
};

export default function CareerTips() {
  const utils = trpc.useUtils();
  const tipsQuery = trpc.admin.management.careerTips.list.useQuery();
  const tips = tipsQuery.data ?? [];

  const [dialogType, setDialogType] = useState<"create" | "edit" | null>(null);
  const [editing, setEditing] = useState<TipRow | null>(null);
  const [form, setForm] = useState(emptyForm);

  const createMutation = trpc.admin.management.careerTips.create.useMutation({
    onSuccess: async () => {
      await utils.admin.management.careerTips.list.invalidate();
      setDialogType(null);
      setForm(emptyForm);
      toast.success("Career tip created");
    },
    onError: (err) => toast.error(err.message),
  });

  const updateMutation = trpc.admin.management.careerTips.update.useMutation({
    onSuccess: async () => {
      await utils.admin.management.careerTips.list.invalidate();
      setDialogType(null);
      toast.success("Career tip updated");
    },
    onError: (err) => toast.error(err.message),
  });

  const updateStatusMutation =
    trpc.admin.management.careerTips.updateStatus.useMutation({
      onSuccess: async () => {
        await utils.admin.management.careerTips.list.invalidate();
        toast.success("Career tip status updated");
      },
      onError: (err) => toast.error(err.message),
    });

  const deleteMutation = trpc.admin.management.careerTips.delete.useMutation({
    onSuccess: async () => {
      await utils.admin.management.careerTips.list.invalidate();
      toast.success("Career tip deleted");
    },
    onError: (err) => toast.error(err.message),
  });

  const publishedCount = tips.filter((t) => t.status === "published").length;
  const draftCount = tips.filter((t) => t.status === "draft").length;

  const statCards = [
    {
      label: "Total Tips",
      value: tips.length,
      icon: FileText,
      color: "from-blue-500 to-blue-600",
    },
    {
      label: "Published",
      value: publishedCount,
      icon: Eye,
      color: "from-emerald-500 to-emerald-600",
    },
    {
      label: "Drafts",
      value: draftCount,
      icon: EyeOff,
      color: "from-amber-500 to-amber-600",
    },
  ];

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogType("create");
  };

  const openEdit = (tip: TipRow) => {
    setEditing(tip);
    setForm({
      title: tip.title,
      category: tip.category,
      readTime: tip.readTime,
      excerpt: tip.excerpt ?? "",
      content: tip.content.length > 0 ? tip.content : [""],
      status: tip.status,
    });
    setDialogType("edit");
  };

  const handleSave = () => {
    const content = form.content.map((c) => c.trim()).filter(Boolean);
    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (content.length === 0) {
      toast.error("Add at least one content paragraph");
      return;
    }
    const payload = {
      title: form.title.trim(),
      category: form.category,
      readTime: form.readTime.trim() || "5 min read",
      excerpt: form.excerpt.trim(),
      content,
      status: form.status,
    };
    if (dialogType === "edit" && editing) {
      updateMutation.mutate({ id: editing.id, ...payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Career Tips</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage career tips. Published tips appear on the public
            Career Tips page.
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="bg-gradient-to-r from-primary to-accent text-white font-semibold"
        >
          <Plus className="w-4 h-4" />
          New Tip
        </Button>
      </div>

      {/* Count cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                    {tipsQuery.isLoading ? (
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
            <FileText className="w-5 h-5 text-primary" />
            Career Tips List
          </CardTitle>
          <CardDescription>
            {tips.length > 0
              ? `Showing ${tips.length} career tips.`
              : "No career tips yet. Create your first tip."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {tipsQuery.isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : tips.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              No career tips yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tip</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tips.map((tip) => (
                    <TableRow key={tip.id}>
                      <TableCell>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {tip.title}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {tip.excerpt || "—"}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className="bg-primary/10 text-primary border-primary/30"
                        >
                          {tip.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={
                            tip.status === "published"
                              ? "bg-green-100 text-green-700 border-green-200"
                              : "bg-amber-100 text-amber-700 border-amber-200"
                          }
                        >
                          {tip.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground whitespace-nowrap">
                          {formatDate(tip.createdAt)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {tip.status === "published" ? (
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-2 border-amber-300 text-amber-700 hover:bg-amber-50 transition-colors"
                              onClick={() =>
                                updateStatusMutation.mutate({
                                  id: tip.id,
                                  status: "draft",
                                })
                              }
                              disabled={updateStatusMutation.isPending}
                            >
                              <EyeOff className="w-3.5 h-3.5" />
                              Unpublish
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-2 border-green-300 text-green-700 hover:bg-green-50 transition-colors"
                              onClick={() =>
                                updateStatusMutation.mutate({
                                  id: tip.id,
                                  status: "published",
                                })
                              }
                              disabled={updateStatusMutation.isPending}
                            >
                              <Eye className="w-3.5 h-3.5" />
                              Publish
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-2 border-primary/30 text-primary hover:bg-primary/5 transition-colors"
                            onClick={() => openEdit(tip)}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-2 border-destructive/30 text-destructive hover:bg-destructive/5 transition-colors"
                            onClick={() => {
                              if (confirm(`Delete tip "${tip.title}"?`)) {
                                deleteMutation.mutate({ id: tip.id });
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

      {/* Create / Edit dialog */}
      <Dialog
        open={dialogType !== null}
        onOpenChange={(open) => {
          if (!open) setDialogType(null);
        }}
      >
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {dialogType === "edit" ? "Edit Career Tip" : "New Career Tip"}
            </DialogTitle>
            <DialogDescription>
              Fill in the details below. Published tips show on the public
              Career Tips page.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Craft a Resume That Gets Noticed"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => setForm({ ...form, category: v })}
                >
                  <SelectTrigger id="category" className="w-full">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIP_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="readTime">Read Time</Label>
                <Input
                  id="readTime"
                  value={form.readTime}
                  onChange={(e) =>
                    setForm({ ...form, readTime: e.target.value })
                  }
                  placeholder="e.g. 5 min read"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="excerpt">Excerpt</Label>
              <Textarea
                id="excerpt"
                value={form.excerpt}
                onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                placeholder="Short summary shown on the tip card"
                className="min-h-[60px]"
              />
            </div>

            <div className="grid gap-2">
              <Label>Content (paragraphs)</Label>
              <div className="space-y-2">
                {form.content.map((para, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <Textarea
                      value={para}
                      onChange={(e) => {
                        const next = [...form.content];
                        next[i] = e.target.value;
                        setForm({ ...form, content: next });
                      }}
                      placeholder={`Paragraph ${i + 1}`}
                      className="min-h-[60px]"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="shrink-0 border-destructive/30 text-destructive hover:bg-destructive/5 mt-1"
                      onClick={() => {
                        const next = form.content.filter((_, idx) => idx !== i);
                        setForm({
                          ...form,
                          content: next.length > 0 ? next : [""],
                        });
                      }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="text-primary border-primary/30 hover:bg-primary/5"
                  onClick={() =>
                    setForm({ ...form, content: [...form.content, ""] })
                  }
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add paragraph
                </Button>
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Status</Label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, status: "draft" })}
                  className={`flex-1 px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                    form.status === "draft"
                      ? "border-amber-400 bg-amber-50 text-amber-700"
                      : "border-secondary/30 text-muted-foreground hover:border-amber-300"
                  }`}
                >
                  <EyeOff className="w-4 h-4" />
                  Draft
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, status: "published" })}
                  className={`flex-1 px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                    form.status === "published"
                      ? "border-green-400 bg-green-50 text-green-700"
                      : "border-secondary/30 text-muted-foreground hover:border-green-300"
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  Publish
                </button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogType(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={createMutation.isPending || updateMutation.isPending}
              className="bg-gradient-to-r from-primary to-accent text-white"
            >
              {createMutation.isPending || updateMutation.isPending
                ? "Saving…"
                : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
