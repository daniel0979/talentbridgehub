import { Card } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { trpc } from "@/lib/trpc";

const COMPANY_COLORS = [
  "from-blue-500 to-blue-600",
  "from-pink-500 to-pink-600",
  "from-green-500 to-green-600",
  "from-orange-500 to-orange-600",
  "from-indigo-500 to-indigo-600",
  "from-teal-500 to-teal-600",
  "from-purple-500 to-purple-600",
];

function getInitials(name: string) {
  return (name || "C").split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

export default function TrustedEmployersSection() {
  const companiesQuery = trpc.companies.all.useQuery();
  const companies = companiesQuery.data ?? [];

  const partners = companies;

  return (
    <section className="py-20 bg-gradient-to-b from-background to-secondary/20 overflow-hidden">
      <div className="container">
        <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Approved Employers
          </h2>
          <p className="text-muted-foreground text-lg">
            Browse organisations that have been approved to publish jobs on TalentBridgeHub.
          </p>
        </div>

        <div className="px-4 md:px-12">
          {companiesQuery.isLoading ? (
            <div className="py-10 text-center text-muted-foreground">Loading approved employers…</div>
          ) : partners.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground">
              Approved employers will appear here when their accounts are available.
            </div>
          ) : (
          <Carousel
            opts={{ align: "start", loop: true }}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {partners.map((company, idx) => {
                const name = company.name;
                const logoUrl = company.logoUrl;
                const color = COMPANY_COLORS[idx % COMPANY_COLORS.length];
                const logoText = getInitials(name);

                return (
                  <CarouselItem
                    key={company.id}
                    className="pl-4 md:basis-1/3 lg:basis-1/4 py-2"
                  >
                    <Card className="p-6 h-full hover:shadow-xl transition-all duration-300 hover:border-primary/50 hover:-translate-y-1 cursor-pointer group bg-gradient-to-br from-white to-secondary/5 border-2 border-secondary/20 relative overflow-hidden flex flex-col items-center justify-center text-center">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      <div className="relative z-10 flex flex-col items-center">
                        {/* Company logo */}
                        {logoUrl ? (
                          <img
                            src={logoUrl}
                            alt={name}
                            className="w-16 h-16 object-contain rounded-xl bg-white border-2 border-secondary/20 shadow-lg group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div
                            className={`w-16 h-16 rounded-xl bg-gradient-to-br ${color} text-white font-bold text-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
                          >
                            {logoText}
                          </div>
                        )}

                        {/* Company name */}
                        <h3 className="mt-4 text-lg font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
                          {name}
                        </h3>
                      </div>
                    </Card>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex -left-4" />
            <CarouselNext className="hidden md:flex -right-4" />
          </Carousel>
          )}
        </div>
      </div>
    </section>
  );
}
