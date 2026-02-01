import { CompareWizard } from "@/components/compare/compare-wizard";
import { TaxYearBadge } from "@/components/calculator/tax-year-badge";
import { LAST_UPDATED, TAX_YEAR } from "@/lib/constants/tax-year";

export default function ComparePage() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-2xl mb-8 md:mb-12">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <h1 className="text-3xl md:text-4xl font-bold text-zinc-50 tracking-tight">
              Compare Take-Home Pay Globally
            </h1>
            <TaxYearBadge />
          </div>
          <p className="text-zinc-400 text-base md:text-lg">
            Answer a few quick questions and see how your salary converts across
            countries. Uses {TAX_YEAR} tax rules with FX conversion.
          </p>
          <p className="text-zinc-500 text-sm mt-2">
            Salary input is annual. Results show monthly take-home pay and
            effective tax rates.
          </p>
        </div>

        <CompareWizard />

        <footer className="mt-12 pt-8 border-t border-zinc-800">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p className="text-sm text-zinc-500">
              FX rates are cached and may be delayed. Estimates use {TAX_YEAR}{" "}
              tax rules and simplified assumptions.
            </p>
            {LAST_UPDATED ? (
              <p className="text-xs text-zinc-600 whitespace-nowrap">
                Last updated: {LAST_UPDATED}
              </p>
            ) : null}
          </div>
        </footer>
      </main>
    </div>
  );
}
