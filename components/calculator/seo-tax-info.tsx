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
        {country === "PT" && <PTTaxInfo />}
        {country === "TH" && <THTaxInfo />}
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
          <strong className="text-zinc-300">Division 293 Tax</strong> –
          Additional 15% on concessional super contributions when income + super
          exceeds A$250,000 (high income earners)
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

// ============================================================================
// PORTUGAL TAX INFO
// ============================================================================
function PTTaxInfo() {
  return (
    <div>
      <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">Portugal</h3>
      <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
        <li>
          <strong className="text-zinc-300">IRS (Income Tax)</strong> –
          Progressive rates from 13% to 48% (9 brackets for residents)
        </li>
        <li>
          <strong className="text-zinc-300">Social Security</strong> – 11%
          employee contribution (Segurança Social)
        </li>
        <li>
          <strong className="text-zinc-300">Specific Deduction</strong> – Minimum
          €4,104 or actual SS contributions (whichever is higher)
        </li>
        <li>
          <strong className="text-zinc-300">Solidarity Surcharge</strong> –
          Additional 2.5% (€80k-€250k) and 5% (above €250k)
        </li>
        <li>
          <strong className="text-zinc-300">Non-Residents</strong> – Flat 25%
          rate on Portuguese-source income
        </li>
      </ul>

      <h4 className="text-md font-medium text-zinc-300 mt-4 mb-2">
        IRS Tax Brackets 2026 (Residents)
      </h4>
      <ul className="text-zinc-400 space-y-1 mt-2 list-disc list-inside text-sm">
        <li>€0 – €7,703: 13%</li>
        <li>€7,703 – €11,623: 16.5%</li>
        <li>€11,623 – €16,472: 22%</li>
        <li>€16,472 – €21,321: 25%</li>
        <li>€21,321 – €27,146: 32%</li>
        <li>€27,146 – €39,791: 35.5%</li>
        <li>€39,791 – €43,081: 43.5%</li>
        <li>€43,081 – €58,528: 45%</li>
        <li>€58,528+: 48%</li>
      </ul>

      <h4 className="text-md font-medium text-zinc-300 mt-4 mb-2">
        Solidarity Surcharge (Adicional de Solidariedade)
      </h4>
      <ul className="text-zinc-400 space-y-1 mt-2 list-disc list-inside text-sm">
        <li>Income €80,000 – €250,000: 2.5%</li>
        <li>Income above €250,000: 5%</li>
      </ul>

      <h4 className="text-md font-medium text-zinc-300 mt-4 mb-2">
        Tax Benefits & Deductions
      </h4>
      <ul className="text-zinc-400 space-y-1 mt-2 list-disc list-inside text-sm">
        <li>
          <strong className="text-zinc-300">PPR (Retirement Savings Plan)</strong> –
          20% tax credit on contributions. Limits: €2,000 (under 35), €1,750 (35-50), €1,500 (over 50)
        </li>
        <li>
          <strong className="text-zinc-300">Dependent Deductions</strong> –
          €600 per dependent deducted from tax assessed
        </li>
      </ul>

      <h4 className="text-md font-medium text-zinc-300 mt-4 mb-2">
        Employer Contributions
      </h4>
      <p className="text-zinc-400 text-sm">
        Employers contribute an additional 23.75% for Social Security.
        This is not deducted from your salary but is shown for reference.
      </p>
    </div>
  );
}

