import { cn } from "@/lib/utils";

export type FeedbackRow = {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
  restaurantName?: string;
};

type FeedbackListProps = {
  feedbacks: FeedbackRow[];
  labels: {
    colRestaurant?: string;
    colRating: string;
    colComment: string;
    colSubmitted: string;
    noComment: string;
    noFeedback: string;
    stars: string;
  };
  locale: "en" | "th";
  showRestaurant?: boolean;
};

function RatingBadge({
  rating,
  starsLabel,
}: {
  rating: number;
  starsLabel: string;
}) {
  const tone =
    rating <= 2
      ? "bg-rose-50 text-rose-700 ring-1 ring-rose-100"
      : rating === 3
        ? "bg-amber-50 text-amber-700 ring-1 ring-amber-100"
        : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        tone,
      )}
    >
      {rating} / 5 {starsLabel}
    </span>
  );
}

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, index) => (
        <span
          className={cn(
            "text-sm",
            index < rating ? "text-amber-400" : "text-slate-200",
          )}
          key={index}
        >
          ★
        </span>
      ))}
    </div>
  );
}

export function FeedbackList({
  feedbacks,
  labels,
  locale,
  showRestaurant = false,
}: FeedbackListProps) {
  if (feedbacks.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-500 shadow-sm">
        {labels.noFeedback}
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full">
        <thead className="border-b border-slate-200 bg-slate-50">
          <tr>
            {showRestaurant && labels.colRestaurant ? (
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                {labels.colRestaurant}
              </th>
            ) : null}
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
              {labels.colRating}
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
              {labels.colComment}
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
              {labels.colSubmitted}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
          {feedbacks.map((feedback) => (
            <tr
              className="transition-colors duration-200 hover:bg-slate-50"
              key={feedback.id}
            >
              {showRestaurant ? (
                <td className="whitespace-nowrap px-6 py-4 font-medium text-zinc-900">
                  {feedback.restaurantName}
                </td>
              ) : null}
              <td className="px-6 py-4">
                <div className="space-y-2">
                  <StarRow rating={feedback.rating} />
                  <RatingBadge rating={feedback.rating} starsLabel={labels.stars} />
                </div>
              </td>
              <td className="max-w-md px-6 py-4 text-slate-600">
                <p className="line-clamp-3">{feedback.comment ?? labels.noComment}</p>
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-slate-600">
                {feedback.createdAt.toLocaleDateString(locale === "th" ? "th-TH" : "en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
