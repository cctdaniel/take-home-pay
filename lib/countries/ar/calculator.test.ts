import { describe, expect, it } from "vitest";
import {
  AR_GANANCIAS_H1_2026,
  AR_GANANCIAS_H2_2026,
  calculateArGananciasTax,
  getDefaultArGananciasSemester,
  resolveArGananciasSemester,
} from "./constants/tax-year-2026";
import { calculateAR, ARCalculator } from "./calculator";

describe("AR calculator smoke", () => {
  it("returns net salary below gross for default inputs", () => {
    const result = ARCalculator.calculate(ARCalculator.getDefaultInputs());
    expect(result.country).toBe("AR");
    expect(result.netSalary).toBeGreaterThan(0);
    expect(result.netSalary).toBeLessThan(result.grossSalary);
    if (result.breakdown.type === "AR") {
      expect(result.breakdown.gananciasSemester).toBe("h1");
    }
  });

  it("family deductions reduce taxable income", () => {
    const base = {
      ...ARCalculator.getDefaultInputs(),
      grossSalary: 35_000_000,
      gananciasSemester: "h1" as const,
    };
    const single = calculateAR({ ...base, hasSpouse: false, children: 0 });
    const family = calculateAR({ ...base, hasSpouse: true, children: 2 });
    expect(family.taxableIncome).toBeLessThan(single.taxableIncome);
  });

  it("withholds 17% social on gross", () => {
    const gross = 10_000_000;
    const result = calculateAR({
      ...ARCalculator.getDefaultInputs(),
      grossSalary: gross,
    });
    const social =
      result.taxes.jubilacion + result.taxes.obraSocial + result.taxes.pami;
    expect(social).toBeCloseTo(gross * 0.17, 0);
  });

  it("zero income tax when deductions exceed gross", () => {
    const result = calculateAR({
      ...ARCalculator.getDefaultInputs(),
      grossSalary: 2_000_000,
    });
    expect(result.taxes.incomeTax).toBe(0);
  });

  it("applies AFIP Art. 94 scale (ene–jun 2026)", () => {
    const { totalTax } = calculateArGananciasTax(
      3_000_000,
      AR_GANANCIAS_H1_2026.art94Slices,
    );
    expect(totalTax).toBeCloseTo(189_998.79, 0);
  });

  it("scales monotonically for higher gross", () => {
    const low = ARCalculator.calculate({
      ...ARCalculator.getDefaultInputs(),
      grossSalary: 8_000_000,
    });
    const high = ARCalculator.calculate({
      ...ARCalculator.getDefaultInputs(),
      grossSalary: 24_000_000,
    });
    expect(high.totalTax).toBeGreaterThan(low.totalTax);
  });

  it("defaults to H1 before July and when H2 2026 is unpublished", () => {
    expect(getDefaultArGananciasSemester(new Date("2026-05-15"))).toBe("h1");
    expect(getDefaultArGananciasSemester(new Date("2026-09-01"))).toBe("h1");
    expect(AR_GANANCIAS_H2_2026.available).toBe(false);
    expect(resolveArGananciasSemester("h2")).toBe("h1");
  });
});
