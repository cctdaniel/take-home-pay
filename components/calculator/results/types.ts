import type {
  CalculationResult,
  CurrencyCode,
} from "@/lib/countries/types";

export interface CountryResultBreakdownProps {
  result: CalculationResult;
  grossSalary: number;
  currency: CurrencyCode;
  usState?: string;
  usContributions?: {
    traditional401k: number;
    rothIRA: number;
    hsa: number;
    healthFsa?: number;
    dependentCareFsa?: number;
  };
}
