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

        {/* SEO Content Section - static for search engines */}
        <section className="mt-16 max-w-3xl">
          <h2 className="text-xl font-semibold text-zinc-200 mb-4">
            How Your Take Home Pay Is Calculated
          </h2>
          <div className="prose prose-invert prose-zinc prose-sm">
            <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">United States</h3>
            <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
              <li><strong className="text-zinc-300">Federal Income Tax</strong> – Progressive tax brackets from 10% to 37%</li>
              <li><strong className="text-zinc-300">State Income Tax</strong> – Varies by state (0% to 13.3%)</li>
              <li><strong className="text-zinc-300">Social Security</strong> – 6.2% up to ${new Intl.NumberFormat().format(181200)} wage base</li>
              <li><strong className="text-zinc-300">Medicare</strong> – 1.45% (plus 0.9% above $200k)</li>
              <li><strong className="text-zinc-300">State Disability Insurance</strong> – Required in CA, HI, NJ, NY, and RI</li>
              <li><strong className="text-zinc-300">Pre-tax Deductions</strong> – 401(k) and HSA contributions reduce taxable income</li>
            </ul>

            <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">Singapore</h3>
            <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
              <li><strong className="text-zinc-300">Income Tax</strong> – Progressive rates from 0% to 24%</li>
              <li><strong className="text-zinc-300">CPF (Central Provident Fund)</strong> – Mandatory contributions for Citizens/PRs</li>
              <li><strong className="text-zinc-300">CPF Rates by Age</strong> – Employee: 20% (under 55) to 5% (above 70)</li>
              <li><strong className="text-zinc-300">Monthly Salary Ceiling</strong> – CPF contributions capped at S$8,000/month</li>
              <li><strong className="text-zinc-300">Foreigners</strong> – No CPF contributions required</li>
              <li><strong className="text-zinc-300">Tax Reliefs</strong> – Earned income, CPF, spouse, child, parent, SRS, and more</li>
            </ul>
          </div>
        </section>

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
