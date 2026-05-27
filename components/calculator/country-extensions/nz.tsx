"use client";

import {
  BooleanSelectField,
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
import { NZCalculator } from "@/lib/countries/nz";
import { NZ_KIWISAVER_2026 } from "@/lib/countries/nz/constants/tax-year-2026";
import type {
  NZCalculatorInputs,
  NZKiwiSaverRate,
  NZResidencyType,
} from "@/lib/countries/nz/types";
import type { ContributionLimits, PayFrequency } from "@/lib/countries/types";
import { formatCurrency, formatPercentage } from "@/lib/format";

const RESIDENCY_OPTIONS: SelectOption<NZResidencyType>[] = [
  { value: "tax_resident", label: "NZ Tax Resident" },
  { value: "non_resident", label: "Non-Resident" },
];

const KIWISAVER_OPTIONS: SelectOption<NZKiwiSaverRate>[] = [
  { value: "none", label: "Not contributing" },
  { value: "temporary_3", label: "3% temporary reduction" },
  { value: "rate_3_5", label: "3.5% default / minimum" },
  { value: "rate_4", label: "4%" },
  { value: "rate_6", label: "6%" },
  { value: "rate_8", label: "8%" },
  { value: "rate_10", label: "10%" },
];

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) {
    return min;
  }

  return Math.min(Math.max(value, min), max);
}

function getLimit(limits: ContributionLimits, key: string): number {
  return limits[key]?.limit ?? 0;
}

function clampNzInputs(inputs: NZCalculatorInputs): NZCalculatorInputs {
  const limits = NZCalculator.getContributionLimits(inputs);

  return {
    ...inputs,
    contributions: {
      ...inputs.contributions,
      payrollGivingDonations: clamp(
        inputs.contributions.payrollGivingDonations,
        0,
        getLimit(limits, "payrollGivingDonations"),
      ),
    },
  };
}

function NZTaxOptions({
  inputs,
  onResidencyTypeChange,
  onStudentLoanChange,
  onIetcChange,
  onKiwiSaverGovernmentContributionChange,
  onPayFrequencyChange,
}: {
  inputs: NZCalculatorInputs;
  onResidencyTypeChange: (value: NZResidencyType) => void;
  onStudentLoanChange: (value: boolean) => void;
  onIetcChange: (value: boolean) => void;
  onKiwiSaverGovernmentContributionChange: (value: boolean) => void;
  onPayFrequencyChange: (value: PayFrequency) => void;
}) {
  const isTaxResident = inputs.residencyType === "tax_resident";

  return (
    <CalculatorFieldGrid columns={2}>
      <SelectField
        id="nz-residency-type"
        label="Tax Residency"
        value={inputs.residencyType}
        onChange={onResidencyTypeChange}
        options={RESIDENCY_OPTIONS}
      />
      <BooleanSelectField
        id="nz-student-loan"
        label="Student Loan"
        value={inputs.hasStudentLoan}
        onChange={onStudentLoanChange}
        trueLabel="SL code"
        falseLabel="No loan"
        description="12% over the annual repayment threshold"
      />
      <BooleanSelectField
        id="nz-ietc"
        label="IETC"
        value={inputs.claimsIndependentEarnerTaxCredit}
        onChange={onIetcChange}
        trueLabel="Claim"
        falseLabel="Do not claim"
        description={
          isTaxResident
            ? "For eligible independent earners from $24k to $70k"
            : "Only available to New Zealand tax residents"
        }
      />
      <BooleanSelectField
        id="nz-kiwisaver-government-contribution"
        label="KiwiSaver Govt Contribution"
        value={inputs.claimsKiwiSaverGovernmentContribution}
        onChange={(value) =>
          onKiwiSaverGovernmentContributionChange(isTaxResident && value)
        }
        trueLabel="Eligible"
        falseLabel="No / ineligible"
        description={
          isTaxResident
            ? `Government contribution is 25c per dollar up to ${formatCurrency(
                NZ_KIWISAVER_2026.governmentContributionMax,
                "NZD",
              )} when annual income is within the modeled cap.`
            : "Only modeled for New Zealand tax residents."
        }
      />
      <PayFrequencyField
        id="nz-pay-frequency"
        value={inputs.payFrequency}
        onChange={onPayFrequencyChange}
      />
    </CalculatorFieldGrid>
  );
}

function NZContributionOptions({
  inputs,
  limits,
  onKiwiSaverRateChange,
  onPayrollGivingDonationsChange,
}: {
  inputs: NZCalculatorInputs;
  limits: ContributionLimits;
  onKiwiSaverRateChange: (value: NZKiwiSaverRate) => void;
  onPayrollGivingDonationsChange: (value: number) => void;
}) {
  const donationLimit = getLimit(limits, "payrollGivingDonations");

  return (
    <div className="space-y-6">
      <CalculatorFieldGrid columns={2}>
        <SelectField
          id="nz-kiwisaver-rate"
          label="KiwiSaver Employee Rate"
          value={inputs.contributions.kiwiSaverRate}
          onChange={onKiwiSaverRateChange}
          options={KIWISAVER_OPTIONS}
          description="Employee deductions are from gross pay but do not reduce taxable income"
        />
      </CalculatorFieldGrid>
      <ContributionSlider
        label="Payroll Giving Donations"
        description="Eligible donations to approved organisations; the model applies a one-third credit against income tax."
        value={inputs.contributions.payrollGivingDonations}
        onChange={onPayrollGivingDonationsChange}
        max={donationLimit}
        step={100}
        currency="NZD"
      />
    </div>
  );
}

function NZTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="text-xl font-semibold text-zinc-200 mb-4">
        How Your Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">
          New Zealand
        </h3>
        <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
          <li>
            <strong className="text-zinc-300">PAYE Income Tax</strong> –
            salary is taxed with New Zealand&apos;s progressive individual
            income tax bands.
          </li>
          <li>
            <strong className="text-zinc-300">ACC Earners Levy</strong> – the
            employee earners levy is added up to the annual liable earnings cap.
          </li>
          <li>
            <strong className="text-zinc-300">Student Loan</strong> – when
            selected, repayment is modeled at 12% of income above the annual
            repayment threshold.
          </li>
          <li>
            <strong className="text-zinc-300">KiwiSaver</strong> – employee
            KiwiSaver deductions reduce take-home pay but do not reduce taxable
            income; employer KiwiSaver is shown for context before ESCT, and
            the government contribution is shown when eligible.
          </li>
          <li>
            <strong className="text-zinc-300">Tax Credits</strong> – the
            Independent Earner Tax Credit and payroll-giving donation credits
            reduce income tax where the calculator inputs make them applicable.
          </li>
        </ul>
        <p className="text-zinc-400 text-sm mt-3">
          Estimated net salary is gross salary minus income tax after modeled
          credits, ACC earners levy, student loan repayments, KiwiSaver employee
          deductions, and payroll-giving donations. The model excludes Working
          for Families, benefits, paid parental leave, secondary tax codes,
          tailored tax codes, ESCT calculations, and non-salary income.
        </p>
      </div>
    </section>
  );
}

export default function NZCountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const { inputs, setInputs, currency, result } =
    useCountryCalculatorExtension<NZCalculatorInputs>(country);
  const limits = NZCalculator.getContributionLimits(inputs);

  const updateInputs = (
    updater: (current: NZCalculatorInputs) => NZCalculatorInputs,
  ) => {
    setInputs((current) => clampNzInputs(updater(current)));
  };

  return (
    <CountryCalculatorExtensionShell
      country={country}
      currency={currency}
      grossSalary={inputs.grossSalary}
      onGrossSalaryChange={(grossSalary) =>
        updateInputs((current) => ({ ...current, grossSalary }))
      }
      result={result}
      taxOptions={
        <NZTaxOptions
          inputs={inputs}
          onResidencyTypeChange={(residencyType) =>
            updateInputs((current) => ({
              ...current,
              residencyType,
              claimsIndependentEarnerTaxCredit:
                residencyType === "tax_resident"
                  ? current.claimsIndependentEarnerTaxCredit
                  : false,
              claimsKiwiSaverGovernmentContribution:
                residencyType === "tax_resident"
                  ? current.claimsKiwiSaverGovernmentContribution
                  : false,
            }))
          }
          onStudentLoanChange={(hasStudentLoan) =>
            updateInputs((current) => ({ ...current, hasStudentLoan }))
          }
          onIetcChange={(claimsIndependentEarnerTaxCredit) =>
            updateInputs((current) => ({
              ...current,
              claimsIndependentEarnerTaxCredit:
                current.residencyType === "tax_resident"
                  ? claimsIndependentEarnerTaxCredit
                  : false,
            }))
          }
          onKiwiSaverGovernmentContributionChange={(
            claimsKiwiSaverGovernmentContribution,
          ) =>
            updateInputs((current) => ({
              ...current,
              claimsKiwiSaverGovernmentContribution,
            }))
          }
          onPayFrequencyChange={(payFrequency) =>
            updateInputs((current) => ({ ...current, payFrequency }))
          }
        />
      }
      contributions={
        <NZContributionOptions
          inputs={inputs}
          limits={limits}
          onKiwiSaverRateChange={(kiwiSaverRate) =>
            updateInputs((current) => ({
              ...current,
              contributions: {
                ...current.contributions,
                kiwiSaverRate,
              },
            }))
          }
          onPayrollGivingDonationsChange={(payrollGivingDonations) =>
            updateInputs((current) => ({
              ...current,
              contributions: {
                ...current.contributions,
                payrollGivingDonations,
              },
            }))
          }
        />
      }
      contributionsTitle="KiwiSaver and Tax Credits"
      contributionsDescription="Optional payroll deductions and credits modeled for New Zealand salary income"
      infoCard={
        <InfoPanel title="Modeled Scope">
          ACC earners levy is modeled at {formatPercentage(0.0175)} up to{" "}
          {formatCurrency(156_641, currency)} of liable earnings. KiwiSaver
          employee contributions affect take-home pay but do not reduce taxable
          income; employer KiwiSaver is shown before ESCT and is not part of net
          salary. The government contribution is shown as a retirement-account
          benefit when the eligibility toggle is on; it is not take-home salary.
        </InfoPanel>
      }
      seoInfo={<NZTaxInfo />}
    />
  );
}
