"use client";

import {
  CalculatorFieldGrid,
  CurrencyAmountField,
  NumberField,
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
  NO_CHILDCARE_DEDUCTION_2026,
  NO_COMMUTING_DEDUCTION_2026,
  NO_IPS_DEDUCTION_LIMIT,
  NO_PAYE_2026,
  NO_UNION_DUES_DEDUCTION_LIMIT,
} from "@/lib/countries/no/constants/tax-year-2026";
import type {
  NOCalculatorInputs,
  NOChildcareDeductionMode,
  NOContributionInputs,
  NOPayeNationalInsurance,
  NOTaxScheme,
} from "@/lib/countries/no/types";

const TAX_SCHEME_OPTIONS: SelectOption<NOTaxScheme>[] = [
  { value: "ordinary", label: "General taxation rules" },
  { value: "paye", label: "PAYE for foreign workers" },
];

const PAYE_NATIONAL_INSURANCE_OPTIONS: SelectOption<NOPayeNationalInsurance>[] =
  [
    { value: "included", label: "Not exempt from National Insurance" },
    { value: "exempt", label: "Exempt from National Insurance" },
  ];

const CHILDCARE_DEDUCTION_OPTIONS: SelectOption<NOChildcareDeductionMode>[] = [
  { value: "ordinary", label: "Ordinary child under 12" },
  { value: "specialNeeds", label: "Special-needs child 12+" },
];

function clamp(value: number, max: number) {
  return Math.min(Math.max(0, value), max);
}

export default function NOCountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const {
    inputs,
    setInputs,
    currency,
    result,
    setGrossSalary,
    setPayFrequency,
  } = useCountryCalculatorExtension<NOCalculatorInputs>(country);
  const isPayeSelected = inputs.taxScheme === "paye";
  const isPayeApplied =
    isPayeSelected && inputs.grossSalary <= NO_PAYE_2026.incomeThreshold;
  const isPayeOverThreshold =
    isPayeSelected && inputs.grossSalary > NO_PAYE_2026.incomeThreshold;
  const contributionLimits =
    getCountryCalculator(country).getContributionLimits(inputs);

  const setContribution = (
    key: keyof NOContributionInputs,
    amount: number,
    max = Infinity,
  ) => {
    setInputs((current) => ({
      ...current,
      contributions: {
        ...current.contributions,
        [key]: clamp(amount, max),
      },
    }));
  };

  const renderContributionSlider = (
    key: keyof NOContributionInputs,
    fallbackLimit: number,
    step: number,
  ) => {
    const limit = contributionLimits[key]?.limit ?? fallbackLimit;

    if (limit <= 0) {
      return null;
    }

    return (
      <ContributionSlider
        key={key}
        label={contributionLimits[key]?.name ?? key}
        value={Math.min(inputs.contributions?.[key] ?? 0, limit)}
        onChange={(value) => setContribution(key, value, limit)}
        max={limit}
        step={step}
        currency={currency}
        description={contributionLimits[key]?.description}
      />
    );
  };

  const deductionControls = [
    renderContributionSlider("ipsContribution", NO_IPS_DEDUCTION_LIMIT, 500),
    renderContributionSlider(
      "tradeUnionFees",
      NO_UNION_DUES_DEDUCTION_LIMIT,
      100,
    ),
    renderContributionSlider("childcareExpenses", 0, 500),
  ].filter(Boolean);

  return (
    <CountryCalculatorExtensionShell
      country={country}
      currency={currency}
      grossSalary={inputs.grossSalary}
      onGrossSalaryChange={setGrossSalary}
      result={result}
      taxOptions={
        <CalculatorFieldGrid columns={2}>
          <SelectField
            id="no-tax-scheme"
            label="Tax Scheme"
            value={inputs.taxScheme ?? "ordinary"}
            onChange={(taxScheme: NOTaxScheme) =>
              setInputs((current) => ({
                ...current,
                taxScheme,
                contributions:
                  taxScheme === "paye"
                    ? { ...(current.contributions ?? {}), ipsContribution: 0 }
                    : current.contributions,
              }))
            }
            options={TAX_SCHEME_OPTIONS}
            description={
              isPayeOverThreshold
                ? `PAYE is not available above NOK ${NO_PAYE_2026.incomeThreshold.toLocaleString(
                    "nb-NO",
                  )}; general taxation is applied.`
                : "PAYE is a gross flat-tax scheme for eligible new or temporary foreign workers."
            }
          />
          {isPayeSelected && (
            <SelectField
              id="no-paye-national-insurance"
              label="PAYE National Insurance"
              value={inputs.payeNationalInsurance ?? "included"}
              onChange={(payeNationalInsurance: NOPayeNationalInsurance) =>
                setInputs((current) => ({
                  ...current,
                  payeNationalInsurance,
                }))
              }
              options={PAYE_NATIONAL_INSURANCE_OPTIONS}
              description={`PAYE is ${(
                NO_PAYE_2026.rateWithNationalInsurance * 100
              ).toFixed(1)}%, or ${(
                NO_PAYE_2026.rateWithoutNationalInsurance * 100
              ).toFixed(1)}% if exempt in 2026.`}
            />
          )}
          {!isPayeApplied ? (
            <>
              <SelectField
                id="no-childcare-deduction-mode"
                label="Childcare Deduction"
                value={inputs.childcareDeductionMode ?? "ordinary"}
                onChange={(childcareDeductionMode: NOChildcareDeductionMode) =>
                  setInputs((current) => ({
                    ...current,
                    childcareDeductionMode,
                  }))
                }
                options={CHILDCARE_DEDUCTION_OPTIONS}
                description={`Ordinary cap is NOK ${NO_CHILDCARE_DEDUCTION_2026.ordinaryFirstChild.toLocaleString("nb-NO")} for the first child plus NOK ${NO_CHILDCARE_DEDUCTION_2026.ordinaryAdditionalChild.toLocaleString("nb-NO")} per additional child.`}
              />
              <NumberStepperField
                id="no-childcare-children"
                label="Childcare Children"
                value={inputs.childcareChildren}
                onChange={(childcareChildren) =>
                  setInputs((current) => ({
                    ...current,
                    childcareChildren: Math.round(clamp(childcareChildren, 10)),
                  }))
                }
                min={0}
                max={10}
                description="Children with documented care costs; use special-needs mode for eligible children age 12 or older."
              />
              <NumberField
                id="no-round-trip-commuting-km"
                label="Round-Trip Commute Km"
                value={inputs.roundTripCommutingKm}
                onChange={(roundTripCommutingKm) =>
                  setInputs((current) => ({
                    ...current,
                    roundTripCommutingKm: clamp(roundTripCommutingKm, 1000),
                  }))
                }
                min={0}
                max={1000}
                description={`Skatteetaten 2026 commute deduction uses NOK ${NO_COMMUTING_DEDUCTION_2026.ratePerKm.toFixed(2)}/km after the NOK ${NO_COMMUTING_DEDUCTION_2026.lowerThreshold.toLocaleString("nb-NO")} threshold.`}
              />
              <NumberField
                id="no-commuting-workdays"
                label="Commuting Workdays"
                value={inputs.commutingWorkdays}
                onChange={(commutingWorkdays) =>
                  setInputs((current) => ({
                    ...current,
                    commutingWorkdays: Math.round(clamp(commutingWorkdays, 366)),
                  }))
                }
                min={0}
                max={366}
                description="Annual days travelled between home and work."
              />
            </>
          ) : null}
          <PayFrequencyField
            id="no-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
        </CalculatorFieldGrid>
      }
      contributions={
        !isPayeApplied ? (
          <div className="space-y-6">
            {deductionControls}
            <CurrencyAmountField
              id="no-debt-interest-paid"
              label="Debt Interest Paid"
              value={inputs.contributions?.debtInterestPaid ?? 0}
              onChange={(value) => setContribution("debtInterestPaid", value)}
              currency={currency}
              step={500}
              description="Interest paid on loans that is deductible from ordinary income; the calculator floors taxable income at zero."
            />
          </div>
        ) : undefined
      }
      contributionsTitle="Norway Ordinary Deductions"
      contributionsDescription={
        isPayeApplied
          ? "PAYE is a gross-tax scheme, so ordinary deductions are not applied"
          : "IPS, union dues, childcare costs, commuting, and debt interest that reduce ordinary income"
      }
      contributionsEmptyState={
        isPayeApplied
          ? "PAYE does not allow ordinary deductions such as IPS. Switch to general taxation rules to model IPS; PAYE relief claims require separate ordinary-tax facts."
          : undefined
      }
      seoInfo={<NOTaxInfo />}
      infoCard={
        <InfoPanel title="Modeled Scope">
          <p>
            This models ordinary Norway employment salary for a full tax year
            using the calculator&apos;s current national assumptions.
          </p>
          <p className="mt-2">
            PAYE for eligible foreign workers is modeled as a separate gross
            tax scheme up to the 2026 income threshold. Wealth tax, regional
            employer contributions, holiday-pay timing, treaty positions, and
            non-salary income need separate residency, deduction, employer-cost,
            or income-type inputs before they can be shown accurately.
          </p>
        </InfoPanel>
      }
    />
  );
}

