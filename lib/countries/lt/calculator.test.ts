// Golden numbers cross-checked against VMI GPM brackets and SODRA VSD cap.
// Source: https://www.vmi.lt/cms/en/income-tax
import { describe, expect, it } from "vitest";
import { LTCalculator } from "./calculator";

describe("LT calculator", () => {
  it("returns net salary below gross for default inputs", () => {
    const inputs = LTCalculator.getDefaultInputs();
    const result = LTCalculator.calculate(inputs);
    expect(result.country).toBe("LT");
    expect(result.netSalary).toBeGreaterThan(0);
    expect(result.netSalary).toBeLessThan(result.grossSalary);
  });

  it("applies 19.5% VSD and 20% GPM on EUR 36,000 gross", () => {
    const result = LTCalculator.calculate({
      ...LTCalculator.getDefaultInputs(),
      grossSalary: 36_000,
    });
    if (result.breakdown.type === "LT") {
      expect(result.breakdown.vsd.employee).toBe(7020);
      expect(result.breakdown.taxableIncome).toBe(28980);
    }
    expect(result.netSalary).toBe(23184);
  });

  it("caps VSD and applies top GPM bracket on EUR 150,000 gross", () => {
    const result = LTCalculator.calculate({
      ...LTCalculator.getDefaultInputs(),
      grossSalary: 150_000,
    });
    if (result.breakdown.type === "LT") {
      expect(result.breakdown.vsd.employee).toBe(27052.16);
      expect(result.breakdown.taxableIncome).toBe(122947.84);
    }
    expect(result.netSalary).toBe(96372.75);
  });
});
