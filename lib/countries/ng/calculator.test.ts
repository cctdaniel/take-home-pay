// Golden checks vs Nigeria Tax Act 2025 Fourth Schedule PAYE
// https://www.firs.gov.ng/

import { describe, expect, it } from "vitest";
import { NGCalculator } from "./calculator";

describe("NG calculator", () => {
  it("applies pension and NTA 2025 PAYE at NGN 7,200,000 default", () => {
    const result = NGCalculator.calculate(NGCalculator.getDefaultInputs());
    expect(result.taxes.pension).toBeCloseTo(576_000, 0);
    expect(result.taxableIncome).toBeCloseTo(6_624_000, 0);
    expect(result.taxes.incomeTax).toBeCloseTo(982_320, 0);
    expect(result.netSalary).toBeCloseTo(5_641_680, 0);
  });

  it("has zero PAYE below NGN 800,000 chargeable income", () => {
    const result = NGCalculator.calculate({
      ...NGCalculator.getDefaultInputs(),
      grossSalary: 500_000,
    });
    expect(result.taxes.pension).toBeCloseTo(40_000, 0);
    expect(result.taxes.incomeTax).toBe(0);
    expect(result.netSalary).toBeCloseTo(460_000, 0);
  });

  it("applies 15% band on NGN 2,000,000 salary", () => {
    const result = NGCalculator.calculate({
      ...NGCalculator.getDefaultInputs(),
      grossSalary: 2_000_000,
    });
    expect(result.taxes.pension).toBeCloseTo(160_000, 0);
    expect(result.taxes.incomeTax).toBeCloseTo(156_000, 0);
    expect(result.netSalary).toBeCloseTo(1_684_000, 0);
  });

  it("applies top PAYE bands on NGN 30,000,000 salary", () => {
    const result = NGCalculator.calculate({
      ...NGCalculator.getDefaultInputs(),
      grossSalary: 30_000_000,
    });
    expect(result.taxes.pension).toBeCloseTo(2_400_000, 0);
    expect(result.taxes.incomeTax).toBeCloseTo(5_278_000, 0);
    expect(result.netSalary).toBeCloseTo(22_322_000, 0);
  });

  it("returns zero deductions on zero gross salary", () => {
    const result = NGCalculator.calculate({
      ...NGCalculator.getDefaultInputs(),
      grossSalary: 0,
    });
    expect(result.taxes.incomeTax).toBe(0);
    expect(result.taxes.pension).toBe(0);
    expect(result.netSalary).toBe(0);
  });
});
