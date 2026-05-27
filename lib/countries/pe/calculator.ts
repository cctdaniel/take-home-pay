import {
  calculateStandardCountry,
  createStandardCountryCalculator,
  type StandardCountryContributionRule,
  type StandardCountryCalculatorInputs,
  type StandardCountryTaxConfig,
} from "../shared/standard-country";
import type {
  CalculationResult,
  CalculatorInputs,
  CountryCalculator,
  RegionInfo,
} from "../types";
import { PE_CONFIG } from "./config";
import {
  PE_AFP_ANNUAL_INSURANCE_CAP,
  PE_AFP_INSURANCE_RATE,
  PE_AFP_MANDATORY_FUND_RATE,
  PE_ONP_CONTRIBUTION_RATE,
  PE_TAX_CONFIG,
  getPEGratificationBonusRate,
  getPEPensionSystem,
} from "./constants/tax-year-2026";
import type { PEBreakdown, PECalculatorInputs } from "./types";

const baseCalculator = createStandardCountryCalculator(
  PE_CONFIG,
  PE_TAX_CONFIG,
);

function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}

function getPEDefaultInputs(): PECalculatorInputs {
  return {
    country: "PE",
    grossSalary: PE_TAX_CONFIG.defaultSalary,
    payFrequency: "monthly",
    salaryPackageMode: "includedInGross",
    gratificationHealthCoverage: "essalud",
    pensionSystem: "onp",
    afpCommissionMode: "flow",
    contributions: {
      retirementContribution: 0,
      qualifyingExpenses: 0,
    },
  };
}

function normalizePEInputs(inputs: CalculatorInputs): PECalculatorInputs {
  const standardInputs = inputs as StandardCountryCalculatorInputs<"PE"> &
    Partial<PECalculatorInputs>;
  const defaultInputs = getPEDefaultInputs();

  return {
    ...defaultInputs,
    ...standardInputs,
    country: "PE",
    grossSalary: standardInputs.grossSalary,
    payFrequency: standardInputs.payFrequency,
    salaryPackageMode:
      standardInputs.salaryPackageMode ?? defaultInputs.salaryPackageMode,
    gratificationHealthCoverage:
      standardInputs.gratificationHealthCoverage ??
      defaultInputs.gratificationHealthCoverage,
    pensionSystem: standardInputs.pensionSystem ?? defaultInputs.pensionSystem,
    afpCommissionMode:
      standardInputs.afpCommissionMode ?? defaultInputs.afpCommissionMode,
    contributions: {
      ...defaultInputs.contributions,
      ...standardInputs.contributions,
    },
  };
}

function buildPEPayrollContext(inputs: PECalculatorInputs) {
  const enteredGrossSalary = Math.max(0, inputs.grossSalary);
  const gratificationBonusRate = getPEGratificationBonusRate(
    inputs.gratificationHealthCoverage,
  );

  if (inputs.salaryPackageMode === "includedInGross") {
    const monthlyRegularRemuneration =
      enteredGrossSalary / (14 + 2 * gratificationBonusRate);
    const regularRemuneration = monthlyRegularRemuneration * 12;
    const statutoryGratifications = monthlyRegularRemuneration * 2;
    const extraordinaryGratificationBonus =
      statutoryGratifications * gratificationBonusRate;

    return {
      enteredGrossSalary,
      grossIncome: roundCurrency(enteredGrossSalary),
      regularRemuneration: roundCurrency(regularRemuneration),
      statutoryGratifications: roundCurrency(statutoryGratifications),
      extraordinaryGratificationBonus: roundCurrency(
        extraordinaryGratificationBonus,
      ),
      pensionableRemuneration: roundCurrency(regularRemuneration),
      afpInsuranceBase: roundCurrency(
        Math.min(regularRemuneration, PE_AFP_ANNUAL_INSURANCE_CAP),
      ),
      afpInsuranceCap: PE_AFP_ANNUAL_INSURANCE_CAP,
    };
  }

  const regularRemuneration = enteredGrossSalary;
  const monthlyRegularRemuneration = regularRemuneration / 12;
  const statutoryGratifications =
    inputs.salaryPackageMode === "additionalToGross"
      ? monthlyRegularRemuneration * 2
      : 0;
  const extraordinaryGratificationBonus =
    statutoryGratifications * gratificationBonusRate;
  const grossIncome =
    regularRemuneration +
    statutoryGratifications +
    extraordinaryGratificationBonus;

  return {
    enteredGrossSalary,
    grossIncome: roundCurrency(grossIncome),
    regularRemuneration: roundCurrency(regularRemuneration),
    statutoryGratifications: roundCurrency(statutoryGratifications),
    extraordinaryGratificationBonus: roundCurrency(
      extraordinaryGratificationBonus,
    ),
    pensionableRemuneration: roundCurrency(regularRemuneration),
    afpInsuranceBase: roundCurrency(
      Math.min(regularRemuneration, PE_AFP_ANNUAL_INSURANCE_CAP),
    ),
    afpInsuranceCap: PE_AFP_ANNUAL_INSURANCE_CAP,
  };
}

