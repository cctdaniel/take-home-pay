import type {
  CalculationResult,
  CalculatorInputs,
  ContributionLimits,
  CountryCalculator,
  PayFrequency,
  RegionInfo,
  TaxBracket,
} from "../types";
import { IE_CONFIG } from "./config";
import {
  IE_MY_FUTURE_FUND_2026,
  IE_PRSI_CLASS_A_2026,
  IE_SARP_2026,
  IE_SINGLE_PERSON_CHILD_CARER_BAND,
  IE_TAX_CONFIG,
  IE_TAX_CREDITS_2026,
  IE_USC_EXEMPTION_LIMIT,
  IE_USC_REDUCED_BANDS_2026,
  IE_USC_REDUCED_INCOME_LIMIT,
  IE_USC_STANDARD_BANDS_2026,
  getIEPensionReliefLimit,
  getIEPensionReliefPercent,
  getIEQualifyingRentPaidLimit,
  getIERentTaxCreditCap,
} from "./constants/tax-year-2026";
import type {
  IEBreakdown,
  IECalculatorInputs,
  IERetirementScheme,
  IESarpRegime,
  IETaxBreakdown,
  IETaxStatus,
} from "./types";

interface IETaxStatusConfig {
  name: string;
  standardRateBand: number;
  personalTaxCredit: number;
  employeeTaxCreditCount: number;
}