function NOTaxInfoContent() {
  return (
    <div>
      <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">Norway</h3>
      <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
        <li>
          <strong className="text-zinc-300">Ordinary Income Tax</strong> -
          ordinary income is taxed at 22% after modeled personal allowance,
          minimum standard deduction, and IPS deduction.
        </li>
        <li>
          <strong className="text-zinc-300">Bracket Tax</strong> - trinnskatt
          is applied progressively to gross personal income using the modeled
          2026 thresholds.
        </li>
        <li>
          <strong className="text-zinc-300">National Insurance</strong> -
          employee National Insurance contribution is modeled at 7.6% of gross
          salary.
        </li>
        <li>
          <strong className="text-zinc-300">PAYE</strong> - eligible new or
          temporary foreign workers can select the gross PAYE scheme. Ordinary
          deductions and IPS are not applied when PAYE applies.
        </li>
        <li>
          <strong className="text-zinc-300">IPS</strong> - individual pension
          savings are deductible up to the modeled IPS limit and also reduce
          take-home pay as a voluntary contribution.
        </li>
        <li>
          <strong className="text-zinc-300">Ordinary Deductions</strong> -
          union dues, childcare, commuting, and debt-interest inputs reduce
          ordinary income but do not reduce bracket tax or National Insurance.
        </li>
      </ul>
      <p className="text-zinc-400 text-sm mt-3">
        The calculator assumes employment salary for a full tax year. It models
        the ordinary resident calculation and selectable PAYE scheme, but wealth
        tax, holiday-pay timing, employer pension, treaty positions, and
        non-salary income need separate inputs before they can be shown
        accurately.
      </p>
    </div>
  );
}

function NOTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="mb-4 text-xl font-semibold text-zinc-200">
        How Norway Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <NOTaxInfoContent />
      </div>
    </section>
  );
}
