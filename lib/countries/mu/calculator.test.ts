// Golden checks vs Mauritius MRA PAYE and CSG rules.
// https://www.mra.mu/

import { describe, expect, it } from "vitest";
import { MUCalculator } from "./calculator";

describe("MU calculator", () => {
  it("withholds CSG and PAYE at default gross", () => {
    const result = MUCalculator.calculate({
      ...MUCalculator.getDefaultInputs(),
      grossSalary: 600_000,
    });

    expect(result.taxes.csgEmployee).toBe(9_000);
    expect(result.taxes.incomeTax).toBe(9_100);
    expect(result.netSalary).toBe(581_900);
  });

  it("applies 1.5% CSG when monthly gross is MUR 50,000 or below", () => {
    const result = MUCalculator.calculate({
      ...MUCalculator.getDefaultInputs(),
      grossSalary: 480_000,
    });

    expect(result.taxes.csgEmployee).toBe(7_200);
    expect(result.taxes.incomeTax).toBe(0);
    expect(result.netSalary).toBe(472_800);
  });

  it("applies 3% CSG and top PAYE bracket on high salary", () => {
    const result = MUCalculator.calculate({
      ...MUCalculator.getDefaultInputs(),
      grossSalary: 1_200_000,
    });

    expect(result.taxes.csgEmployee).toBe(36_000);
    expect(result.taxes.incomeTax).toBe(82_800);
    expect(result.netSalary).toBe(1_081_200);
  });

  it("has zero PAYE in first MUR 500,000 after CSG", () => {
    const result = MUCalculator.calculate({
      ...MUCalculator.getDefaultInputs(),
      grossSalary: 500_000,
    });

    expect(result.taxes.incomeTax).toBe(0);
  });

  it("returns zero tax on zero gross", () => {
    const result = MUCalculator.calculate({
      ...MUCalculator.getDefaultInputs(),
      grossSalary: 0,
    });

    expect(result.totalTax).toBe(0);
    expect(result.netSalary).toBe(0);
  });
});
