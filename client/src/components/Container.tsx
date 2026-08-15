import { cn } from "@/lib/utils";

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Constrained page container. Centers content and applies consistent side
 * padding so nothing stretches edge-to-edge. Full-bleed parent sections keep
 * their own background, but their inner content should be wrapped in this.
 */
export default function Container({ children, className }: ContainerProps) {
  return (
    <div className={cn("mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8", className)}>
      {children}
    </div>
  );
}
