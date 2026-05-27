"use client";

import {
  BooleanSelectField,
  CalculatorFieldGrid,
  CurrencyAmountField,
  NumberField,
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
import {
  IT_FAMILY_CREDIT_LIMITS_2026,
  IT_LOCAL_ADD_ON_RATE_LIMITS_2026,
} from "@/lib/countries/it/constants/tax-year-2026";
import { getCountryCalculator } from "@/lib/countries/registry";
import type {
  ITCalculatorInputs,
  ITChildCreditShare,
  ITImpatriateRegime,
} from "@/lib/countries/it/types";

export default function ITCountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const {
    inputs,
    currency,
    result,
    setGrossSalary,
    setPayFrequency,
    setInputs,
  } = useCountryCalculatorExtension<ITCalculatorInputs>(country);
  const contributionLimits =
    getCountryCalculator(country).getContributionLimits(inputs);
  const pensionContributionLimit = contributionLimits.pensionContribution.limit;
  const updateInputs = (nextInputs: Partial<ITCalculatorInputs>) => {
    setInputs((current) => ({
      ...current,
      ...nextInputs,
      localAddOnRate:
        nextInputs.localAddOnRate === undefined
          ? current.localAddOnRate
          : Math.min(
              Math.max(
                nextInputs.localAddOnRate,
                IT_LOCAL_ADD_ON_RATE_LIMITS_2026.minRate,
              ),
              IT_LOCAL_ADD_ON_RATE_LIMITS_2026.maxRate,
            ),
      eligibleChildren:
        nextInputs.eligibleChildren === undefined
          ? current.eligibleChildren
          : Math.min(Math.max(Math.trunc(nextInputs.eligibleChildren), 0), 20),
      cohabitingAscendants:
        nextInputs.cohabitingAscendants === undefined
          ? current.cohabitingAscendants
          : Math.min(
              Math.max(Math.trunc(nextInputs.cohabitingAscendants), 0),
              20,
            ),
      ascendantCreditSharePercent:
        nextInputs.ascendantCreditSharePercent === undefined
          ? current.ascendantCreditSharePercent
          : Math.min(
              Math.max(nextInputs.ascendantCreditSharePercent, 0),
              100,
            ),
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
        <CalculatorFieldGrid columns={2}>
          <PayFrequencyField
            id="it-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
          <CurrencyAmountField
            id="it-taxable-fringe-benefits"
            label="Taxable Fringe Benefits"
            value={inputs.taxableFringeBenefits}
            onChange={(taxableFringeBenefits) =>
              updateInputs({
                taxableFringeBenefits: Math.max(0, taxableFringeBenefits),
              })
            }
            currency={currency}
            step={100}
            description="Enter the taxable annual value after Article 51 exemptions and valuation rules; it increases IRPEF and INPS bases but is not cash salary."
          />
          <NumberField
            id="it-local-add-on-rate"
            label="Regional/Municipal Add-on Rate (%)"
            value={Number((inputs.localAddOnRate * 100).toFixed(2))}
            min={IT_LOCAL_ADD_ON_RATE_LIMITS_2026.minRate * 100}
            max={IT_LOCAL_ADD_ON_RATE_LIMITS_2026.maxRate * 100}
            step={0.05}
            onChange={(localAddOnRatePercent) =>
              updateInputs({ localAddOnRate: localAddOnRatePercent / 100 })
            }
            description="Default is a 2.00% proxy; enter your known regional plus commune addizionale rate for a tighter estimate."
          />
          <SelectField<ITImpatriateRegime>
            id="it-impatriate-regime"
            label="Impatriate Worker Regime"
            value={inputs.impatriateRegime}
            onChange={(impatriateRegime) => updateInputs({ impatriateRegime })}
            options={[
              { value: "none", label: "Not claimed" },
              { value: "standard", label: "Post-2024 50% taxable" },
              { value: "minorChild", label: "Post-2024 40% taxable with minor child" },
            ]}
            description="For qualifying new Italian tax residents under the current impatriate-worker regime; older transitional cases need a dedicated calculation."
          />
          <BooleanSelectField
            id="it-dependent-spouse"
            label="Dependent Spouse"
            value={inputs.dependentSpouse}
            onChange={(dependentSpouse) => updateInputs({ dependentSpouse })}
            trueLabel="Claim spouse credit"
            falseLabel="No spouse credit"
            description={`Use only when your spouse is fiscally dependent under the Article 12 income limit of EUR ${IT_FAMILY_CREDIT_LIMITS_2026.dependentIncomeLimit.toLocaleString("en-US")}.`}
          />
          <NumberStepperField
            id="it-eligible-children"
            label="Eligible Children"
            value={inputs.eligibleChildren}
            onChange={(eligibleChildren) => updateInputs({ eligibleChildren })}
            max={8}
            description="Children age 21-29, or age 30+ with qualifying disability, who are fiscally dependent."
          />
          <SelectField<ITChildCreditShare>
            id="it-child-credit-share"
            label="Child Credit Share"
            value={inputs.childCreditShare}
            onChange={(childCreditShare) => updateInputs({ childCreditShare })}
            options={[
              { value: "full", label: "100% / assigned to you" },
              { value: "half", label: "50% shared" },
            ]}
            description="Article 12 commonly splits the child credit 50/50 between parents unless assigned to the higher-income parent."
          />
          <NumberStepperField
            id="it-cohabiting-ascendants"
            label="Cohabiting Ascendants"
            value={inputs.cohabitingAscendants}
            onChange={(cohabitingAscendants) =>
              updateInputs({ cohabitingAscendants })
            }
            max={4}
            description="Parent or grandparent ascendants living with you and fiscally dependent."
          />
          <NumberField
            id="it-ascendant-credit-share"
            label="Ascendant Credit Share (%)"
            value={inputs.ascendantCreditSharePercent}
            min={0}
            max={100}
            step={1}
            onChange={(ascendantCreditSharePercent) =>
              updateInputs({ ascendantCreditSharePercent })
            }
            description="Use your pro-rata share when multiple taxpayers can claim the same ascendant."
          />
        </CalculatorFieldGrid>
      }
      contributions={
        <ContributionSlider
          label="Supplementary pension"
          value={inputs.contributions.pensionContribution}
          onChange={(pensionContribution) =>
            setInputs((current) => ({
              ...current,
              contributions: {
                ...current.contributions,
                pensionContribution: Math.min(
                  pensionContribution,
                  pensionContributionLimit,
                ),
              },
            }))
          }
          max={pensionContributionLimit}
          step={100}
          currency={currency}
          description="Optional Italian supplementary pension contribution deductible from taxable income up to the modeled annual limit."
        />
      }
      contributionsTitle="Retirement & Deduction Inputs"
      contributionsDescription="Optional Italian supplementary pension contribution modeled by the calculator"
      seoInfo={<ItalyTaxInfo />}
      infoCard={
        <InfoPanel title="Modeled Scope">
          <p>
            This models ordinary full-year resident employment salary in Italy,
            including IRPEF, employee INPS social security, employment tax
            credit, Article 12 family credits, local add-on rate, and optional
            supplementary pension contributions.
          </p>
          <p className="mt-2">
            Italy has local equivalents rather than US-style controls:
            supplementary pension contributions reduce taxable income, spouse
            and qualifying dependent credits reduce IRPEF when there is enough
            tax to offset, the current impatriate-worker regime can reduce the
            taxable employment base, taxable fringe benefit values can be
            entered from payroll, and the regional/municipal addizionale can be
            entered as your own local rate.
          </p>
        </InfoPanel>
      }
    />
  );
}

function ItalyTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="text-xl font-semibold text-zinc-200 mb-4">
        How Your Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">Italy</h3>
        <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
          <li>
            <strong className="text-zinc-300">IRPEF</strong> – employment income
            after modeled employee INPS contributions and optional supplementary
            pension deduction is taxed through Italy&apos;s 23%, 35%, and 43%
            national bands.
          </li>
          <li>
            <strong className="text-zinc-300">Supplementary Pension</strong> –
            optional pension contributions reduce taxable income up to the
            modeled annual limit and are also deducted from take-home pay as
            cash savings.
          </li>
          <li>
            <strong className="text-zinc-300">Taxable Fringe Benefits</strong>{" "}
            add the entered taxable value to the IRPEF and INPS bases, while
            net cash pay still starts from salary because the benefit is
            non-cash.
          </li>
          <li>
            <strong className="text-zinc-300">Impatriate Regime</strong> – the
            post-2024 regime can be selected for qualifying new residents,
            reducing the modeled taxable employment income to 50% or 40% for the
            minor-child case, up to the statutory income cap.
          </li>
          <li>
            <strong className="text-zinc-300">Employment Credit</strong> – a
            full-year employee tax credit is applied from the Article 13
            formulas and tapered by modeled taxable employment income.
          </li>
          <li>
            <strong className="text-zinc-300">Family Credits</strong> – Article
            12 credits are modeled for a dependent spouse, eligible children age
            21-29 or disabled age 30+, and cohabiting ascendants, subject to the
            income phaseouts and your credit share.
          </li>
          <li>
            <strong className="text-zinc-300">Local Add-ons</strong> – regional
            and municipal addizionale are represented by the rate you enter,
            with a 2.00% default proxy when you do not know the exact local
            combined rate.
          </li>
          <li>
            <strong className="text-zinc-300">Formula</strong> – net salary
            equals gross salary minus INPS, pension savings, national IRPEF
            after credits, and modeled local add-ons.
          </li>
        </ul>
        <p className="text-zinc-400 text-sm mt-3">
          Bonus and exoneration programs, severance pay, fringe benefit
          valuation/exemption worksheets, older transitional impatriate regimes,
          treaty positions, and employer-only costs need separate payroll,
          benefit, or legal facts rather than a generic salary slider.
        </p>
      </div>
    </section>
  );
}
