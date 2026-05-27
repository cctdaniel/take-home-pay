"use client";

import {
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
  AT_CHURCH_CONTRIBUTION_LIMIT_2026,
  AT_EMPLOYEE_TAX_CREDITS_2026,
  AT_SPECIAL_PAYMENT_SOCIAL_CAP_2026,
  AT_SPECIAL_PAYMENT_TAX_FREE_AMOUNT_2026,
  calculateAustriaCommuterAllowance,
} from "@/lib/countries/at/constants/tax-year-2026";
import { getCountryCalculator } from "@/lib/countries/registry";
import type {
  ATCalculatorInputs,
  ATFamilyBonusShare,
  ATFamilyCreditStatus,
  ATSpecialPaymentMode,
} from "@/lib/countries/at/types";
import type {
  ATCommuterAllowanceType,
  ATCommuterDistanceBand,
  ATCommuterWorkdayLevel,
} from "@/lib/countries/at/constants/tax-year-2026";

export default function ATCountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const {
    inputs,
    currency,
    result,
    setGrossSalary,
    setPayFrequency,
    setInputs,
  } = useCountryCalculatorExtension<ATCalculatorInputs>(country);
  const contributionLimits =
    getCountryCalculator(country).getContributionLimits(inputs);
  const churchContributionLimit = contributionLimits.churchContributions.limit;
  const charitableDonationLimit = contributionLimits.charitableDonations.limit;
  const updateInputs = (nextInputs: Partial<ATCalculatorInputs>) => {
    setInputs((current) => ({
      ...current,
      ...nextInputs,
      familyBonusChildrenUnder18:
        nextInputs.familyBonusChildrenUnder18 === undefined
          ? current.familyBonusChildrenUnder18
          : Math.min(
              Math.max(Math.trunc(nextInputs.familyBonusChildrenUnder18), 0),
              10,
            ),
      familyBonusChildrenOver18:
        nextInputs.familyBonusChildrenOver18 === undefined
          ? current.familyBonusChildrenOver18
          : Math.min(
              Math.max(Math.trunc(nextInputs.familyBonusChildrenOver18), 0),
              10,
            ),
      commuterOneWayKm:
        nextInputs.commuterOneWayKm === undefined
          ? current.commuterOneWayKm
          : Math.min(Math.max(nextInputs.commuterOneWayKm, 0), 300),
    }));
  };
  const structuredCommuterAllowance = calculateAustriaCommuterAllowance(
    inputs.commuterAllowanceType,
    inputs.commuterDistanceBand,
    inputs.commuterWorkdays,
  );

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
            id="at-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
          <SelectField<ATSpecialPaymentMode>
            id="at-special-payment-mode"
            label="13th / 14th Salary Treatment"
            value={inputs.specialPaymentMode}
            onChange={(specialPaymentMode) =>
              updateInputs({ specialPaymentMode })
            }
            options={[
              {
                value: "includedInGross",
                label: "Included in annual gross",
              },
              {
                value: "additionalToGross",
                label: "Paid in addition",
              },
              {
                value: "customIncludedInGross",
                label: "Custom included amount",
              },
              {
                value: "customAdditionalToGross",
                label: "Custom additional amount",
              },
              { value: "none", label: "No special payments" },
            ]}
            description="Austria commonly pays holiday and Christmas remuneration as 13th/14th salary; special payments inside the annual one-sixth use a separate BMF tax schedule."
          />
          {inputs.specialPaymentMode === "customIncludedInGross" ||
          inputs.specialPaymentMode === "customAdditionalToGross" ? (
            <CurrencyAmountField
              id="at-custom-special-payments"
              label="Annual Special Payments"
              value={inputs.customSpecialPayments}
              onChange={(customSpecialPayments) =>
                updateInputs({
                  customSpecialPayments: Math.max(0, customSpecialPayments),
                })
              }
              currency={currency}
              max={
                inputs.specialPaymentMode === "customIncludedInGross"
                  ? inputs.grossSalary
                  : undefined
              }
              step={100}
              description="Holiday pay, Christmas remuneration, or other qualifying special payments."
            />
          ) : null}
          <CurrencyAmountField
            id="at-taxable-in-kind-benefits"
            label="Taxable In-Kind Benefits"
            value={inputs.taxableInKindBenefits}
            onChange={(taxableInKindBenefits) =>
              updateInputs({
                taxableInKindBenefits: Math.max(0, taxableInKindBenefits),
              })
            }
            currency={currency}
            step={100}
            description="Annual taxable Sachbezug value from your payslip or valuation rule; increases wage tax and social insurance but not cash gross pay."
          />
          <NumberStepperField
            id="at-family-bonus-under-18"
            label="Family Bonus Children Under 18"
            value={inputs.familyBonusChildrenUnder18}
            onChange={(value) =>
              updateInputs({
                familyBonusChildrenUnder18: value,
                familyBonusChildren:
                  value + inputs.familyBonusChildrenOver18,
              })
            }
            min={0}
            max={10}
            description="Children with Austrian family allowance before their 18th birthday."
          />
          <NumberStepperField
            id="at-family-bonus-over-18"
            label="Family Bonus Children 18+"
            value={inputs.familyBonusChildrenOver18}
            onChange={(value) =>
              updateInputs({
                familyBonusChildrenOver18: value,
                familyBonusChildren:
                  inputs.familyBonusChildrenUnder18 + value,
              })
            }
            min={0}
            max={10}
            description="Reduced Family Bonus Plus while family allowance continues after age 18."
          />
          <SelectField<ATFamilyBonusShare>
            id="at-family-bonus-share"
            label="Family Bonus Share"
            value={inputs.familyBonusShare}
            onChange={(familyBonusShare) => updateInputs({ familyBonusShare })}
            options={[
              { value: "full", label: "100% / claimed by you" },
              { value: "half", label: "50% split" },
            ]}
            description="Austria allows the Family Bonus Plus to be claimed fully by one eligible person or split 50/50."
          />
          <SelectField<ATFamilyCreditStatus>
            id="at-family-credit-status"
            label="Single-Earner / Single-Parent Credit"
            value={inputs.familyCreditStatus}
            onChange={(familyCreditStatus) =>
              updateInputs({ familyCreditStatus })
            }
            options={[
              { value: "none", label: "Not claimed" },
              { value: "singleEarner", label: "Single earner" },
              { value: "singleParent", label: "Single parent" },
            ]}
            description={`Requires at least one child. The 2026 partner-income limit for single earners is EUR ${AT_EMPLOYEE_TAX_CREDITS_2026.singleEarnerOrParent.partnerIncomeLimit.toLocaleString("en-US")}.`}
          />
          <SelectField<ATCommuterAllowanceType>
            id="at-commuter-type"
            label="Pendlerpauschale Type"
            value={inputs.commuterAllowanceType}
            onChange={(commuterAllowanceType) =>
              updateInputs({ commuterAllowanceType })
            }
            options={[
              { value: "none", label: "No commuter allowance" },
              { value: "small", label: "Small - public transport reasonable" },
              { value: "large", label: "Large - public transport unreasonable" },
            ]}
            description="Use the BMF Pendlerrechner result when available."
          />
          <SelectField<ATCommuterDistanceBand>
            id="at-commuter-distance-band"
            label="Commuter Distance Band"
            value={inputs.commuterDistanceBand}
            onChange={(commuterDistanceBand) =>
              updateInputs({ commuterDistanceBand })
            }
            options={[
              { value: "none", label: "No band" },
              { value: "km2to20", label: "2-20 km" },
              { value: "km20to40", label: "20-40 km" },
              { value: "km40to60", label: "40-60 km" },
              { value: "km60plus", label: "60+ km" },
            ]}
            description={`Modeled annual Pendlerpauschale: EUR ${structuredCommuterAllowance.toLocaleString("en-US")}.`}
          />
          <SelectField<ATCommuterWorkdayLevel>
            id="at-commuter-workdays"
            label="Monthly Commute Days"
            value={inputs.commuterWorkdays}
            onChange={(commuterWorkdays) => updateInputs({ commuterWorkdays })}
            options={[
              { value: "full", label: "11+ days/month" },
              { value: "twoThirds", label: "8-10 days/month" },
              { value: "oneThird", label: "4-7 days/month" },
            ]}
            description="Partial commuter allowance and Pendlereuro use the same BMF proration."
          />
          <NumberField
            id="at-commuter-km"
            label="One-Way Commute Distance (km)"
            value={inputs.commuterOneWayKm}
            min={0}
            max={300}
            step={1}
            onChange={(commuterOneWayKm) => updateInputs({ commuterOneWayKm })}
            description="Used for the Pendlereuro credit: 6 EUR per one-way kilometre in 2026, prorated for part-time commuting."
          />
        </CalculatorFieldGrid>
      }
      contributions={
        <div className="space-y-5">
          <ContributionSlider
            label="Church Contributions"
            value={inputs.contributions.churchContributions}
            onChange={(churchContributions) =>
              setInputs((current) => ({
                ...current,
                contributions: {
                  ...current.contributions,
                  churchContributions: Math.min(
                    churchContributions,
                    churchContributionLimit,
                  ),
                },
              }))
            }
            max={churchContributionLimit}
            step={25}
            currency={currency}
            description={`Deductible recognized church or religious-society contributions, capped at EUR ${AT_CHURCH_CONTRIBUTION_LIMIT_2026.toLocaleString("en-US")}.`}
          />
          <ContributionSlider
            label="Qualifying Donations"
            value={inputs.contributions.charitableDonations}
            onChange={(charitableDonations) =>
              setInputs((current) => ({
                ...current,
                contributions: {
                  ...current.contributions,
                  charitableDonations: Math.min(
                    charitableDonations,
                    charitableDonationLimit,
                  ),
                },
              }))
            }
            max={charitableDonationLimit}
            step={50}
            currency={currency}
            description="Deductible donations to qualifying recipients, capped at 10% of modeled current-year income."
          />
          <CurrencyAmountField
            id="at-voluntary-pension-insurance"
            label="Voluntary Statutory Pension Insurance"
            value={inputs.contributions.voluntaryPensionInsurance}
            onChange={(voluntaryPensionInsurance) =>
              setInputs((current) => ({
                ...current,
                contributions: {
                  ...current.contributions,
                  voluntaryPensionInsurance: Math.min(
                    Math.max(voluntaryPensionInsurance, 0),
                    current.grossSalary,
                  ),
                },
              }))
            }
            currency={currency}
            description="Voluntary continuation or buy-back contributions to statutory pension insurance are modeled as fully deductible special expenses."
          />
        </div>
      }
      contributionsTitle="Special Expense Inputs"
      contributionsDescription="Optional Austrian special expenses and relief payments modeled by the calculator"
      seoInfo={<AustriaTaxInfo />}
      infoCard={
        <InfoPanel title="Modeled Scope">
          <p>
            This models ordinary full-year resident employment salary in
            Austria, including progressive wage tax, capped employee social
            insurance, transportation credits, structured commuter allowance,
            Family Bonus Plus, single-earner/single-parent credits, and special
            expenses.
          </p>
          <p className="mt-2">
            Austria has local equivalents rather than US-style controls: child
            relief is modeled through Family Bonus Plus and family credits,
            commuting is modeled through Pendlerpauschale plus Pendlereuro, and
            church, donation, and statutory pension special expenses reduce the
            modeled taxable base.
          </p>
          <p className="mt-2">
            The 13th/14th salary setting applies the BMF special-payment wage
            tax schedule and the separate 2026 ÖGK social-insurance cap of EUR{" "}
            {AT_SPECIAL_PAYMENT_SOCIAL_CAP_2026.toLocaleString("en-US")}. The
            first EUR{" "}
            {AT_SPECIAL_PAYMENT_TAX_FREE_AMOUNT_2026.toLocaleString("en-US")}{" "}
            of taxable special payments is tax-free inside the modeled schedule.
          </p>
          <p className="mt-2">
            Taxable in-kind benefits are shown as an annual amount input. The
            calculator adds that value to the wage-tax and social-insurance
            bases, but not to cash take-home pay.
          </p>
        </InfoPanel>
      }
    />
  );
}

function AustriaTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="text-xl font-semibold text-zinc-200 mb-4">
        How Your Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">Austria</h3>
        <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
          <li>
            <strong className="text-zinc-300">Wage Tax</strong> – annual salary
            after modeled employee social insurance and optional commuter
            allowance and special expenses is taxed with Austria&apos;s 2026
            progressive wage tax bands
            from 0% to 55%.
          </li>
          <li>
            <strong className="text-zinc-300">Social Insurance</strong> –
            employee social insurance is modeled at a general employee rate and
            capped at the annualized contribution-base ceiling.
          </li>
          <li>
            <strong className="text-zinc-300">13th / 14th Salary</strong> –
            holiday and Christmas remuneration are modeled separately when
            selected, using the BMF fixed-rate schedule inside the annual
            one-sixth and the ÖGK special-payment contribution cap.
          </li>
          <li>
            <strong className="text-zinc-300">Taxable In-Kind Benefits</strong>{" "}
            – user-entered Sachbezug values increase the modeled wage-tax and
            social-insurance bases without increasing cash salary.
          </li>
          <li>
            <strong className="text-zinc-300">Employee Credits</strong> – the
            employee transportation credit is automatic, with the 2026
            low-income surcharge, elevated commuter credit, and Pendlereuro
            applied when eligible.
          </li>
          <li>
            <strong className="text-zinc-300">Family Credits</strong> – Family
            Bonus Plus separates children under 18 from children over 18,
            supports 100% or 50% claims, and adds the single-earner or
            single-parent credit when selected.
          </li>
          <li>
            <strong className="text-zinc-300">Special Expenses</strong> –
            church contributions, qualifying donations, and voluntary statutory
            pension insurance are deductible from the modeled taxable base.
          </li>
          <li>
            <strong className="text-zinc-300">No Regional Income Tax</strong> –
            Austria does not use US-style state income tax for salary employees
            in this model.
          </li>
          <li>
            <strong className="text-zinc-300">Formula</strong> – net salary
            equals gross salary minus capped employee social insurance and wage
            tax after commuter allowance, special expenses, employee credits,
            commuter credits, and family credits. User-entered special expenses
            are also deducted as cash payments from take-home pay.
          </li>
        </ul>
        <p className="text-zinc-400 text-sm mt-3">
          This model excludes exact Pendlerrechner route certification,
          official in-kind benefit valuation worksheets, non-resident or treaty
          positions, and detailed month-by-month payroll cap timing.
        </p>
      </div>
    </section>
  );
}
