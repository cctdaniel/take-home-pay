import { describe, expect, it } from "vitest";
import { calculateZA, ZACalculator } from "./calculator";
import { ZA_REBATES_2026, ZA_UIF_2026 } from "./constants/tax-year-2026";

describe("ZA calculator smoke", () => {
  it("returns net salary below gross for default inputs", () => {
    const result = ZACalculator.calculate(ZACalculator.getDefaultInputs());
    expect(result.country).toBe("ZA");
    expect(result.netSalary).toBeGreaterThan(0);
    expect(result.netSalary).toBeLessThan(result.grossSalary);
  });

  it("applies primary rebate", () => {
    const result = calculateZA({
      ...ZACalculator.getDefaultInputs(),
      grossSalary: 200_000,
    });
    if (result.breakdown.type !== "ZA") throw new Error("expected ZA breakdown");
    expect(result.breakdown.primaryRebate).toBe(ZA_REBATES_2026.primary);
  });

  it("caps UIF contribution", () => {
    const result = calculateZA({
      ...ZACalculator.getDefaultInputs(),
      grossSalary: 3_000_000,
    });
    expect(result.taxes.uif).toBe(ZA_UIF_2026.maximumAnnualContribution);
  });

  it("retirement annuity reduces taxable income", () => {
    const base = { ...ZACalculator.getDefaultInputs(), grossSalary: 800_000 };
    const none = calculateZA(base);
    const withRa = calculateZA({
      ...base,
      contributions: { retirementAnnuity: 100_000 },
    });
    expect(withRa.taxes.incomeTax).toBeLessThanOrEqual(none.taxes.incomeTax);
    expect(withRa.netSalary).toBeGreaterThanOrEqual(none.netSalary - 100_000);
  });

  it("medical dependents reduce PAYE", () => {
    const base = { ...ZACalculator.getDefaultInputs(), grossSalary: 500_000 };
    const none = calculateZA({ ...base, medicalDependents: 0 });
    const withDeps = calculateZA({ ...base, medicalDependents: 2 });
    expect(withDeps.taxes.incomeTax).toBeLessThan(none.taxes.incomeTax);
  });
});
