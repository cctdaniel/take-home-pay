// Golden checks vs Kazakhstan IIT and social contribution rules (2026).
// https://www.gov.kz/ | https://taxsummaries.pwc.com/republic-of-kazakhstan

import { describe, expect, it } from "vitest";
import { KZCalculator } from "./calculator";
import {
  KZ_IIT_THRESHOLD_2026,
  KZ_MIN_WAGE_MONTHLY_2026,
  KZ_OMIC_MONTHLY_BASE_CAP_2026,
  KZ_STANDARD_DEDUCTION_2026,
} from "./constants/tax-year-2026";

describe("KZ calculator", () => {
  it("applies standard deduction, OPC, OMIC, and 10% IIT at default gross", () => {
    const gross = 6_000_000;
    const result = KZCalculator.calculate({
      ...KZCalculator.getDefaultInputs(),
      grossSalary: gross,
    });

    expect(result.taxes.opcEmployee).toBe(600_000);
    expect(result.taxes.omicEmployee).toBe(120_000);
    expect(result.taxableIncome).toBe(
      gross - KZ_STANDARD_DEDUCTION_2026 - 600_000 - 120_000,
    );
    expect(result.taxes.incomeTax).toBe(372_300);
    expect(result.netSalary).toBe(4_907_700);
  });

  it("caps OMIC base at 20× minimum wage monthly", () => {
    const gross = 30_000_000;
    const result = KZCalculator.calculate({
      ...KZCalculator.getDefaultInputs(),
      grossSalary: gross,
    });

    expect(result.taxes.omicEmployee).toBe(
      KZ_OMIC_MONTHLY_BASE_CAP_2026 * 0.02 * 12,
    );
    expect(result.breakdown.type).toBe("KZ");
    if (result.breakdown.type === "KZ") {
      expect(result.breakdown.omicMonthlyCap).toBe(KZ_OMIC_MONTHLY_BASE_CAP_2026);
    }
  });

  it("applies 15% IIT on income above 8,500 MCI threshold", () => {
    const gross = 50_000_000;
    const result = KZCalculator.calculate({
      ...KZCalculator.getDefaultInputs(),
      grossSalary: gross,
    });

    const taxable = gross - KZ_STANDARD_DEDUCTION_2026 - 5_000_000 - 408_000;
    expect(taxable).toBeGreaterThan(KZ_IIT_THRESHOLD_2026);
    expect(result.taxes.incomeTax).toBe(4_617_125);
    expect(result.netSalary).toBe(39_974_875);
  });

  it("has zero IIT when taxable income is fully offset at minimum wage", () => {
    const gross = KZ_MIN_WAGE_MONTHLY_2026 * 12;
    const result = KZCalculator.calculate({
      ...KZCalculator.getDefaultInputs(),
      grossSalary: gross,
    });

    expect(result.taxableIncome).toBe(0);
    expect(result.taxes.incomeTax).toBe(0);
    expect(result.netSalary).toBe(897_600);
  });

  it("withholds 12% mandatory employee contributions on mid salary", () => {
    const gross = 3_000_000;
    const result = KZCalculator.calculate({
      ...KZCalculator.getDefaultInputs(),
      grossSalary: gross,
    });

    expect(result.taxes.opcEmployee + result.taxes.omicEmployee).toBe(360_000);
    expect(result.taxes.incomeTax).toBe(108_300);
    expect(result.netSalary).toBe(2_531_700);
  });

  it("returns zero net tax for zero gross", () => {
    const result = KZCalculator.calculate({
      ...KZCalculator.getDefaultInputs(),
      grossSalary: 0,
    });

    expect(result.totalTax).toBe(0);
    expect(result.netSalary).toBe(0);
  });
});
