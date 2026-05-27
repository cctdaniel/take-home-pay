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
  calculateCzechCompanyCarBenefit,
  calculateCzechDeductibleCharitableDonations,
  calculateCzechHealthInsurance,
  calculateCzechProgressiveIncomeTax,
  calculateCzechSocialSecurity,
  calculateCzechTaxableIncome,
  clampCzechAmount,
  CZECH_TAX_PARAMETERS_2026,
} from "./constants/tax-parameters-2026";
import type {
  CZBreakdown,
  CZCalculatorInputs,
  CZCompanyCarEmissionType,
  CZDisabilityCreditType,
  CZTaxBreakdown,
} from "./types";

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

function normalizeDisabilityCreditType(
  value?: CZDisabilityCreditType,
): CZDisabilityCreditType {
  return value === "basic" || value === "extended" ? value : "none";
}

function calculateDisabilityCredit(
  isResident: boolean,
  value?: CZDisabilityCreditType,
): number {
  if (!isResident) {
    return 0;
  }

  switch (normalizeDisabilityCreditType(value)) {
    case "basic":
      return CZECH_TAX_PARAMETERS_2026.credits.disabilityBasic;
    case "extended":
      return CZECH_TAX_PARAMETERS_2026.credits.disabilityExtended;
    default:
      return 0;
  }
}

function normalizeCompanyCarEmissionType(
  value?: CZCompanyCarEmissionType,
): CZCompanyCarEmissionType {
  return value === "lowEmission" || value === "zeroEmission"
    ? value
    : "standard";
}

