// Golden checks vs DIAN simplified UVT withholding table
// https://www.dian.gov.co/

import { describe, expect, it } from "vitest";
import { COCalculator } from "./calculator";

describe("CO calculator", () => {
  it("withholds 9% mandatory contributions on gross", () => {
    const gross = 120_000_000;
    const result = COCalculator.calculate({
      ...COCalculator.getDefaultInputs(),
      grossSalary: gross,
    });
    const mandatory =
      result.taxes.pension + result.taxes.health + result.taxes.solidarity;
    expect(mandatory).toBeCloseTo(gross * 0.09, 0);
  });

  it("applies progressive PIT at COP 120M annual", () => {
    const result = COCalculator.calculate(COCalculator.getDefaultInputs());
    expect(result.taxes.incomeTax).toBeCloseTo(11_736_000, 0);
    expect(result.netSalary).toBeCloseTo(97_464_000, 0);
  });

  it("returns net below gross for default inputs", () => {
    const result = COCalculator.calculate(COCalculator.getDefaultInputs());
    expect(result.netSalary).toBeLessThan(result.grossSalary);
    expect(result.netSalary).toBeGreaterThan(0);
  });
});
