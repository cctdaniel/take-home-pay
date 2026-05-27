import type {
  CalculationResult,
  CalculatorInputs,
  ContributionLimits,
  CountryCalculator,
  INBreakdown,
  INCalculatorInputs,
  INTaxBreakdown,
  PayFrequency,
  RegionInfo,
} from "../types";
import { IN_CONFIG } from "./config";
import {
  calculateINProgressiveTax,
  calculateINRebate,
  calculateINSurcharge,
  IN_CESS_RATE,
  IN_EPF_2026,
  IN_HRA_2026,
  IN_NPS_80CCD_1B_LIMIT,
  IN_PROFESSIONAL_TAX_ANNUAL_CAP,
  IN_SECTION_80D_2026,
  IN_SECTION_80C_LIMIT,
  IN_STANDARD_DEDUCTION_NEW_REGIME,
  IN_STANDARD_DEDUCTION_OLD_REGIME,
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

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function calculateEPF(grossSalary: number, isApplicable: boolean) {
  if (!isApplicable) {
    return {
      rate: 0,
      employee: 0,
      ceiling: IN_EPF_2026.monthlyWageCeiling,
      monthlyBase: 0,
    };
  }

  const monthlySalary = grossSalary / 12;
  const monthlyBase = Math.min(monthlySalary, IN_EPF_2026.monthlyWageCeiling);
  const employee = roundCurrency(monthlyBase * IN_EPF_2026.employeeRate * 12);

  return {
    rate: IN_EPF_2026.employeeRate,
    employee,
    ceiling: IN_EPF_2026.monthlyWageCeiling,
    monthlyBase,
  };
}

function calculateHraExemption(inputs: INCalculatorInputs): number {
  if (inputs.regime !== "old") {
    return 0;
  }

  const hra = inputs.hra;
  const annualHraReceived = clamp(hra.annualHraReceived, 0, inputs.grossSalary);
  const annualBasicSalaryForHra = clamp(
    hra.annualBasicSalaryForHra,
    0,
    inputs.grossSalary,
  );
  const annualRentPaid = Math.max(0, hra.annualRentPaid);
  const rentMinusTenPercentSalary = Math.max(
    0,
    annualRentPaid -
      annualBasicSalaryForHra * IN_HRA_2026.rentSalaryReductionRate,
  );
  const salaryPercentageLimit =
    annualBasicSalaryForHra *
    (hra.isMetroCity
      ? IN_HRA_2026.metroSalaryRate
      : IN_HRA_2026.nonMetroSalaryRate);

  return roundCurrency(
    Math.min(annualHraReceived, rentMinusTenPercentSalary, salaryPercentageLimit),
  );
}

function calculateSection80D(inputs: INCalculatorInputs) {
  if (inputs.regime !== "old") {
    return { selfFamily: 0, parents: 0, total: 0 };
  }

  const selfFamilyLimit = inputs.hasSeniorCitizenSelfOrFamilyFor80D
    ? IN_SECTION_80D_2026.selfFamilySeniorLimit
    : IN_SECTION_80D_2026.selfFamilyLimit;
  const parentsLimit = inputs.hasSeniorCitizenParentsFor80D
    ? IN_SECTION_80D_2026.parentsSeniorLimit
    : IN_SECTION_80D_2026.parentsLimit;
  const selfFamily = roundCurrency(
    clamp(
      inputs.contributions.section80DHealthInsuranceSelfFamily,
      0,
      selfFamilyLimit,
    ),
  );
  const parents = roundCurrency(
    clamp(inputs.contributions.section80DHealthInsuranceParents, 0, parentsLimit),
  );

  return {
    selfFamily,
    parents,
    total: Math.min(IN_SECTION_80D_2026.aggregateLimit, selfFamily + parents),
  };
}

function normalizeINInputs(inputs: INCalculatorInputs): INCalculatorInputs {
  const hasSeniorCitizenSelfOrFamilyFor80D =
    inputs.hasSeniorCitizenSelfOrFamilyFor80D ?? false;
  const hasSeniorCitizenParentsFor80D =
    inputs.hasSeniorCitizenParentsFor80D ?? false;
  const selfFamily80DLimit = hasSeniorCitizenSelfOrFamilyFor80D
    ? IN_SECTION_80D_2026.selfFamilySeniorLimit
    : IN_SECTION_80D_2026.selfFamilyLimit;
  const parents80DLimit = hasSeniorCitizenParentsFor80D
    ? IN_SECTION_80D_2026.parentsSeniorLimit
    : IN_SECTION_80D_2026.parentsLimit;

  return {
    ...inputs,
    regime: inputs.regime ?? "new",
    isEpfApplicable: inputs.isEpfApplicable ?? true,
    professionalTaxPaid: clamp(
      inputs.professionalTaxPaid ?? 0,
      0,
      IN_PROFESSIONAL_TAX_ANNUAL_CAP,
    ),
    hasSeniorCitizenSelfOrFamilyFor80D,
    hasSeniorCitizenParentsFor80D,
    hra: {
      annualHraReceived: Math.max(0, inputs.hra?.annualHraReceived ?? 0),
      annualRentPaid: Math.max(0, inputs.hra?.annualRentPaid ?? 0),
      annualBasicSalaryForHra: Math.max(
        0,
        inputs.hra?.annualBasicSalaryForHra ?? 0,
      ),
      isMetroCity: inputs.hra?.isMetroCity ?? false,
    },
    contributions: {
      section80CInvestments: clamp(
        inputs.contributions?.section80CInvestments ?? 0,
        0,
        IN_SECTION_80C_LIMIT,
      ),
      npsEmployeeContribution: clamp(
        inputs.contributions?.npsEmployeeContribution ?? 0,
        0,
        IN_NPS_80CCD_1B_LIMIT,
      ),
      section80DHealthInsuranceSelfFamily: clamp(
        inputs.contributions?.section80DHealthInsuranceSelfFamily ?? 0,
        0,
        selfFamily80DLimit,
      ),
      section80DHealthInsuranceParents: clamp(
        inputs.contributions?.section80DHealthInsuranceParents ?? 0,
        0,
        parents80DLimit,
      ),
    },
  };
}

export function calculateIN(inputs: INCalculatorInputs): CalculationResult {
  const normalizedInputs = normalizeINInputs(inputs);
  const {
    grossSalary,
    payFrequency,
    regime,
    isEpfApplicable,
    professionalTaxPaid,
    contributions,
  } = normalizedInputs;

  const standardDeduction =
    regime === "new"
      ? IN_STANDARD_DEDUCTION_NEW_REGIME
      : IN_STANDARD_DEDUCTION_OLD_REGIME;

  const epf = calculateEPF(grossSalary, isEpfApplicable);
  const isOldRegime = regime === "old";
  const hraExemption = calculateHraExemption(normalizedInputs);
  const professionalTaxDeduction = isOldRegime ? professionalTaxPaid : 0;
  const section80CDeduction = isOldRegime
    ? Math.min(
        IN_SECTION_80C_LIMIT,
        epf.employee + contributions.section80CInvestments,
      )
    : 0;
  const nps80CCD1BDeduction = isOldRegime
    ? Math.min(
        IN_NPS_80CCD_1B_LIMIT,
        contributions.npsEmployeeContribution,
      )
    : 0;
  const section80DDeduction = calculateSection80D(normalizedInputs);

  const taxableIncomeBase = Math.max(
    0,
    grossSalary -
      hraExemption -
      standardDeduction -
      professionalTaxDeduction -
      section80CDeduction -
      nps80CCD1BDeduction -
      section80DDeduction.total,
  );
  const taxableIncome = Math.round(taxableIncomeBase);

  const taxResult = calculateINProgressiveTax(taxableIncome, regime);
  const grossTax = taxResult.totalTax;

  // 87A rebate
  const rebate = calculateINRebate(taxableIncome, grossTax, regime);
  const taxAfterRebate = Math.max(0, grossTax - rebate);

  // Surcharge
  const surcharge = calculateINSurcharge(taxableIncome, taxAfterRebate);

  // Cess (4% on tax + surcharge)
  const cess = Math.round((taxAfterRebate + surcharge) * IN_CESS_RATE);

  const totalIncomeTax = taxAfterRebate + surcharge + cess;

  const taxes: INTaxBreakdown = {
    type: "IN",
    totalIncomeTax,
    incomeTax: taxAfterRebate,
    surcharge,
    cess,
    epfEmployee: epf.employee,
  };

  const mandatoryDeductions =
    totalIncomeTax + epf.employee + professionalTaxPaid;
  const voluntaryContributions =
    contributions.section80CInvestments +
    contributions.npsEmployeeContribution +
    contributions.section80DHealthInsuranceSelfFamily +
    contributions.section80DHealthInsuranceParents;
  const totalTax = mandatoryDeductions;
  const totalDeductions = totalTax + voluntaryContributions;
  const netSalary = grossSalary - totalDeductions;
  const effectiveTaxRate = grossSalary > 0 ? totalTax / grossSalary : 0;
  const periodsPerYear = getPeriodsPerYear(payFrequency);

  const breakdown: INBreakdown = {
    type: "IN",
    grossIncome: grossSalary,
    regime,
    standardDeduction,
    hraExemption,
    professionalTaxPaid,
    professionalTaxDeduction,
    section80CDeduction,
    nps80CCD1BDeduction,
    section80DDeduction,
    voluntaryContributions: contributions,
    taxableIncome,
    grossTax,
    rebateUnder87A: rebate,
    surcharge,
    cess,
    epf,
    bracketTaxes: taxResult.bracketTaxes,
  };

  return {
    country: "IN",
    currency: "INR",
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

export const INCalculator: CountryCalculator = {
  countryCode: "IN",
  config: IN_CONFIG,

  calculate(inputs: CalculatorInputs): CalculationResult {
    if (inputs.country !== "IN") {
      throw new Error("INCalculator can only calculate IN inputs");
    }
    return calculateIN(inputs as INCalculatorInputs);
  },

  getRegions(): RegionInfo[] {
    return [];
  },

  getContributionLimits(inputs?: Partial<CalculatorInputs>): ContributionLimits {
    const inInputs =
      inputs?.country === "IN" ? (inputs as Partial<INCalculatorInputs>) : {};
    const selfFamily80DLimit = inInputs.hasSeniorCitizenSelfOrFamilyFor80D
      ? IN_SECTION_80D_2026.selfFamilySeniorLimit
      : IN_SECTION_80D_2026.selfFamilyLimit;
    const parents80DLimit = inInputs.hasSeniorCitizenParentsFor80D
      ? IN_SECTION_80D_2026.parentsSeniorLimit
      : IN_SECTION_80D_2026.parentsLimit;

    return {
      section80CInvestments: {
        limit: IN_SECTION_80C_LIMIT,
        name: "Section 80C investments",
        description:
          "Old-regime deduction cap for qualifying 80C investments, combined with employee EPF.",
        preTax: true,
      },
      npsEmployeeContribution: {
        limit: IN_NPS_80CCD_1B_LIMIT,
        name: "NPS employee contribution",
        description:
          "Old-regime additional NPS deduction under Section 80CCD(1B).",
        preTax: true,
      },
      section80DHealthInsuranceSelfFamily: {
        limit: selfFamily80DLimit,
        name: "Section 80D self/family health insurance",
        description:
          "Old-regime Section 80D cap for self, spouse, and dependent children; senior-citizen cases use the higher modeled cap.",
        preTax: true,
      },
      section80DHealthInsuranceParents: {
        limit: parents80DLimit,
        name: "Section 80D parents health insurance",
        description:
          "Old-regime Section 80D cap for parents; senior-citizen parent cases use the higher modeled cap.",
        preTax: true,
      },
      professionalTaxPaid: {
        limit: IN_PROFESSIONAL_TAX_ANNUAL_CAP,
        name: "Professional tax paid",
        description:
          "Employee-paid state professional tax. It reduces cash take-home; section 16(iii) deduction is modeled only under the old regime.",
        preTax: true,
      },
    };
  },

  getDefaultInputs(): INCalculatorInputs {
    return {
      country: "IN",
      grossSalary: 1_500_000,
      payFrequency: "monthly",
      regime: "new",
      isEpfApplicable: true,
      professionalTaxPaid: 0,
      hasSeniorCitizenSelfOrFamilyFor80D: false,
      hasSeniorCitizenParentsFor80D: false,
      hra: {
        annualHraReceived: 0,
        annualRentPaid: 0,
        annualBasicSalaryForHra: 0,
        isMetroCity: false,
      },
      contributions: {
        section80CInvestments: 0,
        npsEmployeeContribution: 0,
        section80DHealthInsuranceSelfFamily: 0,
        section80DHealthInsuranceParents: 0,
      },
    };
  },
};
