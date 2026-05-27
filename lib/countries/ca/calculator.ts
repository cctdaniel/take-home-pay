import type {
  CalculationResult,
  CalculatorInputs,
  ContributionLimits,
  CountryCalculator,
  PayFrequency,
  RegionInfo,
  TaxBracket,
} from "../types";
import { CA_CONFIG } from "./config";
import {
  calculateCanadaChildcareLimit,
  calculateCanadaCharitableDonationLimit,
  calculateCanadaFederalBasicPersonalAmount,
  calculateCanadaProvincialBasicPersonalAmount,
  CANADA_CHARITABLE_DONATION_CREDIT_2026,
  CANADA_CPP_2026,
  CANADA_CPP_BASE_EMPLOYEE_RATE_2026,
  CANADA_EI_2026,
  CANADA_EMPLOYMENT_AMOUNT_2026,
  CANADA_FEDERAL_CREDIT_RATE_2026,
  CANADA_FEDERAL_TAX_BRACKETS_2026,
  CANADA_FHSA_2026,
  CANADA_PROVINCES,
  CANADA_PROVINCIAL_TAX_BRACKETS_2026,
  CANADA_QPP_BASE_EMPLOYEE_RATE_2026,
  CANADA_QPP_2026,
  CANADA_QUEBEC_ABATEMENT_RATE_2026,
  CANADA_QUEBEC_WORKERS_DEDUCTION_2026,
  CANADA_RPP_2026,
  CANADA_RRSP_2026,
  CANADA_SOURCE_URLS,
  ONTARIO_HEALTH_PREMIUM_2026,
  ONTARIO_SURTAX_2026,
  QUEBEC_EI_2026,
  QUEBEC_QPIP_2026,
} from "./constants/tax-year-2026";
import type {
  CABreakdown,
  CACalculatorInputs,
  CAFederalFamilyCreditType,
  CATaxBreakdown,
} from "./types";
import type { CanadaProvinceCode } from "./constants/tax-year-2026";

function getPeriodsPerYear(frequency: PayFrequency): number {
  switch (frequency) {
    case "annual": return 1;
    case "monthly": return 12;
    case "biweekly": return 26;
    case "weekly": return 52;
  }
}

function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}

function clampContribution(value: number | undefined, limit: number): number {
  return Math.min(Math.max(0, value ?? 0), Math.max(0, limit));
}

function calculateProgressiveTax(income: number, brackets: TaxBracket[]) {
  let totalTax = 0;
  const bracketTaxes = brackets.map((bracket) => {
    const taxableAtBracket = Math.max(0, Math.min(income, bracket.max) - bracket.min);
    const tax = roundCurrency(taxableAtBracket * bracket.rate);
    totalTax += tax;
    return { ...bracket, tax };
  });
  return { totalTax: roundCurrency(totalTax), bracketTaxes };
}

function getProvince(province: CanadaProvinceCode) {
  return CANADA_PROVINCES.find((candidate) => candidate.code === province) ?? CANADA_PROVINCES[8];
}

function calculatePension(pensionableIncome: number, province: CanadaProvinceCode) {
  const isQuebec = province === "QC";
  const plan = isQuebec ? CANADA_QPP_2026 : CANADA_CPP_2026;
  const pensionableEarnings = Math.max(
    0,
    Math.min(pensionableIncome, plan.maximumPensionableEarnings) - plan.basicExemption,
  );
  const base = Math.min(
    plan.maximumEmployeeContribution,
    roundCurrency(pensionableEarnings * plan.employeeRate),
  );
  const additionalPensionableEarnings = Math.max(
    0,
    Math.min(pensionableIncome, plan.maximumAdditionalPensionableEarnings) -
      plan.maximumPensionableEarnings,
  );
  const secondAdditional = Math.min(
    plan.maximumSecondAdditionalEmployeeContribution,
    roundCurrency(additionalPensionableEarnings * plan.secondAdditionalEmployeeRate),
  );

  return {
    planName: isQuebec ? "QPP" as const : "CPP" as const,
    base,
    secondAdditional,
    pensionableEarnings,
    additionalPensionableEarnings,
    employeeRate: plan.employeeRate,
    maximumEmployeeContribution: plan.maximumEmployeeContribution,
    secondAdditionalEmployeeRate: plan.secondAdditionalEmployeeRate,
    maximumSecondAdditionalEmployeeContribution: plan.maximumSecondAdditionalEmployeeContribution,
  };
}

