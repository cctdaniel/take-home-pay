// ============================================================================
// CYPRUS EMPLOYMENT INCOME TAX, SOCIAL INSURANCE, AND GHS (2026)
// ============================================================================
//
// Official tax sources:
// - Cyprus Tax Department TD59A 2026 employee deduction declaration:
//   https://www.mof.gov.cy/mof/TAX/taxdep.nsf/All/42FCDCE9F7D7487AC2258D7F0025AF9E/$file/TD59A%20_%202026_English.pdf?OpenElement
// - Cyprus Tax Department 2026 tax reform page:
//   https://www.mof.gov.cy/mof/tax/taxdep.nsf/0/57e097d1492aec77c2258d79003d503a?OpenDocument
// - Cyprus government business portal, 2026 individual income-tax bands:
//   https://www.businessincyprus.gov.cy/doing-business-in-cyprus/start-your-business/registering-for-income-tax-and-value-added-tax/
//
// Official Social Insurance sources:
// - Social Insurance Services insured person's guide, contribution rate split:
//   https://www.mlsi.gov.cy/mlsi/sid/sidv2.nsf/All/445196CDBAC862C4C2257C93003824CD/$file/%CE%9F%CE%94%CE%97%CE%93%CE%9F%CE%A3%20%CE%91%CE%A3%CE%A6%CE%91%CE%9B%CE%99%CE%A3%CE%9C%CE%95%CE%9D%CE%9F%CE%A5%20-.pdf
// - Social Insurance Services 2026 maximum insurable earnings notice:
//   https://sisweb.mlsi.gov.cy/anotato2025/
//
// Official GHS source:
// - Health Insurance Organisation financing page:
//   https://www.gesy.org.cy/sites/Sites?d=Desktop&locale=en_US&lookuphost=%2Fen-us%2F&lookuppage=hiofinancing
//
// Assumptions:
// - Models ordinary Cyprus-source salaried employment for a private-sector
//   employee paid over 12 months.
// - Social Insurance and GHS employee contributions are cash deductions from
//   salary and are also deductible for income-tax purposes, subject to the TD59A
//   one-fifth aggregate cap together with approved pension/provident, medical,
//   and life-insurance deductions.
// - The voluntary approved pension/provident input uses a conservative modeled
//   cap of 10% of gross remuneration. Actual approved-fund rules can be
//   employer-plan specific and are excluded.
// - First-employment exemptions, life-insurance capital-sum tests, medical fund
//   plan rules, overseas employment exemptions, non-salary income, Special
//   Defence Contribution, capital gains, stock options, carried interest, and
//   cryptocurrency rules are outside this salary calculator.
// ============================================================================

import type { TaxBracket } from "../../types";
import type { CYFamilyStatus } from "../types";

export const CYPRUS_INCOME_TAX_BRACKETS_2026: TaxBracket[] = [
  { min: 0, max: 22_000, rate: 0 },
  { min: 22_000, max: 32_000, rate: 0.2 },
  { min: 32_000, max: 42_000, rate: 0.25 },
  { min: 42_000, max: 72_000, rate: 0.3 },
  { min: 72_000, max: Infinity, rate: 0.35 },
];

export const CYPRUS_SOCIAL_INSURANCE_2026 = {
  employeeRate: 0.088,
  employerRate: 0.088,
  stateRate: 0.052,
  monthlyCeiling: 5_742,
  weeklyCeiling: 1_325,
  annualCeiling: 5_742 * 12,
};

export const CYPRUS_GHS_2026 = {
  employeeRate: 0.0265,
  employerRate: 0.029,
  annualIncomeCeiling: 180_000,
};

export const CYPRUS_TD59_DEDUCTIONS_2026 = {
  aggregateContributionDeductionRate: 0.2,
  modeledApprovedPensionProvidentRate: 0.1,
  homeInsuranceNaturalDisastersMax: 500,
  primaryResidenceRentOrInterestMax: 2_000,
  greenTransitionMax: 1_000,
  dependentChildren: {
    firstChild: 1_000,
    secondChild: 1_250,
    thirdAndAdditionalChild: 1_500,
    singleParentMultiplier: 2,
  },
};

export function calculateCyprusProgressiveTax(income: number): {
  totalTax: number;
  bracketTaxes: Array<TaxBracket & { tax: number }>;
} {
  const taxableIncome = Math.max(0, income);
  const bracketTaxes = CYPRUS_INCOME_TAX_BRACKETS_2026.map((bracket) => {
    const taxableAmount = Math.max(
      0,
      Math.min(taxableIncome, bracket.max) - bracket.min,
    );

    return {
      ...bracket,
      tax: taxableAmount * bracket.rate,
    };
  }).filter((bracket) => bracket.tax > 0 || bracket.rate === 0);

  return {
    totalTax: bracketTaxes.reduce((sum, bracket) => sum + bracket.tax, 0),
    bracketTaxes,
  };
}

export function calculateCyprusDependentChildDeduction(
  numberOfChildren: number,
  familyStatus: CYFamilyStatus,
): number {
  const children = Math.max(0, Math.floor(numberOfChildren));
  let baseDeduction = 0;

  for (let index = 0; index < children; index += 1) {
    if (index === 0) {
      baseDeduction += CYPRUS_TD59_DEDUCTIONS_2026.dependentChildren.firstChild;
    } else if (index === 1) {
      baseDeduction += CYPRUS_TD59_DEDUCTIONS_2026.dependentChildren.secondChild;
    } else {
      baseDeduction +=
        CYPRUS_TD59_DEDUCTIONS_2026.dependentChildren
          .thirdAndAdditionalChild;
    }
  }

  const multiplier =
    familyStatus === "single_parent" && children > 0
      ? CYPRUS_TD59_DEDUCTIONS_2026.dependentChildren.singleParentMultiplier
      : 1;

  return baseDeduction * multiplier;
}

export function getCyprusSingleParentMultiplier(
  familyStatus: CYFamilyStatus,
  numberOfChildren: number,
): number {
  return familyStatus === "single_parent" && numberOfChildren > 0
    ? CYPRUS_TD59_DEDUCTIONS_2026.dependentChildren.singleParentMultiplier
    : 1;
}

export function getCyprusFamilyIncomeThreshold(
  familyStatus: CYFamilyStatus,
  numberOfChildren: number,
): number {
  const children = Math.max(0, Math.floor(numberOfChildren));

  if (children === 0) {
    return familyStatus === "married" ? 80_000 : 40_000;
  }

  if (children <= 2) return 100_000;
  if (children <= 4) return 150_000;
  return 200_000;
}
