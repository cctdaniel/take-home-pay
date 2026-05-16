import type {
  CountryComparison,
  CountryComparisonAdapterContext,
} from "@/hooks/use-country-comparison";
import { MTCalculator } from "./calculator";
import {
  MALTA_RETIREMENT_TAX_CREDITS_2026,
  MALTA_TAX_STATUS_NAMES,
} from "./constants/tax-brackets-2026";
import type { MTCalculatorInputs, MTTaxStatus } from "./types";

function getComparisonTaxStatus(
  maritalStatus: "single" | "married",
  numberOfChildren: number,
): MTTaxStatus {
  if (maritalStatus === "married") {
    if (numberOfChildren >= 2) return "married_two_or_more_children";
    if (numberOfChildren === 1) return "married_one_child";
    return "married";
  }

  if (numberOfChildren >= 2) return "parent_two_or_more_children";
  if (numberOfChildren === 1) return "parent_one_child";
  return "single";
}

export function buildCountryComparison({
  country,
  config,
  currency,
  rate,
  grossLocal,
  payFrequency,
  inputs,
  isMaxRetirement,
  buildAssumptionsSummary,
}: CountryComparisonAdapterContext): CountryComparison {
  const defaultInputs = MTCalculator.getDefaultInputs() as MTCalculatorInputs;
  const residencyType = inputs.assumptions.isResident
    ? "resident"
    : "non_resident";
  const taxStatus = getComparisonTaxStatus(
    inputs.maritalStatus,
    inputs.numberOfChildren,
  );

  let remainingRetirementCapacity = grossLocal;
  const personalRetirementScheme =
    isMaxRetirement && residencyType === "resident"
      ? Math.min(
          MALTA_RETIREMENT_TAX_CREDITS_2026.personalRetirementScheme
            .maxCreditableContribution,
          remainingRetirementCapacity,
        )
      : 0;
  remainingRetirementCapacity -= personalRetirementScheme;
  const voluntaryOccupationalPension =
    isMaxRetirement && residencyType === "resident"
      ? Math.min(
          MALTA_RETIREMENT_TAX_CREDITS_2026.voluntaryOccupationalPension
            .maxCreditableContribution,
          Math.max(0, remainingRetirementCapacity),
        )
      : 0;

  const mtInputs: MTCalculatorInputs = {
    ...defaultInputs,
    grossSalary: grossLocal,
    payFrequency,
    residencyType,
    taxStatus,
    contributions: {
      personalRetirementScheme,
      voluntaryOccupationalPension,
    },
    taxReliefs: {
      schoolLevel: "none",
      schoolFees: 0,
      childcareFees: 0,
      sportsFees: 0,
      culturalFees: 0,
    },
  };

  const result = MTCalculator.calculate(mtInputs);
  const retirementApplied =
    personalRetirementScheme > 0 || voluntaryOccupationalPension > 0;
  const assumptions = buildAssumptionsSummary(
    country,
    inputs,
    retirementApplied,
  );
  assumptions.push(
    residencyType === "resident" ? "Resident" : "Non-resident",
  );
  assumptions.push(
    residencyType === "resident"
      ? MALTA_TAX_STATUS_NAMES[taxStatus]
      : "Non-resident rates",
  );

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
}
