// Golden checks vs PwC / standard 18% + 5% employment withholding
// https://taxsummaries.pwc.com/ukraine/individual/taxes-on-personal-income

import { describe, expect, it } from "vitest";
import { UACalculator } from "./calculator";

describe("UA calculator", () => {
  it("withholds 23% from gross employment income", () => {
    const result = UACalculator.calculate({
      ...UACalculator.getDefaultInputs(),
      grossSalary: 100_000,
    });
    expect(result.taxes.incomeTax).toBe(18_000);
    expect(result.taxes.militaryTax).toBe(5_000);
    expect(result.netSalary).toBe(77_000);
  });

  it("returns lower net than gross for default salary", () => {
    const result = UACalculator.calculate(UACalculator.getDefaultInputs());
    expect(result.netSalary).toBeGreaterThan(0);
    expect(result.netSalary).toBeLessThan(result.grossSalary);
    expect(result.effectiveTaxRate).toBeCloseTo(0.23, 5);
  });
});
