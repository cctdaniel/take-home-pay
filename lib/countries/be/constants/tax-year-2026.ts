import type { BEExpatRegimeType } from "../types";

export const BE_TAX_YEAR = 2026;

export const BE_SOURCE_URLS = {
  source1:
    "https://taxsummaries.pwc.com/belgium/individual/taxes-on-personal-income",
  source2:
    "https://finance.belgium.be/en/private-individuals/tax-return/tax-rates-income/tax-rates",
  source3:
    "https://finance.belgium.be/en/private-individuals/tax-return/tax-benefits/pension-savings",
  source4:
    "https://fin.belgium.be/en/private-individuals/international/living-and-working-belgium-abroad/inpatriate-researchers-taxpayers",
  source5:
    "https://www.vlaio.be/nl/subsidies-financiering/subsidiedatabank/maatregelen/bijzonder-belastingstelsel-voor-bepaalde-expats",
  source6:
    "https://www.claeysengels.be/en-gb/news-events/special-tax-regime-inpatriate-taxpayers-and-researchers-clarifications-provided-tax",
  source7:
    "https://fin.belgium.be/nl/particulieren/belastingvoordelen/kinderopvang/belastingvermindering",
  source8: "https://fin.belgium.be/nl/particulieren/belastingvoordelen/giften",
  benefitsInKindTax: "https://finance.belgium.be/en/node/1500",
  benefitsInKindSocial:
    "https://www.socialsecurity.be/employer/instructions/dmfa/fr/latest/instructions/salary/particularcases/advantages_in_kind.html",
} as const;

// FPS Finance links Circular 2026/C/51 for the amended inpatriate taxpayer
// and researcher regimes. VLAIO summarizes the 2026 rules: recurring employer
// cost reimbursements are tax-free up to 35% of gross remuneration, the former
// EUR 90,000 tax cap is removed, inbound taxpayers need a EUR 70,000 salary
// threshold, and inbound researchers have no salary minimum. Current ONSS/RSZ
// practitioner guidance indicates the social-security exemption still follows
// the older 30% / EUR 90,000 limits until the 28 November 1969 Royal Decree is
// updated, so tax and social-security caps are modeled separately.
export const BE_EXPAT_REGIME_2026 = {
  taxFreeAllowanceRate: 0.35,
  inboundTaxpayerMinimumSalary: 70_000,
  socialSecurityExemptRate: 0.3,
  socialSecurityExemptAnnualCap: 90_000,
} as const;

export function getBEExpatAllowanceLimit(
  grossSalary: number,
  expatRegimeType: BEExpatRegimeType,
): number {
  if (expatRegimeType === "none" || grossSalary <= 0) {
    return 0;
  }

  if (
    expatRegimeType === "inboundTaxpayer" &&
    grossSalary < BE_EXPAT_REGIME_2026.inboundTaxpayerMinimumSalary
  ) {
    return 0;
  }

  return grossSalary * BE_EXPAT_REGIME_2026.taxFreeAllowanceRate;
}

export function getBEExpatSocialSecurityExemptLimit(
  grossSalary: number,
  expatRegimeType: BEExpatRegimeType,
): number {
  if (expatRegimeType === "none" || grossSalary <= 0) {
    return 0;
  }

  if (
    expatRegimeType === "inboundTaxpayer" &&
    grossSalary < BE_EXPAT_REGIME_2026.inboundTaxpayerMinimumSalary
  ) {
    return 0;
  }

  return Math.min(
    grossSalary * BE_EXPAT_REGIME_2026.socialSecurityExemptRate,
    BE_EXPAT_REGIME_2026.socialSecurityExemptAnnualCap,
  );
}

export const BE_TAX_CONFIG = {
  code: "BE",
  currency: "EUR",
  taxYear: BE_TAX_YEAR,
  defaultSalary: 50000,
  personalTaxAllowance: 11_180,
  dependentChildAllowances: {
    one: 2_030,
    two: 5_230,
    three: 11_720,
    four: 18_970,
    eachAdditional: 7_240,
    underThreeNoChildcare: 760,
    singleParent: 2_030,
  },
  standardDeduction: (grossSalary: number) =>
    Math.min(grossSalary * 0.3, 5_750),
  employeeSocialRate: 0.1307,
  employeeSocialName: "Employee social security (ONSS/RSZ)",
  deductEmployeeSocialBeforeIncomeTax: true,
  additionalFlatIncomeTaxName: "Municipal surcharge proxy",
  additionalFlatIncomeTaxRate: 0.07,
  pensionSavingsLimit: 1_350,
  pensionSavingsTaxCreditRate: 0.25,
  childcareTaxReductionRate: 0.45,
  childcareDailyExpenseLimit: 16.9,
  childcareMaxDaysPerChild: 365,
  charitableDonationTaxReductionRate: 0.3,
  charitableDonationMinimum: 40,
  charitableDonationNetIncomeLimitRate: 0.1,
  charitableDonationAbsoluteLimit: 408_130,
  taxCredit: 0,
  brackets: [
    { min: 0, max: 16_720, rate: 0.25 },
    { min: 16_720, max: 29_510, rate: 0.4 },
    { min: 29_510, max: 51_070, rate: 0.45 },
    { min: 51_070, max: Infinity, rate: 0.5 },
  ],
  assumptions: [
    "Models an ordinary Belgian resident employee with federal progressive personal income tax and employee social security.",
    "Belgium's 2026 personal tax allowance is modeled as a tax reduction equal to the bracket tax on the selected allowance amount, including dependent-child increases where entered.",
    "A standard professional-expense deduction proxy is applied before tax, capped by the modeled annual maximum.",
    "Optional Belgian pension savings are modeled as a cash contribution with a simplified federal tax reduction at the higher modeled ceiling.",
    "Eligible childcare expenses are modeled as a federal tax reduction at 45%, limited to EUR 16.90 per child per day for 2025 expenses declared in 2026.",
    "Qualifying gifts to approved institutions are modeled as a 30% tax reduction when the entered annual amount is at least EUR 40 and within the lower of 10% of modeled net income or the official absolute cap.",
    "Taxable benefits in kind can be entered as annual payroll values; they increase the modeled federal income-tax and ONSS/RSZ bases but are not treated as cash salary.",
    "The special inpatriate taxpayer/researcher regime is modeled as an optional employer-paid recurring allowance: tax-free up to 35% of gross remuneration when eligible, while the employee social-security exemption is capped separately at 30% and EUR 90,000.",
    "Municipal surcharge is modeled as a representative percentage of federal personal income tax rather than an exact commune percentage.",
    "Marital quotient, work bonus reductions, regional tax reductions, legal expenses insurance, service vouchers, alimony, mortgage-linked benefits, benefits-in-kind valuation worksheets, exceptional expat reimbursements for moving/home/school costs, exact commune rates, and exact Tax-Calc withholding timing are not modeled.",
  ],
  sourceUrls: Object.values(BE_SOURCE_URLS),
};