function calculateFederalFamilyAmount({
  familyCreditType,
  dependentNetIncome,
  maximumAmount,
}: {
  familyCreditType: CAFederalFamilyCreditType;
  dependentNetIncome: number;
  maximumAmount: number;
}) {
  if (familyCreditType === "none") {
    return 0;
  }

  return Math.max(0, maximumAmount - Math.max(0, dependentNetIncome));
}

function calculateFederalDonationCredit({
  claimedDonations,
  taxableIncome,
}: {
  claimedDonations: number;
  taxableIncome: number;
}) {
  const firstAmount = Math.min(
    claimedDonations,
    CANADA_CHARITABLE_DONATION_CREDIT_2026.firstAmount,
  );
  const excessDonations = Math.max(0, claimedDonations - firstAmount);
  const topFederalThreshold =
    CANADA_FEDERAL_TAX_BRACKETS_2026[
      CANADA_FEDERAL_TAX_BRACKETS_2026.length - 1
    ]?.min ?? Infinity;
  const highIncomeDonationRoom = Math.max(0, taxableIncome - topFederalThreshold);
  const highIncomeDonations = Math.min(
    excessDonations,
    highIncomeDonationRoom,
  );
  const regularExcessDonations = Math.max(
    0,
    excessDonations - highIncomeDonations,
  );

  return roundCurrency(
    firstAmount *
      CANADA_CHARITABLE_DONATION_CREDIT_2026.federalFirstRate +
      regularExcessDonations *
        CANADA_CHARITABLE_DONATION_CREDIT_2026.federalOverRate +
      highIncomeDonations *
        CANADA_CHARITABLE_DONATION_CREDIT_2026.federalHighIncomeRate,
  );
}

function calculateProvincialDonationCredit({
  claimedDonations,
  taxableIncome,
  province,
}: {
  claimedDonations: number;
  taxableIncome: number;
  province: CanadaProvinceCode;
}) {
  const rateConfig =
    CANADA_CHARITABLE_DONATION_CREDIT_2026.provincialRates[province];
  const firstAmount = Math.min(
    claimedDonations,
    CANADA_CHARITABLE_DONATION_CREDIT_2026.firstAmount,
  );
  const excessDonations = Math.max(0, claimedDonations - firstAmount);
  const topRateRoom =
    rateConfig.topRate && rateConfig.topThreshold
      ? Math.max(0, taxableIncome - rateConfig.topThreshold)
      : 0;
  const topRateDonations = Math.min(excessDonations, topRateRoom);
  const regularExcessDonations = Math.max(
    0,
    excessDonations - topRateDonations,
  );

  return roundCurrency(
    firstAmount * rateConfig.firstRate +
      regularExcessDonations * rateConfig.overRate +
      topRateDonations * (rateConfig.topRate ?? rateConfig.overRate),
  );
}

function calculateOntarioSurtax(ontarioTaxAfterCredits: number) {
  return roundCurrency(
    Math.max(
      0,
      (ontarioTaxAfterCredits - ONTARIO_SURTAX_2026.firstThreshold) *
        ONTARIO_SURTAX_2026.firstRate,
    ) +
      Math.max(
        0,
        (ontarioTaxAfterCredits - ONTARIO_SURTAX_2026.secondThreshold) *
          ONTARIO_SURTAX_2026.secondRate,
      ),
  );
}

