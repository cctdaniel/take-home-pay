"use client";

import {
  BooleanSelectField,
  CalculatorFieldGrid,
  CountStepperField,
  PayFrequencyField,
  SelectField,
} from "@/components/calculator/calculator-fields";
import {
  type CountryCalculatorExtensionProps,
  CountryCalculatorExtensionShell,
  useCountryCalculatorExtension,
} from "@/components/calculator/country-extension";
import { InfoPanel } from "@/components/calculator/info-panel";
import { ContributionSlider } from "@/components/ui/contribution-slider";
import { CYCalculator } from "@/lib/countries/cy";
import type {
  CYCalculatorInputs,
  CYFamilyStatus,
  CYResidencyType,
} from "@/lib/countries/cy/types";
import type { ContributionLimits, PayFrequency } from "@/lib/countries/types";
import { formatCurrency } from "@/lib/format";
import { clampAmount } from "@/lib/utils";

const RESIDENCY_OPTIONS: Array<{ value: CYResidencyType; label: string }> = [
  { value: "resident", label: "Cyprus Resident" },
  { value: "non_resident", label: "Non-Resident" },
];

const FAMILY_STATUS_OPTIONS: Array<{ value: CYFamilyStatus; label: string }> = [
  { value: "single", label: "Single" },
  { value: "married", label: "Married / Civil Partner" },
  { value: "single_parent", label: "Single Parent" },
];

function getLimit(limits: ContributionLimits, key: string): number {
  return limits[key]?.limit ?? 0;
}

function clampCyInputs(inputs: CYCalculatorInputs): CYCalculatorInputs {
  const limits = CYCalculator.getContributionLimits(inputs);

  return {
    ...inputs,
    contributions: {
      approvedPensionProvidentFund: clampAmount(
        inputs.contributions.approvedPensionProvidentFund,
        0,
        getLimit(limits, "approvedPensionProvidentFund"),
      ),
      homeInsurancePremium: clampAmount(
        inputs.contributions.homeInsurancePremium,
        0,
        getLimit(limits, "homeInsurancePremium"),
      ),
      primaryResidenceDeduction: clampAmount(
        inputs.contributions.primaryResidenceDeduction,
        0,
        getLimit(limits, "primaryResidenceDeduction"),
      ),
      greenTransitionExpense: clampAmount(
        inputs.contributions.greenTransitionExpense,
        0,
        getLimit(limits, "greenTransitionExpense"),
      ),
    },
  };
}

function CYTaxOptions({
  inputs,
  onPayFrequencyChange,
  onResidencyTypeChange,
  onFamilyStatusChange,
  onDependentChildrenChange,
  onFamilyIncomeCriteriaChange,
}: {
  inputs: CYCalculatorInputs;
  onPayFrequencyChange: (value: PayFrequency) => void;
  onResidencyTypeChange: (value: CYResidencyType) => void;
  onFamilyStatusChange: (value: CYFamilyStatus) => void;
  onDependentChildrenChange: (value: number) => void;
  onFamilyIncomeCriteriaChange: (value: boolean) => void;
}) {
  return (
    <CalculatorFieldGrid columns={3}>
      <SelectField
        id="cy-residency-type"
        label="Tax Residency"
        value={inputs.residencyType}
        onChange={onResidencyTypeChange}
        options={RESIDENCY_OPTIONS}
      />
      <SelectField
        id="cy-family-status"
        label="Family Status"
        value={inputs.taxReliefs.familyStatus}
        onChange={onFamilyStatusChange}
        options={FAMILY_STATUS_OPTIONS}
        description="Used for resident TD59 child and housing reliefs"
      />
      <PayFrequencyField
        id="cy-pay-frequency"
        value={inputs.payFrequency}
        onChange={onPayFrequencyChange}
      />
      <CountStepperField
        spanColumns={3}
        id="cy-dependent-children"
        label="Dependent Children"
        value={inputs.taxReliefs.numberOfDependentChildren}
        onChange={onDependentChildrenChange}
        max={8}
        description="TD59 child deduction uses official child order amounts"
      />
      <BooleanSelectField
        id="cy-family-income-criteria"
        label="Family Income Criteria"
        value={inputs.taxReliefs.meetsFamilyIncomeCriteria}
        onChange={onFamilyIncomeCriteriaChange}
        trueLabel="Eligible"
        falseLabel="Over Threshold"
        trueFirst
        description="Applies to child, primary residence, and green deductions"
      />
    </CalculatorFieldGrid>
  );
}

