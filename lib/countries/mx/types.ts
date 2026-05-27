import type {
  BaseCalculatorInputs,
  BaseTaxBreakdown,
  CalculatorInputs,
  CountrySpecificBreakdown,
  TaxBreakdown,
} from "../types";
import type { MexicoIsrBracket, MexicoStateCode } from "./constants/tax-year-2026";

export type MXAguinaldoTreatment =
  | "excluded"
  | "statutoryOnTop"
  | "includedInGross";

export interface MXContributionInputs {
  voluntaryRetirementContribution: number;
  medicalDentalExpenses: number;
  funeralExpenses: number;
  mortgageInterest: number;
  educationExpenses: number;
}

export interface MXCalculatorInputs extends BaseCalculatorInputs {
  country: "MX";
  state: MexicoStateCode;
  aguinaldoTreatment: MXAguinaldoTreatment;
  aguinaldoIncludedInGross: number;
  vacationPremium: number;
  ptuProfitSharing: number;
  contributions: MXContributionInputs;
}

export interface MXTaxBreakdown extends BaseTaxBreakdown {
  type: "MX";
  incomeTax: number;
  socialSecurity: number;
  employmentSubsidy: number;
}

export interface MXBreakdown {
  type: "MX";
  grossIncome: number;
  taxableIncome: number;
  ordinaryCashSalary: number;
  cashGrossIncome: number;
  state: MexicoStateCode;
  stateName: string;
  isrBracket: MexicoIsrBracket;
  fixedFee: number;
  marginalTax: number;
  salaryPerceptions: {
    aguinaldoTreatment: MXAguinaldoTreatment;
    aguinaldoAmount: number;
    aguinaldoExempt: number;
    vacationPremium: number;
    vacationPremiumExempt: number;
    ptuProfitSharing: number;
    ptuExempt: number;
    totalExempt: number;
    taxableAdditionalIncome: number;
  };
  employmentSubsidy: number;
  imss: {
    dailySbc: number;
    cappedDailySbc: number;
    annualContributionDays: number;
    excessOverThreeUma: number;
    pensionerMedical: number;
    sicknessMaternityCash: number;
    disabilityLife: number;
    oldAgeRetirement: number;
    total: number;
  };
  voluntaryContributions: {
    voluntaryRetirementContribution: number;
    voluntaryRetirementContributionLimit: number;
    medicalDentalExpenses: number;
    funeralExpenses: number;
    mortgageInterest: number;
    educationExpenses: number;
    generalPersonalDeductionLimit: number;
    educationDeductionLimit: number;
    total: number;
  };
  assumptions: string[];
  sourceUrls: string[];
}

declare module "../types" {
  interface CurrencyCodeMap {
    MXN: true;
  }

  interface CountryCodeMap {
    MX: true;
  }

  interface ContributionInputMap {
    MX: MXContributionInputs;
  }

  interface CalculatorInputMap {
    MX: MXCalculatorInputs;
  }

  interface TaxBreakdownMap {
    MX: MXTaxBreakdown;
  }

  interface CountrySpecificBreakdownMap {
    MX: MXBreakdown;
  }
}

export function isMXInputs(inputs: CalculatorInputs): inputs is MXCalculatorInputs {
  return inputs.country === "MX";
}

export function isMXTaxBreakdown(taxes: TaxBreakdown): taxes is MXTaxBreakdown {
  return "type" in taxes && taxes.type === "MX";
}

export function isMXBreakdown(
  breakdown: CountrySpecificBreakdown,
): breakdown is MXBreakdown {
  return breakdown.type === "MX";
}
