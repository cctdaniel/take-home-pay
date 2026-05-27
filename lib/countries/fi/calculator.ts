import type {
  CalculationResult,
  CalculatorInputs,
  ContributionLimits,
  CountryCalculator,
  RegionInfo,
} from "../types";
import {
  calculateNordicTax,
  getPeriodsPerYear,
  roundCurrency,
} from "../nordic-shared";
import { FI_CONFIG } from "./config";
import {
  FI_COMMUTING_EXPENSE_DEDUCTION_2026,
  FI_DAILY_ALLOWANCE_CONTRIBUTION_RATE_2026,
  FI_DAILY_ALLOWANCE_THRESHOLD_2026,
  FI_EMPLOYEE_PENSION_RATE_2026,
  FI_EMPLOYEE_UNEMPLOYMENT_RATE_2026,
  FI_HEALTH_CARE_CONTRIBUTION_RATE_2026,
  FI_HOUSEHOLD_EXPENSE_CREDIT_2026,
  FI_INCOME_PRODUCTION_EXPENSES_2026,
  FI_KEY_EMPLOYEE_TAX_AT_SOURCE_RATE,
  FI_TAX_CONFIG,
  FI_VOLUNTARY_PENSION_INSURANCE_2026,
} from "./constants/tax-year-2026";
import type {
  FIBreakdown,
  FICalculatorInputs,
  FIContributionInputs,
  FITaxBreakdown,
} from "./types";

function clampAmount(value: number | undefined, max = Infinity): number {
  return Math.min(Math.max(0, value ?? 0), max);
}

function calculateCommutingDeduction(commutingExpenses: number): number {
  return roundCurrency(
    Math.min(
      FI_COMMUTING_EXPENSE_DEDUCTION_2026.maxDeduction,
      Math.max(
        0,
        commutingExpenses -
          FI_COMMUTING_EXPENSE_DEDUCTION_2026.personalLiability,
      ),
    ),
  );
}

function calculateHouseholdExpenseCredit(householdWorkExpenses: number): number {
  return roundCurrency(
    Math.min(
      FI_HOUSEHOLD_EXPENSE_CREDIT_2026.maxCredit,
      Math.max(
        0,
        householdWorkExpenses *
          FI_HOUSEHOLD_EXPENSE_CREDIT_2026.workExpenseRate -
          FI_HOUSEHOLD_EXPENSE_CREDIT_2026.creditThreshold,
      ),
    ),
  );
}

function normalizeAge(age: number | undefined): number {
  if (!Number.isFinite(age)) {
    return 30;
  }

  return Math.min(Math.max(0, Math.floor(age ?? 30)), 100);
}

function calculateOtherIncomeProductionDeduction(
  taxableEmploymentIncome: number,
  otherIncomeProductionExpenses: number,
): number {
  const expenses = clampAmount(otherIncomeProductionExpenses);

  if (expenses <= FI_INCOME_PRODUCTION_EXPENSES_2026.automaticDeduction) {
    return 0;
  }

  return roundCurrency(Math.min(expenses, taxableEmploymentIncome));
}

function calculateFinnishEmployeeSocialContributions(
  taxableEmploymentIncome: number,
  age: number,
  options: { withholdHealthAndDailyAllowance: boolean },
) {
  const pensionRate =
    age >= 17 && age <= 67 ? FI_EMPLOYEE_PENSION_RATE_2026 : 0;
  const unemploymentRate =
    age >= 18 && age <= 64 ? FI_EMPLOYEE_UNEMPLOYMENT_RATE_2026 : 0;
  const healthCareRate = options.withholdHealthAndDailyAllowance
    ? FI_HEALTH_CARE_CONTRIBUTION_RATE_2026
    : 0;
  const dailyAllowanceRate =
    options.withholdHealthAndDailyAllowance &&
    age >= 16 &&
    age <= 67 &&
    taxableEmploymentIncome >= FI_DAILY_ALLOWANCE_THRESHOLD_2026
      ? FI_DAILY_ALLOWANCE_CONTRIBUTION_RATE_2026
      : 0;
  const pensionContribution = roundCurrency(
    taxableEmploymentIncome * pensionRate,
  );
  const unemploymentContribution = roundCurrency(
    taxableEmploymentIncome * unemploymentRate,
  );
  const healthCareContribution = roundCurrency(
    taxableEmploymentIncome * healthCareRate,
  );
  const dailyAllowanceContribution = roundCurrency(
    taxableEmploymentIncome * dailyAllowanceRate,
  );
  const amount = roundCurrency(
    pensionContribution +
      unemploymentContribution +
      healthCareContribution +
      dailyAllowanceContribution,
  );
  const rate =
    taxableEmploymentIncome > 0 ? amount / taxableEmploymentIncome : 0;

  return {
    amount,
    rate,
    pensionContribution,
    pensionRate,
    unemploymentContribution,
    unemploymentRate,
    healthCareContribution,
    healthCareRate,
    dailyAllowanceContribution,
    dailyAllowanceRate,
  };
}

