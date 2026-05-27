import { describe, expect, it } from "vitest";
import { calculateIE } from "./calculator";
import { IE_TAX_CONFIG } from "./constants/tax-year-2026";
import {
  isIEBreakdown,
  isIETaxBreakdown,
  type IEBreakdown,
  type IECalculatorInputs,
  type IETaxBreakdown,
  type IETaxStatus,
} from "./types";
import type { CalculationResult } from "../types";

type IECalculationResult = CalculationResult & {
  taxes: IETaxBreakdown;
  breakdown: IEBreakdown;
};

function inputs(
  grossSalary: number,
  taxStatus: IETaxStatus = "single",
  pensionContribution = 0,
): IECalculatorInputs {
  return {
    country: "IE",
    grossSalary,
    payFrequency: "monthly",
    age: 35,
    taxStatus,
    retirementScheme: pensionContribution > 0 ? "private_pension" : "none",
    hasSinglePersonChildCarerCredit: false,
    hasHomeCarerTaxCredit: false,
    homeCarerIncome: 0,
    numberOfDependentRelatives: 0,
    hasReducedUSC: false,
    sarpRegime: "none",
    contributions: {
      pensionContribution,
      qualifyingRentPaid: 0,
      healthExpenses: 0,
      flatRateExpenses: 0,
    },
  };
}

function calculateIETyped(input: IECalculatorInputs): IECalculationResult {
  const result = calculateIE(input);
  if (!isIETaxBreakdown(result.taxes) || !isIEBreakdown(result.breakdown)) {
    throw new Error("Expected Ireland calculation result");
  }
  return result as IECalculationResult;
}

describe("Ireland calculator", () => {
  it("calculates a positive net salary below gross for the default salary", () => {
    const result = calculateIETyped(inputs(IE_TAX_CONFIG.defaultSalary));
    expect(result.country).toBe("IE");
    expect(result.currency).toBe("EUR");
    expect(result.netSalary).toBeGreaterThan(0);
    expect(result.netSalary).toBeLessThan(result.grossSalary);
    expect(result.taxes.employeeSocialContribution).toBeGreaterThan(0);
    expect(result.breakdown.type).toBe("IE");
    expect(result.breakdown.assumptions.length).toBeGreaterThan(0);
    expect(result.breakdown.sourceUrls.length).toBeGreaterThan(0);
  });

  it("does not charge USC at or below the exemption limit", () => {
    expect(calculateIETyped(inputs(13_000)).taxes.additionalIncomeTax).toBe(0);
    expect(
      calculateIETyped(inputs(13_001)).taxes.additionalIncomeTax,
    ).toBeGreaterThan(0);
  });

  it("uses Irish married bands and credits when selected", () => {
    const single = calculateIETyped(inputs(70_000, "single"));
    const married = calculateIETyped(inputs(70_000, "married_one_income"));
    expect(married.taxes.incomeTax).toBeLessThan(single.taxes.incomeTax);
  });

  it("applies pension relief to PAYE taxable income", () => {
    const base = calculateIETyped(inputs(55_000));
    const withPension = calculateIETyped(inputs(55_000, "single", 5_000));
    expect(withPension.taxableIncome).toBeLessThan(base.taxableIncome);
    expect(withPension.taxes.incomeTax).toBeLessThan(base.taxes.incomeTax);
    expect(withPension.totalDeductions).toBeGreaterThan(base.totalDeductions);
  });

  it("keeps zero income tax for zero salary", () => {
    const result = calculateIETyped(inputs(0));
    expect(result.netSalary).toBe(0);
    expect(result.totalTax).toBe(0);
    expect(result.taxableIncome).toBe(0);
  });

  it("uses the 2026 USC 2% band ceiling of €28,700", () => {
    const result = calculateIETyped(inputs(28_700));
    expect(result.taxes.additionalIncomeTax).toBe(393.82);
  });

  it("applies MyFutureFund as a post-tax payroll deduction", () => {
    const myFutureFundInputs = inputs(55_000);
    myFutureFundInputs.retirementScheme = "my_future_fund";
    const result = calculateIETyped(myFutureFundInputs);
    expect(result.breakdown.myFutureFund.employeeContribution).toBe(825);
    expect(result.totalDeductions).toBeGreaterThan(result.totalTax);
  });

  it("applies SARP to income tax only", () => {
    const base = calculateIETyped(inputs(200_000));
    const sarpInputs = inputs(200_000);
    sarpInputs.sarpRegime = "arrived_2026_onwards";
    const result = calculateIETyped(sarpInputs);

    expect(result.breakdown.sarpRelief.reliefAmount).toBe(22_500);
    expect(result.taxableIncome).toBe(base.taxableIncome - 22_500);
    expect(result.taxes.incomeTax).toBeLessThan(base.taxes.incomeTax);
    expect(result.taxes.additionalIncomeTax).toBe(base.taxes.additionalIncomeTax);
    expect(result.taxes.employeeSocialContribution).toBe(
      base.taxes.employeeSocialContribution,
    );
  });

  it("calculates SARP on income after private pension relief", () => {
    const sarpInputs = inputs(200_000, "single", 20_000);
    sarpInputs.sarpRegime = "arrived_2026_onwards";
    const result = calculateIETyped(sarpInputs);

    expect(result.breakdown.sarpRelief.reliefAmount).toBe(16_500);
  });
});
