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
  Activity,
  Search,
  User,
  FileText,
  RotateCcw,
} from "lucide-react";
import { useMemo, useState } from "react";

type LogRow = {
  id: number;
  adminId: number;
  adminName: string | null;
  action: string;
  targetType: string;
  targetId: number | null;
  createdAt: Date | string;
};

const ACTION_COLORS: Record<string, string> = {
  login: "bg-blue-100 text-blue-700 border-blue-200",
  logout: "bg-slate-100 text-slate-700 border-slate-200",
  company_approved: "bg-green-100 text-green-700 border-green-200",
  company_suspended: "bg-rose-100 text-rose-700 border-rose-200",
  company_pending: "bg-amber-100 text-amber-700 border-amber-200",
  job_approved: "bg-green-100 text-green-700 border-green-200",
  job_rejected: "bg-rose-100 text-rose-700 border-rose-200",
  job_updated: "bg-indigo-100 text-indigo-700 border-indigo-200",
  job_deleted: "bg-rose-100 text-rose-700 border-rose-200",
  career_tip_published: "bg-green-100 text-green-700 border-green-200",
  career_tip_draft: "bg-amber-100 text-amber-700 border-amber-200",
  career_tip_updated: "bg-indigo-100 text-indigo-700 border-indigo-200",
  career_tip_deleted: "bg-rose-100 text-rose-700 border-rose-200",
  category_created: "bg-emerald-100 text-emerald-700 border-emerald-200",
  category_updated: "bg-indigo-100 text-indigo-700 border-indigo-200",
  category_deleted: "bg-rose-100 text-rose-700 border-rose-200",
  location_created: "bg-emerald-100 text-emerald-700 border-emerald-200",
  location_updated: "bg-indigo-100 text-indigo-700 border-indigo-200",
  location_deleted: "bg-rose-100 text-rose-700 border-rose-200",
  admin_created: "bg-purple-100 text-purple-700 border-purple-200",
  admin_deleted: "bg-rose-100 text-rose-700 border-rose-200",
  admin_active: "bg-green-100 text-green-700 border-green-200",
  admin_inactive: "bg-amber-100 text-amber-700 border-amber-200",
  admin_role_admin: "bg-slate-100 text-slate-700 border-slate-200",
  admin_role_super_admin: "bg-purple-100 text-purple-700 border-purple-200",
  maintenance_enabled: "bg-orange-100 text-orange-700 border-orange-200",
  maintenance_disabled: "bg-green-100 text-green-700 border-green-200",
  message_sent: "bg-cyan-100 text-cyan-700 border-cyan-200",
};

function defaultActionColor() {
  return "bg-secondary text-muted-foreground border-secondary";
}

function formatDateTime(value: Date | string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function humanizeAction(action: string) {
  return action.split("_").join(" ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function ActivityLog() {
  const logsQuery = trpc.admin.dashboard.allActivityLogs.useQuery();
  const logs = logsQuery.data ?? [];
  const [searchTerm, setSearchTerm] = useState("");

  const filteredLogs = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return logs;
    return logs.filter((log) =>
      `${log.action} ${log.targetType} ${log.adminName ?? ""}`
        .toLowerCase()
        .includes(term)
    );
  }, [logs, searchTerm]);

  const counts = useMemo(() => {
    const byType = new Map<string, number>();
    for (const log of logs) {
      byType.set(log.targetType, (byType.get(log.targetType) ?? 0) + 1);
    }
    return byType;
  }, [logs]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Activity Log</h1>
        <p className="text-muted-foreground mt-1">
          Full audit trail of admin actions across the platform.
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-2 border-secondary/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shrink-0">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground leading-none">
                  {logsQuery.isLoading ? (
                    <Skeleton className="h-8 w-12" />
                  ) : (
                    logs.length
                  )}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Total Events
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        {["company", "job", "admin", "settings"].map((type) => (
          <Card key={type} className="border-2 border-secondary/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary/70 to-accent/70 rounded-xl flex items-center justify-center text-white shadow-lg shrink-0">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-foreground leading-none">
                    {counts.get(type) ?? 0}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2 capitalize">
                    {type}
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
            <Activity className="w-5 h-5 text-primary" />
            Audit Trail
          </CardTitle>
          <CardDescription>
            {filteredLogs.length > 0
              ? `Showing ${filteredLogs.length} of ${logs.length} events.`
              : "No activity recorded yet."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by action, target, or admin..."
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border-2 border-secondary/30 bg-background focus:border-primary/50 focus:outline-none focus:ring-0"
              />
            </div>
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

          {logsQuery.isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filteredLogs.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              {searchTerm
                ? "No matching activity."
                : "No admin activity recorded yet."}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Admin</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-primary shrink-0" />
                          <span className="text-sm text-foreground truncate">
                            {log.adminName || "Unknown"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={
                            ACTION_COLORS[log.action] ?? defaultActionColor()
                          }
                        >
                          {humanizeAction(log.action)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {log.targetType}
                          {log.targetId ? ` #${log.targetId}` : ""}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground whitespace-nowrap">
                          {formatDateTime(log.createdAt)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
