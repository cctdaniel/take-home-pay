// Golden checks vs Panama CSS and DGI salary tax rules.
// https://www.dgi.gob.pa/ | https://www.css.gob.pa/

import { describe, expect, it } from "vitest";
import { PACalculator } from "./calculator";

describe("PA calculator", () => {
  it("withholds CSS, education, and PIT at default gross", () => {
    const gross = 48_000;
    const result = PACalculator.calculate({
      ...PACalculator.getDefaultInputs(),
      grossSalary: gross,
    });

    expect(result.taxes.cssEmployee).toBe(4_680);
    expect(result.taxes.educationEmployee).toBe(600);
    expect(result.taxableIncome).toBe(42_720);
    expect(result.taxes.incomeTax).toBe(4_758);
    expect(result.netSalary).toBe(37_962);
  });

  it("has zero PIT when annual gross stays in exempt band", () => {
    const result = PACalculator.calculate({
      ...PACalculator.getDefaultInputs(),
      grossSalary: 10_000,
    });

    expect(result.taxes.incomeTax).toBe(0);
    expect(result.taxes.cssEmployee).toBe(975);
    expect(result.netSalary).toBe(8_900);
  });

  it("applies 25% top bracket on high salary", () => {
    const result = PACalculator.calculate({
      ...PACalculator.getDefaultInputs(),
      grossSalary: 120_000,
    });

    expect(result.taxes.incomeTax).toBeGreaterThan(15_000);
    expect(result.netSalary).toBeLessThan(100_000);
  });

  it("withholds 11% combined employee social on mid salary", () => {
    const gross = 36_000;
    const result = PACalculator.calculate({
      ...PACalculator.getDefaultInputs(),
      grossSalary: gross,
    });

    expect(result.taxes.cssEmployee + result.taxes.educationEmployee).toBe(3_960);
    expect(result.netSalary).toBe(28_884);
  });

  it("returns zero tax on zero gross", () => {
    const result = PACalculator.calculate({
      ...PACalculator.getDefaultInputs(),
      grossSalary: 0,
    });

    expect(result.totalTax).toBe(0);
    expect(result.netSalary).toBe(0);
  });

  it("reduces PIT when voluntary pension is at the 10% gross cap", () => {
    const gross = 48_000;
    const without = PACalculator.calculate({
      ...PACalculator.getDefaultInputs(),
      grossSalary: gross,
      contributions: { voluntaryPension: 0 },
    });
    const withVoluntary = PACalculator.calculate({
      ...PACalculator.getDefaultInputs(),
      grossSalary: gross,
      contributions: { voluntaryPension: 4_800 },
    });

    expect(withVoluntary.taxableIncome).toBe(37_920);
    expect(withVoluntary.taxes.incomeTax).toBe(4_038);
    expect(withVoluntary.taxes.incomeTax).toBeLessThan(without.taxes.incomeTax);
    expect(withVoluntary.netSalary).toBe(33_882);
  });
});
