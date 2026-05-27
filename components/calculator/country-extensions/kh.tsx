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
import {
  KH_FRINGE_BENEFIT_TAX_RATE,
  KH_NSSF_HEALTH_MONTHLY_FLOOR,
  KH_NSSF_MONTHLY_CEILING,
  KH_NSSF_PENSION_MONTHLY_FLOOR,
  KH_NON_RESIDENT_SALARY_TAX_RATE,
} from "@/lib/countries/kh/constants/tax-year-2026";
import type {
  KHCalculatorInputs,
  KHTaxResidency,
} from "@/lib/countries/kh/types";

export default function CambodiaCalculatorExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const {
    inputs,
    currency,
    result,
    setGrossSalary,
    setPayFrequency,
    setInputs,
  } = useCountryCalculatorExtension<KHCalculatorInputs>(country);
  const monthlyCashGross = Math.max(0, inputs.grossSalary) / 12;
  const monthlyNssfMax = Math.min(monthlyCashGross, KH_NSSF_MONTHLY_CEILING);

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
            id="kh-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
          <SelectField
            id="kh-tax-residency"
            label="Tax Residency"
            value={inputs.taxResidency}
            onChange={(taxResidency) =>
              setInputs((current) => ({
                ...current,
                taxResidency: taxResidency as KHTaxResidency,
                hasDependentSpouse:
                  taxResidency === "resident"
                    ? current.hasDependentSpouse
                    : false,
                dependentChildren:
                  taxResidency === "resident"
                    ? current.dependentChildren
                    : 0,
              }))
            }
            options={[
              { value: "resident", label: "Resident progressive bands" },
              { value: "nonResident", label: "Non-resident 20% flat" },
            ]}
            description="Non-resident Cambodian-source salary is modeled at the flat GDT Tax on Salary return rate."
          />
          <BooleanSelectField
            id="kh-dependent-spouse"
            label="Dependent Spouse"
            value={inputs.hasDependentSpouse}
            onChange={(hasDependentSpouse) =>
              setInputs((current) => ({
                ...current,
                hasDependentSpouse:
                  current.taxResidency === "resident"
                    ? hasDependentSpouse
                    : false,
              }))
            }
            trueLabel="Yes"
            falseLabel="No"
            description={
              inputs.taxResidency === "resident"
                ? "Adds the KHR 150,000 monthly spouse allowance."
                : "Resident family allowances do not apply to non-resident flat salary tax."
            }
            className={
              inputs.taxResidency === "resident"
                ? undefined
                : "opacity-60"
            }
          />
          <NumberStepperField
            id="kh-dependent-children"
            label="Minor Children"
            value={inputs.dependentChildren}
            min={0}
            max={4}
            onChange={(dependentChildren) =>
              setInputs((current) => ({
                ...current,
                dependentChildren:
                  current.taxResidency === "resident"
                    ? Math.trunc(Math.min(Math.max(dependentChildren, 0), 4))
                    : 0,
              }))
            }
            description={
              inputs.taxResidency === "resident"
                ? "Adds KHR 150,000 per month per child, modeled up to four children."
                : "Resident child allowances do not apply to non-resident flat salary tax."
            }
            className={
              inputs.taxResidency === "resident"
                ? undefined
                : "opacity-60"
            }
          />
          <CurrencyAmountField
            id="kh-taxable-fringe-benefits"
            label="Taxable Fringe Benefits"
            value={inputs.taxableFringeBenefits}
            onChange={(taxableFringeBenefits) =>
              setInputs((current) => ({
                ...current,
                taxableFringeBenefits: Math.max(0, taxableFringeBenefits),
              }))
            }
            currency={currency}
            step={100000}
            description={`Separate GDT Tax on Salary fringe-benefit base taxed at ${(KH_FRINGE_BENEFIT_TAX_RATE * 100).toFixed(0)}%.`}
          />
          <CurrencyAmountField
            id="kh-nssf-monthly-wage"
            label="Monthly NSSF Wage"
            value={Math.min(
              inputs.nssfMonthlyWage || monthlyNssfMax,
              monthlyNssfMax,
            )}
            onChange={(nssfMonthlyWage) =>
              setInputs((current) => ({
                ...current,
                nssfMonthlyWage: Math.min(
                  Math.max(0, nssfMonthlyWage),
                  monthlyNssfMax,
                ),
              }))
            }
            currency={currency}
            step={50000}
            min={0}
            max={monthlyNssfMax}
            description={`Leave at 0 to use monthly cash salary capped at KHR ${KH_NSSF_MONTHLY_CEILING.toLocaleString()}. Health care uses a KHR ${KH_NSSF_HEALTH_MONTHLY_FLOOR.toLocaleString()} floor and official assumed-wage bands; pension uses a KHR ${KH_NSSF_PENSION_MONTHLY_FLOOR.toLocaleString()} floor.`}
          />
        </CalculatorFieldGrid>
      }
      contributionsTitle="Cambodia Payroll and Allowance Notes"
      contributionsDescription="Tax residency, family allowances, fringe benefits, and employee NSSF are selected above"
      contributionsEmptyState="Tax residency, dependent allowances, taxable fringe benefits, and mandatory employee NSSF are modeled above. The reviewed GDT/NSSF salary guidance does not turn voluntary pension top-ups into a general employee salary deduction."
      seoInfo={<CambodiaTaxInfo />}
      infoCard={
        <InfoPanel title="Modeled Scope">
          <p>
            This models ordinary full-year resident employment salary in
            Cambodia, including tax on salary, non-resident flat salary tax
            when selected, family allowances where eligible, taxable fringe
            benefits, and employee NSSF health and pension contributions.
          </p>
          <p className="mt-2">
            Non-resident salary tax is modeled at{" "}
            {(KH_NON_RESIDENT_SALARY_TAX_RATE * 100).toFixed(0)}%. Fringe
            benefit tax is modeled as a separate 20% tax on the benefit value
            you enter. Employee health care and pension contributions use the
            monthly NSSF wage you enter, while employer NSSF shares,
            occupational risk contributions, and special foreign-currency wage
            conversion rules remain outside employee cash take-home.
          </p>
        </InfoPanel>
      }
    />
  );
}

function CambodiaTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="text-xl font-semibold text-zinc-200 mb-4">
        How Your Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">
          Cambodia
        </h3>
        <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
          <li>
            <strong className="text-zinc-300">Salary Tax</strong> - monthly
            resident tax-on-salary bands are annualized after modeled spouse
            and child allowances; non-resident salary uses the 20% flat rate.
          </li>
          <li>
            <strong className="text-zinc-300">Fringe Benefits</strong> -
            taxable benefits entered above are taxed separately at 20% and are
            not added to cash gross salary.
          </li>
          <li>
            <strong className="text-zinc-300">NSSF</strong> - employee health
            care uses the official assumed-wage bands from KHR 200,000 to KHR
            1,200,000 per month, while pension uses a KHR 400,000 floor and KHR
            1,200,000 ceiling.
          </li>
          <li>
            <strong className="text-zinc-300">Voluntary Pension</strong> - NSSF
            the reviewed salary guidance does not make voluntary pension
            top-ups a general employee salary deduction.
          </li>
        </ul>
      </div>
    </section>
  );
}
