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
        {country === "DE" && <DETaxInfo />}
        {country === "ES" && <ESTaxInfo />}
        {country === "GR" && <GRTaxInfo />}
        {country === "AU" && <AUTaxInfo />}
        {country === "PT" && <PTTaxInfo />}
        {country === "TH" && <THTaxInfo />}
        {country === "HK" && <HKTaxInfo />}
        {country === "ID" && <IDTaxInfo />}
        {country === "MY" && <MYTaxInfo />}
        {country === "TW" && <TWTaxInfo />}
        {country === "UK" && <UKTaxInfo />}
        {country === "CA" && <CATaxInfo />}
        {country === "MX" && <MXTaxInfo />}
        {country === "AE" && <AETaxInfo />}
        {country === "CN" && <CNTaxInfo />}
        {country === "CY" && <CYTaxInfo />}
        {country === "CZ" && <CZTaxInfo />}
        {country === "DK" && <DKTaxInfo />}
        {country === "FI" && <FITaxInfo />}
        {country === "GE" && <GETaxInfo />}
        {country === "HR" && <HRTaxInfo />}
        {country === "IN" && <INTaxInfo />}
        {country === "IS" && <ISTaxInfo />}
        {country === "JP" && <JPTaxInfo />}
        {country === "MT" && <MTTaxInfo />}
        {country === "NO" && <NOTaxInfo />}
        {country === "PH" && <PHTaxInfo />}
        {country === "SE" && <SETaxInfo />}
        {country === "VN" && <VNTaxInfo />}
        {country === "FR" && <FRTaxInfo />}
        {country === "IT" && <ITTaxInfo />}
        {country === "IE" && <IETaxInfo />}
        {country === "AT" && <ATTaxInfo />}
        {country === "BE" && <BETaxInfo />}
      </div>
    </section>
  );
}


// ============================================================================
// NEW EUROPE TAX INFO
// ============================================================================
function FRTaxInfo() {
  return (
    <div>
      <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">France</h3>
      <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
        <li><strong className="text-zinc-300">Income Tax</strong> – taxable salary is calculated after the modeled 10% employment expense deduction and taxed with France&apos;s progressive bands from 0% to 45%.</li>
        <li><strong className="text-zinc-300">Employee Contributions</strong> – mandatory employee social contributions are modeled as a combined payroll deduction because exact rates vary by tranche, scheme, and employment status.</li>
        <li><strong className="text-zinc-300">Filing Status</strong> – the calculator assumes one ordinary resident employee and does not expose family quotient parts or spouse/dependent inputs.</li>
        <li><strong className="text-zinc-300">Formula</strong> – net salary equals gross salary minus modeled employee social contributions and progressive income tax after the expense deduction.</li>
      </ul>
      <p className="text-zinc-400 text-sm mt-3">The model excludes personalized withholding rates, detailed pension tranche rates, family quotient effects, social surcharge detail, benefits in kind, and employer-only charges.</p>
    </div>
  );
}

function ITTaxInfo() {
  return (
    <div>
      <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">Italy</h3>
      <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
        <li><strong className="text-zinc-300">IRPEF</strong> – employment income after modeled employee INPS contributions is taxed through Italy&apos;s 23%, 35%, and 43% national bands.</li>
        <li><strong className="text-zinc-300">Employment Credit</strong> – a simplified employee tax credit is applied and tapered by gross salary.</li>
        <li><strong className="text-zinc-300">Local Add-ons</strong> – regional and municipal addizionale are represented with an average proxy so the page remains usable without region selection.</li>
        <li><strong className="text-zinc-300">Formula</strong> – net salary equals gross salary minus INPS, national IRPEF after credit, and modeled local add-ons.</li>
      </ul>
      <p className="text-zinc-400 text-sm mt-3">The model excludes exact regional and commune rates, spouse/dependent deductions, bonus and exoneration programs, severance pay, fringe benefits, and employer-only costs.</p>
    </div>
  );
}

function IETaxInfo() {
  return (
    <div>
      <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">Ireland</h3>
      <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
        <li><strong className="text-zinc-300">PAYE Income Tax</strong> – the single employee standard-rate band is taxed at 20% and income above the band at 40%.</li>
        <li><strong className="text-zinc-300">Tax Credits</strong> – the standard personal and employee PAYE credits are applied against income tax.</li>
        <li><strong className="text-zinc-300">PRSI and USC</strong> – employee PRSI and Universal Social Charge are added as payroll deductions separate from PAYE income tax.</li>
        <li><strong className="text-zinc-300">Formula</strong> – net salary equals gross salary minus PAYE after credits, PRSI, and USC.</li>
      </ul>
      <p className="text-zinc-400 text-sm mt-3">The model excludes married/civil-partner bands, age or medical-card USC rules, pension relief, benefit-in-kind detail, and week-one payroll timing.</p>
    </div>
  );
}

function ATTaxInfo() {
  return (
    <div>
      <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">Austria</h3>
      <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
        <li><strong className="text-zinc-300">Wage Tax</strong> – annual salary after modeled employee social insurance is taxed with Austria&apos;s progressive wage tax bands from 0% to 55%.</li>
        <li><strong className="text-zinc-300">Social Insurance</strong> – employee social insurance is modeled at a general employee rate and capped at the annualized contribution-base ceiling.</li>
        <li><strong className="text-zinc-300">No Regional Income Tax</strong> – Austria does not use US-style state income tax for salary employees in this model.</li>
        <li><strong className="text-zinc-300">Formula</strong> – net salary equals gross salary minus capped employee social insurance and wage tax on the remaining taxable base.</li>
      </ul>
      <p className="text-zinc-400 text-sm mt-3">The model excludes 13th/14th salary preferential taxation, commuter and family credits, church contributions, in-kind benefits, and detailed monthly payroll cap timing.</p>
    </div>
  );
}

function BETaxInfo() {
  return (
    <div>
      <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">Belgium</h3>
      <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
        <li><strong className="text-zinc-300">Federal Tax</strong> – Belgian taxable income is taxed with progressive federal bands from 25% to 50% after modeled employee social security and professional expenses.</li>
        <li><strong className="text-zinc-300">ONSS / RSZ</strong> – employee social security is deducted from gross salary and from the income-tax base.</li>
        <li><strong className="text-zinc-300">Municipal Surcharge</strong> – the calculator includes a representative municipal surcharge proxy instead of requiring a commune selector.</li>
        <li><strong className="text-zinc-300">Formula</strong> – net salary equals gross salary minus employee social security, federal tax, and the modeled municipal surcharge.</li>
      </ul>
      <p className="text-zinc-400 text-sm mt-3">The model excludes exact commune rates, personal allowance refinements, marital quotient, dependent children, work bonus reductions, regional reductions, benefits in kind, and the special expatriate regime.</p>
    </div>
  );
}

// ============================================================================
// UNITED ARAB EMIRATES TAX INFO
// ============================================================================
function AETaxInfo() {
  return (
    <div>
      <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">United Arab Emirates</h3>
      <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
        <li><strong className="text-zinc-300">Personal Income Tax</strong> – UAE employment salary is modeled at 0% personal income tax.</li>
        <li><strong className="text-zinc-300">Employee Category</strong> – foreign/expat employees default to no UAE pension deduction; UAE and selected GCC nationals use modeled statutory pension rates.</li>
        <li><strong className="text-zinc-300">UAE National Pension</strong> – new private-sector GPSSA model uses an 11% employee rate on contribution salary with AED 3,000 monthly floor and AED 70,000 monthly cap.</li>
        <li><strong className="text-zinc-300">Legacy / GCC Pension</strong> – legacy UAE private-sector and GCC extension categories use the employee rates and caps exposed by the calculator.</li>
        <li><strong className="text-zinc-300">Take-home Formula</strong> – gross salary minus employee pension contributions equals estimated net salary because salary income tax is modeled as zero.</li>
      </ul>
      <p className="text-zinc-400 text-sm mt-3">Employer pension and government support amounts are shown for context where modeled, but only employee pension reduces take-home pay. The model excludes end-of-service gratuity, unemployment insurance, private medical insurance, and visa or free-zone costs.</p>
    </div>
  );
}

