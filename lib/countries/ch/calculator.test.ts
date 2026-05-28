import { describe, expect, it } from "vitest";
import { calculateCH } from "./calculator";
import { CHCalculator } from "./calculator";

describe("CH calculator smoke", () => {
  it("returns net salary below gross for default inputs", () => {
    const result = CHCalculator.calculate(CHCalculator.getDefaultInputs());
    expect(result.country).toBe("CH");
    expect(result.netSalary).toBeGreaterThan(0);
    expect(result.netSalary).toBeLessThan(result.grossSalary);
  });

  it("married splitting reduces tax vs single at same gross", () => {
    const gross = 180_000;
    const single = calculateCH({
      ...CHCalculator.getDefaultInputs(),
      grossSalary: gross,
      filingStatus: "single",
    });
    const married = calculateCH({
      ...CHCalculator.getDefaultInputs(),
      grossSalary: gross,
      filingStatus: "married",
    });
    expect(married.taxes.totalIncomeTax).toBeLessThan(single.taxes.totalIncomeTax);
  });

  it("Zug multiplier yields lower tax than Geneva", () => {
    const base = { ...CHCalculator.getDefaultInputs(), grossSalary: 200_000 };
    const zug = calculateCH({ ...base, canton: "ZG" });
    const geneva = calculateCH({ ...base, canton: "GE" });
    expect(zug.taxes.totalIncomeTax).toBeLessThan(geneva.taxes.totalIncomeTax);
  });

  it("caps AHV base at annual ceiling", () => {
    const high = calculateCH({
      ...CHCalculator.getDefaultInputs(),
      grossSalary: 300_000,
    });
    if (high.breakdown.type !== "CH") throw new Error("expected CH breakdown");
    expect(high.breakdown.social.cappedSalary).toBe(148_200);
    expect(high.taxes.ahvIvEo).toBeCloseTo(148_200 * 0.053, 0);
  });

  it("scales monotonically for higher gross", () => {
    const low = CHCalculator.calculate({
      ...CHCalculator.getDefaultInputs(),
      grossSalary: 60_000,
    });
    const high = CHCalculator.calculate({
      ...CHCalculator.getDefaultInputs(),
      grossSalary: 240_000,
    });
    expect(high.totalTax).toBeGreaterThan(low.totalTax);
  });
});
