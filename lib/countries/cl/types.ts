import type {
  BaseCalculatorInputs,
  BaseTaxBreakdown,
  CalculatorInputs,
  CountrySpecificBreakdown,
  TaxBreakdown,
} from "../types";

export interface CLContributionInputs {
  /** APV Régimen B — reduces income tax base up to 600 UF/year. */
  apvRegimeB: number;
}

export interface CLCalculatorInputs extends BaseCalculatorInputs {
  country: "CL";
  contributions: CLContributionInputs;
}

export interface CLTaxBreakdown extends BaseTaxBreakdown {
  type: "CL";
  incomeTax: number;
  afp: number;
  health: number;
  unemployment: number;
}

export interface CLBreakdown {
  type: "CL";
  grossIncome: number;
  mandatoryContributions: {
    afpRate: number;
    healthRate: number;
    unemploymentRate: number;
    total: number;
  };
  taxableIncome: number;
  bracketTaxes: Array<{ min: number; max: number; rate: number; tax: number }>;
  incomeTax: {
    total: number;
  };
  voluntaryContributions: {
    apvRegimeB: number;
    apvRegimeBLimit: number;
    total: number;
  };
  assumptions: string[];
  sourceUrls: string[];
}

declare module "../types" {
  interface CountryCodeMap {
    CL: true;
  }

  interface CurrencyCodeMap {
    CLP: true;
  }

  interface CalculatorInputMap {
    CL: CLCalculatorInputs;
  }

  interface TaxBreakdownMap {
    CL: CLTaxBreakdown;
  }

  interface CountrySpecificBreakdownMap {
    CL: CLBreakdown;
  }

  interface ContributionInputMap {
    CL: CLContributionInputs;
  }
}

export function isCLInputs(
  inputs: CalculatorInputs,
): inputs is CLCalculatorInputs {
  return inputs.country === "CL";
}

export function isCLTaxBreakdown(taxes: TaxBreakdown): taxes is CLTaxBreakdown {
  return "type" in taxes && taxes.type === "CL";
}

export function isCLBreakdown(
  breakdown: CountrySpecificBreakdown,
): breakdown is CLBreakdown {
  return breakdown.type === "CL";
}
