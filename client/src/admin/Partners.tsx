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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Building2,
  Search,
  MapPin,
  Globe,
  Briefcase,
  BadgeCheck,
  Clock,
  Ban,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { useMemo, useState } from "react";

const COMPANY_COLORS = [
  "from-blue-500 to-blue-600",
  "from-pink-500 to-pink-600",
  "from-green-500 to-green-600",
  "from-orange-500 to-orange-600",
  "from-indigo-500 to-indigo-600",
  "from-teal-500 to-teal-600",
  "from-purple-500 to-purple-600",
  "from-red-500 to-red-600",
];

function getInitials(name: string) {
  return (name || "C")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

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

/**
 * Admin Partners page — showcases all registered client companies in a large
 * card grid, similar to the public Companies page but with status controls.
 */
export default function Partners() {
  const utils = trpc.useUtils();
  const companiesQuery = trpc.admin.management.companies.list.useQuery();
  const companies = companiesQuery.data ?? [];

  const [searchTerm, setSearchTerm] = useState("");

  const updateStatus = trpc.admin.management.companies.updateStatus.useMutation({
    onSuccess: async () => {
      await utils.admin.management.companies.list.invalidate();
      toast.success("Company status updated");
    },
    onError: (err) => toast.error(err.message),
  });

  const filteredCompanies = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return companies;
    return companies.filter((c) =>
      `${c.name} ${c.industry ?? ""} ${c.town ?? ""}`
        .toLowerCase()
        .includes(term)
    );
  }, [companies, searchTerm]);

  const approvedCount = companies.filter((c) => c.status === "approved").length;
  const pendingCount = companies.filter((c) => c.status === "pending").length;
  const suspendedCount = companies.filter((c) => c.status === "suspended").length;

  const statCards = [
    {
      label: "Total Partners",
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
      icon: Clock,
      color: "from-amber-500 to-amber-600",
    },
    {
      label: "Suspended",
      value: suspendedCount,
      icon: Ban,
      color: "from-rose-500 to-rose-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Partners</h1>
        <p className="text-muted-foreground mt-1">
          Browse all registered client companies. Approve, suspend, or review
          their partnership status.
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

      {/* Search */}
      <Card className="border-2 border-secondary/20">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            Client Companies
          </CardTitle>
          <CardDescription>
            {filteredCompanies.length > 0
              ? `Showing ${filteredCompanies.length} of ${companies.length} registered companies.`
              : "No companies registered yet."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-2">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search companies..."
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border-2 border-secondary/30 bg-background focus:border-primary/50 focus:outline-none focus:ring-0"
              />
            </div>
            {searchTerm && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSearchTerm("")}
              >
                Clear
              </Button>
            )}
          </div>

          {companiesQuery.isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="p-6 border-2 border-secondary/20">
                  <Skeleton className="h-14 w-14 rounded-xl mb-4" />
                  <Skeleton className="h-6 w-2/3 mb-3" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4 mb-4" />
                  <Skeleton className="h-10 w-full" />
                </Card>
              ))}
            </div>
          ) : filteredCompanies.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary/10 to-accent/10 rounded-full flex items-center justify-center mb-4">
                <Building2 className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                {searchTerm ? "No matching companies" : "No companies yet"}
              </h3>
              <p className="text-muted-foreground">
                {searchTerm
                  ? "Try a different search term."
                  : "Registered companies will appear here once they sign up."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCompanies.map((company, idx) => (
                <Card
                  key={company.id}
                  className="p-6 hover:shadow-xl transition-all duration-300 hover:border-primary/50 hover:-translate-y-2 group bg-gradient-to-br from-white to-secondary/5 border-2 border-secondary/20 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4">
                    <Badge
                      variant="secondary"
                      className={statusBadgeClass(company.status)}
                    >
                      {company.status}
                    </Badge>
                  </div>

                  <div className="flex items-start gap-4 mb-4">
                    <Avatar
                      className={`w-16 h-16 rounded-xl bg-gradient-to-br ${
                        COMPANY_COLORS[idx % COMPANY_COLORS.length]
                      } flex items-center justify-center text-white font-bold text-xl group-hover:scale-110 transition-transform duration-300 shadow-lg shrink-0`}
                    >
                      {company.logoUrl ? (
                        <AvatarImage
                          src={company.logoUrl}
                          alt={company.name || "Company logo"}
                          className="object-contain bg-white"
                        />
                      ) : null}
                      <AvatarFallback className="bg-transparent text-white font-bold">
                        {getInitials(company.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors duration-300 truncate">
                        {company.name || "Unnamed"}
                      </h3>
                      {company.industry && (
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {company.industry}
                        </p>
                      )}
                    </div>
                  </div>

                  {company.description && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2 group-hover:text-foreground transition-colors duration-300">
                      {company.description}
                    </p>
                  )}

                  <div className="space-y-2 text-sm text-muted-foreground mb-4">
                    {company.town && (
                      <p className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-primary shrink-0" />
                        {company.town}
                      </p>
                    )}
                    {company.website && (
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 text-primary hover:underline"
                      >
                        <Globe className="w-4 h-4 shrink-0" />
                        {company.website}
                      </a>
                    )}
                    <p className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-primary shrink-0" />
                      Joined {formatDate(company.createdAt)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 mt-2">
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
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
