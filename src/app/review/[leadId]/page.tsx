import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { FeedbackForm } from "./FeedbackForm";
import { getDictionary, interpolate } from "@/lib/get-dictionary";
import { getLocale } from "@/lib/i18n-server";

interface ReviewPageProps {
  params: Promise<{ leadId: string }>;
  searchParams: Promise<{ satisfied?: string }>;
}

export default async function ReviewRouterPage({ params, searchParams }: ReviewPageProps) {
  const { leadId } = await params;
  const { satisfied } = await searchParams;
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const r = dict.review;

  const lead = await prisma.customerLead.findUnique({
    where: { id: leadId },
    include: { restaurant: true },
  });

  if (!lead || !lead.restaurant.isActive) {
    notFound();
  }

  if (satisfied === "true") {
    if (lead.restaurant.googleReviewUrl) {
      redirect(lead.restaurant.googleReviewUrl);
    }

    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 via-white to-slate-200 px-4 py-12">
        <div className="w-full max-w-md animate-fade-in-up overflow-hidden rounded-3xl border border-slate-100/80 bg-white/95 p-8 text-center shadow-xl backdrop-blur-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-sm">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">{r.positiveThankYouTitle}</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            {interpolate(r.positiveThankYouSubtitle, { restaurantName: lead.restaurant.name })}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 via-white to-slate-200 px-4 py-12">
      <div className="w-full max-w-md animate-fade-in-up overflow-hidden rounded-3xl border border-slate-100/80 bg-white/95 p-8 shadow-xl backdrop-blur-sm">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-4l-4 4z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
              />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">{r.honestyTitle}</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            {interpolate(r.honestySubtitle, { restaurantName: lead.restaurant.name })}
          </p>
        </div>

        <div className="mt-8">
          <FeedbackForm restaurantId={lead.restaurant.id} />
        </div>
      </div>
    </main>
  );
}