// ============================================================================
// CHINA TAX INFO
// ============================================================================
function CNTaxInfo() {
  return (
    <div>
      <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">China</h3>
      <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
        <li><strong className="text-zinc-300">Individual Income Tax</strong> – annual employment income is taxed with the progressive wage bands from 3% to 45%.</li>
        <li><strong className="text-zinc-300">Standard Deduction</strong> – CNY 60,000 per year is deducted before calculating taxable income.</li>
        <li><strong className="text-zinc-300">Social Insurance</strong> – pension, medical, and unemployment insurance are calculated from the entered monthly social insurance base, capped by the model.</li>
        <li><strong className="text-zinc-300">Housing Fund</strong> – the selected housing fund rate is applied to the same capped monthly base and reduces taxable income and take-home pay.</li>
        <li><strong className="text-zinc-300">Special Additional Deductions</strong> – child education, children under 3, elderly care, housing rent or first-home loan interest, and continuing education are included when entered.</li>
      </ul>
      <p className="text-zinc-400 text-sm mt-3">Taxable income is gross salary minus the standard deduction, special deductions, social insurance, and housing fund. City-specific bases, local housing fund caps, annual bonus treatment, and foreigner treaty rules are not modeled.</p>
    </div>
  );
}

// ============================================================================
// CYPRUS TAX INFO
// ============================================================================
function CYTaxInfo() {
  return (
    <div>
      <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">Cyprus</h3>
      <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
        <li><strong className="text-zinc-300">Income Tax</strong> – chargeable income is taxed with Cyprus progressive bands from 0% to 35%.</li>
        <li><strong className="text-zinc-300">Social Insurance</strong> – employee Social Insurance is modeled at 8.8% up to the annual insurable earnings ceiling.</li>
        <li><strong className="text-zinc-300">GeSY / GHS</strong> – employee healthcare contribution is modeled at 2.65% up to the annual GHS income ceiling.</li>
        <li><strong className="text-zinc-300">Approved Funds</strong> – approved pension or provident fund contributions are modeled and limited by the aggregate contribution deduction cap.</li>
        <li><strong className="text-zinc-300">Resident Reliefs</strong> – home insurance, dependent child, primary residence, and green-transition deductions apply where the resident/family-income rules in the calculator allow them.</li>
      </ul>
      <p className="text-zinc-400 text-sm mt-3">Net salary subtracts income tax, Social Insurance, GeSY, and cash pension/provident contributions. The model excludes first-employment exemptions, Special Defence Contribution, capital income, and detailed plan-specific insurance tests.</p>
    </div>
  );
}

// ============================================================================
// CZECHIA TAX INFO
// ============================================================================
function CZTaxInfo() {
  return (
    <div>
      <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">Czechia</h3>
      <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
        <li><strong className="text-zinc-300">Income Tax</strong> – employment income is taxed at 15% up to the annual higher-rate threshold and 23% above it.</li>
        <li><strong className="text-zinc-300">Social Security</strong> – employee social security includes pension and sickness insurance and is capped at the annual social security assessment ceiling.</li>
        <li><strong className="text-zinc-300">Health Insurance</strong> – employee health insurance is modeled at 4.5% of the assessment base.</li>
        <li><strong className="text-zinc-300">Tax Credits</strong> – the basic taxpayer credit is applied; resident inputs can add spouse credit and child tax credits/bonus.</li>
        <li><strong className="text-zinc-300">Deductions</strong> – resident retirement/long-term product contributions and qualifying charitable donations reduce the tax base within modeled limits.</li>
      </ul>
      <p className="text-zinc-400 text-sm mt-3">Tax base is gross income less modeled deductions, rounded as implemented by the calculator, then reduced by credits. The model excludes flat-tax, self-employed rules, EU/EEA non-resident tests, and detailed month-by-month credit conditions.</p>
    </div>
  );
}

// ============================================================================
// DENMARK TAX INFO
// ============================================================================
function DKTaxInfo() {
  return (
    <div>
      <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">Denmark</h3>
      <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
        <li><strong className="text-zinc-300">AM-bidrag</strong> – the 8% labour market contribution is deducted first from gross salary.</li>
        <li><strong className="text-zinc-300">Personal Allowance</strong> – the modeled personal allowance reduces taxable income before income tax.</li>
        <li><strong className="text-zinc-300">Income Tax</strong> – the calculator applies simplified national and average municipal tax layers to income after AM-bidrag and allowance.</li>
        <li><strong className="text-zinc-300">No Filing Status Input</strong> – the model assumes an ordinary adult resident employee without spouse transfer, church tax, or municipality selection.</li>
      </ul>
      <p className="text-zinc-400 text-sm mt-3">Estimated net pay is gross salary minus AM-bidrag and income tax. ATP, pension deductions, commuting, union dues, interest deductions, exact tax-card logic, church tax, and municipality-specific rates are outside this simplified model.</p>
    </div>
  );
}

// ============================================================================
// FINLAND TAX INFO
// ============================================================================
function FITaxInfo() {
  return (
    <div>
      <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">Finland</h3>
      <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
        <li><strong className="text-zinc-300">Income Tax</strong> – taxable income is calculated after the modeled standard deduction and taxed through progressive central-government-style brackets plus the calculator&apos;s flat local/social tax proxy.</li>
        <li><strong className="text-zinc-300">Tax Credit</strong> – the annual tax credit in the calculator reduces computed income tax.</li>
        <li><strong className="text-zinc-300">Employee Contributions</strong> – employee pension, unemployment, and daily allowance contributions are modeled as a combined employee social contribution.</li>
        <li><strong className="text-zinc-300">Assumption</strong> – the page assumes a resident employee and does not expose municipality, church tax, age, or family inputs.</li>
      </ul>
      <p className="text-zinc-400 text-sm mt-3">Net salary subtracts income tax and modeled employee social contributions from gross salary. Exact Finnish tax-card withholding, municipality rates, church tax, YLE tax, age-specific pension rates, travel deductions, and household credits are not modeled.</p>
    </div>
  );
}

// ============================================================================
// GEORGIA TAX INFO
// ============================================================================
function GETaxInfo() {
  return (
    <div>
      <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">Georgia</h3>
      <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
        <li><strong className="text-zinc-300">Income Tax</strong> – ordinary employment salary is modeled with Georgia&apos;s flat 20% personal income tax.</li>
        <li><strong className="text-zinc-300">Funded Pension</strong> – resident employees enrolled or subject to the funded pension scheme have a 2% employee pension deduction.</li>
        <li><strong className="text-zinc-300">Employer and State Pension</strong> – employer and state funded-pension amounts are shown in the breakdown but do not reduce employee take-home pay.</li>
        <li><strong className="text-zinc-300">Residency</strong> – residency affects pension participation in the calculator; the income tax rate remains flat in the modeled salary view.</li>
      </ul>
      <p className="text-zinc-400 text-sm mt-3">Net salary is gross salary minus 20% income tax and any employee funded-pension deduction. The model excludes self-employed regimes, small-business status, special exemptions, and voluntary pension cases outside the exposed input.</p>
    </div>
  );
}

// ============================================================================
// CROATIA TAX INFO
// ============================================================================
function HRTaxInfo() {
  return (
    <div>
      <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">Croatia</h3>
      <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
        <li><strong className="text-zinc-300">Local Income Tax</strong> – the calculator uses the selected locality&apos;s two-band annual income tax rates with a higher-rate threshold.</li>
        <li><strong className="text-zinc-300">Pension Contributions</strong> – employee pension is deducted before tax, either 15% first pillar plus 5% second pillar or 20% first pillar only, subject to the annual pension base ceiling.</li>
        <li><strong className="text-zinc-300">Personal Allowance</strong> – the annual basic allowance is applied, with resident-only spouse and child allowance factors where entered.</li>
        <li><strong className="text-zinc-300">Employer Health</strong> – employer health insurance is displayed for context but does not reduce take-home pay.</li>
      </ul>
      <p className="text-zinc-400 text-sm mt-3">Taxable income is gross salary minus employee pension and personal allowance. The model excludes digital-nomad foreign-employer treatment, employer-paid voluntary pension benefits, in-kind benefits, and special contribution exemptions.</p>
    </div>
  );
}

