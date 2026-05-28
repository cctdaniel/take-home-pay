import { describe, expect, it } from "vitest";
import { HUCalculator } from "./calculator";

describe("HU calculator smoke", () => {
  it("returns net salary below gross for default inputs", () => {
    const inputs = HUCalculator.getDefaultInputs();
    const result = HUCalculator.calculate(inputs);
    expect(result.country).toBe("HU");
    expect(result.netSalary).toBeGreaterThan(0);
    expect(result.netSalary).toBeLessThan(result.grossSalary);
  });

  it("waives PIT but keeps social security for under-25 exemption", () => {
    const result = HUCalculator.calculate({
      ...HUCalculator.getDefaultInputs(),
      under25FullExemption: true,
    });
    expect(result.taxes.type).toBe("HU");
    if (result.taxes.type === "HU") {
      expect(result.taxes.incomeTax).toBe(0);
      expect(result.taxes.socialSecurity).toBe(1_850_000);
    }
    expect(result.netSalary).toBe(8_150_000);
  });
});
