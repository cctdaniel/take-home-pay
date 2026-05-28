import type {
  BaseCalculatorInputs,
  BaseTaxBreakdown,
  CalculatorInputs,
  CountrySpecificBreakdown,
  TaxBreakdown,
} from "../types";

export interface PLContributionInputs {
  /** IKZE individual retirement account — capped annual deposit. */
  ikze: number;
  /** PPK additional employee contribution — up to 4% of gross. */
  ppkAdditional: number;
}

export interface PLCalculatorInputs extends BaseCalculatorInputs {
  country: "PL";
  numberOfChildren: number;
  contributions: PLContributionInputs;
}

export interface PLTaxBreakdown extends BaseTaxBreakdown {
  type: "PL";
  incomeTax: number;
  zusEmployee: number;
  healthInsurance: number;
}

export interface PLBreakdown {
  type: "PL";
  grossIncome: number;
  numberOfChildren: number;
  zus: {
    rate: number;
    employee: number;
  };
  healthInsurance: {
    rate: number;
    base: number;
    employee: number;
  };
  childTaxCredit: number;
  taxableIncome: number;
  incomeTax: {
    lowerRate: number;
    higherRate: number;
    total: number;
  };
  voluntaryContributions: {
    ikze: number;
    ikzeLimit: number;
    ppkAdditional: number;
    ppkAdditionalLimit: number;
    total: number;
  };
  assumptions: string[];
  sourceUrls: string[];
}

declare module "../types" {
  interface CountryCodeMap {
    PL: true;
  }

  interface CurrencyCodeMap {
    PLN: true;
  }

  interface CalculatorInputMap {
    PL: PLCalculatorInputs;
  }

  interface TaxBreakdownMap {
    PL: PLTaxBreakdown;
  }

  interface CountrySpecificBreakdownMap {
    PL: PLBreakdown;
  }

  interface ContributionInputMap {
    PL: PLContributionInputs;
  }
}

export function isPLInputs(
  inputs: CalculatorInputs,
): inputs is PLCalculatorInputs {
  return inputs.country === "PL";
}

export function isPLTaxBreakdown(taxes: TaxBreakdown): taxes is PLTaxBreakdown {
  return "type" in taxes && taxes.type === "PL";
}

export function isPLBreakdown(
  breakdown: CountrySpecificBreakdown,
): breakdown is PLBreakdown {
  return breakdown.type === "PL";
}
