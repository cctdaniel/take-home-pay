// Golden checks vs Albania tatime.gov.al salary tax rules.
// https://www.tatime.gov.al/

import { describe, expect, it } from "vitest";
import { ALCalculator } from "./calculator";

describe("AL calculator", () => {
  it("withholds social insurance and progressive PIT at default gross", () => {
    const result = ALCalculator.calculate({
      ...ALCalculator.getDefaultInputs(),
      grossSalary: 1_800_000,
    });

    expect(result.taxes.socialInsurance).toBe(201_600);
    expect(result.taxes.incomeTax).toBe(160_992);
    expect(result.netSalary).toBe(1_437_408);
  });

  it("applies 13% PIT on income after social and personal deduction", () => {
    const result = ALCalculator.calculate({
      ...ALCalculator.getDefaultInputs(),
      grossSalary: 500_000,
    });

    expect(result.taxes.socialInsurance).toBe(56_000);
    expect(result.taxes.incomeTax).toBe(10_920);
    expect(result.netSalary).toBe(433_080);
  });

  it("applies 23% top bracket above ALL 2,040,000 taxable", () => {
    const result = ALCalculator.calculate({
      ...ALCalculator.getDefaultInputs(),
      grossSalary: 5_000_000,
    });

    expect(result.taxes.incomeTax).toBe(805_575.09);
    expect(result.netSalary).toBe(3_943_881.81);
  });

  it("caps social insurance at ALL 186,416/month", () => {
    const result = ALCalculator.calculate({
      ...ALCalculator.getDefaultInputs(),
      grossSalary: 5_000_000,
    });

    expect(result.taxes.socialInsurance).toBe(250_543.1);
  });

  it("returns zero tax on zero gross", () => {
    const result = ALCalculator.calculate({
      ...ALCalculator.getDefaultInputs(),
      grossSalary: 0,
    });

    expect(result.totalTax).toBe(0);
    expect(result.netSalary).toBe(0);
  });

  it("reduces PIT when voluntary private pension is deducted", () => {
    const result = ALCalculator.calculate({
      ...ALCalculator.getDefaultInputs(),
      grossSalary: 1_800_000,
      contributions: { voluntaryPension: 480_000 },
    });

    expect(result.taxableIncome).toBe(758_400);
    expect(result.taxes.incomeTax).toBe(98_592);
    expect(result.netSalary).toBe(1_019_808);
  });
});
