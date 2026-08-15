import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import HomeHeroSection from "@/components/HomeHeroSection";
import FeaturedJobsSection from "@/components/FeaturedJobsSection";
import JobCategoriesSection from "@/components/JobCategoriesSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import TrustedEmployersSection from "@/components/TrustedEmployersSection";
import NewsletterSection from "@/components/NewsletterSection";
import FAQSection from "@/components/FAQSection";
import JobFiltersSection from "@/components/JobFiltersSection";
import TestimonialsSection from "@/components/TestimonialsSection";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      <main className="flex-1">
        <HomeHeroSection />
        <JobFiltersSection />
        <FeaturedJobsSection />
        <JobCategoriesSection />
        <HowItWorksSection />
        <TrustedEmployersSection />
        <TestimonialsSection />
        <NewsletterSection />
        <FAQSection />
      </main>
      <Footer />
    </div>
  );
}
