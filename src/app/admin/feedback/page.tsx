import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import { getDictionary } from "@/lib/get-dictionary";
import { getLocale } from "@/lib/i18n-server";

function RatingBadge({ rating, starsLabel }: { rating: number; starsLabel: string }) {
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

export default async function AdminFeedbackPage() {
  const locale = await getLocale();
  const a = getDictionary(locale).admin;

  const feedbacks = await prisma.feedback.findMany({
    include: { restaurant: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{a.feedbackEyebrow}</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-900">{a.feedbackTitle}</h1>
        <p className="mt-1 text-sm text-slate-500">{a.feedbackSubtitle}</p>
      </div>

      {feedbacks.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-500 shadow-sm">
          {a.noFeedback}
        </div>
      ) : (
        <div className="w-full overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {a.colRestaurant}
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {a.colRating}
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {a.colComment}
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {a.colSubmitted}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {feedbacks.map((feedback) => (
                <tr className="transition-colors duration-200 hover:bg-slate-50" key={feedback.id}>
                  <td className="whitespace-nowrap px-6 py-4 font-medium text-zinc-900">
                    {feedback.restaurant.name}
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      <StarRow rating={feedback.rating} />
                      <RatingBadge rating={feedback.rating} starsLabel={a.stars} />
                    </div>
                  </td>
                  <td className="max-w-md px-6 py-4 text-slate-600">
                    <p className="line-clamp-3">{feedback.comment ?? a.noComment}</p>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-slate-600">
                    {feedback.createdAt.toLocaleDateString("en-US", {
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
      )}
    </div>
  );
}
