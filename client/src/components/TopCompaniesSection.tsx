import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { Building2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useEffect, useState } from "react";

const COMPANY_COLORS = [
  "from-blue-500 to-blue-600",
  "from-pink-500 to-pink-600",
  "from-green-500 to-green-600",
  "from-orange-500 to-orange-600",
  "from-indigo-500 to-indigo-600",
  "from-teal-500 to-teal-600",
  "from-purple-500 to-purple-600",
  "from-red-500 to-red-600",
];

function getInitials(name: string) {
  return (name || "C")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/** Autoplay interval between slides (ms). */
const AUTOPLAY_MS = 3000;

type LogoItem = {
  id: number;
  name: string;
  logoUrl: string | null;
  color: string;
};

export default function TopCompaniesSection() {
  const reviewsQuery = trpc.companies.reviews.useQuery();
  const reviews = reviewsQuery.data ?? [];

  const [api, setApi] = useState<CarouselApi | null>(null);

  // Auto-play: advance the carousel every few seconds.
  useEffect(() => {
    if (!api) return;
    const interval = setInterval(() => {
      api.scrollNext();
    }, AUTOPLAY_MS);
    return () => clearInterval(interval);
  }, [api]);

  const companies: LogoItem[] = Array.from(
    new Map(
      reviews.map((r, idx) => [
        r.companyId,
        {
          id: r.companyId,
          name: r.companyName,
          logoUrl: r.logoUrl,
          color: COMPANY_COLORS[idx % COMPANY_COLORS.length],
        },
      ])
    ).values()
  );

  return (
    <section className="py-20 bg-gradient-to-b from-background to-secondary/10">
      <div className="container">
        <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Employer Feedback
          </h2>
          <p className="text-muted-foreground text-lg">
            Employers appear here only after submitting feedback through the platform.
          </p>
        </div>

        {reviewsQuery.isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="p-8 border-2 border-secondary/20">
                <Skeleton className="h-20 w-20 rounded-2xl mx-auto mb-4" />
                <Skeleton className="h-5 w-2/3 mx-auto" />
              </Card>
            ))}
          </div>
        ) : companies.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary/10 to-accent/10 rounded-full flex items-center justify-center mb-4">
              <Building2 className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">
              No employer feedback published yet
            </h3>
            <p className="text-muted-foreground mb-6">
              TalentBridgeHub will show feedback only when it is genuinely submitted.
            </p>
          </div>
        ) : (
          <Carousel
            setApi={setApi}
            opts={{ align: "start", loop: true }}
            className="w-full relative"
          >
            <CarouselContent className="-ml-4">
              {companies.map((company, idx) => (
                <CarouselItem
                  key={company.id}
                  className="pl-4 basis-1/2 sm:basis-1/3 lg:basis-1/4"
                >
                  <Card className="p-8 md:p-10 h-full hover:shadow-2xl transition-all duration-300 hover:border-primary/50 hover:-translate-y-2 group bg-gradient-to-br from-white to-secondary/5 border-2 border-secondary/20 relative overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-700 flex flex-col items-center justify-center text-center min-h-[200px]">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    <div className="relative z-10 flex flex-col items-center">
                      {/* Big company logo */}
                      <div className="mb-5">
                        {company.logoUrl ? (
                          <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl border-2 border-secondary/20 bg-white shadow-lg p-2 group-hover:scale-110 group-hover:shadow-xl transition-all duration-300 flex items-center justify-center overflow-hidden">
                            <img
                              src={company.logoUrl}
                              alt={company.name}
                              className="object-contain w-full h-full"
                            />
                          </div>
                        ) : (
                          <div
                            className={`w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-gradient-to-br ${company.color} flex items-center justify-center text-white font-bold text-3xl shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-300`}
                          >
                            {getInitials(company.name)}
                          </div>
                        )}
                      </div>

                      {/* Company name */}
                      <h3 className="text-lg md:text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors duration-300">
                        {company.name}
                      </h3>

                      <p className="text-xs md:text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-300 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-primary" />
                        Verified employer feedback
                      </p>
                    </div>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden sm:flex -left-4 lg:-left-8" />
            <CarouselNext className="hidden sm:flex -right-4 lg:-right-8" />
          </Carousel>
        )}
      </div>
    </section>
  );
}
