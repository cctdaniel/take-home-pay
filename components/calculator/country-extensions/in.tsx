"use client";

import {
  BooleanSelectField,
  CalculatorFieldGrid,
  CurrencyAmountField,
  PayFrequencyField,
  SelectField,
} from "@/components/calculator/calculator-fields";
import {
  CountryCalculatorExtensionShell,
  useCountryCalculatorExtension,
} from "@/components/calculator/country-extension";
import { InfoPanel } from "@/components/calculator/info-panel";
import { ContributionSlider } from "@/components/ui/contribution-slider";
import { INCalculator } from "@/lib/countries/in";
import {
  IN_NPS_80CCD_1B_LIMIT,
  IN_PROFESSIONAL_TAX_ANNUAL_CAP,
  IN_SECTION_80D_2026,
  IN_SECTION_80C_LIMIT,
} from "@/lib/countries/in/constants/tax-parameters-2026";
import type { INCalculatorInputs, INRegime } from "@/lib/countries/types";
import type { CountryCalculatorExtensionProps } from "../country-extension";

const REGIME_OPTIONS = [
  { value: "new" as const, label: "New Regime (default)" },
  { value: "old" as const, label: "Old Regime" },
];

export default function INCountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const { inputs, setInputs, currency, result, setGrossSalary, setPayFrequency } =
    useCountryCalculatorExtension<INCalculatorInputs>(country);
  const limits = INCalculator.getContributionLimits(inputs);
  const isOldRegime = inputs.regime === "old";

  const setContribution = (
    key: keyof INCalculatorInputs["contributions"],
    value: number,
  ) => {
    const max = limits[key]?.limit ?? value;
    setInputs((current) => ({
      ...current,
      contributions: {
        ...current.contributions,
        [key]: Math.max(0, Math.min(value, max)),
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
        <div className="space-y-4">
          <CalculatorFieldGrid columns={2}>
            <SelectField
              id="in-regime"
              label="Tax Regime"
              value={inputs.regime}
              onChange={(regime: INRegime) =>
                setInputs((current) => ({ ...current, regime }))
              }
              options={REGIME_OPTIONS}
              description="New regime (0–30%, fewer deductions) vs old regime (0–30%, more deductions)"
            />
            <PayFrequencyField value={inputs.payFrequency} onChange={setPayFrequency} />
          </CalculatorFieldGrid>

          <BooleanSelectField
            id="in-epf"
            label="EPF Applicable"
            value={inputs.isEpfApplicable}
            onChange={(isEpfApplicable) =>
              setInputs((current) => ({ ...current, isEpfApplicable }))
            }
            description="Employee Provident Fund (12% employee contribution capped at 15,000 INR/month wage)"
          />

          <ContributionSlider
            label="Annual Professional Tax Paid"
            value={inputs.professionalTaxPaid}
            onChange={(professionalTaxPaid) =>
              setInputs((current) => ({
                ...current,
                professionalTaxPaid: Math.max(
                  0,
                  Math.min(professionalTaxPaid, limits.professionalTaxPaid.limit),
                ),
              }))
            }
            currency={currency}
            max={IN_PROFESSIONAL_TAX_ANNUAL_CAP}
            step={100}
            description={
              isOldRegime
                ? "Employee-paid state professional tax reduces salary income under section 16(iii)."
                : "Still reduces cash take-home if paid, but section 16(iii) is not deductible under the new regime."
            }
          />

          <CalculatorFieldGrid columns={2}>
            <BooleanSelectField
              id="in-hra-metro"
              label="HRA Metro City"
              value={inputs.hra.isMetroCity}
              onChange={(isMetroCity) =>
                setInputs((current) => ({
                  ...current,
                  hra: { ...current.hra, isMetroCity },
                }))
              }
              trueLabel="Metro"
              falseLabel="Non-metro"
              description="For HRA, metro cities use the 50% salary test; non-metro uses 40%."
            />
          </CalculatorFieldGrid>

          <CalculatorFieldGrid columns={3}>
            <CurrencyAmountField
              id="in-hra-received"
              label="Annual HRA Received"
              value={inputs.hra.annualHraReceived}
              onChange={(annualHraReceived) =>
                setInputs((current) => ({
                  ...current,
                  hra: {
                    ...current.hra,
                    annualHraReceived: Math.max(
                      0,
                      Math.min(annualHraReceived, current.grossSalary),
                    ),
                  },
                }))
              }
              currency={currency}
              max={inputs.grossSalary}
              step={1_000}
              description="Old-regime house rent allowance exemption input."
            />
            <CurrencyAmountField
              id="in-hra-rent"
              label="Annual Rent Paid"
              value={inputs.hra.annualRentPaid}
              onChange={(annualRentPaid) =>
                setInputs((current) => ({
                  ...current,
                  hra: {
                    ...current.hra,
                    annualRentPaid: Math.max(0, annualRentPaid),
                  },
                }))
              }
              currency={currency}
              step={1_000}
              description="Used only for the HRA exemption formula; rent is not subtracted from payroll take-home."
            />
            <CurrencyAmountField
              id="in-hra-basic"
              label="Basic Salary + DA for HRA"
              value={inputs.hra.annualBasicSalaryForHra}
              onChange={(annualBasicSalaryForHra) =>
                setInputs((current) => ({
                  ...current,
                  hra: {
                    ...current.hra,
                    annualBasicSalaryForHra: Math.max(
                      0,
                      Math.min(annualBasicSalaryForHra, current.grossSalary),
                    ),
                  },
                }))
              }
              currency={currency}
              max={inputs.grossSalary}
              step={1_000}
              description="Salary base for the official 10%, 40%, and 50% HRA tests."
            />
          </CalculatorFieldGrid>

          <InfoPanel title="India assumptions" tone="neutral">
            Modeled with 2026 income tax brackets for the selected regime
            (0–30%). New regime includes 75,000 INR standard deduction and
            Section 87A rebate (up to 60,000 INR). Old regime includes 50,000
            INR standard deduction plus selected HRA, professional tax,
            Section 80C, NPS, and Section 80D deductions. Surcharge (10–25%)
            applies to income above 5,000,000 INR. Health & Education Cess of
            4% on income tax plus surcharge. EPF employee contribution is
            modeled at 12% on monthly wage up to the 15,000 INR statutory
            ceiling. Employer NPS/EPF taxability, detailed Form 16 component
            splits, gratuity, and state-by-state professional-tax schedules
            need separate facts.
          </InfoPanel>
        </div>
      }
      contributions={
        <div className="space-y-5">
          <ContributionSlider
            label="Section 80C Investments"
            value={inputs.contributions.section80CInvestments}
            onChange={(section80CInvestments) =>
              setContribution("section80CInvestments", section80CInvestments)
            }
            max={IN_SECTION_80C_LIMIT}
            step={5_000}
            currency={currency}
            description="Old-regime Section 80C cap is INR 150,000, combined with employee EPF."
          />
          <ContributionSlider
            label="NPS Employee Contribution"
            value={inputs.contributions.npsEmployeeContribution}
            onChange={(npsEmployeeContribution) =>
              setContribution("npsEmployeeContribution", npsEmployeeContribution)
            }
            max={IN_NPS_80CCD_1B_LIMIT}
            step={1_000}
            currency={currency}
            description="Old-regime additional NPS deduction under Section 80CCD(1B), capped at INR 50,000."
          />
          <CalculatorFieldGrid columns={2}>
            <BooleanSelectField
              id="in-80d-self-senior"
              label="Self/Family Senior for 80D"
              value={inputs.hasSeniorCitizenSelfOrFamilyFor80D}
              onChange={(hasSeniorCitizenSelfOrFamilyFor80D) =>
                setInputs((current) => ({
                  ...current,
                  hasSeniorCitizenSelfOrFamilyFor80D,
                  contributions: {
                    ...current.contributions,
                    section80DHealthInsuranceSelfFamily: Math.min(
                      current.contributions.section80DHealthInsuranceSelfFamily,
                      hasSeniorCitizenSelfOrFamilyFor80D
                        ? IN_SECTION_80D_2026.selfFamilySeniorLimit
                        : IN_SECTION_80D_2026.selfFamilyLimit,
                    ),
                  },
                }))
              }
              description="Raises the self/spouse/dependent-children 80D cap from INR 25,000 to INR 50,000."
            />
            <BooleanSelectField
              id="in-80d-parents-senior"
              label="Parents Senior for 80D"
              value={inputs.hasSeniorCitizenParentsFor80D}
              onChange={(hasSeniorCitizenParentsFor80D) =>
                setInputs((current) => ({
                  ...current,
                  hasSeniorCitizenParentsFor80D,
                  contributions: {
                    ...current.contributions,
                    section80DHealthInsuranceParents: Math.min(
                      current.contributions.section80DHealthInsuranceParents,
                      hasSeniorCitizenParentsFor80D
                        ? IN_SECTION_80D_2026.parentsSeniorLimit
                        : IN_SECTION_80D_2026.parentsLimit,
                    ),
                  },
                }))
              }
              description="Raises the parents 80D cap from INR 25,000 to INR 50,000."
            />
          </CalculatorFieldGrid>
          <ContributionSlider
            label="Section 80D Health Insurance - Self/Family"
            value={inputs.contributions.section80DHealthInsuranceSelfFamily}
            onChange={(section80DHealthInsuranceSelfFamily) =>
              setContribution(
                "section80DHealthInsuranceSelfFamily",
                section80DHealthInsuranceSelfFamily,
              )
            }
            max={limits.section80DHealthInsuranceSelfFamily.limit}
            step={1_000}
            currency={currency}
            description="Old-regime medical insurance or senior medical expenditure cap for self, spouse, and dependent children."
          />
          <ContributionSlider
            label="Section 80D Health Insurance - Parents"
            value={inputs.contributions.section80DHealthInsuranceParents}
            onChange={(section80DHealthInsuranceParents) =>
              setContribution(
                "section80DHealthInsuranceParents",
                section80DHealthInsuranceParents,
              )
            }
            max={limits.section80DHealthInsuranceParents.limit}
            step={1_000}
            currency={currency}
            description="Old-regime medical insurance or senior medical expenditure cap for parents."
          />
        </div>
      }
      seoInfo={<INTaxInfo />}
      contributionsTitle="Old-Regime Deduction Inputs"
      contributionsDescription={
        isOldRegime
          ? "Modeled deductions that also reduce cash take-home when entered"
          : "Shown for planning; Chapter VI-A employee deductions are disabled under the new regime except employer-only items not modeled here"
      }
    />
  );
}

function INTaxInfoContent() {
  return (
    <div>
      <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">India</h3>
      <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
        <li><strong className="text-zinc-300">Tax Regime</strong> – choose new or old regime; each uses its own slab rates and standard deduction.</li>
        <li><strong className="text-zinc-300">Standard Deduction</strong> – the calculator applies the modeled salaried standard deduction before tax.</li>
        <li><strong className="text-zinc-300">Rebate, Surcharge, and Cess</strong> – Section 87A rebate, income-based surcharge, and 4% health and education cess are included by the calculator.</li>
        <li><strong className="text-zinc-300">EPF</strong> – optional employee EPF is modeled at 12% on the capped monthly wage base and reduces take-home pay.</li>
        <li><strong className="text-zinc-300">Old-Regime Salary Deductions</strong> – HRA exemption, employee-paid professional tax, Section 80C, NPS 80CCD(1B), and Section 80D medical insurance are modeled when entered.</li>
      </ul>
      <p className="text-zinc-400 text-sm mt-3">Taxable income starts from gross salary, then applies the selected regime&apos;s standard deduction and eligible old-regime HRA, professional tax, Chapter VI-A, and NPS deductions. Employer EPF/EPS/NPS taxability, gratuity, other Chapter VI-A schedules, state-by-state professional-tax schedules, surcharge marginal relief, and detailed Form 16 component splits need separate facts.</p>
    </div>
  );
}

function INTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="mb-4 text-xl font-semibold text-zinc-200">
        How India Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <INTaxInfoContent />
      </div>
    </section>
  );
}
