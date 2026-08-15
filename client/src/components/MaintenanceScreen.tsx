import { Card, CardContent } from "@/components/ui/card";
import { Wrench, ShieldCheck } from "lucide-react";

/**
 * Full-screen public maintenance page. Shown when an admin has enabled
 * maintenance mode. Job seekers and clients see the admin's message and
 * cannot use the site. The admin portal (/admin) stays accessible.
 */
export default function MaintenanceScreen({
  message,
}: {
  message: string;
}) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="border-2 border-secondary/20 max-w-lg w-full shadow-xl">
        <CardContent className="p-8 text-center">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center text-white shadow-lg mb-6">
            <Wrench className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            We'll be back soon
          </h1>
          <p className="text-muted-foreground mb-6">
            The site is currently undergoing maintenance. Please check back
            shortly.
          </p>

          {message && (
            <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 mb-6 text-left">
              <p className="text-sm text-amber-900 whitespace-pre-wrap">
                {message}
              </p>
            </div>
          )}

          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="w-4 h-4 text-primary" />
            TalentBridge Hub
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
