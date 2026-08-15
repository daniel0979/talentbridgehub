import { Card } from "@/components/ui/card";
import { Code, Palette, TrendingUp, BarChart3, ArrowRight } from "lucide-react";
import { Link } from "wouter";

interface Category {
  id: number;
  name: string;
  icon: React.ReactNode;
  count: number;
  color: string;
  bgColor: string;
}

const CATEGORIES: Category[] = [
  {
    id: 1,
    name: "Tech",
    icon: <Code className="w-8 h-8" />,
    count: 12500,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  {
    id: 2,
    name: "Design",
    icon: <Palette className="w-8 h-8" />,
    count: 3200,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
  },
  {
    id: 3,
    name: "Marketing",
    icon: <TrendingUp className="w-8 h-8" />,
    count: 2800,
    color: "text-orange-600",
    bgColor: "bg-orange-100",
  },
  {
    id: 4,
    name: "Finance",
    icon: <BarChart3 className="w-8 h-8" />,
    count: 1900,
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
];

export default function JobCategoriesSection() {
  return (
    <section className="py-20 bg-gradient-to-b from-secondary/10 to-background">
      <div className="container">
        <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Browse by Category
          </h2>
          <p className="text-muted-foreground text-lg">
            Explore opportunities in your field of interest
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {CATEGORIES.map((category, idx) => (
            <Link
              key={category.id}
              href={`/jobs?category=${category.name.toLowerCase()}`}
              className="group"
            >
              <Card className="p-8 text-center hover:shadow-xl transition-all duration-300 hover:border-primary/50 hover:-translate-y-2 cursor-pointer h-full flex flex-col items-center justify-center bg-gradient-to-br from-white to-secondary/5 border-2 border-secondary/20 relative overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-700"
                style={{ animationDelay: `${idx * 50}ms` }}>
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="relative z-10">
                  <div
                    className={`${category.bgColor} ${category.color} p-4 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300 w-fit mx-auto`}
                  >
                    {category.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors duration-300">
                    {category.name}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4 group-hover:text-foreground transition-colors duration-300">
                    {category.count.toLocaleString()} jobs
                  </p>
                  <div className="flex items-center justify-center gap-2 text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="text-sm font-medium">Explore</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
