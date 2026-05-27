"use client";

import {
  CalculatorFieldGrid,
  NumberStepperField,
  PayFrequencyField,
  SelectField,
} from "@/components/calculator/calculator-fields";
import {
  CountryCalculatorExtensionShell,
  useCountryCalculatorExtension,
} from "@/components/calculator/country-extension";
import { InfoPanel } from "@/components/calculator/info-panel";
import { ContributionSlider } from "@/components/ui/contribution-slider";
import { getCountryCalculator } from "@/lib/countries/registry";
import type {
  VNCalculatorInputs,
  VNContributionInputs,
  VNInsuranceCoverage,
  VNResidencyStatus,
} from "@/lib/countries/types";
import { clampAmount } from "@/lib/utils";
import type { CountryCalculatorExtensionProps } from "../country-extension";

export default function VNCountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const { inputs, setInputs, currency, result, setGrossSalary, setPayFrequency } =
    useCountryCalculatorExtension<VNCalculatorInputs>(country);
  const contributionLimits =
    getCountryCalculator(country).getContributionLimits(inputs);
  const contributionEntries = (
    Object.entries(contributionLimits) as Array<
      [
        keyof VNContributionInputs,
        (typeof contributionLimits)[keyof typeof contributionLimits],
      ]
    >
  ).filter(([, limit]) => limit.limit > 0);

  const setContribution = (
    key: keyof VNContributionInputs,
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
        <div className="space-y-4">
          <CalculatorFieldGrid columns={2}>
            <PayFrequencyField
              id="vn-pay-frequency"
              value={inputs.payFrequency}
              onChange={setPayFrequency}
            />
            <SelectField
              id="vn-residency-status"
              label="Tax Residency"
              value={inputs.residencyStatus}
              onChange={(residencyStatus) =>
                setInputs((current) => ({
                  ...current,
                  residencyStatus: residencyStatus as VNResidencyStatus,
                }))
              }
              options={[
                { value: "resident", label: "Resident progressive PIT" },
                { value: "nonResident", label: "Non-resident 20%" },
              ]}
              description="Residents use progressive PIT and family deductions; non-residents use 20% on Vietnam employment income."
            />
            <SelectField
              id="vn-insurance-coverage"
              label="Payroll Insurance Coverage"
              value={inputs.insuranceCoverage}
              onChange={(insuranceCoverage) =>
                setInputs((current) => ({
                  ...current,
                  insuranceCoverage:
                    insuranceCoverage as VNInsuranceCoverage,
                }))
              }
              options={[
                {
                  value: "vietnameseEmployee",
                  label: "Vietnamese employee: SI + HI + UI",
                },
                {
                  value: "foreignCovered",
                  label: "Foreign employee: SI + HI",
                },
                {
                  value: "exempt",
                  label: "Exempt/not covered",
                },
              ]}
              description="Foreign employees covered by compulsory social insurance are not subject to unemployment insurance."
            />
            <NumberStepperField
              id="vn-dependents"
              label="Tax Dependents"
              value={inputs.numberOfDependents}
              onChange={(numberOfDependents) =>
                setInputs((current) => ({ ...current, numberOfDependents }))
              }
              min={0}
              max={10}
              description="Resident deduction of 74.4M VND/year per dependent under the 2026 PIT law."
            />
          </CalculatorFieldGrid>

          <InfoPanel title="Vietnam assumptions" tone="neutral">
            Modeled with the 2026 resident salary/wage PIT law: five progressive
            bands from 5% to 35%, personal deduction of 186,000,000 VND/year
            and dependent deduction of 74,400,000 VND/year. Non-resident
            employment income is modeled at 20% of gross Vietnam employment
            income. Payroll insurance options distinguish Vietnamese employees
            from covered foreign employees, who are not subject to unemployment
            insurance. Employer contributions are employer costs. Business
            income, irregular income, treaty positions, and special salary
            exemptions need separate return or legal facts. Law 109 authorizes
            resident healthcare and education-training expense deductions only
            at Government-specified levels, so this page will expose those
            amount inputs once a calculable implementing cap is published.
          </InfoPanel>
        </div>
      }
      seoInfo={<VNTaxInfo />}
      contributionsTitle="Vietnam Pension and Donation Deductions"
      contributionsDescription="Resident deductions for voluntary pension saving and approved charity or humanitarian contributions"
      contributions={
        contributionEntries.length > 0 ? (
          <div className="space-y-6">
            {contributionEntries.map(([key, limit]) => (
              <ContributionSlider
                key={key}
                label={limit.name}
                value={Math.min(inputs.contributions[key] ?? 0, limit.limit)}
                onChange={(amount) => setContribution(key, amount)}
                max={limit.limit}
                step={Math.max(100_000, Math.round(limit.limit / 100))}
                currency={currency}
                description={limit.description}
              />
            ))}
          </div>
        ) : undefined
      }
      contributionsEmptyState={
        contributionEntries.length === 0
          ? "Vietnam voluntary pension and approved charity deductions are modeled for resident salary calculations only. Non-resident employment income is taxed on gross Vietnam employment income in this salary page."
          : undefined
      }
    />
  );
}

function VNTaxInfoContent() {
  return (
    <div>
      <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">Vietnam</h3>
      <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
        <li><strong className="text-zinc-300">Resident PIT</strong> – taxable employment income is taxed with resident progressive PIT bands from 5% to 35%.</li>
        <li><strong className="text-zinc-300">Employee Insurance</strong> – social insurance, health insurance, and unemployment insurance are deducted using the modeled rates and salary caps.</li>
        <li><strong className="text-zinc-300">Personal Deduction</strong> – the monthly personal deduction is annualized and subtracted before tax.</li>
        <li><strong className="text-zinc-300">Dependent Deduction</strong> – each entered dependent adds the modeled annual dependent deduction.</li>
        <li><strong className="text-zinc-300">Voluntary Deductions</strong> – resident voluntary pension and approved charitable, humanitarian, or study-promotion contributions reduce taxable salary when entered.</li>
        <li><strong className="text-zinc-300">Taxable Income</strong> – gross salary minus employee insurance, personal, dependent, and selected voluntary deductions equals taxable income.</li>
      </ul>
      <p className="text-zinc-400 text-sm mt-3">The calculator models resident and non-resident employment income and uses the Region I cap for unemployment insurance. Employer contributions are employer costs, while trade-union fees, business income, irregular income, treaty positions, and special salary exemptions need separate return or legal facts. Law 109 authorizes healthcare and education-training expense deductions at Government-specified levels; those amount inputs are intentionally not shown until an implementing cap is published.</p>
    </div>
  );
}

function VNTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="mb-4 text-xl font-semibold text-zinc-200">
        How Vietnam Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <VNTaxInfoContent />
      </div>
    </section>
  );
}
