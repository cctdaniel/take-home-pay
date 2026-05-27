import type {
  CalculationResult,
  CalculatorInputs,
  ContributionLimits,
  CountryCalculator,
  PayFrequency,
  RegionInfo,
  TaxBracket,
} from "../types";
import type {
  StandardCountryBreakdown,
  StandardCountryTaxBreakdown,
} from "../shared/standard-country";
import { CO_CONFIG } from "./config";
import {
  CO_ARTICLE_336_DEPENDENT_DEDUCTION,
  CO_ARTICLE_336_DEPENDENT_MAX,
  CO_ARTICLE_387_DEPENDENT_LIMIT,
  CO_ELECTRONIC_INVOICE_DEDUCTION_LIMIT,
  CO_EMPLOYMENT_EXEMPTION_CAP,
  CO_EMPLOYMENT_EXEMPTION_RATE,
  CO_GENERAL_DEDUCTION_CAP,
  CO_GENERAL_DEDUCTION_RATE,
  CO_MORTGAGE_INTEREST_LIMIT,
  CO_PREPAID_HEALTH_LIMIT,
  CO_SMLMV,
  CO_SOCIAL_SECURITY_CAP,
  CO_SOURCE_URLS,
  CO_TAX_CONFIG,
  CO_VOLUNTARY_PENSION_CAP,
  CO_VOLUNTARY_PENSION_RATE,
} from "./constants/tax-year-2026";
import type { COCalculatorInputs } from "./types";

const CO_BRACKETS: TaxBracket[] = CO_TAX_CONFIG.brackets;

function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}

function clampAmount(value: number, min = 0, max = Infinity): number {
  if (!Number.isFinite(value)) {
    return min;
  }

  return Math.min(Math.max(value, min), max);
}

function getPeriodsPerYear(frequency: PayFrequency): number {
  switch (frequency) {
    case "annual":
      return 1;
    case "monthly":
      return 12;
    case "biweekly":
      return 26;
    case "weekly":
      return 52;
  }
}

function calculateBracketTax(taxableIncome: number): {
  total: number;
  bracketTaxes: StandardCountryBreakdown<"CO">["bracketTaxes"];
} {
  let total = 0;
  const bracketTaxes: StandardCountryBreakdown<"CO">["bracketTaxes"] = [];

  for (const bracket of CO_BRACKETS) {
    if (taxableIncome <= bracket.min) {
      continue;
    }

    const upper = Number.isFinite(bracket.max) ? bracket.max : taxableIncome;
    const amountInBracket = Math.min(taxableIncome, upper) - bracket.min;

    if (amountInBracket <= 0) {
      continue;
    }

    const tax = roundCurrency(amountInBracket * bracket.rate);
    total += tax;
    bracketTaxes.push({
      min: bracket.min,
      max: bracket.max,
      rate: bracket.rate,
      tax,
    });
  }

  return { total: roundCurrency(total), bracketTaxes };
}

function getCODefaultInputs(): COCalculatorInputs {
  return {
    country: "CO",
    grossSalary: CO_TAX_CONFIG.defaultSalary,
    payFrequency: "monthly",
    numberOfDependents: 0,
    contributions: {
      retirementContribution: 0,
      qualifyingExpenses: 0,
      insurancePremiums: 0,
      housingExpenses: 0,
    },
  };
}

function normalizeCOInputs(inputs: CalculatorInputs): COCalculatorInputs {
  const coInputs = inputs as Partial<COCalculatorInputs>;
  const defaultInputs = getCODefaultInputs();

  return {
    ...defaultInputs,
    ...coInputs,
    country: "CO",
    grossSalary: Math.max(0, coInputs.grossSalary ?? defaultInputs.grossSalary),
    payFrequency: coInputs.payFrequency ?? defaultInputs.payFrequency,
    numberOfDependents: Math.min(
      CO_ARTICLE_336_DEPENDENT_MAX,
      Math.max(0, Math.round(coInputs.numberOfDependents ?? 0)),
    ),
    contributions: {
      ...defaultInputs.contributions,
      ...coInputs.contributions,
    },
  };
}

