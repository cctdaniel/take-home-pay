import type {
  CalculationResult,
  CalculatorInputs,
  ContributionLimits,
  CountryCalculator,
  RegionInfo,
} from "../types";
import { calculateNordicTax, getPeriodsPerYear, roundCurrency } from "../nordic-shared";
import { NO_CONFIG } from "./config";
import {
  NO_CHILDCARE_DEDUCTION_2026,
  NO_COMMUTING_DEDUCTION_2026,
  NO_IPS_DEDUCTION_LIMIT,
  NO_PAYE_2026,
  NO_TAX_CONFIG,
  NO_UNION_DUES_DEDUCTION_LIMIT,
} from "./constants/tax-year-2026";
import type {
  NOBreakdown,
  NOCalculatorInputs,
  NOChildcareDeductionMode,
  NOContributionInputs,
  NOPayeNationalInsurance,
  NOTaxBreakdown,
  NOTaxScheme,
} from "./types";

function clampAmount(value: number | undefined, max = Infinity): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(Math.max(0, value ?? 0), max);
}

function normalizeTaxScheme(taxScheme?: NOTaxScheme): NOTaxScheme {
  return taxScheme === "paye" ? "paye" : "ordinary";
}

function normalizePayeNationalInsurance(
  payeNationalInsurance?: NOPayeNationalInsurance,
): NOPayeNationalInsurance {
  return payeNationalInsurance === "exempt" ? "exempt" : "included";
}

function normalizeChildcareDeductionMode(
  mode?: NOChildcareDeductionMode,
): NOChildcareDeductionMode {
  return mode === "specialNeeds" ? "specialNeeds" : "ordinary";
}

function calculateNOChildcareDeductionLimit(
  children: number,
  mode: NOChildcareDeductionMode,
): number {
  const childCount = Math.min(Math.max(Math.floor(children), 0), 10);

  if (childCount === 0) {
    return 0;
  }

  const firstChildLimit =
    mode === "specialNeeds"
      ? NO_CHILDCARE_DEDUCTION_2026.specialNeedsFirstChild
      : NO_CHILDCARE_DEDUCTION_2026.ordinaryFirstChild;
  const additionalChildLimit =
    mode === "specialNeeds"
      ? NO_CHILDCARE_DEDUCTION_2026.specialNeedsAdditionalChild
      : NO_CHILDCARE_DEDUCTION_2026.ordinaryAdditionalChild;

  return firstChildLimit + (childCount - 1) * additionalChildLimit;
}

function calculateNOCommutingDeduction(
  roundTripCommutingKm: number,
  commutingWorkdays: number,
): number {
  const grossDeduction = Math.min(
    Math.max(0, roundTripCommutingKm) *
      Math.min(Math.max(Math.floor(commutingWorkdays), 0), 366) *
      NO_COMMUTING_DEDUCTION_2026.ratePerKm,
    NO_COMMUTING_DEDUCTION_2026.grossDeductionCap,
  );

  return roundCurrency(
    Math.max(0, grossDeduction - NO_COMMUTING_DEDUCTION_2026.lowerThreshold),
  );
}

function normalizeNOContributions(
  contributions?: Partial<NOContributionInputs>,
): NOContributionInputs {
  return {
    ipsContribution: Math.max(0, contributions?.ipsContribution ?? 0),
    tradeUnionFees: Math.max(0, contributions?.tradeUnionFees ?? 0),
    childcareExpenses: Math.max(0, contributions?.childcareExpenses ?? 0),
    debtInterestPaid: Math.max(0, contributions?.debtInterestPaid ?? 0),
  };
}

function normalizeNOInputs(inputs: NOCalculatorInputs): NOCalculatorInputs {
  return {
    ...inputs,
    taxScheme: normalizeTaxScheme(inputs.taxScheme),
    payeNationalInsurance: normalizePayeNationalInsurance(
      inputs.payeNationalInsurance,
    ),
    childcareDeductionMode: normalizeChildcareDeductionMode(
      inputs.childcareDeductionMode,
    ),
    childcareChildren: Math.min(
      Math.max(Math.floor(inputs.childcareChildren ?? 0), 0),
      10,
    ),
    roundTripCommutingKm: Math.min(
      Math.max(inputs.roundTripCommutingKm ?? 0, 0),
      1_000,
    ),
    commutingWorkdays: Math.min(
      Math.max(Math.floor(inputs.commutingWorkdays ?? 0), 0),
      366,
    ),
    contributions: normalizeNOContributions(inputs.contributions),
  };
}

