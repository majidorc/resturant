import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody } from "@/components/ui/card";

function RatingBadge({ rating }: { rating: number }) {
  const variant = rating <= 2 ? "danger" : rating === 3 ? "warning" : "success";
  return <Badge variant={variant}>{rating} / 5 stars</Badge>;
}

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, index) => (
        <span
          className={`text-sm transition-colors duration-200 ${index < rating ? "text-amber-400" : "text-slate-200"}`}
          key={index}
        >
          ★
        </span>
      ))}
    </div>
  );
}

export default async function AdminFeedbackPage() {
  const feedbacks = await prisma.feedback.findMany({
    include: { restaurant: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-indigo-500">Quality Monitor</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">Global Feedback</h1>
        <p className="mt-1 text-sm text-slate-500">Internal negative feedback submitted across all restaurants.</p>
      </div>

      {feedbacks.length === 0 ? (
        <Card>
          <CardBody className="py-12 text-center text-sm text-slate-500">
            No customer feedback recorded yet.
          </CardBody>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-indigo-50/60">
                <tr>
                  <th className="px-5 py-3 text-left font-medium text-slate-600">Restaurant</th>
                  <th className="px-5 py-3 text-left font-medium text-slate-600">Rating</th>
                  <th className="px-5 py-3 text-left font-medium text-slate-600">Comment</th>
                  <th className="px-5 py-3 text-left font-medium text-slate-600">Submitted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80">
                {feedbacks.map((feedback) => (
                  <tr className="transition-all duration-200 hover:bg-slate-50/50" key={feedback.id}>
                    <td className="px-5 py-4 font-medium text-slate-900">{feedback.restaurant.name}</td>
                    <td className="px-5 py-4">
                      <div className="space-y-2">
                        <StarRow rating={feedback.rating} />
                        <RatingBadge rating={feedback.rating} />
                      </div>
                    </td>
                    <td className="max-w-md px-5 py-4 text-slate-600">
                      {feedback.comment ?? "No comment provided."}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-slate-500">
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
        </Card>
      )}
    </div>
  );
}
