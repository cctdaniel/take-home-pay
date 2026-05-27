"use client";

import {
  CalculatorFieldGrid,
  NumberStepperField,
  PayFrequencyField,
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
  CH_CHILD_DEDUCTION_AMOUNT,
  CH_SUPPORTED_PERSON_DEDUCTION_AMOUNT,
} from "@/lib/countries/ch/constants/tax-year-2026";
import type {
  CHCalculatorInputs,
  CHContributionInputs,
} from "@/lib/countries/ch/types";
import { clampAmount } from "@/lib/utils";

const CH_CONTRIBUTION_KEYS: Array<keyof CHContributionInputs> = [
  "retirementContribution",
  "insurancePremiums",
  "carerWages",
  "educationExpenses",
  "charitableDonations",
];

export default function CHCountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const {
    inputs,
    currency,
    result,
    setGrossSalary,
    setPayFrequency,
    setInputs,
  } = useCountryCalculatorExtension<CHCalculatorInputs>(country);
  const contributionLimits =
    getCountryCalculator(country).getContributionLimits(inputs);

  const setContribution = (
    key: keyof CHContributionInputs,
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
        <CalculatorFieldGrid columns={2}>
          <PayFrequencyField
            id="ch-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
          <NumberStepperField
            id="ch-children"
            label="Children"
            value={inputs.numberOfChildren}
            onChange={(numberOfChildren) =>
              setInputs((current) => ({
                ...current,
                numberOfChildren,
                numberOfChildcareChildren: Math.min(
                  numberOfChildren,
                  current.numberOfChildcareChildren,
                ),
              }))
            }
            min={0}
            max={10}
            description={`Zurich benchmark child deduction of CHF ${CH_CHILD_DEDUCTION_AMOUNT.toLocaleString("de-CH")} per child.`}
          />
          <NumberStepperField
            id="ch-childcare-children"
            label="Children with childcare"
            value={inputs.numberOfChildcareChildren}
            onChange={(numberOfChildcareChildren) =>
              setInputs((current) => ({
                ...current,
                numberOfChildcareChildren: Math.min(
                  current.numberOfChildren,
                  numberOfChildcareChildren,
                ),
              }))
            }
            min={0}
            max={inputs.numberOfChildren}
            description="Used to cap third-party childcare costs."
          />
          <NumberStepperField
            id="ch-supported-persons"
            label="Supported Persons"
            value={inputs.numberOfSupportedPersons}
            onChange={(numberOfSupportedPersons) =>
              setInputs((current) => ({
                ...current,
                numberOfSupportedPersons,
              }))
            }
            min={0}
            max={10}
            description={`Zurich benchmark support deduction of CHF ${CH_SUPPORTED_PERSON_DEDUCTION_AMOUNT.toLocaleString("de-CH")} per person.`}
          />
        </CalculatorFieldGrid>
      }
      contributions={
        <div className="space-y-6">
          {CH_CONTRIBUTION_KEYS.map((key) => {
            const limit = contributionLimits[key]?.limit ?? 0;

            if (limit <= 0) {
              return null;
            }

            return (
              <ContributionSlider
                key={key}
                label={contributionLimits[key]?.name ?? key}
                value={Math.min(inputs.contributions[key] ?? 0, limit)}
                onChange={(amount) => setContribution(key, amount)}
                max={limit}
                step={Math.max(1, Math.round(limit / 100))}
                currency={currency}
                description={contributionLimits[key]?.description}
              />
            );
          })}
        </div>
      }
      contributionsTitle="Swiss Deductions"
      contributionsDescription="Pillar 3a plus Zurich benchmark insurance, childcare, training, and donation deductions"
      seoInfo={<SwitzerlandTaxInfo />}
      infoCard={
        <InfoPanel title="Modeled Scope">
          <p>
            This models a Zurich city, no-church-tax, single resident employee
            benchmark with direct federal, cantonal, and communal income tax
            fitted to official ESTV calculator outputs.
          </p>
          <p className="mt-2">
            AHV/IV/EO, unemployment insurance, non-occupational accident
            insurance, and an occupational pension proxy are included as
            employee payroll deductions.
          </p>
          <p className="mt-2">
            Child and supported-person deductions, insurance premiums,
            third-party childcare, professional training, donations, and Pillar
            3a are exposed as Zurich benchmark inputs. Other cantons and
            communes, church tax, withholding tables, wealth tax, exact
            employer pension plan rates, and expatriate rulings require a
            separate canton/commune-specific model.
          </p>
        </InfoPanel>
      }
    />
  );
}

function SwitzerlandTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="mb-4 text-xl font-semibold text-zinc-200">
        How Switzerland Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <ul className="mt-3 list-inside list-disc space-y-1 text-zinc-400">
          <li>
            <strong className="text-zinc-300">Income Tax</strong> uses a Zurich
            city benchmark curve fitted to official ESTV calculator results.
          </li>
          <li>
            <strong className="text-zinc-300">Payroll Contributions</strong>{" "}
            include AHV/IV/EO, unemployment insurance, non-occupational accident
            insurance, and an occupational pension proxy.
          </li>
          <li>
            <strong className="text-zinc-300">Pillar 3a</strong> reduces
            taxable income up to the CHF 7,258 employee limit for 2026.
          </li>
          <li>
            <strong className="text-zinc-300">Zurich Deductions</strong> include
            modeled child, supported-person, insurance, childcare, professional
            training, and donation inputs using the Zurich 2026 return-guide
            amounts.
          </li>
        </ul>
      </div>
    </section>
  );
}
