"use client";

import { HKAdditionalReliefs } from "@/components/calculator/hk-additional-reliefs";
import { HKTaxOptions } from "@/components/calculator/hk-tax-options";
import {
  CountryCalculatorExtensionShell,
  useCountryCalculatorExtension,
  type CountryCalculatorExtensionProps,
} from "@/components/calculator/country-extension";
import { InfoPanel } from "@/components/calculator/info-panel";
import { ContributionSlider } from "@/components/ui/contribution-slider";
import { Separator } from "@/components/ui/separator";
import { HKCalculator } from "@/lib/countries/hk";
import { HK_DEDUCTIONS_2026 } from "@/lib/countries/hk/constants/tax-brackets-2026";
import type {
  HKCalculatorInputs,
  HKTaxReliefInputs,
} from "@/lib/countries/types";
import { clampAmount, clampCount } from "@/lib/utils";

export default function HKCountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const {
    inputs,
    currency,
    result,
    setPayFrequency,
    setInputs,
  } = useCountryCalculatorExtension<HKCalculatorInputs>(country);
  const contributionLimits = HKCalculator.getContributionLimits(inputs);
  const tvcLimit =
    contributionLimits.taxDeductibleVoluntaryContributions?.limit ?? 0;

  const clampTaxReliefs = (
    nextInputs: HKCalculatorInputs,
  ): HKTaxReliefInputs => {
    const nextLimits = HKCalculator.getContributionLimits(nextInputs);

    return {
      ...nextInputs.taxReliefs,
      numberOfNewbornChildren: Math.min(
        nextInputs.taxReliefs.numberOfNewbornChildren ?? 0,
        nextInputs.taxReliefs.numberOfChildren ?? 0,
      ),
      numberOfDependentParentsLivingWith: Math.min(
        nextInputs.taxReliefs.numberOfDependentParentsLivingWith ?? 0,
        nextInputs.taxReliefs.numberOfDependentParents ?? 0,
      ),
      numberOfDependentParentsAged55To59LivingWith: Math.min(
        nextInputs.taxReliefs.numberOfDependentParentsAged55To59LivingWith ??
          0,
        nextInputs.taxReliefs.numberOfDependentParentsAged55To59 ?? 0,
      ),
      vhisPremiums: clampAmount(
        nextInputs.taxReliefs.vhisPremiums ?? 0,
        nextLimits.vhisPremiums?.limit ?? 0,
      ),
      assistedReproductiveServicesExpenses: clampAmount(
        nextInputs.taxReliefs.assistedReproductiveServicesExpenses ?? 0,
        nextLimits.assistedReproductiveServicesExpenses?.limit ?? 0,
      ),
      homeLoanInterest: clampAmount(
        nextInputs.taxReliefs.homeLoanInterest ?? 0,
        HK_DEDUCTIONS_2026.homeLoanInterestMax +
          (nextInputs.taxReliefs.hasHomeLoanInterestAdditionalCeiling
            ? HK_DEDUCTIONS_2026.homeLoanInterestAdditionalMax
            : 0),
      ),
      domesticRent: clampAmount(
        nextInputs.taxReliefs.domesticRent ?? 0,
        HK_DEDUCTIONS_2026.domesticRentMax +
          (nextInputs.taxReliefs.hasDomesticRentAdditionalCeiling
            ? HK_DEDUCTIONS_2026.domesticRentAdditionalMax
            : 0),
      ),
      housingBenefitType: nextInputs.taxReliefs.housingBenefitType ?? "none",
      housingRentPaid: Math.max(0, nextInputs.taxReliefs.housingRentPaid ?? 0),
      customHousingRentalValue: Math.max(
        0,
        nextInputs.taxReliefs.customHousingRentalValue ?? 0,
      ),
      charitableDonations: clampAmount(
        nextInputs.taxReliefs.charitableDonations ?? 0,
        nextLimits.charitableDonations?.limit ?? 0,
      ),
    };
  };

  const setHongKongGrossSalary = (grossSalary: number) => {
    setInputs((current) => {
      const nextInputs: HKCalculatorInputs = {
        ...current,
        grossSalary,
        contributions: {
          ...current.contributions,
          taxDeductibleVoluntaryContributions: clampAmount(
            current.contributions.taxDeductibleVoluntaryContributions ?? 0,
            tvcLimit,
          ),
        },
      };

      return {
        ...nextInputs,
        taxReliefs: clampTaxReliefs(nextInputs),
      };
    });
  };

  return (
    <CountryCalculatorExtensionShell
      country={country}
      currency={currency}
      grossSalary={inputs.grossSalary}
      onGrossSalaryChange={setHongKongGrossSalary}
      result={result}
      taxOptions={
        <HKTaxOptions
          residencyType={inputs.residencyType}
          onResidencyTypeChange={(residencyType) =>
            setInputs((current) => ({ ...current, residencyType }))
          }
          payFrequency={inputs.payFrequency}
          onPayFrequencyChange={setPayFrequency}
          taxReliefs={inputs.taxReliefs}
          onTaxReliefsChange={(taxReliefs) =>
            setInputs((current) => {
              const nextInputs: HKCalculatorInputs = {
                ...current,
                taxReliefs,
              };

              return {
                ...nextInputs,
                taxReliefs: clampTaxReliefs(nextInputs),
              };
            })
          }
          currency={currency}
        />
      }
      contributions={
        <div className="space-y-6">
          <ContributionSlider
            label="Tax-Deductible Voluntary MPF & Annuity Contributions"
            description={`Combined TVC / qualifying deferred annuity cap: HK$${tvcLimit.toLocaleString()}`}
            value={Math.min(
              inputs.contributions.taxDeductibleVoluntaryContributions,
              tvcLimit,
            )}
            onChange={(taxDeductibleVoluntaryContributions) =>
              setInputs((current) => ({
                ...current,
                contributions: {
                  ...current.contributions,
                  taxDeductibleVoluntaryContributions: clampAmount(
                    taxDeductibleVoluntaryContributions,
                    tvcLimit,
                  ),
                },
              }))
            }
            max={tvcLimit}
            currency={currency}
          />

          <Separator />

          <HKAdditionalReliefs
            reliefs={inputs.taxReliefs}
            deductionLimits={contributionLimits}
            onChange={(taxReliefs) =>
              setInputs((current) => {
                const nextInputs: HKCalculatorInputs = {
                  ...current,
                  taxReliefs,
                };

                return {
                  ...nextInputs,
                  taxReliefs: clampTaxReliefs(nextInputs),
                };
              })
            }
          />
        </div>
      }
      contributionsTitle="Allowances and Deductions"
      contributionsDescription="Hong Kong salaries-tax allowances, deductions, MPF TVC, QDAP, VHIS, and family inputs"
      seoInfo={<HKTaxInfo />}
      infoCard={
        <InfoPanel title="Hong Kong Payroll Scope">
          <p>
            This models Hong Kong salaries tax with resident allowances where
            selected, mandatory MPF, tax-deductible voluntary MPF or qualifying
            deferred annuity contributions, VHIS premiums, assisted
            reproductive service expenses, employer-provided housing rental
            value, and common deductible expenses.
          </p>
          <p className="mt-2">
            Tax payable is the lower of progressive tax on net chargeable income
            and standard-rate tax on net income, after the modeled 2025/26
            one-off salaries-tax reduction. Cash rental allowances and other
            cash perquisites should be included in gross salary; the housing
            input is for IRD-accepted place-of-residence rental value. Non-
            employment income and exact provisional tax timing require separate
            filing facts.
          </p>
        </InfoPanel>
      }
    />
  );
}

function HKTaxInfoContent() {
  return (
    <div>
      <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">
        Hong Kong
      </h3>
      <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
        <li>
          <strong className="text-zinc-300">Salaries Tax</strong> – Progressive
          rates from 2% to 17%
        </li>
        <li>
          <strong className="text-zinc-300">Standard Rate</strong> – 15% on net
          income (16% above HK$5,000,000)
        </li>
        <li>
          <strong className="text-zinc-300">Allowances</strong> – Basic, married,
          single parent, child, and dependent allowances reduce chargeable income
        </li>
        <li>
          <strong className="text-zinc-300">Deductions</strong> – MPF, self-education,
          home loan interest, domestic rent, and approved charitable donations
        </li>
        <li>
          <strong className="text-zinc-300">MPF Contributions</strong> – 5% of
          monthly income between HK$7,100 and HK$30,000 (max HK$1,500/month)
        </li>
      </ul>
    </div>
  );
}

function HKTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="mb-4 text-xl font-semibold text-zinc-200">
        How Hong Kong Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <HKTaxInfoContent />
      </div>
    </section>
  );
}
