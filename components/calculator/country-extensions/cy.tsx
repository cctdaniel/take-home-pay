"use client";

import {
  BooleanSelectField,
  CalculatorFieldGrid,
  NumberStepperField,
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
  CYEmploymentExemption,
  CYFamilyStatus,
  CYResidencyType,
} from "@/lib/countries/cy/types";
import type { ContributionLimits, PayFrequency } from "@/lib/countries/types";
import { formatCurrency } from "@/lib/format";

const RESIDENCY_OPTIONS: Array<{ value: CYResidencyType; label: string }> = [
  { value: "resident", label: "Cyprus Resident" },
  { value: "non_resident", label: "Non-Resident" },
];

const FAMILY_STATUS_OPTIONS: Array<{ value: CYFamilyStatus; label: string }> = [
  { value: "single", label: "Single" },
  { value: "married", label: "Married / Civil Partner" },
  { value: "single_parent", label: "Single Parent" },
];

const EMPLOYMENT_EXEMPTION_OPTIONS: Array<{
  value: CYEmploymentExemption;
  label: string;
}> = [
  { value: "none", label: "No First-Employment Exemption" },
  { value: "article_8_21a_20", label: "Article 8(21A) 20%" },
  { value: "article_8_23a_50", label: "Article 8(23A) 50%" },
];

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) {
    return min;
  }

  return Math.min(Math.max(value, min), max);
}

function getLimit(limits: ContributionLimits, key: string): number {
  return limits[key]?.limit ?? 0;
}

function clampCyInputs(inputs: CYCalculatorInputs): CYCalculatorInputs {
  const limits = CYCalculator.getContributionLimits(inputs);

  return {
    ...inputs,
    contributions: {
      approvedPensionProvidentFund: clamp(
        inputs.contributions.approvedPensionProvidentFund,
        0,
        getLimit(limits, "approvedPensionProvidentFund"),
      ),
      medicalFundContribution: clamp(
        inputs.contributions.medicalFundContribution,
        0,
        getLimit(limits, "medicalFundContribution"),
      ),
      homeInsurancePremium: clamp(
        inputs.contributions.homeInsurancePremium,
        0,
        getLimit(limits, "homeInsurancePremium"),
      ),
      primaryResidenceDeduction: clamp(
        inputs.contributions.primaryResidenceDeduction,
        0,
        getLimit(limits, "primaryResidenceDeduction"),
      ),
      greenTransitionExpense: clamp(
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
  onEmploymentExemptionChange,
}: {
  inputs: CYCalculatorInputs;
  onPayFrequencyChange: (value: PayFrequency) => void;
  onResidencyTypeChange: (value: CYResidencyType) => void;
  onFamilyStatusChange: (value: CYFamilyStatus) => void;
  onDependentChildrenChange: (value: number) => void;
  onFamilyIncomeCriteriaChange: (value: boolean) => void;
  onEmploymentExemptionChange: (value: CYEmploymentExemption) => void;
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
      <SelectField
        id="cy-employment-exemption"
        label="First-Employment Exemption"
        value={inputs.employmentExemption ?? "none"}
        onChange={onEmploymentExemptionChange}
        options={EMPLOYMENT_EXEMPTION_OPTIONS}
        description="Select only if you meet the Cyprus Article 8 eligibility tests"
      />
      <NumberStepperField
        id="cy-dependent-children"
        label="Dependent Children"
        value={inputs.taxReliefs.numberOfDependentChildren}
        onChange={onDependentChildrenChange}
        min={0}
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
  const medicalFundLimit = getLimit(limits, "medicalFundContribution");
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

      <ContributionSlider
        label="Approved Medical Fund Contribution"
        description="Modeled at up to 2% of gross salary; deductible amount is also limited by the TD59 aggregate cap."
        value={inputs.contributions.medicalFundContribution}
        onChange={(value) => onContributionChange("medicalFundContribution", value)}
        max={medicalFundLimit}
        step={50}
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
          onEmploymentExemptionChange={(employmentExemption) =>
            updateInputs((current) => ({ ...current, employmentExemption }))
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
      seoInfo={<CYTaxInfo />}
      infoCard={
        <InfoPanel title="Modeled Scope">
          Social Insurance is capped at {formatCurrency(5_742, currency)} per
          month and GHS at {formatCurrency(180_000, currency)} of annual income.
          Article 8 first-employment exemptions are user-selected and do not
          reduce Social Insurance or GHS. Life-insurance capital-sum limits,
          overseas employment exemptions, and plan-specific approved fund rules
          are not modeled.
        </InfoPanel>
      }
    />
  );
}

function CYTaxInfoContent() {
  return (
    <div>
      <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">Cyprus</h3>
      <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
        <li><strong className="text-zinc-300">Income Tax</strong> – chargeable income is taxed with Cyprus progressive bands from 0% to 35%.</li>
        <li><strong className="text-zinc-300">Social Insurance</strong> – employee Social Insurance is modeled at 8.8% up to the annual insurable earnings ceiling.</li>
        <li><strong className="text-zinc-300">GeSY / GHS</strong> – employee healthcare contribution is modeled at 2.65% up to the annual GHS income ceiling.</li>
        <li><strong className="text-zinc-300">Article 8 Employment Exemptions</strong> – first-employment 20% and 50% exemptions are selectable when the taxpayer meets the Cyprus eligibility tests.</li>
        <li><strong className="text-zinc-300">Approved Funds</strong> – approved pension, provident, and medical-fund contributions are modeled and limited by their contribution caps and the aggregate deduction cap.</li>
        <li><strong className="text-zinc-300">Resident Reliefs</strong> – home insurance, dependent child, primary residence, and green-transition deductions apply where the resident/family-income rules in the calculator allow them.</li>
      </ul>
      <p className="text-zinc-400 text-sm mt-3">Net salary subtracts income tax, Social Insurance, GeSY, and cash approved-fund contributions. Special Defence Contribution, capital income, overseas-employment exemptions, life-insurance capital-sum tests, and plan-specific approved-fund eligibility need separate facts.</p>
    </div>
  );
}

function CYTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="mb-4 text-xl font-semibold text-zinc-200">
        How Cyprus Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <CYTaxInfoContent />
      </div>
    </section>
  );
}