function buildPEContributionRules(
  inputs: PECalculatorInputs,
  payroll: ReturnType<typeof buildPEPayrollContext>,
): StandardCountryContributionRule[] {
  if (inputs.pensionSystem === "onp") {
    return [
      {
        name: "ONP/SNP pension contribution",
        rate: PE_ONP_CONTRIBUTION_RATE,
        calculateAmount: () =>
          payroll.pensionableRemuneration * PE_ONP_CONTRIBUTION_RATE,
        preTax: false,
      },
    ];
  }

  const afp = getPEPensionSystem(inputs.pensionSystem);
  if (!afp) {
    return [];
  }

  const contributionRules: StandardCountryContributionRule[] = [
    {
      name: `${afp.name} pension fund contribution`,
      rate: PE_AFP_MANDATORY_FUND_RATE,
      calculateAmount: () =>
        payroll.pensionableRemuneration * PE_AFP_MANDATORY_FUND_RATE,
      preTax: false,
    },
    {
      name: "AFP insurance premium",
      rate: PE_AFP_INSURANCE_RATE,
      cap: payroll.afpInsuranceCap,
      calculateAmount: () => payroll.afpInsuranceBase * PE_AFP_INSURANCE_RATE,
      preTax: false,
    },
  ];

  if (inputs.afpCommissionMode === "flow") {
    contributionRules.push({
      name: `${afp.name} flow commission`,
      rate: afp.flowCommissionRate,
      calculateAmount: () =>
        payroll.pensionableRemuneration * afp.flowCommissionRate,
      preTax: false,
    });
  }

  return contributionRules;
}

function withPEBreakdown(
  result: CalculationResult,
  inputs: PECalculatorInputs,
  payroll: ReturnType<typeof buildPEPayrollContext>,
): CalculationResult {
  const afp = getPEPensionSystem(inputs.pensionSystem);
  const standardBreakdown = result.breakdown;
  if (standardBreakdown.type !== "PE") {
    return result;
  }

  const pensionSystemName = afp?.name ?? "ONP/SNP";
  const peBreakdown: PEBreakdown = {
    ...standardBreakdown,
    salaryPackageMode: inputs.salaryPackageMode,
    gratificationHealthCoverage: inputs.gratificationHealthCoverage,
    pensionSystem: inputs.pensionSystem,
    afpCommissionMode: inputs.afpCommissionMode,
    pensionSystemName,
    afpBalanceCommissionRate: afp?.annualBalanceCommissionRate ?? 0,
    enteredGrossSalary: payroll.enteredGrossSalary,
    regularRemuneration: payroll.regularRemuneration,
    statutoryGratifications: payroll.statutoryGratifications,
    extraordinaryGratificationBonus: payroll.extraordinaryGratificationBonus,
    pensionableRemuneration: payroll.pensionableRemuneration,
    afpInsuranceBase: payroll.afpInsuranceBase,
    afpInsuranceCap: payroll.afpInsuranceCap,
  };

  return {
    ...result,
    breakdown: peBreakdown,
  };
}

export const PECalculator: CountryCalculator = {
  ...baseCalculator,

  calculate(inputs: CalculatorInputs) {
    if (inputs.country !== "PE") {
      throw new Error("PECalculator can only calculate Peru inputs");
    }

    const normalizedInputs = normalizePEInputs(inputs);
    const payroll = buildPEPayrollContext(normalizedInputs);
    const calculationInputs: PECalculatorInputs = {
      ...normalizedInputs,
      grossSalary: payroll.grossIncome,
    };
    const calculationTaxConfig: StandardCountryTaxConfig<"PE"> = {
      ...PE_TAX_CONFIG,
      resolveSocialContributions: () =>
        buildPEContributionRules(normalizedInputs, payroll),
    };
    const result = calculateStandardCountry(
      calculationInputs,
      calculationTaxConfig,
    );

    return withPEBreakdown(result, normalizedInputs, payroll);
  },

  getRegions(): RegionInfo[] {
    return [];
  },

  getContributionLimits(inputs?: Partial<CalculatorInputs>) {
    return baseCalculator.getContributionLimits({
      ...getPEDefaultInputs(),
      ...inputs,
    } as CalculatorInputs);
  },

  getDefaultInputs(): PECalculatorInputs {
    return getPEDefaultInputs();
  },
};
