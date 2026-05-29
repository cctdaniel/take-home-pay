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
import { NoVoluntaryPitReliefNote } from "@/components/calculator/no-voluntary-pit-relief-note";
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
  GEPensionParticipation,
  GEResidencyType,
} from "@/lib/countries/ge/types";
import type { CalculationResult, PayFrequency } from "@/lib/countries/types";
import { formatCurrency } from "@/lib/format";

function GeorgiaTaxOptions({
  inputs,
  onResidencyTypeChange,
  onPensionParticipationChange,
  onPayFrequencyChange,
}: {
  inputs: GECalculatorInputs;
  onResidencyTypeChange: (value: GEResidencyType) => void;
  onPensionParticipationChange: (value: GEPensionParticipation) => void;
  onPayFrequencyChange: (value: PayFrequency) => void;
}) {
  return (
    <CalculatorFieldGrid columns={3}>
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
    <InfoPanel title="Georgia salary assumptions">
      Ordinary employment salary is modeled with 20% salary income tax. Funded
      pension, when enrolled, withholds 2% from the employee and shows the 2%
      employer contribution plus the state contribution separately. Small
      business, micro business, and individual entrepreneur regimes are excluded
      from this salary take-home calculation.
      {breakdown.isPensionParticipant ? (
        <span className="mt-2 block text-zinc-400">
          Estimated annual funded pension account inflow: {" "}
          {formatCurrency(
            breakdown.pension.totalAccountContribution,
            currency,
          )}.
        </span>
      ) : null}
    </InfoPanel>
  );
}

function GeorgiaTaxInfo() {
  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Georgia Employment Salary Tax</CardTitle>
        <CardDescription>
          2026 model for ordinary salary income paid through payroll
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
          <p className="font-medium text-zinc-200">Excluded regimes</p>
          <p className="mt-1 leading-relaxed">
            Small business, micro business, individual entrepreneur, and
            self-employed pension scenarios are not included in this salary
            calculator.
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

  return (
    <CountryCalculatorExtensionShell
      country={country}
      currency={currency}
      grossSalary={inputs.grossSalary}
      onGrossSalaryChange={setGrossSalary}
      result={result}
      taxOptions={
        <GeorgiaTaxOptions
          inputs={inputs}
          onResidencyTypeChange={setResidencyType}
          onPensionParticipationChange={setPensionParticipation}
          onPayFrequencyChange={setPayFrequency}
        />
      }
      contributions={
        <NoVoluntaryPitReliefNote
          explanation="Georgia does not provide employee-controlled voluntary pension or savings deductions on monthly payroll salary that reduce personal income tax in this calculator."
          mandatoryLabel="Pension contribution and 20% personal income tax on taxable employment income."
          sourceUrl="https://www.rs.ge/"
          sourceLabel="Revenue Service of Georgia"
        />
      }
      contributionsTitle="Retirement & Savings Contributions"
      contributionsDescription="No employee voluntary income-tax relief on monthly payroll salary"
      infoCard={<GeorgiaInfoCard result={result} />}
      seoInfo={<GeorgiaTaxInfo />}
    />
  );
}
