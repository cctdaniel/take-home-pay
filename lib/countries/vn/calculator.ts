import type {
  CalculationResult,
  CalculatorInputs,
  ContributionLimits,
  CountryCalculator,
  PayFrequency,
  RegionInfo,
  VNBreakdown,
  VNCalculatorInputs,
  VNInsuranceCoverage,
  VNTaxBreakdown,
} from "../types";
import { VN_CONFIG } from "./config";
import {
  calculateVNProgressiveTax,
  VN_DEPENDENT_DEDUCTION_ANNUAL,
  VN_NON_RESIDENT_EMPLOYMENT_TAX_RATE,
  VN_PERSONAL_DEDUCTION_ANNUAL,
  VN_SOCIAL_INSURANCE_2026,
  VN_VOLUNTARY_PENSION_DEDUCTION_ANNUAL_CAP,
} from "./constants/tax-parameters-2026";

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
  return Math.round(value);
}

function normalizeVNInputs(inputs: VNCalculatorInputs): VNCalculatorInputs {
  return {
    ...inputs,
    residencyStatus: inputs.residencyStatus ?? "resident",
    insuranceCoverage: inputs.insuranceCoverage ?? "vietnameseEmployee",
    numberOfDependents: Math.min(
      Math.max(Math.floor(inputs.numberOfDependents ?? 0), 0),
      10,
    ),
    contributions: {
      voluntaryPensionContribution: Math.max(
        0,
        inputs.contributions?.voluntaryPensionContribution ?? 0,
      ),
      charitableDonations: Math.max(
        0,
        inputs.contributions?.charitableDonations ?? 0,
      ),
    },
  };
}

function calculateSocialInsurance(
  monthlySalary: number,
  insuranceCoverage: VNInsuranceCoverage,
) {
  const si = VN_SOCIAL_INSURANCE_2026;
  const ceiling = si.baseSalary * si.ceilingMultiplier;
  const cappedMonthly = Math.min(monthlySalary, ceiling);
  const isCovered = insuranceCoverage !== "exempt";
  const hasUnemploymentInsurance = insuranceCoverage === "vietnameseEmployee";

  const socialMonthly = isCovered
    ? roundCurrency(cappedMonthly * si.socialInsuranceRate)
    : 0;
  const healthMonthly = isCovered
    ? roundCurrency(cappedMonthly * si.healthInsuranceRate)
    : 0;
  const unemploymentMonthly = roundCurrency(
    hasUnemploymentInsurance
      ? Math.min(monthlySalary, si.regionalMinimumWageTier1 * 20) *
          si.unemploymentInsuranceRate
      : 0,
  );

  return {
    socialInsurance: {
      rate: si.socialInsuranceRate,
      employee: socialMonthly * 12,
      ceiling,
    },
    healthInsurance: {
      rate: si.healthInsuranceRate,
      employee: healthMonthly * 12,
      ceiling,
    },
    unemploymentInsurance: {
      rate: si.unemploymentInsuranceRate,
      employee: unemploymentMonthly * 12,
      ceiling: si.regionalMinimumWageTier1 * 20,
    },
  };
}

function calculateVoluntaryDeductions({
  inputs,
  preVoluntaryTaxableBase,
  isResident,
}: {
  inputs: VNCalculatorInputs;
  preVoluntaryTaxableBase: number;
  isResident: boolean;
}) {
  if (!isResident) {
    return {
      voluntaryPensionContribution: 0,
      charitableDonations: 0,
      total: 0,
      limits: {
        voluntaryPensionContribution: 0,
        charitableDonations: 0,
      },
    };
  }

  const voluntaryPensionLimit = Math.min(
    VN_VOLUNTARY_PENSION_DEDUCTION_ANNUAL_CAP,
    Math.max(0, preVoluntaryTaxableBase),
  );
  const voluntaryPensionContribution = Math.min(
    inputs.contributions.voluntaryPensionContribution,
    voluntaryPensionLimit,
  );
  const charitableDonationsLimit = Math.max(
    0,
    preVoluntaryTaxableBase - voluntaryPensionContribution,
  );
  const charitableDonations = Math.min(
    inputs.contributions.charitableDonations,
    charitableDonationsLimit,
  );

  return {
    voluntaryPensionContribution: roundCurrency(voluntaryPensionContribution),
    charitableDonations: roundCurrency(charitableDonations),
    total: roundCurrency(voluntaryPensionContribution + charitableDonations),
    limits: {
      voluntaryPensionContribution: roundCurrency(voluntaryPensionLimit),
      charitableDonations: roundCurrency(charitableDonationsLimit),
    },
  };
}

