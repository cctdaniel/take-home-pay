import { MultiCountryCalculator } from "@/components/calculator/multi-country-calculator";
import { TaxYearBadge } from "@/components/calculator/tax-year-badge";
import { TAX_YEAR, LAST_UPDATED } from "@/lib/constants/tax-year";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <main className="container mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="max-w-2xl mb-8 md:mb-12">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <h1 className="text-3xl md:text-4xl font-bold text-zinc-50 tracking-tight">
              Take Home Pay Calculator
            </h1>
            <TaxYearBadge />
          </div>
          <p className="text-zinc-400 text-base md:text-lg">
            Calculate your actual salary after taxes. Supports the United States (all 50 states + D.C.)
            and Singapore with {TAX_YEAR} tax brackets, social security contributions, and more.
          </p>
          <p className="text-zinc-500 text-sm mt-2">
            US: Federal & state taxes, Social Security, Medicare, 401(k), HSA, IRA
            <br />
            Singapore: Income tax, CPF contributions (based on age and residency), SRS
          </p>
        </div>

        {/* Calculator */}
        <MultiCountryCalculator />

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-zinc-800">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p className="text-sm text-zinc-500">
              This calculator provides estimates based on {TAX_YEAR} tax rules.
              Actual tax liability may vary. Consult a tax professional for personalized advice.
            </p>
            <p className="text-xs text-zinc-600 whitespace-nowrap">
              Last updated: {LAST_UPDATED}
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}
