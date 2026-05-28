import { describe, expect, it } from "vitest";
import { SACalculator } from "./calculator";

describe("SA calculator smoke", () => {
  it("returns full gross for expatriate default inputs", () => {
    const result = SACalculator.calculate(SACalculator.getDefaultInputs());
    expect(result.country).toBe("SA");
    expect(result.totalTax).toBe(0);
    expect(result.netSalary).toBe(result.grossSalary);
  });

  it("deducts 10% GOSI for Saudi nationals on contribution proxy", () => {
    const result = SACalculator.calculate({
      ...SACalculator.getDefaultInputs(),
      nationality: "saudi_national",
    });
    expect(result.totalTax).toBe(25_200);
    expect(result.netSalary).toBe(334_800);
  });
});
