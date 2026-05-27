import {
  createStandardCountryCalculator,
  type StandardCountryCalculatorInputs,
} from "../shared/standard-country";
import type {
  CalculatorInputs,
  CountryCalculator,
  RegionInfo,
} from "../types";
import { LK_CONFIG } from "./config";
import {
  calculateLKSecondaryEmploymentRate,
  calculateLKTerminalBenefitsTax,
  LK_EPF_EMPLOYER_RATE,
  LK_ETF_EMPLOYER_RATE,
  LK_TAX_CONFIG,
} from "./constants/tax-year-2026";
import type { LKBreakdown, LKCalculatorInputs, LKTaxBreakdown } from "./types";

const baseCalculator = createStandardCountryCalculator(
  LK_CONFIG,
  LK_TAX_CONFIG,
);

function normalizeLKInputs(inputs: CalculatorInputs): LKCalculatorInputs {
  const standardInputs = inputs as StandardCountryCalculatorInputs<"LK"> &
    Partial<LKCalculatorInputs>;

  return {
    ...standardInputs,
    country: "LK",
    grossSalary: standardInputs.grossSalary,
    payFrequency: standardInputs.payFrequency,
    employmentType: standardInputs.employmentType ?? "primary",
    epfCovered:
      standardInputs.employmentType === "foreignEmployer"
        ? false
        : standardInputs.epfCovered ?? true,
    annualLumpSumPayments: Math.max(
      0,
      standardInputs.annualLumpSumPayments ?? 0,
    ),
    taxableNonCashBenefits: Math.max(
      0,
      standardInputs.taxableNonCashBenefits ?? 0,
    ),
    taxableTerminalBenefits: Math.max(
      0,
      standardInputs.taxableTerminalBenefits ?? 0,
    ),
    terminalBenefitTreatment:
      standardInputs.terminalBenefitTreatment ?? "approvedOrEtf",
    primaryMonthlyRemuneration: Math.max(
      0,
      standardInputs.primaryMonthlyRemuneration ?? 0,
    ),
    epfContributionBase: standardInputs.epfContributionBase,
    contributions: {
      retirementContribution:
        standardInputs.contributions?.retirementContribution ?? 0,
      qualifyingExpenses: standardInputs.contributions?.qualifyingExpenses ?? 0,
      charitableDonations:
        standardInputs.contributions?.charitableDonations ?? 0,
      housingExpenses: standardInputs.contributions?.housingExpenses ?? 0,
    },
  };
}

function buildLKTaxableInputs(inputs: LKCalculatorInputs): LKCalculatorInputs {
  const regularCashIncome = Math.max(0, inputs.grossSalary);
  const cashLumpSumPayments = Math.max(0, inputs.annualLumpSumPayments);
  const cashEmploymentIncome = regularCashIncome + cashLumpSumPayments;

  return {
    ...inputs,
    grossSalary: cashEmploymentIncome,
    epfContributionBase:
      inputs.epfCovered === false ? 0 : regularCashIncome,
    contributions: {
      ...inputs.contributions,
      housingExpenses:
        inputs.employmentType === "nonResidentNonCitizen" ||
        inputs.employmentType === "secondary"
          ? 0
          : inputs.contributions.housingExpenses,
      charitableDonations:
        inputs.employmentType === "secondary"
          ? 0
          : inputs.contributions.charitableDonations,
      qualifyingExpenses:
        inputs.employmentType === "secondary"
          ? 0
          : inputs.contributions.qualifyingExpenses,
    },
  };
}