function calculateOntarioHealthPremium(taxableIncome: number) {
  if (taxableIncome <= ONTARIO_HEALTH_PREMIUM_2026.firstThreshold) {
    return 0;
  }

  if (taxableIncome <= ONTARIO_HEALTH_PREMIUM_2026.secondThreshold) {
    return roundCurrency(
      Math.min(
        ONTARIO_HEALTH_PREMIUM_2026.firstIncrementCap,
        taxableIncome - ONTARIO_HEALTH_PREMIUM_2026.firstThreshold,
      ) * ONTARIO_HEALTH_PREMIUM_2026.firstIncrementRate,
    );
  }

  if (taxableIncome <= ONTARIO_HEALTH_PREMIUM_2026.thirdThreshold) {
    return roundCurrency(
      ONTARIO_HEALTH_PREMIUM_2026.secondBase +
        Math.min(
          ONTARIO_HEALTH_PREMIUM_2026.secondIncrementCap,
          taxableIncome - ONTARIO_HEALTH_PREMIUM_2026.secondThreshold,
        ) *
          ONTARIO_HEALTH_PREMIUM_2026.secondIncrementRate,
    );
  }

  if (taxableIncome <= ONTARIO_HEALTH_PREMIUM_2026.fourthThreshold) {
    return roundCurrency(
      ONTARIO_HEALTH_PREMIUM_2026.thirdBase +
        Math.min(
          ONTARIO_HEALTH_PREMIUM_2026.thirdIncrementCap,
          taxableIncome - ONTARIO_HEALTH_PREMIUM_2026.thirdThreshold,
        ) *
          ONTARIO_HEALTH_PREMIUM_2026.thirdIncrementRate,
    );
  }

  if (taxableIncome <= ONTARIO_HEALTH_PREMIUM_2026.fifthThreshold) {
    return roundCurrency(
      ONTARIO_HEALTH_PREMIUM_2026.fourthBase +
        Math.min(
          ONTARIO_HEALTH_PREMIUM_2026.fourthIncrementCap,
          taxableIncome - ONTARIO_HEALTH_PREMIUM_2026.fourthThreshold,
        ) *
          ONTARIO_HEALTH_PREMIUM_2026.fourthIncrementRate,
    );
  }

  return roundCurrency(
    ONTARIO_HEALTH_PREMIUM_2026.fifthBase +
      Math.min(
        ONTARIO_HEALTH_PREMIUM_2026.fifthIncrementCap,
        taxableIncome - ONTARIO_HEALTH_PREMIUM_2026.fifthThreshold,
      ) *
        ONTARIO_HEALTH_PREMIUM_2026.fifthIncrementRate,
  );
}

