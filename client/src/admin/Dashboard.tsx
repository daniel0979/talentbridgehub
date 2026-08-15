import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Activity,
  Briefcase,
  Building2,
  CheckCircle2,
  Clock,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function AdminDashboard() {
  const statsQuery = trpc.admin.dashboard.stats.useQuery();
  const recentSeekersQuery = trpc.admin.dashboard.recentJobSeekers.useQuery();
  const recentPostsQuery = trpc.admin.dashboard.recentJobPosts.useQuery();
  const activityQuery = trpc.admin.dashboard.activityLogs.useQuery();

  const stats = statsQuery.data;

  const statCards = [
    {
      label: "Total Job Seekers",
      value: stats?.totalJobSeekers ?? 0,
      icon: Users,
      color: "from-blue-500 to-blue-600",
    },
    {
      label: "Total Companies",
      value: stats?.totalCompanies ?? 0,
      icon: Building2,
      color: "from-purple-500 to-purple-600",
    },
    {
      label: "Active Job Posts",
      value: stats?.totalActiveJobs ?? 0,
      icon: Briefcase,
      color: "from-emerald-500 to-emerald-600",
    },
    {
      label: "Pending Approvals",
      value: stats?.pendingCompanyApprovals ?? 0,
      icon: CheckCircle2,
      color: "from-amber-500 to-amber-600",
    },
  ];

  const signupsChartData = stats?.signupsOverTime ?? [];
  const jobsChartData = stats?.jobPostsOverTime ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Platform-wide overview of TalentBridge Hub.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label} className="border-2 border-secondary/20 hover:border-primary/40 transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center text-white shadow-lg shrink-0`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-foreground leading-none">
                    {statsQuery.isLoading ? <Skeleton className="h-8 w-12" /> : stat.value}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-2 border-secondary/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Signups Over Time
            </CardTitle>
            <CardDescription>New job seeker registrations by month</CardDescription>
          </CardHeader>
          <CardContent className="h-[280px]">
            {signupsChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={signupsChartData}>
                  <defs>
                    <linearGradient id="signupGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis tickLine={false} axisLine={false} fontSize={12} allowDecimals={false} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="count"
                    name="Signups"
                    stroke="#6366f1"
                    strokeWidth={2}
                    fill="url(#signupGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                {statsQuery.isLoading ? "Loading…" : "No signup data yet."}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-2 border-secondary/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-primary" />
              Job Posts Over Time
            </CardTitle>
            <CardDescription>Job postings published by month</CardDescription>
          </CardHeader>
          <CardContent className="h-[280px]">
            {jobsChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={jobsChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis tickLine={false} axisLine={false} fontSize={12} allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="pending" name="Pending" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="approved" name="Approved" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                {statsQuery.isLoading ? "Loading…" : "No job post data yet."}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent activity + lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border-2 border-secondary/20 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest admin actions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 max-h-[360px] overflow-auto">
            {activityQuery.isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : activityQuery.data?.length === 0 ? (
              <p className="text-sm text-muted-foreground">No activity recorded yet.</p>
            ) : (
              activityQuery.data?.map((log) => (
                <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/10 border border-secondary/20">
                  <Clock className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {log.action}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {log.targetType}{log.targetId ? ` #${log.targetId}` : ""}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(log.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-2 border-secondary/20">
          <CardHeader>
            <CardTitle className="text-lg">Recent Signups</CardTitle>
            <CardDescription>Latest job seeker registrations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 max-h-[360px] overflow-auto">
            {recentSeekersQuery.isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : recentSeekersQuery.data?.length === 0 ? (
              <p className="text-sm text-muted-foreground">No job seekers registered yet.</p>
            ) : (
              recentSeekersQuery.data?.map((seeker) => (
                <div key={seeker.id} className="flex items-center justify-between gap-3 p-3 rounded-lg bg-secondary/10 border border-secondary/20">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{seeker.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{seeker.email}</p>
                  </div>
                  <Badge
                    variant="secondary"
                    className={
                      seeker.status === "active"
                        ? "bg-green-100 text-green-700 border-green-200 shrink-0"
                        : "bg-destructive/10 text-destructive border-destructive/30 shrink-0"
                    }
                  >
                    {seeker.status}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-2 border-secondary/20">
          <CardHeader>
            <CardTitle className="text-lg">Recent Job Posts</CardTitle>
            <CardDescription>Latest postings awaiting review</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 max-h-[360px] overflow-auto">
            {recentPostsQuery.isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : recentPostsQuery.data?.length === 0 ? (
              <p className="text-sm text-muted-foreground">No job posts yet.</p>
            ) : (
              recentPostsQuery.data?.map((post) => (
                <div key={post.id} className="flex items-center justify-between gap-3 p-3 rounded-lg bg-secondary/10 border border-secondary/20">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{post.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{post.company}</p>
                  </div>
                  <Badge
                    variant="secondary"
                    className={
                      post.status === "approved"
                        ? "bg-green-100 text-green-700 border-green-200 shrink-0"
                        : post.status === "pending"
                          ? "bg-amber-100 text-amber-700 border-amber-200 shrink-0"
                          : "bg-destructive/10 text-destructive border-destructive/30 shrink-0"
                    }
                  >
                    {post.status}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
