import type {
  CalculationResult,
  CalculatorInputs,
  ContributionLimits,
  CountryCalculator,
  RegionInfo,
} from "../types";
import { NZ_CONFIG } from "./config";
import {
  NZ_ACC_EARNERS_LEVY_2026,
  NZ_DONATION_TAX_CREDIT_2026,
  NZ_KIWISAVER_2026,
  NZ_STUDENT_LOAN_2026,
  calculateNzIndependentEarnerTaxCredit,
  calculateNzProgressiveTax,
} from "./constants/tax-year-2026";
import type {
  NZBreakdown,
  NZCalculatorInputs,
  NZContributionInputs,
  NZKiwiSaverRate,
  NZTaxBreakdown,
} from "./types";
import { clampAmount } from "@/lib/utils";
import { getPeriodsPerYear, roundCurrency } from "../calculator-utils";

export function getNzKiwiSaverEmployeeRate(rate: NZKiwiSaverRate): number {
  switch (rate) {
    case "temporary_3":
      return NZ_KIWISAVER_2026.temporaryReducedEmployeeRate;
    case "rate_3_5":
      return 0.035;
    case "rate_4":
      return 0.04;
    case "rate_6":
      return 0.06;
    case "rate_8":
      return 0.08;
    case "rate_10":
      return 0.1;
    case "none":
      return 0;
  }
}

function getNzKiwiSaverEmployerRate(rate: NZKiwiSaverRate): number {
  if (rate === "none") {
    return 0;
  }

  if (rate === "temporary_3") {
    return NZ_KIWISAVER_2026.temporaryReducedEmployerRate;
  }

  return NZ_KIWISAVER_2026.minimumEmployerRate;
}

function normalizeContributions(
  inputs: NZCalculatorInputs,
): NZContributionInputs {
  return {
    kiwiSaverRate: inputs.contributions.kiwiSaverRate,
    payrollGivingDonations: clampAmount(
      inputs.contributions.payrollGivingDonations,
      0,
      Math.max(0, inputs.grossSalary),
    ),
  };
}

function calculateAccEarnersLevy(grossSalary: number) {
  const liableEarnings = clampAmount(grossSalary, NZ_ACC_EARNERS_LEVY_2026.maximumEarnings);
  const earnersLevy = roundCurrency(
    liableEarnings * NZ_ACC_EARNERS_LEVY_2026.rate,
  );

  return { liableEarnings, earnersLevy };
}

function calculateDonationTaxCredit(
  payrollGivingDonations: number,
  taxableIncome: number,
  remainingIncomeTax: number,
) {
  const eligibleDonationAmount =
    payrollGivingDonations >= NZ_DONATION_TAX_CREDIT_2026.minimumGift
      ? Math.min(payrollGivingDonations, taxableIncome)
      : 0;
  const potentialCredit =
    eligibleDonationAmount * NZ_DONATION_TAX_CREDIT_2026.creditRate;
  const appliedCredit = Math.min(potentialCredit, remainingIncomeTax);

  return {
    eligibleDonationAmount,
    potentialCredit,
    appliedCredit,
  };
}

