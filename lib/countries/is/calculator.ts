import type {
  CalculationResult,
  CalculatorInputs,
  ContributionLimits,
  CountryCalculator,
  RegionInfo,
} from "../types";
import { calculateNordicTax, getPeriodsPerYear, roundCurrency } from "../nordic-shared";
import { IS_CONFIG } from "./config";
import {
  IS_FOREIGN_EXPERT_RELIEF_RATE,
  IS_FOREIGN_EXPERT_RELIEF_YEARS,
  IS_PRIVATE_PENSION_DEDUCTION_RATE,
  IS_PUBLIC_BENEFIT_DONATION_DEDUCTION_LIMIT,
  IS_PUBLIC_BENEFIT_DONATION_MINIMUM,
  IS_TAX_CONFIG,
} from "./constants/tax-year-2026";
import type {
  ISBreakdown,
  ISCalculatorInputs,
  ISTaxBreakdown,
} from "./types";

function clampAmount(value: number | undefined, max = Infinity): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(Math.max(0, value ?? 0), max);
}

function getPrivatePensionLimit(grossSalary: number): number {
  return roundCurrency(Math.max(0, grossSalary) * IS_PRIVATE_PENSION_DEDUCTION_RATE);
}

function getPublicBenefitDonationDeduction(amount: number | undefined): number {
  const donation = clampAmount(
    amount,
    IS_PUBLIC_BENEFIT_DONATION_DEDUCTION_LIMIT,
  );

  return donation >= IS_PUBLIC_BENEFIT_DONATION_MINIMUM ? donation : 0;
}

function getForeignExpertExemption(grossSalary: number): number {
  return roundCurrency(Math.max(0, grossSalary) * IS_FOREIGN_EXPERT_RELIEF_RATE);
}

function normalizeISInputs(inputs: ISCalculatorInputs): ISCalculatorInputs {
  const grossSalary = Math.max(0, inputs.grossSalary);
  const privatePensionLimit = getPrivatePensionLimit(grossSalary);

  return {
    ...inputs,
    grossSalary,
    foreignExpertRelief: inputs.foreignExpertRelief === true,
    contributions: {
      privatePensionContribution: clampAmount(
        inputs.contributions?.privatePensionContribution,
        privatePensionLimit,
      ),
      charitableDonations: clampAmount(
        inputs.contributions?.charitableDonations,
        IS_PUBLIC_BENEFIT_DONATION_DEDUCTION_LIMIT,
      ),
    },
  };
}

