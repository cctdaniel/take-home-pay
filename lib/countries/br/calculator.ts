import {
  calculateStandardCountry,
  type StandardCountryCalculatorInputs,
} from "../shared/standard-country";
import type {
  CalculatorInputs,
  CalculationResult,
  ContributionLimits,
  CountryCalculator,
  PayFrequency,
  RegionInfo,
  TaxBracket,
} from "../types";
import { BR_CONFIG } from "./config";
import {
  BR_DEPENDENT_MONTHLY_DEDUCTION,
  BR_INSS_MONTHLY_CAP,
  BR_TAX_CONFIG,
  BR_THIRTEENTH_SALARY_MONTHS,
} from "./constants/tax-year-2026";
import type { BRBreakdown, BRCalculatorInputs, BRTaxBreakdown } from "./types";

const BR_MONTHLY_IRPF_BRACKETS: TaxBracket[] = [
  { min: 0, max: 2428.8, rate: 0 },
  { min: 2428.8, max: 2826.65, rate: 0.075 },
  { min: 2826.65, max: 3751.05, rate: 0.15 },
  { min: 3751.05, max: 4664.68, rate: 0.225 },
  { min: 4664.68, max: Infinity, rate: 0.275 },
];

const BR_MONTHLY_INSS_BRACKETS: TaxBracket[] = [
  { min: 0, max: 1621, rate: 0.075 },
  { min: 1621, max: 2902.84, rate: 0.09 },
  { min: 2902.84, max: 4354.27, rate: 0.12 },
  { min: 4354.27, max: Infinity, rate: 0.14 },
];

function normalizeInputs(inputs: CalculatorInputs): BRCalculatorInputs {
  const rawInputs = inputs as Partial<BRCalculatorInputs>;

  return {
    country: "BR",
    grossSalary: Math.max(0, rawInputs.grossSalary ?? BR_TAX_CONFIG.defaultSalary),
    payFrequency: rawInputs.payFrequency ?? "monthly",
    numberOfDependents: Math.max(
      0,
      Math.floor(rawInputs.numberOfDependents ?? 0),
    ),
    salaryPackageMode: rawInputs.salaryPackageMode ?? "includedInGross",
    contributions: {
      retirementContribution: Math.max(
        0,
        rawInputs.contributions?.retirementContribution ?? 0,
      ),
      qualifyingExpenses: 0,
      educationExpenses: Math.max(
        0,
        rawInputs.contributions?.educationExpenses ?? 0,
      ),
      medicalExpenses: Math.max(
        0,
        rawInputs.contributions?.medicalExpenses ?? 0,
      ),
    },
  };
}

function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
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

function calculateProgressiveTax(amount: number, brackets: TaxBracket[]) {
  let total = 0;

  for (const bracket of brackets) {
    if (amount <= bracket.min) {
      continue;
    }

    const upper = Number.isFinite(bracket.max) ? bracket.max : amount;
    const amountInBracket = Math.min(amount, upper) - bracket.min;

    if (amountInBracket > 0) {
      total += amountInBracket * bracket.rate;
    }
  }

  return roundCurrency(total);
}

function calculateMonthlyIrpfReduction(
  taxableEarnings: number,
  grossIncomeTax: number,
): number {
  if (taxableEarnings <= 5000) {
    return Math.min(grossIncomeTax, 312.89);
  }

  if (taxableEarnings <= 7350) {
    return Math.min(
      grossIncomeTax,
      Math.max(0, 978.62 - 0.133145 * taxableEarnings),
    );
  }

  return 0;
}

function calculateMonthlyInssContribution(salary: number) {
  return calculateProgressiveTax(
    Math.min(Math.max(0, salary), BR_INSS_MONTHLY_CAP),
    BR_MONTHLY_INSS_BRACKETS,
  );
}