export function calculateNZ(inputs: NZCalculatorInputs): CalculationResult {
  const {
    grossSalary,
    payFrequency,
    residencyType,
    hasStudentLoan,
    claimsIndependentEarnerTaxCredit,
  } = inputs;
  const normalizedContributions = normalizeContributions(inputs);
  const isTaxResident = residencyType === "tax_resident";
  const taxableIncome = Math.max(0, grossSalary);
  const { totalTax: grossIncomeTaxRaw, bracketTaxes } =
    calculateNzProgressiveTax(taxableIncome);
  const grossIncomeTax = roundCurrency(grossIncomeTaxRaw);
  const independentEarnerTaxCreditEligible =
    isTaxResident && claimsIndependentEarnerTaxCredit;
  const independentEarnerTaxCredit = independentEarnerTaxCreditEligible
    ? Math.min(
        calculateNzIndependentEarnerTaxCredit(taxableIncome),
        grossIncomeTax,
      )
    : 0;
  const taxAfterIetc = Math.max(0, grossIncomeTax - independentEarnerTaxCredit);
  const donationCredit = calculateDonationTaxCredit(
    normalizedContributions.payrollGivingDonations,
    taxableIncome,
    taxAfterIetc,
  );
  const donationTaxCredit = roundCurrency(donationCredit.appliedCredit);
  const incomeTax = roundCurrency(
    Math.max(0, taxAfterIetc - donationTaxCredit),
  );
  const acc = calculateAccEarnersLevy(grossSalary);
  const studentLoanRepayment = hasStudentLoan
    ? roundCurrency(
        Math.max(0, grossSalary - NZ_STUDENT_LOAN_2026.annualThreshold) *
          NZ_STUDENT_LOAN_2026.repaymentRate,
      )
    : 0;
  const kiwiSaverEmployeeRate = getNzKiwiSaverEmployeeRate(
    normalizedContributions.kiwiSaverRate,
  );
  const kiwiSaverEmployerRate = getNzKiwiSaverEmployerRate(
    normalizedContributions.kiwiSaverRate,
  );
  const employeeKiwiSaver = roundCurrency(
    Math.max(0, grossSalary) * kiwiSaverEmployeeRate,
  );
  const employerKiwiSaver = roundCurrency(
    Math.max(0, grossSalary) * kiwiSaverEmployerRate,
  );

  const taxes: NZTaxBreakdown = {
    type: "NZ",
    totalIncomeTax: incomeTax,
    grossIncomeTax,
    incomeTax,
    independentEarnerTaxCredit: roundCurrency(independentEarnerTaxCredit),
    donationTaxCredit,
    accEarnersLevy: acc.earnersLevy,
    studentLoanRepayment,
  };

  const totalTax =
    taxes.incomeTax + taxes.accEarnersLevy + taxes.studentLoanRepayment;
  const voluntaryContributions =
    employeeKiwiSaver + normalizedContributions.payrollGivingDonations;
  const totalDeductions = totalTax + voluntaryContributions;
  const netSalary = grossSalary - totalDeductions;
  const effectiveTaxRate = grossSalary > 0 ? totalTax / grossSalary : 0;
  const periodsPerYear = getPeriodsPerYear(payFrequency);
  const bracketTaxesRounded = bracketTaxes.map((bracket) => ({
    ...bracket,
    tax: roundCurrency(bracket.tax),
  }));

  const breakdown: NZBreakdown = {
    type: "NZ",
    grossIncome: grossSalary,
    residencyType,
    isTaxResident,
    taxableIncome,
    bracketTaxes: bracketTaxesRounded,
    taxCredits: {
      independentEarnerTaxCredit: taxes.independentEarnerTaxCredit,
      independentEarnerTaxCreditEligible,
      donationTaxCredit,
      donationTaxCreditPotential: roundCurrency(donationCredit.potentialCredit),
      donationCreditAppliedAgainstIncomeTaxOnly:
        donationCredit.potentialCredit > donationTaxCredit,
    },
    acc: {
      earnersLevy: acc.earnersLevy,
      rate: NZ_ACC_EARNERS_LEVY_2026.rate,
      liableEarnings: acc.liableEarnings,
      maximumEarnings: NZ_ACC_EARNERS_LEVY_2026.maximumEarnings,
      maximumLevy: NZ_ACC_EARNERS_LEVY_2026.maximumLevy,
      period: NZ_ACC_EARNERS_LEVY_2026.period,
    },
    studentLoan: {
      applies: hasStudentLoan,
      repayment: studentLoanRepayment,
      repaymentRate: NZ_STUDENT_LOAN_2026.repaymentRate,
      annualThreshold: NZ_STUDENT_LOAN_2026.annualThreshold,
    },
    kiwiSaver: {
      employeeRate: kiwiSaverEmployeeRate,
      employeeContribution: employeeKiwiSaver,
      employerRate: kiwiSaverEmployerRate,
      employerContributionBeforeEsct: employerKiwiSaver,
      defaultEmployeeRate: NZ_KIWISAVER_2026.defaultEmployeeRate,
      minimumEmployerRate: NZ_KIWISAVER_2026.minimumEmployerRate,
    },
    donations: {
      payrollGivingDonations: normalizedContributions.payrollGivingDonations,
      eligibleDonationAmount: donationCredit.eligibleDonationAmount,
      minimumGift: NZ_DONATION_TAX_CREDIT_2026.minimumGift,
      creditRate: NZ_DONATION_TAX_CREDIT_2026.creditRate,
    },
    assumptions: [
      "Ordinary New Zealand salary or wages for one PAYE job.",
      "ACC earners' levy uses the GST-inclusive employee levy rate.",
      "KiwiSaver employer contributions are shown before ESCT and are not included in take-home pay.",
      "Working for Families, paid parental leave, benefits, secondary tax codes, tailored tax codes, and non-salary income are not modeled.",
    ],
    sourceUrls: [
      "https://www.ird.govt.nz/en/income-tax/income-tax-for-individuals/tax-codes-and-tax-rates-for-individuals/tax-rates-for-individuals",
      "https://www.ird.govt.nz/acclevy",
      "https://www.ird.govt.nz/kiwisaver/kiwisaver-individuals/employee-contributions",
      "https://www.ird.govt.nz/kiwisaver/kiwisaver-for-employers/contributions-and-deductions/employer-contributions-to-kiwisaver-and-complying-funds",
      "https://www.ird.govt.nz/ietc",
      "https://www.ird.govt.nz/en/student-loans/living-in-new-zealand-with-a-student-loan/repaying-my-student-loan-when-i-earn-salary-or-wages",
      "https://www.ird.govt.nz/donations",
    ],
  };

  return {
    country: "NZ",
    currency: "NZD",
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

export const NZCalculator: CountryCalculator = {
  countryCode: "NZ",
  config: NZ_CONFIG,

  calculate(inputs: CalculatorInputs): CalculationResult {
    if (inputs.country !== "NZ") {
      throw new Error("NZCalculator can only calculate NZ inputs");
    }

    return calculateNZ(inputs);
  },

  getRegions(): RegionInfo[] {
    return [];
  },

  getContributionLimits(inputs?: Partial<CalculatorInputs>): ContributionLimits {
    const nzInputs = inputs as Partial<NZCalculatorInputs> | undefined;
    const grossSalary = Math.max(0, nzInputs?.grossSalary ?? 85_000);

    return {
      payrollGivingDonations: {
        limit: grossSalary,
        name: "Payroll Giving Donations",
        description:
          "Eligible donations to approved donee organisations are modeled up to annual taxable income, with a one-third tax credit applied against income tax in this salary estimate.",
        preTax: false,
      },
    };
  },

  getDefaultInputs(): NZCalculatorInputs {
    return {
      country: "NZ",
      grossSalary: 85_000,
      payFrequency: "monthly",
      residencyType: "tax_resident",
      hasStudentLoan: false,
      claimsIndependentEarnerTaxCredit: false,
      contributions: {
        kiwiSaverRate: "none",
        payrollGivingDonations: 0,
      },
    };
  },
};
