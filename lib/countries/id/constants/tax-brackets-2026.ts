import type { IDTaxReliefInputs, TaxBracket } from "../../types";

export const ID_TAX_BRACKETS_2026: TaxBracket[] = [
  { min: 0, max: 60_000_000, rate: 0.05 },
  { min: 60_000_000, max: 250_000_000, rate: 0.15 },
  { min: 250_000_000, max: 500_000_000, rate: 0.25 },
  { min: 500_000_000, max: 5_000_000_000, rate: 0.3 },
  { min: 5_000_000_000, max: Infinity, rate: 0.35 },
];

export const ID_PTKP_2026 = {
  personal: 54_000_000,
  married: 4_500_000,
  dependent: 4_500_000,
  spouseIncomeCombined: 54_000_000,
  maxDependents: 3,
} as const;

export const ID_JOB_EXPENSE_2026 = {
  rate: 0.05,
  annualCap: 6_000_000,
  monthlyCap: 500_000,
} as const;

export const ID_BPJS_2026 = {
  health: {
    employeeRate: 0.01,
    employerRate: 0.04,
    monthlyWageCap: 12_000_000,
  },
  jht: {
    employeeRate: 0.02,
    employerRate: 0.037,
  },
  jp: {
    employeeRate: 0.01,
    employerRate: 0.02,
    monthlyWageCap: 10_547_400,
  },
} as const;

export function calculatePtkp(inputs: IDTaxReliefInputs): {
  total: number;
  dependents: number;
  components: {
    personal: number;
    married: number;
    dependents: number;
    spouseIncomeCombined: number;
  };
} {
  const dependents = Math.min(
    Math.max(0, inputs.numberOfDependents),
    ID_PTKP_2026.maxDependents,
  );
  const married = inputs.maritalStatus === "married";
  const spouseIncomeCombined = married && inputs.spouseIncomeCombined;

  const personal = ID_PTKP_2026.personal;
  const marriedAllowance = married ? ID_PTKP_2026.married : 0;
  const dependentAllowance = dependents * ID_PTKP_2026.dependent;
  const spouseCombinedAllowance = spouseIncomeCombined
    ? ID_PTKP_2026.spouseIncomeCombined
    : 0;

  const total =
    personal + marriedAllowance + dependentAllowance + spouseCombinedAllowance;

  return {
    total,
    dependents,
    components: {
      personal,
      married: marriedAllowance,
      dependents: dependentAllowance,
      spouseIncomeCombined: spouseCombinedAllowance,
    },
  };
}

export function calculateProgressiveTax(
  taxableIncome: number,
): {
  totalTax: number;
  bracketTaxes: Array<{
    min: number;
    max: number;
    rate: number;
    tax: number;
  }>;
} {
  let totalTax = 0;
  const bracketTaxes: Array<{
    min: number;
    max: number;
    rate: number;
    tax: number;
  }> = [];

  for (const bracket of ID_TAX_BRACKETS_2026) {
    if (taxableIncome <= bracket.min) {
      continue;
    }
    const taxableInBracket = Math.min(taxableIncome, bracket.max) - bracket.min;
    if (taxableInBracket <= 0) {
      continue;
    }
    const tax = taxableInBracket * bracket.rate;
    totalTax += tax;
    bracketTaxes.push({
      min: bracket.min,
      max: bracket.max,
      rate: bracket.rate,
      tax: Math.round(tax),
    });
  }

  return {
    totalTax: Math.round(totalTax),
    bracketTaxes,
  };
}