function buildBRSalaryPackageContext(inputs: BRCalculatorInputs) {
  const enteredGrossSalary = Math.max(0, inputs.grossSalary);

  if (inputs.salaryPackageMode === "includedInGross") {
    const ordinaryMonthlySalary =
      enteredGrossSalary / (12 + BR_THIRTEENTH_SALARY_MONTHS);
    const ordinarySalary = ordinaryMonthlySalary * 12;
    const thirteenthSalary =
      ordinaryMonthlySalary * BR_THIRTEENTH_SALARY_MONTHS;

    return {
      enteredGrossSalary,
      ordinarySalary: roundCurrency(ordinarySalary),
      thirteenthSalary: roundCurrency(thirteenthSalary),
      totalGrossSalary: roundCurrency(enteredGrossSalary),
    };
  }

  const ordinarySalary = enteredGrossSalary;
  const thirteenthSalary =
    inputs.salaryPackageMode === "additionalToGross"
      ? (ordinarySalary / 12) * BR_THIRTEENTH_SALARY_MONTHS
      : 0;

  return {
    enteredGrossSalary,
    ordinarySalary: roundCurrency(ordinarySalary),
    thirteenthSalary: roundCurrency(thirteenthSalary),
    totalGrossSalary: roundCurrency(ordinarySalary + thirteenthSalary),
  };
}

function buildBRThirteenthSalaryTaxes(
  inputs: BRCalculatorInputs,
  thirteenthSalary: number,
) {
  if (thirteenthSalary <= 0) {
    return {
      thirteenthSalaryInssContribution: 0,
      thirteenthSalaryTaxableIncome: 0,
      thirteenthSalaryIncomeTax: 0,
    };
  }

  const thirteenthSalaryInssContribution =
    calculateMonthlyInssContribution(thirteenthSalary);
  const thirteenthSalaryTaxableIncome = roundCurrency(
    Math.max(
      0,
      thirteenthSalary -
        thirteenthSalaryInssContribution -
        inputs.numberOfDependents * BR_DEPENDENT_MONTHLY_DEDUCTION,
    ),
  );
  const grossThirteenthSalaryIncomeTax = calculateProgressiveTax(
    thirteenthSalaryTaxableIncome,
    BR_MONTHLY_IRPF_BRACKETS,
  );
  const monthlyReduction = calculateMonthlyIrpfReduction(
    thirteenthSalary,
    grossThirteenthSalaryIncomeTax,
  );

  return {
    thirteenthSalaryInssContribution,
    thirteenthSalaryTaxableIncome,
    thirteenthSalaryIncomeTax: roundCurrency(
      Math.max(0, grossThirteenthSalaryIncomeTax - monthlyReduction),
    ),
  };
}

