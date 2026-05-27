import { describe, expect, it } from "vitest";
import { AECalculator } from "./calculator";
import type { AEBreakdown, AECalculatorInputs } from "./types";

function inputs(overrides: Partial<AECalculatorInputs> = {}): AECalculatorInputs {
  const defaults = AECalculator.getDefaultInputs() as AECalculatorInputs;

  return {
    ...defaults,
    ...overrides,
    contributions: {},
  };
}

describe("UAE calculator", () => {
  it("models foreign / expat salary with no income tax or pension deduction", () => {
    const result = AECalculator.calculate(inputs());
    const breakdown = result.breakdown as AEBreakdown;

    expect(result.taxes.incomeTax).toBe(0);
    expect(result.taxes.pensionEmployee).toBe(0);
    expect(result.taxes.unemploymentInsurance).toBe(120);
    expect(result.netSalary).toBe(359_880);
    expect(breakdown.unemploymentInsurance.basicSalaryMonthly).toBe(30_000);
  });

  it("derives the ILOE premium category from monthly basic salary unless excluded", () => {
    const result = AECalculator.calculate(
      inputs({
        iloeBasicSalaryMonthly: 15_000,
        unemploymentInsuranceCategory: "category2",
      }),
    );

    expect(result.taxes.unemploymentInsurance).toBe(60);
    expect((result.breakdown as AEBreakdown).unemploymentInsurance.category).toBe(
      "category1",
    );
  });

  it("uses selected GPSSA contribution salary for new-law UAE nationals", () => {
    const result = AECalculator.calculate(
      inputs({
        grossSalary: 1_200_000,
        employeeCategory: "uae_national_new_private",
        pensionContributionSalaryMonthly: 60_000,
      }),
    );
    const pension = (result.breakdown as AEBreakdown).pension;

    expect(pension.contributionSalaryMonthly).toBe(60_000);
    expect(result.taxes.pensionEmployee).toBe(79_200);
    expect(pension.employer).toBe(108_000);
    expect(pension.governmentSupport).toBe(0);
  });

  it("applies the UAE national new-law private-sector floor, cap, and government support threshold", () => {
    const lowContributionSalary = AECalculator.calculate(
      inputs({
        grossSalary: 180_000,
        employeeCategory: "uae_national_new_private",
        pensionContributionSalaryMonthly: 1_000,
      }),
    );
    const highContributionSalary = AECalculator.calculate(
      inputs({
        grossSalary: 1_200_000,
        employeeCategory: "uae_national_new_private",
        pensionContributionSalaryMonthly: 100_000,
      }),
    );
    const lowPension = (lowContributionSalary.breakdown as AEBreakdown).pension;
    const highPension = (highContributionSalary.breakdown as AEBreakdown)
      .pension;

    expect(lowPension.contributionSalaryMonthly).toBe(3_000);
    expect(lowContributionSalary.taxes.pensionEmployee).toBe(3_960);
    expect(lowPension.governmentSupport).toBe(900);
    expect(highPension.contributionSalaryMonthly).toBe(70_000);
    expect(highContributionSalary.taxes.pensionEmployee).toBe(92_400);
  });
});
