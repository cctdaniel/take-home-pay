// Child Tax Credit and Credit for Other Dependents — simplified 2026 model
// Source: IRS Publication 972 (2025); OBBB increases CTC to $2,200 in some years — using $2,000 baseline

import type { USFilingStatus } from "../types";
import { US_LIMITS_2026 } from "./contribution-limits";

export interface USFamilyCreditsInput {
  filingStatus: USFilingStatus;
  modifiedAGI: number;
  numberOfQualifyingChildren: number;
  numberOfOtherDependents: number;
}

export interface USFamilyCreditsResult {
  childTaxCredit: number;
  otherDependentCredit: number;
  totalCredits: number;
  phaseOutReduction: number;
}

function getPhaseOutThreshold(filingStatus: USFilingStatus): number {
  if (filingStatus === "married_jointly") {
    return US_LIMITS_2026.ctcPhaseOutMfj;
  }
  return US_LIMITS_2026.ctcPhaseOutSingle;
}

/** Simplified CTC/CODC: full credit below phase-out; $50 reduction per $1,000 over threshold. */
export function calculateUSFamilyTaxCredits(
  input: USFamilyCreditsInput,
): USFamilyCreditsResult {
  const grossCredit =
    input.numberOfQualifyingChildren * US_LIMITS_2026.childTaxCreditPerChild +
    input.numberOfOtherDependents * US_LIMITS_2026.otherDependentCredit;

  if (grossCredit <= 0) {
    return {
      childTaxCredit: 0,
      otherDependentCredit: 0,
      totalCredits: 0,
      phaseOutReduction: 0,
    };
  }

  const threshold = getPhaseOutThreshold(input.filingStatus);
  const excess = Math.max(0, input.modifiedAGI - threshold);
  const phaseOutReduction = Math.min(
    grossCredit,
    Math.floor(excess / 1000) * 50,
  );

  const childGross =
    input.numberOfQualifyingChildren * US_LIMITS_2026.childTaxCreditPerChild;
  const otherGross =
    input.numberOfOtherDependents * US_LIMITS_2026.otherDependentCredit;
  const childShare = grossCredit > 0 ? childGross / grossCredit : 0;
  const otherShare = grossCredit > 0 ? otherGross / grossCredit : 0;

  const childTaxCredit = Math.max(
    0,
    Math.round(childGross - phaseOutReduction * childShare),
  );
  const otherDependentCredit = Math.max(
    0,
    Math.round(otherGross - phaseOutReduction * otherShare),
  );

  return {
    childTaxCredit,
    otherDependentCredit,
    totalCredits: childTaxCredit + otherDependentCredit,
    phaseOutReduction,
  };
}
