import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, ChevronDown, ChevronUp, Send, UserPlus, MessageSquareText } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useJobSeekerAuth } from "@/_core/hooks/useJobSeekerAuth";
import { useLocation } from "wouter";
import { toast } from "sonner";

interface Testimonial {
  id: number;
  name: string;
  content: string;
  rating: number;
  initials: string;
  photoUrl: string | null;
}

/** Max characters shown before truncating a long testimonial. */
const REVIEW_CHAR_LIMIT = 120;

/** Renders a testimonial with a "Read more / Show less" toggle when long. */
function CollapsibleReview({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = text.length > REVIEW_CHAR_LIMIT;

  const visible = expanded ? text : text.slice(0, REVIEW_CHAR_LIMIT);
  const trailing = expanded ? "" : isLong ? "…" : "";

  return (
    <div className="mb-6">
      <p className="text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors duration-300">
        "{visible}{trailing}"
      </p>
      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="mt-2 inline-flex items-center gap-1 text-primary hover:text-accent font-semibold text-sm transition-colors duration-300"
        >
          {expanded ? (
            <>
              Show less
              <ChevronUp className="w-4 h-4" />
            </>
          ) : (
            <>
              Read more
              <ChevronDown className="w-4 h-4" />
            </>
          )}
        </button>
      )}
    </div>
  );
}

function getInitials(name: string) {
  return (name || "JS")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/** Interactive star rating input. */
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
            className={`w-7 h-7 transition-colors duration-200 ${
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

/** Form for signed-in job seekers to submit a review. */
function ReviewForm({ onSubmitted }: { onSubmitted: () => void }) {
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState("");
  const [error, setError] = useState("");

  const utils = trpc.useUtils();
  const createMutation = trpc.jobSeeker.reviews.create.useMutation({
    onSuccess: async () => {
      toast.success("Review submitted successfully!");
      setRating(0);
      setContent("");
      await utils.jobSeekerReviews.list.invalidate();
      await utils.jobSeeker.reviews.mine.invalidate();
      onSubmitted();
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

  return (
    <Card className="p-6 md:p-8 bg-white border-2 border-primary/20 shadow-xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-accent text-white flex items-center justify-center">
          <MessageSquareText className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-foreground">Share Your Story</h3>
          <p className="text-sm text-muted-foreground">
            Tell others how TalentBridgeHub helped you find your next opportunity.
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
            placeholder="Share your experience using TalentBridgeHub — what worked well, and anything that stood out..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="border-2 border-secondary/30 focus:border-primary/50 rounded-lg min-h-[120px]"
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
  );
}

export default function TestimonialsSection() {
  const [, setLocation] = useLocation();
  const { jobSeeker, isAuthenticated } = useJobSeekerAuth();

  const reviewsQuery = trpc.jobSeekerReviews.list.useQuery();
  const reviews = reviewsQuery.data ?? [];

  const testimonials: Testimonial[] = reviews.map((r) => ({
    id: r.id,
    name: r.seekerName,
    content: r.content,
    rating: r.rating,
    initials: getInitials(r.seekerName),
    photoUrl: r.photoUrl,
  }));

  return (
    <section className="py-20 bg-gradient-to-b from-background to-secondary/20">
      <div className="container">
        <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Success Stories
          </h2>
          <p className="text-muted-foreground text-lg">
            Join thousands of professionals who found their dream job
          </p>
        </div>

        {isAuthenticated && jobSeeker ? (
          <div className="max-w-2xl mx-auto mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <ReviewForm onSubmitted={() => {}} />
          </div>
        ) : (
          <div className="max-w-2xl mx-auto mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Card className="p-6 md:p-8 bg-gradient-to-br from-primary/5 to-accent/5 border-2 border-primary/20 text-center">
              <div className="w-14 h-14 mx-auto bg-gradient-to-br from-primary to-accent text-white rounded-2xl flex items-center justify-center mb-4">
                <UserPlus className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                Found your next opportunity through TalentBridgeHub?
              </h3>
              <p className="text-muted-foreground mb-6">
                Sign in to share your story and help others find their next opportunity.
              </p>
              <Button
                onClick={() => setLocation("/client/login")}
                className="bg-gradient-to-r from-primary to-accent text-white font-bold px-8 py-3 rounded-xl hover:shadow-lg hover:shadow-primary/40 transition-all duration-300 transform hover:scale-105 active:scale-95"
              >
                Sign In to Review
              </Button>
            </Card>
          </div>
        )}

        {reviewsQuery.isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="p-6 border-2 border-secondary/20">
                <Skeleton className="h-6 w-2/3 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-4/5 mb-4" />
                <Skeleton className="h-10 w-full" />
              </Card>
            ))}
          </div>
        ) : testimonials.length === 0 ? (
          <Card className="mx-auto max-w-2xl p-8 text-center border-2 border-secondary/20 bg-white">
            <MessageSquareText className="mx-auto mb-3 h-8 w-8 text-primary" />
            <h3 className="text-lg font-bold text-foreground">Stories will appear here</h3>
            <p className="mt-2 text-muted-foreground">
              TalentBridgeHub displays feedback only after it is submitted by a verified job seeker.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, idx) => (
              <Card
                key={testimonial.id}
                className="p-6 hover:shadow-lg transition-all duration-300 hover:border-primary/30 hover:-translate-y-2 cursor-pointer group bg-gradient-to-br from-white to-secondary/5 border border-secondary/20 animate-in fade-in slide-in-from-bottom-3 duration-700"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 transition-all duration-300 ${
                        i < testimonial.rating
                          ? "fill-accent text-accent group-hover:scale-110"
                          : "text-muted-foreground"
                      }`}
                    />
                  ))}
                </div>

                {/* Content */}
                <CollapsibleReview text={testimonial.content} />

                {/* Author */}
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    {testimonial.photoUrl ? (
                      <AvatarImage
                        src={testimonial.photoUrl}
                        alt={testimonial.name}
                        className="object-cover"
                      />
                    ) : null}
                    <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white font-semibold">
                      {testimonial.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
                      {testimonial.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      TalentBridgeHub job seeker
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
