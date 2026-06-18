// Golden checks vs Montenegro Poreska uprava salary tax rules.
// https://www.poreskauprava.gov.me/

import { describe, expect, it } from "vitest";
import { MECalculator } from "./calculator";

describe("ME calculator", () => {
  it("withholds pension, unemployment, and monthly PIT at default gross", () => {
    const result = MECalculator.calculate({
      ...MECalculator.getDefaultInputs(),
      grossSalary: 24_000,
    });

    expect(result.taxes.pensionEmployee).toBe(2_400);
    expect(result.taxes.unemploymentEmployee).toBe(120);
    expect(result.taxes.incomeTax).toBe(1_746);
    expect(result.netSalary).toBe(19_734);
  });

  it("has zero monthly PIT when income after social stays in exempt band", () => {
    const result = MECalculator.calculate({
      ...MECalculator.getDefaultInputs(),
      grossSalary: 8_400,
    });

    expect(result.taxes.incomeTax).toBe(0);
    expect(result.netSalary).toBe(7_518);
  });

  it("caps pension base at EUR 68,765 on high salary", () => {
    const result = MECalculator.calculate({
      ...MECalculator.getDefaultInputs(),
      grossSalary: 100_000,
    });

    expect(result.taxes.pensionEmployee).toBe(6_876.5);
    expect(result.taxes.incomeTax).toBe(12_417.48);
    expect(result.netSalary).toBe(80_206.02);
  });

  it("applies 15% monthly rate above EUR 1,000 after social", () => {
    const result = MECalculator.calculate({
      ...MECalculator.getDefaultInputs(),
      grossSalary: 36_000,
    });

    expect(result.taxes.incomeTax).toBeGreaterThan(2_000);
    expect(result.effectiveTaxRate).toBeGreaterThan(0.1);
  });

  it("returns zero tax on zero gross", () => {
    const result = MECalculator.calculate({
      ...MECalculator.getDefaultInputs(),
      grossSalary: 0,
    });

    expect(result.totalTax).toBe(0);
    expect(result.netSalary).toBe(0);
  });
});
