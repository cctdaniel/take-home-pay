"use client";

import {
  CalculatorFieldGrid,
  PayFrequencyField,
  SelectField,
  type SelectOption,
} from "@/components/calculator/calculator-fields";
import {
  CountryCalculatorExtensionShell,
  useCountryCalculatorExtension,
} from "@/components/calculator/country-extension";
import { InfoPanel } from "@/components/calculator/info-panel";
import { ContributionSlider } from "@/components/ui/contribution-slider";
import { MTCalculator } from "@/lib/countries/mt";
import {
  MALTA_RETIREMENT_TAX_CREDITS_2026,
  MALTA_TAX_STATUS_NAMES,
} from "@/lib/countries/mt/constants/tax-brackets-2026";
import type {
  MTCalculatorInputs,
  MTContributionInputs,
  MTLowIncomeSscOption,
  MTResidencyType,
  MTSSCBirthCohort,
  MTSchoolFeeLevel,
  MTTaxReliefInputs,
  MTTaxStatus,
} from "@/lib/countries/mt/types";
import { clampAmount } from "@/lib/utils";
import type { CountryCode } from "@/lib/countries/types";

const RESIDENCY_OPTIONS: SelectOption<MTResidencyType>[] = [
  { value: "resident", label: "Resident" },
  { value: "non_resident", label: "Non-resident" },
];

const TAX_STATUS_OPTIONS: SelectOption<MTTaxStatus>[] = [
  { value: "single", label: MALTA_TAX_STATUS_NAMES.single },
  { value: "married", label: MALTA_TAX_STATUS_NAMES.married },
  {
    value: "married_one_child",
    label: MALTA_TAX_STATUS_NAMES.married_one_child,
  },
  {
    value: "married_two_or_more_children",
    label: MALTA_TAX_STATUS_NAMES.married_two_or_more_children,
  },
  { value: "parent", label: MALTA_TAX_STATUS_NAMES.parent },
  {
    value: "parent_one_child",
    label: MALTA_TAX_STATUS_NAMES.parent_one_child,
  },
  {
    value: "parent_two_or_more_children",
    label: MALTA_TAX_STATUS_NAMES.parent_two_or_more_children,
  },
];

const SSC_COHORT_OPTIONS: SelectOption<MTSSCBirthCohort>[] = [
  { value: "born_1962_or_later", label: "Born from 1962 onwards" },
  { value: "born_before_1962", label: "Born up to 1961" },
];

const LOW_INCOME_SSC_OPTIONS: SelectOption<MTLowIncomeSscOption>[] = [
  { value: "standard", label: "Standard Category B" },
  { value: "pro_rata", label: "10% pro-rata option" },
];

const SCHOOL_LEVEL_OPTIONS: SelectOption<MTSchoolFeeLevel>[] = [
  { value: "none", label: "No school fees" },
  { value: "kindergarten", label: "Kindergarten" },
  { value: "primary", label: "Primary" },
  { value: "secondary", label: "Secondary" },
];

