import {
  createStandardCountryCalculator,
  type StandardCountryTaxBreakdown,
} from "../shared/standard-country";
import type {
  CalculatorInputs,
  CalculationResult,
  CountryCalculator,
} from "../types";
import { SC_CONFIG } from "./config";
import {
  SC_VOLUNTARY_SPF_CONTRIBUTION_NAME,
  SC_NON_MONETARY_BENEFITS_TAX_RATE,
  SC_TAX_CONFIG,
} from "./constants/tax-year-2026";
import type {
  SCBreakdown,
  SCCalculatorInputs,
  SCCitizenship,
  SCEmployeeTaxTable,
  SCTaxBreakdown,
} from "./types";

const baseSCCalculator = createStandardCountryCalculator(
  SC_CONFIG,
  SC_TAX_CONFIG,
);

function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}

function getPeriodsPerYear(frequency: SCCalculatorInputs["payFrequency"]) {
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

function normalizeEmployeeTaxTable(
  value: unknown,
  citizenship: unknown,
): SCEmployeeTaxTable {
  const candidate = value ?? citizenship;

  switch (candidate) {
    case "citizen":
    case "specific_project":
    case "stevedore":
      return candidate;
    default:
      return "non_citizen";
  }
}

function getCitizenshipFromTaxTable(
  employeeTaxTable: SCEmployeeTaxTable,
  citizenship: unknown,
): SCCitizenship {
  if (employeeTaxTable === "citizen") {
    return "citizen";
  }

  if (employeeTaxTable === "non_citizen" && citizenship === "citizen") {
    return "citizen";
  }

  return "non_citizen";
}

function normalizeSCInputs(inputs: CalculatorInputs): SCCalculatorInputs {
  const scInputs = inputs as Partial<SCCalculatorInputs>;
  const employeeTaxTable = normalizeEmployeeTaxTable(
    scInputs.employeeTaxTable,
    scInputs.citizenship,
  );
  const citizenship = getCitizenshipFromTaxTable(
    employeeTaxTable,
    scInputs.citizenship,
  );

  return {
    ...inputs,
    country: "SC",
    employeeTaxTable,
    citizenship,
    taxableNonMonetaryBenefits: Math.max(
      0,
      scInputs.taxableNonMonetaryBenefits ?? 0,
    ),
    contributions: {
      retirementContribution:
        scInputs.contributions?.retirementContribution ?? 0,
      qualifyingExpenses: scInputs.contributions?.qualifyingExpenses ?? 0,
    },
  };
}

function calculateSCResult(inputs: SCCalculatorInputs): CalculationResult {
  const baseResult = baseSCCalculator.calculate(inputs);
  const baseTaxes = baseResult.taxes as StandardCountryTaxBreakdown<"SC">;
  const taxableNonMonetaryBenefits = Math.max(
    0,
    inputs.taxableNonMonetaryBenefits,
  );
  const nonMonetaryBenefitsTax = roundCurrency(
    taxableNonMonetaryBenefits * SC_NON_MONETARY_BENEFITS_TAX_RATE,
  );
  const voluntarySpfContribution = roundCurrency(
    Math.min(
      Math.max(0, inputs.contributions.retirementContribution ?? 0),
      Math.max(0, baseResult.netSalary),
    ),
  );
  const taxes = {
    ...baseTaxes,
    nonMonetaryBenefitsTax,
  } satisfies SCTaxBreakdown;
  const breakdown = {
    ...(baseResult.breakdown as SCBreakdown),
    voluntaryContributions:
      voluntarySpfContribution > 0
        ? [
            ...(baseResult.breakdown as SCBreakdown).voluntaryContributions,
            {
              key: "retirementContribution",
              name: SC_VOLUNTARY_SPF_CONTRIBUTION_NAME,
              amount: voluntarySpfContribution,
              limit: Math.max(0, baseResult.netSalary),
              taxTreatment: "none",
              taxBenefit: 0,
              cashFlowTreatment: "deductFromNet",
            },
          ]
        : (baseResult.breakdown as SCBreakdown).voluntaryContributions,
    employeeTaxTable: inputs.employeeTaxTable,
    citizenship: inputs.citizenship,
    taxableNonMonetaryBenefits,
    nonMonetaryBenefitsTax,
    voluntarySpfContribution,
  } satisfies SCBreakdown;

  return {
    ...baseResult,
    totalDeductions: roundCurrency(
      baseResult.totalDeductions + voluntarySpfContribution,
    ),
    netSalary: roundCurrency(baseResult.netSalary - voluntarySpfContribution),
    perPeriod: {
      ...baseResult.perPeriod,
      net: roundCurrency(
        (baseResult.netSalary - voluntarySpfContribution) /
          getPeriodsPerYear(inputs.payFrequency),
      ),
    },
    taxes,
    breakdown,
  };
}

export const SCCalculator: CountryCalculator = {
  ...baseSCCalculator,

  calculate(inputs: CalculatorInputs) {
    if (inputs.country !== "SC") {
      throw new Error("SCCalculator can only calculate Seychelles inputs");
    }

    return calculateSCResult(normalizeSCInputs(inputs));
  },

  getDefaultInputs() {
    return {
      ...baseSCCalculator.getDefaultInputs(),
      employeeTaxTable: "non_citizen",
      citizenship: "non_citizen",
      taxableNonMonetaryBenefits: 0,
    } as CalculatorInputs;
  },

  getContributionLimits(inputs?: Partial<CalculatorInputs>) {
    const normalizedInputs = normalizeSCInputs({
      ...this.getDefaultInputs(),
      ...inputs,
      contributions: {
        ...this.getDefaultInputs().contributions,
        ...(inputs as Partial<SCCalculatorInputs>)?.contributions,
      },
    } as CalculatorInputs);
    const baseResult = baseSCCalculator.calculate(normalizedInputs);

    return {
      retirementContribution: {
        limit: Math.max(0, baseResult.netSalary),
        name: "SPF voluntary contribution",
        description:
          "Optional Seychelles Pension Fund voluntary saving made through workplace salary deduction. It reduces cash take-home pay but is not modeled as income-tax relief.",
        preTax: false,
      },
    };
  },
};
