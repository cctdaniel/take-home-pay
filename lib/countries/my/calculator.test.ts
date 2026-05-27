import { describe, expect, it } from "vitest";
import { MYCalculator } from "./calculator";
import type { MYBreakdown, MYCalculatorInputs } from "../types";

function inputs(
  grossSalary: number,
  overrides: Partial<MYCalculatorInputs> = {},
): MYCalculatorInputs {
  return {
    country: "MY",
    grossSalary,
    payFrequency: "annual",
    residencyType: "resident",
    age: 30,
    epfCategory: "citizen",
    contributions: {
      voluntaryEpfContribution: 0,
      prsContribution: 0,
    },
    taxReliefs: {
      hasSpouseRelief: false,
      hasDisabledSpouseRelief: false,
      numberOfChildrenUnder18: 0,
      numberOfChildren18PlusEducation: 0,
      numberOfChildrenTertiary: 0,
      numberOfDisabledChildren: 0,
      numberOfDisabledChildrenTertiary: 0,
      isDisabled: false,
      parentMedicalRelief: 0,
      supportingEquipmentRelief: 0,
      selfEducationFees: 0,
      lifestyleRelief: 0,
      sportsLifestyleRelief: 0,
      medicalRelief: 0,
      breastfeedingEquipmentRelief: 0,
      childcareFees: 0,
      sspnNetSavings: 0,
      educationMedicalInsurance: 0,
      lifeInsuranceRelief: 0,
      evChargingRelief: 0,
      firstHomeLoanInterest: 0,
      firstHomePriceBand: "none",
      approvedDonations: 0,
      zakatFitrah: 0,
      departureLevyRebate: 0,
    },
    ...overrides,
    contributions: {
      voluntaryEpfContribution: 0,
      prsContribution: 0,
      ...overrides.contributions,
    },
    taxReliefs: {
      hasSpouseRelief: false,
      hasDisabledSpouseRelief: false,
      numberOfChildrenUnder18: 0,
      numberOfChildren18PlusEducation: 0,
      numberOfChildrenTertiary: 0,
      numberOfDisabledChildren: 0,
      numberOfDisabledChildrenTertiary: 0,
      isDisabled: false,
      parentMedicalRelief: 0,
      supportingEquipmentRelief: 0,
      selfEducationFees: 0,
      lifestyleRelief: 0,
      sportsLifestyleRelief: 0,
      medicalRelief: 0,
      breastfeedingEquipmentRelief: 0,
      childcareFees: 0,
      sspnNetSavings: 0,
      educationMedicalInsurance: 0,
      lifeInsuranceRelief: 0,
      evChargingRelief: 0,
      firstHomeLoanInterest: 0,
      firstHomePriceBand: "none",
      approvedDonations: 0,
      zakatFitrah: 0,
      departureLevyRebate: 0,
      ...overrides.taxReliefs,
    },
  };
}

describe("Malaysia calculator", () => {
  it("applies resident EPF, SOCSO, EIS, individual relief, and progressive resident tax", () => {
    const result = MYCalculator.calculate(inputs(96_000));
    const breakdown = result.breakdown as MYBreakdown;

    expect(breakdown.statutoryContributions.epfEmployee).toBe(10_560);
    expect(breakdown.statutoryContributions.socsoEmployee).toBe(360);
    expect(breakdown.statutoryContributions.eisEmployee).toBe(144);
    expect(breakdown.taxReliefs.total).toBe(13_350);
    expect(result.taxableIncome).toBe(82_650);
    expect(result.taxes.incomeTax).toBe(6_104);
    expect(result.totalTax).toBe(17_168);
    expect(result.netSalary).toBe(78_832);
  });

  it("adds voluntary EPF and PRS cash contributions while applying relief bucket limits", () => {
    const limits = MYCalculator.getContributionLimits();
    const result = MYCalculator.calculate(
      inputs(96_000, {
        contributions: {
          voluntaryEpfContribution: 1_000,
          prsContribution: 3_000,
        },
      }),
    );
    const breakdown = result.breakdown as MYBreakdown;

    expect(limits.voluntaryEpfContribution?.limit).toBe(100_000);
    expect(limits.prsContribution?.limit).toBe(3_000);
    expect(breakdown.taxReliefs.epf).toBe(4_000);
    expect(breakdown.taxReliefs.lifeInsurance).toBe(1_000);
    expect(breakdown.taxReliefs.prs).toBe(3_000);
    expect(result.taxableIncome).toBe(78_650);
    expect(result.taxes.incomeTax).toBe(5_344);
    expect(result.totalDeductions).toBe(20_408);
    expect(result.netSalary).toBe(75_592);
  });

  it("caps broad resident reliefs, approved donations, and rebates before tax", () => {
    const result = MYCalculator.calculate(
      inputs(96_000, {
        taxReliefs: {
          hasSpouseRelief: true,
          numberOfChildrenUnder18: 2,
          numberOfChildrenTertiary: 1,
          numberOfDisabledChildren: 1,
          numberOfDisabledChildrenTertiary: 1,
          isDisabled: true,
          parentMedicalRelief: 10_000,
          supportingEquipmentRelief: 8_000,
          selfEducationFees: 9_000,
          lifestyleRelief: 3_000,
          sportsLifestyleRelief: 2_000,
          medicalRelief: 15_000,
          breastfeedingEquipmentRelief: 2_000,
          childcareFees: 5_000,
          sspnNetSavings: 10_000,
          educationMedicalInsurance: 5_000,
          evChargingRelief: 3_000,
          firstHomeLoanInterest: 10_000,
          firstHomePriceBand: "up_to_500k",
          approvedDonations: 20_000,
          zakatFitrah: 5_000,
          departureLevyRebate: 500,
        },
      }),
    );
    const breakdown = result.breakdown as MYBreakdown;

    expect(breakdown.taxReliefs.parentMedical).toBe(8_000);
    expect(breakdown.taxReliefs.selfEducation).toBe(7_000);
    expect(breakdown.taxReliefs.approvedDonations).toBe(9_600);
    expect(breakdown.taxReliefs.total).toBe(121_950);
    expect(result.taxableIncome).toBe(0);
    expect(result.taxes.incomeTax).toBe(0);
    expect(result.totalTax).toBe(11_064);
    expect(result.netSalary).toBe(84_936);
  });

  it("uses non-resident employment tax while keeping selected employee payroll contributions", () => {
    const result = MYCalculator.calculate(
      inputs(96_000, {
        residencyType: "non_resident",
        epfCategory: "foreigner_post_1998",
      }),
    );
    const breakdown = result.breakdown as MYBreakdown;

    expect(breakdown.taxReliefs.total).toBe(0);
    expect(result.taxableIncome).toBe(96_000);
    expect(result.taxes.incomeTax).toBe(28_800);
    expect(result.taxes.epfEmployee).toBe(1_920);
    expect(result.totalTax).toBe(31_224);
    expect(result.netSalary).toBe(64_776);
  });
});
