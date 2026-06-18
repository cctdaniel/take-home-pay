// Golden checks vs Dominican Republic DGII ISR and TSS rules.
// https://www.dgii.gov.do/

import { describe, expect, it } from "vitest";
import { DOCalculator } from "./calculator";

describe("DO calculator", () => {
  it("withholds TSS and progressive ISR at default gross", () => {
    const result = DOCalculator.calculate({
      ...DOCalculator.getDefaultInputs(),
      grossSalary: 720_000,
    });

    expect(result.taxes.tssEmployee).toBe(42_552);
    expect(result.taxes.incomeTax).toBe(41_840.15);
    expect(result.netSalary).toBe(635_607.85);
  });

  it("has zero ISR when salary after TSS is within exempt band", () => {
    const result = DOCalculator.calculate({
      ...DOCalculator.getDefaultInputs(),
      grossSalary: 400_000,
    });

    expect(result.taxes.tssEmployee).toBe(23_640);
    expect(result.taxes.incomeTax).toBe(0);
    expect(result.netSalary).toBe(376_360);
  });

  it("applies 25% top ISR bracket on high salary", () => {
    const result = DOCalculator.calculate({
      ...DOCalculator.getDefaultInputs(),
      grossSalary: 1_500_000,
    });

    expect(result.taxes.incomeTax).toBe(215_831.9);
    expect(result.netSalary).toBe(1_195_518.1);
  });

  it("withholds 5.91% TSS on gross below contribution ceilings", () => {
    const result = DOCalculator.calculate({
      ...DOCalculator.getDefaultInputs(),
      grossSalary: 600_000,
    });

    expect(result.taxes.tssEmployee).toBe(35_460);
  });

  it("caps TSS contributions at separate AFP and SFS monthly ceilings", () => {
    const result = DOCalculator.calculate({
      ...DOCalculator.getDefaultInputs(),
      grossSalary: 6_000_000,
    });

    expect(result.taxes.tssEmployee).toBe(244_677.52);
    expect(result.taxes.incomeTax).toBe(1_301_825.02);
    expect(result.netSalary).toBe(4_453_497.46);
  });

  it("returns zero tax on zero gross", () => {
    const result = DOCalculator.calculate({
      ...DOCalculator.getDefaultInputs(),
      grossSalary: 0,
    });

    expect(result.totalTax).toBe(0);
    expect(result.netSalary).toBe(0);
  });
});
