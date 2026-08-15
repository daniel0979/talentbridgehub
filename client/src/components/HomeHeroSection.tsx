import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Search, ArrowRight, Landmark } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

export default function HomeHeroSection() {
  const [, setLocation] = useLocation();
  const [keyword, setKeyword] = useState("");
  const [location, setLocationValue] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword) params.append("keyword", keyword);
    if (location) params.append("location", location);
    setLocation(`/jobs?${params.toString()}`);
  };

  return (
    <section className="relative bg-gradient-to-br from-white via-secondary/5 to-primary/8 pt-24 pb-40 overflow-hidden">
      {/* Bold gradient orbs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/15 to-accent/10 rounded-full blur-3xl -mr-48 -mt-48" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-accent/15 to-primary/10 rounded-full blur-3xl -ml-48 -mb-48" />

      <div className="container relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* Company logo badge */}
          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-gradient-to-r from-primary/15 to-accent/15 border border-primary/30 backdrop-blur-sm mb-6">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent text-white flex items-center justify-center font-bold shadow-lg">
              TB
            </div>
            <span className="text-sm font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              TalentBridgeHub
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-4 leading-tight">
            Connect Talent to{" "}
            <span className="bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
              Opportunity
            </span>
          </h1>

          <p className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent mb-8">
            Today
          </p>

          <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed max-w-2xl mx-auto">
            Explore roles, present your skills, and manage each application through one secure recruitment platform.
          </p>
        </div>

        {/* Search Bar with animation */}
        <form
          onSubmit={handleSearch}
          className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-2 md:p-3 flex flex-col md:flex-row gap-2 md:gap-3 animate-in fade-in slide-in-from-bottom-3 duration-700 animation-delay-200 border border-primary/20 hover:shadow-primary/30 transition-shadow duration-300"
        >
          <div className="flex-1 flex items-center gap-3 bg-gradient-to-r from-primary/8 to-primary/5 rounded-lg px-4 py-3 border border-primary/20 focus-within:border-primary/50 transition-all duration-300">
            <Search className="w-5 h-5 text-primary flex-shrink-0" />
            <Input
              type="text"
              placeholder="Job title, keywords..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="border-0 bg-transparent placeholder-muted-foreground focus:outline-none focus:ring-0 text-foreground"
            />
          </div>

          <div className="flex-1 flex items-center gap-3 bg-gradient-to-r from-accent/8 to-accent/5 rounded-lg px-4 py-3 border border-accent/20 focus-within:border-accent/50 transition-all duration-300">
            <MapPin className="w-5 h-5 text-accent flex-shrink-0" />
            <Input
              type="text"
              placeholder="City or remote"
              value={location}
              onChange={(e) => setLocationValue(e.target.value)}
              className="border-0 bg-transparent placeholder-muted-foreground focus:outline-none focus:ring-0 text-foreground"
            />
          </div>

          <Button
            type="submit"
            size="lg"
            className="bg-gradient-to-r from-primary via-primary to-accent hover:from-primary/95 hover:to-accent/95 text-white font-bold px-8 rounded-lg transition-all duration-300 hover:shadow-2xl hover:shadow-primary/40 transform hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            Search
            <ArrowRight className="w-4 h-4" />
          </Button>
        </form>

        {/* Stats with animation */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-16 max-w-2xl mx-auto">
          {[
            { number: "01", label: "Smart job search", delay: 300 },
            { number: "02", label: "Employer portal", delay: 400 },
            { number: "03", label: "Application tracking", delay: 500 },
          ].map((stat, idx) => (
            <div
              key={idx}
              className="text-center animate-in fade-in slide-in-from-bottom-2 duration-700 group"
              style={{ animationDelay: `${stat.delay}ms` }}
            >
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">
                {stat.number}
              </div>
              <p className="text-sm md:text-base text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
