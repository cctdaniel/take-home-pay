"use client";

import { DECalculator } from "@/lib/countries/de";
import { HK_DEDUCTIONS_2026 } from "@/lib/countries/hk/constants/tax-brackets-2026";
import {
  calculateNetSalary,
  getCountryConfig,
  getDefaultInputs,
  SUPPORTED_COUNTRIES,
} from "@/lib/countries/registry";
import { getSRSLimit } from "@/lib/countries/sg/constants/cpf-rates-2026";
import { TH_TAX_ALLOWANCES } from "@/lib/countries/th/constants/tax-brackets-2026";
import type {
  AUCalculatorInputs,
  CalculationResult,
  CountryCode,
  CurrencyCode,
  DECalculatorInputs,
  HKCalculatorInputs,
  IDCalculatorInputs,
  KRCalculatorInputs,
  NLCalculatorInputs,
  PayFrequency,
  PTCalculatorInputs,
  SGCalculatorInputs,
  THCalculatorInputs,
  TWCalculatorInputs,
  UKCalculatorInputs,
  USCalculatorInputs,
  USFilingStatus,
} from "@/lib/countries/types";
import { CONTRIBUTION_LIMITS } from "@/lib/countries/us/constants/contribution-limits";
import { useMemo } from "react";
import type { FxRatesResponse } from "./use-fx-rates";

export type MaritalStatus = "single" | "married";

export interface ComparisonAssumptions {
  isResident: boolean;
  spouseHasNoIncome: boolean;
  eligibleNl30Ruling: boolean;
  eligiblePtNhr2: boolean;
  usState: string;
  age: number;
  hasYoungChildren: boolean;
  hasPrivateHealthInsurance: boolean;
  retirementContributions: "none" | "max";
}

export interface ComparisonInputs {
  baseSalary: number;
  baseCurrency: CurrencyCode;
  maritalStatus: MaritalStatus;
  numberOfChildren: number;
  baselineCountry: CountryCode;
  assumptions: ComparisonAssumptions;
}

export interface CountryComparison {
  country: CountryCode;
  name: string;
  currency: CurrencyCode;
  rate: number;
  grossLocal: number;
  netLocal: number;
  netBase: number;
  takeHomeRate: number;
  effectiveTaxRate: number;
  deltaBase: number;
  deltaPercent: number;
  assumptions: string[];
  calculation: CalculationResult;
  usState?: string;
  usContributions?: {
    traditional401k: number;
    rothIRA: number;
    hsa: number;
  };
}

export interface ComparisonOutput {
  isReady: boolean;
  results: CountryComparison[];
  baseline?: CountryComparison;
  fxUpdatedAt?: string;
}

function getUSFilingStatus(
  maritalStatus: MaritalStatus,
  numberOfChildren: number
): USFilingStatus {
  if (maritalStatus === "married") {
    return "married_jointly";
  }

  if (numberOfChildren > 0) {
    return "head_of_household";
  }

  return "single";
}

