import type {
  BaseCalculatorInputs,
  BaseTaxBreakdown,
  CalculatorInputs,
  CountrySpecificBreakdown,
  TaxBreakdown,
} from "../types";

export interface EEContributionInputs {
  /** Third pillar pension — reduces income tax base. */
  thirdPillar: number;
}

export interface EECalculatorInputs extends BaseCalculatorInputs {
  country: "EE";
  contributions: EEContributionInputs;
}

export interface EETaxBreakdown extends BaseTaxBreakdown {
  type: "EE";
  incomeTax: number;
  pensionEmployee: number;
  unemploymentEmployee: number;
}

export interface EEBreakdown {
  type: "EE";
  grossIncome: number;
  basicAllowance: number;
  taxableIncome: number;
  incomeTax: {
    rate: number;
    total: number;
  };
  pension: {
    employeeRate: number;
    employee: number;
  };
  unemployment: {
    employeeRate: number;
    employee: number;
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
    EE: true;
  }

  interface CalculatorInputMap {
    EE: EECalculatorInputs;
  }

  interface TaxBreakdownMap {
    EE: EETaxBreakdown;
  }

  interface CountrySpecificBreakdownMap {
    EE: EEBreakdown;
  }

  interface ContributionInputMap {
    EE: EEContributionInputs;
  }
}

export function isEEInputs(
  inputs: CalculatorInputs,
): inputs is EECalculatorInputs {
  return inputs.country === "EE";
}

export function isEETaxBreakdown(taxes: TaxBreakdown): taxes is EETaxBreakdown {
  return "type" in taxes && taxes.type === "EE";
}

export function isEEBreakdown(
  breakdown: CountrySpecificBreakdown,
): breakdown is EEBreakdown {
  return breakdown.type === "EE";
}