// ============================================================================
// INDIA TAX INFO
// ============================================================================
function INTaxInfo() {
  return (
    <div>
      <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">India</h3>
      <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
        <li><strong className="text-zinc-300">Tax Regime</strong> – choose new or old regime; each uses its own slab rates and standard deduction.</li>
        <li><strong className="text-zinc-300">Standard Deduction</strong> – the calculator applies the modeled salaried standard deduction before tax.</li>
        <li><strong className="text-zinc-300">Rebate, Surcharge, and Cess</strong> – Section 87A rebate, income-based surcharge, and 4% health and education cess are included by the calculator.</li>
        <li><strong className="text-zinc-300">EPF</strong> – optional employee EPF is modeled at 12% on the capped monthly wage base and reduces take-home pay.</li>
      </ul>
      <p className="text-zinc-400 text-sm mt-3">Taxable income is gross salary minus the regime standard deduction. The model does not include HRA, itemized old-regime deductions, NPS, professional tax, senior-citizen slabs, marginal relief, or detailed basic-salary EPF configuration.</p>
    </div>
  );
}

// ============================================================================
// ICELAND TAX INFO
// ============================================================================
function ISTaxInfo() {
  return (
    <div>
      <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">Iceland</h3>
      <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
        <li><strong className="text-zinc-300">Income Tax</strong> – annual salary is taxed using annualized monthly withholding brackets that combine national and municipal tax.</li>
        <li><strong className="text-zinc-300">Personal Tax Credit</strong> – the annualized personal tax credit reduces calculated income tax.</li>
        <li><strong className="text-zinc-300">Mandatory Pension</strong> – employee pension is modeled at 4% and reduces both take-home pay and taxable income in the calculation.</li>
        <li><strong className="text-zinc-300">Assumption</strong> – the calculator assumes a full-year resident salary employee.</li>
      </ul>
      <p className="text-zinc-400 text-sm mt-3">Net pay is gross salary minus mandatory pension and income tax after credit. Optional private pension savings, union dues, spouse transfers, child benefits, foreign expert relief, and detailed municipal variations are not modeled.</p>
    </div>
  );
}

// ============================================================================
// JAPAN TAX INFO
// ============================================================================
function JPTaxInfo() {
  return (
    <div>
      <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">Japan</h3>
      <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
        <li><strong className="text-zinc-300">National Income Tax</strong> – employment income is taxed with progressive national brackets from 5% to 45%.</li>
        <li><strong className="text-zinc-300">Reconstruction Surtax</strong> – the 2.1% surtax is applied to national income tax.</li>
        <li><strong className="text-zinc-300">Resident Tax</strong> – local inhabitant tax is approximated using a 10% income-based component plus a per-capita amount.</li>
        <li><strong className="text-zinc-300">Social Insurance</strong> – employee pension, health insurance, and employment insurance are calculated from monthly salary with the modeled caps.</li>
        <li><strong className="text-zinc-300">Deductions</strong> – employment income deduction, social insurance deduction, and basic deduction are included before national tax.</li>
      </ul>
      <p className="text-zinc-400 text-sm mt-3">The model assumes resident employment income. It excludes prefecture/insurer-specific health rates, age-specific care insurance, spouse/dependent deductions, bonus insurance caps, and exact prior-year resident tax timing.</p>
    </div>
  );
}

// ============================================================================
// MALTA TAX INFO
// ============================================================================
function MTTaxInfo() {
  return (
    <div>
      <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">Malta</h3>
      <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
        <li><strong className="text-zinc-300">Tax Status</strong> – resident schedules vary by selected status, including single, married, parent, and children variants; non-residents use the non-resident schedule.</li>
        <li><strong className="text-zinc-300">Class 1 SSC</strong> – employee social security is modeled by age/cohort and weekly wage category, with employer SSC and maternity fund shown separately.</li>
        <li><strong className="text-zinc-300">Retirement Credits</strong> – personal retirement scheme and voluntary occupational pension contributions can generate resident-only tax credits within modeled caps.</li>
        <li><strong className="text-zinc-300">Fee Deductions</strong> – qualifying school, childcare, sports, and cultural fees are modeled for eligible resident cases.</li>
        <li><strong className="text-zinc-300">Employment Deduction</strong> – the modeled employment income deduction applies where the calculator&apos;s income/status conditions are met.</li>
      </ul>
      <p className="text-zinc-400 text-sm mt-3">Net salary subtracts final income tax, employee SSC, and eligible cash retirement contributions. Special tax statuses, under-18/apprentice SSC, part-time rules, pension exemptions, and nomad/returned-migrant regimes are not included.</p>
    </div>
  );
}

// ============================================================================
// NORWAY TAX INFO
// ============================================================================
function NOTaxInfo() {
  return (
    <div>
      <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">Norway</h3>
      <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
        <li><strong className="text-zinc-300">Ordinary Income Tax</strong> – ordinary income is taxed at 22% after modeled standard deductions and IPS deduction.</li>
        <li><strong className="text-zinc-300">Bracket Tax</strong> – trinnskatt is applied progressively to gross personal income using the modeled 2026 thresholds.</li>
        <li><strong className="text-zinc-300">National Insurance</strong> – employee National Insurance contribution is modeled at 7.6% of gross salary.</li>
        <li><strong className="text-zinc-300">IPS</strong> – individual pension savings are deductible up to the modeled IPS limit and also reduce take-home pay as a voluntary contribution.</li>
      </ul>
      <p className="text-zinc-400 text-sm mt-3">The calculator assumes resident salary income. It excludes PAYE for temporary workers, wealth tax, travel and interest deductions, holiday-pay timing, employer pension, and individual deduction details beyond the simplified standard deduction and IPS.</p>
    </div>
  );
}

// ============================================================================
// PHILIPPINES TAX INFO
// ============================================================================
function PHTaxInfo() {
  return (
    <div>
      <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">Philippines</h3>
      <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
        <li><strong className="text-zinc-300">Compensation Income Tax</strong> – annual taxable compensation is taxed with the post-TRAIN progressive bands from 0% to 35%.</li>
        <li><strong className="text-zinc-300">SSS</strong> – employee SSS is calculated from the modeled monthly salary credit floor and ceiling.</li>
        <li><strong className="text-zinc-300">PhilHealth</strong> – employee PhilHealth is modeled as the employee share of the premium on the capped monthly base.</li>
        <li><strong className="text-zinc-300">Pag-IBIG</strong> – employee Pag-IBIG is modeled at the employee rate up to the calculator&apos;s monthly fund salary cap.</li>
        <li><strong className="text-zinc-300">Taxable Income</strong> – mandatory employee SSS, PhilHealth, and Pag-IBIG reduce taxable income before income tax.</li>
      </ul>
      <p className="text-zinc-400 text-sm mt-3">The model assumes ordinary employee compensation. It excludes 13th-month exclusions, de minimis benefits, overtime/night differential treatment, substituted filing, non-resident rules, voluntary MP2/SSS, and self-employed income.</p>
    </div>
  );
}

// ============================================================================
// SWEDEN TAX INFO
// ============================================================================
function SETaxInfo() {
  return (
    <div>
      <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">Sweden</h3>
      <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
        <li><strong className="text-zinc-300">Municipal / Regional Tax</strong> – the calculator uses a flat average local tax rate proxy on taxable income.</li>
        <li><strong className="text-zinc-300">State Income Tax</strong> – 20% state tax applies above the modeled annual taxable-income threshold.</li>
        <li><strong className="text-zinc-300">General Pension Contribution</strong> – employee pension contribution is modeled at 7% up to the annual cap.</li>
        <li><strong className="text-zinc-300">Pension Tax Credit</strong> – the calculator applies a matching tax reduction for the general pension contribution.</li>
        <li><strong className="text-zinc-300">Standard Deduction</strong> – a simplified basic allowance is deducted before calculating income tax.</li>
      </ul>
      <p className="text-zinc-400 text-sm mt-3">The model assumes a simplified Swedish employee case. It does not include municipality-specific rates, church or burial fees, exact grundavdrag/job tax credit curves, age-specific rules, expert tax relief, employer social contributions, or individual deductions.</p>
    </div>
  );
}

