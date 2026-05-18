import { describe, expect, it } from "vitest";
import { calculateIE } from "./calculator";
import { IE_TAX_CONFIG } from "./constants/tax-year-2026";
import type { IECalculatorInputs, IETaxStatus } from "./types";

function inputs(
  grossSalary: number,
  taxStatus: IETaxStatus = "single",
  pensionContribution = 0,
): IECalculatorInputs {
  return {
    country: "IE",
    grossSalary,
    payFrequency: "monthly",
    taxStatus,
    contributions: { pensionContribution },
  };
}

describe("Ireland calculator", () => {
  it("calculates a positive net salary below gross for the default salary", () => {
    const result = calculateIE(inputs(IE_TAX_CONFIG.defaultSalary));
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
    expect(calculateIE(inputs(13_000)).taxes.additionalIncomeTax).toBe(0);
    expect(
      calculateIE(inputs(13_001)).taxes.additionalIncomeTax,
    ).toBeGreaterThan(0);
  });

  it("uses Irish married bands and credits when selected", () => {
    const single = calculateIE(inputs(70_000, "single"));
    const married = calculateIE(inputs(70_000, "married_one_income"));
    expect(married.taxes.incomeTax).toBeLessThan(single.taxes.incomeTax);
  });

  it("applies pension relief to PAYE taxable income", () => {
    const base = calculateIE(inputs(55_000));
    const withPension = calculateIE(inputs(55_000, "single", 5_000));
    expect(withPension.taxableIncome).toBeLessThan(base.taxableIncome);
    expect(withPension.taxes.incomeTax).toBeLessThan(base.taxes.incomeTax);
    expect(withPension.totalDeductions).toBeGreaterThan(base.totalDeductions);
  });

  it("keeps zero income tax for zero salary", () => {
    const result = calculateIE(inputs(0));
    expect(result.netSalary).toBe(0);
    expect(result.totalTax).toBe(0);
    expect(result.taxableIncome).toBe(0);
  });
});