export function calculateNO(inputs: NOCalculatorInputs): CalculationResult {
  const normalizedInputs = normalizeNOInputs(inputs);
  const grossSalary = Math.max(0, normalizedInputs.grossSalary);
  const { taxScheme, payeNationalInsurance } = normalizedInputs;
  const isPayeSelected = taxScheme === "paye";
  const isPayeApplied =
    isPayeSelected && grossSalary <= NO_PAYE_2026.incomeThreshold;
  const ipsContribution = isPayeApplied
    ? 0
	    : clampAmount(
	        normalizedInputs.contributions.ipsContribution,
	        Math.min(NO_IPS_DEDUCTION_LIMIT, grossSalary),
	      );
  const tradeUnionFees = isPayeApplied
    ? 0
    : clampAmount(
        normalizedInputs.contributions.tradeUnionFees,
        Math.min(NO_UNION_DUES_DEDUCTION_LIMIT, grossSalary),
      );
  const childcareDeductionLimit = isPayeApplied
    ? 0
    : Math.min(
        calculateNOChildcareDeductionLimit(
          normalizedInputs.childcareChildren,
          normalizedInputs.childcareDeductionMode,
        ),
        grossSalary,
      );
  const childcareExpenses = isPayeApplied
    ? 0
    : clampAmount(
        normalizedInputs.contributions.childcareExpenses,
        childcareDeductionLimit,
      );
  const commutingDeduction = isPayeApplied
    ? 0
    : calculateNOCommutingDeduction(
        normalizedInputs.roundTripCommutingKm,
        normalizedInputs.commutingWorkdays,
      );
  const debtInterestPaid = isPayeApplied
    ? 0
    : Math.max(0, normalizedInputs.contributions.debtInterestPaid);
  const ordinaryDeductions =
    ipsContribution +
    tradeUnionFees +
    childcareExpenses +
    commutingDeduction +
    debtInterestPaid;
  const computation = isPayeApplied
    ? null
    : calculateNordicTax(grossSalary, {
        ...NO_TAX_CONFIG,
        standardDeduction: NO_TAX_CONFIG.standardDeduction + ordinaryDeductions,
      });
  const payeTotalRate =
    payeNationalInsurance === "exempt"
      ? NO_PAYE_2026.rateWithoutNationalInsurance
      : NO_PAYE_2026.rateWithNationalInsurance;
  const payeNationalInsuranceRate =
    isPayeApplied && payeNationalInsurance === "included"
      ? NO_PAYE_2026.nationalInsuranceRate
      : 0;
  const payeIncomeTaxRate = Math.max(
    0,
    payeTotalRate - payeNationalInsuranceRate,
  );
  const payeEmployeeSocialContribution = roundCurrency(
    grossSalary * payeNationalInsuranceRate,
  );
  const payeIncomeTax = roundCurrency(grossSalary * payeIncomeTaxRate);
  const incomeTax = isPayeApplied
    ? payeIncomeTax
    : (computation?.incomeTax ?? 0);
  const employeeSocialContribution = isPayeApplied
    ? payeEmployeeSocialContribution
    : (computation?.employeeSocialContribution ?? 0);
  const totalTax = roundCurrency(incomeTax + employeeSocialContribution);
  const taxableIncome = isPayeApplied
    ? grossSalary
    : (computation?.taxableIncome ?? 0);
  const bracketTaxes = computation?.bracketTaxes ?? [];
  const periodsPerYear = getPeriodsPerYear(inputs.payFrequency);
  const netSalary = roundCurrency(grossSalary - totalTax - ipsContribution);

  const taxes: NOTaxBreakdown = {
    type: "NO",
    totalIncomeTax: incomeTax,
    incomeTax,
    employeeSocialContribution,
  };

  const breakdown: NOBreakdown = {
    type: "NO",
    grossIncome: grossSalary,
    taxableIncome,
    bracketTaxes,
    employeeSocialContribution: {
      name: NO_TAX_CONFIG.employeeSocialName,
      amount: employeeSocialContribution,
      rate: isPayeApplied
        ? payeNationalInsuranceRate
        : NO_TAX_CONFIG.employeeSocialRate,
      cap: NO_TAX_CONFIG.employeeSocialCap,
    },
    taxScheme,
    paye: {
      selected: isPayeSelected,
      applied: isPayeApplied,
      nationalInsurance: payeNationalInsurance,
      threshold: NO_PAYE_2026.incomeThreshold,
      totalRate: isPayeApplied ? payeTotalRate : 0,
      incomeTaxRate: isPayeApplied ? payeIncomeTaxRate : 0,
      nationalInsuranceRate: isPayeApplied ? payeNationalInsuranceRate : 0,
    },
    standardDeduction: NO_TAX_CONFIG.standardDeduction,
    assumptions: NO_TAX_CONFIG.assumptions,
    sourceUrls: NO_TAX_CONFIG.sourceUrls,
    voluntaryContributions: {
      ipsContribution,
      ipsDeductionApplied: ipsContribution,
      ipsDeductionLimit: NO_IPS_DEDUCTION_LIMIT,
      tradeUnionFees,
      childcareExpenses: normalizedInputs.contributions.childcareExpenses,
      childcareDeductionApplied: childcareExpenses,
      childcareDeductionLimit,
      debtInterestPaid,
      commutingDeduction,
    },
  };

  return {
    country: "NO",
    currency: "NOK",
    grossSalary,
    taxableIncome,
    taxes,
    totalTax,
    totalDeductions: totalTax + ipsContribution,
    netSalary,
    effectiveTaxRate: grossSalary > 0 ? totalTax / grossSalary : 0,
    perPeriod: {
      gross: grossSalary / periodsPerYear,
      net: netSalary / periodsPerYear,
      frequency: inputs.payFrequency,
    },
    breakdown,
  };
}

