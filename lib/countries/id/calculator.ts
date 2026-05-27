import type {
  CalculatorInputs,
  CalculationResult,
  CountryCalculator,
  ContributionLimits,
  IDBreakdown,
  IDCalculatorInputs,
  IDTaxReliefInputs,
  IDTaxBreakdown,
  PayFrequency,
  RegionInfo,
} from "../types";
import { ID_CONFIG } from "./config";
import {
  ID_BPJS_2026,
  ID_MODELED_CONTRIBUTION_CASH_CAP_RATE,
  ID_JOB_EXPENSE_2026,
  calculatePtkp,
  calculateProgressiveTax,
} from "./constants/tax-brackets-2026";

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

function calculateBpjsContributions(annualSalary: number) {
  const monthlySalary = annualSalary / 12;

  const healthBase = Math.min(monthlySalary, ID_BPJS_2026.health.monthlyWageCap);
  const healthEmployee = healthBase * ID_BPJS_2026.health.employeeRate * 12;
  const healthEmployer = healthBase * ID_BPJS_2026.health.employerRate * 12;

  const jhtEmployee = monthlySalary * ID_BPJS_2026.jht.employeeRate * 12;
  const jhtEmployer = monthlySalary * ID_BPJS_2026.jht.employerRate * 12;

  const jpBase = Math.min(monthlySalary, ID_BPJS_2026.jp.monthlyWageCap);
  const jpEmployee = jpBase * ID_BPJS_2026.jp.employeeRate * 12;
  const jpEmployer = jpBase * ID_BPJS_2026.jp.employerRate * 12;

  return {
    healthEmployee: Math.round(healthEmployee),
    healthEmployer: Math.round(healthEmployer),
    healthMonthlyCap: ID_BPJS_2026.health.monthlyWageCap,
    jhtEmployee: Math.round(jhtEmployee),
    jhtEmployer: Math.round(jhtEmployer),
    jpEmployee: Math.round(jpEmployee),
    jpEmployer: Math.round(jpEmployer),
    jpMonthlyCap: ID_BPJS_2026.jp.monthlyWageCap,
  };
}

function clampAmount(value: number, min = 0, max = Infinity): number {
  if (!Number.isFinite(value)) {
    return min;
  }

  return Math.min(Math.max(value, min), max);
}

function normalizeVoluntaryDeductions(
  cashCap: number,
  contributions: IDCalculatorInputs["contributions"],
) {
  const modeledCashCap = Math.max(
    0,
    cashCap * ID_MODELED_CONTRIBUTION_CASH_CAP_RATE,
  );
  const dplkContribution = Math.round(
    clampAmount(contributions.dplkContribution ?? 0, 0, modeledCashCap),
  );
  const zakatContribution = Math.round(
    clampAmount(
      contributions.zakatContribution ?? 0,
      0,
      modeledCashCap - dplkContribution,
    ),
  );

  return {
    dplkContribution,
    zakatContribution,
    total: dplkContribution + zakatContribution,
    cashCap: modeledCashCap,
  };
}

