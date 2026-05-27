"use client";

import {
  BooleanSelectField,
  CalculatorFieldGrid,
  NumberStepperField,
  PayFrequencyField,
  SelectField,
} from "@/components/calculator/calculator-fields";
import {
  CountryCalculatorExtensionShell,
  useCountryCalculatorExtension,
  type CountryCalculatorExtensionProps,
} from "@/components/calculator/country-extension";
import { InfoPanel } from "@/components/calculator/info-panel";
import { ContributionSlider } from "@/components/ui/contribution-slider";
import { getCountryCalculator } from "@/lib/countries/registry";
import {
  CW_CHILD_ALLOWANCE_CATEGORY_I,
  CW_CHILD_ALLOWANCE_CATEGORY_II,
  CW_CHILD_ALLOWANCE_CATEGORY_III,
  CW_CHILD_ALLOWANCE_CATEGORY_IV,
  CW_ELDERLY_ALLOWANCE,
  CW_SINGLE_EARNER_ALLOWANCE,
  CW_TRANSFERRED_ELDERLY_ALLOWANCE,
} from "@/lib/countries/cw/constants/tax-year-2026";
import type {
  CWCalculatorInputs,
  CWContributionInputs,
  CWTaxResidencyType,
} from "@/lib/countries/cw/types";

function clampAmount(value: number, max: number) {
  return Math.min(Math.max(0, value), Math.max(0, max));
}

