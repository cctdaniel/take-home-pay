// Smoke tests — extend with official golden numbers
import { describe, expect, it } from "vitest";
import { PHCalculator } from "./calculator";

describe("PH calculator smoke", () => {
  it("returns net salary below gross for default inputs", () => {
    const inputs = PHCalculator.getDefaultInputs();
    const result = PHCalculator.calculate(inputs);
    expect(result.country).toBe("PH");
    expect(result.netSalary).toBeGreaterThan(0);
    expect(result.netSalary).toBeLessThanOrEqual(result.grossSalary);
  });

  it("scales monotonically for higher gross at defaults", () => {
    const low = PHCalculator.calculate({
      ...PHCalculator.getDefaultInputs(),
      grossSalary: PHCalculator.getDefaultInputs().grossSalary * 0.5,
    });
    const high = PHCalculator.calculate({
      ...PHCalculator.getDefaultInputs(),
      grossSalary: PHCalculator.getDefaultInputs().grossSalary * 1.5,
    });
    expect(high.totalTax).toBeGreaterThanOrEqual(low.totalTax);
  });
});

