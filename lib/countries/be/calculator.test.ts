import { describe, expect, it } from "vitest";
import { calculateBE } from "./calculator";
import {
  BE_EXPAT_REGIME_2026,
  BE_TAX_CONFIG,
} from "./constants/tax-year-2026";
import type { BECalculatorInputs } from "./types";

function inputs(grossSalary: number, pensionSavings = 0): BECalculatorInputs {
  return {
    country: "BE",
    grossSalary,
    payFrequency: "monthly",
    numberOfDependentChildren: 0,
    numberOfChildrenUnderThreeNoChildcare: 0,
    childcareDays: 0,
    isSingleParentWithChildren: false,
    expatRegimeType: "none",
    expatRecurringAllowance: 0,
    contributions: {
      pensionSavings,
      childcareExpenses: 0,
      charitableDonations: 0,
    },
  };
}

describe("Belgium calculator", () => {
  it("calculates a positive net salary below gross for the default salary", () => {
    const result = calculateBE(inputs(BE_TAX_CONFIG.defaultSalary));
    expect(result.country).toBe("BE");
    expect(result.currency).toBe("EUR");
    expect(result.netSalary).toBeGreaterThan(0);
    expect(result.netSalary).toBeLessThan(result.grossSalary);
    expect(result.taxes.employeeSocialContribution).toBeGreaterThan(0);
    expect(result.breakdown.type).toBe("BE");
    expect(result.breakdown.assumptions.length).toBeGreaterThan(0);
    expect(result.breakdown.sourceUrls.length).toBeGreaterThan(0);
  });

  it("bases the municipal surcharge on federal income tax, not taxable income", () => {
    const result = calculateBE(inputs(50_000));
    expect(result.taxes.additionalIncomeTax).toBe(
      Math.round(
        result.taxes.incomeTax *
          BE_TAX_CONFIG.additionalFlatIncomeTaxRate *
          100,
      ) / 100,
    );
    expect(result.taxes.additionalIncomeTax).toBeLessThan(
      result.taxableIncome * BE_TAX_CONFIG.additionalFlatIncomeTaxRate,
    );
  });

  it("applies Belgian pension savings as a tax credit and cash deduction", () => {
    const base = calculateBE(inputs(50_000));
    const withPension = calculateBE(inputs(50_000, 1_000));
    expect(withPension.breakdown.pensionSavingsTaxCredit).toBeGreaterThan(0);
    expect(withPension.taxes.incomeTax).toBeLessThan(base.taxes.incomeTax);
    expect(withPension.totalDeductions).toBeGreaterThan(base.totalDeductions);
  });

  it("applies capped childcare and qualifying gift tax reductions", () => {
    const base = calculateBE(inputs(50_000));
    const withReductions = calculateBE({
      ...inputs(50_000),
      numberOfDependentChildren: 1,
      childcareDays: 100,
      contributions: {
        pensionSavings: 0,
        childcareExpenses: 3_000,
        charitableDonations: 1_000,
      },
    });

    expect(withReductions.breakdown.childcareExpenses).toBeCloseTo(
      BE_TAX_CONFIG.childcareDailyExpenseLimit * 100,
      2,
    );
    expect(withReductions.breakdown.childcareTaxReduction).toBe(
      Math.round(
        BE_TAX_CONFIG.childcareDailyExpenseLimit *
          100 *
          BE_TAX_CONFIG.childcareTaxReductionRate *
          100,
      ) / 100,
    );
    expect(withReductions.breakdown.charitableDonationTaxReduction).toBe(300);
    expect(withReductions.taxes.incomeTax).toBeLessThan(base.taxes.incomeTax);
  });

  it("caps the special inpatriate allowance separately for tax and social security", () => {
    const result = calculateBE({
      ...inputs(100_000),
      expatRegimeType: "inboundTaxpayer",
      expatRecurringAllowance: 100_000,
    });

    expect(result.breakdown.expatRecurringAllowance).toBe(
      100_000 * BE_EXPAT_REGIME_2026.taxFreeAllowanceRate,
    );
    expect(result.breakdown.expatSocialSecurityExemptAllowance).toBe(
      100_000 * BE_EXPAT_REGIME_2026.socialSecurityExemptRate,
    );
    expect(result.taxes.employeeSocialContribution).toBe(
      Math.round(
        (100_000 +
          100_000 *
            (BE_EXPAT_REGIME_2026.taxFreeAllowanceRate -
              BE_EXPAT_REGIME_2026.socialSecurityExemptRate)) *
          BE_TAX_CONFIG.employeeSocialRate *
          100,
      ) / 100,
    );
  });

  it("requires the salary threshold for inbound taxpayer treatment", () => {
    const result = calculateBE({
      ...inputs(50_000),
      expatRegimeType: "inboundTaxpayer",
      expatRecurringAllowance: 10_000,
    });

    expect(result.breakdown.expatRecurringAllowance).toBe(0);
    expect(result.breakdown.expatTaxpayerMinimumMet).toBe(false);
  });

  it("keeps zero income tax for zero salary", () => {
    const result = calculateBE(inputs(0));
    expect(result.netSalary).toBe(0);
    expect(result.totalTax).toBe(0);
    expect(result.taxableIncome).toBe(0);
  });
});
