// ============================================================================
// CANADA CALCULATOR IMPLEMENTATION
// ============================================================================
// Sources:
// - Federal/CPP/EI: CRA T4127 Payroll Deductions Formulas (122nd Edition)
//   https://www.canada.ca/en/revenue-agency/services/forms-publications/payroll/t4127-payroll-deductions-formulas/
// - Provincial rates: Various provincial finance ministry publications
// ============================================================================

import type {
  CABreakdown,
  CACalculatorInputs,
  CATaxBreakdown,
  CalculationResult,
  CalculatorInputs,
  ContributionLimits,
  CountryCalculator,
  PayFrequency,
  RegionInfo,
} from "../types";
import { CA_CONFIG } from "./config";
import {
  CA_CPP_2026,
  CA_CPP2_2026,
  CA_EI_2026,
  CA_FEDERAL_TAX_BRACKETS_2026,
  CA_QPIP_2026,
  CA_REGIONS,
  CA_RRSP_LIMIT_2026,
  calculateCPP,
  calculateCPP2,
  calculateEI,
  calculateFederalBPA,
  calculateOntarioSurtax,
  calculateProgressiveTax,
  calculateQPIP,
} from "./constants/tax-brackets-2026";

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================
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

// Get region info for dropdown
function getRegionInfo(): RegionInfo[] {
  return Object.values(CA_REGIONS).map((region) => ({
    code: region.code,
    name: region.name,
    taxType: "progressive",
  }));
}

// Calculate provincial tax for a given region
function calculateProvincialTax(
  taxableIncome: number,
  regionCode: string,
): {
  tax: number;
  surtax: number;
  bracketTaxes: Array<{ min: number; max: number; rate: number; tax: number }>;
  bpa: number;
} {
  const region = CA_REGIONS[regionCode];
  if (!region) {
    throw new Error(`Unknown region: ${regionCode}`);
  }

  // Calculate basic provincial tax
  const { totalTax, bracketTaxes } = calculateProgressiveTax(
    taxableIncome,
    region.brackets,
  );

  // Calculate surtax (Ontario only)
  let surtax = 0;
  if (regionCode === "ON") {
    surtax = calculateOntarioSurtax(totalTax);
  }

  // Get provincial BPA
  const bpa = region.bpa;

  return { tax: totalTax, surtax, bracketTaxes, bpa };
}

