// Golden numbers cross-checked against SUNAT UIT and fifth-category brackets.
// Source: https://www.gob.pe/sunat
import { describe, expect, it } from "vitest";
import { PE_WORK_INCOME_DEDUCTION_ANNUAL } from "./constants/tax-year-2026";
import { PECalculator } from "./calculator";

describe("PE calculator", () => {
  it("returns net below gross for default inputs", () => {
    const result = PECalculator.calculate(PECalculator.getDefaultInputs());
    expect(result.country).toBe("PE");
    expect(result.netSalary).toBeGreaterThan(0);
    expect(result.netSalary).toBeLessThan(result.grossSalary);
  });

  it("applies 13% pension and 8% PIT on PEN 60,000 gross", () => {
    const result = PECalculator.calculate({
      ...PECalculator.getDefaultInputs(),
      grossSalary: 60_000,
    });
    if (result.breakdown.type === "PE") {
      expect(result.breakdown.pension.employee).toBe(7_800);
      expect(result.breakdown.workIncomeDeduction).toBe(PE_WORK_INCOME_DEDUCTION_ANNUAL);
      expect(result.breakdown.taxableIncome).toBe(21_500);
      expect(result.breakdown.incomeTax.total).toBe(1_720);
    }
    expect(result.netSalary).toBe(50_480);
  });

  it("applies 14% marginal bracket on PEN 120,000 gross", () => {
    const result = PECalculator.calculate({
      ...PECalculator.getDefaultInputs(),
      grossSalary: 120_000,
    });
    if (result.breakdown.type === "PE") {
      expect(result.breakdown.pension.employee).toBe(15_600);
      expect(result.breakdown.taxableIncome).toBe(81_500);
      expect(result.breakdown.incomeTax.total).toBe(9_760);
    }
    expect(result.netSalary).toBe(94_640);
  });

  it("applies higher brackets on PEN 250,000 gross", () => {
    const result = PECalculator.calculate({
      ...PECalculator.getDefaultInputs(),
      grossSalary: 250_000,
    });
    if (result.breakdown.type === "PE") {
      expect(result.breakdown.pension.employee).toBe(32_500);
      expect(result.breakdown.taxableIncome).toBe(211_500);
      expect(result.breakdown.incomeTax.total).toBe(31_575);
    }
    expect(result.netSalary).toBe(185_925);
  });

  it("returns zero PIT when gross is below 7 UIT deduction", () => {
    const result = PECalculator.calculate({
      ...PECalculator.getDefaultInputs(),
      grossSalary: 30_000,
    });
    if (result.breakdown.type === "PE") {
      expect(result.breakdown.taxableIncome).toBe(0);
      expect(result.breakdown.incomeTax.total).toBe(0);
    }
    expect(result.netSalary).toBe(26_100);
  });

  it("returns zero tax on zero gross", () => {
    const result = PECalculator.calculate({
      ...PECalculator.getDefaultInputs(),
      grossSalary: 0,
    });
    expect(result.netSalary).toBe(0);
    expect(result.totalTax).toBe(0);
  });
});
