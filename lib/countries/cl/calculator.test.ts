import { describe, expect, it } from "vitest";
import { CLCalculator } from "./calculator";
import type { CLBreakdown, CLCalculatorInputs } from "./types";

function inputs(
  grossSalary: number,
  overrides: Partial<CLCalculatorInputs> = {},
): CLCalculatorInputs {
  return {
    country: "CL",
    grossSalary,
    payFrequency: "annual",
    contractType: "indefinite",
    apvTaxRegime: "regimeB",
    contributions: {
      retirementContribution: 0,
      medicalExpenses: 0,
      qualifyingExpenses: 0,
    },
    ...overrides,
    contributions: {
      retirementContribution: 0,
      medicalExpenses: 0,
      qualifyingExpenses: 0,
      ...overrides.contributions,
    },
  };
}

describe("Chile calculator", () => {
  it("calculates second-category tax using the June 2026 SII table and statutory payroll caps", () => {
    const result = CLCalculator.calculate(inputs(48_000_000));
    const breakdown = result.breakdown as CLBreakdown;

    expect(result.taxableIncome).toBe(40_343_489.4);
    expect(result.taxes.incomeTax).toBe(1_734_433.87);
    expect(result.taxes.socialContributions).toBe(7_656_510.6);
    expect(result.totalTax).toBe(9_390_944.47);
    expect(result.netSalary).toBe(38_609_055.53);
    expect(breakdown.mandatoryContributions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "AFP pension contribution",
          amount: 4_334_418,
          rate: 0.1,
          cap: 43_344_180,
        }),
        expect.objectContaining({
          name: "Health contribution",
          amount: 3_034_092.6,
          rate: 0.07,
          cap: 43_344_180,
        }),
        expect.objectContaining({
          name: "Unemployment insurance contribution",
          amount: 288_000,
          rate: 0.006,
        }),
      ]),
    );
    expect(breakdown.sourceUrls).toEqual(
      expect.arrayContaining([
        "https://www.sii.cl/valores_y_fechas/impuesto_2da_categoria/impuesto2026.htm",
        "https://www.spensiones.cl/portal/institucional/594/w3-article-12683.html",
      ]),
    );
  });

  it("caps APV regime B and post-tax additional Isapre premiums", () => {
    const result = CLCalculator.calculate(
      inputs(120_000_000, {
        apvTaxRegime: "regimeB",
        contributions: {
          retirementContribution: 999_999_999,
          medicalExpenses: 5_000_000,
        },
      }),
    );
    const breakdown = result.breakdown as CLBreakdown;
    const limits = CLCalculator.getContributionLimits(inputs(120_000_000));

    expect(limits.retirementContribution?.limit).toBe(23_836_776);
    expect(limits.medicalExpenses?.limit).toBe(Infinity);
    expect(breakdown.apvTaxRegime).toBe("regimeB");
    expect(breakdown.apvFiscalBonus).toBe(0);
    expect(breakdown.voluntaryContributions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: "retirementContribution",
          amount: 23_836_776,
          limit: 23_836_776,
          taxTreatment: "deduction",
        }),
        expect.objectContaining({
          key: "medicalExpenses",
          amount: 5_000_000,
          limit: Infinity,
          taxTreatment: "none",
        }),
      ]),
    );
    expect(result.taxableIncome).toBe(88_404_037.86);
    expect(result.taxes.incomeTax).toBe(11_601_145.91);
    expect(result.totalDeductions).toBe(48_197_108.05);
    expect(result.netSalary).toBe(71_802_891.95);
  });

  it("uses APV regime A as a cash deduction with a capped fiscal bonus and no unemployment employee charge for fixed-term contracts", () => {
    const result = CLCalculator.calculate(
      inputs(48_000_000, {
        contractType: "fixedTermOrWork",
        apvTaxRegime: "regimeA",
        contributions: {
          retirementContribution: 3_000_000,
          medicalExpenses: 1_000_000,
        },
      }),
    );
    const breakdown = result.breakdown as CLBreakdown;

    expect(breakdown.apvTaxRegime).toBe("regimeA");
    expect(breakdown.apvFiscalBonus).toBe(417_252);
    expect(breakdown.apvFiscalBonusCap).toBe(417_252);
    expect(
      breakdown.mandatoryContributions.some((row) =>
        row.name.includes("Unemployment"),
      ),
    ).toBe(false);
    expect(breakdown.voluntaryContributions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: "retirementContribution",
          amount: 3_000_000,
          taxTreatment: "none",
        }),
      ]),
    );
    expect(result.taxableIncome).toBe(40_631_489.4);
    expect(result.taxes.incomeTax).toBe(1_757_473.87);
    expect(result.totalDeductions).toBe(13_125_984.47);
    expect(result.netSalary).toBe(34_874_015.53);
  });
});