interface LocalSalaryTaxConfig {
  defaultSalary: number;
  defaultAge: number;
  standardDeduction: number;
  taxStatuses: Record<IETaxStatus, IETaxStatusConfig>;
  assumptions: string[];
  sourceUrls: string[];
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

function clampAmount(value: number, min = 0, max = Infinity): number {
  return Math.min(Math.max(value || 0, min), max);
}

function calculateBracketTax(
  taxableIncome: number,
  brackets: readonly TaxBracket[],
): {
  total: number;
  bracketTaxes: Array<{ min: number; max: number; rate: number; tax: number }>;
} {
  let total = 0;
  const bracketTaxes: Array<{
    min: number;
    max: number;
    rate: number;
    tax: number;
  }> = [];

  for (const bracket of brackets) {
    if (taxableIncome <= bracket.min) continue;

    const upper = Number.isFinite(bracket.max) ? bracket.max : taxableIncome;
    const amountInBracket = Math.min(taxableIncome, upper) - bracket.min;
    if (amountInBracket <= 0) continue;

    const tax = roundCurrency(amountInBracket * bracket.rate);
    total += tax;
    bracketTaxes.push({
      min: bracket.min,
      max: bracket.max,
      rate: bracket.rate,
      tax,
    });
  }

  return { total: roundCurrency(total), bracketTaxes };
}

const taxConfig = IE_TAX_CONFIG as LocalSalaryTaxConfig;

function getStandardRateBand(
  status: IETaxStatus,
  hasSinglePersonChildCarerCredit: boolean,
): number {
  if (status === "single" && hasSinglePersonChildCarerCredit) {
    return IE_SINGLE_PERSON_CHILD_CARER_BAND;
  }

  return taxConfig.taxStatuses[status].standardRateBand;
}

function getIncomeTaxBrackets(
  status: IETaxStatus,
  hasSinglePersonChildCarerCredit: boolean,
): TaxBracket[] {
  const standardRateBand = getStandardRateBand(
    status,
    hasSinglePersonChildCarerCredit,
  );

  return [
    { min: 0, max: standardRateBand, rate: 0.2 },
    { min: standardRateBand, max: Infinity, rate: 0.4 },
  ];
}

function calculateEmployeeTaxCredit(
  grossSalary: number,
  creditCount: number,
): number {
  return roundCurrency(
    Math.min(
      IE_TAX_CREDITS_2026.employeePaye * creditCount,
      Math.max(0, grossSalary * 0.2),
    ),
  );
}

function calculateHomeCarerTaxCredit(
  enabled: boolean,
  taxStatus: IETaxStatus,
  homeCarerIncome: number,
): number {
  if (!enabled || taxStatus === "single") {
    return 0;
  }

  const income = Math.max(0, homeCarerIncome);
  if (income >= IE_TAX_CREDITS_2026.homeCarerNoCreditIncomeLimit) {
    return 0;
  }

  if (income <= IE_TAX_CREDITS_2026.homeCarerFullCreditIncomeLimit) {
    return IE_TAX_CREDITS_2026.homeCarer;
  }

  return roundCurrency(
    Math.max(
      0,
      IE_TAX_CREDITS_2026.homeCarer -
        (income - IE_TAX_CREDITS_2026.homeCarerFullCreditIncomeLimit) / 2,
    ),
  );
}

function calculateUniversalSocialCharge(
  grossSalary: number,
  hasReducedUSC: boolean,
): { amount: number; reducedRateApplied: boolean } {
  if (grossSalary <= IE_USC_EXEMPTION_LIMIT) {
    return { amount: 0, reducedRateApplied: false };
  }

  const reducedRateApplied =
    hasReducedUSC && grossSalary <= IE_USC_REDUCED_INCOME_LIMIT;
  const bands = reducedRateApplied
    ? IE_USC_REDUCED_BANDS_2026
    : IE_USC_STANDARD_BANDS_2026;

  return {
    amount: calculateBracketTax(grossSalary, bands).total,
    reducedRateApplied,
  };
}

function calculateWeeklyPrsi(weeklyIncome: number, rate: number): number {
  if (weeklyIncome <= IE_PRSI_CLASS_A_2026.weeklyNoEmployeePrsiLimit) {
    return 0;
  }

  const grossPrsi = weeklyIncome * rate;
  const credit =
    weeklyIncome <= IE_PRSI_CLASS_A_2026.weeklyCreditUpperLimit
      ? Math.max(
          0,
          IE_PRSI_CLASS_A_2026.weeklyCredit -
            (weeklyIncome - IE_PRSI_CLASS_A_2026.weeklyNoEmployeePrsiLimit) / 6,
        )
      : 0;

  return Math.max(0, grossPrsi - credit);
}

function calculateEmployeePrsi(grossSalary: number): {
  amount: number;
  weeklyIncome: number;
  effectiveRate: number;
} {
  const weeklyIncome = grossSalary / 52;
  const preOctober = calculateWeeklyPrsi(
    weeklyIncome,
    IE_PRSI_CLASS_A_2026.preOctoberEmployeeRate,
  );
  const postOctober = calculateWeeklyPrsi(
    weeklyIncome,
    IE_PRSI_CLASS_A_2026.postOctoberEmployeeRate,
  );
  const amount = roundCurrency(
    preOctober * IE_PRSI_CLASS_A_2026.preOctoberWeeks +
      postOctober * IE_PRSI_CLASS_A_2026.postOctoberWeeks,
  );

  return {
    amount,
    weeklyIncome: roundCurrency(weeklyIncome),
    effectiveRate: grossSalary > 0 ? amount / grossSalary : 0,
  };
}

function calculateMyFutureFund(
  grossSalary: number,
  retirementScheme: IERetirementScheme,
) {
  const contributionBase =
    retirementScheme === "my_future_fund"
      ? Math.min(grossSalary, IE_MY_FUTURE_FUND_2026.earningsCap)
      : 0;

  return {
    employeeContribution: roundCurrency(
      contributionBase * IE_MY_FUTURE_FUND_2026.employeeRate,
    ),
    employerContribution: roundCurrency(
      contributionBase * IE_MY_FUTURE_FUND_2026.employerRate,
    ),
    stateTopUp: roundCurrency(
      contributionBase * IE_MY_FUTURE_FUND_2026.stateRate,
    ),
    contributionBase,
    employeeRate: IE_MY_FUTURE_FUND_2026.employeeRate,
    employerRate: IE_MY_FUTURE_FUND_2026.employerRate,
    stateRate: IE_MY_FUTURE_FUND_2026.stateRate,
  };
}

function normalizeSarpRegime(value?: IESarpRegime): IESarpRegime {
  switch (value) {
    case "arrived_2023_to_2025":
    case "arrived_2026_onwards":
      return value;
    default:
      return "none";
  }
}

function calculateSarpRelief(
  qualifyingEmploymentIncome: number,
  regime?: IESarpRegime,
) {
  const normalizedRegime = normalizeSarpRegime(regime);
  const threshold =
    normalizedRegime === "none"
      ? 0
      : IE_SARP_2026.thresholds[normalizedRegime];
  const incomeWithinReliefCap = Math.min(
    Math.max(0, qualifyingEmploymentIncome),
    IE_SARP_2026.upperIncomeLimit,
  );
  const reliefAmount =
    normalizedRegime === "none"
      ? 0
      : roundCurrency(
          Math.max(0, incomeWithinReliefCap - threshold) *
            IE_SARP_2026.reliefRate,
        );

  return {
    regime: normalizedRegime,
    applies: reliefAmount > 0,
    reliefAmount,
    reliefRate: normalizedRegime === "none" ? 0 : IE_SARP_2026.reliefRate,
    incomeThreshold: threshold,
    upperIncomeLimit: IE_SARP_2026.upperIncomeLimit,
    maxYears: IE_SARP_2026.maxYears,
  };
}

export function calculateIE(inputs: IECalculatorInputs): CalculationResult {
  const taxStatus = inputs.taxStatus ?? "single";
  const age = Math.max(16, Math.min(99, inputs.age ?? taxConfig.defaultAge));
  const retirementScheme = inputs.retirementScheme ?? "none";
  const taxableBenefitsInKind = roundCurrency(
    Math.max(0, inputs.taxableBenefitsInKind ?? 0),
  );
  const taxablePayForPayroll = roundCurrency(
    inputs.grossSalary + taxableBenefitsInKind,
  );
  const pensionReliefPercent = getIEPensionReliefPercent(age);
  const pensionLimit = roundCurrency(
    getIEPensionReliefLimit(inputs.grossSalary, age),
  );
  const requestedPensionContribution =
    retirementScheme === "private_pension"
      ? inputs.contributions.pensionContribution
      : 0;
  const pensionContribution = roundCurrency(
    clampAmount(requestedPensionContribution, 0, pensionLimit),
  );
  const pensionDeduction = pensionContribution;
  const disallowedPensionContribution = roundCurrency(
    Math.max(0, requestedPensionContribution - pensionLimit),
  );
  const flatRateExpenses = roundCurrency(
    clampAmount(
      inputs.contributions.flatRateExpenses,
      0,
      taxablePayForPayroll,
    ),
  );
  const sarpRelief = calculateSarpRelief(
    taxablePayForPayroll - pensionDeduction,
    inputs.sarpRegime,
  );
  const rentPaidLimit = getIEQualifyingRentPaidLimit(taxStatus);
  const qualifyingRentPaid = roundCurrency(
    clampAmount(inputs.contributions.qualifyingRentPaid, 0, rentPaidLimit),
  );
  const healthExpenses = roundCurrency(
    Math.max(0, inputs.contributions.healthExpenses || 0),
  );
  const employeeSocialContribution =
    calculateEmployeePrsi(taxablePayForPayroll);
  const standardDeduction = roundCurrency(
    taxConfig.standardDeduction + flatRateExpenses,
  );
  const taxableIncome = roundCurrency(
    Math.max(
      0,
      taxablePayForPayroll -
        standardDeduction -
        pensionDeduction -
        sarpRelief.reliefAmount,
    ),
  );
  const { total: incomeTaxBeforeCredits, bracketTaxes } = calculateBracketTax(
    taxableIncome,
    getIncomeTaxBrackets(
      taxStatus,
      inputs.hasSinglePersonChildCarerCredit,
    ),
  );

  const taxStatusConfig = taxConfig.taxStatuses[taxStatus];
  const personalTaxCredit = taxStatusConfig.personalTaxCredit;
  const employeeTaxCredit = calculateEmployeeTaxCredit(
    taxablePayForPayroll,
    taxStatusConfig.employeeTaxCreditCount,
  );
  const singlePersonChildCarerCredit =
    taxStatus === "single" && inputs.hasSinglePersonChildCarerCredit
      ? IE_TAX_CREDITS_2026.singlePersonChildCarer
      : 0;
  const homeCarerCredit = calculateHomeCarerTaxCredit(
    inputs.hasHomeCarerTaxCredit,
    taxStatus,
    inputs.homeCarerIncome,
  );
  const dependentRelativeCredit =
    Math.max(0, inputs.numberOfDependentRelatives || 0) *
    IE_TAX_CREDITS_2026.dependentRelative;
  const rentCredit = roundCurrency(
    Math.min(
      getIERentTaxCreditCap(taxStatus),
      qualifyingRentPaid * IE_TAX_CREDITS_2026.rentCreditRate,
    ),
  );
  const healthExpenseCredit = roundCurrency(
    healthExpenses * IE_TAX_CREDITS_2026.healthExpenseRate,
  );
  const totalCreditsBeforeCap = roundCurrency(
    personalTaxCredit +
      employeeTaxCredit +
      singlePersonChildCarerCredit +
      homeCarerCredit +
      dependentRelativeCredit +
      rentCredit +
      healthExpenseCredit,
  );
  const taxCredit = roundCurrency(
    clampAmount(totalCreditsBeforeCap, 0, incomeTaxBeforeCredits),
  );
  const incomeTax = roundCurrency(incomeTaxBeforeCredits - taxCredit);
  const additionalIncomeTax = calculateUniversalSocialCharge(
    taxablePayForPayroll,
    inputs.hasReducedUSC,
  );
  const myFutureFund = calculateMyFutureFund(
    inputs.grossSalary,
    retirementScheme,
  );
  const totalTax = roundCurrency(
    incomeTax + additionalIncomeTax.amount + employeeSocialContribution.amount,
  );
  const totalDeductions = roundCurrency(
    totalTax + pensionContribution + myFutureFund.employeeContribution,
  );
  const periodsPerYear = getPeriodsPerYear(inputs.payFrequency);
  const netSalary = roundCurrency(inputs.grossSalary - totalDeductions);
  const taxes: IETaxBreakdown = {
    type: "IE",
    totalIncomeTax: roundCurrency(incomeTax + additionalIncomeTax.amount),
    incomeTax,
    employeeSocialContribution: employeeSocialContribution.amount,
    additionalIncomeTax: additionalIncomeTax.amount,
  };
  const breakdown: IEBreakdown = {
    type: "IE",
    grossIncome: inputs.grossSalary,
    taxableBenefitsInKind,
    taxablePayForPayroll,
    taxableIncome,
    standardDeduction,
    bracketTaxes,
    taxCredit,
    standardRateBand: getStandardRateBand(
      taxStatus,
      inputs.hasSinglePersonChildCarerCredit,
    ),
    personalTaxCredit,
    employeeTaxCredit,
    taxCreditDetails: {
      singlePersonChildCarer: singlePersonChildCarerCredit,
      homeCarer: homeCarerCredit,
      dependentRelative: dependentRelativeCredit,
      rent: rentCredit,
      healthExpenses: healthExpenseCredit,
    },
    taxStatus,
    age,
    sarpRelief,
    retirementScheme,
    pensionContribution,
    pensionDeduction,
    pensionReliefPercent,
    pensionReliefLimit: pensionLimit,
    disallowedPensionContribution,
    flatRateExpenses,
    qualifyingRentPaid,
    healthExpenses,
    employeeSocialContribution: {
      name: "Employee PRSI Class A",
      amount: employeeSocialContribution.amount,
      effectiveRate: employeeSocialContribution.effectiveRate,
      preOctoberRate: IE_PRSI_CLASS_A_2026.preOctoberEmployeeRate,
      postOctoberRate: IE_PRSI_CLASS_A_2026.postOctoberEmployeeRate,
      weeklyIncome: employeeSocialContribution.weeklyIncome,
    },
    additionalIncomeTax: {
      name: "Universal Social Charge (USC)",
      amount: additionalIncomeTax.amount,
      reducedRateApplied: additionalIncomeTax.reducedRateApplied,
    },
    myFutureFund,
    assumptions: taxConfig.assumptions,
    sourceUrls: taxConfig.sourceUrls,
  };
  return {
    country: "IE",
    currency: "EUR",
    grossSalary: inputs.grossSalary,
    taxableIncome,
    taxes,
    totalTax,
    totalDeductions,
    netSalary,
    effectiveTaxRate:
      inputs.grossSalary > 0 ? totalTax / inputs.grossSalary : 0,
    perPeriod: {
      gross: inputs.grossSalary / periodsPerYear,
      net: netSalary / periodsPerYear,
      frequency: inputs.payFrequency,
    },
    breakdown,
  };
}

export const IECalculator: CountryCalculator = {
  countryCode: "IE",
  config: IE_CONFIG,
  calculate(inputs: CalculatorInputs): CalculationResult {
    if (inputs.country !== "IE")
      throw new Error("IECalculator can only calculate IE inputs");
    return calculateIE(inputs as IECalculatorInputs);
  },
  getRegions(): RegionInfo[] {
    return [];
  },
  getContributionLimits(inputs?: Partial<CalculatorInputs>): ContributionLimits {
    const grossSalary =
      inputs?.country === "IE" && typeof inputs.grossSalary === "number"
        ? inputs.grossSalary
        : taxConfig.defaultSalary;
    const age =
      inputs?.country === "IE" && typeof inputs.age === "number"
        ? inputs.age
        : taxConfig.defaultAge;
    const taxStatus =
      inputs?.country === "IE" && inputs.taxStatus ? inputs.taxStatus : "single";

    return {
      pensionContribution: {
        limit: roundCurrency(getIEPensionReliefLimit(grossSalary, age)),
        name: "Private pension / AVC contribution",
        description:
          "Revenue pension relief cap based on your age band and the €115,000 earnings cap",
        preTax: true,
      },
      qualifyingRentPaid: {
        limit: getIEQualifyingRentPaidLimit(taxStatus),
        name: "Qualifying rent paid",
        description:
          "Rent paid that can generate the 20% Rent Tax Credit up to the 2026 cap",
        preTax: false,
      },
    };
  },
  getDefaultInputs(): IECalculatorInputs {
    return {
      country: "IE",
      grossSalary: taxConfig.defaultSalary,
      payFrequency: "monthly",
      age: taxConfig.defaultAge,
      taxableBenefitsInKind: 0,
      taxStatus: "single",
      retirementScheme: "none",
      hasSinglePersonChildCarerCredit: false,
      hasHomeCarerTaxCredit: false,
      homeCarerIncome: 0,
      numberOfDependentRelatives: 0,
      hasReducedUSC: false,
      sarpRegime: "none",
      contributions: {
        pensionContribution: 0,
        qualifyingRentPaid: 0,
        healthExpenses: 0,
        flatRateExpenses: 0,
      },
    };
  },
};
