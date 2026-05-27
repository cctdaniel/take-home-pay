"use client";

import {
  CalculatorFieldGrid,
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
import {
  PE_AFP_ANNUAL_INSURANCE_CAP,
  PE_AFP_INSURANCE_RATE,
  PE_AFP_MANDATORY_FUND_RATE,
  PE_ADDITIONAL_DEDUCTION_LIMIT,
  PE_AFP_PENSION_SYSTEMS,
  PE_GRATIFICATION_BONUS_RATES,
  PE_ONP_CONTRIBUTION_RATE,
  PE_SEVEN_UIT_DEDUCTION,
  PE_UIT,
} from "@/lib/countries/pe/constants/tax-year-2026";
import type {
  PEAfpCommissionMode,
  PECalculatorInputs,
  PEGratificationHealthCoverage,
  PEPensionSystem,
  PESalaryPackageMode,
} from "@/lib/countries/pe/types";

function clampAmount(value: number, max: number) {
  return Math.min(Math.max(0, value), Math.max(0, max));
}

const PE_SALARY_PACKAGE_OPTIONS: SelectOption<PESalaryPackageMode>[] = [
  {
    value: "includedInGross",
    label: "Gross includes statutory gratifications",
  },
  {
    value: "additionalToGross",
    label: "Add gratifications on top",
  },
  {
    value: "none",
    label: "No statutory gratifications",
  },
];

const PE_HEALTH_COVERAGE_OPTIONS: SelectOption<PEGratificationHealthCoverage>[] =
  [
    { value: "essalud", label: "EsSalud bonus 9%" },
    { value: "eps", label: "EPS bonus 6.75%" },
  ];

const PE_PENSION_SYSTEM_OPTIONS: SelectOption<PEPensionSystem>[] = [
  { value: "onp", label: "ONP/SNP - 13%" },
  { value: "afpHabitat", label: "AFP Habitat" },
  { value: "afpIntegra", label: "AFP Integra" },
  { value: "afpPrima", label: "AFP Prima" },
  { value: "afpProfuturo", label: "AFP Profuturo" },
];

const PE_AFP_COMMISSION_OPTIONS: SelectOption<PEAfpCommissionMode>[] = [
  { value: "flow", label: "Deduct flow commission from salary" },
  { value: "balance", label: "Balance commission only" },
];

export default function PECountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const {
    inputs,
    currency,
    result,
    setGrossSalary,
    setPayFrequency,
    setInputs,
  } = useCountryCalculatorExtension<PECalculatorInputs>(country);
  const contributionLimits = getCountryCalculator(country).getContributionLimits(inputs);
  const expenseLimit = contributionLimits.qualifyingExpenses?.limit ?? 0;

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
            id="pe-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
          <SelectField
            id="pe-salary-package"
            label="Peru Salary Package"
            value={inputs.salaryPackageMode}
            onChange={(salaryPackageMode) =>
              setInputs((current) => ({ ...current, salaryPackageMode }))
            }
            options={PE_SALARY_PACKAGE_OPTIONS}
            description="Controls whether the annual gross already includes Peru's July and December gratifications."
          />
          <SelectField
            id="pe-gratification-health"
            label="Gratification Bonus"
            value={inputs.gratificationHealthCoverage}
            onChange={(gratificationHealthCoverage) =>
              setInputs((current) => ({
                ...current,
                gratificationHealthCoverage,
              }))
            }
            options={PE_HEALTH_COVERAGE_OPTIONS}
            description="The extraordinary bonus is 9% with EsSalud or 6.75% with EPS when gratifications are modeled."
          />
          <SelectField
            id="pe-pension-system"
            label="Pension System"
            value={inputs.pensionSystem}
            onChange={(pensionSystem) =>
              setInputs((current) => ({ ...current, pensionSystem }))
            }
            options={PE_PENSION_SYSTEM_OPTIONS}
            description="ONP uses 13%; AFP uses the selected provider's SBS-published fund, insurance, and commission rates."
          />
          {inputs.pensionSystem !== "onp" ? (
            <SelectField
              id="pe-afp-commission"
              label="AFP Commission Mode"
              value={inputs.afpCommissionMode}
              onChange={(afpCommissionMode) =>
                setInputs((current) => ({ ...current, afpCommissionMode }))
              }
              options={PE_AFP_COMMISSION_OPTIONS}
              description="Flow commission reduces take-home pay; balance commission is shown as pension-fund context, not a salary deduction."
            />
          ) : null}
        </CalculatorFieldGrid>
      }
      contributions={
        expenseLimit > 0 ? (
          <ContributionSlider
            label={contributionLimits.qualifyingExpenses.name}
            value={Math.min(
              inputs.contributions.qualifyingExpenses ?? 0,
              expenseLimit,
            )}
            onChange={(amount) =>
              setInputs((current) => ({
                ...current,
                contributions: {
                  ...current.contributions,
                  qualifyingExpenses: clampAmount(amount, expenseLimit),
                },
              }))
            }
            max={expenseLimit}
            step={100}
            currency={currency}
            description={contributionLimits.qualifyingExpenses.description}
          />
        ) : undefined
      }
      contributionsTitle="SUNAT Additional Deduction"
      contributionsDescription="Eligible annual-return expenses deductible up to 3 UIT for Peru fifth-category work income"
      seoInfo={<PeruTaxInfo />}
      infoCard={
        <InfoPanel title="Modeled Scope">
          <p>
            This models Peru fifth-category employment income with the 2026 UIT,
            the fixed 7 UIT work-income deduction, the progressive resident
            scale, ONP or AFP employee pension withholding, private-sector
            statutory gratifications when selected, and the additional 3 UIT
            annual-return expense deduction.
          </p>
          <p className="mt-2">
            The 3 UIT input is the deductible amount after SUNAT percentages and
            documentation rules, not the total amount spent.
          </p>
        </InfoPanel>
      }
    />
  );
}

function PeruTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="mb-4 text-xl font-semibold text-zinc-200">
        How Peru Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <ul className="mt-3 list-inside list-disc space-y-1 text-zinc-400">
          <li>
            <strong className="text-zinc-300">Fifth-Category Tax</strong> uses
            the 2026 UIT of PEN {PE_UIT.toLocaleString()}, the fixed 7 UIT
            deduction of PEN {PE_SEVEN_UIT_DEDUCTION.toLocaleString()}, and the
            resident work-income progressive scale.
          </li>
          <li>
            <strong className="text-zinc-300">Pension</strong> is modeled as a{" "}
            selectable ONP/SNP contribution at{" "}
            {(PE_ONP_CONTRIBUTION_RATE * 100).toFixed(0)}% or AFP withholding
            with a {(PE_AFP_MANDATORY_FUND_RATE * 100).toFixed(0)}% fund
            contribution, {(PE_AFP_INSURANCE_RATE * 100).toFixed(2)}% insurance
            premium capped at PEN{" "}
            {PE_AFP_ANNUAL_INSURANCE_CAP.toLocaleString("es-PE", {
              maximumFractionDigits: 2,
            })}{" "}
            annually, and provider-specific SBS commission rates.
          </li>
          <li>
            <strong className="text-zinc-300">AFP Commissions</strong> use the
            SBS May 2026 table: Habitat{" "}
            {(
              PE_AFP_PENSION_SYSTEMS.afpHabitat.flowCommissionRate * 100
            ).toFixed(2)}
            %, Integra{" "}
            {(
              PE_AFP_PENSION_SYSTEMS.afpIntegra.flowCommissionRate * 100
            ).toFixed(2)}
            %, Prima{" "}
            {(PE_AFP_PENSION_SYSTEMS.afpPrima.flowCommissionRate * 100).toFixed(
              2,
            )}
            %, and Profuturo{" "}
            {(
              PE_AFP_PENSION_SYSTEMS.afpProfuturo.flowCommissionRate * 100
            ).toFixed(2)}
            % when flow commission is selected.
          </li>
          <li>
            <strong className="text-zinc-300">Gratifications</strong> can be
            included in gross, added on top, or excluded. When included, the
            model splits annual gross into 12 months plus July and December
            gratifications and the{" "}
            {(PE_GRATIFICATION_BONUS_RATES.essalud * 100).toFixed(0)}% EsSalud
            or {(PE_GRATIFICATION_BONUS_RATES.eps * 100).toFixed(2)}% EPS
            extraordinary bonus.
          </li>
          <li>
            <strong className="text-zinc-300">Additional 3 UIT Deduction</strong>{" "}
            is modeled up to PEN{" "}
            {PE_ADDITIONAL_DEDUCTION_LIMIT.toLocaleString()} for qualifying
            SUNAT expenses such as rent, restaurants/hotels, professional
            services, and EsSalud household-worker payments.
          </li>
        </ul>
      </div>
    </section>
  );
}
