// Golden checks vs Barbados BRA PAYE and NIS rules.
// https://www.bra.gov.bb/ | https://www.nis.gov.bb/

import { describe, expect, it } from "vitest";
import { BBCalculator } from "./calculator";

describe("BB calculator", () => {
  it("withholds NIS, Resilience Fund, and PAYE at default gross", () => {
    const result = BBCalculator.calculate({
      ...BBCalculator.getDefaultInputs(),
      grossSalary: 80_000,
    });

    expect(result.taxes.nisEmployee).toBe(6_969.6);
    expect(result.taxes.resilienceFund).toBe(200);
    expect(result.taxes.incomeTax).toBe(7_675);
    expect(result.netSalary).toBe(65_155.4);
  });

  it("applies 12.5% PAYE on income after allowance up to BBD 50,000 taxable", () => {
    const result = BBCalculator.calculate({
      ...BBCalculator.getDefaultInputs(),
      grossSalary: 40_000,
    });

    expect(result.taxes.incomeTax).toBe(1_875);
    expect(result.netSalary).toBe(33_625);
  });

  it("caps NIS base at BBD 5,280/month", () => {
    const result = BBCalculator.calculate({
      ...BBCalculator.getDefaultInputs(),
      grossSalary: 120_000,
    });

    expect(result.taxes.nisEmployee).toBe(6_969.6);
    expect(result.taxes.incomeTax).toBe(19_075);
    expect(result.netSalary).toBe(93_655.4);
  });

  it("does not deduct NIS from PAYE base", () => {
    const result = BBCalculator.calculate({
      ...BBCalculator.getDefaultInputs(),
      grossSalary: 80_000,
    });

    expect(result.breakdown.payeTaxableIncome).toBe(55_000);
  });

  it("returns zero tax on zero gross", () => {
    const result = BBCalculator.calculate({
      ...BBCalculator.getDefaultInputs(),
      grossSalary: 0,
    });

    expect(result.totalTax).toBe(0);
    expect(result.netSalary).toBe(0);
  });
});