function calculateSolidarityRate(grossSalary: number): number {
  const monthlyBase = Math.min(grossSalary / 12, CO_SMLMV * 25);

  if (monthlyBase < CO_SMLMV * 4) {
    return 0;
  }

  if (monthlyBase < CO_SMLMV * 16) {
    return 0.01;
  }

  if (monthlyBase < CO_SMLMV * 17) {
    return 0.012;
  }

  if (monthlyBase < CO_SMLMV * 18) {
    return 0.014;
  }

  if (monthlyBase < CO_SMLMV * 19) {
    return 0.016;
  }

  if (monthlyBase < CO_SMLMV * 20) {
    return 0.018;
  }

  return 0.02;
}

function calculateMandatoryContributions(grossSalary: number) {
  const cappedBase = Math.min(grossSalary, CO_SOCIAL_SECURITY_CAP);
  const solidarityRate = calculateSolidarityRate(grossSalary);

  return [
    {
      name: "Employee pension contribution",
      amount: roundCurrency(cappedBase * 0.04),
      rate: 0.04,
      cap: CO_SOCIAL_SECURITY_CAP,
      preTax: true,
    },
    {
      name: "Employee health contribution",
      amount: roundCurrency(cappedBase * 0.04),
      rate: 0.04,
      cap: CO_SOCIAL_SECURITY_CAP,
      preTax: true,
    },
    {
      name: "Pension solidarity fund",
      amount: roundCurrency(cappedBase * solidarityRate),
      rate: solidarityRate,
      cap: CO_SOCIAL_SECURITY_CAP,
      preTax: true,
    },
  ].filter((contribution) => contribution.amount > 0);
}

function calculateCappedBenefitLimits(grossSalary: number) {
  const mandatoryContributions = calculateMandatoryContributions(grossSalary);
  const mandatoryTotal = mandatoryContributions.reduce(
    (sum, contribution) => sum + contribution.amount,
    0,
  );
  const incomeAfterSocial = Math.max(0, grossSalary - mandatoryTotal);
  const generalCap = Math.min(
    incomeAfterSocial * CO_GENERAL_DEDUCTION_RATE,
    CO_GENERAL_DEDUCTION_CAP,
  );
  const employmentExemption = Math.min(
    incomeAfterSocial * CO_EMPLOYMENT_EXEMPTION_RATE,
    CO_EMPLOYMENT_EXEMPTION_CAP,
    generalCap,
  );
  const capAfterEmploymentExemption = Math.max(
    0,
    generalCap - employmentExemption,
  );

  return {
    mandatoryContributions,
    mandatoryTotal,
    incomeAfterSocial,
    generalCap,
    employmentExemption,
    capAfterEmploymentExemption,
  };
}

function calculateCODeductions(inputs: COCalculatorInputs) {
  const grossSalary = Math.max(0, inputs.grossSalary);
  const {
    mandatoryContributions,
    mandatoryTotal,
    incomeAfterSocial,
    employmentExemption,
    capAfterEmploymentExemption,
  } = calculateCappedBenefitLimits(grossSalary);
  let remainingCappedBenefit = capAfterEmploymentExemption;
  const applyCappedBenefit = (requestedAmount: number, legalLimit: number) => {
    const amount = Math.min(
      clampAmount(requestedAmount),
      legalLimit,
      remainingCappedBenefit,
    );
    remainingCappedBenefit = Math.max(0, remainingCappedBenefit - amount);
    return roundCurrency(amount);
  };

  const article387DependentDeduction =
    inputs.numberOfDependents > 0
      ? applyCappedBenefit(
          grossSalary * 0.1,
          CO_ARTICLE_387_DEPENDENT_LIMIT,
        )
      : 0;
  const prepaidHealth = applyCappedBenefit(
    inputs.contributions.insurancePremiums,
    CO_PREPAID_HEALTH_LIMIT,
  );
  const housingInterest = applyCappedBenefit(
    inputs.contributions.housingExpenses,
    CO_MORTGAGE_INTEREST_LIMIT,
  );
  const voluntaryPensionLimit = Math.min(
    grossSalary * CO_VOLUNTARY_PENSION_RATE,
    CO_VOLUNTARY_PENSION_CAP,
  );
  const voluntaryPension = applyCappedBenefit(
    inputs.contributions.retirementContribution,
    voluntaryPensionLimit,
  );
  const extraDependentDeduction = Math.min(
    inputs.numberOfDependents,
    CO_ARTICLE_336_DEPENDENT_MAX,
  ) * CO_ARTICLE_336_DEPENDENT_DEDUCTION;
  const electronicInvoiceDeduction = Math.min(
    clampAmount(inputs.contributions.qualifyingExpenses),
    CO_ELECTRONIC_INVOICE_DEDUCTION_LIMIT,
  );
  const totalTaxDeductions = roundCurrency(
    employmentExemption +
      article387DependentDeduction +
      prepaidHealth +
      housingInterest +
      voluntaryPension +
      extraDependentDeduction +
      electronicInvoiceDeduction,
  );

  return {
    mandatoryContributions,
    mandatoryTotal,
    incomeAfterSocial,
    employmentExemption: roundCurrency(employmentExemption),
    article387DependentDeduction,
    prepaidHealth,
    housingInterest,
    voluntaryPension,
    extraDependentDeduction: roundCurrency(extraDependentDeduction),
    electronicInvoiceDeduction: roundCurrency(electronicInvoiceDeduction),
    totalTaxDeductions,
  };
}

