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
  MALTA_HIGHLY_SKILLED_INDIVIDUALS_2026,
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
  MTTaxScenario,
  MTTaxStatus,
} from "@/lib/countries/mt/types";
import type { CountryCode } from "@/lib/countries/types";

const RESIDENCY_OPTIONS: SelectOption<MTResidencyType>[] = [
  { value: "resident", label: "Resident" },
  { value: "non_resident", label: "Non-resident" },
];

const TAX_SCENARIO_OPTIONS: SelectOption<MTTaxScenario>[] = [
  { value: "ordinary_employment", label: "Ordinary Malta employment" },
  {
    value: "highly_skilled_15_percent",
    label: "Highly Skilled Individuals - 15%",
  },
  {
    value: "nomad_first_12_months",
    label: "Nomad authorised work - first 12 months",
  },
  { value: "nomad_10_percent", label: "Nomad authorised work - 10%" },
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

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

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
  const taxScenario = inputs.taxScenario ?? "ordinary_employment";
  const isNomadScenario =
    taxScenario === "nomad_first_12_months" ||
    taxScenario === "nomad_10_percent";
  const isHighlySkilledScenario = taxScenario === "highly_skilled_15_percent";
  const isSpecialFlatScenario = isNomadScenario || isHighlySkilledScenario;
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
        [key]: clamp(value, 0, max),
      },
    }));
  };

  const setTaxRelief = (key: keyof MTTaxReliefInputs, value: number) => {
    const max = limits[key]?.limit ?? 0;
    setInputs((current) => ({
      ...current,
      taxReliefs: {
        ...current.taxReliefs,
        [key]: clamp(value, 0, max),
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
        schoolFees: clamp(current.taxReliefs.schoolFees, 0, nextLimit),
      },
    }));
  };

  const taxOptions = (
    <div className="space-y-4">
      <CalculatorFieldGrid columns={2}>
        <SelectField
          id="mt-tax-scenario"
          label="Tax Scenario"
          value={taxScenario}
          onChange={(nextTaxScenario: MTTaxScenario) =>
            setInputs((current) => ({
              ...current,
              taxScenario: nextTaxScenario,
              contributions:
                nextTaxScenario === "ordinary_employment"
                  ? current.contributions
                  : {
                      personalRetirementScheme: 0,
                      voluntaryOccupationalPension: 0,
                    },
              taxReliefs:
                nextTaxScenario === "ordinary_employment"
                  ? current.taxReliefs
                  : {
                      ...current.taxReliefs,
                      schoolFees: 0,
                      childcareFees: 0,
                      sportsFees: 0,
                      culturalFees: 0,
                    },
            }))
          }
          options={TAX_SCENARIO_OPTIONS}
          description={
            isHighlySkilledScenario
              ? `For formally eligible non-domiciled highly skilled employees. The 15% option requires at least EUR ${MALTA_HIGHLY_SKILLED_INDIVIDUALS_2026.minimumIncome.toLocaleString()} qualifying employment income and does not allow ordinary deductions or credits.`
              : isNomadScenario
                ? "Nomad scenarios apply only to eligible main applicants with authorised foreign-employer or foreign-client work."
                : "Applies the ordinary Malta resident or non-resident employment tax bands and adult Class 1 SSC."
          }
        />
        <PayFrequencyField
          value={inputs.payFrequency}
          onChange={setPayFrequency}
          id="mt-pay-frequency"
        />
      </CalculatorFieldGrid>

      {isHighlySkilledScenario &&
        inputs.grossSalary < MALTA_HIGHLY_SKILLED_INDIVIDUALS_2026.minimumIncome && (
          <InfoPanel tone="warning" title="HSI Threshold Not Met">
            The Highly Skilled Individuals 15% rate is modeled only once annual
            employment income reaches EUR{" "}
            {MALTA_HIGHLY_SKILLED_INDIVIDUALS_2026.minimumIncome.toLocaleString()}.
            Below that threshold, the calculation falls back to ordinary Malta
            rates without applying resident deductions or tax credits.
          </InfoPanel>
        )}

      {!isNomadScenario && (
        <>
          <CalculatorFieldGrid columns={2}>
            <SelectField
              id="mt-residency-type"
              label="Tax Residency"
              value={inputs.residencyType}
              onChange={(residencyType) =>
                setInputs((current) => ({ ...current, residencyType }))
              }
              options={RESIDENCY_OPTIONS}
            />
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
          </CalculatorFieldGrid>

          <CalculatorFieldGrid columns={2}>
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
          </CalculatorFieldGrid>
        </>
      )}
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
      <InfoPanel tone="warning" title="Separate regimes">
        Nomad Residence Permit authorised work is modeled as a separate
        scenario for eligible main applicants. The Highly Skilled Individuals
        15% employment-income regime is modeled as a separate scenario for
        formally eligible non-domiciled employees under Legal Notice 20 of 2026.
        Part-time final tax, qualifying overtime, sports or artist final tax,
        under-18 and apprenticeship SSC categories, pension income exemptions,
        foreign tax relief, and Maltese social-security registration for
        self-employed or voluntary cases need separate inputs.
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
      contributions={isSpecialFlatScenario ? undefined : contributionControls}
      contributionsTitle="Tax Credits and Deductions"
      contributionsDescription={
        isSpecialFlatScenario
          ? "Selected special flat-rate scenarios do not use ordinary employment deductions"
          : "Modeled resident relief inputs with official caps"
      }
      contributionsEmptyState={
        isSpecialFlatScenario
          ? isHighlySkilledScenario
            ? "Highly Skilled Individuals 15% taxation is modeled without ordinary reliefs, deductions, reductions, credits, or set-offs, matching the Legal Notice 20 of 2026 treatment; ordinary reliefs require separate ordinary-tax facts."
            : "Nomad authorised work is modeled as a flat income-tax scenario. Ordinary PRS, occupational pension, and fee deductions are not applied and require separate ordinary-employment facts."
          : undefined
      }
      seoInfo={<MTTaxInfo />}
      infoCard={infoCard}
    />
  );
}

