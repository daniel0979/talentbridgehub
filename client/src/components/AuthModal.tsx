import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  X,
  Mail,
  Lock,
  User,
  ArrowRight,
  UserPlus,
  Home,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";
import { useJobSeekerAuth } from "@/_core/hooks/useJobSeekerAuth";
import { useLocation } from "wouter";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [showProfilePrompt, setShowProfilePrompt] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const [, setLocation] = useLocation();

  const { register, login } = useJobSeekerAuth();
  const notifyAdminReset = trpc.jobSeeker.auth.notifyAdminPasswordReset.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please enter both your email and password.");
      return;
    }
    try {
      if (isSignUp) {
        if (!name.trim()) {
          setError("Please enter your name.");
          return;
        }
        if (password.length < 6) {
          setError("Password must be at least 6 characters.");
          return;
        }
        await register({ name, email, password });
        onClose();
        // Ask before navigating — user may defer building the profile.
        setShowProfilePrompt(true);
      } else {
        await login({ email, password });
        onClose();
        setLocation("/jobs");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  };

  const handleBuildProfile = () => {
    setShowProfilePrompt(false);
    setLocation("/profile");
  };

const handleSkipProfile = () => {
    setShowProfilePrompt(false);
    setLocation("/");
  };

  const handleNotifyAdmin = async () => {
    setError("");
    if (!email) {
      setError("Please enter your email address first.");
      return;
    }
    try {
      await notifyAdminReset.mutateAsync({ email });
      setForgotSent(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
    }
  };

  const handleClose = () => {
    setForgotOpen(false);
    setForgotSent(false);
    setError("");
    onClose();
  };

return (
    <>
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-md border-2 border-primary/20 bg-white p-0 overflow-hidden"
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-50 p-2 rounded-lg hover:bg-secondary/30 transition-colors duration-300"
        >
          <X className="w-5 h-5 text-foreground" />
        </button>

        {/* Header with gradient background */}
        <div className="bg-gradient-to-r from-primary via-primary to-accent p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl -mr-20 -mt-20" />
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-2">
              {isSignUp ? "Create Account" : "Welcome Back"}
            </h2>
            <p className="text-white/80">
              {isSignUp
                ? "Join thousands of job seekers finding their dream jobs"
                : "Sign in to your JobSeeker account"}
            </p>
          </div>
        </div>

        {/* Form content */}
        <div className="p-8 bg-white">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name field (only for signup) */}
            {isSignUp && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="text-sm font-semibold text-foreground">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary" />
                  <Input
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10 border-2 border-secondary/30 focus:border-primary/50 rounded-lg transition-colors duration-300"
                  />
                </div>
              </div>
            )}

            {/* Email field */}
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="text-sm font-semibold text-foreground">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary" />
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 border-2 border-secondary/30 focus:border-primary/50 rounded-lg transition-colors duration-300"
                />
              </div>
            </div>

{/* Password field */}
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-foreground">
                  Password
                </label>
                {!isSignUp && (
                  <button
                    type="button"
                    onClick={() => {
                      setForgotOpen(true);
                      setForgotSent(false);
                      setError("");
                    }}
                    className="text-sm text-primary hover:text-accent font-medium transition-colors duration-300"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 border-2 border-secondary/30 focus:border-primary/50 rounded-lg transition-colors duration-300"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm animate-in fade-in slide-in-from-top-2 duration-300">
                {error}
              </div>
            )}

            {/* Submit button */}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-primary via-primary to-accent text-white font-bold py-3 rounded-lg hover:shadow-lg hover:shadow-primary/40 transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
            >
              {isSignUp ? "Create Account" : "Sign In"}
              <ArrowRight className="w-4 h-4" />
            </Button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-secondary/20" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-muted-foreground">or</span>
              </div>
            </div>

            {/* OAuth button */}
            <Button
              type="button"
              onClick={startLogin}
              className="w-full border-2 border-primary/30 text-primary hover:border-primary/50 hover:bg-primary/5 font-semibold py-3 rounded-lg transition-all duration-300"
              variant="outline"
            >
              Continue with Google
            </Button>

            {/* Toggle between signin and signup */}
            <div className="text-center pt-4">
              <p className="text-muted-foreground text-sm">
                {isSignUp ? "Already have an account? " : "Don't have an account? "}
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-primary hover:text-accent font-bold transition-colors duration-300"
                >
                  {isSignUp ? "Sign In" : "Sign Up"}
                </button>
              </p>
            </div>
</form>
        </div>
</DialogContent>
    </Dialog>

    {/* Post-signup: do you want to build your profile? */}
    <Dialog open={showProfilePrompt} onOpenChange={(open) => !open && handleSkipProfile()}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-md border-2 border-primary/20 bg-white p-0 overflow-hidden"
      >
        <div className="bg-gradient-to-r from-primary via-primary to-accent p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl -mr-20 -mt-20" />
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-2">Welcome aboard! 🎉</h2>
            <p className="text-white/80">
              Your account has been created successfully.
            </p>
          </div>
        </div>
        <div className="p-8 bg-white">
          <p className="text-muted-foreground mb-6 leading-relaxed">
            Would you like to build your profile now? A complete profile helps
            employers find and reach you faster.
          </p>
          <div className="space-y-3">
            <Button
              onClick={handleBuildProfile}
              className="w-full bg-gradient-to-r from-primary via-primary to-accent text-white font-bold py-3 rounded-lg hover:shadow-lg hover:shadow-primary/40 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Yes, Build My Profile
            </Button>
            <Button
              onClick={handleSkipProfile}
              variant="outline"
              className="w-full border-2 border-secondary/30 text-foreground hover:border-primary/50 hover:bg-primary/5 font-semibold py-3 rounded-lg transition-all duration-300"
            >
              <Home className="w-4 h-4" />
              Not Now, Go to Home
            </Button>
          </div>
        </div>
</DialogContent>
</Dialog>

    {/* Forgot Password: Notify Admin dialog */}
    <Dialog open={forgotOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-md border-2 border-primary/20 bg-white p-0 overflow-hidden"
      >
        <div className="bg-gradient-to-r from-primary via-primary to-accent p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl -mr-20 -mt-20" />
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-2">Forgot Password</h2>
            <p className="text-white/80">
              We'll notify the admin to reset your password.
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
                The admin has been notified via the email address you provided. They
                will reset your password and reach out to you shortly. Please check
                your email.
              </p>
              <Button
                onClick={handleClose}
                className="w-full bg-gradient-to-r from-primary via-primary to-accent text-white font-bold py-3 rounded-lg hover:shadow-lg hover:shadow-primary/40 transition-all duration-300"
              >
                Done
              </Button>
            </div>
          ) : (
            <>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                To reset your password, we'll notify the site admin using the email
                address below. The admin will then reset your password for you.
              </p>
              <div className="space-y-2 mb-4">
                <label className="text-sm font-semibold text-foreground">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary" />
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 border-2 border-secondary/30 focus:border-primary/50 rounded-lg transition-colors duration-300"
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
                  Only the admin can reset passwords. You'll receive the new password
                  directly from the admin.
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleNotifyAdmin}
                  disabled={notifyAdminReset.isPending}
                  className="w-full bg-gradient-to-r from-primary via-primary to-accent text-white font-bold py-3 rounded-lg hover:shadow-lg hover:shadow-primary/40 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {notifyAdminReset.isPending ? "Notifying…" : "Notify Admin"}
                </Button>
                <Button
                  onClick={() => {
                    setForgotOpen(false);
                    setError("");
                  }}
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
    </>
  );
}
