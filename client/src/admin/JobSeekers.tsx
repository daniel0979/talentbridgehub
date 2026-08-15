import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, MapPin, Mail, Phone, Tag, KeyRound, Loader2 } from "lucide-react";
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

function parseSkills(skills: string | null | undefined): string[] {
  if (!skills) return [];
  try {
    const parsed = JSON.parse(skills);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function statusBadgeClass(status: string) {
  if (status === "active") return "bg-green-100 text-green-700 border-green-200";
  if (status === "suspended") return "bg-destructive/10 text-destructive border-destructive/30";
  return "bg-secondary text-muted-foreground border-secondary";
}

export default function JobSeekers() {
  const utils = trpc.useUtils();
  const seekersQuery = trpc.admin.management.jobSeekers.list.useQuery();
  const seekers = seekersQuery.data ?? [];

  const [resetTarget, setResetTarget] = useState<{
    id: number;
    name: string;
    email: string;
  } | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const resetPassword = trpc.admin.management.jobSeekers.resetPassword.useMutation({
    onSuccess: async () => {
      toast.success("Password reset successfully. Share the new password with the job seeker.");
      setResetTarget(null);
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetTarget) return;
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    resetPassword.mutate({ id: resetTarget.id, password: newPassword });
  };

  const activeCount = seekers.filter((s) => s.status === "active").length;
  const suspendedCount = seekers.length - activeCount;

  const statCards = [
    {
      label: "Total Job Seekers",
      value: seekers.length,
      icon: Users,
      color: "from-blue-500 to-blue-600",
    },
    {
      label: "Active",
      value: activeCount,
      icon: Users,
      color: "from-emerald-500 to-emerald-600",
    },
    {
      label: "Suspended",
      value: suspendedCount,
      icon: Users,
      color: "from-amber-500 to-amber-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Job Seekers</h1>
        <p className="text-muted-foreground mt-1">
          All registered job seekers on the platform.
        </p>
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
                    {seekersQuery.isLoading ? (
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
            <Users className="w-5 h-5 text-primary" />
            Job Seekers List
          </CardTitle>
          <CardDescription>
            {seekers.length > 0
              ? `Showing ${seekers.length} registered job seekers.`
              : "No job seekers registered yet."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {seekersQuery.isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : seekers.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              No job seekers registered yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job Seeker</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Skills</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {seekers.map((seeker) => {
                  const skills = parseSkills(seeker.skills);
                  return (
                    <TableRow key={seeker.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 border">
                            <AvatarFallback className="text-xs font-medium bg-gradient-to-br from-primary to-accent text-white">
                              {(seeker.name || "?").charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {seeker.name || "Unnamed"}
                            </p>
                            {seeker.headline && (
                              <p className="text-xs text-muted-foreground truncate">
                                {seeker.headline}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-sm">
                          <p className="flex items-center gap-1.5 text-muted-foreground">
                            <Mail className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">{seeker.email}</span>
                          </p>
                          {seeker.phone && (
                            <p className="flex items-center gap-1.5 text-muted-foreground">
                              <Phone className="w-3.5 h-3.5 shrink-0" />
                              {seeker.phone}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <MapPin className="w-3.5 h-3.5 shrink-0" />
                          {seeker.location || "—"}
                        </p>
                      </TableCell>
                      <TableCell>
                        {skills.length > 0 ? (
                          <div className="flex flex-wrap gap-1 max-w-[220px]">
                            {skills.slice(0, 3).map((skill, i) => (
                              <span
                                key={i}
                                className="inline-flex items-center gap-1 rounded-md bg-primary/10 text-primary px-1.5 py-0.5 text-[11px] font-medium"
                              >
                                <Tag className="w-2.5 h-2.5" />
                                {skill}
                              </span>
                            ))}
                            {skills.length > 3 && (
                              <span className="text-[11px] text-muted-foreground">
                                +{skills.length - 3}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={statusBadgeClass(seeker.status)}
                        >
                          {seeker.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground whitespace-nowrap">
                          {formatDate(seeker.createdAt)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-primary/40 text-primary hover:border-primary/60 hover:bg-primary/5 transition-colors duration-300"
                          onClick={() => {
                            setNewPassword("");
                            setConfirmPassword("");
                            setResetTarget({
                              id: seeker.id,
                              name: seeker.name || "Unnamed",
                              email: seeker.email,
                            });
                          }}
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                          Reset Password
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Reset password dialog */}
      <Dialog open={resetTarget !== null} onOpenChange={(open) => !open && setResetTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Set a new password for{" "}
              <span className="font-semibold text-foreground">
                {resetTarget?.name}
              </span>{" "}
              ({resetTarget?.email}). Share the new password with them securely.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleResetSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                minLength={6}
              />
              <p className="text-xs text-muted-foreground">
                Must be at least 6 characters.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                minLength={6}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setResetTarget(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={resetPassword.isPending}
                className="bg-gradient-to-r from-primary via-primary to-accent text-white font-bold"
              >
                {resetPassword.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Resetting…
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    Reset Password
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