function getIncomeTaxConfig() {
  return {
    ...FI_TAX_CONFIG,
    employeeSocialRate: 0,
  };
}

export function calculateFI(inputs: FICalculatorInputs): CalculationResult {
  const cashGrossSalary = Math.max(0, inputs.grossSalary);
  const taxableFringeBenefits = roundCurrency(
    Math.max(0, inputs.taxableFringeBenefits ?? 0),
  );
  const taxableEmploymentIncome = roundCurrency(
    cashGrossSalary + taxableFringeBenefits,
  );
  const age = normalizeAge(inputs.age);
  const taxRegime = inputs.taxRegime ?? "ordinary";
  const contributions: Partial<FIContributionInputs> = inputs.contributions ?? {};
  const commutingExpenses = clampAmount(
    contributions.commutingExpenses,
    FI_COMMUTING_EXPENSE_DEDUCTION_2026.modeledExpenseMax,
  );
  const commutingDeduction =
    taxRegime === "ordinary" ? calculateCommutingDeduction(commutingExpenses) : 0;
  const householdWorkExpenses = clampAmount(
    contributions.householdWorkExpenses,
    FI_HOUSEHOLD_EXPENSE_CREDIT_2026.modeledWorkExpenseMax,
  );
  const householdExpenseCredit =
    taxRegime === "ordinary"
      ? calculateHouseholdExpenseCredit(householdWorkExpenses)
      : 0;
  const unemploymentFundFees =
    taxRegime === "ordinary"
      ? clampAmount(contributions.unemploymentFundFees)
      : 0;
  const otherIncomeProductionExpenses =
    taxRegime === "ordinary"
      ? clampAmount(contributions.otherIncomeProductionExpenses)
      : 0;
  const otherIncomeProductionDeduction =
    taxRegime === "ordinary"
      ? calculateOtherIncomeProductionDeduction(
          taxableEmploymentIncome,
          otherIncomeProductionExpenses,
        )
      : 0;
  const voluntaryPensionInsurance =
    taxRegime === "ordinary"
      ? clampAmount(
          contributions.voluntaryPensionInsurance,
          FI_VOLUNTARY_PENSION_INSURANCE_2026.contributionLimit,
        )
      : 0;
  const voluntaryPensionCredit =
    taxRegime === "ordinary"
      ? roundCurrency(
          voluntaryPensionInsurance *
          FI_VOLUNTARY_PENSION_INSURANCE_2026.deficitCreditRate,
        )
      : 0;
  const employeeSocialContribution = calculateFinnishEmployeeSocialContributions(
    taxableEmploymentIncome,
    age,
    { withholdHealthAndDailyAllowance: taxRegime !== "keyEmployee" },
  );
  const taxConfig = getIncomeTaxConfig();
  const computation = calculateNordicTax(taxableEmploymentIncome, taxConfig, {
    additionalPreTaxDeduction:
      commutingDeduction +
      unemploymentFundFees +
      otherIncomeProductionDeduction,
  });
  const periodsPerYear = getPeriodsPerYear(inputs.payFrequency);
  const incomeTaxBeforeCredits =
    taxRegime === "keyEmployee"
      ? roundCurrency(
          taxableEmploymentIncome * FI_KEY_EMPLOYEE_TAX_AT_SOURCE_RATE,
        )
      : computation.incomeTax;
  const requestedCredits =
    taxRegime === "ordinary"
      ? householdExpenseCredit + voluntaryPensionCredit
      : 0;
  const appliedTaxCredits = Math.min(incomeTaxBeforeCredits, requestedCredits);
  const appliedHouseholdCredit = Math.min(
    householdExpenseCredit,
    appliedTaxCredits,
  );
  const appliedPensionCredit = Math.min(
    voluntaryPensionCredit,
    Math.max(0, appliedTaxCredits - appliedHouseholdCredit),
  );
  const incomeTax = roundCurrency(incomeTaxBeforeCredits - appliedTaxCredits);
  const totalTax = roundCurrency(
    incomeTax + employeeSocialContribution.amount,
  );
  const netSalary = roundCurrency(
    cashGrossSalary - totalTax - voluntaryPensionInsurance,
  );

  const taxes: FITaxBreakdown = {
    type: "FI",
    totalIncomeTax: incomeTax,
    incomeTax,
    employeeSocialContribution: employeeSocialContribution.amount,
  };

  const breakdown: FIBreakdown = {
    type: "FI",
    grossIncome: cashGrossSalary,
    cashGrossIncome: cashGrossSalary,
    taxableFringeBenefits,
    taxableEmploymentIncome,
    taxableIncome:
      taxRegime === "keyEmployee"
        ? taxableEmploymentIncome
        : computation.taxableIncome,
    bracketTaxes: taxRegime === "keyEmployee" ? [] : computation.bracketTaxes,
    employeeSocialContribution: {
      name: FI_TAX_CONFIG.employeeSocialName,
      amount: employeeSocialContribution.amount,
      rate: employeeSocialContribution.rate,
      cap: FI_TAX_CONFIG.employeeSocialCap,
      pensionContribution: employeeSocialContribution.pensionContribution,
      pensionRate: employeeSocialContribution.pensionRate,
      unemploymentContribution:
        employeeSocialContribution.unemploymentContribution,
      unemploymentRate: employeeSocialContribution.unemploymentRate,
      healthCareContribution: employeeSocialContribution.healthCareContribution,
      healthCareRate: employeeSocialContribution.healthCareRate,
      dailyAllowanceContribution:
        employeeSocialContribution.dailyAllowanceContribution,
      dailyAllowanceRate: employeeSocialContribution.dailyAllowanceRate,
    },
    taxRegime,
    age,
    specialRegime:
      taxRegime === "keyEmployee"
        ? {
            name: "Foreign key employee tax at source",
            rate: FI_KEY_EMPLOYEE_TAX_AT_SOURCE_RATE,
            incomeTax,
          }
        : undefined,
    standardDeduction:
      taxRegime === "keyEmployee" ? 0 : FI_TAX_CONFIG.standardDeduction,
    voluntaryDeductions: {
      commutingExpenses,
      commutingDeduction,
      unemploymentFundFees,
      otherIncomeProductionExpenses,
      otherIncomeProductionDeduction,
      householdWorkExpenses,
      householdExpenseCredit: appliedHouseholdCredit,
      voluntaryPensionInsurance,
      voluntaryPensionCredit: appliedPensionCredit,
    },
    assumptions: FI_TAX_CONFIG.assumptions,
    sourceUrls: FI_TAX_CONFIG.sourceUrls,
  };

  return {
    country: "FI",
    currency: "EUR",
    grossSalary: cashGrossSalary,
    taxableIncome: breakdown.taxableIncome,
    taxes,
    totalTax,
    totalDeductions: roundCurrency(totalTax + voluntaryPensionInsurance),
    netSalary,
    effectiveTaxRate:
      cashGrossSalary > 0 ? totalTax / cashGrossSalary : 0,
    perPeriod: {
      gross: cashGrossSalary / periodsPerYear,
      net: netSalary / periodsPerYear,
      frequency: inputs.payFrequency,
    },
    breakdown,
  };
}