function buildAssumptionsSummary(
  country: CountryCode,
  inputs: ComparisonInputs,
  retirementApplied: boolean
): string[] {
  const summary: string[] = [];
  const { maritalStatus, numberOfChildren, assumptions } = inputs;

  summary.push(maritalStatus === "married" ? "Married" : "Single");

  if (numberOfChildren > 0) {
    summary.push(`${numberOfChildren} kid${numberOfChildren > 1 ? "s" : ""}`);
  }

  if (country === "SG") {
    summary.push(assumptions.isResident ? "Citizen/PR" : "Foreigner");
    summary.push(`Age ${assumptions.age}`);
  }

  if (country === "US") {
    summary.push(`State ${assumptions.usState}`);
  }

  if (country === "NL") {
    summary.push(assumptions.eligibleNl30Ruling ? "30% ruling" : "No ruling");
    summary.push(
      assumptions.hasYoungChildren ? "Youngest under 12" : "No young children"
    );
  }

  if (country === "PT") {
    summary.push(assumptions.eligiblePtNhr2 ? "NHR 2.0" : "Standard regime");
    summary.push(`Age ${assumptions.age}`);
  }

  if (country === "AU") {
    summary.push(
      assumptions.hasPrivateHealthInsurance
        ? "Private health"
        : "No private health"
    );
  }

  if (
    country === "HK" ||
    country === "KR" ||
    country === "TH" ||
    country === "AU" ||
    country === "PT" ||
    country === "ID" ||
    country === "DE" ||
    country === "UK" ||
    country === "TW"
  ) {
    summary.push(assumptions.isResident ? "Resident" : "Non-resident");
  }

  if (country === "DE") {
    summary.push(
      inputs.maritalStatus === "married"
        ? "Married (joint threshold)"
        : "Single"
    );
    if (inputs.numberOfChildren > 0) {
      summary.push(
        `${inputs.numberOfChildren} child${
          inputs.numberOfChildren > 1 ? "ren" : ""
        } (no childless surcharge)`
      );
    }
  }

  if (
    country === "SG" &&
    maritalStatus === "married" &&
    assumptions.spouseHasNoIncome
  ) {
    summary.push("Spouse no income");
  }

  if (
    country === "TH" &&
    maritalStatus === "married" &&
    assumptions.spouseHasNoIncome
  ) {
    summary.push("Spouse no income");
  }

  if (country === "HK" && maritalStatus === "single" && numberOfChildren > 0) {
    summary.push("Single parent");
  }

  if (retirementApplied) {
    summary.push("Retirement: max");
  }

  return summary;
}

function getPprMaxContribution(age: number): number {
  if (age < 35) return 2000;
  if (age <= 50) return 1750;
  return 1500;
}

