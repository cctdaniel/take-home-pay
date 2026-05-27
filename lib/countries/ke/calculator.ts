import {
  createStandardCountryCalculator,
  type StandardCountryCalculatorInputs,
} from "../shared/standard-country";
import type {
  CalculatorInputs,
  CalculationResult,
  CountryCalculator,
  PayFrequency,
  RegionInfo,
} from "../types";
import { KE_CONFIG } from "./config";
import {
  KE_DISABILITY_EXEMPTION_LIMIT,
  KE_INSURANCE_RELIEF_LIMIT,
  KE_INSURANCE_RELIEF_PREMIUM_LIMIT,
  KE_MORTGAGE_INTEREST_LIMIT,
  KE_NSSF_ANNUAL_CAP_2026,
  KE_PENSION_DEDUCTION_LIMIT,
  KE_POST_RETIREMENT_MEDICAL_FUND_LIMIT,
  KE_SHIF_ANNUAL_MINIMUM,
  KE_TAX_CONFIG,
} from "./constants/tax-year-2026";
import type { KEBreakdown, KECalculatorInputs, KETaxBreakdown } from "./types";

const baseCalculator = createStandardCountryCalculator(
  KE_CONFIG,
  KE_TAX_CONFIG,
);

function getKEDefaultInputs(): KECalculatorInputs {
  return {
    country: "KE",
    grossSalary: KE_TAX_CONFIG.defaultSalary,
    payFrequency: "monthly",
    hasDisabilityExemptionCertificate: false,
    taxableNonCashBenefits: 0,
    contributions: {
      retirementContribution: 0,
      qualifyingExpenses: 0,
      medicalExpenses: 0,
      housingExpenses: 0,
    },
  };
}

function normalizeKEInputs(inputs: CalculatorInputs): KECalculatorInputs {
  const standardInputs = inputs as StandardCountryCalculatorInputs<"KE"> &
    Partial<KECalculatorInputs>;

  return {
    ...standardInputs,
    country: "KE",
    grossSalary: standardInputs.grossSalary,
    payFrequency: standardInputs.payFrequency,
    hasDisabilityExemptionCertificate:
      standardInputs.hasDisabilityExemptionCertificate ?? false,
    taxableNonCashBenefits: Math.max(
      0,
      standardInputs.taxableNonCashBenefits ?? 0,
    ),
    contributions: {
      retirementContribution:
        standardInputs.contributions?.retirementContribution ?? 0,
      qualifyingExpenses: standardInputs.contributions?.qualifyingExpenses ?? 0,
      medicalExpenses: standardInputs.contributions?.medicalExpenses ?? 0,
      housingExpenses: standardInputs.contributions?.housingExpenses ?? 0,
    },
  };
}

function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}

