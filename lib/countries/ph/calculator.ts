import type {
  CalculationResult,
  CalculatorInputs,
  ContributionLimits,
  CountryCalculator,
  PayFrequency,
  PHBreakdown,
  PHCalculatorInputs,
  PHContributionInputs,
  PHTaxpayerType,
  PHTaxBreakdown,
  RegionInfo,
} from "../types";
import { PH_CONFIG } from "./config";
import {
  PH_13TH_MONTH_AND_OTHER_BENEFITS_EXEMPT_LIMIT,
  PH_DE_MINIMIS_BENEFIT_LIMITS_2026,
  PH_NRA_NOT_ENGAGED_TAX_RATE,
  calculatePHProgressiveTax,
  PH_PAGIBIG_2026,
  PH_PHILHEALTH_2026,
  PH_SSS_2026,
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
  return Math.round(value * 100) / 100;
}

function clampAmount(value: number | undefined, max = Infinity): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(Math.max(0, value ?? 0), max);
}

function resolveTaxpayerType(value?: PHTaxpayerType): PHTaxpayerType {
  return value ?? "residentOrNraEtb";
}

function get13thMonthExemptLimit(inputs: Partial<PHCalculatorInputs>): number {
  if (resolveTaxpayerType(inputs.taxpayerType) === "nraNotEngaged") {
    return 0;
  }

  return Math.min(
    Math.max(0, inputs.grossSalary ?? 0),
    PH_13TH_MONTH_AND_OTHER_BENEFITS_EXEMPT_LIMIT,
  );
}

function normalizePHInputs(inputs: PHCalculatorInputs): PHCalculatorInputs {
  const grossSalary = Math.max(0, inputs.grossSalary);
  const taxpayerType = resolveTaxpayerType(inputs.taxpayerType);
  const benefitLimit = get13thMonthExemptLimit({
    ...inputs,
    grossSalary,
    taxpayerType,
  });

  return {
    ...inputs,
    grossSalary,
    taxpayerType,
    sssCovered: inputs.sssCovered ?? true,
    philHealthCovered: inputs.philHealthCovered ?? true,
    pagIbigCovered: inputs.pagIbigCovered ?? true,
    contributions: {
      thirteenthMonthAndOtherBenefits: clampAmount(
        inputs.contributions?.thirteenthMonthAndOtherBenefits,
        benefitLimit,
      ),
      deMinimisMedicalCashAllowance: clampAmount(
        inputs.contributions?.deMinimisMedicalCashAllowance,
        taxpayerType === "nraNotEngaged"
          ? 0
          : PH_DE_MINIMIS_BENEFIT_LIMITS_2026.medicalCashAllowance,
      ),
      deMinimisRiceSubsidy: clampAmount(
        inputs.contributions?.deMinimisRiceSubsidy,
        taxpayerType === "nraNotEngaged"
          ? 0
          : PH_DE_MINIMIS_BENEFIT_LIMITS_2026.riceSubsidy,
      ),
      deMinimisUniformClothing: clampAmount(
        inputs.contributions?.deMinimisUniformClothing,
        taxpayerType === "nraNotEngaged"
          ? 0
          : PH_DE_MINIMIS_BENEFIT_LIMITS_2026.uniformClothing,
      ),
      deMinimisActualMedicalAssistance: clampAmount(
        inputs.contributions?.deMinimisActualMedicalAssistance,
        taxpayerType === "nraNotEngaged"
          ? 0
          : PH_DE_MINIMIS_BENEFIT_LIMITS_2026.actualMedicalAssistance,
      ),
      deMinimisLaundryAllowance: clampAmount(
        inputs.contributions?.deMinimisLaundryAllowance,
        taxpayerType === "nraNotEngaged"
          ? 0
          : PH_DE_MINIMIS_BENEFIT_LIMITS_2026.laundryAllowance,
      ),
      deMinimisAchievementAwards: clampAmount(
        inputs.contributions?.deMinimisAchievementAwards,
        taxpayerType === "nraNotEngaged"
          ? 0
          : PH_DE_MINIMIS_BENEFIT_LIMITS_2026.achievementAwards,
      ),
      deMinimisChristmasGifts: clampAmount(
        inputs.contributions?.deMinimisChristmasGifts,
        taxpayerType === "nraNotEngaged"
          ? 0
          : PH_DE_MINIMIS_BENEFIT_LIMITS_2026.christmasGifts,
      ),
      deMinimisCbaProductivityIncentives: clampAmount(
        inputs.contributions?.deMinimisCbaProductivityIncentives,
        taxpayerType === "nraNotEngaged"
          ? 0
          : PH_DE_MINIMIS_BENEFIT_LIMITS_2026.cbaProductivityIncentives,
      ),
    },
  };
}

