import { describe, expect, it } from "vitest";
import { EECalculator } from "./calculator";

describe("EE calculator smoke", () => {
  it("returns net salary below gross for default inputs", () => {
    const inputs = EECalculator.getDefaultInputs();
    const result = EECalculator.calculate(inputs);
    expect(result.country).toBe("EE");
    expect(result.netSalary).toBeGreaterThan(0);
    expect(result.netSalary).toBeLessThan(result.grossSalary);
  });

  it("applies full basic allowance on low gross income", () => {
    const result = EECalculator.calculate({
      ...EECalculator.getDefaultInputs(),
      grossSalary: 10_000,
    });
    expect(result.breakdown.type).toBe("EE");
    if (result.breakdown.type === "EE") {
      expect(result.breakdown.basicAllowance).toBe(7848);
    }
    expect(result.netSalary).toBeCloseTo(9166.56, 1);
  });
});
