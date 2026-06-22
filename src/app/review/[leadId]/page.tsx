import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { FeedbackForm } from "./FeedbackForm";

interface ReviewPageProps {
  params: Promise<{ leadId: string }>;
  searchParams: Promise<{ satisfied?: string }>;
}

export default async function ReviewRouterPage({ params, searchParams }: ReviewPageProps) {
  const { leadId } = await params;
  const { satisfied } = await searchParams;

  const lead = await prisma.customerLead.findUnique({
    where: { id: leadId },
    include: { restaurant: true },
  });

  if (!lead) {
    notFound();
  }

  if (satisfied === "true" && lead.restaurant.googleReviewUrl) {
    redirect(lead.restaurant.googleReviewUrl);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md space-y-6 rounded-xl border border-gray-100 bg-white p-8 shadow-sm">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">We appreciate your honesty</h2>
          <p className="mt-2 text-sm text-gray-600">
            We are sorry your experience at{" "}
            <span className="font-semibold">{lead.restaurant.name}</span> didn&apos;t meet
            expectations. Please let management know what we can fix.
          </p>
        </div>

        <FeedbackForm restaurantId={lead.restaurant.id} />
      </div>
    </div>
  );
}