export function calculateCA(inputs: CACalculatorInputs): CalculationResult {
  const cashGrossSalary = Math.max(0, inputs.grossSalary);
  const taxableNonCashBenefits = roundCurrency(
    Math.max(0, inputs.taxableNonCashBenefits ?? 0),
  );
  const taxableGrossIncome = cashGrossSalary + taxableNonCashBenefits;
  const pensionableEmploymentIncome =
    cashGrossSalary > 0 ? taxableGrossIncome : cashGrossSalary;
  const province = getProvince(inputs.province ?? "ON");
  const familyCreditType = inputs.federalFamilyCreditType ?? "none";
  const federalFamilyCreditDependentNetIncome = Math.max(
    0,
    inputs.federalFamilyCreditDependentNetIncome ?? 0,
  );
  const numberOfChildrenUnder7 = Math.max(
    0,
    Math.floor(inputs.numberOfChildrenUnder7 ?? 0),
  );
  const numberOfChildrenAge7To16 = Math.max(
    0,
    Math.floor(inputs.numberOfChildrenAge7To16 ?? 0),
  );
  const numberOfDisabledChildren = Math.max(
    0,
    Math.floor(inputs.numberOfDisabledChildren ?? 0),
  );
  const rrspContributionLimit = Math.min(
    taxableGrossIncome * CANADA_RRSP_2026.contributionRateLimit,
    CANADA_RRSP_2026.annualDollarLimit,
  );
  const registeredPensionContributionLimit = Math.min(
    taxableGrossIncome * CANADA_RPP_2026.modeledContributionRateLimit,
    CANADA_RPP_2026.moneyPurchaseDollarLimit,
  );
  const rrspContribution = clampContribution(
    inputs.contributions?.rrspContribution,
    rrspContributionLimit,
  );
  const fhsaContribution = clampContribution(
    inputs.contributions?.fhsaContribution,
    CANADA_FHSA_2026.annualDollarLimit,
  );
  const registeredPensionContribution = clampContribution(
    inputs.contributions?.registeredPensionContribution,
    registeredPensionContributionLimit,
  );
  const unionDues = Math.max(0, inputs.contributions?.unionDues ?? 0);
  const requestedChildcareExpenses = Math.max(
    0,
    inputs.contributions?.childcareExpenses ?? 0,
  );
  const childcareExpenseLimit = calculateCanadaChildcareLimit({
    grossSalary: taxableGrossIncome,
    numberOfChildrenUnder7,
    numberOfChildrenAge7To16,
    numberOfDisabledChildren,
  });
  const childcareExpenses = clampContribution(
    requestedChildcareExpenses,
    childcareExpenseLimit,
  );

  const pension = calculatePension(pensionableEmploymentIncome, province.code);
  const basePensionRate = province.code === "QC"
    ? CANADA_QPP_BASE_EMPLOYEE_RATE_2026
    : CANADA_CPP_BASE_EMPLOYEE_RATE_2026;
  const basePensionCreditAmount = roundCurrency(
    pension.base * (basePensionRate / pension.employeeRate),
  );
  const enhancedPensionDeduction = roundCurrency(
    Math.max(0, pension.base - basePensionCreditAmount) +
      pension.secondAdditional,
  );
  const preTaxDeductions =
    rrspContribution +
    fhsaContribution +
    registeredPensionContribution +
    unionDues +
    childcareExpenses +
    enhancedPensionDeduction;
  const taxableIncome = Math.max(0, taxableGrossIncome - preTaxDeductions);
  const charitableDonationLimit = calculateCanadaCharitableDonationLimit({
    grossSalary: taxableGrossIncome,
    province: province.code,
    rrspContribution,
    fhsaContribution,
    registeredPensionContribution,
    unionDues,
    childcareExpenses,
  });
  const charitableDonations = clampContribution(
    inputs.contributions?.charitableDonations,
    charitableDonationLimit,
  );
  const federalDonationCredit = calculateFederalDonationCredit({
    claimedDonations: charitableDonations,
    taxableIncome,
  });
  const provincialDonationCredit = calculateProvincialDonationCredit({
    claimedDonations: charitableDonations,
    taxableIncome,
    province: province.code,
  });

  const quebecWorkersDeduction = province.code === "QC"
    ? Math.min(
        CANADA_QUEBEC_WORKERS_DEDUCTION_2026.maximum,
        cashGrossSalary * CANADA_QUEBEC_WORKERS_DEDUCTION_2026.rate,
      )
    : 0;
  const provincialTaxableIncome = Math.max(0, taxableIncome - quebecWorkersDeduction);

  const federal = calculateProgressiveTax(
    taxableIncome,
    CANADA_FEDERAL_TAX_BRACKETS_2026,
  );
  const provincialBeforeCredits = calculateProgressiveTax(
    provincialTaxableIncome,
    CANADA_PROVINCIAL_TAX_BRACKETS_2026[province.code],
  );

  const eiConfig = province.code === "QC" ? QUEBEC_EI_2026 : CANADA_EI_2026;
  const insurableEarnings = Math.min(cashGrossSalary, eiConfig.maximumInsurableEarnings);
  const ei = Math.min(
    eiConfig.maximumEmployeePremium,
    roundCurrency(insurableEarnings * eiConfig.employeeRate),
  );
  const qpipInsurableEarnings = Math.min(
    cashGrossSalary,
    QUEBEC_QPIP_2026.maximumInsurableEarnings,
  );
  const qpip = province.code === "QC"
    ? Math.min(
        QUEBEC_QPIP_2026.maximumEmployeePremium,
        roundCurrency(qpipInsurableEarnings * QUEBEC_QPIP_2026.employeeRate),
      )
    : 0;

  const federalBasicPersonalAmount =
    calculateCanadaFederalBasicPersonalAmount(taxableIncome);
  const federalFamilyAmount = calculateFederalFamilyAmount({
    familyCreditType,
    dependentNetIncome: federalFamilyCreditDependentNetIncome,
    maximumAmount: federalBasicPersonalAmount,
  });
  const canadaEmploymentAmount = Math.min(
    taxableGrossIncome,
    CANADA_EMPLOYMENT_AMOUNT_2026,
  );
  const federalBaseTaxCredits = roundCurrency(
    CANADA_FEDERAL_CREDIT_RATE_2026 *
      (federalBasicPersonalAmount +
        federalFamilyAmount +
        canadaEmploymentAmount +
        basePensionCreditAmount +
        ei +
        qpip),
  );
  const federalTaxCredits = Math.min(
    federal.totalTax,
    roundCurrency(federalBaseTaxCredits + federalDonationCredit),
  );
  const federalDonationCreditApplied = Math.min(
    federalDonationCredit,
    Math.max(0, federal.totalTax - federalBaseTaxCredits),
  );
  const federalIncomeTaxBeforeQuebecAbatement = Math.max(
    0,
    federal.totalTax - federalTaxCredits,
  );
  const quebecAbatement = province.code === "QC"
    ? roundCurrency(
        federalIncomeTaxBeforeQuebecAbatement *
          CANADA_QUEBEC_ABATEMENT_RATE_2026,
      )
    : 0;
  const federalIncomeTax = roundCurrency(
    Math.max(0, federalIncomeTaxBeforeQuebecAbatement - quebecAbatement),
  );

  const provincialBasicPersonalAmount =
    calculateCanadaProvincialBasicPersonalAmount({
      province: province.code,
      taxableIncome: provincialTaxableIncome,
    });
  const provincialCreditRate =
    CANADA_PROVINCIAL_TAX_BRACKETS_2026[province.code][0]?.rate ?? 0;
  const provincialBaseTaxCredits = roundCurrency(
    provincialCreditRate *
      (provincialBasicPersonalAmount +
        basePensionCreditAmount +
        ei +
        qpip),
  );
  const provincialTaxCredits = Math.min(
    provincialBeforeCredits.totalTax,
    roundCurrency(provincialBaseTaxCredits + provincialDonationCredit),
  );
  const provincialDonationCreditApplied = Math.min(
    provincialDonationCredit,
    Math.max(0, provincialBeforeCredits.totalTax - provincialBaseTaxCredits),
  );
  const provincialTaxAfterCredits = Math.max(
    0,
    provincialBeforeCredits.totalTax - provincialTaxCredits,
  );
  const ontarioSurtax = province.code === "ON"
    ? calculateOntarioSurtax(provincialTaxAfterCredits)
    : 0;
  const ontarioHealthPremium = province.code === "ON"
    ? calculateOntarioHealthPremium(taxableIncome)
    : 0;
  const provincialIncomeTax = roundCurrency(
    provincialTaxAfterCredits + ontarioSurtax + ontarioHealthPremium,
  );

  const taxes: CATaxBreakdown = {
    type: "CA",
    totalIncomeTax: federalIncomeTax + provincialIncomeTax,
    incomeTax: federalIncomeTax,
    provincialIncomeTax,
    cpp: province.code === "QC" ? 0 : pension.base,
    cpp2: province.code === "QC" ? 0 : pension.secondAdditional,
    qpp: province.code === "QC" ? pension.base : 0,
    qpp2: province.code === "QC" ? pension.secondAdditional : 0,
    qpip,
    ei,
    federalIncomeTaxBeforeCredits: federal.totalTax,
    federalTaxCredits,
    quebecAbatement,
    provincialIncomeTaxBeforeCredits: provincialBeforeCredits.totalTax,
    provincialTaxCredits,
    ontarioSurtax,
    ontarioHealthPremium,
  };
  const statutoryPayroll = pension.base + pension.secondAdditional + ei + qpip;
  const totalTax = taxes.totalIncomeTax + statutoryPayroll;
  const voluntaryContributions =
    rrspContribution +
    fhsaContribution +
    registeredPensionContribution +
    unionDues +
    childcareExpenses +
    charitableDonations;
  const totalDeductions = totalTax + voluntaryContributions;
  const netSalary = cashGrossSalary - totalDeductions;
  const effectiveTaxRate = cashGrossSalary > 0 ? totalTax / cashGrossSalary : 0;
  const periodsPerYear = getPeriodsPerYear(inputs.payFrequency);

  const breakdown: CABreakdown = {
    type: "CA",
    grossIncome: cashGrossSalary,
    taxableNonCashBenefits,
    taxableGrossIncome,
    taxableIncome,
    provincialTaxableIncome,
    province: province.code,
    provinceName: province.name,
    federalBracketTaxes: federal.bracketTaxes,
    provincialBracketTaxes: provincialBeforeCredits.bracketTaxes,
    pension: {
      plan: pension.planName,
      pensionableEarnings: pension.pensionableEarnings,
      employeeRate: pension.employeeRate,
      maximumEmployeeContribution: pension.maximumEmployeeContribution,
      additionalPensionableEarnings: pension.additionalPensionableEarnings,
      secondAdditionalEmployeeRate: pension.secondAdditionalEmployeeRate,
      maximumSecondAdditionalEmployeeContribution:
        pension.maximumSecondAdditionalEmployeeContribution,
    },
    ei: {
      insurableEarnings,
      employeeRate: eiConfig.employeeRate,
      maximumEmployeePremium: eiConfig.maximumEmployeePremium,
    },
    qpip: province.code === "QC" ? {
      insurableEarnings: qpipInsurableEarnings,
      employeeRate: QUEBEC_QPIP_2026.employeeRate,
      maximumEmployeePremium: QUEBEC_QPIP_2026.maximumEmployeePremium,
    } : undefined,
    taxCredits: {
      federalBasicPersonalAmount,
      federalFamilyAmount,
      canadaEmploymentAmount,
      basePensionCreditAmount,
      eiPremiumCreditAmount: ei,
      qpipPremiumCreditAmount: qpip,
      federalCredit: federalTaxCredits,
      federalDonationCredit: federalDonationCreditApplied,
      provincialBasicPersonalAmount,
      provincialCredit: provincialTaxCredits,
      provincialDonationCredit: provincialDonationCreditApplied,
      quebecAbatement,
      ontarioSurtax,
      ontarioHealthPremium,
    },
    childcare: {
      requestedExpenses: requestedChildcareExpenses,
      allowedExpenses: childcareExpenses,
      limit: childcareExpenseLimit,
      numberOfChildrenUnder7,
      numberOfChildrenAge7To16,
      numberOfDisabledChildren,
    },
    taxableIncomeDeductions: {
      enhancedPensionDeduction,
      quebecWorkersDeduction,
    },
    voluntaryContributions: {
      rrspContribution,
      rrspContributionLimit,
      fhsaContribution,
      fhsaContributionLimit: CANADA_FHSA_2026.annualDollarLimit,
      registeredPensionContribution,
      registeredPensionContributionLimit,
      unionDues,
      childcareExpenses,
      charitableDonations,
      charitableDonationLimit,
      charitableDonationCredit: roundCurrency(
        federalDonationCreditApplied + provincialDonationCreditApplied,
      ),
      total: voluntaryContributions,
    },
    assumptions: [
      `Uses 2026 federal and ${province.name} provincial/territorial tax brackets with the basic personal amount and modeled CPP/QPP, EI, and QPIP non-refundable credits.`,
      province.code === "QC"
        ? "Quebec uses QPP/QPP2, QPIP, the reduced Quebec EI employee rate, the federal Quebec abatement, and the Quebec worker deduction."
        : "Models base CPP, second additional CPP, and federal EI employee contributions.",
      taxableNonCashBenefits > 0
        ? "Taxable non-cash benefits are included in taxable employment income and CPP/QPP pensionable earnings when cash salary is also paid; the generic benefit input does not add EI or QPIP insurable earnings."
        : "Taxable non-cash benefits can be entered separately from cash salary; the generic benefit input does not add EI or QPIP insurable earnings.",
      province.code === "ON"
        ? "Ontario provincial tax includes the modeled Ontario surtax and Ontario Health Premium."
        : `${province.name} provincial/territorial tax is calculated from the selected brackets and modeled non-refundable credits.`,
      "Models RRSP, FHSA, registered pension plan contributions, union dues, the enhanced CPP/QPP deduction, and capped childcare expenses as taxable-income deductions.",
      "Models federal and provincial/territorial charitable donation credits on claimed eligible gifts up to 75% of modeled net income, using the selected province or Quebec credit rates.",
      "The federal spouse/common-law or eligible-dependant amount is modeled when selected. Canada child/family benefit programs, medical credits, exact TD1 claim code changes, and employer-only payroll costs are separate items outside this salary take-home view.",
    ],
    sourceUrls: CANADA_SOURCE_URLS,
  };

  return {
    country: "CA",
    currency: "CAD",
    grossSalary: cashGrossSalary,
    taxableIncome,
    taxes,
    totalTax,
    totalDeductions,
    netSalary,
    effectiveTaxRate,
    perPeriod: {
      gross: cashGrossSalary / periodsPerYear,
      net: netSalary / periodsPerYear,
      frequency: inputs.payFrequency,
    },
    breakdown,
  };
}

