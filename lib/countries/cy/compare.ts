import type { CountryComparisonAdapter } from "@/hooks/use-country-comparison";
import { calculateNetSalary, getDefaultInputs } from "@/lib/countries/registry";
import { CYCalculator } from "./calculator";
import { getCyprusFamilyIncomeThreshold } from "./constants/tax-brackets-2026";
import type { CYCalculatorInputs, CYFamilyStatus } from "./types";

function getFamilyStatus(
  maritalStatus: "single" | "married",
  numberOfChildren: number,
): CYFamilyStatus {
  if (maritalStatus === "married") {
    return "married";
  }

  return numberOfChildren > 0 ? "single_parent" : "single";
}

export const buildCountryComparison: CountryComparisonAdapter = ({
  country,
  config,
  currency,
  rate,
  grossLocal,
  payFrequency,
  inputs,
  isMaxRetirement,
  buildAssumptionsSummary,
}) => {
  const defaultInputs = getDefaultInputs(country) as CYCalculatorInputs;
  const familyStatus = getFamilyStatus(
    inputs.maritalStatus,
    inputs.numberOfChildren,
  );
  const familyIncomeThreshold = getCyprusFamilyIncomeThreshold(
    familyStatus,
    inputs.numberOfChildren,
  );
  const meetsFamilyIncomeCriteria = grossLocal <= familyIncomeThreshold;
  const residencyType = inputs.assumptions.isResident
    ? "resident"
    : "non_resident";
  const limits = CYCalculator.getContributionLimits({
    ...defaultInputs,
    grossSalary: grossLocal,
    residencyType,
    taxReliefs: {
      familyStatus,
      numberOfDependentChildren: inputs.numberOfChildren,
      meetsFamilyIncomeCriteria,
    },
  });
  const approvedPensionProvidentFund =
    isMaxRetirement && grossLocal > 0
      ? Math.min(limits.approvedPensionProvidentFund?.limit ?? 0, grossLocal)
      : 0;
  const cyInputs: CYCalculatorInputs = {
    ...defaultInputs,
    grossSalary: grossLocal,
    payFrequency,
    residencyType,
    contributions: {
      approvedPensionProvidentFund,
      homeInsurancePremium: 0,
      primaryResidenceDeduction: 0,
      greenTransitionExpense: 0,
    },
    taxReliefs: {
      familyStatus,
      numberOfDependentChildren: inputs.numberOfChildren,
      meetsFamilyIncomeCriteria,
    },
  };
  const result = calculateNetSalary(cyInputs);
  const retirementApplied = approvedPensionProvidentFund > 0;
  const assumptions = buildAssumptionsSummary(
    country,
    inputs,
    retirementApplied,
  );

  assumptions.push(
    inputs.assumptions.isResident ? "Cyprus resident" : "Non-resident",
  );

  if (inputs.numberOfChildren > 0) {
    assumptions.push(
      meetsFamilyIncomeCriteria
        ? "Family relief eligible"
        : "Family relief over threshold",
    );
  }

  return {
    country,
    name: config.name,
    currency,
    rate,
    grossLocal,
    netLocal: result.netSalary,
    netBase: result.netSalary / rate,
    takeHomeRate: grossLocal > 0 ? result.netSalary / grossLocal : 0,
    effectiveTaxRate: result.effectiveTaxRate,
    deltaBase: 0,
    deltaPercent: 0,
    assumptions,
    calculation: result,
  };
};
