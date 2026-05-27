import {
  createStandardCountryCalculator,
  type StandardCountryCalculatorInputs,
  type StandardCountryTaxBreakdown,
} from "../shared/standard-country";
import type {
  CalculatorInputs,
  CalculationResult,
  CountryCalculator,
  PayFrequency,
  RegionInfo,
} from "../types";
import { RW_CONFIG } from "./config";
import {
  RW_CBHI_NET_SALARY_RATE,
  RW_MONTHS_PER_YEAR,
  RW_HOUSING_BENEFIT_RATE,
  RW_MATERNITY_EMPLOYEE_RATE,
  RW_MEDICAL_SCHEME_EMPLOYEE_RATE,
  RW_MOTOR_VEHICLE_BENEFIT_RATE,
  RW_PENSION_EMPLOYEE_RATE,
  RW_PENSION_VOLUNTARY_MEMBER_RATE,
  RW_TAX_CONFIG,
  getRwandaRssbContributionSalaryMonthly,
  getRwandaRssbMedicalBasicSalaryMonthly,
} from "./constants/tax-year-2026";
import type { RWBreakdown, RWCalculatorInputs, RWPensionCoverage, RWTaxBreakdown } from "./types";

const baseCalculator = createStandardCountryCalculator(
  RW_CONFIG,
  RW_TAX_CONFIG,
);

