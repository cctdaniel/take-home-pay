// https://permisdeantreprenor.ro/calculator-salariu-net-2026/

import { describe, expect, it } from "vitest";
import { RO_SOCIAL_CAP_ANNUAL_2026 } from "./constants/tax-year-2026";
import { ROCalculator } from "./calculator";

describe("RO calculator", () => {
  it("matches capped CAS/CASS/PIT at RON 120,000 annual", () => {
    const result = ROCalculator.calculate({
      ...ROCalculator.getDefaultInputs(),
      grossSalary: 120_000,
    });
    expect(result.taxes.cas).toBeCloseTo(RO_SOCIAL_CAP_ANNUAL_2026 * 0.25, 0);
    expect(result.taxes.cass).toBeCloseTo(RO_SOCIAL_CAP_ANNUAL_2026 * 0.1, 0);
    expect(result.netSalary).toBeCloseTo(92_450.4, 0);
  });

  it("returns net below gross for default inputs", () => {
    const result = ROCalculator.calculate(ROCalculator.getDefaultInputs());
    expect(result.netSalary).toBeLessThan(result.grossSalary);
  });
});
