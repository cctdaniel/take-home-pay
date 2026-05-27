"use client";

import {
  CalculatorFieldGrid,
  NumberStepperField,
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
  UY_AGUINALDO_MONTHS,
  UY_BPC,
  UY_CHILD_DEDUCTION_BPC,
  UY_DISABLED_CHILD_DEDUCTION_BPC,
  UY_FONASA_RATE,
  UY_LABOR_RECONVERSION_RATE,
  UY_MORTGAGE_DEDUCTION_LIMIT_BPC,
  UY_PENSION_RATE,
  UY_RENT_CREDIT_RATE,
  UY_VOLUNTARY_AFAP_LIMIT_RATE,
} from "@/lib/countries/uy/constants/tax-year-2026";
import type {
  UYAguinaldoMode,
  UYCalculatorInputs,
  UYContributionInputs,
  UYHousingCreditType,
} from "@/lib/countries/uy/types";
import { clampAmount } from "@/lib/utils";

const HOUSING_OPTIONS: Array<{
  value: UYHousingCreditType;
  label: string;
}> = [
  { value: "none", label: "No housing credit" },
  { value: "rent", label: "Permanent-home rent credit" },
  { value: "mortgage", label: "Eligible mortgage deduction" },
];

const AGUINALDO_OPTIONS: SelectOption<UYAguinaldoMode>[] = [
  { value: "includedInGross", label: "Gross includes aguinaldo" },
  { value: "additionalToGross", label: "Add aguinaldo on top" },
  { value: "none", label: "No aguinaldo" },
];

