import { prisma } from "@/lib/prisma";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }, (_, index) => (
        <span
          className={index < rating ? "text-amber-500" : "text-zinc-300"}
          key={index}
        >
          ★
        </span>
      ))}
      <span className="ml-2 text-xs text-zinc-500">({rating}/5)</span>
    </div>
  );
}

export default async function AdminFeedbackPage() {
  const feedbacks = await prisma.feedback.findMany({
    include: {
      restaurant: {
        select: { name: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Global Feedback Monitor</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Internal negative feedback submitted across all restaurants.
        </p>
      </div>

      {feedbacks.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-10 text-center text-sm text-zinc-500">
          No customer feedback recorded yet.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-zinc-200 text-sm">
            <thead className="bg-zinc-50">
              <tr>
                <th className="px-5 py-3 text-left font-medium text-zinc-600">Restaurant</th>
                <th className="px-5 py-3 text-left font-medium text-zinc-600">Rating</th>
                <th className="px-5 py-3 text-left font-medium text-zinc-600">Comment</th>
                <th className="px-5 py-3 text-left font-medium text-zinc-600">Submitted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {feedbacks.map((feedback) => (
                <tr key={feedback.id}>
                  <td className="px-5 py-4 font-medium text-zinc-900">
                    {feedback.restaurant.name}
                  </td>
                  <td className="px-5 py-4">
                    <StarRating rating={feedback.rating} />
                  </td>
                  <td className="max-w-md px-5 py-4 text-zinc-700">
                    {feedback.comment ?? "No comment provided."}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-zinc-600">
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
