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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type {
  GECalculatorInputs,
  GEIncomeRegime,
  GEPensionParticipation,
  GEResidencyType,
  GESmallBusinessThresholdTreatment,
} from "@/lib/countries/ge/types";
import {
  GE_MICRO_BUSINESS_2026,
  GE_SMALL_BUSINESS_2026,
} from "@/lib/countries/ge/constants/tax-brackets-2026";
import type { CalculationResult, PayFrequency } from "@/lib/countries/types";
import { formatCurrency } from "@/lib/format";

function GeorgiaTaxOptions({
  inputs,
  onIncomeRegimeChange,
  onResidencyTypeChange,
  onPensionParticipationChange,
  onSmallBusinessThresholdTreatmentChange,
  onPayFrequencyChange,
}: {
  inputs: GECalculatorInputs;
  onIncomeRegimeChange: (value: GEIncomeRegime) => void;
  onResidencyTypeChange: (value: GEResidencyType) => void;
  onPensionParticipationChange: (value: GEPensionParticipation) => void;
  onSmallBusinessThresholdTreatmentChange: (
    value: GESmallBusinessThresholdTreatment,
  ) => void;
  onPayFrequencyChange: (value: PayFrequency) => void;
}) {
  return (
    <CalculatorFieldGrid columns={3}>
      <SelectField
        id="ge-income-regime"
        label="Income Regime"
        value={inputs.incomeRegime}
        onChange={onIncomeRegimeChange}
        options={[
          { value: "employment", label: "Employment salary" },
          { value: "small_business", label: "IE small business status" },
          { value: "micro_business", label: "Micro business status" },
        ]}
        description={
          inputs.incomeRegime === "small_business"
            ? `Models Georgian individual entrepreneur small business status at 1%, or 3% after the GEL ${GE_SMALL_BUSINESS_2026.incomeLimit.toLocaleString()} threshold.`
            : inputs.incomeRegime === "micro_business"
              ? `Models micro business status for eligible no-employee activity up to GEL ${GE_MICRO_BUSINESS_2026.incomeLimit.toLocaleString()}.`
              : "Models ordinary payroll salary with salary income tax and funded pension participation."
        }
      />
      {inputs.incomeRegime === "employment" ? (
        <>
      <SelectField
        id="ge-residency-type"
        label="Residency Status"
        value={inputs.residencyType}
        onChange={onResidencyTypeChange}
        options={[
          { value: "resident", label: "Resident employee" },
          { value: "non_resident", label: "Non-resident employee" },
        ]}
        description={
          inputs.residencyType === "non_resident"
            ? "Non-resident salary is still modeled at the 20% salary tax rate, without funded pension participation."
            : undefined
        }
      />
      <SelectField
        id="ge-pension-participation"
        label="Funded Pension"
        value={inputs.pensionParticipation}
        onChange={onPensionParticipationChange}
        options={[
          {
            value: "mandatory_or_enrolled",
            label: "Mandatory / enrolled",
            disabled: inputs.residencyType === "non_resident",
          },
          {
            value: "not_participating",
            label: "Eligible opt-out / exempt",
          },
        ]}
        description="Mandatory for most resident employees; older eligible employees may opt out or enroll voluntarily."
      />
        </>
      ) : null}
      {inputs.incomeRegime === "small_business" ? (
        <SelectField
          id="ge-small-business-threshold-treatment"
          label="500k Threshold"
          value={inputs.smallBusinessThresholdTreatment}
          onChange={onSmallBusinessThresholdTreatmentChange}
          options={[
            { value: "even_monthly", label: "Even monthly receipts" },
            { value: "three_percent_full_year", label: "3% for full year" },
          ]}
          description="The Tax Code applies 3% from the beginning of the month the threshold is exceeded; use full-year 3% if the higher rate applied all year."
        />
      ) : null}
      <PayFrequencyField
        id="ge-pay-frequency"
        value={inputs.payFrequency}
        onChange={onPayFrequencyChange}
      />
    </CalculatorFieldGrid>
  );
}

