"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type FeedbackFormProps = {
  restaurantId: string;
};

export function FeedbackForm({ restaurantId }: FeedbackFormProps) {
  const [rating, setRating] = useState(3);
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
        setError(data.error ?? "Could not submit feedback.");
        return;
      }

      setSubmitted(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="text-center">
        <p className="text-sm font-medium text-green-700">Thank you for your feedback.</p>
        <p className="mt-1 text-sm text-gray-600">Management will review this privately.</p>
      </div>
    );
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="rating">
          Rating
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              className={`h-10 w-10 rounded-full text-sm font-semibold transition-colors ${
                rating === value
                  ? "bg-zinc-900 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              key={value}
              onClick={() => setRating(value)}
              type="button"
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="comment">
          What could we improve?
        </label>
        <textarea
          className="w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-sm outline-none ring-zinc-900 placeholder:text-zinc-400 focus:ring-2"
          disabled={loading}
          id="comment"
          onChange={(event) => setComment(event.target.value)}
          placeholder="Tell us what went wrong…"
          rows={4}
          value={comment}
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button className="w-full" disabled={loading} type="submit">
        {loading ? "Submitting…" : "Submit Feedback"}
      </Button>
    </form>
  );
}