export const NOCalculator: CountryCalculator = {
  countryCode: "NO",
  config: NO_CONFIG,

  calculate(inputs: CalculatorInputs): CalculationResult {
    if (inputs.country !== "NO") {
      throw new Error("NOCalculator can only calculate NO inputs");
    }

    return calculateNO(inputs as NOCalculatorInputs);
  },

  getRegions(): RegionInfo[] {
    return [];
  },

  getContributionLimits(inputs?: Partial<CalculatorInputs>): ContributionLimits {
    const defaultInputs = this.getDefaultInputs() as NOCalculatorInputs;
    const normalizedInputs = normalizeNOInputs({
      ...defaultInputs,
      ...inputs,
      contributions: {
        ...defaultInputs.contributions,
        ...(inputs as Partial<NOCalculatorInputs>)?.contributions,
      },
    } as NOCalculatorInputs);
    const grossSalary = Math.max(0, normalizedInputs.grossSalary);
    const isPayeApplied =
      normalizedInputs.taxScheme === "paye" &&
      grossSalary <= NO_PAYE_2026.incomeThreshold;
    const childcareLimit = isPayeApplied
      ? 0
      : Math.min(
          calculateNOChildcareDeductionLimit(
            normalizedInputs.childcareChildren,
            normalizedInputs.childcareDeductionMode,
          ),
          grossSalary,
        );

    return {
      ipsContribution: {
        limit: isPayeApplied ? 0 : Math.min(NO_IPS_DEDUCTION_LIMIT, grossSalary),
        name: "IPS pension savings",
        description: "Individual pension savings (IPS) deduction limit",
        preTax: true,
      },
      tradeUnionFees: {
        limit: isPayeApplied
          ? 0
          : Math.min(NO_UNION_DUES_DEDUCTION_LIMIT, grossSalary),
        name: "Trade union dues",
        description: "Skatteetaten 2026 union-dues deduction cap.",
        preTax: true,
      },
      childcareExpenses: {
        limit: childcareLimit,
        name: "Childcare / parent deduction",
        description:
          "Documented childcare costs, capped by the selected 2026 ordinary or special-needs child limits.",
        preTax: true,
      },
    };
  },

  getDefaultInputs(): NOCalculatorInputs {
    return {
      country: "NO",
      grossSalary: 700_000,
      payFrequency: "monthly",
      taxScheme: "ordinary",
      payeNationalInsurance: "included",
      childcareDeductionMode: "ordinary",
      childcareChildren: 0,
      roundTripCommutingKm: 0,
      commutingWorkdays: 0,
      contributions: {
        ipsContribution: 0,
        tradeUnionFees: 0,
        childcareExpenses: 0,
        debtInterestPaid: 0,
      },
    };
  },
};
