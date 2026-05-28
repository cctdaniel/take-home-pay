import type {
  BaseCalculatorInputs,
  BaseTaxBreakdown,
  CalculatorInputs,
  CountrySpecificBreakdown,
  TaxBreakdown,
  TaxBracket,
} from "../types";

export interface ILContributionInputs {
  /** Keren Hishtalmut (study fund) — up to 7.5% of gross; paid from net. */
  studyFund: number;
  /** Supplemental pension — up to 5% of gross; reduces Mas Hachnasa taxable income. */
  supplementalPension: number;
}

export interface ILCalculatorInputs extends BaseCalculatorInputs {
  country: "IL";
  isMarried: boolean;
  childrenUnder6: number;
  children6To17: number;
  contributions: ILContributionInputs;
}

export interface ILTaxBreakdown extends BaseTaxBreakdown {
  type: "IL";
  incomeTax: number;
  bituachLeumi: number;
  healthInsurance: number;
  pension: number;
}

export interface ILBreakdown {
  type: "IL";
  grossIncome: number;
  taxableIncome: number;
  isMarried: boolean;
  childrenUnder6: number;
  children6To17: number;
  creditPoints: number;
  creditPointValue: number;
  taxCredit: number;
  grossIncomeTax: number;
  bracketTaxes: Array<TaxBracket & { tax: number }>;
  social: {
    bituachLeumi: number;
    healthInsurance: number;
    pension: number;
    bituachLeumiBase: number;
    pensionBase: number;
  };
  voluntaryContributions: {
    studyFund: number;
    studyFundLimit: number;
    supplementalPension: number;
    supplementalPensionLimit: number;
    total: number;
  };
  assumptions: string[];
  sourceUrls: readonly string[];
}

declare module "../types" {
  interface CountryCodeMap {
    IL: true;
  }

  interface CurrencyCodeMap {
    ILS: true;
  }

  interface ContributionInputMap {
    IL: ILContributionInputs;
  }

  interface CalculatorInputMap {
    IL: ILCalculatorInputs;
  }

  interface TaxBreakdownMap {
    IL: ILTaxBreakdown;
  }

  interface CountrySpecificBreakdownMap {
    IL: ILBreakdown;
  }
}

export function isILInputs(inputs: CalculatorInputs): inputs is ILCalculatorInputs {
  return inputs.country === "IL";
}

export function isILTaxBreakdown(taxes: TaxBreakdown): taxes is ILTaxBreakdown {
  return "type" in taxes && taxes.type === "IL";
}

export function isILBreakdown(
  breakdown: CountrySpecificBreakdown,
): breakdown is ILBreakdown {
  return breakdown.type === "IL";
}