export const CACalculator: CountryCalculator = {
  countryCode: "CA",
  config: CA_CONFIG,

  calculate(inputs: CalculatorInputs): CalculationResult {
    if (inputs.country !== "CA") {
      throw new Error("CACalculator can only calculate CA inputs");
    }
    return calculateCA(inputs as CACalculatorInputs);
  },

  getRegions(): RegionInfo[] {
    return CANADA_PROVINCES.map((province) => ({
      code: province.code,
      name: province.name,
      taxType: "progressive",
      notes: province.code === "QC"
        ? "Uses Quebec provincial brackets with QPP/QPP2, QPIP, and reduced EI."
        : "Uses provincial/territorial brackets with CPP/CPP2 and EI.",
    }));
  },

  getContributionLimits(inputs?: Partial<CalculatorInputs>): ContributionLimits {
    const caInputs = inputs as Partial<CACalculatorInputs> | undefined;
    const cashGrossSalary = Math.max(0, caInputs?.grossSalary ?? 0);
    const taxableGrossIncome =
      cashGrossSalary + Math.max(0, caInputs?.taxableNonCashBenefits ?? 0);
    const childcareLimit = calculateCanadaChildcareLimit({
      grossSalary: taxableGrossIncome,
      numberOfChildrenUnder7: caInputs?.numberOfChildrenUnder7 ?? 0,
      numberOfChildrenAge7To16: caInputs?.numberOfChildrenAge7To16 ?? 0,
      numberOfDisabledChildren: caInputs?.numberOfDisabledChildren ?? 0,
    });
    const province = caInputs?.province ?? "ON";
    const rrspContribution = clampContribution(
      caInputs?.contributions?.rrspContribution,
      Math.min(
        taxableGrossIncome * CANADA_RRSP_2026.contributionRateLimit,
        CANADA_RRSP_2026.annualDollarLimit,
      ),
    );
    const fhsaContribution = clampContribution(
      caInputs?.contributions?.fhsaContribution,
      CANADA_FHSA_2026.annualDollarLimit,
    );
    const registeredPensionContribution = clampContribution(
      caInputs?.contributions?.registeredPensionContribution,
      Math.min(
        taxableGrossIncome * CANADA_RPP_2026.modeledContributionRateLimit,
        CANADA_RPP_2026.moneyPurchaseDollarLimit,
      ),
    );
    const unionDues = Math.max(0, caInputs?.contributions?.unionDues ?? 0);
    const childcareExpenses = clampContribution(
      caInputs?.contributions?.childcareExpenses,
      childcareLimit,
    );
    const charitableDonationLimit = calculateCanadaCharitableDonationLimit({
      grossSalary: taxableGrossIncome,
      province,
      rrspContribution,
      fhsaContribution,
      registeredPensionContribution,
      unionDues,
      childcareExpenses,
    });

    return {
      rrspContribution: {
        limit: CANADA_RRSP_2026.annualDollarLimit,
        name: "RRSP contribution",
        description: "Modeled RRSP taxable-income deduction",
        preTax: true,
      },
      fhsaContribution: {
        limit: CANADA_FHSA_2026.annualDollarLimit,
        name: "FHSA contribution",
        description: "Modeled FHSA taxable-income deduction",
        preTax: true,
      },
      registeredPensionContribution: {
        limit: CANADA_RPP_2026.moneyPurchaseDollarLimit,
        name: "Registered pension contribution",
        description: "Modeled registered pension/RPP taxable-income deduction",
        preTax: true,
      },
      unionDues: {
        limit: Number.POSITIVE_INFINITY,
        name: "Union/professional dues",
        description: "Modeled taxable-income deduction",
        preTax: true,
      },
      childcareExpenses: {
        limit: childcareLimit,
        name: "Childcare expenses",
        description: "Modeled line 21400 child care expense deduction cap",
        preTax: true,
      },
      charitableDonations: {
        limit: charitableDonationLimit,
        name: "Claimed charitable donations",
        description:
          "Federal line 34900 and provincial/territorial line 58969 non-refundable donation credits, modeled up to 75% of net income.",
        preTax: false,
      },
    };
  },

  getDefaultInputs(): CACalculatorInputs {
    return {
      country: "CA",
      grossSalary: 90_000,
      payFrequency: "monthly",
      province: "ON",
      taxableNonCashBenefits: 0,
      federalFamilyCreditType: "none",
      federalFamilyCreditDependentNetIncome: 0,
      numberOfChildrenUnder7: 0,
      numberOfChildrenAge7To16: 0,
      numberOfDisabledChildren: 0,
      contributions: {
        rrspContribution: 0,
        fhsaContribution: 0,
        registeredPensionContribution: 0,
        unionDues: 0,
        childcareExpenses: 0,
        charitableDonations: 0,
      },
    };
  },
};