export function useCountryComparison(
  inputs: ComparisonInputs,
  fxRates: FxRatesResponse | null
): ComparisonOutput {
  return useMemo(() => {
    if (!fxRates) {
      return {
        isReady: false,
        results: [],
      };
    }

    const payFrequency: PayFrequency = "monthly";
    const isMaxRetirement =
      inputs.assumptions.retirementContributions === "max";
    const results = SUPPORTED_COUNTRIES.reduce<CountryComparison[]>(
      (acc, country) => {
        const config = getCountryConfig(country);
        const currency = config.currency.code;
        const rate = fxRates.rates[currency];

        if (!rate || rate <= 0) {
          return acc;
        }

        const grossLocal = inputs.baseSalary * rate;

        if (country === "US") {
          const defaultInputs = getDefaultInputs(country) as USCalculatorInputs;
          const filingStatus = getUSFilingStatus(
            inputs.maritalStatus,
            inputs.numberOfChildren
          );
          const retirement401k = isMaxRetirement
            ? Math.min(CONTRIBUTION_LIMITS.traditional401k, grossLocal)
            : 0;
          const usInputs: USCalculatorInputs = {
            ...defaultInputs,
            grossSalary: grossLocal,
            payFrequency,
            state: inputs.assumptions.usState,
            filingStatus,
            contributions: {
              ...defaultInputs.contributions,
              traditional401k: retirement401k,
              rothIRA: 0,
              hsa: 0,
            },
          };
          const result = calculateNetSalary(usInputs);
          const retirementApplied = retirement401k > 0;
          acc.push({
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
            assumptions: buildAssumptionsSummary(
              country,
              inputs,
              retirementApplied
            ),
            calculation: result,
            usState: usInputs.state,
            usContributions: {
              traditional401k: usInputs.contributions.traditional401k,
              rothIRA: usInputs.contributions.rothIRA,
              hsa: usInputs.contributions.hsa,
            },
          });
          return acc;
        }

        if (country === "SG") {
          const defaultInputs = getDefaultInputs(country) as SGCalculatorInputs;
          const residencyType = inputs.assumptions.isResident
            ? "citizen_pr"
            : "foreigner";
          const srsContribution = isMaxRetirement
            ? Math.min(getSRSLimit(residencyType), grossLocal)
            : 0;
          const sgInputs: SGCalculatorInputs = {
            ...defaultInputs,
            grossSalary: grossLocal,
            payFrequency,
            residencyType,
            age: inputs.assumptions.age,
            contributions: {
              ...defaultInputs.contributions,
              srsContribution,
              voluntaryCpfTopUp: 0,
            },
            taxReliefs: {
              ...defaultInputs.taxReliefs,
              hasSpouseRelief:
                inputs.maritalStatus === "married" &&
                inputs.assumptions.spouseHasNoIncome,
              numberOfChildren: inputs.numberOfChildren,
              isWorkingMother: false,
              parentRelief: "none",
              numberOfParents: 0,
              courseFees: 0,
            },
          };
          const result = calculateNetSalary(sgInputs);
          const retirementApplied = srsContribution > 0;
          acc.push({
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
            assumptions: buildAssumptionsSummary(
              country,
              inputs,
              retirementApplied
            ),
            calculation: result,
          });
          return acc;
        }

        if (country === "KR") {
          const defaultInputs = getDefaultInputs(country) as KRCalculatorInputs;
          const krInputs: KRCalculatorInputs = {
            ...defaultInputs,
            grossSalary: grossLocal,
            payFrequency,
            residencyType: inputs.assumptions.isResident
              ? "resident"
              : "non_resident",
            taxReliefs: {
              ...defaultInputs.taxReliefs,
              numberOfDependents:
                inputs.maritalStatus === "married" &&
                inputs.assumptions.spouseHasNoIncome
                  ? 1
                  : 0,
              numberOfChildrenUnder20: inputs.numberOfChildren,
              numberOfChildrenUnder7: 0,
            },
          };
          const result = calculateNetSalary(krInputs);
          acc.push({
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
            assumptions: buildAssumptionsSummary(country, inputs, false),
            calculation: result,
          });
          return acc;
        }

        if (country === "NL") {
          const defaultInputs = getDefaultInputs(country) as NLCalculatorInputs;
          const nlInputs: NLCalculatorInputs = {
            ...defaultInputs,
            grossSalary: grossLocal,
            payFrequency,
            hasThirtyPercentRuling: inputs.assumptions.eligibleNl30Ruling,
            hasYoungChildren: inputs.assumptions.hasYoungChildren,
          };
          const result = calculateNetSalary(nlInputs);
          acc.push({
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
            assumptions: buildAssumptionsSummary(country, inputs, false),
            calculation: result,
          });
          return acc;
        }

        if (country === "AU") {
          const defaultInputs = getDefaultInputs(country) as AUCalculatorInputs;
          const auInputs: AUCalculatorInputs = {
            ...defaultInputs,
            grossSalary: grossLocal,
            payFrequency,
            residencyType: inputs.assumptions.isResident
              ? "resident"
              : "non_resident",
            hasPrivateHealthInsurance:
              inputs.assumptions.hasPrivateHealthInsurance,
          };
          const result = calculateNetSalary(auInputs);
          acc.push({
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
            assumptions: buildAssumptionsSummary(country, inputs, false),
            calculation: result,
          });
          return acc;
        }

        if (country === "PT") {
          const defaultInputs = getDefaultInputs(country) as PTCalculatorInputs;
          const pprContribution =
            isMaxRetirement && inputs.assumptions.isResident
              ? Math.min(
                  getPprMaxContribution(inputs.assumptions.age),
                  grossLocal
                )
              : 0;
          const ptInputs: PTCalculatorInputs = {
            ...defaultInputs,
            grossSalary: grossLocal,
            payFrequency,
            residencyType: inputs.assumptions.isResident
              ? inputs.assumptions.eligiblePtNhr2
                ? "nhr_2"
                : "resident"
              : "non_resident",
            filingStatus:
              inputs.maritalStatus === "married" ? "married_jointly" : "single",
            numberOfDependents: inputs.numberOfChildren,
            age: inputs.assumptions.age,
            contributions: {
              ...defaultInputs.contributions,
              pprContribution,
            },
          };
          const result = calculateNetSalary(ptInputs);
          const retirementApplied = pprContribution > 0;
          acc.push({
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
            assumptions: buildAssumptionsSummary(
              country,
              inputs,
              retirementApplied
            ),
            calculation: result,
          });
          return acc;
        }

        if (country === "TH") {
          const defaultInputs = getDefaultInputs(country) as THCalculatorInputs;
          const providentFundContribution =
            isMaxRetirement && inputs.assumptions.isResident
              ? Math.min(
                  grossLocal * TH_TAX_ALLOWANCES.providentFundRate,
                  TH_TAX_ALLOWANCES.providentFundMax
                )
              : 0;
          const thInputs: THCalculatorInputs = {
            ...defaultInputs,
            grossSalary: grossLocal,
            payFrequency,
            residencyType: inputs.assumptions.isResident
              ? "resident"
              : "non_resident",
            contributions: {
              ...defaultInputs.contributions,
              providentFundContribution,
              rmfContribution: 0,
              ssfContribution: 0,
              esgContribution: 0,
              nationalSavingsFundContribution: 0,
            },
            taxReliefs: {
              ...defaultInputs.taxReliefs,
              hasSpouse: inputs.maritalStatus === "married",
              spouseHasNoIncome: inputs.assumptions.spouseHasNoIncome,
              numberOfChildren: inputs.numberOfChildren,
              numberOfChildrenBornAfter2018: 0,
              numberOfParents: 0,
              numberOfDisabledDependents: 0,
              isElderlyOrDisabled: false,
              lifeInsurancePremium: 0,
              lifeInsuranceSpousePremium: 0,
              healthInsurancePremium: 0,
              healthInsuranceParentsPremium: 0,
              hasSocialSecurity: true,
              providentFundContribution,
              rmfContribution: 0,
              ssfContribution: 0,
              esgContribution: 0,
              nationalSavingsFundContribution: 0,
              mortgageInterest: 0,
              donations: 0,
              politicalDonation: 0,
            },
          };
          const result = calculateNetSalary(thInputs);
          const retirementApplied = providentFundContribution > 0;
          acc.push({
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
            assumptions: buildAssumptionsSummary(
              country,
              inputs,
              retirementApplied
            ),
            calculation: result,
          });
          return acc;
        }

        if (country === "ID") {
          const defaultInputs = getDefaultInputs(country) as IDCalculatorInputs;
          const idInputs: IDCalculatorInputs = {
            ...defaultInputs,
            grossSalary: grossLocal,
            payFrequency,
            contributions: {
              dplkContribution: 0,
              zakatContribution: 0,
            },
            taxReliefs: {
              maritalStatus: inputs.maritalStatus,
              numberOfDependents: Math.min(inputs.numberOfChildren, 3),
              spouseIncomeCombined:
                inputs.maritalStatus === "married" &&
                inputs.assumptions.spouseHasNoIncome,
            },
          };
          const result = calculateNetSalary(idInputs);
          acc.push({
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
            assumptions: buildAssumptionsSummary(country, inputs, false),
            calculation: result,
          });
          return acc;
        }

        if (country === "TW") {
          const defaultInputs = getDefaultInputs(country) as TWCalculatorInputs;
          const voluntaryPension = isMaxRetirement
            ? Math.min((grossLocal / 12) * 0.06, 150_000 * 0.06) * 12
            : 0;
          const twInputs: TWCalculatorInputs = {
            ...defaultInputs,
            grossSalary: grossLocal,
            payFrequency,
            contributions: {
              voluntaryPensionContribution: voluntaryPension,
            },
            taxReliefs: {
              isMarried: inputs.maritalStatus === "married",
              hasDisability: false,
              isGoldCardHolder: false,
            },
          };
          const result = calculateNetSalary(twInputs);
          const retirementApplied = voluntaryPension > 0;
          acc.push({
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
            assumptions: buildAssumptionsSummary(
              country,
              inputs,
              retirementApplied
            ),
            calculation: result,
          });
          return acc;
        }

        if (country === "UK") {
          const defaultInputs = getDefaultInputs(country) as UKCalculatorInputs;
          const ukInputs: UKCalculatorInputs = {
            ...defaultInputs,
            grossSalary: grossLocal,
            payFrequency,
            residencyType: inputs.assumptions.isResident
              ? "resident"
              : "non_resident",
            region: "rest_of_uk",
            contributions: {
              pensionContribution: 0,
            },
          };
          const result = calculateNetSalary(ukInputs);
          acc.push({
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
            assumptions: buildAssumptionsSummary(country, inputs, false),
            calculation: result,
          });
          return acc;
        }

        if (country === "DE") {
          const defaultInputs = getDefaultInputs(country) as DECalculatorInputs;
          const deLimits = DECalculator.getContributionLimits({
            country: "DE",
            grossSalary: grossLocal,
            isMarried: inputs.maritalStatus === "married",
          } as Partial<DECalculatorInputs>);
          const maxBav = Math.min(
            deLimits.occupationalPension?.limit ?? 0,
            grossLocal
          );
          const maxRiester = Math.min(
            deLimits.riesterContribution?.limit ?? 0,
            grossLocal
          );
          const maxRuerup = Math.min(
            deLimits.ruerupContribution?.limit ?? 0,
            grossLocal
          );
          const deInputs: DECalculatorInputs = {
            ...defaultInputs,
            grossSalary: grossLocal,
            payFrequency,
            state: "BE", // Default to Berlin for comparison (9% church tax rate)
            isMarried: inputs.maritalStatus === "married",
            isChurchMember: false, // Default: not a church member
            isChildless: inputs.numberOfChildren === 0,
            contributions: {
              ...defaultInputs.contributions,
              occupationalPension: isMaxRetirement ? maxBav : 0,
              riesterContribution: isMaxRetirement ? maxRiester : 0,
              ruerupContribution: isMaxRetirement ? maxRuerup : 0,
            },
          };
          const result = calculateNetSalary(deInputs);
          const retirementApplied = isMaxRetirement;
          acc.push({
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
            assumptions: buildAssumptionsSummary(
              country,
              inputs,
              retirementApplied
            ),
            calculation: result,
          });
          return acc;
        }

        const defaultInputs = getDefaultInputs(country) as HKCalculatorInputs;
        const voluntaryMpf =
          isMaxRetirement && inputs.assumptions.isResident
            ? Math.min(HK_DEDUCTIONS_2026.voluntaryMpfAnnuityMax, grossLocal)
            : 0;
        const hkInputs: HKCalculatorInputs = {
          ...defaultInputs,
          grossSalary: grossLocal,
          payFrequency,
          residencyType: inputs.assumptions.isResident
            ? "resident"
            : "non_resident",
          contributions: {
            ...defaultInputs.contributions,
            taxDeductibleVoluntaryContributions: voluntaryMpf,
          },
          taxReliefs: {
            ...defaultInputs.taxReliefs,
            hasMarriedAllowance: inputs.maritalStatus === "married",
            hasSingleParentAllowance:
              inputs.maritalStatus === "single" && inputs.numberOfChildren > 0,
            numberOfChildren: inputs.numberOfChildren,
            numberOfNewbornChildren: 0,
            numberOfDependentParents: 0,
            numberOfDependentParentsLivingWith: 0,
            numberOfDependentSiblings: 0,
            hasDisabilityAllowance: false,
            numberOfDisabledDependents: 0,
            selfEducationExpenses: 0,
            homeLoanInterest: 0,
            domesticRent: 0,
            charitableDonations: 0,
            elderlyResidentialCareExpenses: 0,
          },
        };
        const result = calculateNetSalary(hkInputs);
        const retirementApplied = voluntaryMpf > 0;
        acc.push({
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
          assumptions: buildAssumptionsSummary(
            country,
            inputs,
            retirementApplied
          ),
          calculation: result,
        });

        return acc;
      },
      []
    ).sort((a, b) => b.netBase - a.netBase);

    const baseline = results.find(
      (result) => result.country === inputs.baselineCountry
    );

    const baselineNetBase = baseline?.netBase ?? 0;

    const adjustedResults = results.map((result) => {
      const deltaBase = baselineNetBase ? result.netBase - baselineNetBase : 0;
      const deltaPercent = baselineNetBase ? deltaBase / baselineNetBase : 0;
      return {
        ...result,
        deltaBase,
        deltaPercent,
      };
    });

    return {
      isReady: true,
      results: adjustedResults,
      baseline,
      fxUpdatedAt: fxRates.updatedAt,
    };
  }, [fxRates, inputs]);
}