export function calculateVN(inputs: VNCalculatorInputs): CalculationResult {
  const normalizedInputs = normalizeVNInputs(inputs);
  const {
    grossSalary,
    payFrequency,
    numberOfDependents,
    residencyStatus,
    insuranceCoverage,
  } = normalizedInputs;
  const monthlySalary = grossSalary / 12;

  const socialInsurance = calculateSocialInsurance(
    monthlySalary,
    insuranceCoverage,
  );

  const totalSocialInsurance =
    socialInsurance.socialInsurance.employee +
    socialInsurance.healthInsurance.employee +
    socialInsurance.unemploymentInsurance.employee;

  const isResident = residencyStatus === "resident";
  const personalDeduction = isResident ? VN_PERSONAL_DEDUCTION_ANNUAL : 0;
  const dependentDeduction =
    isResident
      ? Math.max(0, numberOfDependents) * VN_DEPENDENT_DEDUCTION_ANNUAL
      : 0;
  const familyDeductions = personalDeduction + dependentDeduction;
  const preVoluntaryTaxableBase = Math.max(
    0,
    grossSalary - totalSocialInsurance - familyDeductions,
  );
  const voluntaryDeductions = calculateVoluntaryDeductions({
    inputs: normalizedInputs,
    preVoluntaryTaxableBase,
    isResident,
  });

  const taxableIncome = Math.max(
    0,
    Math.round(
      isResident
        ? preVoluntaryTaxableBase - voluntaryDeductions.total
        : grossSalary,
    ),
  );

  const taxResult = isResident
    ? calculateVNProgressiveTax(taxableIncome)
    : {
        totalTax: Math.round(
          taxableIncome * VN_NON_RESIDENT_EMPLOYMENT_TAX_RATE,
        ),
        bracketTaxes:
          taxableIncome > 0
            ? [
                {
                  min: 0,
                  max: Infinity,
                  rate: VN_NON_RESIDENT_EMPLOYMENT_TAX_RATE,
                  tax: Math.round(
                    taxableIncome * VN_NON_RESIDENT_EMPLOYMENT_TAX_RATE,
                  ),
                },
              ]
            : [],
      };

  const taxes: VNTaxBreakdown = {
    type: "VN",
    totalIncomeTax: taxResult.totalTax + totalSocialInsurance,
    incomeTax: taxResult.totalTax,
    socialInsurance: socialInsurance.socialInsurance.employee,
    healthInsurance: socialInsurance.healthInsurance.employee,
    unemploymentInsurance: socialInsurance.unemploymentInsurance.employee,
  };

  const totalTax = taxResult.totalTax + totalSocialInsurance;
  const netSalary = grossSalary - totalTax - voluntaryDeductions.total;
  const effectiveTaxRate = grossSalary > 0 ? totalTax / grossSalary : 0;
  const periodsPerYear = getPeriodsPerYear(payFrequency);

  const breakdown: VNBreakdown = {
    type: "VN",
    grossIncome: grossSalary,
    residencyStatus,
    insuranceCoverage,
    personalDeduction,
    dependentDeduction,
    numberOfDependents: isResident ? Math.max(0, numberOfDependents) : 0,
    totalDeductions: familyDeductions + voluntaryDeductions.total,
    voluntaryDeductions: {
      voluntaryPensionContribution:
        voluntaryDeductions.voluntaryPensionContribution,
      charitableDonations: voluntaryDeductions.charitableDonations,
      total: voluntaryDeductions.total,
    },
    taxableIncome,
    socialInsurance: socialInsurance.socialInsurance,
    healthInsurance: socialInsurance.healthInsurance,
    unemploymentInsurance: socialInsurance.unemploymentInsurance,
    bracketTaxes: taxResult.bracketTaxes,
  };

  return {
    country: "VN",
    currency: "VND",
    grossSalary,
    taxableIncome,
    taxes,
    totalTax,
    totalDeductions: totalTax + voluntaryDeductions.total,
    netSalary,
    effectiveTaxRate,
    perPeriod: {
      gross: grossSalary / periodsPerYear,
      net: netSalary / periodsPerYear,
      frequency: payFrequency,
    },
    breakdown,
  };
}

