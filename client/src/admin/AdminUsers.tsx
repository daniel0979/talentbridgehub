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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  ShieldCheck,
  Shield,
  Plus,
  Trash2,
  Ban,
  CheckCircle2,
  Mail,
} from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { useAdminAuth } from "@/_core/hooks/useAdminAuth";

const emptyForm = {
  name: "",
  email: "",
  password: "",
  role: "admin" as "admin" | "super_admin",
};

export default function AdminUsers() {
  const utils = trpc.useUtils();
  const { admin: currentAdmin } = useAdminAuth();
  const adminsQuery = trpc.admin.management.adminUsers.list.useQuery();
  const admins = adminsQuery.data ?? [];

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const createMutation = trpc.admin.management.adminUsers.create.useMutation({
    onSuccess: async () => {
      await utils.admin.management.adminUsers.list.invalidate();
      setDialogOpen(false);
      setForm(emptyForm);
      toast.success("Admin account created");
    },
    onError: (err) => toast.error(err.message),
  });

  const updateStatus = trpc.admin.management.adminUsers.updateStatus.useMutation({
    onSuccess: async () => {
      await utils.admin.management.adminUsers.list.invalidate();
      toast.success("Admin status updated");
    },
    onError: (err) => toast.error(err.message),
  });

  const updateRole = trpc.admin.management.adminUsers.updateRole.useMutation({
    onSuccess: async () => {
      await utils.admin.management.adminUsers.list.invalidate();
      toast.success("Admin role updated");
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = trpc.admin.management.adminUsers.delete.useMutation({
    onSuccess: async () => {
      await utils.admin.management.adminUsers.list.invalidate();
      toast.success("Admin account deleted");
    },
    onError: (err) => toast.error(err.message),
  });

  const activeCount = admins.filter((a) => a.status === "active").length;
  const superAdminCount = admins.filter((a) => a.role === "super_admin").length;

  const statCards = [
    {
      label: "Total Admins",
      value: admins.length,
      icon: ShieldCheck,
      color: "from-indigo-500 to-indigo-600",
    },
    {
      label: "Active",
      value: activeCount,
      icon: CheckCircle2,
      color: "from-emerald-500 to-emerald-600",
    },
    {
      label: "Super Admins",
      value: superAdminCount,
      icon: Shield,
      color: "from-purple-500 to-purple-600",
    },
  ];

  const handleCreate = () => {
    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!form.email.trim() || !/^\S+@\S+\.\S+$/.test(form.email)) {
      toast.error("A valid email is required");
      return;
    }
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    createMutation.mutate({
      name: form.name.trim(),
      email: form.email.trim(),
      password: form.password,
      role: form.role,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Users</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage admin portal accounts. Only super admins can
            access this page.
          </p>
        </div>
        <Button
          onClick={() => {
            setForm(emptyForm);
            setDialogOpen(true);
          }}
          className="bg-gradient-to-r from-primary to-accent text-white font-semibold"
        >
          <Plus className="w-4 h-4" />
          New Admin
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
                    {adminsQuery.isLoading ? (
                      <Skeleton className="h-8 w-12" />
                    ) : (
                      stat.value
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {stat.label}
                  </p>
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
            <ShieldCheck className="w-5 h-5 text-primary" />
            Admin Accounts
          </CardTitle>
          <CardDescription>
            {admins.length > 0
              ? `Showing ${admins.length} admin accounts.`
              : "No admin accounts yet."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {adminsQuery.isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : admins.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              No admin accounts yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Admin</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {admins.map((admin) => {
                    const isSelf = admin.id === currentAdmin?.id;
                    return (
                      <TableRow key={admin.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9 border">
                              <AvatarFallback className="text-xs font-medium bg-gradient-to-br from-primary to-accent text-white">
                                {(admin.name || "?").charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-foreground truncate flex items-center gap-2">
                                {admin.name}
                                {isSelf && (
                                  <span className="text-[10px] text-muted-foreground">
                                    (you)
                                  </span>
                                )}
                              </p>
                              <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                                <Mail className="w-3 h-3 shrink-0" />
                                {admin.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={
                              admin.role === "super_admin"
                                ? "bg-purple-100 text-purple-700 border-purple-200"
                                : "bg-primary/10 text-primary border-primary/30"
                            }
                          >
                            {admin.role === "super_admin" ? "Super Admin" : "Admin"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={
                              admin.status === "active"
                                ? "bg-green-100 text-green-700 border-green-200"
                                : "bg-destructive/10 text-destructive border-destructive/30"
                            }
                          >
                            {admin.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground whitespace-nowrap">
                            {new Date(admin.createdAt).toLocaleDateString()}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {admin.role !== "super_admin" ? (
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-2 border-purple-300 text-purple-700 hover:bg-purple-50"
                                onClick={() =>
                                  updateRole.mutate({
                                    id: admin.id,
                                    role: "super_admin",
                                  })
                                }
                                disabled={updateRole.isPending}
                              >
                                <Shield className="w-3.5 h-3.5" />
                                Make Super
                              </Button>
                            ) : (
                              !isSelf && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-2 border-secondary/30 text-muted-foreground hover:bg-secondary/10"
                                  onClick={() =>
                                    updateRole.mutate({
                                      id: admin.id,
                                      role: "admin",
                                    })
                                  }
                                  disabled={updateRole.isPending}
                                >
                                  <Shield className="w-3.5 h-3.5" />
                                  Demote
                                </Button>
                              )
                            )}
                            {admin.status === "active" ? (
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-2 border-amber-300 text-amber-700 hover:bg-amber-50"
                                onClick={() =>
                                  updateStatus.mutate({
                                    id: admin.id,
                                    status: "inactive",
                                  })
                                }
                                disabled={updateStatus.isPending || isSelf}
                              >
                                <Ban className="w-3.5 h-3.5" />
                                Deactivate
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-2 border-green-300 text-green-700 hover:bg-green-50"
                                onClick={() =>
                                  updateStatus.mutate({
                                    id: admin.id,
                                    status: "active",
                                  })
                                }
                                disabled={updateStatus.isPending}
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Activate
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-2 border-destructive/30 text-destructive hover:bg-destructive/5"
                              onClick={() => {
                                if (
                                  confirm(
                                    `Delete admin account "${admin.email}"?`
                                  )
                                ) {
                                  deleteMutation.mutate({ id: admin.id });
                                }
                              }}
                              disabled={deleteMutation.isPending || isSelf}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create dialog */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!open) setDialogOpen(false);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Admin Account</DialogTitle>
            <DialogDescription>
              New admins can log into the admin portal with their email and
              password.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. John Doe"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="admin@talentbridgehub.com"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
                placeholder="At least 6 characters"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={form.role}
                onValueChange={(v) =>
                  setForm({ ...form, role: v as "admin" | "super_admin" })
                }
              >
                <SelectTrigger id="role" className="w-full">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={createMutation.isPending}
              className="bg-gradient-to-r from-primary to-accent text-white"
            >
              {createMutation.isPending ? "Creating…" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

</div>
  );
}