function MTTaxInfoContent() {
  return (
    <div>
      <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">Malta</h3>
      <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
        <li><strong className="text-zinc-300">Tax Status</strong> – resident schedules vary by selected status, including single, married, parent, and children variants; non-residents use the non-resident schedule.</li>
        <li><strong className="text-zinc-300">Class 1 SSC</strong> – employee social security is modeled by age/cohort and weekly wage category, with employer SSC and maternity fund shown separately.</li>
        <li><strong className="text-zinc-300">Retirement Credits</strong> – personal retirement scheme and voluntary occupational pension contributions can generate resident-only tax credits within modeled caps.</li>
        <li><strong className="text-zinc-300">Fee Deductions</strong> – qualifying school, childcare, sports, and cultural fees are modeled for eligible resident cases.</li>
        <li><strong className="text-zinc-300">Employment Deduction</strong> – the modeled employment income deduction applies where the calculator&apos;s income/status conditions are met.</li>
        <li><strong className="text-zinc-300">Special Employment Scenarios</strong> – Nomad Residence Permit authorised work and the Highly Skilled Individuals 15% employment-income regime are selectable scenarios.</li>
      </ul>
      <p className="text-zinc-400 text-sm mt-3">Net salary subtracts final income tax, employee SSC where applicable, and eligible cash retirement contributions. Part-time final tax, qualifying overtime, under-18 or apprentice SSC categories, pension income exemptions, foreign tax relief, and permanent-resident or returned-migrant statuses need separate inputs.</p>
    </div>
  );
}

function MTTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="mb-4 text-xl font-semibold text-zinc-200">
        How Malta Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <MTTaxInfoContent />
      </div>
    </section>
  );
}
