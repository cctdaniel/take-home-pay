import type {
  CalculationResult,
  CalculatorInputs,
  ContributionLimits,
  CountryCalculator,
  RegionInfo,
} from "../types";
import { clampAmount } from "@/lib/utils";
import { AR_CONFIG } from "./config";
import {
  AR_SOCIAL_2026,
  AR_VOLUNTARY_RETIREMENT_MAX_RATE,
  calculateArFamilyDeductions,
  calculateArGananciasTax,
  getArGananciasParams,
  getDefaultArGananciasSemester,
  resolveArGananciasSemester,
} from "./constants/tax-year-2026";
import type { ARBreakdown, ARCalculatorInputs, ARTaxBreakdown } from "./types";
import { getPeriodsPerYear, roundCurrency } from "../calculator-utils";

function getVoluntaryRetirementLimit(grossSalary: number): number {
  return Math.max(0, grossSalary) * AR_VOLUNTARY_RETIREMENT_MAX_RATE;
}

export function calculateAR(inputs: ARCalculatorInputs): CalculationResult {
  const grossSalary = Math.max(0, inputs.grossSalary);
  const gananciasSemester = resolveArGananciasSemester(inputs.gananciasSemester);
  const gananciasParams = getArGananciasParams(gananciasSemester);
  const { deductions, art94Slices, periodLabel, sourceUrls } = gananciasParams;

  const voluntaryRetirementLimit = getVoluntaryRetirementLimit(grossSalary);
  const voluntaryRetirement = clampAmount(
    inputs.contributions?.voluntaryRetirement,
    voluntaryRetirementLimit,
  );
  const familyDeductions = calculateArFamilyDeductions(
    {
      hasSpouse: inputs.hasSpouse,
      children: inputs.children,
    },
    deductions,
  );
  const totalDeductionsFromGross =
    deductions.nonImponible +
    deductions.specialDeduction +
    familyDeductions +
    voluntaryRetirement;
  const taxableIncome = Math.max(0, grossSalary - totalDeductionsFromGross);
  const { totalTax: incomeTax, bracketTaxes } = calculateArGananciasTax(
    taxableIncome,
    art94Slices,
  );

  const jubilacion = roundCurrency(grossSalary * AR_SOCIAL_2026.jubilacionRate);
  const obraSocial = roundCurrency(grossSalary * AR_SOCIAL_2026.obraSocialRate);
  const pami = roundCurrency(grossSalary * AR_SOCIAL_2026.pamiRate);

  const taxes: ARTaxBreakdown = {
    type: "AR",
    totalIncomeTax: incomeTax,
    incomeTax,
    jubilacion,
    obraSocial,
    pami,
  };

  const statutoryPayroll = jubilacion + obraSocial + pami;
  const totalTax = incomeTax + statutoryPayroll;
  const totalDeductions = totalTax + voluntaryRetirement;
  const netSalary = grossSalary - totalDeductions;
  const effectiveTaxRate = grossSalary > 0 ? totalTax / grossSalary : 0;
  const periodsPerYear = getPeriodsPerYear(inputs.payFrequency);

  const semesterLabel =
    gananciasSemester === "h1" ? "enero–junio" : "julio–diciembre";

  const breakdown: ARBreakdown = {
    type: "AR",
    grossIncome: grossSalary,
    taxableIncome,
    nonImponible: deductions.nonImponible,
    specialDeduction: deductions.specialDeduction,
    familyDeductions,
    voluntaryRetirement,
    totalDeductionsFromGross,
    hasSpouse: inputs.hasSpouse,
    children: inputs.children,
    bracketTaxes,
    social: {
      jubilacionRate: AR_SOCIAL_2026.jubilacionRate,
      obraSocialRate: AR_SOCIAL_2026.obraSocialRate,
      pamiRate: AR_SOCIAL_2026.pamiRate,
    },
    voluntaryContributions: {
      voluntaryRetirement,
      voluntaryRetirementLimit,
      total: voluntaryRetirement,
    },
    gananciasSemester,
    taxPeriod: periodLabel,
    assumptions: [
      `Ganancias 4th category: Art. 30 deductions and Art. 94 scale (${semesterLabel} 2026, AFIP).`,
      "Employee jubilación 11%, obra social 3%, PAMI 3% on gross salary.",
      "Voluntary retirement up to 12% of gross as additional ganancias deduction.",
      "Excludes monotributo, SAC pro-rata, and provincial gross receipts taxes.",
    ],
    sourceUrls,
  };

  return {
    country: "AR",
    currency: "ARS",
    grossSalary,
    taxableIncome,
    taxes,
    totalTax,
    totalDeductions,
    netSalary,
    effectiveTaxRate,
    perPeriod: {
      gross: grossSalary / periodsPerYear,
      net: netSalary / periodsPerYear,
      frequency: inputs.payFrequency,
    },
    breakdown,
  };
}

export const ARCalculator: CountryCalculator = {
  countryCode: "AR",
  config: AR_CONFIG,

  calculate(inputs: CalculatorInputs): CalculationResult {
    if (inputs.country !== "AR") {
      throw new Error("ARCalculator can only calculate AR inputs");
    }
    return calculateAR(inputs);
  },

  getRegions(): RegionInfo[] {
    return [];
  },

  getContributionLimits(inputs?: ARCalculatorInputs): ContributionLimits {
    const gross = inputs?.grossSalary ?? 12_000_000;
    return {
      voluntaryRetirement: {
        limit: getVoluntaryRetirementLimit(gross),
        name: "Voluntary retirement",
        description:
          "Aportes voluntarios deductible from gross up to 12% for ganancias",
        preTax: true,
      },
    };
  },

  getDefaultInputs(): ARCalculatorInputs {
    return {
      country: "AR",
      grossSalary: 12_000_000,
      payFrequency: "monthly",
      gananciasSemester: getDefaultArGananciasSemester(),
      hasSpouse: false,
      children: 0,
      contributions: {
        voluntaryRetirement: 0,
      },
    };
  },
};
