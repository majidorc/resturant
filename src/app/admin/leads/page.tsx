import { prisma } from "@/lib/prisma";
import { ExportLeadsButton } from "@/components/admin/ExportLeadsButton";
import { Badge } from "@/components/ui/badge";
import { getDictionary } from "@/lib/get-dictionary";
import { getLocale } from "@/lib/i18n-server";

export default async function AdminLeadsPage() {
  const locale = await getLocale();
  const a = getDictionary(locale).admin;

  const leads = await prisma.customerLead.findMany({
    include: {
      restaurant: {
        select: { name: true, slug: true, isActive: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 500,
  });

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {a.leadsEyebrow}
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-900">{a.leadsTitle}</h1>
          <p className="mt-1 text-sm text-slate-500">{a.leadsSubtitle}</p>
        </div>
        <ExportLeadsButton label={a.exportLeadsCsv} />
      </div>

      {leads.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-500 shadow-sm">
          {a.noLeads}
        </div>
      ) : (
        <div className="w-full overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {a.colEmail}
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {a.colRestaurant}
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {a.colSource}
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {a.colReviewEmail}
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {a.colCaptured}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {leads.map((lead) => (
                <tr className="transition-colors duration-200 hover:bg-slate-50" key={lead.id}>
                  <td className="whitespace-nowrap px-6 py-4 font-medium text-zinc-900">{lead.email}</td>
                  <td className="px-6 py-4">
                    <p>{lead.restaurant.name}</p>
                    {!lead.restaurant.isActive ? (
                      <Badge className="mt-1" variant="warning">
                        {a.statusInactive}
                      </Badge>
                    ) : null}
                  </td>
                  <td className="px-6 py-4">
                    <Badge>{lead.source}</Badge>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {lead.emailSent ? a.reviewEmailSent : a.reviewEmailPending}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-slate-600">
                    {lead.createdAt.toLocaleDateString(locale === "th" ? "th-TH" : "en-US", {
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