function normalizePensionCoverage(
  value: unknown,
): RWPensionCoverage {
  return value === "voluntaryMember" ? "voluntaryMember" : "employee";
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

function normalizeRWInputs(inputs: CalculatorInputs): RWCalculatorInputs {
  const standardInputs = inputs as StandardCountryCalculatorInputs<"RW"> &
    Partial<RWCalculatorInputs>;

  return {
    ...standardInputs,
    country: "RW",
    grossSalary: standardInputs.grossSalary,
    payFrequency: standardInputs.payFrequency,
    pensionCoverage: normalizePensionCoverage(standardInputs.pensionCoverage),
    rssbMedicalSchemeCovered: standardInputs.rssbMedicalSchemeCovered ?? false,
    rssbContributionSalaryMonthly: Math.max(
      0,
      standardInputs.rssbContributionSalaryMonthly ?? 0,
    ),
    rssbMedicalBasicSalaryMonthly: Math.max(
      0,
      standardInputs.rssbMedicalBasicSalaryMonthly ?? 0,
    ),
    hasHousingBenefit: standardInputs.hasHousingBenefit ?? false,
    hasMotorVehicleBenefit: standardInputs.hasMotorVehicleBenefit ?? false,
    otherTaxableBenefitsInKind: Math.max(
      0,
      standardInputs.otherTaxableBenefitsInKind ?? 0,
    ),
    contributions: {
      retirementContribution:
        standardInputs.contributions?.retirementContribution ?? 0,
      qualifyingExpenses: standardInputs.contributions?.qualifyingExpenses ?? 0,
    },
  };
}

function getRWDefaultInputs(): RWCalculatorInputs {
  return {
    country: "RW",
    grossSalary: RW_TAX_CONFIG.defaultSalary,
    payFrequency: "monthly",
    pensionCoverage: "employee",
    rssbMedicalSchemeCovered: false,
    rssbContributionSalaryMonthly: 0,
    rssbMedicalBasicSalaryMonthly: 0,
    hasHousingBenefit: false,
    hasMotorVehicleBenefit: false,
    otherTaxableBenefitsInKind: 0,
    contributions: {
      retirementContribution: 0,
      qualifyingExpenses: 0,
    },
  };
}

function calculateTaxableBenefitsInKind(inputs: RWCalculatorInputs) {
  const cashSalary = Math.max(0, inputs.grossSalary);
  const housing = inputs.hasHousingBenefit
    ? roundCurrency(cashSalary * RW_HOUSING_BENEFIT_RATE)
    : 0;
  const motorVehicle = inputs.hasMotorVehicleBenefit
    ? roundCurrency(cashSalary * RW_MOTOR_VEHICLE_BENEFIT_RATE)
    : 0;
  const other = roundCurrency(Math.max(0, inputs.otherTaxableBenefitsInKind));

  return {
    housing,
    motorVehicle,
    other,
    total: roundCurrency(housing + motorVehicle + other),
  };
}

function calculateMandatoryContributions(
  cashSalary: number,
  incomeTax: number,
  inputs: RWCalculatorInputs,
): RWBreakdown["mandatoryContributions"] {
  const pensionRate =
    inputs.pensionCoverage === "voluntaryMember"
      ? RW_PENSION_VOLUNTARY_MEMBER_RATE
      : RW_PENSION_EMPLOYEE_RATE;
  const rssbContributionSalaryMonthly = getRwandaRssbContributionSalaryMonthly({
    grossSalary: cashSalary,
    inputs,
  });
  const rssbContributionSalaryAnnual =
    rssbContributionSalaryMonthly * RW_MONTHS_PER_YEAR;
  const rssbMedicalBasicSalaryMonthly =
    getRwandaRssbMedicalBasicSalaryMonthly({
      grossSalary: cashSalary,
      inputs,
    });
  const rssbMedicalBasicSalaryAnnual =
    rssbMedicalBasicSalaryMonthly * RW_MONTHS_PER_YEAR;
  const pensionContribution = roundCurrency(
    rssbContributionSalaryAnnual * pensionRate,
  );
  const maternityContribution = roundCurrency(
    rssbContributionSalaryAnnual * RW_MATERNITY_EMPLOYEE_RATE,
  );
  const medicalContribution = inputs.rssbMedicalSchemeCovered
    ? roundCurrency(
        rssbMedicalBasicSalaryAnnual * RW_MEDICAL_SCHEME_EMPLOYEE_RATE,
      )
    : 0;
  const contributions: RWBreakdown["mandatoryContributions"] = [
    {
      name:
        inputs.pensionCoverage === "voluntaryMember"
          ? "RSSB voluntary pension member contribution"
          : "RSSB pension employee contribution",
      amount: pensionContribution,
      rate: pensionRate,
      preTax: false,
    },
    {
      name: "RSSB maternity leave contribution",
      amount: maternityContribution,
      rate: RW_MATERNITY_EMPLOYEE_RATE,
      preTax: false,
    },
  ];

  if (medicalContribution > 0) {
    contributions.push({
      name: "RSSB medical scheme employee contribution",
      amount: medicalContribution,
      rate: RW_MEDICAL_SCHEME_EMPLOYEE_RATE,
      preTax: false,
    });
  }

  const priorContributions = contributions.reduce(
    (sum, contribution) => sum + contribution.amount,
    0,
  );
  const cbhiContribution = roundCurrency(
    Math.max(0, cashSalary - incomeTax - priorContributions) *
      RW_CBHI_NET_SALARY_RATE,
  );

  if (cbhiContribution > 0) {
    contributions.push({
      name: "CBHI health contribution",
      amount: cbhiContribution,
      rate: RW_CBHI_NET_SALARY_RATE,
      preTax: false,
    });
  }

  return contributions;
}

function calculateRWResult(inputs: RWCalculatorInputs): CalculationResult {
  const cashSalary = Math.max(0, inputs.grossSalary);
  const taxableBenefitsInKind = calculateTaxableBenefitsInKind(inputs);
  const cashResult = baseCalculator.calculate({
    ...inputs,
    grossSalary: cashSalary,
  });
  const taxBaseResult = baseCalculator.calculate({
    ...inputs,
    grossSalary: cashSalary + taxableBenefitsInKind.total,
  });
  const cashTaxes = cashResult.taxes as StandardCountryTaxBreakdown<"RW">;
  const taxBaseTaxes =
    taxBaseResult.taxes as StandardCountryTaxBreakdown<"RW">;
  const incomeTax = taxBaseTaxes.incomeTax;
  const mandatoryContributions = calculateMandatoryContributions(
    cashSalary,
    incomeTax,
    inputs,
  );
  const socialContributions = roundCurrency(
    mandatoryContributions.reduce(
      (sum, contribution) => sum + contribution.amount,
      0,
    ),
  );
  const totalTax = roundCurrency(incomeTax + socialContributions);
  const netSalary = roundCurrency(cashSalary - totalTax);
  const periodsPerYear = getPeriodsPerYear(inputs.payFrequency);
  const taxes = {
    ...taxBaseTaxes,
    incomeTax,
    totalIncomeTax: incomeTax,
    socialContributions,
    cashIncomeTax: cashTaxes.incomeTax,
    benefitsInKindTaxEffect: roundCurrency(incomeTax - cashTaxes.incomeTax),
  } satisfies RWTaxBreakdown;
  const breakdown = {
    ...(taxBaseResult.breakdown as RWBreakdown),
    grossIncome: cashSalary,
    cashSalary,
    cashTaxableIncome: cashResult.taxableIncome,
    taxableIncome: taxBaseResult.taxableIncome,
    taxableBenefitsInKind,
    rssbContributionSalaryMonthly: getRwandaRssbContributionSalaryMonthly({
      grossSalary: cashSalary,
      inputs,
    }),
    rssbMedicalBasicSalaryMonthly: getRwandaRssbMedicalBasicSalaryMonthly({
      grossSalary: cashSalary,
      inputs,
    }),
    mandatoryContributions,
  } satisfies RWBreakdown;

  return {
    ...taxBaseResult,
    grossSalary: cashSalary,
    taxableIncome: taxBaseResult.taxableIncome,
    taxes,
    totalTax,
    totalDeductions: totalTax,
    netSalary,
    effectiveTaxRate: cashSalary > 0 ? totalTax / cashSalary : 0,
    perPeriod: {
      gross: cashSalary / periodsPerYear,
      net: netSalary / periodsPerYear,
      frequency: inputs.payFrequency,
    },
    breakdown,
  };
}

export const RWCalculator: CountryCalculator = {
  ...baseCalculator,

  calculate(inputs: CalculatorInputs) {
    if (inputs.country !== "RW") {
      throw new Error("RWCalculator can only calculate Rwanda inputs");
    }

    return calculateRWResult(normalizeRWInputs(inputs));
  },

  getRegions(): RegionInfo[] {
    return [];
  },

  getContributionLimits(inputs?: Partial<CalculatorInputs>) {
    const defaultInputs = getRWDefaultInputs();

    return baseCalculator.getContributionLimits(
      normalizeRWInputs({
        ...defaultInputs,
        ...inputs,
        contributions: {
          ...defaultInputs.contributions,
          ...(inputs as Partial<RWCalculatorInputs>)?.contributions,
        },
      } as CalculatorInputs),
    );
  },

  getDefaultInputs(): RWCalculatorInputs {
    return getRWDefaultInputs();
  },
};