export const VNCalculator: CountryCalculator = {
  countryCode: "VN",
  config: VN_CONFIG,

  calculate(inputs: CalculatorInputs): CalculationResult {
    if (inputs.country !== "VN") {
      throw new Error("VNCalculator can only calculate VN inputs");
    }
    return calculateVN(inputs as VNCalculatorInputs);
  },

  getRegions(): RegionInfo[] {
    return [];
  },

  getContributionLimits(inputs?: Partial<CalculatorInputs>): ContributionLimits {
    const defaultInputs = this.getDefaultInputs() as VNCalculatorInputs;
    const normalizedInputs = normalizeVNInputs({
      ...defaultInputs,
      ...inputs,
      contributions: {
        ...defaultInputs.contributions,
        ...(inputs as Partial<VNCalculatorInputs>)?.contributions,
      },
    } as VNCalculatorInputs);
    const monthlySalary = normalizedInputs.grossSalary / 12;
    const socialInsurance = calculateSocialInsurance(
      monthlySalary,
      normalizedInputs.insuranceCoverage,
    );
    const totalSocialInsurance =
      socialInsurance.socialInsurance.employee +
      socialInsurance.healthInsurance.employee +
      socialInsurance.unemploymentInsurance.employee;
    const isResident = normalizedInputs.residencyStatus === "resident";
    const personalDeduction = isResident ? VN_PERSONAL_DEDUCTION_ANNUAL : 0;
    const dependentDeduction = isResident
      ? normalizedInputs.numberOfDependents * VN_DEPENDENT_DEDUCTION_ANNUAL
      : 0;
    const preVoluntaryTaxableBase = Math.max(
      0,
      normalizedInputs.grossSalary -
        totalSocialInsurance -
        personalDeduction -
        dependentDeduction,
    );
    const voluntaryDeductions = calculateVoluntaryDeductions({
      inputs: normalizedInputs,
      preVoluntaryTaxableBase,
      isResident,
    });

    return {
      voluntaryPensionContribution: {
        limit: voluntaryDeductions.limits.voluntaryPensionContribution,
        name: "Voluntary Pension Contribution",
        description:
          "Resident salary deduction for voluntary or supplementary pension products, modeled with the current VND 1,000,000/month cap pending final 2026 implementing guidance.",
        preTax: true,
      },
      charitableDonations: {
        limit: voluntaryDeductions.limits.charitableDonations,
        name: "Approved Charity / Humanitarian Contributions",
        description:
          "Resident deduction for approved charitable, humanitarian, study-promotion, or legally established fundraising organizations, capped here to the remaining taxable salary base.",
        preTax: true,
      },
    };
  },

  getDefaultInputs(): VNCalculatorInputs {
    return {
      country: "VN",
      grossSalary: 240_000_000,
      payFrequency: "monthly",
      residencyStatus: "resident",
      insuranceCoverage: "vietnameseEmployee",
      numberOfDependents: 0,
      contributions: {
        voluntaryPensionContribution: 0,
        charitableDonations: 0,
      },
    };
  },
};
