"use client";

import {
  BooleanSelectField,
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
import {
  CROATIA_LOCAL_TAX_RATES_2026,
  type HRLocalityCode,
} from "@/lib/countries/hr/constants/tax-brackets-2026";
import type {
  HRCalculatorInputs,
  HRPensionScheme,
  HRResidencyType,
  HRWorkScenario,
} from "@/lib/countries/hr/types";

const LOCALITY_OPTIONS: SelectOption<HRLocalityCode>[] =
  CROATIA_LOCAL_TAX_RATES_2026.map((locality) => ({
    value: locality.code,
    label: `${locality.name} (${(locality.lowerRate * 100).toFixed(1)}% / ${(
      locality.higherRate * 100
    ).toFixed(1)}%)`,
  }));

const PENSION_SCHEME_OPTIONS: SelectOption<HRPensionScheme>[] = [
  {
    value: "pillar_1_and_2",
    label: "I + II pillars (15% + 5%)",
  },
  {
    value: "pillar_1_only",
    label: "I pillar only (20%)",
  },
];

const WORK_SCENARIO_OPTIONS: SelectOption<HRWorkScenario>[] = [
  { value: "croatian_payroll", label: "Croatian payroll employment" },
  {
    value: "digital_nomad_foreign_employer",
    label: "Digital nomad foreign employer",
  },
];

export default function HRCountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const {
    inputs,
    setInputs,
    currency,
    result,
    setGrossSalary,
    setPayFrequency,
  } = useCountryCalculatorExtension<HRCalculatorInputs>(country);
  const isDigitalNomadForeignEmployer =
    inputs.workScenario === "digital_nomad_foreign_employer";

  return (
    <CountryCalculatorExtensionShell
      country={country}
      currency={currency}
      grossSalary={inputs.grossSalary}
      onGrossSalaryChange={setGrossSalary}
      result={result}
      taxOptions={
        <CalculatorFieldGrid columns={3}>
          <SelectField
            id="hr-work-scenario"
            label="Work Scenario"
            value={inputs.workScenario ?? "croatian_payroll"}
            onChange={(workScenario: HRWorkScenario) =>
              setInputs((current) => ({
                ...current,
                workScenario,
                residencyType:
                  workScenario === "digital_nomad_foreign_employer"
                    ? "non_resident"
                    : current.residencyType,
                croatianReturneeRelief:
                  workScenario === "digital_nomad_foreign_employer"
                    ? false
                    : current.croatianReturneeRelief,
                hasDependentSpouse:
                  workScenario === "digital_nomad_foreign_employer"
                    ? false
                    : current.hasDependentSpouse,
                numberOfOtherDependents:
                  workScenario === "digital_nomad_foreign_employer"
                    ? 0
                    : current.numberOfOtherDependents,
                numberOfChildren:
                  workScenario === "digital_nomad_foreign_employer"
                    ? 0
                    : current.numberOfChildren,
                numberOfDisabilityAllowances:
                  workScenario === "digital_nomad_foreign_employer"
                    ? 0
                    : current.numberOfDisabilityAllowances,
                numberOfSevereDisabilityAllowances:
                  workScenario === "digital_nomad_foreign_employer"
                    ? 0
                    : current.numberOfSevereDisabilityAllowances,
                taxableBenefitsInKind:
                  workScenario === "digital_nomad_foreign_employer"
                    ? 0
                    : current.taxableBenefitsInKind,
              }))
            }
            options={WORK_SCENARIO_OPTIONS}
            description="Use the digital-nomad scenario only for qualifying foreign-employer or foreign-company work."
          />
          <SelectField
            id="hr-residency-type"
            label="Residency Status"
            value={inputs.residencyType}
            onChange={(residencyType: HRResidencyType) =>
              setInputs((current) => ({
                ...current,
                residencyType: isDigitalNomadForeignEmployer
                  ? "non_resident"
                  : residencyType,
                croatianReturneeRelief:
                  residencyType === "resident"
                    ? current.croatianReturneeRelief
                    : false,
              }))
            }
            options={[
              {
                value: "resident",
                label: "Croatian Tax Resident",
                disabled: isDigitalNomadForeignEmployer,
              },
              { value: "non_resident", label: "Non-Resident" },
            ]}
            description={
              isDigitalNomadForeignEmployer
                ? "Digital-nomad temporary stay is modeled as non-Croatian payroll"
                : inputs.residencyType === "non_resident"
                ? "Family allowance additions are not applied"
                : undefined
            }
          />
          {!isDigitalNomadForeignEmployer && (
            <>
              <SelectField
                id="hr-locality"
                label="Local Tax Rate"
                value={inputs.locality}
                onChange={(locality: HRLocalityCode) =>
                  setInputs((current) => ({ ...current, locality }))
                }
                options={LOCALITY_OPTIONS}
                description="Rates are set by local self-government units"
              />
              <NumberField
                id="hr-age"
                label="Age"
                value={inputs.age}
                onChange={(age) =>
                  setInputs((current) => ({
                    ...current,
                    age: Math.min(100, Math.max(16, Math.round(age))),
                  }))
                }
                min={16}
                max={100}
                fallbackValue={35}
                description="Youth relief reduces annual employment income tax by 100% up to age 25 and 50% from age 26 to 30, limited to lower-bracket tax."
              />
              <BooleanSelectField
                id="hr-croatian-returnee-relief"
                label="Croatian Returnee Relief"
                value={
                  inputs.residencyType === "resident" &&
                  inputs.croatianReturneeRelief
                }
                onChange={(croatianReturneeRelief) =>
                  setInputs((current) => ({
                    ...current,
                    croatianReturneeRelief:
                      current.residencyType === "resident"
                        ? croatianReturneeRelief
                        : false,
                  }))
                }
                trueLabel="Apply"
                falseLabel="Not eligible"
                description={
                  inputs.residencyType === "resident"
                    ? "For qualifying Croatian citizens, emigrants, and descendants returning under the five-year employment income-tax relief; this overrides youth relief."
                    : "Returnee relief is modeled only for Croatian tax residents."
                }
              />
              <SelectField
                id="hr-pension-scheme"
                label="Pension Scheme"
                value={inputs.pensionScheme}
                onChange={(pensionScheme: HRPensionScheme) =>
                  setInputs((current) => ({ ...current, pensionScheme }))
                }
                options={PENSION_SCHEME_OPTIONS}
                description="Both options deduct 20% total pension contribution"
              />
              <CurrencyAmountField
                id="hr-taxable-benefits-in-kind"
                label="Taxable Benefits in Kind"
                value={inputs.taxableBenefitsInKind}
                onChange={(taxableBenefitsInKind) =>
                  setInputs((current) => ({
                    ...current,
                    taxableBenefitsInKind: Math.max(
                      0,
                      taxableBenefitsInKind,
                    ),
                  }))
                }
                currency={currency}
                step={100}
                description="Annual taxable value of non-cash employment benefits; increases Croatian payroll tax and pension bases but not cash gross pay."
              />
              <BooleanSelectField
                id="hr-dependent-spouse"
                label="Dependent Spouse"
                value={inputs.hasDependentSpouse}
                onChange={(hasDependentSpouse) =>
                  setInputs((current) => ({ ...current, hasDependentSpouse }))
                }
                trueLabel="Yes"
                falseLabel="No"
                description="Resident personal allowance addition"
              />
              <NumberStepperField
                id="hr-other-dependents"
                label="Other Dependents"
                value={inputs.numberOfOtherDependents}
                onChange={(numberOfOtherDependents) =>
                  setInputs((current) => ({
                    ...current,
                    numberOfOtherDependents: Math.min(
                      12,
                      Math.max(0, Math.floor(numberOfOtherDependents)),
                    ),
                  }))
                }
                min={0}
                max={12}
                description="Resident allowance for other dependent immediate family members"
              />
              <NumberStepperField
                id="hr-number-of-children"
                label="Dependent Children"
                value={inputs.numberOfChildren}
                onChange={(numberOfChildren) =>
                  setInputs((current) => ({
                    ...current,
                    numberOfChildren: Math.min(
                      12,
                      Math.max(0, Math.floor(numberOfChildren)),
                    ),
                  }))
                }
                min={0}
                max={12}
                description="Resident child allowance additions; children after the ninth continue with the statutory progressive factor"
              />
              <NumberStepperField
                id="hr-disability-allowances"
                label="Disability Allowances"
                value={inputs.numberOfDisabilityAllowances}
                onChange={(numberOfDisabilityAllowances) =>
                  setInputs((current) => ({
                    ...current,
                    numberOfDisabilityAllowances: Math.min(
                      20,
                      Math.max(0, Math.floor(numberOfDisabilityAllowances)),
                    ),
                  }))
                }
                min={0}
                max={20}
                description="Count taxpayer, dependents, or children with disability below the 100%/care category"
              />
              <NumberStepperField
                id="hr-severe-disability-allowances"
                label="100% Disability / Care"
                value={inputs.numberOfSevereDisabilityAllowances}
                onChange={(numberOfSevereDisabilityAllowances) =>
                  setInputs((current) => ({
                    ...current,
                    numberOfSevereDisabilityAllowances: Math.min(
                      20,
                      Math.max(
                        0,
                        Math.floor(numberOfSevereDisabilityAllowances),
                      ),
                    ),
                  }))
                }
                min={0}
                max={20}
                description="Count qualifying people in the 100% disability, care allowance, personal disability allowance, or inclusion supplement category; do not also count them in Disability Allowances"
              />
            </>
          )}
          <PayFrequencyField
            id="hr-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
        </CalculatorFieldGrid>
      }
      contributionsTitle="Croatia Relief and Allowance Inputs"
      contributionsDescription="Croatia youth, returnee, family, and pension settings are shown above"
      contributionsEmptyState={
        isDigitalNomadForeignEmployer
          ? "Qualifying digital-nomad foreign-employer income is modeled as exempt from Croatian income tax and outside Croatian employee payroll contributions. There is no Croatian voluntary contribution slider in this scenario."
          : "Youth relief, Croatian returnee relief, resident spouse, other dependent, child, and disability allowance inputs are modeled in Income Details, and mandatory employee pension contributions are automatic. Employee-paid voluntary pension is not modeled as a payroll income-tax deduction from the reviewed salary guidance and would require separate facts."
      }
      seoInfo={<HRTaxInfo />}
      infoCard={
        <InfoPanel title="Modeled Scope">
          <p>
            This models ordinary Croatian employment salary for a full tax year.
            Employee pension is deducted from gross salary before income tax;
            employer health insurance is shown in results but not deducted from
            take-home pay.
          </p>
          <p className="mt-2">
            The digital-nomad scenario applies only to qualifying work through
            communication technology for a foreign employer or own foreign
            company not registered in Croatia. Croatian-client work, Croatian
            payroll, employer-paid voluntary pension premiums, benefit-in-kind
            valuation worksheets, and employer-side hiring incentives are not
            treated as ordinary employee salary inputs here.
          </p>
          <p className="mt-2">
            Taxable benefits in kind are shown as an annual value input for
            Croatian payroll employment. They increase the modeled pension and
            income-tax bases, but not cash gross pay.
          </p>
          <p className="mt-2">
            Youth relief and the Croatian returnee five-year relief are modeled
            as annual employment income-tax reductions. They reduce income tax
            only, not employee pension contributions.
          </p>
        </InfoPanel>
      }
    />
  );
}

