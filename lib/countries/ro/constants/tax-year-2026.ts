import type { StandardCountryTaxConfig } from "../../shared/standard-country";

export const RO_TAX_YEAR = 2026;
export const RO_INCOME_TAX_RATE = 0.1;
export const RO_SOCIAL_INSURANCE_RATE = 0.25;
export const RO_HEALTH_INSURANCE_RATE = 0.1;
export const RO_EUR_400_RELIEF_CAP_RON = 1990;
export const RO_EUR_100_RELIEF_CAP_RON = RO_EUR_400_RELIEF_CAP_RON / 4;
export const RO_PERSONAL_DEDUCTION_PHASEOUT_RANGE_RON = 2000;
export const RO_PERSONAL_DEDUCTION_STEP_RON = 50;
export const RO_PERSONAL_DEDUCTION_STEP_RATE = 0.005;
export const RO_YOUNG_EMPLOYEE_SUPPLEMENT_RATE = 0.15;
export const RO_SCHOOL_CHILD_DEDUCTION_MONTHLY = 100;
export const RO_MINIMUM_WAGE_PERIODS_2026 = [
  { months: 6, monthlyMinimumWage: 4050, label: "January-June" },
  { months: 6, monthlyMinimumWage: 4325, label: "July-December" },
] as const;
export const RO_BASIC_PERSONAL_DEDUCTION_RATES = {
  0: 0.2,
  1: 0.25,
  2: 0.3,
  3: 0.35,
  4: 0.45,
} as const;

export const RO_SOURCE_URLS = [
  "https://taxsummaries.pwc.com/romania/individual/taxes-on-personal-income",
  "https://taxsummaries.pwc.com/romania/individual/other-taxes",
  "https://taxsummaries.pwc.com/romania/individual/deductions",
  "https://static.anaf.ro/static/10/Anaf/legislatie/Cod_fiscal_norme_2023.htm",
  "https://legislatie.just.ro/Public/DetaliiDocument/291450",
  "https://legislatie.just.ro/Public/DetaliiDocument/308231",
] as const;

function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}

function clampDependentCount(value: number): keyof typeof RO_BASIC_PERSONAL_DEDUCTION_RATES {
  if (!Number.isFinite(value)) return 0;
  return Math.min(Math.max(Math.trunc(value), 0), 4) as keyof typeof RO_BASIC_PERSONAL_DEDUCTION_RATES;
}

export function calculateRomaniaMonthlyBasicPersonalDeduction({
  monthlyGrossSalary,
  dependentCount,
  monthlyMinimumWage,
}: {
  monthlyGrossSalary: number;
  dependentCount: number;
  monthlyMinimumWage: number;
}): number {
  const gross = Math.max(0, monthlyGrossSalary);
  const baseRate =
    RO_BASIC_PERSONAL_DEDUCTION_RATES[clampDependentCount(dependentCount)];
  const upperLimit =
    monthlyMinimumWage + RO_PERSONAL_DEDUCTION_PHASEOUT_RANGE_RON;

  if (gross > upperLimit) {
    return 0;
  }

  if (gross <= monthlyMinimumWage) {
    return roundCurrency(gross * baseRate);
  }

  const phaseoutSteps = Math.ceil(
    (gross - monthlyMinimumWage) / RO_PERSONAL_DEDUCTION_STEP_RON,
  );
  const deductionRate = Math.max(
    0,
    baseRate - phaseoutSteps * RO_PERSONAL_DEDUCTION_STEP_RATE,
  );

  return roundCurrency(gross * deductionRate);
}

export function calculateRomaniaPersonalDeductionBreakdown({
  grossSalary,
  claimPersonalDeduction,
  dependentCount,
  ageUnder26,
  schoolChildren,
}: {
  grossSalary: number;
  claimPersonalDeduction: boolean;
  dependentCount: number;
  ageUnder26: boolean;
  schoolChildren: number;
}) {
  if (!claimPersonalDeduction) {
    return {
      basicPersonalDeduction: 0,
      youngEmployeeDeduction: 0,
      schoolChildDeduction: 0,
      total: 0,
    };
  }

  const monthlyGrossSalary = Math.max(0, grossSalary) / 12;
  const childCount = Math.min(Math.max(Math.trunc(schoolChildren), 0), 20);
  const totals = RO_MINIMUM_WAGE_PERIODS_2026.reduce(
    (sum, period) => {
      const monthlyUpperLimit =
        period.monthlyMinimumWage + RO_PERSONAL_DEDUCTION_PHASEOUT_RANGE_RON;
      const basicPersonalDeduction =
        calculateRomaniaMonthlyBasicPersonalDeduction({
          monthlyGrossSalary,
          dependentCount,
          monthlyMinimumWage: period.monthlyMinimumWage,
        }) * period.months;
      const youngEmployeeDeduction =
        ageUnder26 && monthlyGrossSalary <= monthlyUpperLimit
          ? period.monthlyMinimumWage *
            RO_YOUNG_EMPLOYEE_SUPPLEMENT_RATE *
            period.months
          : 0;
      const schoolChildDeduction =
        childCount * RO_SCHOOL_CHILD_DEDUCTION_MONTHLY * period.months;

      return {
        basicPersonalDeduction:
          sum.basicPersonalDeduction + basicPersonalDeduction,
        youngEmployeeDeduction:
          sum.youngEmployeeDeduction + youngEmployeeDeduction,
        schoolChildDeduction: sum.schoolChildDeduction + schoolChildDeduction,
      };
    },
    {
      basicPersonalDeduction: 0,
      youngEmployeeDeduction: 0,
      schoolChildDeduction: 0,
    },
  );

  const roundedTotals = {
    basicPersonalDeduction: roundCurrency(totals.basicPersonalDeduction),
    youngEmployeeDeduction: roundCurrency(totals.youngEmployeeDeduction),
    schoolChildDeduction: roundCurrency(totals.schoolChildDeduction),
  };

  return {
    ...roundedTotals,
    total: roundCurrency(
      roundedTotals.basicPersonalDeduction +
        roundedTotals.youngEmployeeDeduction +
        roundedTotals.schoolChildDeduction,
    ),
  };
}

