import type {
  CalculationResult,
  CurrencyCode,
} from "@/lib/countries/types";

export interface CountryResultBreakdownProps {
  result: CalculationResult;
  grossSalary: number;
  currency: CurrencyCode;
}
