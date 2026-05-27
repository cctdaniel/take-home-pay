import {
  createStandardCountryCalculator,
  type StandardCountryTaxBreakdown,
} from "../shared/standard-country";
import type {
  CalculatorInputs,
  CalculationResult,
  CountryCalculator,
  PayFrequency,
} from "../types";
import { KH_CONFIG } from "./config";
import {
  getCambodiaNssfHealthCareBaseMonthly,
  getCambodiaNssfMonthlyWage,
  getCambodiaNssfPensionBaseMonthly,
  KH_FRINGE_BENEFIT_TAX_RATE,
  KH_TAX_CONFIG,
} from "./constants/tax-year-2026";
import type { KHBreakdown, KHCalculatorInputs, KHTaxBreakdown } from "./types";

const baseKHCalculator = createStandardCountryCalculator(
  KH_CONFIG,
  KH_TAX_CONFIG,
);

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

function normalizeKHInputs(inputs: CalculatorInputs): KHCalculatorInputs {
  const partialInputs = inputs as Partial<KHCalculatorInputs>;

  return {
    ...inputs,
    country: "KH",
    grossSalary: Math.max(0, inputs.grossSalary),
    payFrequency: inputs.payFrequency,
    taxResidency:
      partialInputs.taxResidency === "nonResident"
        ? "nonResident"
        : "resident",
    hasDependentSpouse: partialInputs.hasDependentSpouse ?? false,
    dependentChildren: Math.trunc(
      Math.min(Math.max(partialInputs.dependentChildren ?? 0, 0), 4),
    ),
    taxableFringeBenefits: Math.max(
      0,
      partialInputs.taxableFringeBenefits ?? 0,
    ),
    nssfMonthlyWage: Math.max(0, partialInputs.nssfMonthlyWage ?? 0),
    contributions: {
      retirementContribution:
        partialInputs.contributions?.retirementContribution ?? 0,
      qualifyingExpenses: partialInputs.contributions?.qualifyingExpenses ?? 0,
    },
  };
}

function calculateKHResult(inputs: KHCalculatorInputs): CalculationResult {
  const cashSalary = Math.max(0, inputs.grossSalary);
  const taxableFringeBenefits = Math.max(0, inputs.taxableFringeBenefits);
  const salaryInputs = {
    ...inputs,
    grossSalary: cashSalary,
    hasDependentSpouse:
      inputs.taxResidency === "resident" ? inputs.hasDependentSpouse : false,
    dependentChildren:
      inputs.taxResidency === "resident" ? inputs.dependentChildren : 0,
  };
  const baseResult = baseKHCalculator.calculate(salaryInputs);
  const baseTaxes = baseResult.taxes as StandardCountryTaxBreakdown<"KH">;
  const fringeBenefitTax =
    Math.round(taxableFringeBenefits * KH_FRINGE_BENEFIT_TAX_RATE * 100) /
    100;
  const nssfMonthlyWage = getCambodiaNssfMonthlyWage({
    grossSalary: baseResult.grossSalary,
    inputs: salaryInputs,
  });
  const nssfHealthCareBaseMonthly = getCambodiaNssfHealthCareBaseMonthly({
    grossSalary: baseResult.grossSalary,
    inputs: salaryInputs,
  });
  const nssfPensionBaseMonthly = getCambodiaNssfPensionBaseMonthly({
    grossSalary: baseResult.grossSalary,
    inputs: salaryInputs,
  });
  const incomeTax =
    Math.round((baseTaxes.incomeTax + fringeBenefitTax) * 100) / 100;
  const totalTax =
    Math.round((baseResult.totalTax + fringeBenefitTax) * 100) / 100;
  const totalDeductions =
    Math.round((baseResult.totalDeductions + fringeBenefitTax) * 100) / 100;
  const netSalary = Math.round((cashSalary - totalDeductions) * 100) / 100;
  const periodsPerYear = getPeriodsPerYear(inputs.payFrequency);
  const taxes = {
    ...baseTaxes,
    totalIncomeTax: incomeTax,
    incomeTax,
    fringeBenefitTax,
  } satisfies KHTaxBreakdown;
  const breakdown = {
    ...(baseResult.breakdown as KHBreakdown),
    taxResidency: inputs.taxResidency,
    cashSalary,
    taxableFringeBenefits,
    fringeBenefitTax,
    nssfMonthlyWage,
    nssfHealthCareBaseMonthly,
    nssfPensionBaseMonthly,
  } satisfies KHBreakdown;

  return {
    ...baseResult,
    grossSalary: cashSalary,
    taxableIncome: baseResult.taxableIncome + taxableFringeBenefits,
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

export const KHCalculator: CountryCalculator = {
  ...baseKHCalculator,

  calculate(inputs: CalculatorInputs) {
    if (inputs.country !== "KH") {
      throw new Error("KHCalculator can only calculate Cambodia inputs");
    }

    return calculateKHResult(normalizeKHInputs(inputs));
  },

  getDefaultInputs() {
    return {
      ...baseKHCalculator.getDefaultInputs(),
      taxResidency: "resident",
      hasDependentSpouse: false,
      dependentChildren: 0,
      taxableFringeBenefits: 0,
      nssfMonthlyWage: 0,
    } as CalculatorInputs;
  },
};