// ============================================================================
// VIETNAM TAX INFO
// ============================================================================
function VNTaxInfo() {
  return (
    <div>
      <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">Vietnam</h3>
      <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
        <li><strong className="text-zinc-300">Resident PIT</strong> – taxable employment income is taxed with resident progressive PIT bands from 5% to 35%.</li>
        <li><strong className="text-zinc-300">Employee Insurance</strong> – social insurance, health insurance, and unemployment insurance are deducted using the modeled rates and salary caps.</li>
        <li><strong className="text-zinc-300">Personal Deduction</strong> – the monthly personal deduction is annualized and subtracted before tax.</li>
        <li><strong className="text-zinc-300">Dependent Deduction</strong> – each entered dependent adds the modeled annual dependent deduction.</li>
        <li><strong className="text-zinc-300">Taxable Income</strong> – gross salary minus employee insurance, personal deduction, and dependent deductions equals taxable income.</li>
      </ul>
      <p className="text-zinc-400 text-sm mt-3">The calculator models resident salary income and uses the implementation&apos;s Region I cap for unemployment insurance. It excludes non-resident flat PIT, expatriate insurance nuances, taxable allowances, housing benefits, bonuses, severance, and dependent registration timing.</p>
    </div>
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
          to ${new Intl.NumberFormat().format(184500)} wage base
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
          <strong className="text-zinc-300">National Pension</strong> – 4.75%
          employee share (capped at ₩6.37M monthly income)
        </li>
        <li>
          <strong className="text-zinc-300">Health Insurance</strong> – 3.595%
          of income
        </li>
        <li>
          <strong className="text-zinc-300">Long-term Care</strong> – 13.14% of
          health insurance premium
        </li>
        <li>
          <strong className="text-zinc-300">Employment Insurance</strong> – 0.9%
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
        Additional Tax Credits Available
      </h4>
      <ul className="text-zinc-400 space-y-1 mt-2 list-disc list-inside text-sm">
        <li>
          <strong className="text-zinc-300">Insurance Premium Credit</strong> –
          12% of premiums, capped at ₩1,000,000 (life, casualty insurance)
        </li>
        <li>
          <strong className="text-zinc-300">Medical Expense Credit</strong> –
          15% of expenses exceeding 3% of gross income
        </li>
        <li>
          <strong className="text-zinc-300">Education Expense Credit</strong> –
          15% of education costs (per-person caps apply)
        </li>
        <li>
          <strong className="text-zinc-300">Donation Credit</strong> – 15% for
          first ₩10M, 30% above
        </li>
        <li>
          <strong className="text-zinc-300">Rent Credit (월세)</strong> – 15%
          for income ≤₩35M (single) / ≤₩55M (married), 17% for higher incomes
          (capped at thresholds)
        </li>
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
// GERMANY TAX INFO
// ============================================================================
function DETaxInfo() {
  return (
    <div>
      <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">Germany</h3>
      <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
        <li>
          <strong className="text-zinc-300">Income Tax (Einkommensteuer)</strong>{" "}
          – Formula-based progressive rates around 14% to 45% with a €12,348
          basic allowance
        </li>
        <li>
          <strong className="text-zinc-300">Solidarity Surcharge</strong> – 5.5%
          of income tax; exempt below €20,350 (single) / €40,700 (married)
        </li>
        <li>
          <strong className="text-zinc-300">Church Tax (Kirchensteuer)</strong>{" "}
          – Optional 8% (BY/BW) or 9% of income tax for members
        </li>
        <li>
          <strong className="text-zinc-300">
            Social Security (Employee Share)
          </strong>{" "}
          – Pension 9.3%, unemployment 1.3%, health 7.3% + ~1.45% additional,
          long-term care 1.8% (2.4% if childless 23+)
        </li>
      </ul>

      <h4 className="text-md font-medium text-zinc-300 mt-4 mb-2">
        Tax-Saving Contributions
      </h4>
      <ul className="text-zinc-400 space-y-1 mt-2 list-disc list-inside text-sm">
        <li>
          <strong className="text-zinc-300">Occupational Pension (bAV)</strong>{" "}
          – Salary conversion tax-free up to 8% of the BBG (EUR 8,112 in 2026)
        </li>
        <li>
          <strong className="text-zinc-300">Riester Pension</strong> – Eligible
          contributions up to EUR 2,100 per year (incl. allowances)
        </li>
        <li>
          <strong className="text-zinc-300">Ruerup (Basisrente)</strong> – Max
          deductible contributions EUR 30,826 (single) / EUR 61,652 (married)
        </li>
      </ul>

      <h4 className="text-md font-medium text-zinc-300 mt-4 mb-2">
        Standard Deductions Applied
      </h4>
      <ul className="text-zinc-400 space-y-1 mt-2 list-disc list-inside text-sm">
        <li>Employee lump-sum (Arbeitnehmer-Pauschbetrag): €1,230</li>
        <li>
          Special expenses lump-sum (Sonderausgaben-Pauschbetrag): €36 single /
          €72 married
        </li>
      </ul>

      <h4 className="text-md font-medium text-zinc-300 mt-4 mb-2">
        Contribution Ceilings 2026
      </h4>
      <ul className="text-zinc-400 space-y-1 mt-2 list-disc list-inside text-sm">
        <li>Pension &amp; unemployment capped at €101,400/year</li>
        <li>Health &amp; long-term care capped at €69,750/year</li>
      </ul>

      <p className="text-zinc-400 text-sm mt-3">
        Taxable income is estimated as gross salary minus standard deductions.
        Income tax is calculated per Section 32a formula, then solidarity surcharge
        and optional church tax are added. Social security is deducted
        separately.
      </p>
    </div>
  );
}

// ============================================================================
// SPAIN TAX INFO
// ============================================================================
function ESTaxInfo() {
  return (
    <div>
      <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">Spain</h3>
      <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
        <li>
          <strong className="text-zinc-300">IRPF Income Tax</strong> – State
          scale plus autonomous community scale for Spanish tax residents
        </li>
        <li>
          <strong className="text-zinc-300">Regional Support</strong> – General
          estimate plus Madrid, Catalonia, Andalusia, and Valencian Community
        </li>
        <li>
          <strong className="text-zinc-300">Personal &amp; Family Minimums</strong> –
          Tax relief for taxpayer age and qualifying descendants
        </li>
        <li>
          <strong className="text-zinc-300">Employment Expense Deduction</strong> –
          EUR 2,000 general work expense deduction for residents
        </li>
        <li>
          <strong className="text-zinc-300">Pension Contributions</strong> –
          Basic resident pension/social welfare reduction capped at EUR 1,500
          and 30% of net work income
        </li>
        <li>
          <strong className="text-zinc-300">Social Security</strong> – Employee
          common contingencies, unemployment, professional training, and MEI
          contributions, capped by the 2026 monthly base
        </li>
        <li>
          <strong className="text-zinc-300">Non-Residents</strong> – Simplified
          IRNR flat rates: 19% for EU/EEA/Liechtenstein residents and 24% for
          other non-residents
        </li>
      </ul>

      <h4 className="text-md font-medium text-zinc-300 mt-4 mb-2">
        State IRPF Scale Used
      </h4>
      <ul className="text-zinc-400 space-y-1 mt-2 list-disc list-inside text-sm">
        <li>EUR 0 – EUR 12,450: 9.5%</li>
        <li>EUR 12,450 – EUR 20,200: 12%</li>
        <li>EUR 20,200 – EUR 35,200: 15%</li>
        <li>EUR 35,200 – EUR 60,000: 18.5%</li>
        <li>EUR 60,000 – EUR 300,000: 22.5%</li>
        <li>EUR 300,000+: 24.5%</li>
      </ul>

      <h4 className="text-md font-medium text-zinc-300 mt-4 mb-2">
        Employee Social Security 2026
      </h4>
      <ul className="text-zinc-400 space-y-1 mt-2 list-disc list-inside text-sm">
        <li>Common contingencies: 4.70%</li>
        <li>Unemployment: 1.55% permanent contracts, 1.60% fixed-term contracts</li>
        <li>Professional training: 0.10%</li>
        <li>MEI: 0.15%</li>
        <li>Monthly contribution base capped at EUR 5,101.20</li>
      </ul>

      <h4 className="text-md font-medium text-zinc-300 mt-4 mb-2">
        Important Assumptions
      </h4>
      <p className="text-zinc-400 text-sm">
        IRPF uses the latest AEAT Renta 2025 state and autonomous community
        scales currently published, while payroll contributions use 2026 BOE and
        Seguridad Social rates. This calculator does not model regional
        deductions, itemized personal deductions, special expat regimes, or the
        Basque/Navarre foral systems.
      </p>
    </div>
  );
}

// ============================================================================
// GREECE TAX INFO
// ============================================================================
function GRTaxInfo() {
  return (
    <div>
      <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">Greece</h3>
      <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
        <li>
          <strong className="text-zinc-300">Employment Income Tax</strong> –
          Progressive 2026 rates from 0% to 44%, with child and youth adjustments
        </li>
        <li>
          <strong className="text-zinc-300">Dependent Children</strong> –
          Lower rates apply in selected brackets, with four or more children
          reaching 0% on income up to EUR 20,000
        </li>
        <li>
          <strong className="text-zinc-300">Youth Rates</strong> – Taxpayers up
          to age 25 pay 0% on the first EUR 20,000; ages 26-30 receive a 9%
          second bracket
        </li>
        <li>
          <strong className="text-zinc-300">Employment Tax Reduction</strong> –
          EUR 777 base reduction with no children, higher with children, tapered
          above EUR 12,000 of taxable employment income
        </li>
        <li>
          <strong className="text-zinc-300">e-EFKA Social Insurance</strong> –
          13.37% employee contribution for ordinary salaried employees, capped
          at EUR 7,761.94 per month of insurable earnings
        </li>
        <li>
          <strong className="text-zinc-300">Occupational Pension</strong> –
          Qualifying TEA or group pension plan contributions can reduce taxable
          employment income, capped at 20% of gross salary
        </li>
      </ul>

      <h4 className="text-md font-medium text-zinc-300 mt-4 mb-2">
        Tax Brackets 2026 (No Dependent Children)
      </h4>
      <ul className="text-zinc-400 space-y-1 mt-2 list-disc list-inside text-sm">
        <li>EUR 0 – EUR 10,000: 9%</li>
        <li>EUR 10,001 – EUR 20,000: 20%</li>
        <li>EUR 20,001 – EUR 30,000: 26%</li>
        <li>EUR 30,001 – EUR 40,000: 34%</li>
        <li>EUR 40,000.01 – EUR 60,000: 39%</li>
        <li>Above EUR 60,000: 44%</li>
      </ul>

      <h4 className="text-md font-medium text-zinc-300 mt-4 mb-2">
        Social Insurance Assumptions
      </h4>
      <p className="text-zinc-400 text-sm">
        Employee e-EFKA contributions are deducted from gross employment income
        before income tax. Employer contributions are shown for reference only
        and are not deducted from take-home pay. This calculator uses the
        ordinary salaried employee package; heavy work, occupational-risk,
        lawyer/engineer, doctor, and working-pensioner categories can differ.
      </p>
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
          Progressive rates from 12.5% to 48% (9 brackets for residents)
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
        NHR 2.0 (Non-Habitual Resident) Regime
      </h4>
      <p className="text-zinc-400 text-sm mb-2">
        The NHR 2.0 tax regime, introduced in 2024, offers significant tax benefits 
        for new residents who have not been tax residents in Portugal for the previous 5 years.
      </p>
      <ul className="text-zinc-400 space-y-1 mt-2 list-disc list-inside text-sm">
        <li>
          <strong className="text-zinc-300">20% Flat Tax Rate</strong> –
          On Portuguese-source employment and self-employment income (vs progressive rates up to 48%)
        </li>
        <li>
          <strong className="text-zinc-300">Duration</strong> –
          10 consecutive years from the year of registration
        </li>
        <li>
          <strong className="text-zinc-300">Exemptions</strong> –
          Exempt from solidarity surcharge on high incomes
        </li>
        <li>
          <strong className="text-zinc-300">Social Security</strong> –
          Still applies at 11% (mandatory contributions)
        </li>
        <li>
          <strong className="text-zinc-300">Eligibility</strong> –
          Must not have been a Portuguese tax resident in the 5 years prior to application
        </li>
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

// ============================================================================
// HONG KONG TAX INFO
// ============================================================================
function HKTaxInfo() {
  return (
    <div>
      <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">
        Hong Kong
      </h3>
      <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
        <li>
          <strong className="text-zinc-300">Salaries Tax</strong> – Progressive
          rates from 2% to 17%
        </li>
        <li>
          <strong className="text-zinc-300">Standard Rate</strong> – 15% on net
          income (16% above HK$5,000,000)
        </li>
        <li>
          <strong className="text-zinc-300">Allowances</strong> – Basic, married,
          single parent, child, and dependent allowances reduce chargeable income
        </li>
        <li>
          <strong className="text-zinc-300">Deductions</strong> – MPF, self-education,
          home loan interest, domestic rent, and approved charitable donations
        </li>
        <li>
          <strong className="text-zinc-300">MPF Contributions</strong> – 5% of
          monthly income between HK$7,100 and HK$30,000 (max HK$1,500/month)
        </li>
      </ul>
    </div>
  );
}

// ============================================================================
// INDONESIA TAX INFO
// ============================================================================
function IDTaxInfo() {
  return (
    <div>
      <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">Indonesia</h3>
      <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
        <li>
          <strong className="text-zinc-300">PPh 21 (Income Tax)</strong> –
          Progressive rates from 5% to 35% (5 brackets)
        </li>
        <li>
          <strong className="text-zinc-300">Job Expense Deduction</strong> –
          5% of gross income, capped at Rp6,000,000/year
        </li>
        <li>
          <strong className="text-zinc-300">PTKP (Non-Taxable Income)</strong> –
          Rp54,000,000 for individual, plus Rp4,500,000 if married, plus Rp4,500,000 per dependent (max 3)
        </li>
        <li>
          <strong className="text-zinc-300">BPJS Kesehatan</strong> – 1% employee
          contribution (capped at Rp12,000,000/month wage base)
        </li>
        <li>
          <strong className="text-zinc-300">BPJS JHT (Old Age)</strong> – 2%
          employee contribution (no cap)
        </li>
        <li>
          <strong className="text-zinc-300">BPJS JP (Pension)</strong> – 1%
          employee contribution (capped at Rp10,547,400/month wage base)
        </li>
      </ul>

      <h4 className="text-md font-medium text-zinc-300 mt-4 mb-2">
        PPh 21 Tax Brackets 2026 (Residents)
      </h4>
      <ul className="text-zinc-400 space-y-1 mt-2 list-disc list-inside text-sm">
        <li>Rp0 – Rp60,000,000: 5%</li>
        <li>Rp60,000,001 – Rp250,000,000: 15%</li>
        <li>Rp250,000,001 – Rp500,000,000: 25%</li>
        <li>Rp500,000,001 – Rp5,000,000,000: 30%</li>
        <li>Rp5,000,000,001+: 35%</li>
      </ul>

      <h4 className="text-md font-medium text-zinc-300 mt-4 mb-2">
        PTKP (Penghasilan Tidak Kena Pajak) Allowances
      </h4>
      <ul className="text-zinc-400 space-y-1 mt-2 list-disc list-inside text-sm">
        <li>Individual taxpayer: Rp54,000,000</li>
        <li>Married taxpayer: Additional Rp4,500,000</li>
        <li>Dependents: Rp4,500,000 each (maximum 3)</li>
        <li>Spouse with combined income: Additional Rp54,000,000</li>
      </ul>

      <h4 className="text-md font-medium text-zinc-300 mt-4 mb-2">
        BPJS Contributions (Employee Share)
      </h4>
      <ul className="text-zinc-400 space-y-1 mt-2 list-disc list-inside text-sm">
        <li>Health Insurance (Kesehatan): 1% (capped at Rp120,000/month)</li>
        <li>Old Age Security (JHT): 2% (no cap)</li>
        <li>Pension (JP): 1% (capped at Rp105,474/month)</li>
      </ul>
      <p className="text-zinc-400 text-sm mt-2">
        Employers contribute additional amounts: 4% for health, 3.7% for JHT, and 2% for JP.
      </p>

      <h4 className="text-md font-medium text-zinc-300 mt-4 mb-2">
        Voluntary Tax-Deductible Contributions
      </h4>
      <ul className="text-zinc-400 space-y-1 mt-2 list-disc list-inside text-sm">
        <li>
          <strong className="text-zinc-300">DPLK (Pension Fund)</strong> – 
          Voluntary contributions to Dana Pensiun Lembaga Keuangan are tax deductible
        </li>
        <li>
          <strong className="text-zinc-300">Zakat</strong> – 
          Zakat paid to BAZNAS or authorized amil zakat institutions reduces taxable income
        </li>
      </ul>

      <h4 className="text-md font-medium text-zinc-300 mt-4 mb-2">
        Tax Calculation Method
      </h4>
      <p className="text-zinc-400 text-sm">
        Indonesia uses a gross-to-net calculation method: Gross Income → Job Expense Deduction →
        BPJS Deductions = Net Income. Net Income → PTKP = Taxable Income (rounded down to nearest Rp1,000).
        Taxable Income is then subject to progressive PPh 21 rates.
      </p>

      <h4 className="text-md font-medium text-zinc-300 mt-4 mb-2">
        Sources
      </h4>
      <p className="text-zinc-400 text-sm">
        Tax rates based on Undang-Undang Nomor 7 Tahun 2021 (HPP Law) and PMK 168/2023.
        BPJS rates based on BPJS Ketenagakerjaan and BPJS Kesehatan regulations effective 2026.
      </p>
    </div>
  );
}

// ============================================================================
// MALAYSIA TAX INFO
// ============================================================================
function MYTaxInfo() {
  return (
    <div>
      <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">Malaysia</h3>
      <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
        <li>
          <strong className="text-zinc-300">Individual Income Tax</strong> –
          Resident YA 2025 progressive rates from 0% to 30%
        </li>
        <li>
          <strong className="text-zinc-300">Non-Residents</strong> – Employment
          income modeled at the flat 30% non-resident individual rate
        </li>
        <li>
          <strong className="text-zinc-300">EPF/KWSP</strong> – Mandatory
          employee retirement contribution by age and membership category
        </li>
        <li>
          <strong className="text-zinc-300">SOCSO</strong> – 0.5% employee share,
          capped at the RM6,000 monthly wage ceiling
        </li>
        <li>
          <strong className="text-zinc-300">EIS</strong> – 0.2% employee share for
          eligible employees below age 60, also capped at RM6,000/month
        </li>
        <li>
          <strong className="text-zinc-300">Resident Reliefs</strong> – Personal,
          spouse, child, disability, EPF, PRS, SOCSO, lifestyle, and medical
          reliefs are modeled
        </li>
      </ul>

      <h4 className="text-md font-medium text-zinc-300 mt-4 mb-2">
        YA 2025 Resident Tax Brackets
      </h4>
      <ul className="text-zinc-400 space-y-1 mt-2 list-disc list-inside text-sm">
        <li>RM0 – RM5,000: 0%</li>
        <li>RM5,001 – RM20,000: 1%</li>
        <li>RM20,001 – RM35,000: 3%</li>
        <li>RM35,001 – RM50,000: 8%</li>
        <li>RM50,001 – RM70,000: 13%</li>
        <li>RM70,001 – RM100,000: 21%</li>
        <li>RM100,001 – RM250,000: 24%</li>
        <li>RM250,001 – RM400,000: 24.5%</li>
        <li>RM400,001 – RM600,000: 25%</li>
        <li>RM600,001 – RM1,000,000: 26%</li>
        <li>RM1,000,001 – RM2,000,000: 28%</li>
        <li>RM2,000,001+: 30%</li>
      </ul>

      <h4 className="text-md font-medium text-zinc-300 mt-4 mb-2">
        EPF, SOCSO, and EIS Assumptions
      </h4>
      <ul className="text-zinc-400 space-y-1 mt-2 list-disc list-inside text-sm">
        <li>Citizen EPF below age 60: 11% employee share</li>
        <li>Citizen EPF age 60 and above: 0% employee share</li>
        <li>Non-citizen post-1998 EPF: 2% employee share</li>
        <li>SOCSO employee share: 0.5% up to RM6,000 monthly wage base</li>
        <li>EIS employee share: 0.2% up to RM6,000 monthly wage base</li>
      </ul>

      <p className="text-zinc-400 text-sm mt-3">
        The calculator uses HASiL YA 2025 rates and reliefs, KWSP rates effective
        for October 2025 wages onward, and PERKESO contribution rates with the
        RM6,000 wage ceiling. It is a simplified salary estimate and does not
        model every rebate, zakat item, director fee treatment, or irregular wage
        contribution table.
      </p>
    </div>
  );
}

// ============================================================================
// TAIWAN TAX INFO
// ============================================================================
function TWTaxInfo() {
  return (
    <div>
      <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">Taiwan</h3>
      <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
        <li>
          <strong className="text-zinc-300">Comprehensive Income Tax</strong> –
          Progressive rates from 5% to 40% (5 brackets)
        </li>
        <li>
          <strong className="text-zinc-300">Standard Deduction</strong> –
          NT$136,000 for single filers, NT$272,000 for married couples (joint filing)
        </li>
        <li>
          <strong className="text-zinc-300">Personal Exemption</strong> –
          NT$101,000 per taxpayer (reduces taxable income)
        </li>
        <li>
          <strong className="text-zinc-300">Salary Special Deduction</strong> –
          NT$227,000 for wage earners (automatic deduction for employment income)
        </li>
        <li>
          <strong className="text-zinc-300">Disability Deduction</strong> –
          Additional NT$227,000 for taxpayers with disabilities
        </li>
        <li>
          <strong className="text-zinc-300">Labor Insurance</strong> –
          2.3% employee contribution (11.5% × 20%), capped at NT$45,800/month
        </li>
        <li>
          <strong className="text-zinc-300">Employment Insurance</strong> –
          0.2% employee contribution (1% × 20%), capped at NT$45,800/month
        </li>
        <li>
          <strong className="text-zinc-300">National Health Insurance</strong> –
          1.551% employee contribution (5.17% × 30%), capped at NT$313,000/month
        </li>
        <li>
          <strong className="text-zinc-300">Labor Pension</strong> –
          Employer contributes 6% mandatorily; employee can voluntarily contribute 0-6% (tax deductible)
        </li>
        <li>
          <strong className="text-zinc-300">Employment Gold Card</strong> –
          50% tax exemption on income above NT$3M for first 5 years as tax resident (for qualified foreign professionals)
        </li>
      </ul>

      <h4 className="text-md font-medium text-zinc-300 mt-4 mb-2">
        Tax Brackets 2026 (Residents)
      </h4>
      <ul className="text-zinc-400 space-y-1 mt-2 list-disc list-inside text-sm">
        <li>NT$0 – NT$610,000: 5%</li>
        <li>NT$610,001 – NT$1,380,000: 12%</li>
        <li>NT$1,380,001 – NT$2,770,000: 20%</li>
        <li>NT$2,770,001 – NT$5,190,000: 30%</li>
        <li>NT$5,190,001+: 40%</li>
      </ul>

      <h4 className="text-md font-medium text-zinc-300 mt-4 mb-2">
        Understanding Your Deductions
      </h4>
      <p className="text-zinc-400 text-sm mb-2">
        Taiwan offers several deductions that reduce your taxable income before tax is calculated:
      </p>
      <ul className="text-zinc-400 space-y-1 mt-2 list-disc list-inside text-sm">
        <li>
          <strong className="text-zinc-300">Standard Deduction</strong> –
          A flat amount that all taxpayers can claim. Choose this or itemized deductions (whichever is higher).
          Single: NT$136,000 | Married: NT$272,000.
        </li>
        <li>
          <strong className="text-zinc-300">Personal Exemption</strong> –
          A basic allowance for each taxpayer to cover basic living expenses. Amount: NT$101,000 per person.
        </li>
        <li>
          <strong className="text-zinc-300">Salary Special Deduction</strong> –
          An automatic deduction for wage earners to account for work-related expenses. 
          You do not need to provide receipts. Amount: NT$227,000.
        </li>
        <li>
          <strong className="text-zinc-300">Disability Deduction</strong> –
          Additional allowance for taxpayers holding a disability certificate. Amount: NT$227,000.
        </li>
        <li>
          <strong className="text-zinc-300">Voluntary Pension Contribution</strong> –
          Amounts you voluntarily contribute to your Labor Pension Fund (up to 6% of salary) are fully tax deductible.
        </li>
      </ul>

      <h4 className="text-md font-medium text-zinc-300 mt-4 mb-2">
        Social Insurance Contributions (Employee Share)
      </h4>
      <ul className="text-zinc-400 space-y-1 mt-2 list-disc list-inside text-sm">
        <li>
          <strong className="text-zinc-300">Labor Insurance (勞工保險)</strong> –
          Total premium 11.5%, employee pays 20% (effective 2.3%). Covers maternity, injury, sickness, disability, and death benefits.
          Monthly cap: NT$45,800.
        </li>
        <li>
          <strong className="text-zinc-300">Employment Insurance (就業保險)</strong> –
          Total premium 1%, employee pays 20% (effective 0.2%). Provides unemployment benefits and job training.
          Monthly cap: NT$45,800.
        </li>
        <li>
          <strong className="text-zinc-300">National Health Insurance (全民健康保險)</strong> –
          Total premium 5.17%, employee pays 30% (effective 1.551%). Provides universal healthcare coverage.
          Monthly cap: NT$313,000.
        </li>
      </ul>

      <h4 className="text-md font-medium text-zinc-300 mt-4 mb-2">
        Labor Pension (勞工退休金)
      </h4>
      <p className="text-zinc-400 text-sm mb-2">
        Taiwan operates a New Labor Pension System where employers must contribute at least 6% of your monthly 
        wages to an individual pension account. This is paid by the employer and not deducted from your salary.
      </p>
      <ul className="text-zinc-400 space-y-1 mt-2 list-disc list-inside text-sm">
        <li>
          <strong className="text-zinc-300">Employer Contribution</strong> –
          6% of monthly salary (mandatory, employer-paid, not deducted from take-home pay)
        </li>
        <li>
          <strong className="text-zinc-300">Employee Voluntary Contribution</strong> –
          You can choose to contribute an additional 0-6% of your salary, which is tax deductible.
          Monthly cap: NT$150,000 for contribution calculations.
        </li>
        <li>
          <strong className="text-zinc-300">Benefit</strong> –
          Upon retirement, you receive monthly payments or a lump sum based on your account balance.
        </li>
      </ul>

      <h4 className="text-md font-medium text-zinc-300 mt-4 mb-2">
        Employment Gold Card Special Tax Benefits
      </h4>
      <p className="text-zinc-400 text-sm mb-2">
        Foreign professionals holding an Employment Gold Card or Foreign Special Professional Work Permit 
        enjoy significant tax incentives under the Act for the Recruitment and Employment of Foreign Professionals.
        These benefits apply for the first 5 years as a tax resident in Taiwan.
      </p>
      <ul className="text-zinc-400 space-y-1 mt-2 list-disc list-inside text-sm">
        <li>
          <strong className="text-zinc-300">50% Exemption on Income Above NT$3 Million</strong> –
          Half of your salary income exceeding NT$3 million per year is excluded from taxable income.
          For example, with NT$5 million income: NT$3M + (50% × NT$2M) = NT$4M taxable (saving ~NT$200K in taxes).
        </li>
        <li>
          <strong className="text-zinc-300">Eligibility Requirements</strong> –
          1) First time approved to reside in Taiwan for work; 2) Reside &gt;183 days in the tax year;
          3) Earn &gt;NT$3 million in salary; 4) Hold Gold Card or Special Professional Work Permit.
        </li>
        <li>
          <strong className="text-zinc-300">5-Year Benefit Period</strong> –
          The tax benefit applies for 5 consecutive tax years starting from the first year you meet 
          all conditions (residency + income threshold). If you don&apos;t meet conditions in a year, 
          that year doesn&apos;t count toward the 5 years.
        </li>
        <li>
          <strong className="text-zinc-300">AMT Exemption</strong> –
          Overseas income is excluded from the Alternative Minimum Tax (AMT) calculation during the benefit period.
        </li>
        <li>
          <strong className="text-zinc-300">Non-Taxable Benefits</strong> –
          Additional benefits like housing allowance, utilities, and education expenses may be tax-free 
          for qualified foreign professionals.
        </li>
      </ul>

      <h4 className="text-md font-medium text-zinc-300 mt-4 mb-2">
        Tax Calculation Formula
      </h4>
      <p className="text-zinc-400 text-sm">
        Gross Salary − Social Insurance Contributions − Total Deductions & Exemptions = Taxable Income
        <br />
        (Gold Card: 50% of income above NT$3M is exempt from Taxable Income)
        <br />
        Taxable Income × Progressive Tax Rate = Income Tax
        <br />
        Income Tax + Social Insurance = Total Tax
        <br />
        Gross Salary − Total Tax − Voluntary Contributions = Net Salary
      </p>

      <h4 className="text-md font-medium text-zinc-300 mt-4 mb-2">
        Sources
      </h4>
      <p className="text-zinc-400 text-sm">
        Tax brackets and deductions based on Ministry of Finance announcement (November 27, 2025) effective for 2026 tax year.
        Social insurance rates from Bureau of Labor Insurance and National Health Insurance Administration.
        Official sources: National Taxation Bureau of Taipei, Ministry of Labor.
      </p>
    </div>
  );
}

