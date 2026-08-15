import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, Star, Quote, Send, MessageSquareText } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useCompanyAuth } from "@/_core/hooks/useCompanyAuth";

function StarRatingInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          className="transition-transform duration-200 hover:scale-125 cursor-pointer focus:outline-none"
          aria-label={`${star} star${star > 1 ? "s" : ""}`}
        >
          <Star
            className={`w-8 h-8 transition-colors duration-200 ${
              star <= (hover || value)
                ? "fill-accent text-accent"
                : "text-muted-foreground/40"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

function formatDate(date: Date | string | null | undefined) {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function ClientReviews() {
  const { company } = useCompanyAuth();
  const utils = trpc.useUtils();
  const reviewsQuery = trpc.company.reviews.mine.useQuery();
  const reviews = reviewsQuery.data ?? [];

  const [rating, setRating] = useState(0);
  const [content, setContent] = useState("");
  const [error, setError] = useState("");

  const createMutation = trpc.company.reviews.create.useMutation({
    onSuccess: async () => {
      toast.success("Review submitted successfully!");
      setRating(0);
      setContent("");
      await utils.company.reviews.mine.invalidate();
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1) {
      setError("Please select a star rating (1–5).");
      return;
    }
    if (!content.trim()) {
      setError("Please write a short review about your experience.");
      return;
    }
    setError("");
    createMutation.mutate({ rating, content: content.trim() });
  };

  const companyName = company?.name ?? "Your Company";
  const logoUrl = company?.logoUrl ?? null;
  const initials = (companyName.split(" ").map((n) => n[0]).slice(0, 2).join("") || "C").toUpperCase();

  return (
    <>
      {/* Header */}
      <section className="relative py-10 md:py-14 bg-gradient-to-br from-white via-secondary/10 to-primary/8 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/15 to-accent/10 rounded-full blur-3xl -mr-48 -mt-48" />
        <div className="container relative z-10">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-primary/30 shadow-lg">
              {logoUrl ? (
                <AvatarImage src={logoUrl} alt={companyName} className="object-contain bg-white" />
              ) : null}
              <AvatarFallback className="text-xl font-bold bg-gradient-to-br from-primary to-accent text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary font-semibold px-4 py-1.5 rounded-full mb-2">
                <MessageSquareText className="w-4 h-4" />
                Partner Reviews
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                Share Your Experience
              </h1>
              <p className="text-muted-foreground">
                Rate JobSeeker and share feedback that appears on our public Companies page.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Write a review */}
      <section className="py-10 bg-background">
        <div className="container">
          <Card className="p-8 bg-white border-2 border-primary/20 shadow-xl max-w-3xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-accent text-white flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Write a Review</h2>
                <p className="text-sm text-muted-foreground">
                  Your feedback helps other companies discover JobSeeker.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-foreground">
                  Star Rating <span className="text-destructive">*</span>
                </Label>
                <StarRatingInput value={rating} onChange={setRating} />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-foreground">
                  Your Review <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  placeholder="Tell us about your experience hiring on JobSeeker — what worked well, and anything that stood out..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="border-2 border-secondary/30 focus:border-primary/50 rounded-lg min-h-[140px]"
                />
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm animate-in fade-in slide-in-from-top-2 duration-300">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="bg-gradient-to-r from-primary to-accent text-white font-bold px-6 py-3 rounded-lg hover:shadow-lg hover:shadow-primary/40 transition-all duration-300 flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                {createMutation.isPending ? "Submitting…" : "Submit Review"}
              </Button>
            </form>
          </Card>
        </div>
      </section>

      {/* My reviews */}
      <section className="py-12 bg-gradient-to-b from-background to-secondary/10">
        <div className="container">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-1">
                Your Reviews
              </h2>
              <p className="text-muted-foreground text-sm">
                {reviews.length} total review{reviews.length === 1 ? "" : "s"}
              </p>
            </div>
          </div>

          {reviewsQuery.isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="p-6 border-2 border-secondary/20">
                  <Skeleton className="h-6 w-2/3 mb-4" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-4/5 mb-4" />
                  <Skeleton className="h-10 w-full" />
                </Card>
              ))}
            </div>
          ) : reviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviews.map((review) => (
                <Card
                  key={review.id}
                  className="p-6 hover:shadow-lg transition-all duration-300 hover:border-primary/30 hover:-translate-y-2 group bg-gradient-to-br from-white to-secondary/5 border border-secondary/20"
                >
                  <div className="flex items-center justify-between mb-4">
                    <Quote className="w-8 h-8 text-primary/40 group-hover:text-primary transition-colors duration-300" />
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 transition-all duration-300 ${
                            i <= review.rating
                              ? "fill-accent text-accent group-hover:scale-110"
                              : "text-muted-foreground"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <p className="text-muted-foreground mb-6 leading-relaxed group-hover:text-foreground transition-colors duration-300">
                    "{review.content}"
                  </p>

                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      {review.logoUrl ? (
                        <AvatarImage src={review.logoUrl} alt={review.companyName} className="object-contain bg-white" />
                      ) : null}
                      <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white font-semibold">
                        {(review.companyName || "C").slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
                        {review.companyName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(review.createdAt)}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-10 text-center bg-white border-2 border-secondary/20">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary/10 to-accent/10 rounded-full flex items-center justify-center mb-4">
                <MessageSquareText className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                You haven't left a review yet
              </h3>
              <p className="text-muted-foreground mb-6">
                Share your experience above and it will appear on our public Companies page.
              </p>
            </Card>
          )}
        </div>
      </section>
    </>
  );
}
