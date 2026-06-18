// Golden checks vs Paraguay MTESS IPS and SET IRP rules.
// https://www.mtess.gov.py/ | https://www.set.gov.py/

import { describe, expect, it } from "vitest";
import { PYCalculator } from "./calculator";

describe("PY calculator", () => {
  it("withholds IPS and IRP above threshold at default gross", () => {
    const result = PYCalculator.calculate({
      ...PYCalculator.getDefaultInputs(),
      grossSalary: 120_000_000,
    });

    expect(result.taxes.ipsEmployee).toBe(10_800_000);
    expect(result.taxes.incomeTax).toBe(9_328_000);
    expect(result.netSalary).toBe(99_872_000);
  });

  it("withholds IPS only when gross is below IRP threshold", () => {
    const result = PYCalculator.calculate({
      ...PYCalculator.getDefaultInputs(),
      grossSalary: 60_000_000,
    });

    expect(result.taxes.ipsEmployee).toBe(5_400_000);
    expect(result.taxes.incomeTax).toBe(0);
    expect(result.netSalary).toBe(54_600_000);
  });

  it("applies progressive IRP on full net income when gross exceeds PYG 80M", () => {
    const result = PYCalculator.calculate({
      ...PYCalculator.getDefaultInputs(),
      grossSalary: 200_000_000,
    });

    expect(result.taxes.incomeTax).toBe(16_200_000);
    expect(result.netSalary).toBe(165_800_000);
  });

  it("withholds 9% IPS on gross", () => {
    const result = PYCalculator.calculate({
      ...PYCalculator.getDefaultInputs(),
      grossSalary: 100_000_000,
    });

    expect(result.taxes.ipsEmployee).toBe(9_000_000);
  });

  it("returns zero tax on zero gross", () => {
    const result = PYCalculator.calculate({
      ...PYCalculator.getDefaultInputs(),
      grossSalary: 0,
    });

    expect(result.totalTax).toBe(0);
    expect(result.netSalary).toBe(0);
  });
});