function withBRSalaryPackageResult(
  result: CalculationResult,
  inputs: BRCalculatorInputs,
  salaryContext: ReturnType<typeof buildBRSalaryPackageContext>,
): CalculationResult {
  if (
    result.breakdown.type !== "BR" ||
    !("incomeTax" in result.taxes) ||
    !("socialContributions" in result.taxes)
  ) {
    return result;
  }

  const thirteenthTaxes = buildBRThirteenthSalaryTaxes(
    inputs,
    salaryContext.thirteenthSalary,
  );
  const standardTaxes = result.taxes as BRTaxBreakdown;
  const incomeTax = roundCurrency(
    standardTaxes.incomeTax + thirteenthTaxes.thirteenthSalaryIncomeTax,
  );
  const socialContributions = roundCurrency(
    standardTaxes.socialContributions +
      thirteenthTaxes.thirteenthSalaryInssContribution,
  );
  const totalTax = roundCurrency(
    result.totalTax +
      thirteenthTaxes.thirteenthSalaryIncomeTax +
      thirteenthTaxes.thirteenthSalaryInssContribution,
  );
  const totalDeductions = roundCurrency(
    result.totalDeductions +
      thirteenthTaxes.thirteenthSalaryIncomeTax +
      thirteenthTaxes.thirteenthSalaryInssContribution,
  );
  const grossSalary = salaryContext.totalGrossSalary;
  const netSalary = roundCurrency(
    result.netSalary +
      salaryContext.thirteenthSalary -
      thirteenthTaxes.thirteenthSalaryIncomeTax -
      thirteenthTaxes.thirteenthSalaryInssContribution,
  );
  const periodsPerYear = getPeriodsPerYear(inputs.payFrequency);
  const taxes: BRTaxBreakdown = {
    ...standardTaxes,
    incomeTax,
    totalIncomeTax: incomeTax,
    socialContributions,
    thirteenthSalaryIncomeTax:
      thirteenthTaxes.thirteenthSalaryIncomeTax,
    thirteenthSalaryInssContribution:
      thirteenthTaxes.thirteenthSalaryInssContribution,
  };
  const breakdown: BRBreakdown = {
    ...result.breakdown,
    grossIncome: grossSalary,
    salaryPackageMode: inputs.salaryPackageMode,
    enteredGrossSalary: salaryContext.enteredGrossSalary,
    ordinarySalary: salaryContext.ordinarySalary,
    thirteenthSalary: salaryContext.thirteenthSalary,
    ordinaryInssBase: salaryContext.ordinarySalary,
    thirteenthSalaryTaxableIncome:
      thirteenthTaxes.thirteenthSalaryTaxableIncome,
    mandatoryContributions:
      thirteenthTaxes.thirteenthSalaryInssContribution > 0
        ? [
            ...result.breakdown.mandatoryContributions,
            {
              name: "13th salary INSS contribution",
              amount: thirteenthTaxes.thirteenthSalaryInssContribution,
              rate: 0,
              cap: BR_INSS_MONTHLY_CAP,
              preTax: true,
            },
          ]
        : result.breakdown.mandatoryContributions,
  };

  return {
    ...result,
    grossSalary,
    taxes,
    totalTax,
    totalDeductions,
    netSalary,
    effectiveTaxRate: grossSalary > 0 ? totalTax / grossSalary : 0,
    perPeriod: {
      gross: grossSalary / periodsPerYear,
      net: netSalary / periodsPerYear,
      frequency: inputs.payFrequency,
    },
    breakdown,
  };
}

export const BRCalculator: CountryCalculator = {
  countryCode: "BR",
  config: BR_CONFIG,

  calculate(inputs: CalculatorInputs) {
    if (inputs.country !== "BR") {
      throw new Error("BRCalculator can only calculate BR inputs");
    }

    const normalizedInputs = normalizeInputs(inputs);
    const salaryContext = buildBRSalaryPackageContext(normalizedInputs);
    const result = calculateStandardCountry(
      {
        ...normalizedInputs,
        grossSalary: salaryContext.ordinarySalary,
      } as StandardCountryCalculatorInputs<"BR">,
      BR_TAX_CONFIG,
    );

    return withBRSalaryPackageResult(result, normalizedInputs, salaryContext);
  },

  getRegions(): RegionInfo[] {
    return [];
  },

  getContributionLimits(inputs?: Partial<CalculatorInputs>): ContributionLimits {
    const normalizedInputs = normalizeInputs({
      ...this.getDefaultInputs(),
      ...inputs,
      country: "BR",
    } as CalculatorInputs);
    const salaryContext = buildBRSalaryPackageContext(normalizedInputs);

    return Object.fromEntries(
      (BR_TAX_CONFIG.voluntaryContributions ?? []).map((contribution) => {
        let limit = Number.POSITIVE_INFINITY;

        if (contribution.calculateLimit) {
          limit = contribution.calculateLimit({
            grossSalary: salaryContext.ordinarySalary,
            inputs: {
              ...normalizedInputs,
              grossSalary: salaryContext.ordinarySalary,
            },
          });
        } else if ("limit" in contribution) {
          limit =
            (contribution as { limit?: number }).limit ??
            Number.POSITIVE_INFINITY;
        }

        return [
          contribution.key,
          {
            limit,
            name: contribution.name,
            description: contribution.description,
            preTax: contribution.taxTreatment === "deduction",
          },
        ];
      }),
    );
  },

  getDefaultInputs(): BRCalculatorInputs {
    return {
      country: "BR",
      grossSalary: BR_TAX_CONFIG.defaultSalary,
      payFrequency: "monthly",
      numberOfDependents: 0,
      salaryPackageMode: "includedInGross",
      contributions: {
        retirementContribution: 0,
        qualifyingExpenses: 0,
        educationExpenses: 0,
        medicalExpenses: 0,
      },
    };
  },
};