function getDeMinimisBenefitsExempt(contributions: PHContributionInputs) {
  const medicalCashAllowance = contributions.deMinimisMedicalCashAllowance;
  const riceSubsidy = contributions.deMinimisRiceSubsidy;
  const uniformClothing = contributions.deMinimisUniformClothing;
  const actualMedicalAssistance =
    contributions.deMinimisActualMedicalAssistance;
  const laundryAllowance = contributions.deMinimisLaundryAllowance;
  const achievementAwards = contributions.deMinimisAchievementAwards;
  const christmasGifts = contributions.deMinimisChristmasGifts;
  const cbaProductivityIncentives =
    contributions.deMinimisCbaProductivityIncentives;
  const total =
    medicalCashAllowance +
    riceSubsidy +
    uniformClothing +
    actualMedicalAssistance +
    laundryAllowance +
    achievementAwards +
    christmasGifts +
    cbaProductivityIncentives;

  return {
    medicalCashAllowance,
    riceSubsidy,
    uniformClothing,
    actualMedicalAssistance,
    laundryAllowance,
    achievementAwards,
    christmasGifts,
    cbaProductivityIncentives,
    total,
  };
}

function calculateSSS(monthlySalary: number) {
  if (monthlySalary <= 0) {
    return {
      rate: PH_SSS_2026.employeeRate,
      employee: 0,
      msc: 0,
      minMsc: PH_SSS_2026.minMsc,
      maxMsc: PH_SSS_2026.maxMsc,
    };
  }

  const msc = Math.min(
    PH_SSS_2026.maxMsc,
    Math.max(
      PH_SSS_2026.minMsc,
      Math.round(monthlySalary / 500) * 500,
    ),
  );
  const monthly = roundCurrency(msc * PH_SSS_2026.employeeRate);

  return {
    rate: PH_SSS_2026.employeeRate,
    employee: monthly * 12,
    msc,
    minMsc: PH_SSS_2026.minMsc,
    maxMsc: PH_SSS_2026.maxMsc,
  };
}

function calculatePhilHealth(monthlySalary: number) {
  if (monthlySalary <= 0) {
    return {
      rate: PH_PHILHEALTH_2026.employeeRate,
      employee: 0,
      monthlyBase: 0,
      floor: PH_PHILHEALTH_2026.monthlyFloor,
      ceiling: PH_PHILHEALTH_2026.monthlyCeiling,
    };
  }

  const monthlyBase = Math.max(
    PH_PHILHEALTH_2026.monthlyFloor,
    Math.min(monthlySalary, PH_PHILHEALTH_2026.monthlyCeiling)
  );
  // PhilHealth premium is shared equally - employee pays 2.5%
  const monthly = roundCurrency(monthlyBase * PH_PHILHEALTH_2026.employeeRate);

  return {
    rate: PH_PHILHEALTH_2026.employeeRate,
    employee: monthly * 12,
    monthlyBase,
    floor: PH_PHILHEALTH_2026.monthlyFloor,
    ceiling: PH_PHILHEALTH_2026.monthlyCeiling,
  };
}

function calculatePagIbig(monthlySalary: number) {
  if (monthlySalary <= 0) {
    return {
      rate: PH_PAGIBIG_2026.employeeRate,
      employee: 0,
      mfs: 0,
      ceiling: PH_PAGIBIG_2026.mfsCeiling,
    };
  }

  const mfs = Math.min(monthlySalary, PH_PAGIBIG_2026.mfsCeiling);
  const rate =
    monthlySalary <= PH_PAGIBIG_2026.lowSalaryThreshold
      ? PH_PAGIBIG_2026.lowSalaryEmployeeRate
      : PH_PAGIBIG_2026.employeeRate;
  const monthly = roundCurrency(mfs * rate);

  return {
    rate,
    employee: monthly * 12,
    mfs,
    ceiling: PH_PAGIBIG_2026.mfsCeiling,
  };
}

