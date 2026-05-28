import type {
  BaseCalculatorInputs,
  BaseTaxBreakdown,
  CalculatorInputs,
  CountrySpecificBreakdown,
  TaxBreakdown,
} from "../types";

export interface BRContributionInputs {
  /** Previdência privada (PGBL/VGBL) — reduces IRPF base up to 12% of gross. */
  privatePension: number;
}

export interface BRCalculatorInputs extends BaseCalculatorInputs {
  country: "BR";
  numberOfDependents: number;
  contributions: BRContributionInputs;
}

export interface BRTaxBreakdown extends BaseTaxBreakdown {
  type: "BR";
  incomeTax: number;
  inssEmployee: number;
}

export interface BRBreakdown {
  type: "BR";
  grossIncome: number;
  numberOfDependents: number;
  dependentDeductionAnnual: number;
  inss: {
    monthly: number;
    annual: number;
    monthlyCeiling: number;
  };
  irpf: {
    monthlyTaxable: number;
    monthlyTax: number;
    annual: number;
  };
  taxableIncome: number;
  voluntaryContributions: {
    privatePension: number;
    privatePensionLimit: number;
    total: number;
  };
  assumptions: string[];
  sourceUrls: string[];
}

declare module "../types" {
  interface CountryCodeMap {
    BR: true;
  }

  interface CurrencyCodeMap {
    BRL: true;
  }

  interface CalculatorInputMap {
    BR: BRCalculatorInputs;
  }

  interface TaxBreakdownMap {
    BR: BRTaxBreakdown;
  }

  interface CountrySpecificBreakdownMap {
    BR: BRBreakdown;
  }

  interface ContributionInputMap {
    BR: BRContributionInputs;
  }
}

export function isBRInputs(
  inputs: CalculatorInputs,
): inputs is BRCalculatorInputs {
  return inputs.country === "BR";
}

export function isBRTaxBreakdown(taxes: TaxBreakdown): taxes is BRTaxBreakdown {
  return "type" in taxes && taxes.type === "BR";
}

export function isBRBreakdown(
  breakdown: CountrySpecificBreakdown,
): breakdown is BRBreakdown {
  return breakdown.type === "BR";
}