function HRTaxInfoContent() {
  return (
    <div>
      <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">Croatia</h3>
      <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
        <li><strong className="text-zinc-300">Local Income Tax</strong> – the calculator uses the selected locality&apos;s two-band annual income tax rates with a higher-rate threshold.</li>
        <li><strong className="text-zinc-300">Pension Contributions</strong> – employee pension is deducted before tax, either 15% first pillar plus 5% second pillar or 20% first pillar only, subject to the annual pension base ceiling.</li>
        <li><strong className="text-zinc-300">Personal Allowance</strong> – the annual basic allowance is applied, with resident-only spouse and child allowance factors where entered.</li>
        <li><strong className="text-zinc-300">Youth and Returnee Relief</strong> – eligible younger workers receive lower-bracket income-tax relief, while qualifying Croatian returnees can reduce modeled employment income tax for five years.</li>
        <li><strong className="text-zinc-300">Digital Nomad Scenario</strong> – qualifying foreign-employer or foreign-company work can be selected separately from ordinary Croatian payroll.</li>
        <li><strong className="text-zinc-300">Employer Health</strong> – employer health insurance is displayed for context but does not reduce take-home pay.</li>
      </ul>
      <p className="text-zinc-400 text-sm mt-3">Taxable income is gross salary minus employee pension and personal allowance. Taxable benefits in kind, youth relief, returnee relief, and the foreign-employer digital-nomad scenario are modeled when selected; employer-paid voluntary pension benefits and employer-side special contribution exemptions remain separate.</p>
    </div>
  );
}

function HRTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="mb-4 text-xl font-semibold text-zinc-200">
        How Croatia Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <HRTaxInfoContent />
      </div>
    </section>
  );
}
