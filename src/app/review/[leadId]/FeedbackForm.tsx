"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-alert";
import { Textarea } from "@/components/ui/textarea";
import { useDictionary } from "@/components/LocaleProvider";
import { interpolate } from "@/lib/get-dictionary";

type FeedbackFormProps = {
  restaurantId: string;
};

export function FeedbackForm({ restaurantId }: FeedbackFormProps) {
  const dict = useDictionary();
  const r = dict.review;
  const [rating, setRating] = useState(3);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restaurantId, rating, comment }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? r.submitError);
        return;
      }

      setSubmitted(true);
    } catch {
      setError(r.networkError);
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="rounded-2xl bg-emerald-50 px-4 py-6 text-center ring-1 ring-emerald-100">
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
          </svg>
        </div>
        <p className="text-sm font-medium text-emerald-800">{r.thankYou}</p>
        <p className="mt-1 text-sm text-emerald-700">{r.managementReview}</p>
      </div>
    );
  }

  const activeRating = hoverRating || rating;

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div>
        <label className="mb-3 block text-sm font-medium text-slate-700">{r.rateVisit}</label>
        <div className="flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              className={`flex h-12 w-12 items-center justify-center rounded-2xl text-xl transition-all duration-200 ${
                value <= activeRating
                  ? "scale-105 bg-amber-400 text-white shadow-sm"
                  : "bg-slate-100 text-slate-300 hover:bg-slate-200 hover:text-slate-400"
              }`}
              key={value}
              onClick={() => setRating(value)}
              onMouseEnter={() => setHoverRating(value)}
              onMouseLeave={() => setHoverRating(0)}
              type="button"
            >
              ★
            </button>
          ))}
        </div>
        <p className="mt-2 text-center text-xs text-slate-400">
          {interpolate(r.outOfStars, { rating: activeRating })}
        </p>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="comment">
          {r.improveLabel}
        </label>
        <Textarea
          disabled={loading}
          id="comment"
          maxLength={2000}
          onChange={(event) => setComment(event.target.value)}
          placeholder={r.improvePlaceholder}
          rows={5}
          value={comment}
        />
      </div>

      <FormAlert message={error} />

      <Button className="w-full" disabled={loading} size="lg" type="submit">
        {loading ? r.submitting : r.submitFeedback}
      </Button>
    </form>
  );
}
