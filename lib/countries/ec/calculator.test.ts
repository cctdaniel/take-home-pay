// Golden checks vs Ecuador SRI and IESS salary rules.
// https://www.sri.gob.ec/ | https://www.iess.gob.ec/

import { describe, expect, it } from "vitest";
import { ECCalculator } from "./calculator";

describe("EC calculator", () => {
  it("withholds IESS and progressive PIT at default gross", () => {
    const result = ECCalculator.calculate({
      ...ECCalculator.getDefaultInputs(),
      grossSalary: 36_000,
    });

    expect(result.taxes.iessEmployee).toBe(3_402);
    expect(result.taxes.incomeTax).toBe(3_113.65);
    expect(result.netSalary).toBe(29_484.35);
  });

  it("applies minimal PIT on low salary after IESS exempt band", () => {
    const result = ECCalculator.calculate({
      ...ECCalculator.getDefaultInputs(),
      grossSalary: 15_000,
    });

    expect(result.taxes.iessEmployee).toBe(1_417.5);
    expect(result.taxes.incomeTax).toBe(68.73);
    expect(result.netSalary).toBe(13_513.77);
  });

  it("caps IESS base at USD 45,000/year", () => {
    const result = ECCalculator.calculate({
      ...ECCalculator.getDefaultInputs(),
      grossSalary: 80_000,
    });

    expect(result.taxes.iessEmployee).toBe(4_252.5);
    expect(result.taxes.incomeTax).toBe(13_897);
    expect(result.netSalary).toBe(61_850.5);
  });

  it("has zero PIT when income after IESS is within exempt fraction", () => {
    const result = ECCalculator.calculate({
      ...ECCalculator.getDefaultInputs(),
      grossSalary: 12_000,
    });

    expect(result.taxes.incomeTax).toBe(0);
  });

  it("returns zero tax on zero gross", () => {
    const result = ECCalculator.calculate({
      ...ECCalculator.getDefaultInputs(),
      grossSalary: 0,
    });

    expect(result.totalTax).toBe(0);
    expect(result.netSalary).toBe(0);
  });
});