export const FICalculator: CountryCalculator = {
  countryCode: "FI",
  config: FI_CONFIG,

  calculate(inputs: CalculatorInputs): CalculationResult {
    if (inputs.country !== "FI") {
      throw new Error("FICalculator can only calculate FI inputs");
    }

    return calculateFI(inputs as FICalculatorInputs);
  },

  getRegions(): RegionInfo[] {
    return [];
  },

  getContributionLimits(): ContributionLimits {
    return {
      commutingExpenses: {
        limit: FI_COMMUTING_EXPENSE_DEDUCTION_2026.modeledExpenseMax,
        name: "Commuting expenses",
        description:
          "Modeled maximum expense needed to reach Finland's 2026 commuting deduction cap.",
        preTax: true,
      },
      householdWorkExpenses: {
        limit: FI_HOUSEHOLD_EXPENSE_CREDIT_2026.modeledWorkExpenseMax,
        name: "Household work expenses",
        description:
          "Modeled general household-work spend needed to reach the 2026 credit cap.",
        preTax: false,
      },
      voluntaryPensionInsurance: {
        limit: FI_VOLUNTARY_PENSION_INSURANCE_2026.contributionLimit,
        name: "Voluntary pension / PS savings",
        description:
          "Annual contributions deductible from capital income, modeled as a 30% deficit credit when no capital income is supplied.",
        preTax: false,
      },
    };
  },

  getDefaultInputs(): FICalculatorInputs {
    return {
      country: "FI",
      grossSalary: 60_000,
      payFrequency: "monthly",
      taxRegime: "ordinary",
      age: 30,
      taxableFringeBenefits: 0,
      contributions: {
        commutingExpenses: 0,
        unemploymentFundFees: 0,
        otherIncomeProductionExpenses: 0,
        householdWorkExpenses: 0,
        voluntaryPensionInsurance: 0,
      },
    };
  },
};