function GeorgiaInfoCard({ result }: { result: CalculationResult }) {
  const { breakdown, currency } = result;

  if (breakdown.type !== "GE") {
    return null;
  }

  return (
    <InfoPanel title="Georgia Modeled Scope">
      Employment salary is modeled with 20% salary income tax and funded pension
      withholding when selected. Individual entrepreneur small business status is
      modeled as turnover tax on eligible Georgian-source business income, not
      as payroll salary. Micro business status is modeled only up to the official
      gross-income limit.
      {breakdown.incomeRegime === "micro_business" &&
      breakdown.businessRegime.microBusinessLimitExceeded ? (
        <span className="mt-2 block text-amber-300">
          The entered income exceeds the micro business limit, so this model
          applies ordinary 20% income tax. Select small business status if you
          obtained that status after exceeding the micro limit.
        </span>
      ) : null}
      {breakdown.isPensionParticipant ? (
        <span className="mt-2 block text-zinc-400">
          Estimated annual funded pension account inflow: {" "}
          {formatCurrency(
            breakdown.pension.totalAccountContribution,
            currency,
          )}.
        </span>
      ) : null}
      <span className="mt-2 block text-zinc-400">
        Activity eligibility, VAT registration, filing penalties, and
        self-employed voluntary funded pension mechanics require business or
        pension-account facts instead of employee salary sliders.
      </span>
    </InfoPanel>
  );
}

function GeorgiaTaxInfo() {
  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Georgia Employment And IE Tax</CardTitle>
        <CardDescription>
          2026 model for payroll salary and individual entrepreneur regimes
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 text-sm text-zinc-400 md:grid-cols-3">
        <div>
          <p className="font-medium text-zinc-200">Income tax</p>
          <p className="mt-1 leading-relaxed">
            Salary is taxed at a flat 20% rate. The calculator applies that rate
            to annual gross employment salary before funded pension withholding.
          </p>
        </div>
        <div>
          <p className="font-medium text-zinc-200">Funded pension</p>
          <p className="mt-1 leading-relaxed">
            Enrolled employees contribute 2% of taxable salary. Employers add
            2% on top, and the state contributes by annual salary band.
          </p>
        </div>
        <div>
          <p className="font-medium text-zinc-200">Business regimes</p>
          <p className="mt-1 leading-relaxed">
            Small business status applies 1% turnover tax up to GEL{" "}
            {GE_SMALL_BUSINESS_2026.incomeLimit.toLocaleString()} and 3% from
            the threshold month. Micro business status is modeled at 0% only up
            to GEL {GE_MICRO_BUSINESS_2026.incomeLimit.toLocaleString()}.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function GECountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const {
    inputs,
    setInputs,
    currency,
    result,
    setGrossSalary,
    setPayFrequency,
  } = useCountryCalculatorExtension<GECalculatorInputs>(country);

  const setIncomeRegime = (incomeRegime: GEIncomeRegime) => {
    setInputs((current) => ({
      ...current,
      incomeRegime,
      pensionParticipation:
        incomeRegime === "employment"
          ? current.pensionParticipation
          : "not_participating",
    }));
  };

  const setResidencyType = (residencyType: GEResidencyType) => {
    setInputs((current) => ({
      ...current,
      residencyType,
      pensionParticipation:
        residencyType === "non_resident"
          ? "not_participating"
          : current.pensionParticipation,
    }));
  };

  const setPensionParticipation = (
    pensionParticipation: GEPensionParticipation,
  ) => {
    setInputs((current) => ({
      ...current,
      pensionParticipation:
        current.residencyType === "non_resident"
          ? "not_participating"
          : pensionParticipation,
    }));
  };

  const setSmallBusinessThresholdTreatment = (
    smallBusinessThresholdTreatment: GESmallBusinessThresholdTreatment,
  ) => {
    setInputs((current) => ({
      ...current,
      smallBusinessThresholdTreatment,
    }));
  };

  return (
    <CountryCalculatorExtensionShell
      country={country}
      currency={currency}
      grossSalary={inputs.grossSalary}
      incomeLabel={
        inputs.incomeRegime === "employment"
          ? "Annual Gross Salary"
          : "Annual Gross Business Income"
      }
      onGrossSalaryChange={setGrossSalary}
      result={result}
      taxOptions={
        <GeorgiaTaxOptions
          inputs={inputs}
          onIncomeRegimeChange={setIncomeRegime}
          onResidencyTypeChange={setResidencyType}
          onPensionParticipationChange={setPensionParticipation}
          onSmallBusinessThresholdTreatmentChange={
            setSmallBusinessThresholdTreatment
          }
          onPayFrequencyChange={setPayFrequency}
        />
      }
      contributionsTitle="Georgia Payroll and Regime Notes"
      contributionsDescription="Modeled payroll and individual entrepreneur settings"
      contributionsEmptyState={
        inputs.incomeRegime === "employment"
          ? "Funded pension participation is modeled above as a payroll choice rather than a free-form annual contribution. The ordinary salary model has no additional employee-controlled annual salary deduction."
          : "Small and micro business status are modeled as separate income regimes above. Activity eligibility, VAT, and self-employed voluntary pension mechanics require separate return facts."
      }
      infoCard={<GeorgiaInfoCard result={result} />}
      seoInfo={<GeorgiaTaxInfo />}
    />
  );
}
