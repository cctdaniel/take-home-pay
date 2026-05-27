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
import { getCountryCalculator } from "@/lib/countries/registry";
import {
  BE_EXPAT_REGIME_2026,
  BE_TAX_CONFIG,
  getBEExpatAllowanceLimit,
} from "@/lib/countries/be/constants/tax-year-2026";
import type {
  BECalculatorInputs,
  BEContributionInputs,
  BEExpatRegimeType,
} from "@/lib/countries/be/types";

const BE_EXPAT_REGIME_OPTIONS: Array<{
  value: BEExpatRegimeType;
  label: string;
}> = [
  { value: "none", label: "No special regime" },
  { value: "inboundTaxpayer", label: "Inbound taxpayer" },
  { value: "inboundResearcher", label: "Inbound researcher" },
];

export default function BECountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const { inputs, currency, result, setPayFrequency, setInputs } =
    useCountryCalculatorExtension<BECalculatorInputs>(country);
  const calculator = getCountryCalculator(country);
  const contributionLimits = calculator.getContributionLimits(inputs);
  const pensionSavingsLimit = contributionLimits.pensionSavings.limit;
  const childcareExpenseLimit = contributionLimits.childcareExpenses.limit;
  const charitableDonationLimit =
    contributionLimits.charitableDonations.limit;
  const dependentChildren = Math.min(
    Math.max(0, inputs.numberOfDependentChildren ?? 0),
    10,
  );
  const childcareDaysMax =
    dependentChildren * BE_TAX_CONFIG.childcareMaxDaysPerChild;
  const expatRegimeType = inputs.expatRegimeType ?? "none";
  const expatAllowanceLimit = getBEExpatAllowanceLimit(
    inputs.grossSalary + (inputs.taxableBenefitsInKind ?? 0),
    expatRegimeType,
  );
  const expatTaxpayerMinimumMet =
    expatRegimeType !== "inboundTaxpayer" ||
    inputs.grossSalary + (inputs.taxableBenefitsInKind ?? 0) >=
      BE_EXPAT_REGIME_2026.inboundTaxpayerMinimumSalary;

  const clampContribution = (value: number, limit: number) =>
    Math.min(Math.max(value, 0), Math.max(0, limit));

  const clampContributions = (
    nextInputs: BECalculatorInputs,
  ): BEContributionInputs => {
    const nextLimits = calculator.getContributionLimits(nextInputs);

    return {
      pensionSavings: clampContribution(
        nextInputs.contributions.pensionSavings ?? 0,
        nextLimits.pensionSavings.limit,
      ),
      childcareExpenses: clampContribution(
        nextInputs.contributions.childcareExpenses ?? 0,
        nextLimits.childcareExpenses.limit,
      ),
      charitableDonations: clampContribution(
        nextInputs.contributions.charitableDonations ?? 0,
        nextLimits.charitableDonations.limit,
      ),
    };
  };

  const setBelgianContribution = (
    contributionKey: keyof BEContributionInputs,
    value: number,
  ) => {
    setInputs((current) => {
      const nextInputs: BECalculatorInputs = {
        ...current,
        contributions: {
          ...current.contributions,
          [contributionKey]: value,
        },
      };

      return {
        ...nextInputs,
        contributions: clampContributions(nextInputs),
      };
    });
  };

  const setBelgiumGrossSalary = (grossSalary: number) => {
    setInputs((current) => {
      const nextAllowanceLimit = getBEExpatAllowanceLimit(
        grossSalary + (current.taxableBenefitsInKind ?? 0),
        current.expatRegimeType ?? "none",
      );
      const nextInputs: BECalculatorInputs = {
        ...current,
        grossSalary,
        expatRecurringAllowance: Math.min(
          current.expatRecurringAllowance ?? 0,
          nextAllowanceLimit,
        ),
      };

      return {
        ...nextInputs,
        contributions: clampContributions(nextInputs),
      };
    });
  };

  return (
    <CountryCalculatorExtensionShell
      country={country}
      currency={currency}
      grossSalary={inputs.grossSalary}
      onGrossSalaryChange={setBelgiumGrossSalary}
      result={result}
      taxOptions={
        <CalculatorFieldGrid columns={2}>
          <PayFrequencyField
            id="be-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
          <CurrencyAmountField
            id="be-taxable-benefits-in-kind"
            label="Taxable Benefits in Kind"
            value={inputs.taxableBenefitsInKind}
            onChange={(taxableBenefitsInKind) =>
              setInputs((current) => {
                const nextInputs: BECalculatorInputs = {
                  ...current,
                  taxableBenefitsInKind: Math.max(0, taxableBenefitsInKind),
                };
                const nextAllowanceLimit = getBEExpatAllowanceLimit(
                  nextInputs.grossSalary + nextInputs.taxableBenefitsInKind,
                  nextInputs.expatRegimeType ?? "none",
                );
                nextInputs.expatRecurringAllowance = Math.min(
                  nextInputs.expatRecurringAllowance ?? 0,
                  nextAllowanceLimit,
                );

                return {
                  ...nextInputs,
                  contributions: clampContributions(nextInputs),
                };
              })
            }
            currency={currency}
            step={100}
            description="Enter the annual taxable payroll value. It increases federal tax and ONSS/RSZ bases but is not cash salary."
          />
          <NumberStepperField
            id="be-dependent-children"
            label="Dependent Children"
            value={inputs.numberOfDependentChildren}
            onChange={(numberOfDependentChildren) => {
              setInputs((current) => {
                const nextChildcareDaysMax =
                  numberOfDependentChildren *
                  BE_TAX_CONFIG.childcareMaxDaysPerChild;
                const nextInputs: BECalculatorInputs = {
                  ...current,
                  numberOfDependentChildren,
                  numberOfChildrenUnderThreeNoChildcare: Math.min(
                    current.numberOfChildrenUnderThreeNoChildcare ?? 0,
                    numberOfDependentChildren,
                  ),
                  childcareDays: Math.min(
                    current.childcareDays ?? 0,
                    nextChildcareDaysMax,
                  ),
                  isSingleParentWithChildren:
                    numberOfDependentChildren > 0
                      ? current.isSingleParentWithChildren
                      : false,
                };

                return {
                  ...nextInputs,
                  contributions: clampContributions(nextInputs),
                };
              });
            }}
            min={0}
            max={10}
            description="Increases the Belgian tax-free allowance when the child qualifies as a dependent."
          />
          <NumberStepperField
            id="be-young-children"
            label="Children Under 3, No Childcare Deduction"
            value={Math.min(
              inputs.numberOfChildrenUnderThreeNoChildcare ?? 0,
              inputs.numberOfDependentChildren ?? 0,
            )}
            onChange={(numberOfChildrenUnderThreeNoChildcare) =>
              setInputs((current) => ({
                ...current,
                numberOfChildrenUnderThreeNoChildcare: Math.min(
                  numberOfChildrenUnderThreeNoChildcare,
                  current.numberOfDependentChildren ?? 0,
                ),
              }))
            }
            min={0}
            max={inputs.numberOfDependentChildren ?? 0}
            description={`Adds EUR ${BE_TAX_CONFIG.dependentChildAllowances.underThreeNoChildcare.toLocaleString()} per selected child when childcare costs are not deducted.`}
          />
          <NumberField
            id="be-childcare-days"
            label="Eligible Childcare Days"
            value={Math.min(inputs.childcareDays ?? 0, childcareDaysMax)}
            onChange={(childcareDays) =>
              setInputs((current) => {
                const nextInputs: BECalculatorInputs = {
                  ...current,
                  childcareDays: Math.min(
                    Math.max(0, Math.floor(childcareDays)),
                    (current.numberOfDependentChildren ?? 0) *
                      BE_TAX_CONFIG.childcareMaxDaysPerChild,
                  ),
                };

                return {
                  ...nextInputs,
                  contributions: clampContributions(nextInputs),
                };
              })
            }
            min={0}
            max={childcareDaysMax}
            description={`Paid eligible care days across dependent children. The expense cap is EUR ${BE_TAX_CONFIG.childcareDailyExpenseLimit.toLocaleString()} per child/day for 2025 expenses declared in 2026.`}
          />
          <BooleanSelectField
            id="be-single-parent"
            label="Single Parent Allowance"
            value={inputs.isSingleParentWithChildren}
            onChange={(isSingleParentWithChildren) =>
              setInputs((current) => ({
                ...current,
                isSingleParentWithChildren:
                  current.numberOfDependentChildren > 0 &&
                  isSingleParentWithChildren,
              }))
            }
            trueLabel="Claim"
            falseLabel="Do not claim"
            description={`Adds EUR ${BE_TAX_CONFIG.dependentChildAllowances.singleParent.toLocaleString()} when eligible.`}
          />
          <SelectField
            id="be-expat-regime"
            label="Special Inpatriate Regime"
            value={expatRegimeType}
            onChange={(nextExpatRegimeType) =>
              setInputs((current) => {
                const nextAllowanceLimit = getBEExpatAllowanceLimit(
                  current.grossSalary + (current.taxableBenefitsInKind ?? 0),
                  nextExpatRegimeType,
                );
                const nextInputs: BECalculatorInputs = {
                  ...current,
                  expatRegimeType: nextExpatRegimeType,
                  expatRecurringAllowance:
                    nextExpatRegimeType === "none"
                      ? 0
                      : Math.min(
                          current.expatRecurringAllowance ?? 0,
                          nextAllowanceLimit,
                        ),
                };

                return {
                  ...nextInputs,
                  contributions: clampContributions(nextInputs),
                };
              })
            }
            options={BE_EXPAT_REGIME_OPTIONS}
            description={`Inbound taxpayers need at least EUR ${BE_EXPAT_REGIME_2026.inboundTaxpayerMinimumSalary.toLocaleString()} taxable remuneration; inbound researchers have no salary minimum.`}
          />
        </CalculatorFieldGrid>
      }
      contributions={
        <div className="space-y-6">
          <ContributionSlider
            label="Pension savings"
            value={inputs.contributions.pensionSavings ?? 0}
            onChange={(pensionSavings) =>
              setBelgianContribution("pensionSavings", pensionSavings)
            }
            max={pensionSavingsLimit}
            step={50}
            currency={currency}
            description="Optional Belgian pension savings contribution modeled as a federal tax reduction rather than a taxable-income deduction."
          />
          {childcareExpenseLimit > 0 ? (
            <ContributionSlider
              label="Childcare expenses"
              value={Math.min(
                inputs.contributions.childcareExpenses ?? 0,
                childcareExpenseLimit,
              )}
              onChange={(childcareExpenses) =>
                setBelgianContribution("childcareExpenses", childcareExpenses)
              }
              max={childcareExpenseLimit}
              step={10}
              currency={currency}
              description="Eligible childcare expenses on the tax certificate. The calculator applies the 45% federal tax reduction after the per-child, per-day cap."
            />
          ) : (
            <p className="rounded-md border border-zinc-800 bg-zinc-950/50 p-3 text-xs text-zinc-500">
              Add dependent children and eligible childcare days to enter
              childcare expenses for the Belgian tax reduction.
            </p>
          )}
          {charitableDonationLimit > 0 && (
            <ContributionSlider
              label="Qualifying gifts / donations"
              value={Math.min(
                inputs.contributions.charitableDonations ?? 0,
                charitableDonationLimit,
              )}
              onChange={(charitableDonations) =>
                setBelgianContribution(
                  "charitableDonations",
                  charitableDonations,
                )
              }
              max={charitableDonationLimit}
              step={25}
              currency={currency}
              description={`Approved gifts of at least EUR ${BE_TAX_CONFIG.charitableDonationMinimum.toLocaleString()} per institution/year receive a 30% tax reduction within the modeled annual cap.`}
            />
          )}
          {expatRegimeType !== "none" && expatAllowanceLimit > 0 && (
            <ContributionSlider
              label="Special expat recurring allowance"
              value={Math.min(
                inputs.expatRecurringAllowance ?? 0,
                expatAllowanceLimit,
              )}
              onChange={(expatRecurringAllowance) =>
                setInputs((current) => {
                  const nextInputs: BECalculatorInputs = {
                    ...current,
                    expatRecurringAllowance: Math.min(
                      expatRecurringAllowance,
                      getBEExpatAllowanceLimit(
                        current.grossSalary +
                          (current.taxableBenefitsInKind ?? 0),
                        current.expatRegimeType ?? "none",
                      ),
                    ),
                  };

                  return {
                    ...nextInputs,
                    contributions: clampContributions(nextInputs),
                  };
                })
              }
              max={expatAllowanceLimit}
              step={500}
              currency={currency}
              description="Employer-paid recurring cost reimbursement paid on top of salary. The calculator treats it as tax-free up to 35% and applies ONSS/RSZ to the part above the separate 30% / EUR 90,000 social-security limit."
            />
          )}
          {expatRegimeType === "inboundTaxpayer" &&
            !expatTaxpayerMinimumMet && (
              <div className="rounded-md bg-amber-950/30 border border-amber-800/40 p-3 text-sm text-amber-100">
                Inbound taxpayer treatment needs at least EUR{" "}
                {BE_EXPAT_REGIME_2026.inboundTaxpayerMinimumSalary.toLocaleString()}{" "}
                taxable remuneration in this model, so the special allowance is
                capped at zero until the threshold is met.
              </div>
            )}
        </div>
      }
      contributionsTitle="Belgium Pension, Childcare, Gift, and Expat Inputs"
      contributionsDescription="Belgian pension savings, childcare, qualifying gifts, and special inpatriate regime allowance where eligible"
      seoInfo={<BelgiumTaxInfo />}
      infoCard={
        <InfoPanel title="Modeled Scope">
          <p>
            This models ordinary full-year resident employment salary in
            Belgium, including federal personal income tax, ONSS/RSZ employee
            social security, professional expenses, municipal surcharge proxy,
            optional pension savings relief, childcare and donation tax
            reductions, and the special inpatriate taxpayer/researcher recurring
            allowance when selected.
          </p>
          <p className="mt-2">
            Belgium has local equivalents rather than US-style controls: pension
            savings is modeled as a tax reduction, and dependent-child increases
            to the tax-free allowance are shown as steppers. Childcare uses a
            day count plus an expense slider because the legal cap is per child
            per day. Donation relief is shown as a capped annual amount. The
            special regime allowance is shown as a capped annual amount because
            it depends on the employer actually paying a qualifying
            reimbursement. Marital quotient, exact commune rates, benefits in
            kind valuation worksheets, bonus withholding, legal expenses
            insurance, service vouchers, and exceptional expat
            moving/home/school reimbursements are not treated as ordinary
            recurring salary inputs here.
          </p>
        </InfoPanel>
      }
    />
  );
}

function BelgiumTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="text-xl font-semibold text-zinc-200 mb-4">
        How Your Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">Belgium</h3>
        <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
          <li>
            <strong className="text-zinc-300">Federal Tax</strong> – Belgian
            taxable income is taxed with progressive federal bands from 25% to
            50% after modeled employee social security and professional
            expenses.
          </li>
          <li>
            <strong className="text-zinc-300">ONSS / RSZ</strong> – employee
            social security is deducted from gross salary and from the
            income-tax base.
          </li>
          <li>
            <strong className="text-zinc-300">Taxable Benefits in Kind</strong>{" "}
            add the entered taxable payroll value to the federal tax and
            ONSS/RSZ bases, while cash take-home still starts from salary.
          </li>
          <li>
            <strong className="text-zinc-300">Pension Savings</strong> –
            optional Belgian pension savings are modeled as a cash contribution
            with a simplified federal tax reduction.
          </li>
          <li>
            <strong className="text-zinc-300">Childcare</strong> – eligible
            certified childcare expenses are capped per child/day and converted
            into a 45% federal tax reduction.
          </li>
          <li>
            <strong className="text-zinc-300">Gifts / Donations</strong> –
            approved gifts meeting the Belgian minimum are modeled as a 30% tax
            reduction within the annual net-income cap.
          </li>
          <li>
            <strong className="text-zinc-300">Special Inpatriate Regime</strong>{" "}
            – when selected, the calculator can add a qualifying recurring
            employer-cost allowance up to the modeled 35% tax-free cap, with a
            separate ONSS/RSZ exemption cap at 30% and EUR 90,000.
          </li>
          <li>
            <strong className="text-zinc-300">Tax-Free Allowance</strong> – the
            federal personal allowance is modeled as a tax reduction, with
            dependent-child, young-child, and single-parent increases where
            selected.
          </li>
          <li>
            <strong className="text-zinc-300">Municipal Surcharge</strong> – the
            calculator includes a representative municipal surcharge proxy
            applied to federal personal income tax instead of taxable salary.
          </li>
          <li>
            <strong className="text-zinc-300">Formula</strong> – net salary
            equals gross salary plus any selected special-regime recurring
            allowance, minus employee social security, pension savings cash
            contributions, federal tax after modeled reductions, and the
            modeled municipal surcharge.
          </li>
        </ul>
        <p className="text-zinc-400 text-sm mt-3">
          The model excludes exact commune rates, marital quotient, work bonus
          reductions, regional reductions, legal expenses insurance, service
          vouchers, alimony, mortgage-linked benefits, benefits-in-kind
          valuation worksheets, bonus withholding, exceptional expat
          reimbursements for moving, home installation, and school costs.
        </p>
      </div>
    </section>
  );
}