// ============================================================================
// CANADA CALCULATOR
// ============================================================================
export function calculateCA(inputs: CACalculatorInputs): CalculationResult {
  const { grossSalary, payFrequency, region, contributions } = inputs;

  // Get region info
  const regionInfo = CA_REGIONS[region];
  if (!regionInfo) {
    throw new Error(`Unknown region: ${region}`);
  }
  const isQuebec = regionInfo.isQuebec;

  // Step 1: Calculate RRSP deduction (reduces taxable income)
  const rrspDeduction = Math.min(
    contributions.rrspContribution,
    CA_RRSP_LIMIT_2026.limit,
  );

  // Step 2: Calculate taxable income
  // For simplicity, we assume grossSalary is employment income
  // In reality, Canadians can also deduct other amounts (union dues, moving expenses, etc.)
  const federalTaxableIncome = Math.max(0, grossSalary - rrspDeduction);
  const provincialTaxableIncome = federalTaxableIncome; // Same for most cases

  // Step 3: Calculate Federal Tax
  // First, calculate tax before credits
  const { totalTax: federalTaxBeforeCredits, bracketTaxes: federalBracketTaxes } =
    calculateProgressiveTax(federalTaxableIncome, CA_FEDERAL_TAX_BRACKETS_2026);

  // Calculate federal BPA tax credit
  const federalBPA = calculateFederalBPA(federalTaxableIncome);
  const federalBPACredit = federalBPA * CA_FEDERAL_TAX_BRACKETS_2026[0].rate; // At lowest bracket rate

  // Federal tax after BPA credit (minimum $0)
  const federalIncomeTax = Math.max(0, federalTaxBeforeCredits - federalBPACredit);

  // Step 4: Calculate Provincial/Territorial Tax
  const {
    tax: provincialTaxBeforeCredits,
    surtax: provincialSurtax,
    bracketTaxes: provincialBracketTaxes,
    bpa: provincialBPA,
  } = calculateProvincialTax(provincialTaxableIncome, region);

  // Calculate provincial BPA tax credit (at lowest provincial bracket rate)
  const lowestProvincialRate = regionInfo.brackets[0].rate;
  const provincialBPACredit = provincialBPA * lowestProvincialRate;

  // Provincial tax after BPA credit and surtax
  const provincialIncomeTax =
    Math.max(0, provincialTaxBeforeCredits - provincialBPACredit) + provincialSurtax;

  // Step 5: Calculate CPP contributions
  const cppResult = calculateCPP(grossSalary);
  const cpp2Result = calculateCPP2(grossSalary);

  // Step 6: Calculate EI premiums
  const eiResult = calculateEI(grossSalary, isQuebec);

  // Step 7: Calculate QPIP (Quebec only)
  const qpipResult = isQuebec ? calculateQPIP(grossSalary) : undefined;

  // Step 8: Build tax breakdown
  const taxes: CATaxBreakdown = {
    totalIncomeTax: federalIncomeTax + provincialIncomeTax,
    federalIncomeTax,
    provincialIncomeTax,
    cppEmployee: cppResult.contribution,
    cpp2Employee: cpp2Result.contribution,
    eiEmployee: eiResult.premium,
    qpipEmployee: qpipResult?.premium,
  };

  // Step 9: Calculate totals
  const totalTax =
    federalIncomeTax +
    provincialIncomeTax +
    cppResult.contribution +
    cpp2Result.contribution +
    eiResult.premium +
    (qpipResult?.premium ?? 0);

  const totalDeductions = totalTax + rrspDeduction;
  const netSalary = grossSalary - totalDeductions;
  const effectiveTaxRate = grossSalary > 0 ? totalTax / grossSalary : 0;

  const periodsPerYear = getPeriodsPerYear(payFrequency);

  // Step 10: Build detailed breakdown
  const breakdown: CABreakdown = {
    type: "CA",
    region,
    regionName: regionInfo.name,
    federalTaxableIncome,
    provincialTaxableIncome,
    federalBracketTaxes,
    provincialBracketTaxes,
    federalBPA,
    provincialBPA,
    federalTaxBeforeCredits,
    provincialTaxBeforeCredits,
    provincialSurtax: region === "ON" ? provincialSurtax : undefined,
    cpp: {
      pensionableEarnings: cppResult.pensionableEarnings,
      contributoryEarnings: cppResult.contributoryEarnings,
      baseContribution: cppResult.contribution,
      baseRate: CA_CPP_2026.contributionRate,
      baseMax: CA_CPP_2026.maxEmployeeContribution,
    },
    cpp2: {
      additionalPensionableEarnings: cpp2Result.additionalPensionableEarnings,
      contribution: cpp2Result.contribution,
      rate: CA_CPP2_2026.contributionRate,
      max: CA_CPP2_2026.maxEmployeeContribution,
    },
    ei: {
      insurableEarnings: eiResult.insurableEarnings,
      premium: eiResult.premium,
      rate: isQuebec ? CA_EI_2026.quebecRate : CA_EI_2026.employeeRate,
      maxPremium: isQuebec ? CA_EI_2026.maxQuebecPremium : CA_EI_2026.maxEmployeePremium,
    },
    qpip: qpipResult
      ? {
          premium: qpipResult.premium,
          rate: CA_QPIP_2026.employeeRate,
          maxPremium: CA_QPIP_2026.maxEmployeePremium,
        }
      : undefined,
    rrspDeduction,
    isQuebec,
  };

  return {
    country: "CA",
    currency: "CAD",
    grossSalary,
    taxableIncome: federalTaxableIncome,
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

// ============================================================================
// COUNTRY CALCULATOR IMPLEMENTATION
// ============================================================================
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
    return getRegionInfo();
  },

  getContributionLimits(): ContributionLimits {
    return {
      rrspContribution: {
        limit: CA_RRSP_LIMIT_2026.limit,
        name: "RRSP Contribution",
        description: "Registered Retirement Savings Plan contribution (2026 limit)",
        preTax: true,
      },
    };
  },

  getDefaultInputs(): CACalculatorInputs {
    return {
      country: "CA",
      grossSalary: 80000, // C$80,000 typical Canadian salary
      payFrequency: "monthly",
      region: "ON", // Ontario as default
      contributions: {
        rrspContribution: 0,
      },
    };
  },
};