export default function CWCountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const {
    inputs,
    currency,
    result,
    setGrossSalary,
    setPayFrequency,
    setInputs,
  } = useCountryCalculatorExtension<CWCalculatorInputs>(country);
  const contributionLimits =
    getCountryCalculator(country).getContributionLimits(inputs);
  const providentFundLimit =
    contributionLimits.retirementContribution?.limit ?? 0;
  const isResident = inputs.taxResidency === "resident";

  const setContribution = (
    key: keyof CWContributionInputs,
    amount: number,
  ) => {
    const limit = contributionLimits[key]?.limit ?? 0;

    setInputs((current) => ({
      ...current,
      contributions: {
        ...current.contributions,
        [key]: clampAmount(amount, limit),
      },
    }));
  };

  return (
    <CountryCalculatorExtensionShell
      country={country}
      currency={currency}
      grossSalary={inputs.grossSalary}
      onGrossSalaryChange={setGrossSalary}
      result={result}
      taxOptions={
        <CalculatorFieldGrid columns={3}>
          <PayFrequencyField
            id="cw-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
          <SelectField
            id="cw-tax-residency"
            label="Wage-Tax Status"
            value={inputs.taxResidency}
            onChange={(taxResidency: CWTaxResidencyType) =>
              setInputs((current) => ({
                ...current,
                taxResidency,
                isMarriedSingleEarner:
                  taxResidency === "resident"
                    ? current.isMarriedSingleEarner
                    : false,
                isAge60OrOlder:
                  taxResidency === "resident" ? current.isAge60OrOlder : false,
                hasTransferredElderlyAllowance:
                  taxResidency === "resident"
                    ? current.hasTransferredElderlyAllowance
                    : false,
                childAllowanceCategoryI:
                  taxResidency === "resident"
                    ? current.childAllowanceCategoryI
                    : 0,
                childAllowanceCategoryII:
                  taxResidency === "resident"
                    ? current.childAllowanceCategoryII
                    : 0,
                childAllowanceCategoryIII:
                  taxResidency === "resident"
                    ? current.childAllowanceCategoryIII
                    : 0,
                childAllowanceCategoryIV:
                  taxResidency === "resident"
                    ? current.childAllowanceCategoryIV
                    : 0,
              }))
            }
            options={[
              { value: "resident", label: "Resident on 1 January" },
              { value: "foreign_taxpayer", label: "Foreign taxpayer" },
            ]}
            description={
              isResident
                ? "Resident wage-tax credits and social premiums are applied."
                : "Resident credits and Curaçao resident social premiums are not applied."
            }
          />
          {isResident ? (
            <>
              <BooleanSelectField
                id="cw-single-earner"
                label="Single-Earner Allowance"
                value={inputs.isMarriedSingleEarner}
                onChange={(isMarriedSingleEarner) =>
                  setInputs((current) => ({
                    ...current,
                    isMarriedSingleEarner,
                  }))
                }
                trueLabel={`Claim ANG ${CW_SINGLE_EARNER_ALLOWANCE.toLocaleString()}`}
                falseLabel="No"
                description="For a resident married taxpayer whose spouse has no taxable income."
              />
              <BooleanSelectField
                id="cw-elderly"
                label="Elderly Allowance"
                value={inputs.isAge60OrOlder}
                onChange={(isAge60OrOlder) =>
                  setInputs((current) => ({ ...current, isAge60OrOlder }))
                }
                trueLabel={`Claim ANG ${CW_ELDERLY_ALLOWANCE.toLocaleString()}`}
                falseLabel="No"
                description="For residents age 60 or older at the start of the year."
              />
              <BooleanSelectField
                id="cw-transferred-elderly"
                label="Transferred Elderly Allowance"
                value={inputs.hasTransferredElderlyAllowance}
                onChange={(hasTransferredElderlyAllowance) =>
                  setInputs((current) => ({
                    ...current,
                    hasTransferredElderlyAllowance,
                  }))
                }
                trueLabel={`Claim ANG ${CW_TRANSFERRED_ELDERLY_ALLOWANCE.toLocaleString()}`}
                falseLabel="No"
                description="For a qualifying unused spouse elderly allowance transfer."
              />
              <NumberStepperField
                id="cw-child-category-i"
                label="Child Allowance Cat. I"
                value={inputs.childAllowanceCategoryI}
                onChange={(childAllowanceCategoryI) =>
                  setInputs((current) => ({
                    ...current,
                    childAllowanceCategoryI,
                  }))
                }
                min={0}
                max={10}
                description={`Foreign study children aged 16-26: ANG ${CW_CHILD_ALLOWANCE_CATEGORY_I.toLocaleString()} each.`}
              />
              <NumberStepperField
                id="cw-child-category-ii"
                label="Child Allowance Cat. II"
                value={inputs.childAllowanceCategoryII}
                onChange={(childAllowanceCategoryII) =>
                  setInputs((current) => ({
                    ...current,
                    childAllowanceCategoryII,
                  }))
                }
                min={0}
                max={10}
                description={`Curaçao higher-education children aged 16-26: ANG ${CW_CHILD_ALLOWANCE_CATEGORY_II.toLocaleString()} each.`}
              />
              <NumberStepperField
                id="cw-child-category-iii"
                label="Child Allowance Cat. III"
                value={inputs.childAllowanceCategoryIII}
                onChange={(childAllowanceCategoryIII) =>
                  setInputs((current) => ({
                    ...current,
                    childAllowanceCategoryIII,
                  }))
                }
                min={0}
                max={10}
                description={`Other household education or vocational children aged 16-26: ANG ${CW_CHILD_ALLOWANCE_CATEGORY_III.toLocaleString()} each.`}
              />
              <NumberStepperField
                id="cw-child-category-iv"
                label="Child Allowance Cat. IV"
                value={inputs.childAllowanceCategoryIV}
                onChange={(childAllowanceCategoryIV) =>
                  setInputs((current) => ({
                    ...current,
                    childAllowanceCategoryIV,
                  }))
                }
                min={0}
                max={10}
                description={`Household children under 16: ANG ${CW_CHILD_ALLOWANCE_CATEGORY_IV.toLocaleString()} each.`}
              />
            </>
          ) : null}
        </CalculatorFieldGrid>
      }
      contributions={
        providentFundLimit > 0 ? (
          <ContributionSlider
            label={
              contributionLimits.retirementContribution?.name ??
              "Savings or provident fund contribution"
            }
            value={Math.min(
              inputs.contributions.retirementContribution ?? 0,
              providentFundLimit,
            )}
            onChange={(amount) =>
              setContribution("retirementContribution", amount)
            }
            max={providentFundLimit}
            step={Math.max(1, Math.round(providentFundLimit / 100))}
            currency={currency}
            description={
              contributionLimits.retirementContribution?.description ??
              "Deductible savings or provident-fund contribution."
            }
          />
        ) : undefined
      }
      contributionsTitle="Curacao Provident-Fund Deduction"
      contributionsDescription="Modeled employee savings or provident-fund deduction from Curacao wage-tax guidance"
      seoInfo={<CuracaoTaxInfo />}
      infoCard={
        <InfoPanel title="Modeled Scope">
          <p>
            This models Curacao salary with the 2026 fixed-base income tax
            table, resident wage-tax credits and allowances where selected, the
            fixed employment expense deduction, and resident employee AOV/AWW,
            BVZ, and AVBZ premiums.
          </p>
          <p className="mt-2">
            Double child allowance or transferred child allowance claims,
            illness or accident insurance variations, pension-plan-specific
            premiums beyond the modeled provident-fund cap, treaty exemptions,
            and non-wage income are not exposed as salary-only inputs without
            household or plan details.
          </p>
        </InfoPanel>
      }
    />
  );
}

function CuracaoTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="mb-4 text-xl font-semibold text-zinc-200">
        How Curacao Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <ul className="mt-3 list-inside list-disc space-y-1 text-zinc-400">
          <li>
            <strong className="text-zinc-300">Income Tax</strong> uses the
            official 2026 fixed-base table and resident wage-tax credits where
            selected.
          </li>
          <li>
            <strong className="text-zinc-300">Resident Allowances</strong>{" "}
            include the basic tax credit, single-earner allowance, child
            allowance categories, elderly allowance, and transferred elderly
            allowance from the 2026 wage-tax declaration.
          </li>
          <li>
            <strong className="text-zinc-300">Payroll Premiums</strong> include
            AOV/AWW, BVZ, and AVBZ employee premiums using published wage
            ceilings.
          </li>
          <li>
            <strong className="text-zinc-300">Provident Fund</strong> is
            deductible up to the modeled ANG 840 wage-tax cap.
          </li>
        </ul>
      </div>
    </section>
  );
}
