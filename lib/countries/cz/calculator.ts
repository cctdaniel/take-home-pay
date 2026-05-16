import type {
  CalculationResult,
  CalculatorInputs,
  ContributionLimits,
  CountryCalculator,
  PayFrequency,
  RegionInfo,
} from "../types";
import { CZ_CONFIG } from "./config";
import {
  calculateCzechChildCredit,
  calculateCzechDeductibleCharitableDonations,
  calculateCzechHealthInsurance,
  calculateCzechProgressiveIncomeTax,
  calculateCzechSocialSecurity,
  calculateCzechTaxableIncome,
  clampCzechAmount,
  CZECH_TAX_PARAMETERS_2026,
} from "./constants/tax-parameters-2026";
import type { CZBreakdown, CZCalculatorInputs, CZTaxBreakdown } from "./types";

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

export function calculateCZ(inputs: CZCalculatorInputs): CalculationResult {
  const {
    grossSalary,
    payFrequency,
    residencyType,
    contributions,
    taxReliefs,
  } = inputs;

  const grossIncome = Math.max(0, grossSalary);
  const isResident = residencyType === "resident";
  const normalizedChildren = Math.max(
    0,
    Math.floor(taxReliefs.numberOfChildren || 0),
  );

  const retirementSavingsContribution = isResident
    ? clampCzechAmount(
        contributions.retirementSavingsContribution,
        CZECH_TAX_PARAMETERS_2026.deductions.retirementProductsLimit,
      )
    : 0;
  const charitableDonations = isResident
    ? calculateCzechDeductibleCharitableDonations(
        grossIncome,
        contributions.charitableDonations,
      )
    : 0;
  const totalModeledDeductions =
    retirementSavingsContribution + charitableDonations;

  const { taxableIncomeBeforeRounding, taxableIncome } =
    calculateCzechTaxableIncome(
      grossIncome,
      retirementSavingsContribution,
      charitableDonations,
    );
  const { totalTax: grossIncomeTax, bracketTaxes } =
    calculateCzechProgressiveIncomeTax(taxableIncome);

  const basicTaxpayerCredit =
    CZECH_TAX_PARAMETERS_2026.credits.basicTaxpayer;
  const spouseCredit =
    isResident && taxReliefs.hasSpouseCredit
      ? CZECH_TAX_PARAMETERS_2026.credits.spouse
      : 0;
  const taxAfterNonRefundableCredits = Math.max(
    0,
    grossIncomeTax - basicTaxpayerCredit - spouseCredit,
  );
  const childCredit = isResident
    ? calculateCzechChildCredit(normalizedChildren)
    : 0;
  const childCreditAgainstTax = Math.min(
    taxAfterNonRefundableCredits,
    childCredit,
  );
  const potentialChildTaxBonus = childCredit - childCreditAgainstTax;
  const childTaxBonus =
    grossIncome >=
      CZECH_TAX_PARAMETERS_2026.minimumAnnualIncomeForChildBonus &&
    potentialChildTaxBonus >=
      CZECH_TAX_PARAMETERS_2026.minimumAnnualChildBonus
      ? potentialChildTaxBonus
      : 0;
  const incomeTax = taxAfterNonRefundableCredits - childCreditAgainstTax;

  const socialSecurity = calculateCzechSocialSecurity(grossIncome);
  const healthInsurance = calculateCzechHealthInsurance(grossIncome);

  const taxes: CZTaxBreakdown = {
    type: "CZ",
    totalIncomeTax: incomeTax,
    incomeTax,
    socialSecurity: socialSecurity.employee,
    healthInsurance: healthInsurance.employee,
    childTaxBonus,
  };

  const totalTax =
    incomeTax +
    socialSecurity.employee +
    healthInsurance.employee -
    childTaxBonus;
  const totalDeductions = totalTax + totalModeledDeductions;
  const netSalary = grossIncome - totalDeductions;
  const effectiveTaxRate = grossIncome > 0 ? totalTax / grossIncome : 0;
  const periodsPerYear = getPeriodsPerYear(payFrequency);
  const higherRateTaxableIncome = Math.max(
    0,
    taxableIncome - CZECH_TAX_PARAMETERS_2026.annualTaxBandThreshold,
  );

  const breakdown: CZBreakdown = {
    type: "CZ",
    grossIncome,
    isResident,
    taxableIncomeBeforeRounding,
    taxableIncome,
    bracketTaxes,
    deductions: {
      retirementSavings: retirementSavingsContribution,
      charitableDonations,
      requestedCharitableDonations: Math.max(
        0,
        contributions.charitableDonations || 0,
      ),
      total: totalModeledDeductions,
    },
    taxCredits: {
      basicTaxpayerCredit,
      spouseCredit,
      childCredit,
      childCreditAgainstTax,
      childTaxBonus,
      totalNonRefundableCredits:
        Math.min(grossIncomeTax, basicTaxpayerCredit + spouseCredit) +
        childCreditAgainstTax,
    },
    incomeTax: {
      grossIncomeTax,
      finalIncomeTax: incomeTax,
      taxBandThreshold: CZECH_TAX_PARAMETERS_2026.annualTaxBandThreshold,
      higherRateTaxableIncome,
    },
    socialSecurity: {
      employee: socialSecurity.employee,
      employer: socialSecurity.employer,
      employeeRate: CZECH_TAX_PARAMETERS_2026.socialSecurity.employeeRate,
      employerRate: CZECH_TAX_PARAMETERS_2026.socialSecurity.employerRate,
      pensionEmployee: socialSecurity.pensionEmployee,
      sicknessEmployee: socialSecurity.sicknessEmployee,
      assessmentBase: socialSecurity.assessmentBase,
      annualCeiling: CZECH_TAX_PARAMETERS_2026.socialSecurity.annualCeiling,
    },
    healthInsurance: {
      employee: healthInsurance.employee,
      employer: healthInsurance.employer,
      employeeRate: CZECH_TAX_PARAMETERS_2026.healthInsurance.employeeRate,
      employerRate: CZECH_TAX_PARAMETERS_2026.healthInsurance.employerRate,
      assessmentBase: healthInsurance.assessmentBase,
    },
    taxReliefs: {
      numberOfChildren: normalizedChildren,
      hasSpouseCredit: taxReliefs.hasSpouseCredit,
    },
  };

  return {
    country: "CZ",
    currency: "CZK",
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
      frequency: payFrequency,
    },
    breakdown,
  };
}

