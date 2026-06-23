import { Badge } from "@/components/ui/badge";
import { BarChart3, Mail, QrCode, Star, Wifi } from "lucide-react";

export function DashboardMockup() {
  return (
    <div className="relative mx-auto mt-14 max-w-5xl animate-fade-in-up px-2 sm:px-0">
      <div className="absolute inset-x-8 top-8 -z-10 h-40 rounded-full bg-slate-200/60 blur-3xl" />
      <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xl shadow-slate-200/60 transition-all duration-200 ease-in-out hover:shadow-slate-300/70">
        <div className="flex items-center gap-2 border-b border-slate-100/80 bg-slate-50 px-4 py-3">
          <span className="h-3 w-3 rounded-full bg-red-300" />
          <span className="h-3 w-3 rounded-full bg-amber-300" />
          <span className="h-3 w-3 rounded-full bg-emerald-300" />
          <p className="ml-3 text-xs font-medium text-slate-400">ReviewBite Dashboard Preview</p>
        </div>

        <div className="grid gap-4 bg-gradient-to-b from-slate-50 to-white p-4 sm:grid-cols-[220px_1fr] sm:p-6">
          <aside className="hidden rounded-2xl border border-slate-100/80 bg-white p-4 shadow-sm sm:block">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Restaurant</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">Green Bistro Coffee</p>
            <div className="mt-4 space-y-2">
              {["Overview", "Menu", "Settings"].map((item, index) => (
                <div
                  className={`rounded-xl px-3 py-2 text-sm ${
                    index === 0 ? "bg-slate-900 text-white" : "text-slate-600"
                  }`}
                  key={item}
                >
                  {item}
                </div>
              ))}
            </div>
          </aside>

          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { label: "Leads", value: "128", icon: Mail },
                { label: "Conversion", value: "67%", icon: BarChart3 },
                { label: "Reviews", value: "4.8", icon: Star },
              ].map((metric) => (
                <div
                  className="rounded-2xl border border-slate-100/80 bg-white p-4 shadow-sm transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-md"
                  key={metric.label}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-slate-500">{metric.label}</p>
                    <metric.icon className="h-4 w-4 text-slate-400" />
                  </div>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">{metric.value}</p>
                </div>
              ))}
            </div>

            <div className="grid gap-3 lg:grid-cols-2">
              <div className="rounded-2xl border border-slate-100/80 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-900">Live Guest Flow</p>
                  <Badge variant="success">Active</Badge>
                </div>
                <div className="mt-4 space-y-3">
                  {[
                    "Guest scans table QR code",
                    "Email unlocks Wi-Fi + menu",
                    "24h review email sent automatically",
                  ].map((step, index) => (
                    <div className="flex items-center gap-3" key={step}>
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                        {index + 1}
                      </span>
                      <p className="text-sm text-slate-600">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-100/80 bg-white p-4 shadow-sm">
                <p className="text-sm font-semibold text-slate-900">Public Menu Preview</p>
                <div className="mt-4 rounded-2xl border border-slate-100/80 bg-slate-50 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <QrCode className="h-4 w-4 text-slate-500" />
                      <p className="text-sm font-medium text-slate-800">Specialty Coffee</p>
                    </div>
                    <p className="text-sm font-semibold text-slate-900">$5.25</p>
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-slate-200/80 pt-3">
                    <div className="flex items-center gap-2">
                      <Wifi className="h-4 w-4 text-slate-500" />
                      <p className="text-sm font-medium text-slate-800">Guest Wi-Fi Unlocked</p>
                    </div>
                    <Badge>12 leads today</Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
