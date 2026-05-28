import { describe, expect, it } from "vitest";
import { calculateTR, TRCalculator } from "./calculator";
import { TR_MINIMUM_WAGE_ANNUAL_EXEMPTION_2026 } from "./constants/tax-year-2026";

describe("TR calculator smoke", () => {
  it("returns net salary below gross for default inputs", () => {
    const result = TRCalculator.calculate(TRCalculator.getDefaultInputs());
    expect(result.country).toBe("TR");
    expect(result.netSalary).toBeGreaterThan(0);
    expect(result.netSalary).toBeLessThan(result.grossSalary);
  });

  it("applies minimum wage exemption to taxable income", () => {
    const result = calculateTR({
      ...TRCalculator.getDefaultInputs(),
      grossSalary: TR_MINIMUM_WAGE_ANNUAL_EXEMPTION_2026 + 50_000,
    });
    if (result.breakdown.type !== "TR") throw new Error("expected TR breakdown");
    expect(result.breakdown.minimumWageExemption).toBe(
      TR_MINIMUM_WAGE_ANNUAL_EXEMPTION_2026,
    );
    expect(result.breakdown.taxableAfterExemption).toBe(50_000);
  });

  it("zero income tax at minimum wage only", () => {
    const result = calculateTR({
      ...TRCalculator.getDefaultInputs(),
      grossSalary: TR_MINIMUM_WAGE_ANNUAL_EXEMPTION_2026,
    });
    expect(result.taxes.incomeTax).toBe(0);
  });

  it("caps SGK base at ceiling", () => {
    const result = calculateTR({
      ...TRCalculator.getDefaultInputs(),
      grossSalary: 5_000_000,
    });
    if (result.breakdown.type !== "TR") throw new Error("expected TR breakdown");
    expect(result.breakdown.sgkBase).toBeLessThan(5_000_000);
  });

  it("scales monotonically for higher gross", () => {
    const low = TRCalculator.calculate({
      ...TRCalculator.getDefaultInputs(),
      grossSalary: 400_000,
    });
    const high = TRCalculator.calculate({
      ...TRCalculator.getDefaultInputs(),
      grossSalary: 1_200_000,
    });
    expect(high.totalTax).toBeGreaterThan(low.totalTax);
  });
});
