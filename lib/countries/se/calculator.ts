import type {
  CalculationResult,
  CalculatorInputs,
  ContributionLimits,
  CountryCalculator,
  RegionInfo,
} from "../types";
import {
  calculateNordicTax,
  getPeriodsPerYear,
  roundCurrency,
} from "../nordic-shared";
import { SE_CONFIG } from "./config";
import {
  SE_AVERAGE_MUNICIPAL_TAX_RATE_2026,
  SE_COMMUTING_DEDUCTION_THRESHOLD_2026,
  SE_EXPERT_RELIEF_EXEMPT_RATE,
  SE_EXPERT_RELIEF_TAXABLE_RATE,
  SE_GREEN_TECHNOLOGY_TAX_REDUCTION_LIMIT_2026,
  SE_OTHER_WORK_EXPENSE_THRESHOLD_2026,
  SE_PRIVATE_PENSION_DEDUCTION_2026,
  SE_ROT_RUT_TAX_REDUCTION_LIMIT_2026,
  SE_TAX_CONFIG,
} from "./constants/tax-year-2026";
import type {
  SEBreakdown,
  SECalculatorInputs,
  SEContributionInputs,
  SETaxBreakdown,
} from "./types";

function clampAmount(value: number | undefined, max = Infinity): number {
  return Math.min(Math.max(0, value ?? 0), max);
}

export function calculateSE(inputs: SECalculatorInputs): CalculationResult {
  const grossSalary = Math.max(0, inputs.grossSalary);
  const taxRegime = inputs.taxRegime ?? "ordinary";
  const contributions: Partial<SEContributionInputs> = inputs.contributions ?? {};
  const municipalTaxRate =
    inputs.municipalTaxRate > 0
      ? Math.min(Math.max(inputs.municipalTaxRate, 0.2), 0.4)
      : SE_AVERAGE_MUNICIPAL_TAX_RATE_2026;
  const taxableSalaryBase =
    taxRegime === "expertRelief"
      ? roundCurrency(grossSalary * SE_EXPERT_RELIEF_TAXABLE_RATE)
      : grossSalary;
  const privatePensionLimit = Math.min(
    roundCurrency(grossSalary * SE_PRIVATE_PENSION_DEDUCTION_2026.rate),
    SE_PRIVATE_PENSION_DEDUCTION_2026.max,
  );
  const privatePensionSavings =
    taxRegime === "ordinary" && inputs.noOccupationalPension
      ? clampAmount(contributions.privatePensionSavings, privatePensionLimit)
      : 0;
  const commutingExpenses =
    taxRegime === "ordinary" ? clampAmount(contributions.commutingExpenses) : 0;
  const commutingDeduction = roundCurrency(
    Math.max(0, commutingExpenses - SE_COMMUTING_DEDUCTION_THRESHOLD_2026),
  );
  const otherWorkExpenses =
    taxRegime === "ordinary" ? clampAmount(contributions.otherWorkExpenses) : 0;
  const otherWorkExpenseDeduction = roundCurrency(
    Math.max(0, otherWorkExpenses - SE_OTHER_WORK_EXPENSE_THRESHOLD_2026),
  );
  const rotRutTaxReduction =
    taxRegime === "ordinary"
      ? clampAmount(
          contributions.rotRutTaxReduction,
          SE_ROT_RUT_TAX_REDUCTION_LIMIT_2026,
        )
      : 0;
  const greenTechnologyTaxReduction =
    taxRegime === "ordinary"
      ? clampAmount(
          contributions.greenTechnologyTaxReduction,
          SE_GREEN_TECHNOLOGY_TAX_REDUCTION_LIMIT_2026,
        )
      : 0;
  const taxConfig = {
    ...SE_TAX_CONFIG,
    flatTaxRate: municipalTaxRate,
  };
  const computation = calculateNordicTax(taxableSalaryBase, taxConfig, {
    additionalPreTaxDeduction: roundCurrency(
      privatePensionSavings + commutingDeduction + otherWorkExpenseDeduction,
    ),
  });
  const periodsPerYear = getPeriodsPerYear(inputs.payFrequency);
  const appliedTaxReductions = Math.min(
    computation.incomeTax,
    roundCurrency(rotRutTaxReduction + greenTechnologyTaxReduction),
  );
  const incomeTax = roundCurrency(computation.incomeTax - appliedTaxReductions);
  const totalTax = roundCurrency(
    incomeTax + computation.employeeSocialContribution,
  );
  const netSalary = roundCurrency(
    grossSalary - totalTax - privatePensionSavings,
  );

  const taxes: SETaxBreakdown = {
    type: "SE",
    totalIncomeTax: incomeTax,
    incomeTax,
    employeeSocialContribution: computation.employeeSocialContribution,
    employeeSocialTaxCredit: computation.employeeSocialTaxCredit,
  };

  const breakdown: SEBreakdown = {
    type: "SE",
    grossIncome: grossSalary,
    taxableIncome: computation.taxableIncome,
    bracketTaxes: computation.bracketTaxes,
    employeeSocialContribution: {
      name: SE_TAX_CONFIG.employeeSocialName,
      amount: computation.employeeSocialContribution,
      rate: SE_TAX_CONFIG.employeeSocialRate,
      cap: SE_TAX_CONFIG.employeeSocialContributionCap,
    },
    employeeSocialTaxCredit: computation.employeeSocialTaxCredit,
    taxRegime,
    expertRelief:
      taxRegime === "expertRelief"
        ? {
            exemptIncome: roundCurrency(
              grossSalary * SE_EXPERT_RELIEF_EXEMPT_RATE,
            ),
            taxableSalaryBase,
            exemptRate: SE_EXPERT_RELIEF_EXEMPT_RATE,
          }
        : undefined,
    standardDeduction: SE_TAX_CONFIG.standardDeduction,
    municipalTaxRate,
    noOccupationalPension: inputs.noOccupationalPension,
    voluntaryDeductions: {
      privatePensionSavings,
      commutingExpenses,
      commutingDeduction,
      otherWorkExpenses,
      otherWorkExpenseDeduction,
      rotRutTaxReduction: Math.min(rotRutTaxReduction, appliedTaxReductions),
      greenTechnologyTaxReduction: Math.min(
        greenTechnologyTaxReduction,
        Math.max(0, appliedTaxReductions - rotRutTaxReduction),
      ),
      appliedTaxReductions,
    },
    assumptions: SE_TAX_CONFIG.assumptions,
    sourceUrls: SE_TAX_CONFIG.sourceUrls,
  };

  return {
    country: "SE",
    currency: "SEK",
    grossSalary,
    taxableIncome: computation.taxableIncome,
    taxes,
    totalTax,
    totalDeductions: roundCurrency(totalTax + privatePensionSavings),
    netSalary,
    effectiveTaxRate:
      grossSalary > 0 ? (totalTax + privatePensionSavings) / grossSalary : 0,
    perPeriod: {
      gross: grossSalary / periodsPerYear,
      net: netSalary / periodsPerYear,
      frequency: inputs.payFrequency,
    },
    breakdown,
  };
}

