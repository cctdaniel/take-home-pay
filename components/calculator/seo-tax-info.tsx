import type { CountryCode } from "@/lib/countries/types";

interface SEOTaxInfoProps {
  country: CountryCode;
}

/**
 * SEO-friendly tax information section.
 * Only renders content for the specified country (no CSS hide/show).
 * Each country page renders only its relevant content for better SEO.
 */
export function SEOTaxInfo({ country }: SEOTaxInfoProps) {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="text-xl font-semibold text-zinc-200 mb-4">
        How Your Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        {country === "US" && <USTaxInfo />}
        {country === "SG" && <SGTaxInfo />}
        {country === "KR" && <KRTaxInfo />}
        {country === "NL" && <NLTaxInfo />}
        {country === "AU" && <AUTaxInfo />}
      </div>
    </section>
  );
}

// ============================================================================
// US TAX INFO
// ============================================================================
function USTaxInfo() {
  return (
    <div>
      <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">
        United States
      </h3>
      <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
        <li>
          <strong className="text-zinc-300">Federal Income Tax</strong> –
          Progressive tax brackets from 10% to 37%
        </li>
        <li>
          <strong className="text-zinc-300">State Income Tax</strong> – Varies
          by state (0% to 13.3%)
        </li>
        <li>
          <strong className="text-zinc-300">Social Security</strong> – 6.2% up
          to ${new Intl.NumberFormat().format(181200)} wage base
        </li>
        <li>
          <strong className="text-zinc-300">Medicare</strong> – 1.45% (plus 0.9%
          above $200k)
        </li>
        <li>
          <strong className="text-zinc-300">State Disability Insurance</strong>{" "}
          – Required in CA, HI, NJ, NY, and RI
        </li>
        <li>
          <strong className="text-zinc-300">Pre-tax Deductions</strong> – 401(k)
          and HSA contributions reduce taxable income
        </li>
      </ul>
    </div>
  );
}

// ============================================================================
// SINGAPORE TAX INFO
// ============================================================================
function SGTaxInfo() {
  return (
    <div>
      <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">Singapore</h3>
      <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
        <li>
          <strong className="text-zinc-300">Income Tax</strong> – Progressive
          rates from 0% to 24%
        </li>
        <li>
          <strong className="text-zinc-300">
            CPF (Central Provident Fund)
          </strong>{" "}
          – Mandatory contributions for Citizens/PRs
        </li>
        <li>
          <strong className="text-zinc-300">CPF Rates by Age</strong> –
          Employee: 20% (under 55) to 5% (above 70)
        </li>
        <li>
          <strong className="text-zinc-300">Monthly Salary Ceiling</strong> –
          CPF contributions capped at S$8,000/month
        </li>
        <li>
          <strong className="text-zinc-300">Foreigners</strong> – No CPF
          contributions required
        </li>
        <li>
          <strong className="text-zinc-300">Tax Reliefs</strong> – Earned
          income, CPF, spouse, child, parent, SRS, and more
        </li>
      </ul>
    </div>
  );
}

