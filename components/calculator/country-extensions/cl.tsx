"use client";

import {
  CalculatorFieldGrid,
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
  CL_AFP_PENSION_RATE,
  CL_APV_ANNUAL_CAP,
  CL_APV_REGIME_A_BONUS_CAP,
  CL_APV_REGIME_A_BONUS_RATE,
  CL_HEALTH_RATE,
  CL_UNEMPLOYMENT_INDEFINITE_EMPLOYEE_RATE,
} from "@/lib/countries/cl/constants/tax-year-2026";
import type {
  CLApvTaxRegime,
  CLCalculatorInputs,
  CLContractType,
} from "@/lib/countries/cl/types";
import { clampAmount, clampCount } from "@/lib/utils";

const CONTRACT_OPTIONS: Array<{
  value: CLContractType;
  label: string;
}> = [
  { value: "indefinite", label: "Indefinite contract" },
  { value: "fixedTermOrWork", label: "Fixed-term, work, or service contract" },
];

const APV_REGIME_OPTIONS: Array<{
  value: CLApvTaxRegime;
  label: string;
}> = [
  { value: "regimeB", label: "Regime B - tax deduction" },
  { value: "regimeA", label: "Regime A - fiscal bonus" },
];

export default function CLCountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const {
    inputs,
    currency,
    result,
    setGrossSalary,
    setPayFrequency,
    setInputs,
  } = useCountryCalculatorExtension<CLCalculatorInputs>(country);
  const contributionLimits = getCountryCalculator(country).getContributionLimits(inputs);
  const apvLimit = contributionLimits.retirementContribution?.limit ?? 0;

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
            id="cl-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
          <SelectField
            id="cl-contract-type"
            label="Employment Contract Type"
            value={inputs.contractType}
            onChange={(contractType) =>
              setInputs((current) => ({ ...current, contractType }))
            }
            options={CONTRACT_OPTIONS}
            description="Only indefinite contracts have the 0.6% employee unemployment-insurance contribution."
          />
          <SelectField
            id="cl-apv-regime"
            label="APV Tax Regime"
            value={inputs.apvTaxRegime}
            onChange={(apvTaxRegime) =>
              setInputs((current) => ({ ...current, apvTaxRegime }))
            }
            options={APV_REGIME_OPTIONS}
            description="Regime B reduces current taxable income; regime A keeps taxable income unchanged and adds a 15% state bonus to the APV account."
          />
        </CalculatorFieldGrid>
      }
      contributions={
        <div className="space-y-6">
          {apvLimit > 0 && (
            <ContributionSlider
              label={
                contributionLimits.retirementContribution?.name ??
                "APV retirement savings"
              }
              value={Math.min(
                inputs.contributions.retirementContribution ?? 0,
                apvLimit,
              )}
              onChange={(amount) =>
                setInputs((current) => ({
                  ...current,
                  contributions: {
                    ...current.contributions,
                    retirementContribution: clampAmount(amount, apvLimit),
                  },
                }))
              }
              max={apvLimit}
              step={100000}
              currency={currency}
              description={
                contributionLimits.retirementContribution?.description ??
                "APV retirement savings."
              }
            />
          )}
          <ContributionSlider
            label="Additional Isapre health-plan premium"
            value={inputs.contributions.medicalExpenses ?? 0}
            onChange={(medicalExpenses) =>
              setInputs((current) => ({
                ...current,
                contributions: {
                  ...current.contributions,
                  medicalExpenses: clampAmount(
                    medicalExpenses,
                    current.grossSalary,
                  ),
                },
              }))
            }
            max={inputs.grossSalary}
            currency={currency}
            step={10000}
            description="Enter annual employee-paid Isapre plan cost above the mandatory 7% health contribution. It reduces take-home pay but not taxable income."
          />
        </div>
      }
      contributionsTitle="APV & Health Plan Deductions"
      contributionsDescription="Chile APV regime A or B savings and optional Isapre premium above the 7% legal health contribution"
      seoInfo={<ChileTaxInfo />}
      infoCard={
        <InfoPanel title="Modeled Scope">
          <p>
            This models Chile dependent employment income using the SII
            second-category table, AFP pension, 7% health contribution,
            contract-specific unemployment insurance, APV regime A or B savings, and
            any additional Isapre premium entered above the legal health
            contribution.
          </p>
          <p className="mt-2">
            AFP administrator commissions, monthly UTM changes, APV withdrawal
            taxes, and non-salary income are outside this annual model.
          </p>
        </InfoPanel>
      }
    />
  );
}

function ChileTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="mb-4 text-xl font-semibold text-zinc-200">
        How Chile Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <ul className="mt-3 list-inside list-disc space-y-1 text-zinc-400">
          <li>
            <strong className="text-zinc-300">Second-Category Tax</strong> uses
            the June 2026 SII monthly table annualized over 12 equal pay
            periods.
          </li>
          <li>
            <strong className="text-zinc-300">Payroll Contributions</strong>{" "}
            model AFP pension at {(CL_AFP_PENSION_RATE * 100).toFixed(0)}% and
            health at {(CL_HEALTH_RATE * 100).toFixed(0)}% up to the modeled
            2026 cap.
          </li>
          <li>
            <strong className="text-zinc-300">Unemployment Insurance</strong>{" "}
            applies the{" "}
            {(CL_UNEMPLOYMENT_INDEFINITE_EMPLOYEE_RATE * 100).toFixed(1)}%
            employee contribution only for indefinite contracts.
          </li>
          <li>
            <strong className="text-zinc-300">APV</strong> models regime B as
            a current taxable-income deduction, or regime A as no current
            deduction with a {(CL_APV_REGIME_A_BONUS_RATE * 100).toFixed(0)}%
            fiscal bonus capped at CLP{" "}
            {CL_APV_REGIME_A_BONUS_CAP.toLocaleString()}. APV contributions are
            capped at CLP {CL_APV_ANNUAL_CAP.toLocaleString()}.
          </li>
          <li>
            <strong className="text-zinc-300">Additional Isapre Premium</strong>{" "}
            can be entered for employee-paid plan cost above the mandatory 7%
            health contribution; it is a payroll cash deduction, not a taxable
            income deduction.
          </li>
        </ul>
      </div>
    </section>
  );
}
