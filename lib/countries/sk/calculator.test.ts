// Golden numbers cross-checked against Finančná správa progressive tax structure.
// Source: https://www.financnasprava.sk/sk/elektronicke-sluzby/elektronicka-kalkulacka-dane-z-prijmov
import { describe, expect, it } from "vitest";
import { SKCalculator } from "./calculator";

describe("SK calculator", () => {
  it("returns net salary below gross for default inputs", () => {
    const inputs = SKCalculator.getDefaultInputs();
    const result = SKCalculator.calculate(inputs);
    expect(result.country).toBe("SK");
    expect(result.netSalary).toBeGreaterThan(0);
    expect(result.netSalary).toBeLessThan(result.grossSalary);
  });

  it("applies NCZD and 19% bracket on EUR 36,000 gross", () => {
    const result = SKCalculator.calculate({
      ...SKCalculator.getDefaultInputs(),
      grossSalary: 36_000,
    });
    expect(result.breakdown.type).toBe("SK");
    if (result.breakdown.type === "SK") {
      expect(result.breakdown.socialInsurance.employee).toBe(3384);
      expect(result.breakdown.healthInsurance.employee).toBe(1800);
      expect(result.breakdown.nonTaxableAllowance).toBe(5966.73);
      expect(result.breakdown.taxableIncome).toBe(24849.27);
      expect(result.breakdown.incomeTax.total).toBe(4721.36);
    }
    expect(result.netSalary).toBe(26094.64);
  });

  it("phases out NCZD and applies higher PIT brackets on EUR 80,000 gross", () => {
    const result = SKCalculator.calculate({
      ...SKCalculator.getDefaultInputs(),
      grossSalary: 80_000,
    });
    if (result.breakdown.type === "SK") {
      expect(result.breakdown.nonTaxableAllowance).toBe(0);
      expect(result.breakdown.taxableIncome).toBe(68480);
      expect(result.breakdown.incomeTax.total).toBe(14887.54);
    }
    expect(result.netSalary).toBe(53592.46);
  });
});