export const RO_TAX_CONFIG = {
  code: "RO",
  currency: "RON",
  taxYear: RO_TAX_YEAR,
  defaultSalary: 180000,
  incomeTaxName: "Income tax",
  resolvePersonalAllowance: ({ grossSalary, inputs }) =>
    calculateRomaniaPersonalDeductionBreakdown({
      grossSalary,
      claimPersonalDeduction:
        "claimPersonalDeduction" in inputs
          ? Boolean(inputs.claimPersonalDeduction)
          : true,
      dependentCount:
        "dependentCount" in inputs && typeof inputs.dependentCount === "number"
          ? inputs.dependentCount
          : 0,
      ageUnder26:
        "ageUnder26" in inputs ? Boolean(inputs.ageUnder26) : false,
      schoolChildren:
        "schoolChildren" in inputs && typeof inputs.schoolChildren === "number"
          ? inputs.schoolChildren
          : 0,
    }).total,
  deductions: [],
  taxCredits: [],
  brackets: [{ min: 0, max: Infinity, rate: RO_INCOME_TAX_RATE }],
  socialContributions: [
    {
      name: "Social insurance contribution",
      rate: RO_SOCIAL_INSURANCE_RATE,
      preTax: true,
    },
    {
      name: "Health insurance contribution",
      rate: RO_HEALTH_INSURANCE_RATE,
      preTax: true,
    },
  ],
  voluntaryContributions: [
    {
      key: "retirementContribution",
      name: "Voluntary private pension",
      limit: RO_EUR_400_RELIEF_CAP_RON,
      description:
        "Romanian voluntary pension deduction modeled at the RON equivalent of EUR 400 per year.",
      taxTreatment: "deduction",
    },
    {
      key: "insurancePremiums",
      name: "Voluntary health insurance or private healthcare subscription",
      limit: RO_EUR_400_RELIEF_CAP_RON,
      description:
        "Voluntary health insurance premiums or private healthcare subscriptions borne by the employee, modeled at the RON equivalent of EUR 400 per year.",
      taxTreatment: "deduction",
    },
    {
      key: "unionFees",
      name: "Trade union membership fees",
      description:
        "Employee-paid trade union membership fees are modeled as a salary deduction without a separate annual cap.",
      taxTreatment: "deduction",
    },
    {
      key: "sportsSubscriptions",
      name: "Sports facility subscriptions",
      limit: RO_EUR_100_RELIEF_CAP_RON,
      description:
        "Employee-paid sports facility subscriptions are modeled at the RON equivalent of the EUR 100 annual cap.",
      taxTreatment: "deduction",
    },
    {
      key: "investmentSubscriptions",
      name: "ETF/share/bond subscriptions",
      limit: RO_EUR_400_RELIEF_CAP_RON,
      description:
        "Employee-paid subscriptions for qualifying shares, bonds, or ETF-style participation titles through Romanian brokers are modeled at the RON equivalent of EUR 400 per year.",
      taxTreatment: "deduction",
    },
  ],
  assumptions: [
    "Romania salary is modeled with the flat 10% income tax applied after mandatory employee social contributions.",
    "CAS is modeled at 25% and CASS at 10% of gross employment income.",
    "The Article 77 personal deduction is modeled at the primary employment place using 2026 minimum-wage periods of RON 4,050 for January-June and RON 4,325 from July-December.",
    "The basic personal deduction uses the official dependent-count percentages and RON 50 phase-out steps for monthly gross salary up to RON 2,000 above the applicable minimum wage.",
    "The under-26 supplemental deduction and RON 100/month school-child deduction are modeled when selected.",
    "Voluntary pension, voluntary health insurance/private healthcare subscriptions, trade union fees, sports facility subscriptions, and qualifying ETF/share/bond subscriptions are modeled as employee-paid income-tax deductions using the configured EUR-equivalent caps where applicable.",
  ],
  modeledExclusions: [
    "Meal tickets, construction/IT/agriculture special regimes, investment deductions, minimum-wage-only tax exemptions, and live EUR/RON conversion for relief caps are excluded.",
  ],
  sourceUrls: [...RO_SOURCE_URLS],
} satisfies StandardCountryTaxConfig<"RO">;
