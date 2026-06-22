import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { FeedbackList } from "@/components/feedback/FeedbackList";
import { getDictionary } from "@/lib/get-dictionary";
import { getLocale } from "@/lib/i18n-server";

export default async function DashboardFeedbackPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const locale = await getLocale();
  const dict = getDictionary(locale);
  const d = dict.dashboard;

  const restaurant = await prisma.restaurant.findUnique({
    where: { userId: session.user.id },
    select: { id: true, name: true },
  });

  if (!restaurant) {
    redirect("/dashboard");
  }

  const feedbacks = await prisma.feedback.findMany({
    where: { restaurantId: restaurant.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {d.feedbackEyebrow}
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-900">
          {d.feedbackTitle}
        </h1>
        <p className="mt-1 text-sm text-slate-500">{d.feedbackSubtitle}</p>
      </div>

      <FeedbackList
        feedbacks={feedbacks}
        labels={{
          colRating: d.colRating,
          colComment: d.colComment,
          colSubmitted: d.colSubmitted,
          noComment: d.noComment,
          noFeedback: d.noFeedback,
          stars: d.stars,
        }}
        locale={locale}
      />

      <p className="text-sm text-slate-500">
        {d.feedbackOverviewHint}{" "}
        <Link
          className="font-medium text-slate-900 underline-offset-2 transition-colors hover:underline"
          href="/dashboard"
        >
          {d.navOverview}
        </Link>
        .
      </p>
    </div>
  );
}
