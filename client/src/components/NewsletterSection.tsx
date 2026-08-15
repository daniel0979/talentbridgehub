import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, ArrowRight, CheckCircle } from "lucide-react";
import { useState } from "react";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setEmail("");
      setTimeout(() => setSubmitted(false), 3000);
    }
  };

  return (
    <section className="py-20 bg-gradient-to-r from-primary/10 via-accent/10 to-purple-500/10 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/20 to-accent/10 rounded-full blur-3xl -mr-48 -mt-48 animate-pulse animation-delay-2000" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-accent/20 to-primary/10 rounded-full blur-3xl -ml-48 -mb-48 animate-pulse animation-delay-4000" />

      <div className="container relative z-10">
        <div className="max-w-2xl mx-auto text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Stay Updated with New Opportunities
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            Get weekly job recommendations tailored to your skills and preferences delivered straight to your inbox.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-12 py-3 rounded-lg border-2 border-primary/20 focus:border-primary/50 bg-white/50 backdrop-blur-sm transition-all duration-300 focus:shadow-lg focus:shadow-primary/20"
                required
              />
            </div>
            <Button
              type="submit"
              className="bg-gradient-to-r from-primary to-accent hover:shadow-lg hover:shadow-primary/50 text-white font-semibold px-8 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap"
            >
              {submitted ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Subscribed!
                </>
              ) : (
                <>
                  Subscribe
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          <p className="text-sm text-muted-foreground mt-4">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </div>
      </div>
    </section>
  );
}
