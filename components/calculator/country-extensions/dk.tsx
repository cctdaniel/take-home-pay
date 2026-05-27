"use client";

import {
  BooleanSelectField,
  CalculatorFieldGrid,
  CurrencyAmountField,
  NumberField,
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
  DK_COMMUTING_DEDUCTION_2026,
  DK_HOUSEHOLD_SERVICES_LIMIT_2026,
  DK_OTHER_WORK_EXPENSE_THRESHOLD_2026,
  DK_RATE_PENSION_DEDUCTION_LIMIT_2026,
  DK_RESEARCHER_SCHEME_MIN_MONTHLY_SALARY,
  DK_TRADE_UNION_FEE_LIMIT_2026,
} from "@/lib/countries/dk/constants/tax-year-2026";
import type {
  DKCalculatorInputs,
  DKContributionInputs,
  DKStatePensionProximity,
  DKTaxRegime,
} from "@/lib/countries/dk/types";

const DK_TAX_REGIME_OPTIONS: Array<{
  value: DKTaxRegime;
  label: string;
}> = [
  { value: "ordinary", label: "Ordinary resident salary" },
  { value: "researcherScheme", label: "Researcher / highly paid employee" },
];

const DK_PENSION_PROXIMITY_OPTIONS: Array<{
  value: DKStatePensionProximity;
  label: string;
}> = [
  { value: "more_than_15_years", label: "More than 15 years to state pension" },
  { value: "within_15_years", label: "15 years or less to state pension" },
  { value: "one_or_two_years", label: "1-2 years to state pension" },
];

function clamp(value: number, max = Infinity) {
  return Math.min(Math.max(0, value), max);
}

