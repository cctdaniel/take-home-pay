"use client";

import {
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
import { FR_IMPATRIATE_REGIME_2026 } from "@/lib/countries/fr/constants/tax-year-2026";
import { getCountryCalculator } from "@/lib/countries/registry";
import type {
  FRCalculatorInputs,
  FRHouseholdStatus,
  FRImpatriateRegime,
  FRProfessionalExpenseMethod,
} from "@/lib/countries/fr/types";
import { formatCurrency } from "@/lib/format";
import { clampAmount, clampCount } from "@/lib/utils";

function calculateFrenchHouseholdParts(
  householdStatus: FRHouseholdStatus,
  numberOfChildren: number,
) {
  const children = Math.max(0, Math.floor(numberOfChildren));
  const baseParts = householdStatus === "married_pacs" ? 2 : 1;
  const childParts = Math.min(children, 2) * 0.5 + Math.max(0, children - 2);
  const singleParentExtra =
    householdStatus === "single_parent" && children > 0 ? 0.5 : 0;

  return baseParts + childParts + singleParentExtra;
}

const FR_IMPATRIATE_REGIME_OPTIONS: Array<{
  value: FRImpatriateRegime;
  label: string;
}> = [
  { value: "none", label: "No impatriate regime" },
  { value: "forfait30", label: "30% forfaitary premium" },
  { value: "actualPremium", label: "Actual contract premium" },
];

function calculateImpatriatePremiumLimit(grossSalary: number) {
  return Math.max(
    0,
    grossSalary * FR_IMPATRIATE_REGIME_2026.globalSalaryExemptionCapRate,
  );
}

export default function FRCountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const {
    inputs,
    currency,
    result,
    setPayFrequency,
    setInputs,
  } = useCountryCalculatorExtension<FRCalculatorInputs>(country);
  const contributionLimits =
    getCountryCalculator(country).getContributionLimits(inputs);
  const retirementSavingsLimit = contributionLimits.retirementSavings.limit;
  const charitableDonationLimit = contributionLimits.charitableDonations.limit;
  const impatriateRegime = inputs.impatriateRegime ?? "none";
  const impatriatePremiumLimit = calculateImpatriatePremiumLimit(
    inputs.grossSalary,
  );

  const setGrossSalary = (grossSalary: number) => {
    setInputs((current) => {
      const nextInputs = { ...current, grossSalary };
      const nextLimits =
        getCountryCalculator(country).getContributionLimits(nextInputs);

      return {
        ...nextInputs,
        contributions: {
          ...current.contributions,
          retirementSavings: clampAmount(
            current.contributions.retirementSavings,
            nextLimits.retirementSavings.limit,
          ),
          actualProfessionalExpenses: clampAmount(
            current.contributions.actualProfessionalExpenses,
            grossSalary,
          ),
          charitableDonations: clampAmount(
            current.contributions.charitableDonations,
            nextLimits.charitableDonations.limit,
          ),
        },
        frenchReferenceSalary: clampAmount(
          current.frenchReferenceSalary ?? 0,
          grossSalary,
        ),
        impatriatePremiumAmount: clampAmount(
          current.impatriatePremiumAmount ?? 0,
          calculateImpatriatePremiumLimit(grossSalary),
        ),
      };
    });
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
            id="fr-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
          <CurrencyAmountField
            id="fr-taxable-benefits-in-kind"
            label="Taxable Benefits in Kind"
            value={inputs.taxableBenefitsInKind}
            onChange={(taxableBenefitsInKind) =>
              setInputs((current) => ({
                ...current,
                taxableBenefitsInKind: Math.max(0, taxableBenefitsInKind),
              }))
            }
            currency={currency}
            step={100}
            description="Annual taxable avantages en nature from payroll. They increase income-tax and social-contribution bases but are not cash salary."
          />
          <SelectField
            id="fr-household-status"
            label="Tax household status"
            value={inputs.householdStatus}
            onChange={(householdStatus) =>
              setInputs((current) => ({
                ...current,
                householdStatus,
                taxHouseholdParts: calculateFrenchHouseholdParts(
                  householdStatus,
                  current.numberOfChildren,
                ),
              }))
            }
            options={[
              { value: "single", label: "Single / divorced / separated" },
              { value: "married_pacs", label: "Married or PACS joint return" },
              { value: "single_parent", label: "Single parent living alone" },
            ]}
            description="Controls base quotient parts and the quotient-family cap."
          />
          <NumberStepperField
            id="fr-number-of-children"
            label="Dependent children"
            value={inputs.numberOfChildren}
            onChange={(numberOfChildren) =>
              setInputs((current) => ({
                ...current,
                numberOfChildren,
                taxHouseholdParts: calculateFrenchHouseholdParts(
                  current.householdStatus,
                  numberOfChildren,
                ),
              }))
            }
            min={0}
            max={8}
            description="First two children add half-parts; the third and later children add one part each."
          />
          <SelectField
            id="fr-professional-expense-method"
            label="Professional expenses"
            value={inputs.professionalExpenseMethod}
            onChange={(professionalExpenseMethod) =>
              setInputs((current) => ({
                ...current,
                professionalExpenseMethod:
                  professionalExpenseMethod as FRProfessionalExpenseMethod,
              }))
            }
            options={[
              { value: "standard_10_percent", label: "Automatic 10% deduction" },
              { value: "actual", label: "Actual justified expenses" },
            ]}
            description="France lets employees choose the automatic 10% deduction or justified actual expenses."
          />
          <SelectField
            id="fr-impatriate-regime"
            label="Impatriate Salary Regime"
            value={impatriateRegime}
            onChange={(nextImpatriateRegime) =>
              setInputs((current) => ({
                ...current,
                impatriateRegime: nextImpatriateRegime,
                impatriatePremiumAmount:
                  nextImpatriateRegime === "actualPremium"
                    ? clampAmount(
                        current.impatriatePremiumAmount ?? 0,
                        calculateImpatriatePremiumLimit(current.grossSalary),
                      )
                    : 0,
              }))
            }
            options={FR_IMPATRIATE_REGIME_OPTIONS}
            description="Models the salary-premium part of France's impatriate regime; passive income and foreign-workday allocation are not salary inputs."
          />
          {impatriateRegime !== "none" && (
            <CurrencyAmountField
              id="fr-reference-salary"
              label="French Reference Salary"
              value={inputs.frenchReferenceSalary ?? 0}
              onChange={(frenchReferenceSalary) =>
                setInputs((current) => ({
                  ...current,
                  frenchReferenceSalary: clampAmount(
                    frenchReferenceSalary,
                    current.grossSalary,
                  ),
                }))
              }
              currency={currency}
              max={inputs.grossSalary}
              step={500}
              description="Comparable French salary floor. Leave at zero when you do not want the calculator to limit the exemption by a reference salary."
            />
          )}
          {inputs.professionalExpenseMethod === "actual" && (
            <ContributionSlider
              label="Actual professional expenses"
              value={inputs.contributions.actualProfessionalExpenses}
              onChange={(actualProfessionalExpenses) =>
                setInputs((current) => ({
                  ...current,
                  contributions: {
                    ...current.contributions,
                    actualProfessionalExpenses: clampAmount(
                      actualProfessionalExpenses,
                      current.grossSalary,
                    ),
                  },
                }))
              }
              max={inputs.grossSalary}
              currency={currency}
              step={100}
              description="Use only justified work expenses; reimbursements may need to be added back to taxable salary."
            />
          )}
        </CalculatorFieldGrid>
      }
      contributions={
        <div className="space-y-6">
          <ContributionSlider
            label="PER retirement savings"
            value={Math.min(
              inputs.contributions.retirementSavings,
              retirementSavingsLimit,
            )}
            onChange={(retirementSavings) =>
              setInputs((current) => ({
                ...current,
                contributions: {
                  ...current.contributions,
                  retirementSavings: clampAmount(
                    retirementSavings,
                    retirementSavingsLimit,
                  ),
                },
              }))
            }
            max={retirementSavingsLimit}
            step={100}
            currency={currency}
            description={`Modeled PER deduction ceiling: ${formatCurrency(
              retirementSavingsLimit,
              currency,
            )}.`}
          />
          <ContributionSlider
            label="General charitable donations"
            value={Math.min(
              inputs.contributions.charitableDonations,
              charitableDonationLimit,
            )}
            onChange={(charitableDonations) =>
              setInputs((current) => ({
                ...current,
                contributions: {
                  ...current.contributions,
                  charitableDonations: clampAmount(
                    charitableDonations,
                    charitableDonationLimit,
                  ),
                },
              }))
            }
            max={charitableDonationLimit}
            step={50}
            currency={currency}
            description="Modeled at the 66% tax-reduction rate within the ordinary 20% income limit."
          />
          {impatriateRegime === "actualPremium" && (
            <ContributionSlider
              label="Actual impatriation premium"
              value={Math.min(
                inputs.impatriatePremiumAmount ?? 0,
                impatriatePremiumLimit,
              )}
              onChange={(impatriatePremiumAmount) =>
                setInputs((current) => ({
                  ...current,
                  impatriatePremiumAmount: clampAmount(
                    impatriatePremiumAmount,
                    calculateImpatriatePremiumLimit(current.grossSalary),
                  ),
                }))
              }
              max={impatriatePremiumLimit}
              step={500}
              currency={currency}
              description="Use only the contractually separate impatriation premium. The exempt amount is still limited by the 50% cap and any French reference-salary floor entered above."
            />
          )}
          {impatriateRegime === "forfait30" && (
            <p className="rounded bg-zinc-800/60 p-3 text-xs text-zinc-400">
              The forfaitary impatriation premium is modeled at{" "}
              {(FR_IMPATRIATE_REGIME_2026.forfaitPremiumRate * 100).toFixed(0)}
              % of gross salary, then limited by the 50% salary cap and any
              French reference-salary floor entered above.
            </p>
          )}
          {result.breakdown.type === "FR" &&
            result.breakdown.familyQuotientCapApplied && (
              <p className="rounded bg-amber-400/10 p-2 text-xs text-amber-200">
                The family quotient benefit is capped at{" "}
                {formatCurrency(result.breakdown.familyQuotientCap, currency)}
                for the selected household.
              </p>
            )}
        </div>
      }
      contributionsTitle="Retirement & Deduction Inputs"
      contributionsDescription="French PER, professional expense, donation, impatriate premium, and tax-household controls"
      seoInfo={<FranceTaxInfo />}
      infoCard={
        <InfoPanel title="Modeled Scope">
          <p>
            This models ordinary full-year resident employment salary in France
            using the 2026 income-tax scale for 2025 income, household quotient
            parts, the ordinary family-quotient cap, the decote, the automatic
            10% or actual professional expense deduction, PER savings, and
            general charitable donations. The impatriate salary-premium regime
            is included where selected.
          </p>
          <p className="mt-2">
            France has local equivalents rather than US-style controls:
            household status and children drive quotient parts, PER is the
            retirement deduction, and professional expenses replace a generic
            standard deduction toggle. The impatriate control models the 30%
            forfaitary premium or a contract premium, with the French reference
            salary floor visible instead of hidden.
          </p>
          <p className="mt-2">
            Employee social contributions remain a visible combined estimate
            because exact payslip contributions depend on tranche, cadre status,
            collective agreements, complementary pension setup, and employer
            payroll data. Taxable benefits in kind can be entered as the
            annual payroll value, while valuation worksheets remain
            payroll-specific.
          </p>
        </InfoPanel>
      }
    />
  );
}

function FranceTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="mb-4 text-xl font-semibold text-zinc-200">
        How France Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <ul className="mt-3 list-inside list-disc space-y-1 text-zinc-400">
          <li>
            <strong className="text-zinc-300">Income Tax</strong> uses the
            official 2026 barème for 2025 income and divides taxable income by
            household quotient parts before multiplying tax back up.
          </li>
          <li>
            <strong className="text-zinc-300">Family Quotient</strong> is
            calculated from household status and dependent children, with the
            ordinary cap applied where the additional parts save more than the
            statutory maximum.
          </li>
          <li>
            <strong className="text-zinc-300">Professional Expenses</strong>{" "}
            use either the automatic 10% deduction or user-entered justified
            actual expenses.
          </li>
          <li>
            <strong className="text-zinc-300">Taxable Benefits in Kind</strong>{" "}
            add the entered avantages en nature value to the income-tax and
            social-contribution bases, while cash take-home still starts from
            salary.
          </li>
          <li>
            <strong className="text-zinc-300">PER and Donations</strong> model
            retirement-savings deductions and general 66% donation reductions
            within the ordinary limits.
          </li>
          <li>
            <strong className="text-zinc-300">Impatriate Salary Regime</strong>{" "}
            models the salary-premium exemption when selected, using either the
            30% forfaitary premium proxy or an actual contract premium with the
            50% salary cap and reference-salary floor.
          </li>
          <li>
            <strong className="text-zinc-300">Payroll Contributions</strong>{" "}
            remain a combined employee estimate; exact French payroll requires
            employer-plan facts not collected in this salary page.
          </li>
        </ul>
      </div>
    </section>
  );
}
