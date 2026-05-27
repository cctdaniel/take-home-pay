"use client";

import {
  BooleanSelectField,
  CalculatorFieldGrid,
  CurrencyAmountField,
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
import {
  KW_BASIC_PIFSS_MONTHLY_CAP,
  KW_SUPPLEMENTARY_PIFSS_MONTHLY_CAP,
} from "@/lib/countries/kw/constants/tax-year-2026";
import type {
  KWCalculatorInputs,
  KWSector,
  KWWorkerType,
} from "@/lib/countries/kw/types";

const WORKER_TYPE_OPTIONS: SelectOption<KWWorkerType>[] = [
  { value: "expatriate", label: "Expatriate employee" },
  { value: "kuwaiti", label: "Kuwaiti employee" },
];
const SECTOR_OPTIONS: SelectOption<KWSector>[] = [
  { value: "government", label: "Government / public sector" },
  { value: "privateOil", label: "Private or oil sector" },
];

export default function KuwaitCalculatorExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const {
    inputs,
    currency,
    result,
    setGrossSalary,
    setPayFrequency,
    setInputs,
  } = useCountryCalculatorExtension<KWCalculatorInputs>(country);
  const isKuwaitiEmployee = inputs.workerType === "kuwaiti";

  const setWorkerType = (workerType: KWWorkerType) => {
    setInputs((current) => ({
      ...current,
      workerType,
      pifssInsurableSalaryMonthly:
        workerType === "kuwaiti"
          ? current.pifssInsurableSalaryMonthly ||
            Math.min(
              Math.max(0, current.grossSalary / 12),
              KW_BASIC_PIFSS_MONTHLY_CAP +
                KW_SUPPLEMENTARY_PIFSS_MONTHLY_CAP,
            )
          : 0,
      pifssBasicSalaryMonthly:
        workerType === "kuwaiti"
          ? current.pifssBasicSalaryMonthly ||
            Math.min(Math.max(0, current.grossSalary / 12), KW_BASIC_PIFSS_MONTHLY_CAP)
          : 0,
      pifssSupplementarySalaryMonthly:
        workerType === "kuwaiti"
          ? current.pifssSupplementarySalaryMonthly ||
            Math.min(
              Math.max(0, current.grossSalary / 12 - KW_BASIC_PIFSS_MONTHLY_CAP),
              KW_SUPPLEMENTARY_PIFSS_MONTHLY_CAP,
            )
          : 0,
      includeFinancialRemuneration:
        workerType === "kuwaiti" ? current.includeFinancialRemuneration : false,
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
            id="kw-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
          <SelectField
            id="kw-worker-type"
            label="Worker Type"
            value={inputs.workerType}
            onChange={setWorkerType}
            options={WORKER_TYPE_OPTIONS}
            description="Expatriates have no local employee social security deduction; Kuwaiti employees deduct capped employee PIFSS contributions."
          />
          {isKuwaitiEmployee ? (
            <>
              <SelectField
                id="kw-sector"
                label="PIFSS Sector"
                value={inputs.sector}
                onChange={(sector) =>
                  setInputs((current) => ({
                    ...current,
                    sector: sector as KWSector,
                  }))
                }
                options={SECTOR_OPTIONS}
                description="Private and oil-sector insured employees also pay 0.5% unemployment insurance under the PIFSS FAQ."
              />
              <CurrencyAmountField
                id="kw-pifss-basic-salary"
                label="Basic insurance salary (monthly)"
                value={inputs.pifssBasicSalaryMonthly}
                onChange={(pifssBasicSalaryMonthly) =>
                  setInputs((current) => ({
                    ...current,
                    pifssBasicSalaryMonthly: Math.min(
                      Math.max(0, pifssBasicSalaryMonthly),
                      KW_BASIC_PIFSS_MONTHLY_CAP,
                    ),
                  }))
                }
                currency={currency}
                min={0}
                max={KW_BASIC_PIFSS_MONTHLY_CAP}
                step={25}
                description={`PIFSS basic insurance salary is capped at KWD ${KW_BASIC_PIFSS_MONTHLY_CAP.toLocaleString()} per month.`}
              />
              <CurrencyAmountField
                id="kw-pifss-supplementary-salary"
                label="Supplementary insurance salary (monthly)"
                value={inputs.pifssSupplementarySalaryMonthly}
                onChange={(pifssSupplementarySalaryMonthly) =>
                  setInputs((current) => ({
                    ...current,
                    pifssSupplementarySalaryMonthly: Math.min(
                      Math.max(0, pifssSupplementarySalaryMonthly),
                      KW_SUPPLEMENTARY_PIFSS_MONTHLY_CAP,
                    ),
                  }))
                }
                currency={currency}
                min={0}
                max={KW_SUPPLEMENTARY_PIFSS_MONTHLY_CAP}
                step={25}
                description={`Mandatory supplementary insurance covers salary above the basic cap, capped at KWD ${KW_SUPPLEMENTARY_PIFSS_MONTHLY_CAP.toLocaleString()} per month.`}
              />
              <BooleanSelectField
                id="kw-financial-remuneration"
                label="Financial remuneration contribution"
                value={inputs.includeFinancialRemuneration}
                onChange={(includeFinancialRemuneration) =>
                  setInputs((current) => ({
                    ...current,
                    includeFinancialRemuneration,
                  }))
                }
                trueLabel="Include 2.5%"
                falseLabel="Exclude"
                description="Official PIFSS table lists a 2.5% insured contribution for financial remuneration after 18 years of contribution; enable it only when it applies."
              />
            </>
          ) : null}
        </CalculatorFieldGrid>
      }
      contributionsTitle="Kuwait Payroll Coverage Notes"
      contributionsDescription="Personal income tax is 0%; Kuwaiti PIFSS contribution bases and sector are selected above"
      contributionsEmptyState="Kuwait ordinary employment salary has no personal income tax in this model. Worker-type PIFSS contribution bases, sector, and conditional financial-remuneration coverage are selected above. GCC cross-border coverage, self-employed brackets, conjoining periods, indemnity funding, and benefits need employer or coverage facts rather than annual employee deduction sliders."
      infoCard={
        <InfoPanel title="Kuwait Payroll Scope">
          <p>
            Kuwait does not levy personal income tax on employment salary.
            Expatriate employees are modeled with no local employee social
            security deduction. For Kuwaiti employees, the model applies PIFSS
            employee deductions using the official PIFSS contribution lines:
            5% basic insurance up to KWD 1,500 per month, 5% supplementary
            insurance up to KWD 1,250 per month, 2.5% pension increase up to
            KWD 2,750 per month, optional/conditional 2.5% financial
            remuneration when selected, and 0.5% unemployment insurance for
            private or oil-sector employees.
          </p>
        </InfoPanel>
      }
      seoInfo={<KuwaitTaxInfo />}
    />
  );
}

function KuwaitTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="mb-4 text-xl font-semibold text-zinc-200">
        How Your Kuwait Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <ul className="mt-3 list-inside list-disc space-y-1 text-zinc-400">
          <li>
            <strong className="text-zinc-300">Income Tax</strong> - Kuwait has
            no personal income tax on ordinary employment salary.
          </li>
          <li>
            <strong className="text-zinc-300">Expatriate Employees</strong> -
            no Kuwait employee social security deduction is modeled.
          </li>
          <li>
            <strong className="text-zinc-300">Kuwaiti Employees</strong> - the
            employee deduction is modeled using the PIFSS basic,
            supplementary, pension-increase, financial-remuneration, and
            private/oil-sector unemployment contribution lines.
          </li>
          <li>
            <strong className="text-zinc-300">Formula</strong> - net salary
            equals gross salary minus any selected employee social security
            contributions.
          </li>
        </ul>
      </div>
    </section>
  );
}
