import type {
  CalculationResult,
  CalculatorInputs,
  ContributionLimits,
  CountryCalculator,
  PayFrequency,
  RegionInfo,
} from "../types";
import { clampAmount } from "@/lib/utils";
import { PL_CONFIG } from "./config";
import {
  PL_CHILD_TAX_CREDIT_ANNUAL,
  PL_FIRST_BRACKET_LIMIT,
  PL_HEALTH_INSURANCE_RATE,
  PL_IKZE_ANNUAL_CAP_2026,
  PL_PIT_HIGHER_RATE,
  PL_PIT_LOWER_RATE,
  PL_PPK_ADDITIONAL_MAX_RATE,
  PL_SOURCE_URLS,
  PL_TAX_FREE_CREDIT,
  PL_ZUS_EMPLOYEE_RATE,
} from "./constants/tax-year-2026";
import type { PLBreakdown, PLCalculatorInputs, PLTaxBreakdown } from "./types";

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

function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}

function getPpkAdditionalLimit(grossIncome: number): number {
  return Math.max(0, grossIncome) * PL_PPK_ADDITIONAL_MAX_RATE;
}

function calculatePolishPit(taxableIncome: number): number {
  if (taxableIncome <= 0) {
    return 0;
  }
  if (taxableIncome <= PL_FIRST_BRACKET_LIMIT) {
    return Math.max(0, taxableIncome * PL_PIT_LOWER_RATE - PL_TAX_FREE_CREDIT);
  }
  const lowerBracketTax =
    PL_FIRST_BRACKET_LIMIT * PL_PIT_LOWER_RATE - PL_TAX_FREE_CREDIT;
  const higherBracketTax =
    (taxableIncome - PL_FIRST_BRACKET_LIMIT) * PL_PIT_HIGHER_RATE;
  return lowerBracketTax + higherBracketTax;
}

export function calculatePL(inputs: PLCalculatorInputs): CalculationResult {
  const grossIncome = Math.max(0, inputs.grossSalary);
  const children = Math.max(0, Math.floor(inputs.numberOfChildren));
  const ikze = clampAmount(inputs.contributions?.ikze, PL_IKZE_ANNUAL_CAP_2026);
  const ppkAdditionalLimit = getPpkAdditionalLimit(grossIncome);
  const ppkAdditional = clampAmount(
    inputs.contributions?.ppkAdditional,
    ppkAdditionalLimit,
  );
  const zusEmployee = roundCurrency(grossIncome * PL_ZUS_EMPLOYEE_RATE);
  const healthBase = Math.max(0, grossIncome - zusEmployee);
  const healthInsurance = roundCurrency(healthBase * PL_HEALTH_INSURANCE_RATE);
  const taxableIncome = roundCurrency(
    Math.max(0, grossIncome - zusEmployee - healthInsurance - ikze - ppkAdditional),
  );
  const grossPit = roundCurrency(calculatePolishPit(taxableIncome));
  const childTaxCredit = roundCurrency(children * PL_CHILD_TAX_CREDIT_ANNUAL);
  const incomeTax = roundCurrency(Math.max(0, grossPit - childTaxCredit));
  const voluntaryTotal = ikze + ppkAdditional;

  const taxes: PLTaxBreakdown = {
    type: "PL",
    totalIncomeTax: incomeTax,
    incomeTax,
    zusEmployee,
    healthInsurance,
  };
  const totalTax = incomeTax + zusEmployee + healthInsurance;
  const totalDeductions = totalTax + voluntaryTotal;
  const netSalary = grossIncome - totalDeductions;
  const effectiveTaxRate = grossIncome > 0 ? totalTax / grossIncome : 0;
  const periodsPerYear = getPeriodsPerYear(inputs.payFrequency);

  const breakdown: PLBreakdown = {
    type: "PL",
    grossIncome,
    numberOfChildren: children,
    zus: {
      rate: PL_ZUS_EMPLOYEE_RATE,
      employee: zusEmployee,
    },
    healthInsurance: {
      rate: PL_HEALTH_INSURANCE_RATE,
      base: healthBase,
      employee: healthInsurance,
    },
    childTaxCredit,
    taxableIncome,
    incomeTax: {
      lowerRate: PL_PIT_LOWER_RATE,
      higherRate: PL_PIT_HIGHER_RATE,
      total: incomeTax,
    },
    voluntaryContributions: {
      ikze,
      ikzeLimit: PL_IKZE_ANNUAL_CAP_2026,
      ppkAdditional,
      ppkAdditionalLimit,
      total: voluntaryTotal,
    },
    assumptions: [
      "Polish tax scale with PLN 30,000 tax-free amount modeled as a PLN 3,600 credit in the 12% bracket.",
      "Employee ZUS modeled at 13.71% of gross and health insurance at 9% of gross minus ZUS, deductible from PIT base.",
      "IKZE up to PLN 10,512 and PPK additional up to 4% of gross reduce the PIT base and net salary.",
      "Child tax credit PLN 1,112.40 per child (ulga na dziecko, 2026).",
    ],
    sourceUrls: Object.values(PL_SOURCE_URLS),
  };

  return {
    country: "PL",
    currency: "PLN",
    grossSalary: grossIncome,
    taxableIncome,
    taxes,
    totalTax,
    totalDeductions,
    netSalary,
    effectiveTaxRate,
    perPeriod: {
      gross: grossIncome / periodsPerYear,
      net: netSalary / periodsPerYear,
      frequency: inputs.payFrequency,
    },
    breakdown,
  };
}

export const PLCalculator: CountryCalculator = {
  countryCode: "PL",
  config: PL_CONFIG,

  calculate(inputs: CalculatorInputs): CalculationResult {
    if (inputs.country !== "PL") {
      throw new Error("PLCalculator can only calculate PL inputs");
    }
    return calculatePL(inputs);
  },

  getRegions(): RegionInfo[] {
    return [];
  },

  getContributionLimits(inputs?: PLCalculatorInputs): ContributionLimits {
    const gross = inputs?.grossSalary ?? 120_000;
    return {
      ikze: {
        limit: PL_IKZE_ANNUAL_CAP_2026,
        name: "IKZE",
        description: "Individual retirement account deposit cap for 2026",
        preTax: true,
      },
      ppkAdditional: {
        limit: getPpkAdditionalLimit(gross),
        name: "PPK additional employee",
        description: "Additional PPK employee contribution up to 4% of gross",
        preTax: true,
      },
    };
  },

  getDefaultInputs(): PLCalculatorInputs {
    return {
      country: "PL",
      grossSalary: 120_000,
      payFrequency: "monthly",
      numberOfChildren: 0,
      contributions: {
        ikze: 0,
        ppkAdditional: 0,
      },
    };
  },
};