function CYDeductionOptions({
  inputs,
  limits,
  onContributionChange,
}: {
  inputs: CYCalculatorInputs;
  limits: ContributionLimits;
  onContributionChange: (
    key: keyof CYCalculatorInputs["contributions"],
    value: number,
  ) => void;
}) {
  const pensionLimit = getLimit(limits, "approvedPensionProvidentFund");
  const homeInsuranceLimit = getLimit(limits, "homeInsurancePremium");
  const primaryResidenceLimit = getLimit(limits, "primaryResidenceDeduction");
  const greenLimit = getLimit(limits, "greenTransitionExpense");
  const hasResidentRelief = primaryResidenceLimit > 0 || greenLimit > 0;

  return (
    <div className="space-y-6">
      <ContributionSlider
        label="Approved Pension / Provident Fund"
        description="Modeled at up to 10% of gross remuneration; tax deduction is also limited by the TD59 aggregate cap."
        value={inputs.contributions.approvedPensionProvidentFund}
        onChange={(value) =>
          onContributionChange("approvedPensionProvidentFund", value)
        }
        max={pensionLimit}
        step={100}
        currency="EUR"
      />

      {homeInsuranceLimit > 0 && (
        <ContributionSlider
          label="Home Insurance for Natural Disasters"
          description="TD59 deduction for qualifying home insurance, capped at EUR 500."
          value={inputs.contributions.homeInsurancePremium}
          onChange={(value) => onContributionChange("homeInsurancePremium", value)}
          max={homeInsuranceLimit}
          step={25}
          currency="EUR"
        />
      )}

      {hasResidentRelief ? (
        <>
          <ContributionSlider
            label="Primary Residence Rent or Loan Interest"
            description="Qualifying primary-residence rent or serviced housing-loan interest."
            value={inputs.contributions.primaryResidenceDeduction}
            onChange={(value) =>
              onContributionChange("primaryResidenceDeduction", value)
            }
            max={primaryResidenceLimit}
            step={100}
            currency="EUR"
          />
          <ContributionSlider
            label="Green Upgrade or Electric Vehicle"
            description="Qualifying energy upgrades, renewable systems, storage batteries, or electric vehicles."
            value={inputs.contributions.greenTransitionExpense}
            onChange={(value) =>
              onContributionChange("greenTransitionExpense", value)
            }
            max={greenLimit}
            step={100}
            currency="EUR"
          />
        </>
      ) : (
        <InfoPanel title="Resident Reliefs" tone="warning">
          Primary residence and green-transition deductions require Cyprus tax
          residency and the official family income criteria to be met.
        </InfoPanel>
      )}
    </div>
  );
}

export default function CYCountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const { inputs, setInputs, currency, result } =
    useCountryCalculatorExtension<CYCalculatorInputs>(country);
  const limits = CYCalculator.getContributionLimits(inputs);

  const updateInputs = (updater: (current: CYCalculatorInputs) => CYCalculatorInputs) => {
    setInputs((current) => clampCyInputs(updater(current)));
  };

  return (
    <CountryCalculatorExtensionShell
      country={country}
      currency={currency}
      grossSalary={inputs.grossSalary}
      onGrossSalaryChange={(grossSalary) =>
        updateInputs((current) => ({ ...current, grossSalary }))
      }
      result={result}
      taxOptions={
        <CYTaxOptions
          inputs={inputs}
          onPayFrequencyChange={(payFrequency) =>
            updateInputs((current) => ({ ...current, payFrequency }))
          }
          onResidencyTypeChange={(residencyType) =>
            updateInputs((current) => ({ ...current, residencyType }))
          }
          onFamilyStatusChange={(familyStatus) =>
            updateInputs((current) => ({
              ...current,
              taxReliefs: { ...current.taxReliefs, familyStatus },
            }))
          }
          onDependentChildrenChange={(numberOfDependentChildren) =>
            updateInputs((current) => ({
              ...current,
              taxReliefs: {
                ...current.taxReliefs,
                numberOfDependentChildren,
              },
            }))
          }
          onFamilyIncomeCriteriaChange={(meetsFamilyIncomeCriteria) =>
            updateInputs((current) => ({
              ...current,
              taxReliefs: {
                ...current.taxReliefs,
                meetsFamilyIncomeCriteria,
              },
            }))
          }
        />
      }
      contributions={
        <CYDeductionOptions
          inputs={inputs}
          limits={limits}
          onContributionChange={(key, value) =>
            updateInputs((current) => ({
              ...current,
              contributions: {
                ...current.contributions,
                [key]: value,
              },
            }))
          }
        />
      }
      contributionsTitle="Cyprus Deductions"
      contributionsDescription="Modeled TD59 deductions for ordinary salaried employment"
      infoCard={
        <InfoPanel title="Modeled Scope">
          Social Insurance is capped at {formatCurrency(5_742, currency)} per
          month and GHS at {formatCurrency(180_000, currency)} of annual income.
          First-employment exemptions, life-insurance capital-sum limits,
          medical funds, and plan-specific approved fund rules are not modeled.
        </InfoPanel>
      }
    />
  );
}
