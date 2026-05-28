import { describe, expect, it } from "vitest";
import { BRCalculator } from "./calculator";

describe("BR calculator smoke", () => {
  it("returns net salary below gross for default inputs", () => {
    const inputs = BRCalculator.getDefaultInputs();
    const result = BRCalculator.calculate(inputs);
    expect(result.country).toBe("BR");
    expect(result.netSalary).toBeGreaterThan(0);
    expect(result.netSalary).toBeLessThan(result.grossSalary);
  });

  it("matches modeled annual deductions at BRL 120,000 gross", () => {
    const result = BRCalculator.calculate({
      ...BRCalculator.getDefaultInputs(),
      grossSalary: 120_000,
    });
    expect(result.totalTax).toBeCloseTo(30_374.42, 0);
    expect(result.netSalary).toBeCloseTo(89_625.58, 0);
  });
});
