// Golden checks vs Belize Social Security and income tax rules.
// https://www.socialsecurity.org.bz/ | https://www.belize.gov.bz/

import { describe, expect, it } from "vitest";
import { BZCalculator } from "./calculator";

describe("BZ calculator", () => {
  it("withholds capped social and flat PIT at default gross", () => {
    const result = BZCalculator.calculate({
      ...BZCalculator.getDefaultInputs(),
      grossSalary: 60_000,
    });

    expect(result.taxes.socialSecurity).toBe(1_216.8);
    expect(result.taxes.incomeTax).toBe(7_750);
    expect(result.netSalary).toBe(51_033.2);
  });

  it("has zero PIT when gross is below BZD 29,000 exemption", () => {
    const result = BZCalculator.calculate({
      ...BZCalculator.getDefaultInputs(),
      grossSalary: 25_000,
    });

    expect(result.taxes.incomeTax).toBe(0);
    expect(result.taxes.socialSecurity).toBe(1_125);
    expect(result.netSalary).toBe(23_875);
  });

  it("caps employee social at about BZD 1,217/year", () => {
    const result = BZCalculator.calculate({
      ...BZCalculator.getDefaultInputs(),
      grossSalary: 100_000,
    });

    expect(result.taxes.socialSecurity).toBe(1_216.8);
    expect(result.taxes.incomeTax).toBe(17_750);
    expect(result.netSalary).toBe(81_033.2);
  });

  it("applies 25% PIT on income above exemption", () => {
    const result = BZCalculator.calculate({
      ...BZCalculator.getDefaultInputs(),
      grossSalary: 50_000,
    });

    expect(result.taxes.incomeTax).toBe(5_250);
  });

  it("returns zero tax on zero gross", () => {
    const result = BZCalculator.calculate({
      ...BZCalculator.getDefaultInputs(),
      grossSalary: 0,
    });

    expect(result.totalTax).toBe(0);
    expect(result.netSalary).toBe(0);
  });
});
