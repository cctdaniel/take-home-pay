// Smoke tests — extend with official golden numbers
import { describe, expect, it } from "vitest";
import { NLCalculator } from "./calculator";

describe("NL calculator smoke", () => {
  it("returns net salary below gross for default inputs", () => {
    const inputs = NLCalculator.getDefaultInputs();
    const result = NLCalculator.calculate(inputs);
    expect(result.country).toBe("NL");
    expect(result.netSalary).toBeGreaterThan(0);
    expect(result.netSalary).toBeLessThanOrEqual(result.grossSalary);
  });

  it("scales monotonically for higher gross at defaults", () => {
    const low = NLCalculator.calculate({
      ...NLCalculator.getDefaultInputs(),
      grossSalary: NLCalculator.getDefaultInputs().grossSalary * 0.5,
    });
    const high = NLCalculator.calculate({
      ...NLCalculator.getDefaultInputs(),
      grossSalary: NLCalculator.getDefaultInputs().grossSalary * 1.5,
    });
    expect(high.totalTax).toBeGreaterThanOrEqual(low.totalTax);
  });
});