// ============================================================================
// SOUTH KOREA TAX INFO
// ============================================================================
function KRTaxInfo() {
  return (
    <div>
      <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">
        South Korea
      </h3>
      <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
        <li>
          <strong className="text-zinc-300">Income Tax</strong> – Progressive
          rates from 6% to 45% (8 brackets)
        </li>
        <li>
          <strong className="text-zinc-300">Local Income Tax</strong> – 10% of
          national income tax
        </li>
        <li>
          <strong className="text-zinc-300">National Pension</strong> – 4.5%
          employee share (capped at ₩5.9M monthly income)
        </li>
        <li>
          <strong className="text-zinc-300">Health Insurance</strong> – 3.545%
          of income
        </li>
        <li>
          <strong className="text-zinc-300">Long-term Care</strong> – 12.95% of
          health insurance premium
        </li>
        <li>
          <strong className="text-zinc-300">Employment Insurance</strong> – 0.8%
          of income
        </li>
      </ul>

      <h4 className="text-md font-medium text-zinc-300 mt-4 mb-2">
        Deductions &amp; Credits Applied
      </h4>
      <ul className="text-zinc-400 space-y-1 mt-2 list-disc list-inside">
        <li>
          <strong className="text-zinc-300">Employment Income Deduction</strong>{" "}
          – Tiered deduction up to 70% for lower incomes
        </li>
        <li>
          <strong className="text-zinc-300">Basic Deduction</strong> –
          ₩1,500,000 per taxpayer
        </li>
        <li>
          <strong className="text-zinc-300">Dependent Deduction</strong> –
          ₩1,500,000 per dependent (spouse, parents)
        </li>
        <li>
          <strong className="text-zinc-300">Child Deduction</strong> –
          ₩1,500,000 per child under 20, +₩1,000,000 if under 7
        </li>
        <li>
          <strong className="text-zinc-300">Wage Earner Tax Credit</strong> – Up
          to 55% of tax for lower earners
        </li>
        <li>
          <strong className="text-zinc-300">Standard Tax Credit</strong> –
          ₩130,000 for simplified filers
        </li>
        <li>
          <strong className="text-zinc-300">Child Tax Credit</strong> – ₩150,000
          per child (₩300,000 for 3rd+)
        </li>
        <li>
          <strong className="text-zinc-300">Personal Pension Credit</strong> –
          13.2-16.5% on contributions up to ₩9,000,000
        </li>
        <li>
          <strong className="text-zinc-300">Non-Taxable Allowances</strong> –
          Meal (₩200,000/mo), Childcare (₩100,000/mo)
        </li>
      </ul>

      <h4 className="text-md font-medium text-zinc-300 mt-4 mb-2">
        Additional Reliefs (Not Included)
      </h4>
      <ul className="text-zinc-400 space-y-1 mt-2 list-disc list-inside text-sm">
        <li>Insurance premium credit (12%)</li>
        <li>Medical expense credit (15% above 3% income)</li>
        <li>Education expense credit (15%)</li>
        <li>Donation credit (15-30%)</li>
        <li>Rent credit (15-17% for non-homeowners)</li>
      </ul>
    </div>
  );
}

// ============================================================================
// NETHERLANDS TAX INFO
// ============================================================================
function NLTaxInfo() {
  return (
    <div>
      <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">
        Netherlands
      </h3>
      <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
        <li>
          <strong className="text-zinc-300">Income Tax</strong> – Two
          progressive brackets for 2026
        </li>
        <li>
          <strong className="text-zinc-300">National Insurance</strong> –
          Combined with income tax for most taxpayers under AOW age
        </li>
        <li>
          <strong className="text-zinc-300">30% Ruling</strong> – Optional
          tax-exempt allowance (30% of salary)
        </li>
        <li>
          <strong className="text-zinc-300">Tax Credits</strong> – General,
          labor, and IACK (child) credits included
        </li>
        <li>
          <strong className="text-zinc-300">No Regional Taxes</strong> –
          National rates apply uniformly
        </li>
      </ul>
    </div>
  );
}

// ============================================================================
// AUSTRALIA TAX INFO
// ============================================================================
function AUTaxInfo() {
  return (
    <div>
      <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">Australia</h3>
      <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
        <li>
          <strong className="text-zinc-300">Income Tax</strong> – Progressive
          brackets from 0% to 45% (Stage 3 tax cuts applied)
        </li>
        <li>
          <strong className="text-zinc-300">Tax-Free Threshold</strong> – First
          A$18,200 is tax-free for residents
        </li>
        <li>
          <strong className="text-zinc-300">Low Income Tax Offset (LITO)</strong>{" "}
          – Up to A$700 for incomes under A$66,667
        </li>
        <li>
          <strong className="text-zinc-300">Medicare Levy</strong> – 2% of
          taxable income (with low-income reduction)
        </li>
        <li>
          <strong className="text-zinc-300">Medicare Levy Surcharge</strong> –
          1-1.5% if no private health insurance and income above A$101,000
        </li>
        <li>
          <strong className="text-zinc-300">Superannuation</strong> – 12%
          employer contribution (not deducted from salary)
        </li>
      </ul>

      <h4 className="text-md font-medium text-zinc-300 mt-4 mb-2">
        Tax Brackets 2025-26 (Residents)
      </h4>
      <ul className="text-zinc-400 space-y-1 mt-2 list-disc list-inside text-sm">
        <li>$0 – $18,200: 0% (tax-free)</li>
        <li>$18,201 – $45,000: 16%</li>
        <li>$45,001 – $135,000: 30%</li>
        <li>$135,001 – $190,000: 37%</li>
        <li>$190,001+: 45%</li>
      </ul>

      <h4 className="text-md font-medium text-zinc-300 mt-4 mb-2">
        Foreign Residents
      </h4>
      <ul className="text-zinc-400 space-y-1 mt-2 list-disc list-inside text-sm">
        <li>No tax-free threshold – taxed from first dollar</li>
        <li>32.5% on first $135,000</li>
        <li>No LITO or Medicare levy</li>
      </ul>
    </div>
  );
}
