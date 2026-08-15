import Navigation from "./Navigation";
import Footer from "./Footer";

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Shared page shell for all portal pages. Provides the consistent Navigation,
 * main content area, and Footer so the layout isn't repeated per-page.
 * Full-bleed sections (navbar/footer backgrounds) stay full-width, while the
 * inner content is constrained by the `Container` component used inside pages.
 */
export default function PageLayout({ children, className }: PageLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      <main className={`flex-1 ${className ?? ""}`}>{children}</main>
      <Footer />
    </div>
  );
}
