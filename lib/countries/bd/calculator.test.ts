// Golden checks vs NBR FY 2026-27 salary tax slabs
// https://nbr.gov.bd/

import { describe, expect, it } from "vitest";
import { BDCalculator } from "./calculator";

describe("BD calculator", () => {
  it("applies FY 2026-27 slabs at BDT 1,200,000 default", () => {
    const result = BDCalculator.calculate(BDCalculator.getDefaultInputs());
    expect(result.taxes.incomeTax).toBeCloseTo(115_000, 0);
    expect(result.netSalary).toBeCloseTo(1_085_000, 0);
  });

  it("has zero tax below BDT 375,000", () => {
    const result = BDCalculator.calculate({
      ...BDCalculator.getDefaultInputs(),
      grossSalary: 300_000,
    });
    expect(result.taxes.incomeTax).toBe(0);
    expect(result.netSalary).toBe(300_000);
  });

  it("applies 10% and 15% bands on BDT 800,000 salary", () => {
    const result = BDCalculator.calculate({
      ...BDCalculator.getDefaultInputs(),
      grossSalary: 800_000,
    });
    expect(result.taxes.incomeTax).toBeCloseTo(48_750, 0);
    expect(result.netSalary).toBeCloseTo(751_250, 0);
  });

  it("applies top 30% bracket on BDT 5,000,000 salary", () => {
    const result = BDCalculator.calculate({
      ...BDCalculator.getDefaultInputs(),
      grossSalary: 5_000_000,
    });
    expect(result.taxes.incomeTax).toBeCloseTo(1_117_500, 0);
    expect(result.netSalary).toBeCloseTo(3_882_500, 0);
  });

  it("returns zero tax on zero gross salary", () => {
    const result = BDCalculator.calculate({
      ...BDCalculator.getDefaultInputs(),
      grossSalary: 0,
    });
    expect(result.taxes.incomeTax).toBe(0);
    expect(result.netSalary).toBe(0);
  });
});