export function calculateCZ(inputs: CZCalculatorInputs): CalculationResult {
  const {
    grossSalary,
    payFrequency,
    residencyType,
    benefits,
    contributions,
    taxReliefs,
  } = inputs;

  const cashGrossIncome = Math.max(0, grossSalary);
  const otherTaxableNonCashBenefits = Math.max(
    0,
    benefits?.otherTaxableNonCashBenefits || 0,
  );
  const companyCarEntryPrice = Math.max(
    0,
    benefits?.companyCarEntryPrice || 0,
  );
  const companyCarMonths = Math.min(
    Math.max(0, Math.floor(benefits?.companyCarMonths || 0)),
    12,
  );
  const companyCarEmissionType = normalizeCompanyCarEmissionType(
    benefits?.companyCarEmissionType,
  );
  const companyCarBenefit = calculateCzechCompanyCarBenefit({
    entryPrice: companyCarEntryPrice,
    emissionType: companyCarEmissionType,
    months: companyCarMonths,
  });
  const totalTaxableBenefits =
    otherTaxableNonCashBenefits + companyCarBenefit;
  const taxableEmploymentIncome = cashGrossIncome + totalTaxableBenefits;
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
        taxableEmploymentIncome,
        contributions.charitableDonations,
      )
    : 0;
  const totalModeledDeductions =
    retirementSavingsContribution + charitableDonations;

  const { taxableIncomeBeforeRounding, taxableIncome } =
    calculateCzechTaxableIncome(
      taxableEmploymentIncome,
      retirementSavingsContribution,
      charitableDonations,
    );
  const { totalTax: grossIncomeTax, bracketTaxes } =
    calculateCzechProgressiveIncomeTax(taxableIncome);

  const basicTaxpayerCredit =
    CZECH_TAX_PARAMETERS_2026.credits.basicTaxpayer;
  const spouseCredit =
    isResident && taxReliefs.hasSpouseCredit
      ? taxReliefs.hasSpouseZtpP
        ? CZECH_TAX_PARAMETERS_2026.credits.spouseZtpP
        : CZECH_TAX_PARAMETERS_2026.credits.spouse
      : 0;
  const disabilityCredit = calculateDisabilityCredit(
    isResident,
    taxReliefs.disabilityCreditType,
  );
  const ztpPCardCredit =
    isResident && taxReliefs.hasZtpPCard
      ? CZECH_TAX_PARAMETERS_2026.credits.ztpPCard
      : 0;
  const nonRefundablePersonalCredits =
    basicTaxpayerCredit + spouseCredit + disabilityCredit + ztpPCardCredit;
  const taxAfterNonRefundableCredits = Math.max(
    0,
    grossIncomeTax - nonRefundablePersonalCredits,
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
    taxableEmploymentIncome >=
      CZECH_TAX_PARAMETERS_2026.minimumAnnualIncomeForChildBonus &&
    potentialChildTaxBonus >=
      CZECH_TAX_PARAMETERS_2026.minimumAnnualChildBonus
      ? potentialChildTaxBonus
      : 0;
  const incomeTax = taxAfterNonRefundableCredits - childCreditAgainstTax;

  const socialSecurity = calculateCzechSocialSecurity(taxableEmploymentIncome);
  const healthInsurance = calculateCzechHealthInsurance(taxableEmploymentIncome);

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
  const netSalary = cashGrossIncome - totalDeductions;
  const effectiveTaxRate =
    cashGrossIncome > 0 ? totalTax / cashGrossIncome : 0;
  const periodsPerYear = getPeriodsPerYear(payFrequency);
  const higherRateTaxableIncome = Math.max(
    0,
    taxableIncome - CZECH_TAX_PARAMETERS_2026.annualTaxBandThreshold,
  );

  const breakdown: CZBreakdown = {
    type: "CZ",
    grossIncome: cashGrossIncome,
    cashGrossIncome,
    taxableEmploymentIncome,
    taxableBenefits: {
      otherTaxableNonCashBenefits,
      companyCarBenefit,
      companyCarEntryPrice,
      companyCarEmissionType,
      companyCarMonths,
      total: totalTaxableBenefits,
    },
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
      disabilityCredit,
      ztpPCardCredit,
      childCredit,
      childCreditAgainstTax,
      childTaxBonus,
      totalNonRefundableCredits:
        Math.min(grossIncomeTax, nonRefundablePersonalCredits) +
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
      hasSpouseZtpP: taxReliefs.hasSpouseZtpP,
      disabilityCreditType: normalizeDisabilityCreditType(
        taxReliefs.disabilityCreditType,
      ),
      hasZtpPCard: Boolean(taxReliefs.hasZtpPCard),
    },
  };

  return {
    country: "CZ",
    currency: "CZK",
    grossSalary: cashGrossIncome,
    taxableIncome,
    taxes,
    totalTax,
    totalDeductions,
    netSalary,
    effectiveTaxRate,
    perPeriod: {
      gross: cashGrossIncome / periodsPerYear,
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
    const otherTaxableNonCashBenefits = Math.max(
      0,
      czInputs?.benefits?.otherTaxableNonCashBenefits ?? 0,
    );
    const companyCarBenefit = calculateCzechCompanyCarBenefit({
      entryPrice: Math.max(0, czInputs?.benefits?.companyCarEntryPrice ?? 0),
      emissionType: normalizeCompanyCarEmissionType(
        czInputs?.benefits?.companyCarEmissionType,
      ),
      months: Math.min(
        Math.max(0, Math.floor(czInputs?.benefits?.companyCarMonths ?? 0)),
        12,
      ),
    });
    const taxableEmploymentIncome =
      grossSalary + otherTaxableNonCashBenefits + companyCarBenefit;
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
          ? taxableEmploymentIncome *
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
      benefits: {
        otherTaxableNonCashBenefits: 0,
        companyCarEntryPrice: 0,
        companyCarEmissionType: "standard",
        companyCarMonths: 0,
      },
      contributions: {
        retirementSavingsContribution: 0,
        charitableDonations: 0,
      },
      taxReliefs: {
        numberOfChildren: 0,
        hasSpouseCredit: false,
        hasSpouseZtpP: false,
        disabilityCreditType: "none",
        hasZtpPCard: false,
      },
    };
  },
};
