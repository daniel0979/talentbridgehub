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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Bell,
  CheckCheck,
  CheckCircle2,
  Clock,
  KeyRound,
  Loader2,
  Mail,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

function formatDate(value: Date | string | null | undefined) {
  if (!value) return "-";
  return new Date(value).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function extractEmail(content: string) {
  return content.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] ?? "";
}

type ResetTarget = {
  notificationId: number;
  accountType: "job_seeker" | "company";
  accountId: number;
  name: string;
  email: string;
} | null;

export default function Notifications() {
  const utils = trpc.useUtils();
  const notificationsQuery = trpc.admin.notifications.list.useQuery();
  const seekersQuery = trpc.admin.management.jobSeekers.list.useQuery();
  const companiesQuery = trpc.admin.management.companies.list.useQuery();
  const notifications = notificationsQuery.data ?? [];
  const seekers = seekersQuery.data ?? [];
  const companies = companiesQuery.data ?? [];

  const [resetTarget, setResetTarget] = useState<ResetTarget>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const seekersByEmail = useMemo(() => {
    return new Map(seekers.map((seeker) => [seeker.email.toLowerCase(), seeker]));
  }, [seekers]);

  const companiesByEmail = useMemo(() => {
    return new Map(
      companies
        .filter((company) => company.ownerEmail)
        .map((company) => [company.ownerEmail!.toLowerCase(), company])
    );
  }, [companies]);

  const passwordRequests = useMemo(() => {
    return notifications
      .filter((notification) => notification.type === "password_reset")
      .map((notification) => {
        const email = extractEmail(notification.content).toLowerCase();
        const isCompanyRequest = /company/i.test(
          `${notification.title} ${notification.content}`
        );
        const company = email ? companiesByEmail.get(email) : undefined;
        const seeker = email ? seekersByEmail.get(email) : undefined;
        const accountType: "company" | "job_seeker" = isCompanyRequest
          ? "company"
          : "job_seeker";
        return {
          notification,
          email,
          accountType,
          company,
          seeker,
        };
      });
  }, [companiesByEmail, notifications, seekersByEmail]);

  const unreadCount = notifications.filter((item) => item.isRead === "unread").length;
  const pendingPasswordCount = passwordRequests.filter(
    (item) => item.notification.isRead === "unread"
  ).length;

  const markRead = trpc.admin.notifications.markRead.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.admin.notifications.list.invalidate(),
        utils.admin.notifications.unreadCount.invalidate(),
      ]);
    },
    onError: (err) => toast.error(err.message),
  });

  const markAllRead = trpc.admin.notifications.markAllRead.useMutation({
    onSuccess: async () => {
      toast.success("All notifications marked as read.");
      await Promise.all([
        utils.admin.notifications.list.invalidate(),
        utils.admin.notifications.unreadCount.invalidate(),
      ]);
    },
    onError: (err) => toast.error(err.message),
  });

  const resetPassword = trpc.admin.management.jobSeekers.resetPassword.useMutation({
    onSuccess: async () => handleResetSuccess("job seeker"),
    onError: (err) => toast.error(err.message),
  });

  const resetCompanyPassword = trpc.admin.management.companies.resetPassword.useMutation({
    onSuccess: async () => handleResetSuccess("company"),
    onError: (err) => toast.error(err.message),
  });

  const handleResetSuccess = async (accountLabel: "job seeker" | "company") => {
    if (resetTarget) {
      await markRead.mutateAsync({ id: resetTarget.notificationId });
    }
    toast.success(
      `Password reset successfully. Share the new password with the ${accountLabel}.`
    );
    setResetTarget(null);
    setNewPassword("");
    setConfirmPassword("");
    await Promise.all([
      utils.admin.management.jobSeekers.list.invalidate(),
      utils.admin.management.companies.list.invalidate(),
    ]);
  };

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
    if (resetTarget.accountType === "company") {
      resetCompanyPassword.mutate({ id: resetTarget.accountId, password: newPassword });
      return;
    }
    resetPassword.mutate({ id: resetTarget.accountId, password: newPassword });
  };

  const isLoading =
    notificationsQuery.isLoading || seekersQuery.isLoading || companiesQuery.isLoading;
  const isResetting = resetPassword.isPending || resetCompanyPassword.isPending;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
          <p className="text-muted-foreground mt-1">
            Password reset requests and admin alerts.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => markAllRead.mutate()}
          disabled={markAllRead.isPending || unreadCount === 0}
          className="border-2 border-primary/30 text-primary hover:border-primary/50 hover:bg-primary/5"
        >
          {markAllRead.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <CheckCheck className="w-4 h-4" />
          )}
          Mark all read
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-2 border-secondary/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center text-white shadow-lg shrink-0">
                <Bell className="w-6 h-6" />
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground leading-none">
                  {isLoading ? <Skeleton className="h-8 w-12" /> : notifications.length}
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
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground leading-none">
                  {isLoading ? <Skeleton className="h-8 w-12" /> : unreadCount}
                </p>
                <p className="text-sm text-muted-foreground mt-2">Unread</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-2 border-secondary/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center text-white shadow-lg shrink-0">
                <KeyRound className="w-6 h-6" />
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground leading-none">
                  {isLoading ? <Skeleton className="h-8 w-12" /> : pendingPasswordCount}
                </p>
                <p className="text-sm text-muted-foreground mt-2">Password resets</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-2 border-secondary/20">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-primary" />
            Password Reset Requests
          </CardTitle>
          <CardDescription>
            Job seekers listed here requested help from the forgot password dialog.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : passwordRequests.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              No password reset requests yet.
            </p>
          ) : (
            <div className="space-y-3">
              {passwordRequests.map(({ notification, email, accountType, company, seeker }) => {
                const account = accountType === "company" ? company : seeker;
                const accountLabel = accountType === "company" ? "Company" : "Job seeker";
                return (
                <div
                  key={notification.id}
                  className="flex flex-col gap-4 rounded-lg border-2 border-secondary/20 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant="secondary"
                        className={
                          notification.isRead === "unread"
                            ? "bg-amber-100 text-amber-700 border-amber-200"
                            : "bg-green-100 text-green-700 border-green-200"
                        }
                      >
                        {notification.isRead === "unread" ? "Needs reset" : "Handled"}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(notification.createdAt)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {account?.name ?? `Unknown ${accountLabel.toLowerCase()}`}
                      </p>
                      <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Mail className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{email || "No email found"}</span>
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {account
                        ? `Reset this ${accountLabel.toLowerCase()}'s password, then share the new password with them securely.`
                        : `This email could not be matched to a registered ${accountLabel.toLowerCase()}.`}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 sm:justify-end">
                    {notification.isRead === "unread" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => markRead.mutate({ id: notification.id })}
                        disabled={markRead.isPending}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Mark read
                      </Button>
                    )}
                    <Button
                      size="sm"
                      disabled={!account}
                      onClick={() => {
                        if (!account) return;
                        setNewPassword("");
                        setConfirmPassword("");
                        setResetTarget({
                          notificationId: notification.id,
                          accountType,
                          accountId: account.id,
                          name: account.name || "Unnamed",
                          email:
                            accountType === "company"
                              ? company?.ownerEmail || email
                              : seeker?.email || email,
                        });
                      }}
                      className="bg-gradient-to-r from-primary via-primary to-accent text-white font-bold"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      Reset Password
                    </Button>
                  </div>
                </div>
              )})}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={resetTarget !== null} onOpenChange={(open) => !open && setResetTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Set a new password for{" "}
              <span className="font-semibold text-foreground">
                {resetTarget?.name}
              </span>{" "}
              ({resetTarget?.email}). After this, the account can sign in with the
              new password.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleResetSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="notificationNewPassword">New Password</Label>
              <Input
                id="notificationNewPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter at least 6 characters"
                minLength={6}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notificationConfirmPassword">Confirm Password</Label>
              <Input
                id="notificationConfirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm the new password"
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
                disabled={isResetting}
                className="bg-gradient-to-r from-primary via-primary to-accent text-white font-bold"
              >
                {isResetting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Resetting...
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
