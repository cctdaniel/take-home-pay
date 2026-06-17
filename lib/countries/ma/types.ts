import type {
  BaseCalculatorInputs,
  BaseTaxBreakdown,
  CalculatorInputs,
} from "../types";

export interface MAContributionInputs {
  supplementaryPension: number;
}

export interface MACalculatorInputs extends BaseCalculatorInputs {
  country: "MA";
  dependents: number;
  contributions: MAContributionInputs;
}

export interface MATaxBreakdown extends BaseTaxBreakdown {
  type: "MA";
  incomeTax: number;
  socialInsurance: number;
}

export interface MABreakdown {
  type: "MA";
  grossIncome: number;
  socialInsurance: {
    cnss: number;
    amo: number;
    total: number;
  };
  professionalExpenseDeduction: number;
  dependents: number;
  dependentCredit: number;
  taxableIncome: number;
  grossIncomeTax: number;
  bracketTaxes: Array<{ min: number; max: number; rate: number; tax: number }>;
  incomeTax: { total: number };
  voluntaryContributions: {
    supplementaryPension: number;
    supplementaryPensionLimit: number;
    total: number;
  };
  assumptions: string[];
  sourceUrls: string[];
}

declare module "../types" {
  interface CountryCodeMap {
    MA: true;
  }

  interface CurrencyCodeMap {
    MAD: true;
  }

  interface ContributionInputMap {
    MA: MAContributionInputs;
  }

  interface CalculatorInputMap {
    MA: MACalculatorInputs;
  }

  interface TaxBreakdownMap {
    MA: MATaxBreakdown;
  }

  interface CountrySpecificBreakdownMap {
    MA: MABreakdown;
  }
}

export function isMAInputs(inputs: CalculatorInputs): inputs is MACalculatorInputs {
  return inputs.country === "MA";
}
