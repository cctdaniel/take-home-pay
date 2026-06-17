// Golden checks vs Egyptian Tax Authority progressive salary tax
// https://eta.gov.eg/

import { describe, expect, it } from "vitest";
import { EGCalculator } from "./calculator";

describe("EG calculator", () => {
  it("applies social insurance, exemption, and PIT at EGP 300,000 default", () => {
    const result = EGCalculator.calculate(EGCalculator.getDefaultInputs());
    expect(result.taxes.socialInsurance).toBeCloseTo(33_000, 0);
    expect(result.taxableIncome).toBeCloseTo(247_000, 0);
    expect(result.taxes.incomeTax).toBeCloseTo(40_325, 0);
    expect(result.netSalary).toBeCloseTo(226_675, 0);
  });

  it("has zero income tax below personal exemption after social insurance", () => {
    const result = EGCalculator.calculate({
      ...EGCalculator.getDefaultInputs(),
      grossSalary: 50_000,
    });
    expect(result.taxes.socialInsurance).toBeCloseTo(5_500, 0);
    expect(result.taxes.incomeTax).toBe(0);
    expect(result.netSalary).toBeCloseTo(44_500, 0);
  });

  it("applies 10% and 15% bands on mid salary EGP 100,000", () => {
    const result = EGCalculator.calculate({
      ...EGCalculator.getDefaultInputs(),
      grossSalary: 100_000,
    });
    expect(result.taxes.incomeTax).toBeCloseTo(3_600, 0);
    expect(result.netSalary).toBeCloseTo(85_400, 0);
  });

  it("applies top 27.5% bracket on high salary EGP 1,500,000", () => {
    const result = EGCalculator.calculate({
      ...EGCalculator.getDefaultInputs(),
      grossSalary: 1_500_000,
    });
    expect(result.taxes.socialInsurance).toBeCloseTo(165_000, 0);
    expect(result.taxes.incomeTax).toBeCloseTo(306_375, 0);
    expect(result.netSalary).toBeCloseTo(1_028_625, 0);
  });

  it("returns zero tax on zero gross salary", () => {
    const result = EGCalculator.calculate({
      ...EGCalculator.getDefaultInputs(),
      grossSalary: 0,
    });
    expect(result.taxes.incomeTax).toBe(0);
    expect(result.taxes.socialInsurance).toBe(0);
    expect(result.netSalary).toBe(0);
  });
});
