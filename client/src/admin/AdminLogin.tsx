import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BarChart3, Eye, EyeOff, Lock, Mail, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const utils = trpc.useUtils();

  const loginMutation = trpc.admin.auth.login.useMutation({
    onSuccess: async () => {
      await utils.admin.auth.me.invalidate();
      setLocation("/admin/dashboard");
    },
    onError: (err) => {
      setError(err.message || "Login failed. Please try again.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please enter both your email and password.");
      return;
    }
    loginMutation.mutate({ email, password });
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary/10 to-primary/8 overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/15 to-accent/10 rounded-full blur-3xl -mr-48 -mt-48" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-br from-accent/10 to-primary/10 rounded-full blur-3xl -ml-40 -mb-40" />

      <div className="relative z-10 w-full max-w-md px-4">
        <Card className="p-8 bg-white border-2 border-primary/20 shadow-2xl rounded-2xl">
          <CardHeader className="text-center space-y-0">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg animate-in fade-in slide-in-from-top-3 duration-500">
              <BarChart3 className="w-8 h-8" />
            </div>
            <CardTitle className="text-3xl font-bold text-foreground mb-2">
              Admin Portal
            </CardTitle>
            <CardDescription className="flex items-center justify-center gap-1.5 text-muted-foreground">
              <ShieldCheck className="w-4 h-4" />
              Sign in to manage TalentBridge Hub
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold text-foreground">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@talentbridgehub.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 border-2 border-secondary/30 focus:border-primary/50 rounded-lg"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-semibold text-foreground">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 border-2 border-secondary/30 focus:border-primary/50 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm animate-in fade-in slide-in-from-top-2 duration-300">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={loginMutation.isPending}
                className="w-full bg-gradient-to-r from-primary via-primary to-accent text-white font-bold py-3 rounded-lg hover:shadow-lg hover:shadow-primary/40 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {loginMutation.isPending ? "Signing in…" : "Sign In"}
              </Button>
            </form>

            <p className="text-center text-xs text-muted-foreground mt-6">
              Restricted area. Authorized admin personnel only.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
