import { describe, expect, it } from "vitest";
import { calculateIL, ILCalculator } from "./calculator";

describe("IL calculator smoke", () => {
  it("returns net salary below gross for default inputs", () => {
    const result = ILCalculator.calculate(ILCalculator.getDefaultInputs());
    expect(result.country).toBe("IL");
    expect(result.netSalary).toBeGreaterThan(0);
    expect(result.netSalary).toBeLessThan(result.grossSalary);
  });

  it("credit points reduce income tax", () => {
    const base = { ...ILCalculator.getDefaultInputs(), grossSalary: 300_000 };
    const none = calculateIL(base);
    const withKids = calculateIL({
      ...base,
      childrenUnder6: 2,
      isMarried: true,
    });
    expect(withKids.taxes.incomeTax).toBeLessThan(none.taxes.incomeTax);
  });

  it("caps bituach leumi base", () => {
    const result = calculateIL({
      ...ILCalculator.getDefaultInputs(),
      grossSalary: 1_000_000,
    });
    if (result.breakdown.type !== "IL") throw new Error("expected IL breakdown");
    expect(result.breakdown.social.bituachLeumiBase).toBeLessThan(1_000_000);
  });

  it("includes mandatory pension withholding", () => {
    const result = ILCalculator.calculate(ILCalculator.getDefaultInputs());
    expect(result.taxes.pension).toBeGreaterThan(0);
  });

  it("scales monotonically for higher gross", () => {
    const low = ILCalculator.calculate({
      ...ILCalculator.getDefaultInputs(),
      grossSalary: 120_000,
    });
    const high = ILCalculator.calculate({
      ...ILCalculator.getDefaultInputs(),
      grossSalary: 480_000,
    });
    expect(high.totalTax).toBeGreaterThan(low.totalTax);
  });
});
