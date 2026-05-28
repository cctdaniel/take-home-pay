// Smoke tests — extend with official golden numbers
import { describe, expect, it } from "vitest";
import { KRCalculator } from "./calculator";

describe("KR calculator smoke", () => {
  it("returns net salary below gross for default inputs", () => {
    const inputs = KRCalculator.getDefaultInputs();
    const result = KRCalculator.calculate(inputs);
    expect(result.country).toBe("KR");
    expect(result.netSalary).toBeGreaterThan(0);
    expect(result.netSalary).toBeLessThanOrEqual(result.grossSalary);
  });

  it("scales monotonically for higher gross at defaults", () => {
    const low = KRCalculator.calculate({
      ...KRCalculator.getDefaultInputs(),
      grossSalary: KRCalculator.getDefaultInputs().grossSalary * 0.5,
    });
    const high = KRCalculator.calculate({
      ...KRCalculator.getDefaultInputs(),
      grossSalary: KRCalculator.getDefaultInputs().grossSalary * 1.5,
    });
    expect(high.totalTax).toBeGreaterThanOrEqual(low.totalTax);
  });
});

