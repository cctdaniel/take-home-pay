// Golden checks vs Egyptian Tax Authority progressive salary tax
// https://eta.gov.eg/

import { describe, expect, it } from "vitest";
import { EG_SOCIAL_INSURANCE_2026 } from "./constants/tax-year-2026";
import { EGCalculator } from "./calculator";

describe("EG calculator", () => {
  it("applies capped social insurance, exemption, and PIT at EGP 300,000 default", () => {
    const result = EGCalculator.calculate(EGCalculator.getDefaultInputs());
    const expectedSocial =
      EG_SOCIAL_INSURANCE_2026.annualSalaryCap *
      EG_SOCIAL_INSURANCE_2026.employeeRate;
    expect(result.taxes.socialInsurance).toBeCloseTo(expectedSocial, 0);
    expect(result.taxableIncome).toBeCloseTo(257_956, 0);
    expect(result.taxes.incomeTax).toBeCloseTo(42_790.1, 0);
    expect(result.netSalary).toBeCloseTo(235_165.9, 0);
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

  it("caps social insurance and applies top bracket on high salary EGP 1,500,000", () => {
    const result = EGCalculator.calculate({
      ...EGCalculator.getDefaultInputs(),
      grossSalary: 1_500_000,
    });
    expect(result.taxes.socialInsurance).toBeCloseTo(22_044, 0);
    expect(result.taxes.incomeTax).toBeCloseTo(345_687.9, 0);
    expect(result.netSalary).toBeCloseTo(1_132_268.1, 0);
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
