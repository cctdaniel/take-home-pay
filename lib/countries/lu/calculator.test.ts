// Golden checks vs Luxembourg CCSS / impotsdirects employment withholding
// https://impotsdirects.public.lu/

import { describe, expect, it } from "vitest";
import { LUCalculator } from "./calculator";

describe("LU calculator", () => {
  it("applies capped social and progressive PIT at EUR 72,000", () => {
    const result = LUCalculator.calculate({
      ...LUCalculator.getDefaultInputs(),
      grossSalary: 72_000,
    });
    expect(result.taxes.employeeSocial).toBeCloseTo(8_964, 0);
    expect(result.taxes.incomeTax).toBeCloseTo(5_512.84, 0);
    expect(result.netSalary).toBeCloseTo(57_523.16, 0);
  });

  it("caps employee social base at EUR 140,364", () => {
    const result = LUCalculator.calculate({
      ...LUCalculator.getDefaultInputs(),
      grossSalary: 200_000,
    });
    expect(result.taxes.employeeSocial).toBeCloseTo(17_475.32, 0);
  });

  it("returns net below gross for default inputs", () => {
    const result = LUCalculator.calculate(LUCalculator.getDefaultInputs());
    expect(result.netSalary).toBeLessThan(result.grossSalary);
    expect(result.netSalary).toBeGreaterThan(0);
  });
});