export default function UYCountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const {
    inputs,
    currency,
    result,
    setGrossSalary,
    setPayFrequency,
    setInputs,
  } = useCountryCalculatorExtension<UYCalculatorInputs>(country);
  const contributionLimits = getCountryCalculator(country).getContributionLimits(inputs);
  const getLimit = (key: keyof UYContributionInputs) =>
    contributionLimits[key]?.limit ?? 0;
  const pensionLimit = getLimit("retirementContribution");
  const housingLimit = getLimit("housingExpenses");

  const setContribution = (
    key: keyof UYContributionInputs,
    amount: number,
  ) => {
    const limit = getLimit(key);

    setInputs((current) => ({
      ...current,
      contributions: {
        ...current.contributions,
        [key]: clampAmount(amount, limit),
      },
    }));
  };

  const setHousingType = (housingCreditType: UYHousingCreditType) => {
    setInputs((current) => {
      const nextInputs = { ...current, housingCreditType };
      const nextLimit = getCountryCalculator(country).getContributionLimits(
        nextInputs,
      ).housingExpenses?.limit ?? 0;

      return {
        ...nextInputs,
        contributions: {
          ...current.contributions,
          housingExpenses:
            housingCreditType === "none"
              ? 0
              : clampAmount(current.contributions.housingExpenses ?? 0, nextLimit),
        },
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
            id="uy-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
          <SelectField
            id="uy-aguinaldo-mode"
            label="Sueldo Anual Complementario"
            value={inputs.aguinaldoMode}
            onChange={(aguinaldoMode) =>
              setInputs((current) => ({ ...current, aguinaldoMode }))
            }
            options={AGUINALDO_OPTIONS}
            description="Models Uruguay's legal one-twelfth aguinaldo, including social-security deductions and separate IRPF treatment."
          />
          <NumberStepperField
            id="uy-children"
            label="Children For IRPF Deduction"
            value={inputs.numberOfChildren}
            onChange={(numberOfChildren) =>
              setInputs((current) => ({ ...current, numberOfChildren }))
            }
            min={0}
            max={10}
            description={`${UY_CHILD_DEDUCTION_BPC} BPC annual deduction base per child.`}
          />
          <NumberStepperField
            id="uy-disabled-children"
            label="Children With Disability"
            value={inputs.numberOfDisabledChildren}
            onChange={(numberOfDisabledChildren) =>
              setInputs((current) => ({ ...current, numberOfDisabledChildren }))
            }
            min={0}
            max={10}
            description={`${UY_DISABLED_CHILD_DEDUCTION_BPC} BPC annual deduction base per child with disability.`}
          />
          <SelectField
            id="uy-housing-credit"
            label="Housing Credit Type"
            value={inputs.housingCreditType}
            onChange={setHousingType}
            options={HOUSING_OPTIONS}
            description="Rent gives an 8% credit; eligible mortgage payments enter the IRPF deduction base."
          />
        </CalculatorFieldGrid>
      }
      contributions={
        <div className="space-y-6">
          {pensionLimit > 0 ? (
            <ContributionSlider
              label={contributionLimits.retirementContribution.name}
              value={Math.min(
                inputs.contributions.retirementContribution ?? 0,
                pensionLimit,
              )}
              onChange={(amount) =>
                setContribution("retirementContribution", amount)
              }
              max={pensionLimit}
              step={Math.max(1000, Math.round(pensionLimit / 100))}
              currency={currency}
              description={contributionLimits.retirementContribution.description}
            />
          ) : null}
          {inputs.housingCreditType === "mortgage" && housingLimit > 0 ? (
            <ContributionSlider
              label="Eligible mortgage payments"
              value={Math.min(
                inputs.contributions.housingExpenses ?? 0,
                housingLimit,
              )}
              onChange={(amount) => setContribution("housingExpenses", amount)}
              max={housingLimit}
              step={1000}
              currency={currency}
              description={contributionLimits.housingExpenses?.description}
            />
          ) : null}
          {inputs.housingCreditType === "rent" ? (
            <ContributionSlider
              label="Annual Permanent-Home Rent"
              value={Math.min(
                inputs.contributions.housingExpenses ?? 0,
                housingLimit,
              )}
              onChange={(amount) => setContribution("housingExpenses", amount)}
              max={housingLimit}
              step={1000}
              currency={currency}
              description={contributionLimits.housingExpenses?.description}
            />
          ) : null}
        </div>
      }
      contributionsTitle="IRPF Deductions And Credits"
      contributionsDescription="Uruguay child deductions, voluntary AFAP savings, and permanent-home rent or mortgage treatment"
      seoInfo={<UruguayTaxInfo />}
      infoCard={
        <InfoPanel title="Modeled Scope">
          <p>
            This models Uruguay 2026 IRPF Category II labor income with BPC
            bands, employee payroll deductions, child deduction bases, voluntary
            AFAP savings, permanent-home rent or eligible mortgage claims, and
            sueldo anual complementario when selected.
          </p>
          <p className="mt-2">
            FONASA family-rate surcharges, mortgage UI home-cost eligibility,
            rent contract validation, multi-employer adjustments, and salary
            vacation are outside this annual salary model.
          </p>
        </InfoPanel>
      }
    />
  );
}

function UruguayTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="mb-4 text-xl font-semibold text-zinc-200">
        How Uruguay Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <ul className="mt-3 list-inside list-disc space-y-1 text-zinc-400">
          <li>
            <strong className="text-zinc-300">IRPF</strong> uses the 2026 BPC
            value of UYU {UY_BPC.toLocaleString()} and annual Category II labor
            income bands.
          </li>
          <li>
            <strong className="text-zinc-300">Payroll Contributions</strong>{" "}
            model pension at {(UY_PENSION_RATE * 100).toFixed(0)}%, FONASA at{" "}
            {(UY_FONASA_RATE * 100).toFixed(1)}%, and the labor reconversion
            fund at {(UY_LABOR_RECONVERSION_RATE * 100).toFixed(1)}%.
          </li>
          <li>
            <strong className="text-zinc-300">
              Sueldo Anual Complementario
            </strong>{" "}
            can be included in gross, added on top, or excluded. The modeled
            amount equals {UY_AGUINALDO_MONTHS} month of regular salary for a
            full year, carries personal social-security deductions, and is
            taxed using the applicable top ordinary IRPF marginal rate.
          </li>
          <li>
            <strong className="text-zinc-300">Deduction Credit</strong> applies
            the 8% or 14% IRPF deduction rate to mandatory contributions,
            voluntary AFAP savings, child deduction bases, and eligible mortgage
            payments up to {UY_MORTGAGE_DEDUCTION_LIMIT_BPC} BPC.
          </li>
          <li>
            <strong className="text-zinc-300">Rent Credit</strong> is modeled
            separately at {(UY_RENT_CREDIT_RATE * 100).toFixed(0)}% of annual
            permanent-home rent.
          </li>
          <li>
            <strong className="text-zinc-300">Voluntary AFAP</strong> is
            modeled up to {(UY_VOLUNTARY_AFAP_LIMIT_RATE * 100).toFixed(0)}% of
            gross salary.
          </li>
        </ul>
      </div>
    </section>
  );
}