export const SECalculator: CountryCalculator = {
  countryCode: "SE",
  config: SE_CONFIG,

  calculate(inputs: CalculatorInputs): CalculationResult {
    if (inputs.country !== "SE") {
      throw new Error("SECalculator can only calculate SE inputs");
    }

    return calculateSE(inputs as SECalculatorInputs);
  },

  getRegions(): RegionInfo[] {
    return [];
  },

  getContributionLimits(inputs?: Partial<CalculatorInputs>): ContributionLimits {
    const grossSalary =
      inputs?.country === "SE" && typeof inputs.grossSalary === "number"
        ? Math.max(0, inputs.grossSalary)
        : SE_TAX_CONFIG.defaultSalary;
    const privatePensionLimit = Math.min(
      roundCurrency(grossSalary * SE_PRIVATE_PENSION_DEDUCTION_2026.rate),
      SE_PRIVATE_PENSION_DEDUCTION_2026.max,
    );

    return {
      privatePensionSavings: {
        limit: privatePensionLimit,
        name: "Private pension savings",
        description:
          "Deduction cap for employees who completely lack occupational pension rights at work: 35% of employment income, capped at SEK 592,000 in 2026.",
        preTax: true,
      },
      rotRutTaxReduction: {
        limit: SE_ROT_RUT_TAX_REDUCTION_LIMIT_2026,
        name: "ROT/RUT tax reduction",
        description:
          "Combined ROT/RUT tax reduction is capped at SEK 75,000 per person per year; ROT itself cannot exceed SEK 50,000.",
        preTax: false,
      },
      greenTechnologyTaxReduction: {
        limit: SE_GREEN_TECHNOLOGY_TAX_REDUCTION_LIMIT_2026,
        name: "Green technology tax reduction",
        description:
          "Green-technology tax reduction is capped at SEK 50,000 per person per year.",
        preTax: false,
      },
    };
  },

  getDefaultInputs(): SECalculatorInputs {
    return {
      country: "SE",
      grossSalary: 600_000,
      payFrequency: "monthly",
      taxRegime: "ordinary",
      municipalTaxRate: SE_AVERAGE_MUNICIPAL_TAX_RATE_2026,
      noOccupationalPension: false,
      contributions: {
        privatePensionSavings: 0,
        commutingExpenses: 0,
        otherWorkExpenses: 0,
        rotRutTaxReduction: 0,
        greenTechnologyTaxReduction: 0,
      },
    };
  },
};
