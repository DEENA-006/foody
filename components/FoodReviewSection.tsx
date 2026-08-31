"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Star, MessageSquare, Loader2, CheckCircle2, User, Sparkles } from "lucide-react";
import Toast from "./Toast";

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
}

export default function FoodReviewSection({
  foodId,
  foodName,
  initialRating,
  initialReviewsCount,
}: {
  foodId: string | number;
  foodName: string;
  initialRating: number;
  initialReviewsCount: number;
}) {
  const { data: session, status } = useSession();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const fetchReviews = () => {
    fetch(`/api/reviews?foodId=${foodId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.reviews) setReviews(data.reviews);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchReviews();
  }, [foodId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          foodId: String(foodId),
          foodName,
          rating,
          comment,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setToastMessage(data.error || "Failed to submit review");
      } else {
        setComment("");
        setRating(5);
        setToastMessage("Thank you! Your review has been submitted. ⭐");
        fetchReviews();
      }
    } catch {
      setToastMessage("Network error while submitting review.");
    } finally {
      setSubmitting(false);
    }
  };

  const totalReviewsCount = initialReviewsCount + reviews.length;
  const computedAverage =
    reviews.length > 0
      ? (
          (initialRating * initialReviewsCount +
            reviews.reduce((acc, r) => acc + r.rating, 0)) /
          totalReviewsCount
        ).toFixed(1)
      : initialRating.toFixed(1);

  return (
    <div className="bg-card border border-border rounded-3xl p-6 sm:p-10 shadow-sm mt-16 space-y-10">
      
      {/* Header & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-border">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-foreground mb-1.5 flex items-center gap-2.5">
            <MessageSquare className="w-7 h-7 text-brand" /> Customer Reviews
          </h2>
          <p className="text-xs text-foreground/60">
            Real feedback from verified Foodiee customers
          </p>
        </div>

        {/* Aggregate Badge */}
        <div className="flex items-center gap-4 bg-background/80 px-5 py-3 rounded-2xl border border-border self-start sm:self-auto">
          <div className="text-3xl font-black text-foreground">{computedAverage}</div>
          <div>
            <div className="flex items-center gap-0.5 text-amber-400">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= Math.round(Number(computedAverage)) ? "fill-amber-400" : "opacity-30"
                  }`}
                />
              ))}
            </div>
            <span className="text-[11px] text-foreground/60 font-semibold block mt-0.5">
              Based on {totalReviewsCount} ratings
            </span>
          </div>
        </div>
      </div>

      {/* Review Submission Form */}
      {status === "authenticated" ? (
        <div className="bg-background/60 p-6 sm:p-8 rounded-3xl border border-border space-y-4">
          <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand" /> Leave a Review for {foodName}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-foreground/70 uppercase tracking-wider mb-2">
                Your Rating
              </label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(null)}
                    className="p-1 text-amber-400 hover:scale-125 transition-transform"
                    aria-label={`${star} star`}
                  >
                    <Star
                      className={`w-7 h-7 ${
                        star <= (hoverRating ?? rating) ? "fill-amber-400" : "opacity-30"
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-bold text-foreground/80 ml-2">
                  {rating} / 5 Stars
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground/70 uppercase tracking-wider mb-2">
                Your Experience & Flavor Feedback
              </label>
              <textarea
                rows={3}
                required
                placeholder="How was the taste, freshness, portion size, and presentation?"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full px-4 py-3 bg-card border border-border rounded-2xl text-sm text-foreground focus:ring-2 focus:ring-brand focus:outline-none resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || !comment.trim()}
              className="bg-brand hover:bg-brand-hover text-white font-bold px-8 py-3 rounded-xl text-sm transition-all shadow-lg shadow-brand/20 active:scale-95 disabled:opacity-50 flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
                </>
              ) : (
                "Post Review"
              )}
            </button>
          </form>
        </div>
      ) : (
        <div className="bg-background/60 p-6 rounded-2xl border border-border text-center">
          <p className="text-sm text-foreground/70 mb-3">
            Have you tasted this dish? Log in to leave your review and help other food lovers!
          </p>
          <Link
            href={`/login?callbackUrl=/menu/${foodId}`}
            className="inline-block bg-brand text-white text-xs font-bold px-6 py-2.5 rounded-xl hover:bg-brand-hover transition-colors shadow-sm"
          >
            Log in to Write a Review
          </Link>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        <h3 className="font-bold text-base text-foreground/80">
          Customer Comments ({reviews.length})
        </h3>

        {loading ? (
          <div className="py-8 flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-brand" />
          </div>
        ) : reviews.length > 0 ? (
          <div className="divide-y divide-border border border-border rounded-2xl overflow-hidden bg-background/30">
            {reviews.map((rev) => (
              <div key={rev.id} className="p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-brand/10 text-brand font-bold flex items-center justify-center text-xs">
                      {rev.user?.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-foreground">
                        {rev.user?.name || rev.user?.email?.split("@")[0] || "Customer"}
                      </h4>
                      <span className="text-[10px] text-foreground/50">Verified Order</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-0.5 text-amber-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${s <= rev.rating ? "fill-amber-400" : "opacity-20"}`}
                      />
                    ))}
                  </div>
                </div>

                <p className="text-xs text-foreground/80 leading-relaxed pl-10">
                  {rev.comment}
                </p>

                <div className="pl-10 text-[10px] text-foreground/40">
                  {new Date(rev.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-background/30 rounded-2xl border border-dashed border-border text-xs text-foreground/50">
            Be the first customer to leave a review for {foodName}!
          </div>
        )}
      </div>

      <Toast
        message={toastMessage}
        isVisible={!!toastMessage}
        onClose={() => setToastMessage("")}
      />
    </div>
  );
}
