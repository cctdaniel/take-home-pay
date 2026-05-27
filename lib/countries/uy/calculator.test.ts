import { describe, expect, it } from "vitest";
import { UYCalculator } from "./calculator";
import type { UYBreakdown, UYCalculatorInputs } from "./types";

function inputs(
  grossSalary: number,
  overrides: Partial<UYCalculatorInputs> = {},
): UYCalculatorInputs {
  return {
    country: "UY",
    grossSalary,
    payFrequency: "annual",
    numberOfChildren: 0,
    numberOfDisabledChildren: 0,
    housingCreditType: "none",
    aguinaldoMode: "includedInGross",
    contributions: {
      retirementContribution: 0,
      qualifyingExpenses: 0,
      housingExpenses: 0,
    },
    ...overrides,
    contributions: {
      retirementContribution: 0,
      qualifyingExpenses: 0,
      housingExpenses: 0,
      ...overrides.contributions,
    },
  };
}

describe("Uruguay calculator", () => {
  it("calculates 2026 IRPF, social contributions, and included-in-gross aguinaldo treatment", () => {
    const result = UYCalculator.calculate(inputs(2_400_000));
    const breakdown = result.breakdown as UYBreakdown;

    expect(result.grossSalary).toBe(2_400_000);
    expect(result.taxes.incomeTax).toBe(328_329.6);
    expect(result.taxes.socialContributions).toBe(470_400);
    expect(result.taxes.aguinaldoIncomeTax).toBe(44_307.69);
    expect(result.totalTax).toBe(798_729.6);
    expect(result.netSalary).toBe(1_601_270.4);
    expect(breakdown).toEqual(
      expect.objectContaining({
        aguinaldoMode: "includedInGross",
        regularIrpfIncome: 2_215_384.62,
        aguinaldo: 184_615.38,
        socialContributionBase: 2_400_000,
        aguinaldoMarginalRate: 0.24,
      }),
    );
    expect(breakdown.sourceUrls).toEqual(
      expect.arrayContaining([
        "https://www.gub.uy/direccion-general-impositiva/comunicacion/publicaciones/base-prestaciones-contribuciones-bpc",
        "https://www.bps.gub.uy/23860/2026---comunicado-5---valores-escalas-irpf-2026.html",
      ]),
    );
  });

  it("applies voluntary AFAP, child deduction, and rent credit using the aguinaldo-inclusive contribution base", () => {
    const result = UYCalculator.calculate(
      inputs(2_400_000, {
        numberOfChildren: 2,
        numberOfDisabledChildren: 1,
        housingCreditType: "rent",
        contributions: {
          retirementContribution: 999_999,
          qualifyingExpenses: 0,
          housingExpenses: 300_000,
        },
      }),
    );
    const breakdown = result.breakdown as UYBreakdown;
    const limits = UYCalculator.getContributionLimits(
      inputs(2_400_000, { housingCreditType: "rent" }),
    );

    expect(limits.retirementContribution?.limit).toBe(360_000);
    expect(limits.housingExpenses?.limit).toBe(2_400_000);
    expect(breakdown.voluntaryContributions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: "retirementContribution",
          amount: 360_000,
          limit: 360_000,
        }),
        expect.objectContaining({
          key: "housingExpenses",
          amount: 300_000,
          limit: 2_400_000,
          cashFlowTreatment: "taxOnly",
        }),
      ]),
    );
    expect(breakdown.taxCredits).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "IRPF deduction credit for social and pension contributions",
          amount: 110_361.6,
        }),
        expect.objectContaining({
          name: "IRPF rent credit",
          amount: 24_000,
        }),
      ]),
    );
    expect(result.taxes.incomeTax).toBe(231_600);
    expect(result.totalDeductions).toBe(1_062_000);
    expect(result.netSalary).toBe(1_338_000);
  });

  it("caps eligible mortgage payments at 36 BPC when aguinaldo is additional to entered salary", () => {
    const result = UYCalculator.calculate(
      inputs(2_400_000, {
        numberOfChildren: 2,
        numberOfDisabledChildren: 1,
        housingCreditType: "mortgage",
        aguinaldoMode: "additionalToGross",
        contributions: {
          retirementContribution: 999_999,
          qualifyingExpenses: 0,
          housingExpenses: 999_999,
        },
      }),
    );
    const breakdown = result.breakdown as UYBreakdown;

    expect(result.grossSalary).toBe(2_600_000);
    expect(breakdown.voluntaryContributions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ key: "retirementContribution", amount: 390_000 }),
        expect.objectContaining({ key: "housingExpenses", amount: 247_104 }),
      ]),
    );
    expect(result.taxes.aguinaldoIncomeTax).toBe(48_000);
    expect(result.totalTax).toBe(787_895.68);
    expect(result.totalDeductions).toBe(1_177_895.68);
    expect(result.netSalary).toBe(1_422_104.32);
  });
});
