import type {
  BaseCalculatorInputs,
  BaseTaxBreakdown,
  CalculatorInputs,
  CountrySpecificBreakdown,
  TaxBreakdown,
  TaxBracket,
} from "../types";
import type { ARGananciasSemester } from "./constants/ganancias-semesters";

export type { ARGananciasSemester };

export interface ARContributionInputs {
  /** Voluntary retirement — additional ganancias deduction up to 12% of gross. */
  voluntaryRetirement: number;
}

export interface ARCalculatorInputs extends BaseCalculatorInputs {
  country: "AR";
  /** AFIP ganancias semester tables (ene–jun / jul–dic). */
  gananciasSemester: ARGananciasSemester;
  hasSpouse: boolean;
  children: number;
  contributions: ARContributionInputs;
}

export interface ARTaxBreakdown extends BaseTaxBreakdown {
  type: "AR";
  incomeTax: number;
  jubilacion: number;
  obraSocial: number;
  pami: number;
}

export interface ARBreakdown {
  type: "AR";
  grossIncome: number;
  taxableIncome: number;
  nonImponible: number;
  specialDeduction: number;
  familyDeductions: number;
  voluntaryRetirement: number;
  totalDeductionsFromGross: number;
  hasSpouse: boolean;
  children: number;
  bracketTaxes: Array<TaxBracket & { tax: number }>;
  social: {
    jubilacionRate: number;
    obraSocialRate: number;
    pamiRate: number;
  };
  voluntaryContributions: {
    voluntaryRetirement: number;
    voluntaryRetirementLimit: number;
    total: number;
  };
  gananciasSemester: ARGananciasSemester;
  taxPeriod: string;
  assumptions: string[];
  sourceUrls: readonly string[];
}

declare module "../types" {
  interface CountryCodeMap {
    AR: true;
  }

  interface CurrencyCodeMap {
    ARS: true;
  }

  interface ContributionInputMap {
    AR: ARContributionInputs;
  }

  interface CalculatorInputMap {
    AR: ARCalculatorInputs;
  }

  interface TaxBreakdownMap {
    AR: ARTaxBreakdown;
  }

  interface CountrySpecificBreakdownMap {
    AR: ARBreakdown;
  }
}

export function isARInputs(inputs: CalculatorInputs): inputs is ARCalculatorInputs {
  return inputs.country === "AR";
}

export function isARTaxBreakdown(taxes: TaxBreakdown): taxes is ARTaxBreakdown {
  return "type" in taxes && taxes.type === "AR";
}

export function isARBreakdown(
  breakdown: CountrySpecificBreakdown,
): breakdown is ARBreakdown {
  return breakdown.type === "AR";
}
