import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Building2,
  Globe,
  Mail,
  MapPin,
  BadgeCheck,
  CircleDollarSign,
  Check,
  Ban,
  MessageSquare,
  KeyRound,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { AdminChatDialog } from "./AdminChatDialog";
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
  if (status === "suspended") return "bg-destructive/10 text-destructive border-destructive/30";
  if (status === "pending") return "bg-amber-100 text-amber-700 border-amber-200";
  return "bg-secondary text-muted-foreground border-secondary";
}

export default function Companies() {
  const utils = trpc.useUtils();
  const companiesQuery = trpc.admin.management.companies.list.useQuery();
  const companies = companiesQuery.data ?? [];

  const [chatCompany, setChatCompany] = useState<{
    id: number;
    name: string;
    logoUrl: string | null;
  } | null>(null);

  const conversationsQuery = trpc.admin.messages.conversations.useQuery(undefined, {
    refetchInterval: 5000,
  });
  const conversations = conversationsQuery.data ?? [];
  const unreadByCompany = new Map(
    conversations.map((c) => [c.companyId, c.unread])
  );

  const updateStatus = trpc.admin.management.companies.updateStatus.useMutation({
    onSuccess: async () => {
      await utils.admin.management.companies.list.invalidate();
      toast.success("Company status updated");
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const [resetTarget, setResetTarget] = useState<{
    id: number;
    name: string;
    email: string;
  } | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const resetPassword = trpc.admin.management.companies.resetPassword.useMutation({
    onSuccess: async () => {
      toast.success("Password reset successfully. Share the new password with the company.");
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

  const approvedCount = companies.filter((c) => c.status === "approved").length;
  const pendingCount = companies.filter((c) => c.status === "pending").length;
  const suspendedCount = companies.filter((c) => c.status === "suspended").length;

  const statCards = [
    {
      label: "Total Companies",
      value: companies.length,
      icon: Building2,
      color: "from-purple-500 to-purple-600",
    },
    {
      label: "Approved",
      value: approvedCount,
      icon: BadgeCheck,
      color: "from-emerald-500 to-emerald-600",
    },
    {
      label: "Pending Approval",
      value: pendingCount,
      icon: CircleDollarSign,
      color: "from-amber-500 to-amber-600",
    },
    {
      label: "Suspended",
      value: suspendedCount,
      icon: Building2,
      color: "from-rose-500 to-rose-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Companies</h1>
        <p className="text-muted-foreground mt-1">
          All companies registered on the platform.
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
                    {companiesQuery.isLoading ? (
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
            <Building2 className="w-5 h-5 text-primary" />
            Companies List
          </CardTitle>
          <CardDescription>
            {companies.length > 0
              ? `Showing ${companies.length} registered companies.`
              : "No companies registered yet."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {companiesQuery.isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : companies.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              No companies registered yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Industry</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Website</TableHead>
<TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {companies.map((company) => (
                  <TableRow key={company.id}>
                    <TableCell>
<div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border">
                          {company.logoUrl ? (
                            <AvatarImage
                              src={company.logoUrl}
                              alt={company.name || "Company logo"}
                              className="object-cover"
                            />
                          ) : null}
                          <AvatarFallback className="text-xs font-medium bg-gradient-to-br from-purple-500 to-accent text-white">
                            {(company.name || "?").charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {company.name || "Unnamed"}
                          </p>
                          {company.contactName && (
                            <p className="text-xs text-muted-foreground truncate">
                              {company.contactName}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1 text-sm">
                        <p className="flex items-center gap-1.5 text-muted-foreground">
                          <Mail className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{company.ownerEmail || "—"}</span>
                        </p>
                        {company.phone && (
                          <p className="text-muted-foreground">{company.phone}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {company.industry || "—"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        {company.town || "—"}
                      </p>
                    </TableCell>
                    <TableCell>
                      {company.website ? (
                        <a
                          href={company.website}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 text-sm text-primary hover:underline"
                        >
                          <Globe className="w-3.5 h-3.5 shrink-0" />
                          Visit
                        </a>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={statusBadgeClass(company.status)}
                      >
                        {company.status}
                      </Badge>
                    </TableCell>
<TableCell>
                      <span className="text-sm text-muted-foreground whitespace-nowrap">
                        {formatDate(company.createdAt)}
                      </span>
                    </TableCell>
<TableCell>
                      <div className="flex items-center gap-2 flex-wrap">
                        {(unreadByCompany.get(company.id) ?? 0) > 0 && (
                          <Badge
                            variant="secondary"
                            className="bg-primary/15 text-primary border-primary/30"
                            title="Unread messages from this company"
                          >
                            {unreadByCompany.get(company.id)} new
                          </Badge>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-primary/40 text-primary hover:border-primary/60 hover:bg-primary/5 transition-colors duration-300"
                          onClick={() =>
                            setChatCompany({
                              id: company.id,
                              name: company.name || "Unnamed",
                              logoUrl: company.logoUrl,
                            })
                          }
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          Chat
                        </Button>
                        {company.status !== "approved" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-2 border-green-300 text-green-700 hover:border-green-400 hover:bg-green-50 transition-colors duration-300"
                            onClick={() =>
                              updateStatus.mutate({
                                id: company.id,
                                status: "approved",
                              })
                            }
                            disabled={updateStatus.isPending}
                          >
                            <Check className="w-4 h-4" />
                            Approve
                          </Button>
                        )}
                        {company.status !== "suspended" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-2 border-destructive/30 text-destructive hover:border-destructive/50 hover:bg-destructive/5 transition-colors duration-300"
                            onClick={() =>
                              updateStatus.mutate({
                                id: company.id,
                                status: "suspended",
                              })
                            }
                            disabled={updateStatus.isPending}
                          >
                          <Ban className="w-4 h-4" />
                            Suspend
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-primary/40 text-primary hover:border-primary/60 hover:bg-primary/5 transition-colors duration-300"
                          onClick={() => {
                            setNewPassword("");
                            setConfirmPassword("");
                            setResetTarget({
                              id: company.id,
                              name: company.name || "Unnamed",
                              email: company.ownerEmail || "",
                            });
                          }}
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                          Reset Password
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
)}
        </CardContent>
      </Card>

      {chatCompany && (
        <AdminChatDialog
          company={chatCompany}
          open={chatCompany !== null}
          onOpenChange={(open) => {
            if (!open) setChatCompany(null);
          }}
          onConversationChanged={() => {
            utils.admin.messages.conversations.invalidate();
          }}
        />
      )}

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
