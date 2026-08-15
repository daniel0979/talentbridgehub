import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, FileText, CheckCircle, ArrowRight } from "lucide-react";
import { Link } from "wouter";

interface Step {
  number: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const STEPS: Step[] = [
  {
    number: 1,
    title: "Search",
    description:
      "Browse through thousands of job listings and filter by location, salary, job type, and industry to find the perfect match for your skills and career goals.",
    icon: <Search className="w-8 h-8" />,
  },
  {
    number: 2,
    title: "Apply",
    description:
      "Submit your application with just a few clicks. Customize your resume and cover letter for each position to make a strong first impression.",
    icon: <FileText className="w-8 h-8" />,
  },
  {
    number: 3,
    title: "Get Hired",
    description:
      "Connect with hiring managers, ace your interviews, and land your dream job. Our platform helps you succeed at every step of the process.",
    icon: <CheckCircle className="w-8 h-8" />,
  },
];

export default function HowItWorksSection() {
  return (
    <section className="py-20 bg-gradient-to-b from-background to-secondary/15">
      <div className="container">
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            How It Works
          </h2>
          <p className="text-muted-foreground text-lg">
            Three simple steps to land your next opportunity
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Premium connection lines with gradient */}
          <div className="hidden md:block absolute top-32 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

          {STEPS.map((step, index) => (
            <div
              key={step.number}
              className="relative animate-in fade-in slide-in-from-bottom-3 duration-700 group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <Card className="p-8 text-center h-full hover:shadow-2xl transition-all duration-300 hover:border-primary/60 hover:-translate-y-3 bg-gradient-to-br from-white via-secondary/5 to-white border-2 border-secondary/30 relative overflow-hidden">
                {/* Elegant gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/8 to-accent/8 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="relative z-10">
                  {/* Premium step indicator circle */}
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary via-primary to-accent text-white font-bold text-2xl mb-6 shadow-xl group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300 relative">
                    {step.number}
                    {/* Decorative ring */}
                    <div className="absolute inset-0 rounded-full border-2 border-white/20 group-hover:border-white/40 transition-all duration-300" />
                  </div>

                  {/* Icon */}
                  <div className="text-primary mb-6 flex justify-center group-hover:text-accent transition-colors duration-300">
                    {step.icon}
                  </div>

                  {/* Content */}
                  <h3 className="text-2xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors duration-300">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors duration-300">
                    {step.description}
                  </p>

                  {/* Premium arrow for desktop */}
                  {index < STEPS.length - 1 && (
                    <div className="hidden md:flex absolute -right-8 top-1/2 transform -translate-y-1/2 z-20">
                      <div className="relative w-16 h-16 flex items-center justify-center">
                        {/* Arrow line */}
                        <div className="absolute w-8 h-0.5 bg-gradient-to-r from-primary to-accent" />
                        {/* Arrow head */}
                        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-8 border-l-accent border-t-4 border-t-transparent border-b-4 border-b-transparent" />
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {/* Arrow for mobile */}
              {index < STEPS.length - 1 && (
                <div className="md:hidden flex justify-center py-6">
                  <div className="relative w-8 h-8 flex items-center justify-center">
                    {/* Vertical arrow line */}
                    <div className="absolute w-0.5 h-6 bg-gradient-to-b from-primary to-accent" />
                    {/* Arrow head */}
                    <div className="absolute bottom-0 w-0 h-0 border-l-3 border-l-transparent border-r-3 border-r-transparent border-t-4 border-t-accent" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16 animate-in fade-in slide-in-from-bottom-2 duration-700">
          <p className="text-muted-foreground mb-6 text-lg">
            Ready to start your job search journey?
          </p>
          <Link href="/jobs">
            <Button className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-primary via-primary to-accent text-white font-bold hover:shadow-2xl hover:shadow-primary/40 transition-all duration-300 transform hover:scale-105 active:scale-95">
              Get Started Today
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