function buildContributionLimits(
  inputs: COCalculatorInputs,
): ContributionLimits {
  const grossSalary = Math.max(0, inputs.grossSalary);
  const { capAfterEmploymentExemption } = calculateCappedBenefitLimits(grossSalary);
  const dependentUse =
    inputs.numberOfDependents > 0
      ? Math.min(grossSalary * 0.1, CO_ARTICLE_387_DEPENDENT_LIMIT)
      : 0;
  const healthUse = Math.min(
    clampAmount(inputs.contributions.insurancePremiums),
    CO_PREPAID_HEALTH_LIMIT,
  );
  const housingUse = Math.min(
    clampAmount(inputs.contributions.housingExpenses),
    CO_MORTGAGE_INTEREST_LIMIT,
  );
  const retirementUse = Math.min(
    clampAmount(inputs.contributions.retirementContribution),
    grossSalary * CO_VOLUNTARY_PENSION_RATE,
    CO_VOLUNTARY_PENSION_CAP,
  );
  const remainingFor = (currentUse: number) =>
    Math.max(
      0,
      capAfterEmploymentExemption -
        dependentUse -
        healthUse -
        housingUse -
        retirementUse +
        currentUse,
    );

  return {
    retirementContribution: {
      limit: roundCurrency(
        Math.min(
          grossSalary * CO_VOLUNTARY_PENSION_RATE,
          CO_VOLUNTARY_PENSION_CAP,
          remainingFor(retirementUse),
        ),
      ),
      name: "Voluntary pension or AFC savings",
      description:
        "Voluntary pension/AFC savings within the 30% individual limit and remaining 40% / 1,340 UVT cédula general cap after automatic employment exemption.",
      preTax: true,
    },
    insurancePremiums: {
      limit: roundCurrency(
        Math.min(CO_PREPAID_HEALTH_LIMIT, remainingFor(healthUse)),
      ),
      name: "Prepaid medicine or health insurance",
      description:
        "Article 387 health payments for the worker, spouse, children, or dependents, capped at 16 UVT per month and by the remaining cédula general cap.",
      preTax: true,
    },
    housingExpenses: {
      limit: roundCurrency(
        Math.min(CO_MORTGAGE_INTEREST_LIMIT, remainingFor(housingUse)),
      ),
      name: "Housing loan interest",
      description:
        "Deductible mortgage interest or monetary correction for qualifying housing loans, capped at 1,200 UVT per year and by the remaining cédula general cap.",
      preTax: true,
    },
    qualifyingExpenses: {
      limit: CO_ELECTRONIC_INVOICE_DEDUCTION_LIMIT,
      name: "Electronic invoice deduction",
      description:
        "Modeled Article 336 deduction for eligible electronic-invoice purchases, entered as the 1% deductible amount and capped at 240 UVT.",
      preTax: true,
    },
  };
}

