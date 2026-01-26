import { TAX_YEAR } from "@/lib/constants/tax-year";

export function TaxYearBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-zinc-800 text-zinc-300 rounded-full border border-zinc-700">
      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
      Tax Year {TAX_YEAR}
    </span>
  );
}