// ============================================================================
// THAILAND TAX INFO
// ============================================================================
function THTaxInfo() {
  return (
    <div>
      <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">Thailand</h3>
      <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
        <li>
          <strong className="text-zinc-300">Personal Income Tax</strong> –
          Progressive rates from 0% to 35% (8 brackets)
        </li>
        <li>
          <strong className="text-zinc-300">Standard Deduction</strong> –
          50% of employment income, capped at ฿100,000
        </li>
        <li>
          <strong className="text-zinc-300">Personal Allowance</strong> –
          ฿60,000 per taxpayer
        </li>
        <li>
          <strong className="text-zinc-300">Social Security Fund</strong> –
          5% employee contribution (capped at ฿750/month)
        </li>
        <li>
          <strong className="text-zinc-300">Provident Fund (PVD)</strong> –
          Voluntary contribution up to 15% of income (max ฿500,000 deduction)
        </li>
        <li>
          <strong className="text-zinc-300">Retirement Mutual Fund (RMF)</strong> –
          Tax deductible up to 30% of income (max ฿500,000)
        </li>
        <li>
          <strong className="text-zinc-300">Super Savings Fund (SSF)</strong> –
          Tax deductible up to 30% of income (max ฿200,000)
        </li>
      </ul>

      <h4 className="text-md font-medium text-zinc-300 mt-4 mb-2">
        Tax Brackets 2026 (Residents)
      </h4>
      <ul className="text-zinc-400 space-y-1 mt-2 list-disc list-inside text-sm">
        <li>฿0 – ฿150,000: 0% (exempt)</li>
        <li>฿150,001 – ฿300,000: 5%</li>
        <li>฿300,001 – ฿500,000: 10%</li>
        <li>฿500,001 – ฿750,000: 15%</li>
        <li>฿750,001 – ฿1,000,000: 20%</li>
        <li>฿1,000,001 – ฿2,000,000: 25%</li>
        <li>฿2,000,001 – ฿5,000,000: 30%</li>
        <li>฿5,000,001+: 35%</li>
      </ul>

      <h4 className="text-md font-medium text-zinc-300 mt-4 mb-2">
        Personal Allowances & Deductions
      </h4>
      <ul className="text-zinc-400 space-y-1 mt-2 list-disc list-inside text-sm">
        <li>Personal allowance: ฿60,000</li>
        <li>Spouse allowance: ฿60,000 (if no income)</li>
        <li>Child allowance: ฿30,000 per child (฿60,000 if born 2018+)</li>
        <li>Parent allowance: ฿30,000 per parent (age 60+, income ≤฿30,000)</li>
        <li>Disabled person: ฿60,000 per person</li>
        <li>Life insurance: Up to ฿100,000 (10+ year policy)</li>
        <li>Health insurance (self): Up to ฿25,000</li>
        <li>Health insurance (parents): Up to ฿15,000</li>
        <li>Home mortgage interest: Up to ฿100,000</li>
        <li>Donations: Up to 10% of net income</li>
        <li>Elderly/disabled taxpayer: ฿190,000 exemption</li>
      </ul>

      <h4 className="text-md font-medium text-zinc-300 mt-4 mb-2">
        Retirement Savings (Combined ฿500,000 Limit)
      </h4>
      <ul className="text-zinc-400 space-y-1 mt-2 list-disc list-inside text-sm">
        <li>Provident Fund (PVD): Up to 15% of income</li>
        <li>Retirement Mutual Fund (RMF): Up to 30% of income</li>
        <li>Super Savings Fund (SSF): Up to 30% of income</li>
        <li>Pension life insurance: Up to 15% of income (max ฿200,000)</li>
      </ul>

      <h4 className="text-md font-medium text-zinc-300 mt-4 mb-2">
        Thai ESG Fund (2024-2026 Special Period)
      </h4>
      <ul className="text-zinc-400 space-y-1 mt-2 list-disc list-inside text-sm">
        <li>Tax deductible up to 30% of income (max ฿300,000)</li>
        <li>Must hold units for at least 5 years (normally 8 years)</li>
        <li>Supports environmental, social, and governance investments</li>
      </ul>

      <h4 className="text-md font-medium text-zinc-300 mt-4 mb-2">
        Non-Residents
      </h4>
      <p className="text-zinc-400 text-sm">
        Non-residents are subject to tax on Thai-sourced income only. 
        Employment income is taxed at a flat 15% or progressive rates, 
        whichever is higher. The standard deduction and personal allowances 
        generally do not apply to non-residents.
      </p>

      <h4 className="text-md font-medium text-zinc-300 mt-4 mb-2">
        Employer Contributions
      </h4>
      <p className="text-zinc-400 text-sm">
        Employers match the employee&apos;s Social Security contribution (5% up to ฿750/month).
        For Provident Fund, employers typically match employee contributions (2-15%).
        These employer contributions are not deducted from your salary but are shown for reference.
      </p>

      <h4 className="text-md font-medium text-zinc-300 mt-4 mb-2">
        Tax Filing
      </h4>
      <p className="text-zinc-400 text-sm">
        The tax year in Thailand follows the calendar year (January 1 – December 31).
        Tax returns must be filed by March 31 of the following year. Employers 
        are required to withhold tax from salaries and remit it to the Revenue Department monthly.
      </p>
    </div>
  );
}
