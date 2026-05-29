import type {
  BaseCalculatorInputs,
  BaseTaxBreakdown,
  CalculatorInputs,
  CountrySpecificBreakdown,
  TaxBreakdown,
} from "../types";

export interface SKContributionInputs {
  /** Third-pillar DDS — reduces income tax base up to EUR 180/year. */
  thirdPillar: number;
}

export interface SKCalculatorInputs extends BaseCalculatorInputs {
  country: "SK";
  contributions: SKContributionInputs;
}

export interface SKTaxBreakdown extends BaseTaxBreakdown {
  type: "SK";
  incomeTax: number;
  socialInsurance: number;
  healthInsurance: number;
}

export interface SKBreakdown {
  type: "SK";
  grossIncome: number;
  socialInsurance: {
    rate: number;
    base: number;
    employee: number;
    annualCap: number;
  };
  healthInsurance: {
    rate: number;
    employee: number;
  };
  preAllowanceBase: number;
  nonTaxableAllowance: number;
  taxableIncome: number;
  bracketTaxes: Array<{ min: number; max: number; rate: number; tax: number }>;
  incomeTax: {
    total: number;
  };
  voluntaryContributions: {
    thirdPillar: number;
    thirdPillarLimit: number;
    total: number;
  };
  assumptions: string[];
  sourceUrls: string[];
}

declare module "../types" {
  interface CountryCodeMap {
    SK: true;
  }

  interface ContributionInputMap {
    SK: SKContributionInputs;
  }

  interface CalculatorInputMap {
    SK: SKCalculatorInputs;
  }

  interface TaxBreakdownMap {
    SK: SKTaxBreakdown;
  }

  interface CountrySpecificBreakdownMap {
    SK: SKBreakdown;
  }
}

export function isSKInputs(
  inputs: CalculatorInputs,
): inputs is SKCalculatorInputs {
  return inputs.country === "SK";
}

export function isSKTaxBreakdown(taxes: TaxBreakdown): taxes is SKTaxBreakdown {
  return "type" in taxes && taxes.type === "SK";
}

export function isSKBreakdown(
  breakdown: CountrySpecificBreakdown,
): breakdown is SKBreakdown {
  return breakdown.type === "SK";
}
