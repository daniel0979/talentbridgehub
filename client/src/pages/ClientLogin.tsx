import PageLayout from "@/components/PageLayout";
import Container from "@/components/Container";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Mail,
  Lock,
  Building2,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Link, useLocation } from "wouter";
import { useState } from "react";
import { useCompanyAuth } from "@/_core/hooks/useCompanyAuth";
import { trpc } from "@/lib/trpc";

export default function ClientLogin() {
  const [, setLocation] = useLocation();
  const { login } = useCompanyAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const notifyAdminReset = trpc.company.auth.notifyAdminPasswordReset.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter both your email and password.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await login({ email: email.trim(), password });
      setLocation("/client/dashboard");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Login failed. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleNotifyAdmin = async () => {
    setError("");
    if (!email) {
      setError("Please enter your company email address first.");
      return;
    }
    try {
      await notifyAdminReset.mutateAsync({ email: email.trim() });
      setForgotSent(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
    }
  };

  const closeForgotDialog = () => {
    setForgotOpen(false);
    setForgotSent(false);
    setError("");
  };

  return (
    <PageLayout>
      {/* Auth section with solid, opaque background for clear readability */}
      <section className="relative py-16 md:py-20 bg-gradient-to-br from-white via-secondary/10 to-primary/8 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/15 to-accent/10 rounded-full blur-3xl -mr-48 -mt-48" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-br from-accent/10 to-primary/10 rounded-full blur-3xl -ml-40 -mb-40" />
        <Container className="relative z-10">
          <div className="max-w-md mx-auto">
            <Card className="p-8 bg-white border-2 border-primary/20 shadow-2xl rounded-2xl">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg">
                  <Building2 className="w-8 h-8" />
                </div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  Company Login
                </h1>
                <p className="text-muted-foreground">
                  Sign in to manage your job postings
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold text-foreground">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="company@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 border-2 border-secondary/30 focus:border-primary/50 rounded-lg"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-sm font-semibold text-foreground">
                      Password
                    </Label>
                    <button
                      type="button"
                      onClick={() => {
                        setForgotOpen(true);
                        setForgotSent(false);
                        setError("");
                      }}
                      className="text-sm text-primary hover:text-accent font-medium transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
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

                {/* Submit */}
<Button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-primary via-primary to-accent text-white font-bold py-3 rounded-lg hover:shadow-lg hover:shadow-primary/40 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? "Signing in…" : "Sign In"}
                  {!submitting && <ArrowRight className="w-4 h-4" />}
                </Button>
              </form>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-secondary/20" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-muted-foreground">new to JobSeeker?</span>
                </div>
              </div>

              {/* Sign up link */}
              <div className="text-center">
                <p className="text-muted-foreground text-sm">
                  New company?{" "}
                  <Link href="/client/signup">
                    <span className="text-primary hover:text-accent font-bold transition-colors duration-300 cursor-pointer">
                      Create an account
                    </span>
                  </Link>
                </p>
              </div>
            </Card>

            <p className="text-center text-sm text-muted-foreground mt-6">
              By continuing, you agree to our{" "}
              <a href="#" className="text-primary hover:text-accent transition-colors">Terms</a> and{" "}
              <a href="#" className="text-primary hover:text-accent transition-colors">Privacy Policy</a>.
            </p>
          </div>
        </Container>
      </section>
      <Dialog open={forgotOpen} onOpenChange={(open) => !open && closeForgotDialog()}>
        <DialogContent
          showCloseButton={false}
          className="sm:max-w-md border-2 border-primary/20 bg-white p-0 overflow-hidden"
        >
          <div className="bg-gradient-to-r from-primary via-primary to-accent p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl -mr-20 -mt-20" />
            <div className="relative z-10">
              <h2 className="text-2xl font-bold mb-2">Forgot Password</h2>
              <p className="text-white/80">
                We'll notify the admin to reset your company password.
              </p>
            </div>
          </div>
          <div className="p-8 bg-white">
            {forgotSent ? (
              <div className="text-center space-y-4">
                <div className="mx-auto w-14 h-14 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  Admin Notified
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  The admin has been notified. They will reset your company
                  password and reach out to you shortly.
                </p>
                <Button
                  onClick={closeForgotDialog}
                  className="w-full bg-gradient-to-r from-primary via-primary to-accent text-white font-bold py-3 rounded-lg hover:shadow-lg hover:shadow-primary/40 transition-all duration-300"
                >
                  Done
                </Button>
              </div>
            ) : (
              <>
                <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                  Enter the company account email. The admin will receive a
                  password reset request.
                </p>
                <div className="space-y-2 mb-4">
                  <Label htmlFor="forgotCompanyEmail" className="text-sm font-semibold text-foreground">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary" />
                    <Input
                      id="forgotCompanyEmail"
                      type="email"
                      placeholder="company@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 border-2 border-secondary/30 focus:border-primary/50 rounded-lg"
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-3 mb-4 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm animate-in fade-in slide-in-from-top-2 duration-300">
                    {error}
                  </div>
                )}

                <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/10 border border-secondary/20 mb-6">
                  <ShieldCheck className="w-5 h-5 text-primary shrink-0" />
                  <p className="text-xs text-muted-foreground">
                    Only an admin can reset company passwords. You can sign in
                    after they share the new password with you.
                  </p>
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={handleNotifyAdmin}
                    disabled={notifyAdminReset.isPending}
                    className="w-full bg-gradient-to-r from-primary via-primary to-accent text-white font-bold py-3 rounded-lg hover:shadow-lg hover:shadow-primary/40 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {notifyAdminReset.isPending ? "Notifying..." : "Notify Admin"}
                  </Button>
                  <Button
                    onClick={closeForgotDialog}
                    variant="outline"
                    className="w-full border-2 border-secondary/30 text-foreground hover:border-primary/50 hover:bg-primary/5 font-semibold py-3 rounded-lg transition-all duration-300"
                  >
                    Cancel
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}
