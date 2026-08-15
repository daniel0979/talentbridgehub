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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Settings as SettingsIcon,
  Wrench,
  ShieldAlert,
  CheckCircle2,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState } from "react";

export default function Settings() {
  const utils = trpc.useUtils();
  const maintenanceQuery = trpc.admin.settings.maintenance.get.useQuery();
  const maintenance = maintenanceQuery.data;

  const [message, setMessage] = useState("");
  const [loaded, setLoaded] = useState(false);

  // Sync local message state once when the query resolves.
  useEffect(() => {
    if (maintenance && !loaded) {
      setMessage(maintenance.message);
      setLoaded(true);
    }
  }, [maintenance, loaded]);

  const updateMaintenance =
    trpc.admin.settings.maintenance.update.useMutation({
      onSuccess: async () => {
        await utils.admin.settings.maintenance.get.invalidate();
        toast.success("Maintenance mode updated");
      },
      onError: (err) => toast.error(err.message),
    });

  const handleClose = () => {
    updateMaintenance.mutate({ enabled: true, message: message.trim() });
  };

  const handleOpen = () => {
    updateMaintenance.mutate({ enabled: false, message: message.trim() });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage site-wide settings, including maintenance mode.
        </p>
      </div>

      {/* Maintenance status banner */}
      <div
        className={`rounded-2xl border-2 p-4 flex items-center gap-3 ${
          maintenance?.enabled
            ? "border-orange-300 bg-orange-50"
            : "border-green-300 bg-green-50"
        }`}
      >
        {maintenance?.enabled ? (
          <ShieldAlert className="w-6 h-6 text-orange-600 shrink-0" />
        ) : (
          <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0" />
        )}
        <div>
          <p className="font-semibold text-foreground">
            {maintenanceQuery.isLoading
              ? "Loading maintenance status…"
              : maintenance?.enabled
                ? "Maintenance mode is ON"
                : "Maintenance mode is OFF"}
          </p>
          <p className="text-sm text-muted-foreground">
            {maintenance?.enabled
              ? "Job seekers and clients currently cannot use the site."
              : "The site is fully accessible to everyone."}
          </p>
        </div>
      </div>

      <Card className="border-2 border-secondary/20">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Wrench className="w-5 h-5 text-primary" />
            Maintenance Mode
          </CardTitle>
          <CardDescription>
            Close the website temporarily for maintenance. When enabled, job
            seekers and clients will see your message and cannot use the site.
            The admin portal remains accessible.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {maintenanceQuery.isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-10 w-40" />
            </div>
          ) : (
            <>
              <div className="grid gap-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="msg">Reason / Message</Label>
                  <Badge
                    variant="secondary"
                    className="bg-secondary text-muted-foreground"
                  >
                    <Info className="w-3 h-3 mr-1" />
                    Shown to visitors
                  </Badge>
                </div>
                <Textarea
                  id="msg"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="e.g. We are upgrading our systems. Please check back in a few hours."
                  className="min-h-[120px]"
                />
                <p className="text-xs text-muted-foreground">
                  This message is displayed on the maintenance screen that
                  visitors see.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  className="border-2 border-green-300 text-green-700 hover:bg-green-50"
                  onClick={handleOpen}
                  disabled={updateMaintenance.isPending || !maintenance?.enabled}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Open Website
                </Button>
                <Button
                  variant="outline"
                  className="border-2 border-orange-300 text-orange-700 hover:bg-orange-50"
                  onClick={handleClose}
                  disabled={updateMaintenance.isPending || maintenance?.enabled}
                >
                  <ShieldAlert className="w-4 h-4" />
                  Close Website
                </Button>
              </div>

              {maintenance?.updatedAt && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <SettingsIcon className="w-3.5 h-3.5 shrink-0" />
                  Last updated:{" "}
                  {new Date(maintenance.updatedAt).toLocaleString()}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