export function calculateIS(inputs: ISCalculatorInputs): CalculationResult {
  const normalizedInputs = normalizeISInputs(inputs);
  const privatePensionContribution =
    normalizedInputs.contributions.privatePensionContribution;
  const privatePensionLimit = getPrivatePensionLimit(
    normalizedInputs.grossSalary,
  );
  const charitableDonationDeduction = getPublicBenefitDonationDeduction(
    normalizedInputs.contributions.charitableDonations,
  );
  const foreignExpertExemption = normalizedInputs.foreignExpertRelief
    ? getForeignExpertExemption(normalizedInputs.grossSalary)
    : 0;
  const computation = calculateNordicTax(
    normalizedInputs.grossSalary,
    IS_TAX_CONFIG,
    {
      additionalPreTaxDeduction:
        privatePensionContribution +
        charitableDonationDeduction +
        foreignExpertExemption,
    },
  );
  const periodsPerYear = getPeriodsPerYear(normalizedInputs.payFrequency);
  const totalDeductions = roundCurrency(
    computation.totalTax + privatePensionContribution,
  );
  const netSalary = roundCurrency(normalizedInputs.grossSalary - totalDeductions);

  const taxes: ISTaxBreakdown = {
    type: "IS",
    totalIncomeTax: computation.incomeTax,
    incomeTax: computation.incomeTax,
    employeeSocialContribution: computation.employeeSocialContribution,
  };

  const breakdown: ISBreakdown = {
    type: "IS",
    grossIncome: normalizedInputs.grossSalary,
    taxableIncome: computation.taxableIncome,
    bracketTaxes: computation.bracketTaxes,
    employeeSocialContribution: {
      name: IS_TAX_CONFIG.employeeSocialName,
      amount: computation.employeeSocialContribution,
      rate: IS_TAX_CONFIG.employeeSocialRate,
      cap: IS_TAX_CONFIG.employeeSocialCap,
    },
    foreignExpertRelief: {
      applies: normalizedInputs.foreignExpertRelief,
      exemptAmount: foreignExpertExemption,
      rate: IS_FOREIGN_EXPERT_RELIEF_RATE,
      years: IS_FOREIGN_EXPERT_RELIEF_YEARS,
    },
    voluntaryContributions: [
      ...(privatePensionContribution > 0
        ? [
            {
              key: "privatePensionContribution",
              name: "Private supplementary pension contribution",
              amount: privatePensionContribution,
              limit: privatePensionLimit,
              preTax: true,
              cashFlowTreatment: "deductFromNet",
            } satisfies ISBreakdown["voluntaryContributions"][number],
          ]
        : []),
      ...(charitableDonationDeduction > 0
        ? [
            {
              key: "charitableDonations",
              name: "Registered public-benefit donations",
              amount: charitableDonationDeduction,
              limit: IS_PUBLIC_BENEFIT_DONATION_DEDUCTION_LIMIT,
              preTax: true,
              cashFlowTreatment: "taxOnly",
            } satisfies ISBreakdown["voluntaryContributions"][number],
          ]
        : []),
    ],
    standardDeduction: IS_TAX_CONFIG.standardDeduction,
    assumptions: IS_TAX_CONFIG.assumptions,
    sourceUrls: IS_TAX_CONFIG.sourceUrls,
  };

  return {
    country: "IS",
    currency: "ISK",
    grossSalary: normalizedInputs.grossSalary,
    taxableIncome: computation.taxableIncome,
    taxes,
    totalTax: computation.totalTax,
    totalDeductions,
    netSalary,
    effectiveTaxRate:
      normalizedInputs.grossSalary > 0
        ? computation.totalTax / normalizedInputs.grossSalary
        : 0,
    perPeriod: {
      gross: normalizedInputs.grossSalary / periodsPerYear,
      net: netSalary / periodsPerYear,
      frequency: normalizedInputs.payFrequency,
    },
    breakdown,
  };
}

export const ISCalculator: CountryCalculator = {
  countryCode: "IS",
  config: IS_CONFIG,

  calculate(inputs: CalculatorInputs): CalculationResult {
    if (inputs.country !== "IS") {
      throw new Error("ISCalculator can only calculate IS inputs");
    }

    return calculateIS(inputs as ISCalculatorInputs);
  },

  getRegions(): RegionInfo[] {
    return [];
  },

  getContributionLimits(inputs?: Partial<CalculatorInputs>): ContributionLimits {
    const grossSalary = Math.max(0, inputs?.grossSalary ?? IS_TAX_CONFIG.defaultSalary);
    const privatePensionLimit = getPrivatePensionLimit(grossSalary);

    return {
      privatePensionContribution: {
        limit: privatePensionLimit,
        name: "Private supplementary pension contribution",
        description:
          "Deductible Iceland private pension savings contribution, modeled up to 4% of salary.",
        preTax: true,
      },
      charitableDonations: {
        limit: IS_PUBLIC_BENEFIT_DONATION_DEDUCTION_LIMIT,
        name: "Registered public-benefit donations",
        description:
          "Annual gifts to organisations on Skatturinn's public-benefit register; deductions apply once gifts reach ISK 10,000 and are capped at ISK 350,000.",
        preTax: true,
      },
    };
  },

  getDefaultInputs(): ISCalculatorInputs {
    return {
      country: "IS",
      grossSalary: 9_600_000,
      payFrequency: "monthly",
      foreignExpertRelief: false,
      contributions: {
        privatePensionContribution: 0,
        charitableDonations: 0,
      },
    };
  },
};