function clampAmount(value: number, max: number): number {
  return Math.min(Math.max(0, value), Math.max(0, max));
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

function calculateGrossTax(taxableIncome: number): {
  total: number;
  bracketTaxes: KEBreakdown["bracketTaxes"];
} {
  const bracketTaxes = KE_TAX_CONFIG.brackets.map((bracket) => {
    if (taxableIncome <= bracket.min) {
      return { ...bracket, tax: 0 };
    }

    const upper = Number.isFinite(bracket.max) ? bracket.max : taxableIncome;
    const taxableAmount = Math.max(
      0,
      Math.min(taxableIncome, upper) - bracket.min,
    );

    return {
      ...bracket,
      tax: roundCurrency(taxableAmount * bracket.rate),
    };
  });

  return {
    total: roundCurrency(
      bracketTaxes.reduce((sum, bracket) => sum + bracket.tax, 0),
    ),
    bracketTaxes,
  };
}

function calculateKEResult(inputs: KECalculatorInputs): CalculationResult {
  const cashSalary = Math.max(0, inputs.grossSalary);
  const taxableNonCashBenefits = roundCurrency(
    Math.max(0, inputs.taxableNonCashBenefits),
  );
  const nssfContribution = roundCurrency(
    Math.min(cashSalary, KE_NSSF_ANNUAL_CAP_2026) * 0.06,
  );
  const shifContribution =
    cashSalary > 0
      ? roundCurrency(Math.max(cashSalary * 0.0275, KE_SHIF_ANNUAL_MINIMUM))
      : 0;
  const affordableHousingLevy = roundCurrency(cashSalary * 0.015);
  const retirementLimit = Math.max(
    0,
    KE_PENSION_DEDUCTION_LIMIT - nssfContribution,
  );
  const retirementContribution = roundCurrency(
    clampAmount(inputs.contributions.retirementContribution, retirementLimit),
  );
  const postRetirementMedicalContribution = roundCurrency(
    clampAmount(
      inputs.contributions.medicalExpenses,
      KE_POST_RETIREMENT_MEDICAL_FUND_LIMIT,
    ),
  );
  const mortgageInterest = roundCurrency(
    clampAmount(inputs.contributions.housingExpenses, KE_MORTGAGE_INTEREST_LIMIT),
  );
  const insurancePremiums = roundCurrency(
    clampAmount(
      inputs.contributions.qualifyingExpenses,
      KE_INSURANCE_RELIEF_PREMIUM_LIMIT,
    ),
  );
  const insuranceRelief = roundCurrency(
    Math.min(insurancePremiums * 0.15, KE_INSURANCE_RELIEF_LIMIT),
  );
  const pwdExemption = inputs.hasDisabilityExemptionCertificate
    ? Math.min(
        cashSalary + taxableNonCashBenefits,
        KE_DISABILITY_EXEMPTION_LIMIT,
      )
    : 0;
  const taxableIncome = roundCurrency(
    Math.max(
      0,
      cashSalary +
        taxableNonCashBenefits -
        nssfContribution -
        shifContribution -
        affordableHousingLevy -
        retirementContribution -
        postRetirementMedicalContribution -
        mortgageInterest -
        pwdExemption,
    ),
  );
  const cashTaxableIncome = roundCurrency(
    Math.max(
      0,
      cashSalary -
        nssfContribution -
        shifContribution -
        affordableHousingLevy -
        retirementContribution -
        postRetirementMedicalContribution -
        mortgageInterest -
        (inputs.hasDisabilityExemptionCertificate
          ? Math.min(cashSalary, KE_DISABILITY_EXEMPTION_LIMIT)
          : 0),
    ),
  );
  const grossTax = calculateGrossTax(taxableIncome);
  const cashGrossTax = calculateGrossTax(cashTaxableIncome).total;
  const personalRelief = 28800;
  const incomeTax = roundCurrency(
    Math.max(0, grossTax.total - personalRelief - insuranceRelief),
  );
  const cashIncomeTax = roundCurrency(
    Math.max(0, cashGrossTax - personalRelief - insuranceRelief),
  );
  const mandatoryContributions: KEBreakdown["mandatoryContributions"] = [
    {
      name: "NSSF employee contribution",
      amount: nssfContribution,
      rate: 0.06,
      cap: KE_NSSF_ANNUAL_CAP_2026,
      preTax: true,
    },
    {
      name: "SHIF health contribution",
      amount: shifContribution,
      rate: 0.0275,
      preTax: true,
    },
    {
      name: "Affordable Housing Levy",
      amount: affordableHousingLevy,
      rate: 0.015,
      preTax: true,
    },
  ].filter((contribution) => contribution.amount > 0);
  const voluntaryContributions: KEBreakdown["voluntaryContributions"] = [
    {
      key: "retirementContribution",
      name: "Registered pension or retirement fund contribution",
      amount: retirementContribution,
      limit: retirementLimit,
      taxTreatment: "deduction",
      taxBenefit: 0,
      cashFlowTreatment: "deductFromNet",
    },
    {
      key: "medicalExpenses",
      name: "Post-retirement medical fund contribution",
      amount: postRetirementMedicalContribution,
      limit: KE_POST_RETIREMENT_MEDICAL_FUND_LIMIT,
      taxTreatment: "deduction",
      taxBenefit: 0,
      cashFlowTreatment: "deductFromNet",
    },
    {
      key: "housingExpenses",
      name: "Owner-occupied mortgage interest",
      amount: mortgageInterest,
      limit: KE_MORTGAGE_INTEREST_LIMIT,
      taxTreatment: "deduction",
      taxBenefit: 0,
      cashFlowTreatment: "taxOnly",
    },
    {
      key: "qualifyingExpenses",
      name: "Qualifying insurance premiums",
      amount: insurancePremiums,
      limit: KE_INSURANCE_RELIEF_PREMIUM_LIMIT,
      taxTreatment: "credit",
      taxBenefit: insuranceRelief,
      cashFlowTreatment: "taxOnly",
    },
  ];
  const deductions: KEBreakdown["deductions"] =
    pwdExemption > 0
      ? [{ name: "Persons with Disability exemption", amount: pwdExemption }]
      : [];
  const taxCredits: KEBreakdown["taxCredits"] = [
    { name: "Personal relief", amount: personalRelief },
    ...(insuranceRelief > 0
      ? [{ name: "Insurance relief", amount: insuranceRelief }]
      : []),
  ];
  const socialContributions = roundCurrency(
    mandatoryContributions.reduce(
      (sum, contribution) => sum + contribution.amount,
      0,
    ),
  );
  const totalTax = roundCurrency(incomeTax + socialContributions);
  const totalVoluntaryCashContributions = roundCurrency(
    retirementContribution + postRetirementMedicalContribution,
  );
  const totalDeductions = roundCurrency(
    totalTax + totalVoluntaryCashContributions,
  );
  const netSalary = roundCurrency(cashSalary - totalDeductions);
  const periodsPerYear = getPeriodsPerYear(inputs.payFrequency);
  const taxes = {
    type: "KE",
    totalIncomeTax: incomeTax,
    incomeTax,
    socialContributions,
    cashIncomeTax,
    nonCashBenefitTaxEffect: roundCurrency(incomeTax - cashIncomeTax),
  } satisfies KETaxBreakdown;
  const breakdown = {
    type: "KE",
    grossIncome: cashSalary,
    taxableIncome,
    cashSalary,
    cashTaxableIncome,
    taxableNonCashBenefits,
    incomeTaxName: KE_TAX_CONFIG.incomeTaxName,
    personalAllowance: 0,
    deductions,
    mandatoryContributions,
    voluntaryContributions,
    taxCredits,
    bracketTaxes: grossTax.bracketTaxes,
    assumptions: KE_TAX_CONFIG.assumptions,
    modeledExclusions: KE_TAX_CONFIG.modeledExclusions ?? [],
    sourceUrls: KE_TAX_CONFIG.sourceUrls,
  } satisfies KEBreakdown;

  return {
    country: "KE",
    currency: "KES",
    grossSalary: cashSalary,
    taxableIncome,
    taxes,
    totalTax,
    totalDeductions,
    netSalary,
    effectiveTaxRate: cashSalary > 0 ? totalTax / cashSalary : 0,
    perPeriod: {
      gross: cashSalary / periodsPerYear,
      net: netSalary / periodsPerYear,
      frequency: inputs.payFrequency,
    },
    breakdown,
  };
}

export const KECalculator: CountryCalculator = {
  ...baseCalculator,

  calculate(inputs: CalculatorInputs) {
    if (inputs.country !== "KE") {
      throw new Error("KECalculator can only calculate Kenya inputs");
    }

    return calculateKEResult(normalizeKEInputs(inputs));
  },

  getRegions(): RegionInfo[] {
    return [];
  },

  getContributionLimits(inputs?: Partial<CalculatorInputs>) {
    const defaultInputs = getKEDefaultInputs();

    return baseCalculator.getContributionLimits(
      normalizeKEInputs({
        ...defaultInputs,
        ...inputs,
        contributions: {
          ...defaultInputs.contributions,
          ...(inputs as Partial<KECalculatorInputs>)?.contributions,
        },
      } as CalculatorInputs),
    );
  },

  getDefaultInputs(): KECalculatorInputs {
    return getKEDefaultInputs();
  },
};
