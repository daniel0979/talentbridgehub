import PageLayout from "@/components/PageLayout";
import Container from "@/components/Container";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import {
  Lightbulb,
  Search,
  Clock,
  ArrowRight,
  BookOpen,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { useMemo, useState } from "react";

type CareerTip = {
  id: number;
  title: string;
  category: string;
  readTime: string;
  excerpt: string;
  content: string[];
};

export default function CareerTips() {
  const tipsQuery = trpc.careerTips.list.useQuery();

  const [activeCategory, setActiveCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [expanded, setExpanded] = useState<number | null>(null);

  const tips = tipsQuery.data ?? [];

  const TIP_CATEGORIES = useMemo(() => {
    const cats = Array.from(
      new Set(tips.map((tip) => tip.category).filter(Boolean))
    );
    return ["All", ...cats];
  }, [tips]);

  const filteredTips = tips.filter((tip) => {
    const matchesCategory =
      activeCategory === "All" || tip.category === activeCategory;
    const matchesSearch =
      !searchTerm ||
      `${tip.title} ${tip.excerpt} ${tip.category}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <PageLayout>
      {/* Hero */}
      <section className="relative py-16 md:py-20 bg-gradient-to-br from-white via-secondary/10 to-primary/8 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/15 to-accent/10 rounded-full blur-3xl -mr-48 -mt-48" />
        <Container className="relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary font-semibold px-4 py-1.5 rounded-full mb-6">
              <Lightbulb className="w-4 h-4" />
              Career Advice
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Career{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Tips & Guides
              </span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Expert advice to help you craft a standout resume, ace interviews, negotiate salaries, and grow your career.
            </p>
          </div>
        </Container>
      </section>

      {/* Search + Category filter */}
      <section className="py-8 bg-gradient-to-b from-secondary/5 to-background border-b border-secondary/20">
        <Container>
          <div className="max-w-2xl mx-auto">
            <div className="flex gap-2 mb-6">
              <Input
                type="text"
                placeholder="Search tips, topics, or categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 border-2 border-secondary/30 focus:border-primary/50 rounded-lg"
              />
              <Button className="bg-gradient-to-r from-primary to-accent text-white font-semibold px-6 rounded-lg hover:shadow-lg transition-all duration-300">
                <Search className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex flex-wrap justify-center gap-2">
              {TIP_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 border-2 ${
                    activeCategory === cat
                      ? "bg-gradient-to-r from-primary to-accent text-white border-transparent shadow-lg"
                      : "bg-white border-secondary/30 text-muted-foreground hover:border-primary/50 hover:text-primary"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* Tips Grid */}
      <section className="py-16 bg-gradient-to-b from-background to-secondary/10">
        <Container>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                {filteredTips.length > 0 ? "Career Resources" : "No Tips Found"}
              </h2>
              <p className="text-muted-foreground">
                {filteredTips.length > 0
                  ? "Browse our curated guides to level up your career"
                  : "Try a different search or category."}
              </p>
            </div>
            <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
              <BookOpen className="w-4 h-4 text-primary" />
              {filteredTips.length} articles
            </div>
          </div>

          {filteredTips.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTips.map((tip, idx) => (
                <Card
                  key={tip.id}
                  className="p-6 hover:shadow-xl transition-all duration-300 hover:border-primary/50 hover:-translate-y-2 cursor-pointer group bg-gradient-to-br from-white to-secondary/5 border-2 border-secondary/20 relative overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-700"
                  style={{ animationDelay: `${idx * 50}ms` }}
                  onClick={() => setExpanded(expanded === tip.id ? null : tip.id)}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <Badge
                        variant="secondary"
                        className="bg-gradient-to-r from-primary/20 to-accent/20 text-primary border-primary/30 group-hover:from-primary/30 group-hover:to-accent/30 transition-all duration-300"
                      >
                        {tip.category}
                      </Badge>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3.5 h-3.5" />
                        {tip.readTime}
                      </span>
                    </div>

                    <h3 className="text-lg font-semibold text-foreground mb-3 group-hover:text-primary transition-colors duration-300 leading-snug">
                      {tip.title}
                    </h3>

                    <p className="text-sm text-muted-foreground leading-relaxed mb-4 group-hover:text-foreground transition-colors duration-300">
                      {tip.excerpt}
                    </p>

                    {expanded === tip.id && (
                      <div className="space-y-3 mb-4 animate-in fade-in slide-in-from-top-2 duration-300">
                        {tip.content.map((point, i) => (
                          <p
                            key={i}
                            className="text-sm text-muted-foreground leading-relaxed flex items-start gap-2"
                          >
                            <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                            {point}
                          </p>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-secondary/20">
                      <span className="text-xs text-muted-foreground">
                        Topic: {tip.category}
                      </span>
                      <span className="text-primary font-semibold text-sm flex items-center gap-1 group-hover:gap-2 transition-all duration-300">
                        {expanded === tip.id ? "Show Less" : "Read More"}
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary/10 to-accent/10 rounded-full flex items-center justify-center mb-6">
                <Search className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                No tips found
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                We couldn't find any articles matching your search. Try a different keyword or category.
              </p>
              <Button
                onClick={() => {
                  setSearchTerm("");
                  setActiveCategory("All");
                }}
                className="bg-gradient-to-r from-primary to-accent text-white font-semibold px-6 rounded-lg hover:shadow-lg transition-all duration-300"
              >
                Reset Filters
              </Button>
            </div>
          )}
        </Container>
      </section>

      {/* Quote / CTA */}
      <section className="py-20 bg-gradient-to-r from-primary via-primary to-accent text-white">
        <Container>
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 mb-6">
              <TrendingUp className="w-4 h-4" />
              Invest in Your Career
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Take the Next Step?
            </h2>
            <p className="text-white/80 mb-8 max-w-2xl mx-auto">
              Apply what you've learned and start your job search today. Your dream career is waiting.
            </p>
            <Button className="bg-white text-primary hover:bg-white/90 font-bold px-10 py-4 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95">
              Browse Jobs
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </Container>
      </section>
    </PageLayout>
  );
}
