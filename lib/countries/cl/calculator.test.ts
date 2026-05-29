// Golden checks vs SII simplified monthly table annualized
// https://www.sii.cl/

import { describe, expect, it } from "vitest";
import { CLCalculator } from "./calculator";

describe("CL calculator", () => {
  it("withholds 17.6% mandatory contributions on gross", () => {
    const gross = 12_000_000;
    const result = CLCalculator.calculate({
      ...CLCalculator.getDefaultInputs(),
      grossSalary: gross,
    });
    const mandatory =
      result.taxes.afp + result.taxes.health + result.taxes.unemployment;
    expect(mandatory).toBeCloseTo(gross * 0.176, 0);
  });

  it("has zero PIT below first UTM annual threshold at CLP 12M", () => {
    const result = CLCalculator.calculate(CLCalculator.getDefaultInputs());
    expect(result.taxes.incomeTax).toBe(0);
    expect(result.netSalary).toBeCloseTo(9_888_000, 0);
  });

  it("applies higher bracket tax on larger salaries", () => {
    const low = CLCalculator.calculate({
      ...CLCalculator.getDefaultInputs(),
      grossSalary: 12_000_000,
    });
    const high = CLCalculator.calculate({
      ...CLCalculator.getDefaultInputs(),
      grossSalary: 30_000_000,
    });
    expect(high.taxes.incomeTax).toBeGreaterThan(low.taxes.incomeTax);
    expect(high.netSalary).toBeLessThan(high.grossSalary);
  });
});