export function calculateID(inputs: IDCalculatorInputs): CalculationResult {
  const { grossSalary, payFrequency, taxReliefs, contributions } = inputs;

  const jobExpense = Math.min(
    grossSalary * ID_JOB_EXPENSE_2026.rate,
    ID_JOB_EXPENSE_2026.annualCap,
  );

  const bpjs = calculateBpjsContributions(grossSalary);
  const pensionDeduction = bpjs.jhtEmployee + bpjs.jpEmployee;
  const ptkp = calculatePtkp(taxReliefs);
  const taxableIncomeBeforeVoluntary = Math.floor(
    Math.max(
      0,
      grossSalary - jobExpense - pensionDeduction - ptkp.total,
    ) / 1000,
  ) * 1000;
  const taxBeforeVoluntary = calculateProgressiveTax(
    taxableIncomeBeforeVoluntary,
  ).totalTax;
  const availableVoluntaryCash = Math.max(
    0,
    grossSalary -
      bpjs.healthEmployee -
      bpjs.jhtEmployee -
      bpjs.jpEmployee -
      taxBeforeVoluntary,
  );

  const {
    dplkContribution,
    zakatContribution,
    total: voluntaryDeductions,
  } = normalizeVoluntaryDeductions(availableVoluntaryCash, contributions);

  const netIncome = Math.max(
    0,
    grossSalary - jobExpense - pensionDeduction - voluntaryDeductions,
  );

  const taxableIncomeBeforeRounding = Math.max(0, netIncome - ptkp.total);
  const taxableIncome = Math.floor(taxableIncomeBeforeRounding / 1000) * 1000;

  const taxResult = calculateProgressiveTax(taxableIncome);

  const taxes: IDTaxBreakdown = {
    totalIncomeTax: taxResult.totalTax,
    incomeTax: taxResult.totalTax,
    bpjsHealth: bpjs.healthEmployee,
    bpjsJht: bpjs.jhtEmployee,
    bpjsJp: bpjs.jpEmployee,
  };

  const totalTax =
    taxes.incomeTax + taxes.bpjsHealth + taxes.bpjsJht + taxes.bpjsJp;
  const totalDeductions = totalTax + voluntaryDeductions;
  const netSalary = grossSalary - totalDeductions;
  const effectiveTaxRate = grossSalary > 0 ? totalTax / grossSalary : 0;

  const periodsPerYear = getPeriodsPerYear(payFrequency);

  const breakdown: IDBreakdown = {
    type: "ID",
    grossIncome: grossSalary,
    jobExpense: Math.round(jobExpense),
    jobExpenseCap: ID_JOB_EXPENSE_2026.annualCap,
    pensionDeduction,
    voluntaryDeductions: {
      dplk: dplkContribution,
      zakat: zakatContribution,
      total: voluntaryDeductions,
    },
    netIncome,
    ptkp: ptkp.total,
    taxableIncomeBeforeRounding,
    taxableIncome,
    bracketTaxes: taxResult.bracketTaxes,
    bpjs,
    taxReliefs,
  };

  return {
    country: "ID",
    currency: "IDR",
    grossSalary,
    taxableIncome,
    taxes,
    totalTax,
    totalDeductions,
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

export const IDCalculator: CountryCalculator = {
  countryCode: "ID",
  config: ID_CONFIG,

  calculate(inputs: CalculatorInputs): CalculationResult {
    if (inputs.country !== "ID") {
      throw new Error("IDCalculator can only calculate ID inputs");
    }
    return calculateID(inputs as IDCalculatorInputs);
  },

  getRegions(): RegionInfo[] {
    return [];
  },

  getContributionLimits(inputs?: Partial<CalculatorInputs>): ContributionLimits {
    const idInputs = inputs as Partial<IDCalculatorInputs> | undefined;
    const annualSalary =
      idInputs?.grossSalary && idInputs.grossSalary > 0
        ? idInputs.grossSalary
        : 120_000_000;
    const taxReliefs =
      idInputs?.taxReliefs ??
      ({
        maritalStatus: "single",
        numberOfDependents: 0,
        spouseIncomeCombined: false,
      } satisfies IDTaxReliefInputs);
    const jobExpense = Math.min(
      annualSalary * ID_JOB_EXPENSE_2026.rate,
      ID_JOB_EXPENSE_2026.annualCap,
    );
    const bpjs = calculateBpjsContributions(annualSalary);
    const pensionDeduction = bpjs.jhtEmployee + bpjs.jpEmployee;
    const ptkp = calculatePtkp(taxReliefs);
    const taxableIncomeBeforeVoluntary = Math.floor(
      Math.max(
        0,
        annualSalary - jobExpense - pensionDeduction - ptkp.total,
      ) / 1000,
    ) * 1000;
    const taxBeforeVoluntary = calculateProgressiveTax(
      taxableIncomeBeforeVoluntary,
    ).totalTax;
    const availableVoluntaryCash = Math.max(
      0,
      annualSalary -
        bpjs.healthEmployee -
        bpjs.jhtEmployee -
        bpjs.jpEmployee -
        taxBeforeVoluntary,
    );

    return {
      dplkContribution: {
        limit: availableVoluntaryCash * ID_MODELED_CONTRIBUTION_CASH_CAP_RATE,
        name: "DPLK Contribution",
        description:
          "Voluntary contributions to Dana Pensiun Lembaga Keuangan (DPLK). No general annual statutory cap is modeled; the entry is limited to remaining modeled cash compensation.",
        preTax: true,
      },
      zakatContribution: {
        limit: availableVoluntaryCash * ID_MODELED_CONTRIBUTION_CASH_CAP_RATE,
        name: "Zakat",
        description:
          "Zakat or mandatory religious donation paid through the employer to an approved institution. No general annual statutory cap is modeled; the entry is limited to remaining modeled cash compensation.",
        preTax: true,
      },
    };
  },

  getDefaultInputs(): IDCalculatorInputs {
    return {
      country: "ID",
      grossSalary: 120_000_000,
      payFrequency: "monthly",
      contributions: {
        dplkContribution: 0,
        zakatContribution: 0,
      },
      taxReliefs: {
        maritalStatus: "single",
        numberOfDependents: 0,
        spouseIncomeCombined: false,
      },
    };
  },
};
