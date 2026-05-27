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
import { getCountryCalculator } from "@/lib/countries/registry";
import {
  ZA_DONATION_DEDUCTION_RATE,
  ZA_MEDICAL_ADDITIONAL_MONTHLY_CREDIT,
  ZA_MEDICAL_FIRST_TWO_MONTHLY_CREDIT,
  ZA_RETIREMENT_DEDUCTION_CAP,
  ZA_RETIREMENT_DEDUCTION_RATE,
} from "@/lib/countries/za/constants/tax-year-2026";
import type {
  ZAAgeBand,
  ZACalculatorInputs,
  ZAContributionInputs,
} from "@/lib/countries/za/types";

const AGE_BAND_OPTIONS: Array<{ value: ZAAgeBand; label: string }> = [
  { value: "under65", label: "Under 65" },
  { value: "age65to74", label: "65 to 74" },
  { value: "age75plus", label: "75 or older" },
];

function clampAmount(value: number, max = Infinity) {
  return Math.min(Math.max(0, value), max);
}

export default function ZACountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const {
    inputs,
    currency,
    result,
    setGrossSalary,
    setPayFrequency,
    setInputs,
  } = useCountryCalculatorExtension<ZACalculatorInputs>(country);
  const contributionLimits = getCountryCalculator(country).getContributionLimits(inputs);
  const getLimit = (key: keyof ZAContributionInputs) =>
    contributionLimits[key]?.limit ?? 0;

  const setContribution = (
    key: keyof ZAContributionInputs,
    amount: number,
    max = Infinity,
  ) => {
    setInputs((current) => ({
      ...current,
      contributions: {
        ...current.contributions,
        [key]: clampAmount(amount, max),
      },
    }));
  };

  const retirementLimit = getLimit("retirementContribution");
  const donationLimit = getLimit("charitableDonations");

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
            id="za-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
          <SelectField
            id="za-age-band"
            label="Age Band"
            value={inputs.ageBand}
            onChange={(ageBand) =>
              setInputs((current) => ({ ...current, ageBand }))
            }
            options={AGE_BAND_OPTIONS}
            description="Controls the SARS secondary and tertiary age rebates."
          />
          <CurrencyAmountField
            id="za-taxable-fringe-benefits"
            label="Taxable Fringe Benefits"
            value={inputs.taxableNonCashBenefits ?? 0}
            onChange={(taxableNonCashBenefits) =>
              setInputs((current) => ({
                ...current,
                taxableNonCashBenefits: clampAmount(taxableNonCashBenefits),
              }))
            }
            currency={currency}
            step={1000}
            description="Annual SARS cash-equivalent value of taxable non-cash fringe benefits; increases PAYE and UIF bases but not cash salary."
          />
          <NumberStepperField
            id="za-medical-members"
            label="Medical Scheme Members"
            value={inputs.medicalSchemeMembers}
            onChange={(medicalSchemeMembers) =>
              setInputs((current) => ({
                ...current,
                medicalSchemeMembers,
              }))
            }
            min={0}
            max={20}
            description="Taxpayer plus dependants covered by a registered medical scheme."
          />
          <BooleanSelectField
            id="za-disability"
            label="Disability in Family"
            value={inputs.hasDisabilityInFamily}
            onChange={(hasDisabilityInFamily) =>
              setInputs((current) => ({
                ...current,
                hasDisabilityInFamily,
              }))
            }
            trueLabel="Yes"
            falseLabel="No"
            description="Use yes when the taxpayer, spouse, or child is a person with a disability for AMTC."
          />
        </CalculatorFieldGrid>
      }
      contributions={
        <div className="space-y-6">
          <ContributionSlider
            label={contributionLimits.retirementContribution.name}
            value={Math.min(
              inputs.contributions.retirementContribution,
              retirementLimit,
            )}
            onChange={(amount) =>
              setContribution("retirementContribution", amount, retirementLimit)
            }
            max={retirementLimit}
            step={1000}
            currency={currency}
            description={contributionLimits.retirementContribution.description}
          />
          <CurrencyAmountField
            id="za-medical-scheme-fees"
            label="Annual Medical Scheme Fees"
            value={inputs.contributions.insurancePremiums}
            onChange={(amount) =>
              setContribution("insurancePremiums", amount)
            }
            currency={currency}
            step={100}
            description="Used for the additional medical expenses tax credit formula; medical scheme membership controls the fixed MTC."
          />
          <CurrencyAmountField
            id="za-qualifying-medical-expenses"
            label="Qualifying Medical Expenses"
            value={inputs.contributions.medicalExpenses}
            onChange={(amount) => setContribution("medicalExpenses", amount)}
            currency={currency}
            step={100}
            description="Out-of-pocket qualifying medical or disability expenses for AMTC."
          />
          <ContributionSlider
            label={contributionLimits.charitableDonations.name}
            value={Math.min(
              inputs.contributions.charitableDonations,
              donationLimit,
            )}
            onChange={(amount) =>
              setContribution("charitableDonations", amount, donationLimit)
            }
            max={donationLimit}
            step={Math.max(100, Math.round(donationLimit / 100))}
            currency={currency}
            description={contributionLimits.charitableDonations.description}
          />
        </div>
      }
      contributionsTitle="South Africa Reliefs and Deductions"
      contributionsDescription="Retirement fund deductions, medical tax credits, AMTC expenses, and Section 18A donations"
      seoInfo={<SouthAfricaTaxInfo />}
      infoCard={
        <InfoPanel title="Modeled Scope">
          <p>
            This models ordinary South African resident employment salary for
            the 2026/27 SARS year, including PAYE, UIF, age rebates, medical tax
            credits, taxable fringe benefits, retirement fund deductions, and
            Section 18A donations.
          </p>
          <p className="mt-2">
            Enter the annual taxable fringe-benefit value after SARS valuation
            rules. Travel allowances, company car fringe-benefit reductions,
            home office deductions, foreign tax credits, and carry-forward of
            excess retirement or donation deductions require logbook,
            fringe-benefit, assessment, or carry-forward records before they can
            be shown as accurate salary controls.
          </p>
        </InfoPanel>
      }
    />
  );
}

function SouthAfricaTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="mb-4 text-xl font-semibold text-zinc-200">
        How South Africa Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <ul className="mt-3 list-inside list-disc space-y-1 text-zinc-400">
          <li>
            <strong className="text-zinc-300">Income Tax</strong> uses the SARS
            2026/27 individual brackets, primary rebate, and selected age
            rebate. Taxable fringe benefits are added to remuneration for PAYE
            but are not treated as cash salary.
          </li>
          <li>
            <strong className="text-zinc-300">Retirement Funds</strong> are
            deductible up to {(ZA_RETIREMENT_DEDUCTION_RATE * 100).toFixed(1)}%
            of modeled salary, capped at R
            {ZA_RETIREMENT_DEDUCTION_CAP.toLocaleString()}.
          </li>
          <li>
            <strong className="text-zinc-300">Medical Credits</strong> use R
            {ZA_MEDICAL_FIRST_TWO_MONTHLY_CREDIT.toLocaleString()} per month for
            each of the first two covered people and R
            {ZA_MEDICAL_ADDITIONAL_MONTHLY_CREDIT.toLocaleString()} for each
            additional dependant, plus the additional medical expenses formula.
          </li>
          <li>
            <strong className="text-zinc-300">Donations</strong> model Section
            18A public benefit organisation deductions up to{" "}
            {(ZA_DONATION_DEDUCTION_RATE * 100).toFixed(0)}% of taxable
            employment income after retirement deductions.
          </li>
        </ul>
      </div>
    </section>
  );
}