function getPeriodsPerYear(frequency: LKCalculatorInputs["payFrequency"]) {
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

function roundCurrency(amount: number) {
  return Math.round(amount * 100) / 100;
}

function getLKDefaultInputs(): LKCalculatorInputs {
  return {
    country: "LK",
    grossSalary: LK_TAX_CONFIG.defaultSalary,
    payFrequency: "monthly",
    employmentType: "primary",
    epfCovered: true,
    annualLumpSumPayments: 0,
    taxableNonCashBenefits: 0,
    taxableTerminalBenefits: 0,
    terminalBenefitTreatment: "approvedOrEtf",
    primaryMonthlyRemuneration: 0,
    contributions: {
      retirementContribution: 0,
      qualifyingExpenses: 0,
      charitableDonations: 0,
      housingExpenses: 0,
    },
  };
}

export const LKCalculator: CountryCalculator = {
  ...baseCalculator,

  calculate(inputs: CalculatorInputs) {
    if (inputs.country !== "LK") {
      throw new Error("LKCalculator can only calculate Sri Lanka inputs");
    }

    const normalizedInputs = normalizeLKInputs(inputs);
    const taxableInputs = buildLKTaxableInputs(normalizedInputs);
    const baseResult = baseCalculator.calculate(taxableInputs);
    const regularCashIncome = Math.max(0, normalizedInputs.grossSalary);
    const cashLumpSumPayments = Math.max(
      0,
      normalizedInputs.annualLumpSumPayments,
    );
    const taxableNonCashBenefits = Math.max(
      0,
      normalizedInputs.taxableNonCashBenefits,
    );
    const taxableTerminalBenefits = Math.max(
      0,
      normalizedInputs.taxableTerminalBenefits,
    );
    const terminalBenefitsTax = roundCurrency(
      calculateLKTerminalBenefitsTax({
        taxableTerminalBenefits,
        treatment: normalizedInputs.terminalBenefitTreatment,
        taxableEmploymentIncomeToDate:
          regularCashIncome + cashLumpSumPayments + taxableNonCashBenefits,
      }),
    );
    const cashGrossSalary =
      regularCashIncome + cashLumpSumPayments + taxableTerminalBenefits;
    const employerContributionBase =
      normalizedInputs.epfCovered === false ||
      normalizedInputs.employmentType === "foreignEmployer"
        ? 0
        : taxableInputs.epfContributionBase ?? 0;
    const employerEpfContribution = roundCurrency(
      employerContributionBase * LK_EPF_EMPLOYER_RATE,
    );
    const employerEtfContribution = roundCurrency(
      employerContributionBase * LK_ETF_EMPLOYER_RATE,
    );
    const totalEmployerStatutoryContributions = roundCurrency(
      employerEpfContribution + employerEtfContribution,
    );
    const estimatedEmployerSalaryCost = roundCurrency(
      cashGrossSalary + totalEmployerStatutoryContributions,
    );
    const periodsPerYear = getPeriodsPerYear(normalizedInputs.payFrequency);
    const secondaryEmploymentRate =
      normalizedInputs.employmentType === "secondary"
        ? calculateLKSecondaryEmploymentRate({
            primaryMonthlyRemuneration:
              normalizedInputs.primaryMonthlyRemuneration,
            secondaryAnnualRemuneration: taxableInputs.grossSalary,
          })
        : undefined;
    const baseTaxes = baseResult.taxes as LKTaxBreakdown;
    const taxes = {
      ...baseTaxes,
      totalIncomeTax: baseTaxes.totalIncomeTax + terminalBenefitsTax,
      incomeTax: baseTaxes.incomeTax + terminalBenefitsTax,
    } satisfies LKTaxBreakdown;
    const totalTax =
      Math.round((baseResult.totalTax + terminalBenefitsTax) * 100) / 100;
    const totalDeductions = roundCurrency(
      baseResult.totalDeductions + terminalBenefitsTax,
    );
    const breakdown = {
      ...(baseResult.breakdown as LKBreakdown),
      regularCashIncome,
      cashLumpSumPayments,
      taxableNonCashBenefits,
      taxableTerminalBenefits,
      terminalBenefitsTax,
      terminalBenefitTreatment: normalizedInputs.terminalBenefitTreatment,
      epfContributionBase: taxableInputs.epfContributionBase ?? 0,
      employerContributionBase,
      employerEpfContribution,
      employerEtfContribution,
      totalEmployerStatutoryContributions,
      estimatedEmployerSalaryCost,
      secondaryEmploymentRate,
    } satisfies LKBreakdown;
    const netSalary = roundCurrency(cashGrossSalary - totalDeductions);

    return {
      ...baseResult,
      grossSalary: cashGrossSalary,
      taxes,
      totalTax,
      totalDeductions,
      netSalary,
      effectiveTaxRate:
        cashGrossSalary > 0 ? totalTax / cashGrossSalary : 0,
      perPeriod: {
        gross: cashGrossSalary / periodsPerYear,
        net: netSalary / periodsPerYear,
        frequency: normalizedInputs.payFrequency,
      },
      breakdown,
    };
  },

  getRegions(): RegionInfo[] {
    return [];
  },

  getContributionLimits(inputs?: Partial<CalculatorInputs>) {
    const defaultInputs = getLKDefaultInputs();
    const taxableInputs = buildLKTaxableInputs(
      normalizeLKInputs({
        ...defaultInputs,
        ...inputs,
        contributions: {
          ...defaultInputs.contributions,
          ...(inputs as Partial<LKCalculatorInputs>)?.contributions,
        },
      } as CalculatorInputs),
    );

    return baseCalculator.getContributionLimits(
      {
        ...taxableInputs,
        grossSalary:
          taxableInputs.grossSalary +
          Math.max(0, taxableInputs.taxableNonCashBenefits),
      },
    );
  },

  getDefaultInputs(): LKCalculatorInputs {
    return getLKDefaultInputs();
  },
};