export const CZCalculator: CountryCalculator = {
  countryCode: "CZ",
  config: CZ_CONFIG,

  calculate(inputs: CalculatorInputs): CalculationResult {
    if (inputs.country !== "CZ") {
      throw new Error("CZCalculator can only calculate CZ inputs");
    }

    return calculateCZ(inputs);
  },

  getRegions(): RegionInfo[] {
    return [];
  },

  getContributionLimits(inputs?: Partial<CalculatorInputs>): ContributionLimits {
    const czInputs = inputs as Partial<CZCalculatorInputs> | undefined;
    const grossSalary = Math.max(0, czInputs?.grossSalary ?? 720_000);
    const isResident = (czInputs?.residencyType ?? "resident") === "resident";

    return {
      retirementSavingsContribution: {
        limit: isResident
          ? CZECH_TAX_PARAMETERS_2026.deductions.retirementProductsLimit
          : 0,
        name: "Tax-Supported Retirement Products",
        description:
          "Own contributions to supported retirement, long-term investment, life insurance, or long-term care products, capped at CZK 48,000.",
        preTax: true,
      },
      charitableDonations: {
        limit: isResident
          ? grossSalary *
            CZECH_TAX_PARAMETERS_2026.deductions.charitableDonationMaxRate
          : 0,
        name: "Charitable Gifts",
        description:
          "Qualifying gifts deductible up to 30% of the tax base for 2026, subject to the statutory minimum threshold.",
        preTax: true,
      },
    };
  },

  getDefaultInputs(): CZCalculatorInputs {
    return {
      country: "CZ",
      grossSalary: 720_000,
      payFrequency: "monthly",
      residencyType: "resident",
      contributions: {
        retirementSavingsContribution: 0,
        charitableDonations: 0,
      },
      taxReliefs: {
        numberOfChildren: 0,
        hasSpouseCredit: false,
      },
    };
  },
};