export default function MTCountryExtension({ country }: { country: CountryCode }) {
  const {
    inputs,
    setInputs,
    currency,
    result,
    setGrossSalary,
    setPayFrequency,
  } = useCountryCalculatorExtension<MTCalculatorInputs>(country);
  const limits = MTCalculator.getContributionLimits(inputs);
  const isResident = inputs.residencyType === "resident";

  const setContribution = (
    key: keyof MTContributionInputs,
    value: number,
  ) => {
    const max = limits[key]?.limit ?? 0;
    setInputs((current) => ({
      ...current,
      contributions: {
        ...current.contributions,
        [key]: clampAmount(value, 0, max),
      },
    }));
  };

  const setTaxRelief = (key: keyof MTTaxReliefInputs, value: number) => {
    const max = limits[key]?.limit ?? 0;
    setInputs((current) => ({
      ...current,
      taxReliefs: {
        ...current.taxReliefs,
        [key]: clampAmount(value, 0, max),
      },
    }));
  };

  const setSchoolLevel = (schoolLevel: MTSchoolFeeLevel) => {
    const nextLimit = MTCalculator.getContributionLimits({
      ...inputs,
      taxReliefs: { ...inputs.taxReliefs, schoolLevel },
    }).schoolFees?.limit ?? 0;

    setInputs((current) => ({
      ...current,
      taxReliefs: {
        ...current.taxReliefs,
        schoolLevel,
        schoolFees: clampAmount(current.taxReliefs.schoolFees, 0, nextLimit),
      },
    }));
  };

  const taxOptions = (
    <div className="space-y-4">
      <CalculatorFieldGrid columns={2}>
        <PayFrequencyField
          value={inputs.payFrequency}
          onChange={setPayFrequency}
          id="mt-pay-frequency"
        />
        <SelectField
          id="mt-residency-type"
          label="Tax Residency"
          value={inputs.residencyType}
          onChange={(residencyType) =>
            setInputs((current) => ({ ...current, residencyType }))
          }
          options={RESIDENCY_OPTIONS}
        />
      </CalculatorFieldGrid>

      <CalculatorFieldGrid columns={2}>
        <SelectField
          id="mt-tax-status"
          label="Resident Tax Schedule"
          value={inputs.taxStatus}
          onChange={(taxStatus) =>
            setInputs((current) => ({ ...current, taxStatus }))
          }
          options={TAX_STATUS_OPTIONS}
          description={
            isResident
              ? "New 2026 child bands require the official residency and child eligibility conditions."
              : "Ignored for non-resident rates."
          }
        />
        <SelectField
          id="mt-ssc-cohort"
          label="SSC Birth Cohort"
          value={inputs.sscBirthCohort}
          onChange={(sscBirthCohort) =>
            setInputs((current) => ({ ...current, sscBirthCohort }))
          }
          options={SSC_COHORT_OPTIONS}
          description="Class 1 weekly caps differ by birth cohort."
        />
      </CalculatorFieldGrid>

      <SelectField
        id="mt-low-income-ssc"
        label="Low-Income SSC Option"
        value={inputs.lowIncomeSscOption}
        onChange={(lowIncomeSscOption) =>
          setInputs((current) => ({ ...current, lowIncomeSscOption }))
        }
        options={LOW_INCOME_SSC_OPTIONS}
        description="Only affects Category B wages at or below EUR 229.44 per week."
      />
    </div>
  );

  const contributionControls = isResident ? (
    <div className="space-y-6">
      <ContributionSlider
        label="Personal Retirement Scheme"
        value={inputs.contributions.personalRetirementScheme}
        onChange={(value) =>
          setContribution("personalRetirementScheme", value)
        }
        max={limits.personalRetirementScheme?.limit ?? 0}
        step={100}
        currency={currency}
        description={`25% tax credit up to EUR ${MALTA_RETIREMENT_TAX_CREDITS_2026.personalRetirementScheme.maxCredit}.`}
      />
      <ContributionSlider
        label="Voluntary Occupational Pension"
        value={inputs.contributions.voluntaryOccupationalPension}
        onChange={(value) =>
          setContribution("voluntaryOccupationalPension", value)
        }
        max={limits.voluntaryOccupationalPension?.limit ?? 0}
        step={100}
        currency={currency}
        description={`25% tax credit up to EUR ${MALTA_RETIREMENT_TAX_CREDITS_2026.voluntaryOccupationalPension.maxCredit}.`}
      />

      <div className="border-t border-zinc-800 pt-5 space-y-5">
        <SelectField
          id="mt-school-level"
          label="Private School Level"
          value={inputs.taxReliefs.schoolLevel}
          onChange={setSchoolLevel}
          options={SCHOOL_LEVEL_OPTIONS}
          description="Choose the level to apply the official per-child fee cap."
        />
        {(limits.schoolFees?.limit ?? 0) > 0 && (
          <ContributionSlider
            label="Private School Fees"
            value={inputs.taxReliefs.schoolFees}
            onChange={(value) => setTaxRelief("schoolFees", value)}
            max={limits.schoolFees?.limit ?? 0}
            step={50}
            currency={currency}
            description="Deductible qualifying fees reduce chargeable income."
          />
        )}
        <ContributionSlider
          label="Private Childcare Fees"
          value={inputs.taxReliefs.childcareFees}
          onChange={(value) => setTaxRelief("childcareFees", value)}
          max={limits.childcareFees?.limit ?? 0}
          step={50}
          currency={currency}
          description="Per-child deduction for qualifying private childcare services."
        />
        <ContributionSlider
          label="Approved Sports Fees"
          value={inputs.taxReliefs.sportsFees}
          onChange={(value) => setTaxRelief("sportsFees", value)}
          max={limits.sportsFees?.limit ?? 0}
          step={25}
          currency={currency}
          description="Deduction for approved sports activities."
        />
        <ContributionSlider
          label="Creative or Cultural Course Fees"
          value={inputs.taxReliefs.culturalFees}
          onChange={(value) => setTaxRelief("culturalFees", value)}
          max={limits.culturalFees?.limit ?? 0}
          step={25}
          currency={currency}
          description="Deduction for approved creative or cultural courses."
        />
      </div>
    </div>
  ) : (
    <InfoPanel tone="warning" title="Resident reliefs excluded">
      PRS, voluntary occupational pension credits, and fee deductions are modeled
      for resident taxpayers only. Non-resident calculations use the MTCA
      non-resident tax rates and Class 1 SSC.
    </InfoPanel>
  );

  const infoCard = (
    <div className="space-y-3">
      <InfoPanel title="Malta assumptions">
        This calculator models ordinary Malta employment salary using 2026 MTCA
        tax bands and Class 1 adult employee SSC. Social security is deducted
        from pay but not from chargeable income; employer SSC and the Maternity
        Leave Fund are informational.
      </InfoPanel>
      <InfoPanel tone="warning" title="Excluded regimes">
        Nomad Residence Permit authorised work, special tax status programmes,
        part-time final tax, qualifying overtime, sports or artist final tax,
        under-18 and apprenticeship SSC categories, pension income exemptions,
        and foreign tax relief are outside this ordinary employment model.
      </InfoPanel>
    </div>
  );

  return (
    <CountryCalculatorExtensionShell
      country={country}
      currency={currency}
      grossSalary={inputs.grossSalary}
      onGrossSalaryChange={setGrossSalary}
      result={result}
      taxOptions={taxOptions}
      contributions={contributionControls}
      contributionsTitle="Tax Credits and Deductions"
      contributionsDescription="Modeled resident tax-saving inputs with official caps"
      infoCard={infoCard}
    />
  );
}