// ============================================================================
// UNITED KINGDOM TAX INFO
// ============================================================================
function UKTaxInfo() {
  return (
    <div>
      <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">United Kingdom</h3>
      <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
        <li>
          <strong className="text-zinc-300">Income Tax</strong> –
          Progressive rates with Personal Allowance and tapered relief
        </li>
        <li>
          <strong className="text-zinc-300">Personal Allowance</strong> –
          £12,570 tax-free (tapered above £100,000, zero at £125,140)
        </li>
        <li>
          <strong className="text-zinc-300">Class 1 National Insurance</strong> –
          8% on earnings between £12,570 and £50,270, 2% above
        </li>
        <li>
          <strong className="text-zinc-300">Scottish Rates</strong> –
          Different tax bands for Scottish residents (6 rates from 19% to 48%)
        </li>
        <li>
          <strong className="text-zinc-300">Pension Tax Relief</strong> –
          20% basic rate automatically, higher/additional rates claimable
        </li>
      </ul>

      <h4 className="text-md font-medium text-zinc-300 mt-4 mb-2">
        Tax Bands 2026/27 — England, Wales &amp; Northern Ireland
      </h4>
      <ul className="text-zinc-400 space-y-1 mt-2 list-disc list-inside text-sm">
        <li>Personal Allowance: Up to £12,570 — 0%</li>
        <li>Basic Rate: £12,571 to £50,270 — 20%</li>
        <li>Higher Rate: £50,271 to £125,140 — 40%</li>
        <li>Additional Rate: Over £125,140 — 45%</li>
      </ul>

      <h4 className="text-md font-medium text-zinc-300 mt-4 mb-2">
        Tax Bands 2026/27 — Scotland
      </h4>
      <ul className="text-zinc-400 space-y-1 mt-2 list-disc list-inside text-sm">
        <li>Personal Allowance: Up to £12,570 — 0%</li>
        <li>Starter Rate: £12,571 to £16,537 — 19%</li>
        <li>Basic Rate: £16,538 to £29,526 — 20%</li>
        <li>Intermediate Rate: £29,527 to £43,662 — 21%</li>
        <li>Higher Rate: £43,663 to £75,000 — 42%</li>
        <li>Advanced Rate: £75,001 to £125,140 — 45%</li>
        <li>Top Rate: Over £125,140 — 48%</li>
      </ul>

      <h4 className="text-md font-medium text-zinc-300 mt-4 mb-2">
        National Insurance (Employee) 2026/27
      </h4>
      <ul className="text-zinc-400 space-y-1 mt-2 list-disc list-inside text-sm">
        <li>Below £12,570 (Primary Threshold): 0%</li>
        <li>£12,570 to £50,270 (Upper Earnings Limit): 8%</li>
        <li>Above £50,270: 2%</li>
      </ul>
      <p className="text-zinc-400 text-sm mt-2">
        National Insurance is calculated on gross earnings before tax. The Lower Earnings Limit (£6,708) 
        determines benefit entitlement but no contributions are due below the Primary Threshold.
      </p>

      <h4 className="text-md font-medium text-zinc-300 mt-4 mb-2">
        Personal Allowance Taper
      </h4>
      <p className="text-zinc-400 text-sm mb-2">
        For high earners, the Personal Allowance is reduced by £1 for every £2 of income above £100,000:
      </p>
      <ul className="text-zinc-400 space-y-1 mt-2 list-disc list-inside text-sm">
        <li>Income £100,000 or below: Full £12,570 allowance</li>
        <li>Income £100,001 to £125,140: Reduced allowance</li>
        <li>Income £125,140 or above: No Personal Allowance</li>
      </ul>
      <p className="text-zinc-400 text-sm mt-2">
        This creates an effective 60% tax rate on income between £100,000 and £125,140.
      </p>

      <h4 className="text-md font-medium text-zinc-300 mt-4 mb-2">
        Pension Contributions &amp; Tax Relief
      </h4>
      <ul className="text-zinc-400 space-y-1 mt-2 list-disc list-inside text-sm">
        <li>Basic rate (20%) tax relief applied automatically by pension provider</li>
        <li>Higher rate (40%) taxpayers can claim additional 20% through tax return</li>
        <li>Additional rate (45%) taxpayers can claim additional 25% through tax return</li>
        <li>Annual allowance: £60,000 (may be tapered for high earners)</li>
      </ul>

      <h4 className="text-md font-medium text-zinc-300 mt-4 mb-2">
        Tax Year
      </h4>
      <p className="text-zinc-400 text-sm">
        The UK tax year runs from 6 April to 5 April the following year. This calculator uses 
        the 2026/27 tax year rates (6 April 2026 to 5 April 2027).
      </p>

      <h4 className="text-md font-medium text-zinc-300 mt-4 mb-2">
        Sources
      </h4>
      <p className="text-zinc-400 text-sm">
        Tax rates and thresholds from HMRC (HM Revenue &amp; Customs) Rates and Thresholds for 
        Employers 2026 to 2027. Available at: gov.uk/guidance/rates-and-thresholds-for-employers-2026-to-2027
      </p>
    </div>
  );
}

