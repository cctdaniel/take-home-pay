// Smoke tests — extend with official golden numbers
import { describe, expect, it } from "vitest";
import { CNCalculator } from "./calculator";

describe("CN calculator smoke", () => {
  it("returns net salary below gross for default inputs", () => {
    const inputs = CNCalculator.getDefaultInputs();
    const result = CNCalculator.calculate(inputs);
    expect(result.country).toBe("CN");
    expect(result.netSalary).toBeGreaterThan(0);
    expect(result.netSalary).toBeLessThanOrEqual(result.grossSalary);
  });

  it("scales monotonically for higher gross at defaults", () => {
    const low = CNCalculator.calculate({
      ...CNCalculator.getDefaultInputs(),
      grossSalary: CNCalculator.getDefaultInputs().grossSalary * 0.5,
    });
    const high = CNCalculator.calculate({
      ...CNCalculator.getDefaultInputs(),
      grossSalary: CNCalculator.getDefaultInputs().grossSalary * 1.5,
    });
    expect(high.totalTax).toBeGreaterThanOrEqual(low.totalTax);
  });
});

