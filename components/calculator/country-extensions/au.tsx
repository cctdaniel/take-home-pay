"use client";

import {
  BooleanSelectField,
  CalculatorFieldGrid,
  CurrencyAmountField,
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
import { AU_CONCESSIONAL_SUPER_CAP_2026 } from "@/lib/countries/au";
import { getCountryCalculator } from "@/lib/countries/registry";
import type {
  AUCalculatorInputs,
  AUMedicareFamilyStatus,
  AUResidencyType,
} from "@/lib/countries/types";

const RESIDENCY_OPTIONS: Array<{ value: AUResidencyType; label: string }> = [
  { value: "resident", label: "Australian Resident" },
  { value: "non_resident", label: "Foreign Resident" },
];

const MEDICARE_FAMILY_OPTIONS: Array<{
  value: AUMedicareFamilyStatus;
  label: string;
}> = [
  { value: "single", label: "Single threshold" },
  { value: "family", label: "Family / sole-parent threshold" },
];

function clampAmount(value: number, max: number) {
  return Math.min(Math.max(0, value), Math.max(0, max));
}

function clampChildCount(value: number): number {
  return Math.min(10, Math.max(0, Math.floor(value)));
}

export default function AUCountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const {
    inputs,
    currency,
    result,
    setGrossSalary,
    setPayFrequency,
    setInputs,
  } = useCountryCalculatorExtension<AUCalculatorInputs>(country);
  const contributionLimits =
    getCountryCalculator(country).getContributionLimits(inputs);
  const salarySacrificeLimit =
    contributionLimits.salarySacrificeSuper?.limit ?? 0;
  const workRelatedExpensesLimit =
    contributionLimits.workRelatedExpenses?.limit ?? 0;
  const charitableDonationsLimit =
    contributionLimits.charitableDonations?.limit ?? 0;
  const salarySacrificeSuper = Math.min(
    inputs.contributions.salarySacrificeSuper,
    salarySacrificeLimit,
  );

  const setSalarySacrificeSuper = (amount: number) => {
    setInputs((current) => ({
      ...current,
      contributions: {
        ...current.contributions,
        salarySacrificeSuper: clampAmount(amount, salarySacrificeLimit),
      },
    }));
  };
  const setAnnualDeduction = (
    key: "workRelatedExpenses" | "charitableDonations",
    amount: number,
  ) => {
    const limit =
      key === "workRelatedExpenses"
        ? workRelatedExpensesLimit
        : charitableDonationsLimit;

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
            id="au-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
          <SelectField
            id="au-residency-type"
            label="Residency Status"
            value={inputs.residencyType}
            onChange={(residencyType) =>
              setInputs((current) => ({ ...current, residencyType }))
            }
            options={RESIDENCY_OPTIONS}
            description="Residents can use the tax-free threshold, LITO, and Medicare settings; foreign residents are taxed from the first dollar."
          />
          <BooleanSelectField
            id="au-private-health-insurance"
            label="Private Health Insurance"
            value={inputs.hasPrivateHealthInsurance}
            onChange={(hasPrivateHealthInsurance) =>
              setInputs((current) => ({
                ...current,
                hasPrivateHealthInsurance,
              }))
            }
            trueLabel="Yes (Hospital Cover)"
            falseLabel="No"
            trueFirst
            description="Controls the Medicare levy surcharge for resident taxpayers above the ATO threshold."
          />
          {inputs.residencyType === "resident" ? (
            <>
              <SelectField
                id="au-medicare-family-status"
                label="Medicare Threshold"
                value={inputs.medicareFamilyStatus}
                onChange={(medicareFamilyStatus) =>
                  setInputs((current) => ({
                    ...current,
                    medicareFamilyStatus,
                    medicareSpouseIncome:
                      medicareFamilyStatus === "family"
                        ? current.medicareSpouseIncome
                        : 0,
                    numberOfDependentChildren:
                      medicareFamilyStatus === "family"
                        ? current.numberOfDependentChildren
                        : 0,
                  }))
                }
                options={MEDICARE_FAMILY_OPTIONS}
                description="Applies ATO Medicare levy reduction and surcharge thresholds for couples, families, or sole parents."
              />
              {inputs.medicareFamilyStatus === "family" ? (
                <>
                  <CurrencyAmountField
                    id="au-spouse-income"
                    label="Spouse Taxable Income"
                    value={inputs.medicareSpouseIncome}
                    onChange={(medicareSpouseIncome) =>
                      setInputs((current) => ({
                        ...current,
                        medicareSpouseIncome: Math.max(0, medicareSpouseIncome),
                      }))
                    }
                    currency={currency}
                    min={0}
                    step={500}
                    description="Used only for family Medicare levy and surcharge income thresholds."
                  />
                  <NumberStepperField
                    id="au-dependent-children"
                    label="MLS Dependent Children"
                    value={inputs.numberOfDependentChildren}
                    onChange={(numberOfDependentChildren) =>
                      setInputs((current) => ({
                        ...current,
                        numberOfDependentChildren:
                          clampChildCount(numberOfDependentChildren),
                      }))
                    }
                    min={0}
                    max={10}
                    description="Raises family Medicare levy and surcharge thresholds where ATO child increments apply."
                  />
                </>
              ) : null}
            </>
          ) : null}
        </CalculatorFieldGrid>
      }
      contributions={
        <div className="space-y-6">
          {salarySacrificeLimit > 0 ? (
            <ContributionSlider
              label={
                contributionLimits.salarySacrificeSuper?.name ??
                "Salary-sacrifice / deductible concessional super"
              }
              description={
                contributionLimits.salarySacrificeSuper?.description ??
                "Employee-controlled concessional super contribution up to the remaining ATO concessional cap after modeled employer Super Guarantee."
              }
              value={salarySacrificeSuper}
              onChange={setSalarySacrificeSuper}
              max={salarySacrificeLimit}
              currency={currency}
              step={100}
            />
          ) : (
            <p className="rounded bg-zinc-800/50 p-2 text-xs text-zinc-500">
              Modeled employer Super Guarantee already reaches the ATO
              concessional cap, so no ordinary employee salary-sacrifice room is
              shown.
            </p>
          )}
          <ContributionSlider
            label={
              contributionLimits.workRelatedExpenses?.name ??
              "Work-related deductions"
            }
            value={Math.min(
              inputs.contributions.workRelatedExpenses ?? 0,
              workRelatedExpensesLimit,
            )}
            onChange={(amount) =>
              setAnnualDeduction("workRelatedExpenses", amount)
            }
            max={workRelatedExpensesLimit}
            currency={currency}
            step={100}
            description={
              contributionLimits.workRelatedExpenses?.description ??
              "Unreimbursed employment expenses that directly relate to earning salary income and are kept as records for the annual return."
            }
          />
          <ContributionSlider
            label={
              contributionLimits.charitableDonations?.name ??
              "DGR gifts / donations"
            }
            value={Math.min(
              inputs.contributions.charitableDonations ?? 0,
              charitableDonationsLimit,
            )}
            onChange={(amount) =>
              setAnnualDeduction("charitableDonations", amount)
            }
            max={charitableDonationsLimit}
            currency={currency}
            step={100}
            description={
              contributionLimits.charitableDonations?.description ??
              "Deductible gifts of A$2 or more to deductible gift recipients, modeled as annual-return deductions."
            }
          />
          <p className="rounded bg-zinc-800/50 p-2 text-xs text-zinc-500">
            ATO concessional contributions include employer Super Guarantee,
            salary sacrifice, and deductible personal super contributions.
            Work-related deductions and DGR gifts reduce annual taxable income
            here but are not treated as payroll cash deductions.
          </p>
        </div>
      }
      contributionsTitle="Australia Super and Deduction Inputs"
      contributionsDescription="Concessional super plus ATO annual-return work and donation deductions"
      seoInfo={<AustraliaTaxInfo />}
      infoCard={
        <InfoPanel title="Australia Payroll Scope">
          <p>
            This models 2025-26 resident or foreign-resident employment salary
            with income tax, LITO where resident, Medicare levy and surcharge
            where applicable, family/spouse/dependent Medicare thresholds,
            Division 293 tax for high earners, employer Super Guarantee, and
            optional employee-controlled concessional super, work-related
            deductions, and DGR gifts.
          </p>
          <p className="mt-2">
            Employer Super Guarantee is shown for context and is not deducted
            from take-home pay. HELP/HECS repayments, offsets beyond LITO,
            reportable fringe benefits, private health insurance rebate
            reconciliation, exact spouse tax-return allocation, carry-forward
            concessional cap rules, and deduction substantiation tests require
            extra taxpayer facts, so they are named here instead of being
            implied by annual amount controls.
          </p>
        </InfoPanel>
      }
    />
  );
}

function AustraliaTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="mb-4 text-xl font-semibold text-zinc-200">
        How Australia Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <ul className="mt-3 list-inside list-disc space-y-1 text-zinc-400">
          <li>
            <strong className="text-zinc-300">Income Tax</strong> uses the ATO
            2025-26 resident or foreign-resident tax brackets selected above.
          </li>
          <li>
            <strong className="text-zinc-300">Medicare</strong> adds the
            resident Medicare levy and surcharge when the private-hospital cover
            setting and selected single/family threshold make the surcharge
            apply.
          </li>
          <li>
            <strong className="text-zinc-300">Concessional Super</strong>{" "}
            deducts employee salary-sacrifice or deductible personal super up to
            the remaining A${AU_CONCESSIONAL_SUPER_CAP_2026.toLocaleString()}{" "}
            cap after modeled employer Super Guarantee.
          </li>
          <li>
            <strong className="text-zinc-300">Annual Deductions</strong>{" "}
            subtract unreimbursed work-related expenses and deductible gifts to
            DGR organisations from taxable income when entered, without treating
            them as salary withholdings.
          </li>
          <li>
            <strong className="text-zinc-300">Formula</strong> subtracts income
            tax, Medicare amounts, Division 293 tax, and selected employee
            concessional super from gross salary.
          </li>
        </ul>
      </div>
    </section>
  );
}