// ============================================================================
// CANADA TAX INFO
// ============================================================================
function CATaxInfo() {
  return (
    <div>
      <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">Canada</h3>
      <p className="text-zinc-400 text-sm mb-3">
        Canadian take-home pay is calculated by starting with annual gross salary,
        subtracting modeled pre-tax deductions, applying federal and provincial or
        territorial income tax brackets, then subtracting employee payroll
        contributions such as CPP/CPP2 or Quebec QPP/QPP2, EI, and Quebec QPIP.
      </p>

      <h4 className="text-md font-medium text-zinc-300 mt-4 mb-2">
        Taxes and Payroll Contributions Included
      </h4>
      <ul className="text-zinc-400 space-y-1 mt-2 list-disc list-inside text-sm">
        <li>
          <strong className="text-zinc-300">Federal Income Tax</strong> –
          progressive 2026 federal tax brackets applied to taxable income
        </li>
        <li>
          <strong className="text-zinc-300">Provincial / Territorial Tax</strong> –
          selected province or territory brackets for AB, BC, MB, NB, NL, NS, NT,
          NU, ON, PE, QC, SK, and YT
        </li>
        <li>
          <strong className="text-zinc-300">CPP and CPP2</strong> – Canada Pension
          Plan employee contributions outside Quebec, including the second
          additional CPP contribution tier
        </li>
        <li>
          <strong className="text-zinc-300">QPP, QPP2, and QPIP</strong> – Quebec
          Pension Plan, second additional QPP, and Quebec parental insurance for
          Quebec employees
        </li>
        <li>
          <strong className="text-zinc-300">Employment Insurance</strong> – EI
          premiums with the regular employee rate outside Quebec and the reduced
          Quebec employee EI rate in Quebec
        </li>
      </ul>

      <h4 className="text-md font-medium text-zinc-300 mt-4 mb-2">
        Retirement, Benefits, and Deductions
      </h4>
      <ul className="text-zinc-400 space-y-1 mt-2 list-disc list-inside text-sm">
        <li>RRSP contributions reduce modeled taxable income up to the annual limit.</li>
        <li>FHSA contributions are modeled as tax-deductible contributions.</li>
        <li>Registered pension / RPP employee contributions are modeled pre-tax.</li>
        <li>Union or professional dues are modeled as taxable-income deductions.</li>
        <li>Childcare expenses are modeled as eligible deductions for payroll planning.</li>
      </ul>

      <h4 className="text-md font-medium text-zinc-300 mt-4 mb-2">
        Filing Status Note
      </h4>
      <p className="text-zinc-400 text-sm">
        Canada does not use US-style married filing jointly or married filing
        separately tax brackets. Spouses and common-law partners generally file
        individual returns, with spouse, dependent, and benefit effects handled
        through credits and benefit programs rather than separate married brackets.
      </p>

      <h4 className="text-md font-medium text-zinc-300 mt-4 mb-2">
        Calculation Formula
      </h4>
      <p className="text-zinc-400 text-sm">
        Gross Salary − RRSP/FHSA/RPP/Dues/Childcare Deductions = Taxable Income
        <br />
        Federal Tax + Provincial/Territorial Tax = Income Tax
        <br />
        Income Tax + CPP/CPP2 or QPP/QPP2 + EI + QPIP = Total Statutory Deductions
        <br />
        Gross Salary − Statutory Deductions − Voluntary Deductions = Net Salary
      </p>
    </div>
  );
}

