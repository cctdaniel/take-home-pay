"use client";

import {
  BooleanSelectField,
  NumberStepperField,
} from "@/components/calculator/calculator-fields";
import { ContributionSlider } from "@/components/ui/contribution-slider";
import { HK_DEDUCTIONS_2026 } from "@/lib/countries/hk/constants/tax-brackets-2026";
import type {
  ContributionLimits,
  HKTaxReliefInputs,
} from "@/lib/countries/types";

interface HKAdditionalReliefsProps {
  reliefs: HKTaxReliefInputs;
  deductionLimits: ContributionLimits;
  onChange: (reliefs: HKTaxReliefInputs) => void;
}

function clampAmount(value: number, max: number) {
  return Math.min(Math.max(0, value), Math.max(0, max));
}

function clampCount(value: number, max: number) {
  return Math.min(Math.max(0, Math.floor(value)), max);
}

export function HKAdditionalReliefs({
  reliefs,
  deductionLimits,
  onChange,
}: HKAdditionalReliefsProps) {
  const vhisLimit = deductionLimits.vhisPremiums?.limit ?? 0;
  const assistedReproductiveServicesLimit =
    deductionLimits.assistedReproductiveServicesExpenses?.limit ?? 0;
  const charitableDonationLimit =
    deductionLimits.charitableDonations?.limit ?? 0;

  const updateRelief = <K extends keyof HKTaxReliefInputs>(
    key: K,
    value: HKTaxReliefInputs[K],
  ) => {
    onChange({ ...reliefs, [key]: value });
  };

  return (
    <div className="space-y-6">
      <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
        Allowances & Deductions
      </h3>

      <div className="space-y-3">
        <h4 className="text-xs font-medium text-zinc-500">Personal Allowances</h4>

        <BooleanSelectField
          id="hk-married-person-allowance"
          label="Married Person's Allowance"
          value={reliefs.hasMarriedAllowance}
          onChange={(checked) => {
            updateRelief("hasMarriedAllowance", checked);
            if (checked) updateRelief("hasSingleParentAllowance", false);
          }}
          description="HKD 264,000; replaces the basic allowance."
          className="pl-4 border-l-2 border-zinc-700"
        />

        <BooleanSelectField
          id="hk-single-parent-allowance"
          label="Single Parent Allowance"
          value={reliefs.hasSingleParentAllowance}
          onChange={(checked) => {
            updateRelief("hasSingleParentAllowance", checked);
            if (checked) updateRelief("hasMarriedAllowance", false);
          }}
          description="HKD 132,000; not available with married person's allowance."
          className="pl-4 border-l-2 border-zinc-700"
        />

        <div className="pl-4 border-l-2 border-zinc-700 space-y-2">
          <NumberStepperField
            id="hk-children"
            label="Number of Children"
            value={reliefs.numberOfChildren}
            onChange={(value) => {
              const nextChildren = clampCount(value, 10);
              onChange({
                ...reliefs,
                numberOfChildren: nextChildren,
                numberOfNewbornChildren: Math.min(
                  reliefs.numberOfNewbornChildren,
                  nextChildren,
                ),
              });
            }}
            min={0}
            max={10}
            description="HKD 130,000 child allowance per qualifying child."
          />
          {reliefs.numberOfChildren > 0 && (
            <NumberStepperField
              id="hk-newborn-children"
              label="Children born this year"
              value={reliefs.numberOfNewbornChildren}
              onChange={(value) =>
                updateRelief(
                  "numberOfNewbornChildren",
                  clampCount(value, reliefs.numberOfChildren),
                )
              }
              min={0}
              max={reliefs.numberOfChildren}
              description="Additional HKD 130,000 allowance each; cannot exceed total children."
            />
          )}
        </div>

        <div className="pl-4 border-l-2 border-zinc-700 space-y-2">
          <NumberStepperField
            id="hk-dependent-parents"
            label="Parents/Grandparents 60+ or Disabled"
            value={reliefs.numberOfDependentParents}
            onChange={(value) => {
              const nextParents = clampCount(value, 4);
              onChange({
                ...reliefs,
                numberOfDependentParents: nextParents,
                numberOfDependentParentsLivingWith: Math.min(
                  reliefs.numberOfDependentParentsLivingWith,
                  nextParents,
                ),
              });
            }}
            min={0}
            max={4}
            description="HKD 50,000 each, plus HKD 50,000 if living with you."
          />
          {reliefs.numberOfDependentParents > 0 && (
            <NumberStepperField
              id="hk-parents-living-with-you"
              label="Parents living with you"
              value={reliefs.numberOfDependentParentsLivingWith}
              onChange={(value) =>
                updateRelief(
                  "numberOfDependentParentsLivingWith",
                  clampCount(value, reliefs.numberOfDependentParents),
                )
              }
              min={0}
              max={reliefs.numberOfDependentParents}
              description="Additional HKD 50,000 each; cannot exceed parent/grandparent count."
            />
          )}
        </div>

        <div className="pl-4 border-l-2 border-zinc-700 space-y-2">
          <NumberStepperField
            id="hk-dependent-parents-55-to-59"
            label="Parents/Grandparents Age 55-59"
            value={reliefs.numberOfDependentParentsAged55To59 ?? 0}
            onChange={(value) => {
              const nextParents = clampCount(value, 4);
              onChange({
                ...reliefs,
                numberOfDependentParentsAged55To59: nextParents,
                numberOfDependentParentsAged55To59LivingWith: Math.min(
                  reliefs.numberOfDependentParentsAged55To59LivingWith ?? 0,
                  nextParents,
                ),
              });
            }}
            min={0}
            max={4}
            description="HKD 25,000 each, plus HKD 25,000 if living with you."
          />
          {(reliefs.numberOfDependentParentsAged55To59 ?? 0) > 0 && (
            <NumberStepperField
              id="hk-parents-55-to-59-living-with-you"
              label="Age 55-59 parents living with you"
              value={reliefs.numberOfDependentParentsAged55To59LivingWith ?? 0}
              onChange={(value) =>
                updateRelief(
                  "numberOfDependentParentsAged55To59LivingWith",
                  clampCount(
                    value,
                    reliefs.numberOfDependentParentsAged55To59 ?? 0,
                  ),
                )
              }
              min={0}
              max={reliefs.numberOfDependentParentsAged55To59 ?? 0}
              description="Additional HKD 25,000 each; cannot exceed age 55-59 parent/grandparent count."
            />
          )}
        </div>

        <div className="pl-4 border-l-2 border-zinc-700">
          <NumberStepperField
            id="hk-dependent-siblings"
            label="Dependent Brothers/Sisters"
            value={reliefs.numberOfDependentSiblings}
            onChange={(value) =>
              updateRelief("numberOfDependentSiblings", clampCount(value, 6))
            }
            min={0}
            max={6}
            description="HKD 37,500 each."
          />
        </div>

        <BooleanSelectField
          id="hk-personal-disability-allowance"
          label="Personal Disability Allowance"
          value={reliefs.hasDisabilityAllowance}
          onChange={(checked) =>
            updateRelief("hasDisabilityAllowance", checked)
          }
          description="HKD 75,000."
          className="pl-4 border-l-2 border-zinc-700"
        />

        <div className="pl-4 border-l-2 border-zinc-700">
          <NumberStepperField
            id="hk-disabled-dependents"
            label="Disabled Dependents"
            value={reliefs.numberOfDisabledDependents}
            onChange={(value) =>
              updateRelief("numberOfDisabledDependents", clampCount(value, 4))
            }
            min={0}
            max={4}
            description="HKD 75,000 each."
          />
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-xs font-medium text-zinc-500">Deductions</h4>

        <div className="space-y-3 pl-4 border-l-2 border-zinc-700">
          <NumberStepperField
            id="hk-vhis-insured-persons"
            label="VHIS Insured Persons"
            value={reliefs.vhisInsuredPersons ?? 0}
            onChange={(value) => {
              const nextPersons = clampCount(value, 10);
              const nextLimit =
                nextPersons * HK_DEDUCTIONS_2026.vhisPerInsuredPersonMax;
              onChange({
                ...reliefs,
                vhisInsuredPersons: nextPersons,
                vhisPremiums: clampAmount(
                  reliefs.vhisPremiums ?? 0,
                  nextLimit,
                ),
              });
            }}
            min={0}
            max={10}
            description="Premium cap is HKD 8,000 per insured person."
          />
          {vhisLimit > 0 && (
            <ContributionSlider
              label="VHIS Qualifying Premiums"
              value={Math.min(reliefs.vhisPremiums ?? 0, vhisLimit)}
              onChange={(value) =>
                updateRelief("vhisPremiums", clampAmount(value, vhisLimit))
              }
              max={vhisLimit}
              step={500}
              currency="HKD"
              description="Voluntary Health Insurance Scheme premiums for taxpayer or specified relatives."
            />
          )}
        </div>

        <div className="space-y-2 pl-4 border-l-2 border-zinc-700">
          <ContributionSlider
            label="Self-education Expenses"
            value={Math.min(
              reliefs.selfEducationExpenses,
              HK_DEDUCTIONS_2026.selfEducationMax,
            )}
            onChange={(value) =>
              updateRelief(
                "selfEducationExpenses",
                clampAmount(value, HK_DEDUCTIONS_2026.selfEducationMax),
              )
            }
            max={HK_DEDUCTIONS_2026.selfEducationMax}
            step={1000}
            currency="HKD"
          />
        </div>

        <div className="space-y-2 pl-4 border-l-2 border-zinc-700">
          <BooleanSelectField
            id="hk-home-loan-additional-ceiling"
            label="Additional Home Loan Ceiling"
            value={reliefs.hasHomeLoanInterestAdditionalCeiling ?? false}
            onChange={(checked) =>
              updateRelief("hasHomeLoanInterestAdditionalCeiling", checked)
            }
            description="Adds the IRD additional HKD 20,000 ceiling when eligible."
          />
          <ContributionSlider
            label="Home Loan Interest"
            value={Math.min(
              reliefs.homeLoanInterest ?? 0,
              HK_DEDUCTIONS_2026.homeLoanInterestMax +
                (reliefs.hasHomeLoanInterestAdditionalCeiling
                  ? HK_DEDUCTIONS_2026.homeLoanInterestAdditionalMax
                  : 0),
            )}
            onChange={(value) =>
              updateRelief(
                "homeLoanInterest",
                clampAmount(
                  value,
                  HK_DEDUCTIONS_2026.homeLoanInterestMax +
                    (reliefs.hasHomeLoanInterestAdditionalCeiling
                      ? HK_DEDUCTIONS_2026.homeLoanInterestAdditionalMax
                      : 0),
                ),
              )
            }
            max={
              HK_DEDUCTIONS_2026.homeLoanInterestMax +
              (reliefs.hasHomeLoanInterestAdditionalCeiling
                ? HK_DEDUCTIONS_2026.homeLoanInterestAdditionalMax
                : 0)
            }
            step={1000}
            currency="HKD"
          />
        </div>

        <div className="space-y-2 pl-4 border-l-2 border-zinc-700">
          <BooleanSelectField
            id="hk-domestic-rent-additional-ceiling"
            label="Additional Domestic Rent Ceiling"
            value={reliefs.hasDomesticRentAdditionalCeiling ?? false}
            onChange={(checked) =>
              updateRelief("hasDomesticRentAdditionalCeiling", checked)
            }
            description="Adds the IRD additional HKD 20,000 ceiling when eligible."
          />
          <ContributionSlider
            label="Domestic Rent"
            value={Math.min(
              reliefs.domesticRent ?? 0,
              HK_DEDUCTIONS_2026.domesticRentMax +
                (reliefs.hasDomesticRentAdditionalCeiling
                  ? HK_DEDUCTIONS_2026.domesticRentAdditionalMax
                  : 0),
            )}
            onChange={(value) =>
              updateRelief(
                "domesticRent",
                clampAmount(
                  value,
                  HK_DEDUCTIONS_2026.domesticRentMax +
                    (reliefs.hasDomesticRentAdditionalCeiling
                      ? HK_DEDUCTIONS_2026.domesticRentAdditionalMax
                      : 0),
                ),
              )
            }
            max={
              HK_DEDUCTIONS_2026.domesticRentMax +
              (reliefs.hasDomesticRentAdditionalCeiling
                ? HK_DEDUCTIONS_2026.domesticRentAdditionalMax
                : 0)
            }
            step={1000}
            currency="HKD"
          />
        </div>

        <div className="space-y-2 pl-4 border-l-2 border-zinc-700">
          <ContributionSlider
            label="Elderly Residential Care Expenses"
            value={Math.min(
              reliefs.elderlyResidentialCareExpenses,
              HK_DEDUCTIONS_2026.elderlyResidentialCareMax,
            )}
            onChange={(value) =>
              updateRelief(
                "elderlyResidentialCareExpenses",
                clampAmount(
                  value,
                  HK_DEDUCTIONS_2026.elderlyResidentialCareMax,
                ),
              )
            }
            max={HK_DEDUCTIONS_2026.elderlyResidentialCareMax}
            step={1000}
            currency="HKD"
          />
        </div>

        <div className="space-y-2 pl-4 border-l-2 border-zinc-700">
          <ContributionSlider
            label="Assisted Reproductive Service Expenses"
            value={Math.min(
              reliefs.assistedReproductiveServicesExpenses ?? 0,
              assistedReproductiveServicesLimit,
            )}
            onChange={(value) =>
              updateRelief(
                "assistedReproductiveServicesExpenses",
                clampAmount(value, assistedReproductiveServicesLimit),
              )
            }
            max={assistedReproductiveServicesLimit}
            step={1000}
            currency="HKD"
          />
        </div>

        <div className="space-y-2 pl-4 border-l-2 border-zinc-700">
          <ContributionSlider
            label="Approved Charitable Donations"
            description="Capped at 35% of net income"
            value={Math.min(reliefs.charitableDonations, charitableDonationLimit)}
            onChange={(value) =>
              updateRelief(
                "charitableDonations",
                clampAmount(value, charitableDonationLimit),
              )
            }
            max={charitableDonationLimit}
            step={5000}
            currency="HKD"
          />
        </div>
      </div>
    </div>
  );
}