export function calculatePH(inputs: PHCalculatorInputs): CalculationResult {
  const normalizedInputs = normalizePHInputs(inputs);
  const { grossSalary, payFrequency, taxpayerType } = normalizedInputs;
  const monthlySalary = grossSalary / 12;

  const sss = normalizedInputs.sssCovered
    ? calculateSSS(monthlySalary)
    : {
        rate: PH_SSS_2026.employeeRate,
        employee: 0,
        msc: 0,
        minMsc: PH_SSS_2026.minMsc,
        maxMsc: PH_SSS_2026.maxMsc,
      };
  const philHealth = normalizedInputs.philHealthCovered
    ? calculatePhilHealth(monthlySalary)
    : {
        rate: PH_PHILHEALTH_2026.employeeRate,
        employee: 0,
        monthlyBase: 0,
        floor: PH_PHILHEALTH_2026.monthlyFloor,
        ceiling: PH_PHILHEALTH_2026.monthlyCeiling,
      };
  const pagIbig = normalizedInputs.pagIbigCovered
    ? calculatePagIbig(monthlySalary)
    : {
        rate: PH_PAGIBIG_2026.employeeRate,
        employee: 0,
        mfs: 0,
        ceiling: PH_PAGIBIG_2026.mfsCeiling,
      };

  const totalMandatoryContributions =
    sss.employee + philHealth.employee + pagIbig.employee;
  const thirteenthMonthAndOtherBenefitsExempt =
    normalizedInputs.contributions.thirteenthMonthAndOtherBenefits;
  const deMinimisBenefitsExempt = getDeMinimisBenefitsExempt(
    normalizedInputs.contributions,
  );
  const mandatoryContributionsTaxDeductible =
    taxpayerType !== "nraNotEngaged";

  const taxableIncome =
    taxpayerType === "nraNotEngaged"
      ? grossSalary
      : Math.max(
          0,
          grossSalary -
            thirteenthMonthAndOtherBenefitsExempt -
            deMinimisBenefitsExempt.total -
            totalMandatoryContributions,
        );

  const taxResult =
    taxpayerType === "nraNotEngaged"
      ? {
          totalTax: roundCurrency(grossSalary * PH_NRA_NOT_ENGAGED_TAX_RATE),
          bracketTaxes: [
            {
              min: 0,
              max: Infinity,
              rate: PH_NRA_NOT_ENGAGED_TAX_RATE,
              tax: roundCurrency(grossSalary * PH_NRA_NOT_ENGAGED_TAX_RATE),
            },
          ],
        }
      : calculatePHProgressiveTax(taxableIncome);

  const taxes: PHTaxBreakdown = {
    type: "PH",
    totalIncomeTax: taxResult.totalTax + totalMandatoryContributions,
    incomeTax: taxResult.totalTax,
    sssEmployee: sss.employee,
    philHealthEmployee: philHealth.employee,
    pagIbigEmployee: pagIbig.employee,
  };

  const totalTax =
    taxResult.totalTax +
    sss.employee +
    philHealth.employee +
    pagIbig.employee;
  const netSalary = grossSalary - totalTax;
  const effectiveTaxRate = grossSalary > 0 ? totalTax / grossSalary : 0;
  const periodsPerYear = getPeriodsPerYear(payFrequency);

  const breakdown: PHBreakdown = {
    type: "PH",
    grossIncome: grossSalary,
    taxableIncome,
    taxpayerType,
    thirteenthMonthAndOtherBenefitsExempt,
    deMinimisBenefitsExempt,
    mandatoryContributionsTaxDeductible,
    sss,
    philHealth,
    pagIbig,
    bracketTaxes: taxResult.bracketTaxes,
  };

  return {
    country: "PH",
    currency: "PHP",
    grossSalary,
    taxableIncome,
    taxes,
    totalTax,
    totalDeductions: totalTax,
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

export const PHCalculator: CountryCalculator = {
  countryCode: "PH",
  config: PH_CONFIG,

  calculate(inputs: CalculatorInputs): CalculationResult {
    if (inputs.country !== "PH") {
      throw new Error("PHCalculator can only calculate PH inputs");
    }
    return calculatePH(inputs as PHCalculatorInputs);
  },

  getRegions(): RegionInfo[] {
    return [];
  },

  getContributionLimits(inputs?: Partial<CalculatorInputs>): ContributionLimits {
    const phInputs = {
      ...this.getDefaultInputs(),
      ...inputs,
    } as Partial<PHCalculatorInputs>;
    const limit = get13thMonthExemptLimit(phInputs);

    if (limit <= 0) {
      return {};
    }

    return {
      thirteenthMonthAndOtherBenefits: {
        limit,
        name: "13th month and other benefits exclusion",
        description:
          "Tax-exempt 13th month pay and other benefits, capped at PHP 90,000 per year for ordinary compensation income.",
        preTax: true,
      },
      deMinimisMedicalCashAllowance: {
        limit: PH_DE_MINIMIS_BENEFIT_LIMITS_2026.medicalCashAllowance,
        name: "Medical cash allowance to dependents",
        description:
          "BIR RR 29-2025 de minimis medical cash allowance cap: PHP 2,000 per semester.",
        preTax: true,
      },
      deMinimisRiceSubsidy: {
        limit: PH_DE_MINIMIS_BENEFIT_LIMITS_2026.riceSubsidy,
        name: "Rice subsidy",
        description:
          "BIR RR 29-2025 de minimis rice subsidy cap: PHP 2,500 per month.",
        preTax: true,
      },
      deMinimisUniformClothing: {
        limit: PH_DE_MINIMIS_BENEFIT_LIMITS_2026.uniformClothing,
        name: "Uniform and clothing allowance",
        description:
          "BIR RR 29-2025 de minimis uniform and clothing allowance cap: PHP 8,000 per year.",
        preTax: true,
      },
      deMinimisActualMedicalAssistance: {
        limit: PH_DE_MINIMIS_BENEFIT_LIMITS_2026.actualMedicalAssistance,
        name: "Actual medical assistance",
        description:
          "BIR RR 29-2025 de minimis annual medical/healthcare benefit cap.",
        preTax: true,
      },
      deMinimisLaundryAllowance: {
        limit: PH_DE_MINIMIS_BENEFIT_LIMITS_2026.laundryAllowance,
        name: "Laundry allowance",
        description:
          "BIR RR 29-2025 de minimis laundry allowance cap: PHP 400 per month.",
        preTax: true,
      },
      deMinimisAchievementAwards: {
        limit: PH_DE_MINIMIS_BENEFIT_LIMITS_2026.achievementAwards,
        name: "Achievement awards",
        description:
          "BIR RR 29-2025 tangible personal-property achievement award cap.",
        preTax: true,
      },
      deMinimisChristmasGifts: {
        limit: PH_DE_MINIMIS_BENEFIT_LIMITS_2026.christmasGifts,
        name: "Christmas / major anniversary gifts",
        description:
          "BIR RR 29-2025 Christmas or major anniversary gift cap.",
        preTax: true,
      },
      deMinimisCbaProductivityIncentives: {
        limit: PH_DE_MINIMIS_BENEFIT_LIMITS_2026.cbaProductivityIncentives,
        name: "CBA productivity incentives",
        description:
          "BIR RR 29-2025 collective-bargaining/productivity incentive cap.",
        preTax: true,
      },
    };
  },

  getDefaultInputs(): PHCalculatorInputs {
    return {
      country: "PH",
      grossSalary: 600_000,
      payFrequency: "monthly",
      taxpayerType: "residentOrNraEtb",
      sssCovered: true,
      philHealthCovered: true,
      pagIbigCovered: true,
      contributions: {
        thirteenthMonthAndOtherBenefits: 0,
        deMinimisMedicalCashAllowance: 0,
        deMinimisRiceSubsidy: 0,
        deMinimisUniformClothing: 0,
        deMinimisActualMedicalAssistance: 0,
        deMinimisLaundryAllowance: 0,
        deMinimisAchievementAwards: 0,
        deMinimisChristmasGifts: 0,
        deMinimisCbaProductivityIncentives: 0,
      },
    };
  },
};