// ============================================================================
// MEXICO TAX INFO
// ============================================================================
function MXTaxInfo() {
  return (
    <div>
      <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">Mexico</h3>
      <p className="text-zinc-400 text-sm mb-3">
        Mexico take-home pay is calculated by annualizing salary, subtracting
        modeled personal deductions, applying the 2026 annual ISR tariff, and then
        subtracting employee-side IMSS social security contributions.
      </p>

      <h4 className="text-md font-medium text-zinc-300 mt-4 mb-2">
        Taxes and Payroll Contributions Included
      </h4>
      <ul className="text-zinc-400 space-y-1 mt-2 list-disc list-inside text-sm">
        <li>
          <strong className="text-zinc-300">ISR Income Tax</strong> – Mexican
          federal income tax calculated from the annual progressive tariff using
          fixed fees and marginal rates
        </li>
        <li>
          <strong className="text-zinc-300">Employee IMSS</strong> – employee-side
          social security branches modeled from gross pay as the SBC proxy, capped
          at 25 times UMA
        </li>
        <li>
          <strong className="text-zinc-300">State Context</strong> – all 32 states
          are available. State payroll tax/ISN is generally employer-side and
          does not reduce modeled employee take-home pay
        </li>
      </ul>

      <h4 className="text-md font-medium text-zinc-300 mt-4 mb-2">
        Retirement, Benefits, and Personal Deductions
      </h4>
      <ul className="text-zinc-400 space-y-1 mt-2 list-disc list-inside text-sm">
        <li>AFORE / voluntary retirement savings are modeled as personal deductions.</li>
        <li>Medical and dental expenses are modeled within the personal deduction cap.</li>
        <li>Funeral expenses are modeled within the personal deduction cap.</li>
        <li>Mortgage interest is modeled as a deductible personal expense.</li>
        <li>Education expenses are modeled using the calculator&apos;s education cap.</li>
      </ul>

      <h4 className="text-md font-medium text-zinc-300 mt-4 mb-2">
        Current Exclusions
      </h4>
      <p className="text-zinc-400 text-sm">
        The Mexico calculator does not yet model employment subsidy, exempt income,
        aguinaldo tax treatment, INFONAVIT loan repayments, employer-only IMSS
        costs, or employer-side state payroll taxes.
      </p>

      <h4 className="text-md font-medium text-zinc-300 mt-4 mb-2">
        Calculation Formula
      </h4>
      <p className="text-zinc-400 text-sm">
        Gross Salary − Retirement/Medical/Funeral/Mortgage/Education Deductions = Taxable Income
        <br />
        ISR Fixed Fee + Marginal ISR = Income Tax
        <br />
        Income Tax + Employee IMSS = Total Statutory Deductions
        <br />
        Gross Salary − Statutory Deductions − Personal Deductions = Net Salary
      </p>
    </div>
  );
}