export default function DKCountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const {
    inputs,
    currency,
    result,
    setGrossSalary,
    setPayFrequency,
    setInputs,
  } = useCountryCalculatorExtension<DKCalculatorInputs>(country);
  const isResearcherScheme = inputs.taxRegime === "researcherScheme";
  const updateContribution = (
    key: keyof DKContributionInputs,
    value: number,
    max = Infinity,
  ) =>
    setInputs((current) => ({
      ...current,
      contributions: {
        ...current.contributions,
        [key]: clamp(value, max),
      },
    }));

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
            id="dk-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
          <CurrencyAmountField
            id="dk-taxable-benefits-in-kind"
            label="Taxable Benefits in Kind"
            value={inputs.taxableBenefitsInKind}
            onChange={(taxableBenefitsInKind) =>
              setInputs((current) => ({
                ...current,
                taxableBenefitsInKind: Math.max(0, taxableBenefitsInKind),
              }))
            }
            currency={currency}
            step={500}
            description="Enter taxable annual personnel-benefit A-income value. It increases AM-bidrag and Danish income-tax bases but is not cash salary."
          />
          <SelectField
            id="dk-tax-regime"
            label="Tax Regime"
            value={inputs.taxRegime}
            onChange={(taxRegime) =>
              setInputs((current) => ({ ...current, taxRegime }))
            }
            options={DK_TAX_REGIME_OPTIONS}
            description="Use the special scheme only if your Danish employer/research institution registration is approved."
          />
          {!isResearcherScheme && (
            <>
              <SelectField
                id="dk-state-pension-proximity"
                label="State Pension Timing"
                value={inputs.statePensionProximity}
                onChange={(statePensionProximity) =>
                  setInputs((current) => ({
                    ...current,
                    statePensionProximity,
                  }))
                }
                options={DK_PENSION_PROXIMITY_OPTIONS}
                description="Controls the extra pension deduction rate and the senior employment allowance."
              />
              <BooleanSelectField
                id="dk-single-parent-allowance"
                label="Single Parent Allowance"
                value={inputs.singleParentAllowanceEligible}
                onChange={(singleParentAllowanceEligible) =>
                  setInputs((current) => ({
                    ...current,
                    singleParentAllowanceEligible,
                  }))
                }
                trueLabel="Eligible"
                falseLabel="Not eligible"
                description="Use only if you receive the additional child allowance that triggers Denmark's extra single-parent employment allowance."
              />
              <NumberField
                id="dk-round-trip-commuting-km"
                label="Round-Trip Commute Km"
                value={inputs.roundTripCommutingKm}
                onChange={(roundTripCommutingKm) =>
                  setInputs((current) => ({
                    ...current,
                    roundTripCommutingKm: clamp(roundTripCommutingKm, 400),
                  }))
                }
                min={0}
                max={400}
                description={`No deduction for the first ${DK_COMMUTING_DEDUCTION_2026.freeRoundTripKm} km per day.`}
              />
              <NumberField
                id="dk-commuting-workdays"
                label="Commuting Workdays"
                value={inputs.commutingWorkdays}
                onChange={(commutingWorkdays) =>
                  setInputs((current) => ({
                    ...current,
                    commutingWorkdays: clamp(Math.round(commutingWorkdays), 366),
                  }))
                }
                min={0}
                max={366}
                description="Annual days travelled between home and work."
              />
            </>
          )}
        </CalculatorFieldGrid>
      }
      contributionsTitle="Denmark Filing Deductions"
      contributionsDescription={
        isResearcherScheme
          ? "Ordinary deductions are not applied under the researcher scheme"
          : "Danish filing deductions that a salary employee can control or report"
      }
      contributions={
        !isResearcherScheme ? (
          <div className="space-y-6">
            <ContributionSlider
              label="Rate pension / terminating annuity"
              value={inputs.contributions.privateRatePension}
              onChange={(value) =>
                updateContribution(
                  "privateRatePension",
                  value,
                  DK_RATE_PENSION_DEDUCTION_LIMIT_2026,
                )
              }
              max={DK_RATE_PENSION_DEDUCTION_LIMIT_2026}
              step={500}
              currency={currency}
              description="Deductible 2026 rate pension/terminating annuity contributions; the calculator also applies the extra pension deduction."
            />
            <ContributionSlider
              label="Trade union fees"
              value={inputs.contributions.tradeUnionFees}
              onChange={(value) =>
                updateContribution(
                  "tradeUnionFees",
                  value,
                  DK_TRADE_UNION_FEE_LIMIT_2026,
                )
              }
              max={DK_TRADE_UNION_FEE_LIMIT_2026}
              step={100}
              currency={currency}
              description="SKAT caps the annual trade-union fee deduction at DKK 7,000 for 2026."
            />
            <CurrencyAmountField
              id="dk-unemployment-insurance-fees"
              label="A-kasse / Unemployment Insurance"
              value={inputs.contributions.unemploymentInsuranceFees}
              onChange={(value) =>
                updateContribution("unemploymentInsuranceFees", value)
              }
              currency={currency}
              step={100}
              description="A-kasse and early-retirement scheme fees are reported as deductions; SKAT does not publish the same annual cap as trade-union fees."
            />
            <ContributionSlider
              label="Household services"
              value={inputs.contributions.householdServices}
              onChange={(value) =>
                updateContribution(
                  "householdServices",
                  value,
                  DK_HOUSEHOLD_SERVICES_LIMIT_2026,
                )
              }
              max={DK_HOUSEHOLD_SERVICES_LIMIT_2026}
              step={100}
              currency={currency}
              description="Eligible wage costs for household services, capped at DKK 18,300 per person in 2026."
            />
            <CurrencyAmountField
              id="dk-other-work-expenses"
              label="Other Documented Work Expenses"
              value={inputs.contributions.otherWorkExpenses}
              onChange={(value) =>
                updateContribution("otherWorkExpenses", value)
              }
              currency={currency}
              step={100}
              description={`Only the amount above DKK ${DK_OTHER_WORK_EXPENSE_THRESHOLD_2026.toLocaleString()} is deductible in 2026.`}
            />
          </div>
        ) : undefined
      }
      contributionsEmptyState="The researcher/highly paid employee scheme uses a gross tax rate and does not apply ordinary allowances, pension deductions, commuting, union, A-kasse, household-service, or work-expense deductions; those require separate ordinary-tax facts."
      infoCard={
        <InfoPanel title="Modeled Scope">
          <p>
            This models ordinary Denmark employment salary for a full tax year
            using the 2026 personal allowance, AM-bidrag, average municipal tax
            rate, and no church tax, or the selected researcher/highly paid
            employee scheme.
          </p>
          <p className="mt-2">
            The researcher/highly paid employee option applies the 32.84% gross
            tax scheme and removes ordinary allowances and deductions. The
            high-paid route requires guaranteed monthly salary of at least DKK{" "}
            {DK_RESEARCHER_SCHEME_MIN_MONTHLY_SALARY.toLocaleString()} in 2026;
            researchers can qualify under separate approval rules.
          </p>
          <p className="mt-2">
            Ordinary mode includes automatic employment and job allowances, plus
            explicit inputs for rate pension, extra pension deduction timing,
            single-parent employment allowance, commuting, union/A-kasse,
            household services, and documented work expenses. ATP detail,
            holiday-pay timing, exact municipality/church tax, interest and
            capital income, personnel-benefit valuation worksheets, and treaty
            positions require taxpayer-specific filing facts; this page exposes
            them only when a specific input can model the rule accurately.
          </p>
        </InfoPanel>
      }
      seoInfo={<DenmarkTaxInfo />}
    />
  );
}

function DenmarkTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="mb-4 text-xl font-semibold text-zinc-200">
        How Denmark Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <ul className="mt-3 list-inside list-disc space-y-1 text-zinc-400">
          <li>
            <strong className="text-zinc-300">AM-bidrag</strong> is modeled as
            the 8% labour-market contribution on employment salary.
          </li>
          <li>
            <strong className="text-zinc-300">Taxable Benefits in Kind</strong>{" "}
            add the entered A-income value to AM-bidrag and income-tax bases,
            while cash take-home still starts from salary.
          </li>
          <li>
            <strong className="text-zinc-300">Income Tax</strong> applies the
            2026 personal allowance, average municipal tax rate with no church
            tax, and the 2026 bottom, middle, top, and top-top state tax layers.
          </li>
          <li>
            <strong className="text-zinc-300">Automatic Allowances</strong>{" "}
            include Denmark&apos;s employment allowance and job allowance, with
            optional senior and single-parent employment allowances when the
            selected facts qualify.
          </li>
          <li>
            <strong className="text-zinc-300">Deduction Inputs</strong> cover
            rate pension/terminating annuity contributions, extra pension
            deduction timing, commuting, trade union fees, A-kasse fees,
            household services, and documented work expenses above the 2026
            threshold.
          </li>
          <li>
            <strong className="text-zinc-300">Researcher Scheme</strong> uses
            the special gross tax scheme and does not apply ordinary Danish
            deductions or allowances.
          </li>
        </ul>
      </div>
    </section>
  );
}
