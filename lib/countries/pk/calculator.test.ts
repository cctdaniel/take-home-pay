// Golden checks vs FBR FY2026 salary tax slabs
// https://www.fbr.gov.pk/income-tax-rates/1141

import { describe, expect, it } from "vitest";
import { PKCalculator } from "./calculator";

describe("PK calculator", () => {
  it("applies FY2026 slabs at PKR 3,000,000 annual", () => {
    const result = PKCalculator.calculate(PKCalculator.getDefaultInputs());
    expect(result.taxes.incomeTax).toBeCloseTo(316_000, 0);
    expect(result.netSalary).toBeCloseTo(2_684_000, 0);
  });

  it("has zero tax below PKR 600,000", () => {
    const result = PKCalculator.calculate({
      ...PKCalculator.getDefaultInputs(),
      grossSalary: 500_000,
    });
    expect(result.taxes.incomeTax).toBe(0);
    expect(result.netSalary).toBe(500_000);
  });

  it("returns net below gross for higher salaries", () => {
    const result = PKCalculator.calculate({
      ...PKCalculator.getDefaultInputs(),
      grossSalary: 5_000_000,
    });
    expect(result.netSalary).toBeLessThan(result.grossSalary);
    expect(result.taxes.incomeTax).toBeGreaterThan(316_000);
  });
});
