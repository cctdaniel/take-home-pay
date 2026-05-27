"use client";

import {
  CalculatorFieldGrid,
  CurrencyAmountField,
  PayFrequencyField,
  SelectField,
  type SelectOption,
} from "@/components/calculator/calculator-fields";
import {
  CountryCalculatorExtensionShell,
  useCountryCalculatorExtension,
  type CountryCalculatorExtensionProps,
} from "@/components/calculator/country-extension";
import { InfoPanel } from "@/components/calculator/info-panel";
import { ContributionSlider } from "@/components/ui/contribution-slider";
import { getCountryCalculator } from "@/lib/countries/registry";
import { SC_NON_MONETARY_BENEFITS_TAX_RATE } from "@/lib/countries/sc/constants/tax-year-2026";
import type {
  SCCalculatorInputs,
  SCCitizenship,
  SCEmployeeTaxTable,
} from "@/lib/countries/sc/types";

const SEYCHELLES_EMPLOYEE_TAX_TABLE_OPTIONS: SelectOption<SCEmployeeTaxTable>[] = [
  { value: "non_citizen", label: "Non-citizen employee table" },
  { value: "citizen", label: "Citizen employee table" },
  { value: "specific_project", label: "Specific-project 3% table" },
  { value: "stevedore", label: "Stevedore 10% table" },
];

export default function SeychellesCalculatorExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const {
    inputs,
    currency,
    result,
    setGrossSalary,
    setPayFrequency,
    setInputs,
  } = useCountryCalculatorExtension<SCCalculatorInputs>(country);
  const employeeTaxTable = inputs.employeeTaxTable ?? inputs.citizenship ?? "non_citizen";
  const contributionLimits =
    getCountryCalculator(country).getContributionLimits(inputs);
  const spfVoluntaryLimit =
    contributionLimits.retirementContribution?.limit ?? 0;

  const setEmployeeTaxTable = (nextEmployeeTaxTable: SCEmployeeTaxTable) => {
    setInputs((current) => ({
      ...current,
      employeeTaxTable: nextEmployeeTaxTable,
      citizenship:
        nextEmployeeTaxTable === "citizen"
          ? "citizen"
          : ("non_citizen" satisfies SCCitizenship),
    }));
  };
  const setVoluntarySpfContribution = (retirementContribution: number) => {
    setInputs((current) => ({
      ...current,
      contributions: {
        ...current.contributions,
        retirementContribution: Math.min(
          Math.max(0, retirementContribution),
          spfVoluntaryLimit,
        ),
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
        <CalculatorFieldGrid columns={2}>
          <PayFrequencyField
            id="sc-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
          <SelectField
            id="sc-employee-tax-table"
            label="Employee Tax Table"
            value={employeeTaxTable}
            onChange={setEmployeeTaxTable}
            options={SEYCHELLES_EMPLOYEE_TAX_TABLE_OPTIONS}
            description="SRC applies ordinary citizen/non-citizen monthly bands, plus flat 3% specific-project and 10% stevedore employment tables."
          />
          <CurrencyAmountField
            id="sc-taxable-non-monetary-benefits"
            label="Taxable Non-Monetary Benefits"
            value={inputs.taxableNonMonetaryBenefits}
            onChange={(taxableNonMonetaryBenefits) =>
              setInputs((current) => ({
                ...current,
                taxableNonMonetaryBenefits: Math.max(
                  0,
                  taxableNonMonetaryBenefits,
                ),
              }))
            }
            currency={currency}
            step={1000}
            description={`Shown as an employer-only ${(SC_NON_MONETARY_BENEFITS_TAX_RATE * 100).toFixed(0)}% tax estimate; it does not reduce employee take-home pay.`}
          />
        </CalculatorFieldGrid>
      }
      contributionsTitle="Seychelles Payroll Coverage Notes"
      contributionsDescription="Employee tax-table selection, mandatory pension, voluntary SPF salary deduction, and benefit treatment"
      contributions={
        spfVoluntaryLimit > 0 ? (
          <ContributionSlider
            label={
              contributionLimits.retirementContribution?.name ??
              "SPF voluntary contribution"
            }
            value={Math.min(
              inputs.contributions.retirementContribution ?? 0,
              spfVoluntaryLimit,
            )}
            onChange={setVoluntarySpfContribution}
            max={spfVoluntaryLimit}
            step={100}
            currency={currency}
            description={
              contributionLimits.retirementContribution?.description ??
              "Optional Seychelles Pension Fund voluntary saving made through workplace salary deduction."
            }
          />
        ) : undefined
      }
      contributionsEmptyState="No voluntary contribution slider is shown at zero salary because the SPF salary-deduction cap is the remaining after-tax cash pay, and SPF voluntary saving is not a general employee income-tax relief. The employee tax-table controls above and mandatory pension deduction still apply when salary is entered."
      seoInfo={<SeychellesTaxInfo />}
      infoCard={
        <InfoPanel title="Modeled Scope">
          <p>
            This models ordinary full-year employment salary in Seychelles using
            the selected SRC citizen or non-citizen employee tax table and the
            statutory employee pension deduction.
          </p>
          <p className="mt-2">
            Specific-project and stevedore tables can be selected as separate
            employment categories above. Employer-only costs do not reduce
            employee take-home pay, and treaty positions need taxpayer-specific
            facts. Taxable non-monetary benefits can be entered separately
            above; the SRC tax is payable by the employer and is shown without
            reducing employee net salary.
          </p>
          <p className="mt-2">
            SPF voluntary contributions are available as workplace salary
            deductions and can be entered above. They reduce cash take-home pay,
            but the reviewed SRC/SPF guidance does not make them income-tax
            relief.
          </p>
        </InfoPanel>
      }
    />
  );
}

function SeychellesTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="text-xl font-semibold text-zinc-200 mb-4">
        How Your Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">
          Seychelles
        </h3>
        <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
          <li>
            <strong className="text-zinc-300">Income Tax</strong> - monthly SRC
            employee tax bands are annualized, with separate citizen and
            non-citizen tables.
          </li>
          <li>
            <strong className="text-zinc-300">Specific Projects</strong> - SRC
            taxes qualifying specific-project employment emoluments at 3%.
          </li>
          <li>
            <strong className="text-zinc-300">Stevedores</strong> - qualifying
            dock-work emoluments use the 10% stevedore table.
          </li>
          <li>
            <strong className="text-zinc-300">Pension</strong> - the employee
            Seychelles Pension Fund contribution is modeled at 5% of gross
            salary.
          </li>
          <li>
            <strong className="text-zinc-300">
              Non-Monetary Benefits
            </strong>{" "}
            - taxable benefits entered above are shown with the 15% employer
            tax estimate and are not deducted from employee take-home pay.
          </li>
          <li>
            <strong className="text-zinc-300">Voluntary Savings</strong> - SPF
            voluntary contributions can be modeled as a workplace salary
            deduction that reduces cash take-home pay without reducing income
            tax.
          </li>
        </ul>
      </div>
    </section>
  );
}