export function calculateCO(inputs: COCalculatorInputs): CalculationResult {
  const normalizedInputs = normalizeCOInputs(inputs);
  const grossSalary = normalizedInputs.grossSalary;
  const deductions = calculateCODeductions(normalizedInputs);
  const taxableIncome = roundCurrency(
    Math.max(0, deductions.incomeAfterSocial - deductions.totalTaxDeductions),
  );
  const { total: incomeTax, bracketTaxes } = calculateBracketTax(taxableIncome);
  const totalMandatoryContributions = roundCurrency(deductions.mandatoryTotal);
  const totalCashVoluntaryContributions = deductions.voluntaryPension;
  const totalTax = roundCurrency(incomeTax + totalMandatoryContributions);
  const totalDeductions = roundCurrency(
    totalTax + totalCashVoluntaryContributions,
  );
  const netSalary = roundCurrency(grossSalary - totalDeductions);
  const periodsPerYear = getPeriodsPerYear(normalizedInputs.payFrequency);

  const taxes: StandardCountryTaxBreakdown<"CO"> = {
    type: "CO",
    totalIncomeTax: incomeTax,
    incomeTax,
    socialContributions: totalMandatoryContributions,
  };
  const breakdown: StandardCountryBreakdown<"CO"> = {
    type: "CO",
    grossIncome: grossSalary,
    taxableIncome,
    incomeTaxName: CO_TAX_CONFIG.incomeTaxName,
    personalAllowance: 0,
    deductions: [
      {
        name: "25% exempt employment income",
        amount: deductions.employmentExemption,
      },
      {
        name: "Article 387 dependent deduction",
        amount: deductions.article387DependentDeduction,
      },
      {
        name: "Article 336 dependent deduction",
        amount: deductions.extraDependentDeduction,
      },
      {
        name: "Prepaid medicine or health insurance",
        amount: deductions.prepaidHealth,
      },
      {
        name: "Housing loan interest",
        amount: deductions.housingInterest,
      },
      {
        name: "Electronic invoice deduction",
        amount: deductions.electronicInvoiceDeduction,
      },
    ].filter((deduction) => deduction.amount > 0),
    mandatoryContributions: deductions.mandatoryContributions,
    voluntaryContributions: [
      {
        key: "retirementContribution",
        name: "Voluntary pension or AFC savings",
        amount: deductions.voluntaryPension,
        limit:
          buildContributionLimits(normalizedInputs).retirementContribution.limit,
        taxTreatment: "deduction",
        taxBenefit: 0,
        cashFlowTreatment: "deductFromNet",
      },
    ],
    taxCredits: [],
    bracketTaxes,
    assumptions: CO_TAX_CONFIG.assumptions,
    modeledExclusions: CO_TAX_CONFIG.modeledExclusions ?? [],
    sourceUrls: [...CO_SOURCE_URLS],
  };

  return {
    country: "CO",
    currency: "COP",
    grossSalary,
    taxableIncome,
    taxes,
    totalTax,
    totalDeductions,
    netSalary,
    effectiveTaxRate: grossSalary > 0 ? totalTax / grossSalary : 0,
    perPeriod: {
      gross: grossSalary / periodsPerYear,
      net: netSalary / periodsPerYear,
      frequency: normalizedInputs.payFrequency,
    },
    breakdown,
  };
}

export const COCalculator: CountryCalculator = {
  countryCode: "CO",
  config: CO_CONFIG,

  calculate(inputs: CalculatorInputs) {
    if (inputs.country !== "CO") {
      throw new Error("COCalculator can only calculate Colombia inputs");
    }

    return calculateCO(inputs as COCalculatorInputs);
  },

  getRegions(): RegionInfo[] {
    return [];
  },

  getContributionLimits(inputs?: Partial<CalculatorInputs>) {
    const defaultInputs = getCODefaultInputs();

    return buildContributionLimits(
      normalizeCOInputs({
        ...defaultInputs,
        ...inputs,
        contributions: {
          ...defaultInputs.contributions,
          ...(inputs as Partial<COCalculatorInputs>)?.contributions,
        },
      } as CalculatorInputs),
    );
  },

  getDefaultInputs(): COCalculatorInputs {
    return getCODefaultInputs();
  },
};
