"use client";

import type { CountryCode } from "@/lib/countries/types";

interface TaxInfoSectionProps {
  country: CountryCode;
}

export function TaxInfoSection({ country }: TaxInfoSectionProps) {
  return (
    <section className="mt-8">
      <h2 className="text-xl font-semibold text-zinc-200 mb-4">
        How Your Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        {country === "US" && (
          <>
            <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">United States</h3>
            <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
              <li><strong className="text-zinc-300">Federal Income Tax</strong> – Progressive tax brackets from 10% to 37%</li>
              <li><strong className="text-zinc-300">State Income Tax</strong> – Varies by state (0% to 13.3%)</li>
              <li><strong className="text-zinc-300">Social Security</strong> – 6.2% up to ${new Intl.NumberFormat().format(181200)} wage base</li>
              <li><strong className="text-zinc-300">Medicare</strong> – 1.45% (plus 0.9% above $200k)</li>
              <li><strong className="text-zinc-300">State Disability Insurance</strong> – Required in CA, HI, NJ, NY, and RI</li>
              <li><strong className="text-zinc-300">Pre-tax Deductions</strong> – 401(k) and HSA contributions reduce taxable income</li>
            </ul>
          </>
        )}

        {country === "SG" && (
          <>
            <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">Singapore</h3>
            <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
              <li><strong className="text-zinc-300">Income Tax</strong> – Progressive rates from 0% to 24%</li>
              <li><strong className="text-zinc-300">CPF (Central Provident Fund)</strong> – Mandatory contributions for Citizens/PRs</li>
              <li><strong className="text-zinc-300">CPF Rates by Age</strong> – Employee: 20% (under 55) to 5% (above 70)</li>
              <li><strong className="text-zinc-300">Monthly Salary Ceiling</strong> – CPF contributions capped at S$8,000/month</li>
              <li><strong className="text-zinc-300">Foreigners</strong> – No CPF contributions required</li>
              <li><strong className="text-zinc-300">Tax Reliefs</strong> – Earned income, CPF, spouse, child, parent, SRS, and more</li>
            </ul>
          </>
        )}
      </div>
    </section>
  );
}
