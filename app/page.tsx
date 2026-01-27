import { SalaryCalculator } from "@/components/calculator/salary-calculator";
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
            Calculate your actual salary after taxes for any US state. Includes {TAX_YEAR} federal
            and state tax brackets, Social Security, Medicare, and retirement contributions.
          </p>
          <p className="text-zinc-500 text-sm mt-2">
            Supports all 50 US states plus Washington D.C.
          </p>
        </div>

        {/* Calculator */}
        <SalaryCalculator />

        {/* SEO Content Section */}
        <section className="mt-16 max-w-3xl">
          <h2 className="text-xl font-semibold text-zinc-200 mb-4">
            How Your Take Home Pay Is Calculated
          </h2>
          <div className="prose prose-invert prose-zinc prose-sm">
            <p className="text-zinc-400">
              Your take home pay (also called net pay) is your gross salary minus all tax
              withholdings and deductions. This calculator accounts for:
            </p>
            <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
              <li><strong className="text-zinc-300">Federal Income Tax</strong> – Progressive tax brackets from 10% to 37%</li>
              <li><strong className="text-zinc-300">State Income Tax</strong> – Varies by state (0% to 13.3%)</li>
              <li><strong className="text-zinc-300">Social Security</strong> – 6.2% up to ${new Intl.NumberFormat().format(181200)} wage base</li>
              <li><strong className="text-zinc-300">Medicare</strong> – 1.45% (plus 0.9% above $200k)</li>
              <li><strong className="text-zinc-300">State Disability Insurance</strong> – Required in CA, HI, NJ, NY, and RI</li>
              <li><strong className="text-zinc-300">Pre-tax Deductions</strong> – 401(k) and HSA contributions reduce taxable income</li>
            </ul>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-zinc-800">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p className="text-sm text-zinc-500">
              This calculator provides estimates based on {TAX_YEAR} federal and state tax brackets.
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
