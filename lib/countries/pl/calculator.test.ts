import { describe, expect, it } from "vitest";
import { PLCalculator } from "./calculator";

describe("PL calculator smoke", () => {
  it("returns net salary below gross for default inputs", () => {
    const inputs = PLCalculator.getDefaultInputs();
    const result = PLCalculator.calculate(inputs);
    expect(result.country).toBe("PL");
    expect(result.netSalary).toBeGreaterThan(0);
    expect(result.netSalary).toBeLessThan(result.grossSalary);
  });

  it("matches ZUS, health, and PIT at PLN 120,000 gross", () => {
    const result = PLCalculator.calculate({
      ...PLCalculator.getDefaultInputs(),
      grossSalary: 120_000,
    });
    expect(result.totalTax).toBeCloseTo(33_478.76, 0);
    expect(result.netSalary).toBeCloseTo(86_521.24, 0);
  });
});
