import { describe, expect, it } from "vitest";
import { CZCalculator } from "./calculator";
import { CZECH_SOURCE_URLS } from "./constants/tax-parameters-2026";
import type { CZBreakdown, CZCalculatorInputs } from "./types";

function inputs(
  grossSalary: number,
  overrides: Partial<CZCalculatorInputs> = {},
): CZCalculatorInputs {
  return {
    country: "CZ",
    grossSalary,
    payFrequency: "annual",
    residencyType: "resident",
    benefits: {
      otherTaxableNonCashBenefits: 0,
      companyCarEntryPrice: 0,
      companyCarEmissionType: "standard",
      companyCarMonths: 0,
    },
    contributions: {
      retirementSavingsContribution: 0,
      charitableDonations: 0,
    },
    taxReliefs: {
      numberOfChildren: 0,
      hasSpouseCredit: false,
      hasSpouseZtpP: false,
      disabilityCreditType: "none",
      hasZtpPCard: false,
    },
    ...overrides,
    benefits: {
      otherTaxableNonCashBenefits: 0,
      companyCarEntryPrice: 0,
      companyCarEmissionType: "standard",
      companyCarMonths: 0,
      ...overrides.benefits,
    },
    contributions: {
      retirementSavingsContribution: 0,
      charitableDonations: 0,
      ...overrides.contributions,
    },
    taxReliefs: {
      numberOfChildren: 0,
      hasSpouseCredit: false,
      hasSpouseZtpP: false,
      disabilityCreditType: "none",
      hasZtpPCard: false,
      ...overrides.taxReliefs,
    },
  };
}

describe("Czechia calculator", () => {
  it("calculates 2026 employment tax, basic taxpayer credit, social security, and health insurance", () => {
    const result = CZCalculator.calculate(inputs(720_000));
    const breakdown = result.breakdown as CZBreakdown;

    expect(CZECH_SOURCE_URLS).toEqual(
      expect.arrayContaining([
        "https://financnisprava.gov.cz/cs/dane/dane/dan-z-prijmu/zamestnanci-zamestnavatele/obecne-informace",
        "https://www.cssz.cz/-/prehled-nejdulezitejsich-udaju-pro-socialni-zabezpeceni-v-roce-2026",
        "https://www.vzp.cz/platci/informace/zamestnavatel/splatnost-a-dalsi-zasady-pro-platbu-pojistneho/jakym-zpusobem-se-plati-pojistne-na-zdravotni-pojisteni",
      ]),
    );
    expect(result.taxableIncome).toBe(720_000);
    expect(breakdown.incomeTax.grossIncomeTax).toBe(108_000);
    expect(breakdown.taxCredits.basicTaxpayerCredit).toBe(30_840);
    expect(result.taxes.incomeTax).toBe(77_160);
    expect(result.taxes.socialSecurity).toBe(51_120);
    expect(result.taxes.healthInsurance).toBe(32_400);
    expect(result.totalTax).toBe(160_680);
    expect(result.netSalary).toBe(559_320);
  });

  it("caps resident retirement and gift deductions and applies child bonus with taxable benefits", () => {
    const residentInputs = inputs(720_000, {
      benefits: {
        otherTaxableNonCashBenefits: 50_000,
        companyCarEntryPrice: 600_000,
        companyCarEmissionType: "zeroEmission",
        companyCarMonths: 12,
      },
      contributions: {
        retirementSavingsContribution: 999_999,
        charitableDonations: 999_999,
      },
      taxReliefs: {
        numberOfChildren: 3,
        hasSpouseCredit: true,
        hasSpouseZtpP: true,
        disabilityCreditType: "extended",
        hasZtpPCard: true,
      },
    });
    const result = CZCalculator.calculate(residentInputs);
    const breakdown = result.breakdown as CZBreakdown;
    const limits = CZCalculator.getContributionLimits(residentInputs);

    expect(limits.retirementSavingsContribution?.limit).toBe(48_000);
    expect(limits.charitableDonations?.limit).toBe(236_400);
    expect(breakdown.taxableBenefits).toEqual(
      expect.objectContaining({
        otherTaxableNonCashBenefits: 50_000,
        companyCarBenefit: 18_000,
        total: 68_000,
      }),
    );
    expect(breakdown.deductions).toEqual(
      expect.objectContaining({
        retirementSavings: 48_000,
        charitableDonations: 236_400,
        requestedCharitableDonations: 999_999,
        total: 284_400,
      }),
    );
    expect(breakdown.taxCredits).toEqual(
      expect.objectContaining({
        spouseCredit: 49_680,
        disabilityCredit: 5_040,
        ztpPCardCredit: 16_140,
        childCredit: 65_364,
        childTaxBonus: 65_364,
      }),
    );
    expect(result.taxableIncome).toBe(503_600);
    expect(result.taxes.incomeTax).toBe(0);
    expect(result.totalDeductions).toBe(310_444);
    expect(result.netSalary).toBe(409_556);
  });

  it("keeps non-resident personal credits limited to the basic taxpayer credit", () => {
    const result = CZCalculator.calculate(
      inputs(720_000, {
        residencyType: "non_resident",
        contributions: {
          retirementSavingsContribution: 999_999,
          charitableDonations: 999_999,
        },
        taxReliefs: {
          numberOfChildren: 3,
          hasSpouseCredit: true,
          hasSpouseZtpP: true,
          disabilityCreditType: "extended",
          hasZtpPCard: true,
        },
      }),
    );
    const breakdown = result.breakdown as CZBreakdown;
    const limits = CZCalculator.getContributionLimits(
      inputs(720_000, { residencyType: "non_resident" }),
    );

    expect(limits.retirementSavingsContribution?.limit).toBe(0);
    expect(limits.charitableDonations?.limit).toBe(0);
    expect(breakdown.isResident).toBe(false);
    expect(breakdown.deductions.total).toBe(0);
    expect(breakdown.taxCredits).toEqual(
      expect.objectContaining({
        basicTaxpayerCredit: 30_840,
        spouseCredit: 0,
        disabilityCredit: 0,
        ztpPCardCredit: 0,
        childCredit: 0,
        childTaxBonus: 0,
      }),
    );
    expect(result.taxableIncome).toBe(720_000);
    expect(result.totalTax).toBe(160_680);
    expect(result.netSalary).toBe(559_320);
  });
});
