"use client";

import {
  BooleanSelectField,
  CalculatorFieldGrid,
  CurrencyAmountField,
  NumberField,
  NumberStepperField,
  PayFrequencyField,
  SelectField,
} from "@/components/calculator/calculator-fields";
import {
  CountryCalculatorExtensionShell,
  useCountryCalculatorExtension,
} from "@/components/calculator/country-extension";
import { InfoPanel } from "@/components/calculator/info-panel";
import { ContributionSlider } from "@/components/ui/contribution-slider";
import { getCountryCalculator } from "@/lib/countries/registry";
import {
  CN_MAJOR_ILLNESS_MEDICAL_ANNUAL_CAP,
  CN_MAJOR_ILLNESS_MEDICAL_THRESHOLD,
} from "@/lib/countries/cn/constants/tax-parameters-2026";
import type {
  CNCalculatorInputs,
  CNContributionInputs,
  CNDeductionMode,
  CNForeignAllowanceExemptions,
  CNSpecialDeductions,
  CNYearEndBonusTaxTreatment,
} from "@/lib/countries/types";
import { clampAmount } from "@/lib/utils";
import type { CountryCalculatorExtensionProps } from "../country-extension";

const HOUSING_FUND_RATE_OPTIONS = [
  { value: "0.05", label: "5%" },
  { value: "0.06", label: "6%" },
  { value: "0.07", label: "7%" },
  { value: "0.08", label: "8%" },
  { value: "0.09", label: "9%" },
  { value: "0.10", label: "10%" },
  { value: "0.11", label: "11%" },
  { value: "0.12", label: "12%" },
];

const HOUSING_RENT_CITY_OPTIONS = [
  { value: "none" as const, label: "None" },
  { value: "tier1" as const, label: "Tier 1 (1,500 CNY/mo)" },
  { value: "tier2" as const, label: "Tier 2 (1,100 CNY/mo)" },
  { value: "tier3" as const, label: "Tier 3 (800 CNY/mo)" },
];

const YEAR_END_BONUS_TAX_OPTIONS = [
  {
    value: "separate",
    label: "Separate preferential tax",
  },
  {
    value: "combined",
    label: "Combine with salary income",
  },
] satisfies Array<{ value: CNYearEndBonusTaxTreatment; label: string }>;

const DEDUCTION_MODE_OPTIONS = [
  {
    value: "specialAdditionalDeductions",
    label: "Special additional deductions",
  },
  {
    value: "foreignAllowanceExemption",
    label: "Foreign allowance exemptions",
  },
] satisfies Array<{ value: CNDeductionMode; label: string }>;


export default function CNCountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const { inputs, setInputs, currency, result, setGrossSalary, setPayFrequency } =
    useCountryCalculatorExtension<CNCalculatorInputs>(country);

  const sd = inputs.specialDeductions;
  const foreignAllowances = inputs.foreignAllowanceExemptions ?? {
    housingMealsLaundryRelocation: 0,
    businessTravelAllowance: 0,
    homeLeaveTravel: 0,
    languageTraining: 0,
    childrenEducation: 0,
  };
  const contributionLimits = getCountryCalculator(country).getContributionLimits(inputs);
  const contributionKeys = [
    "enterpriseAnnuityContribution",
    "individualPensionContribution",
    "taxPreferredHealthInsurance",
    "charitableDonations",
  ] satisfies Array<keyof CNContributionInputs>;
  const majorIllnessMedicalInputLimit =
    CN_MAJOR_ILLNESS_MEDICAL_THRESHOLD + CN_MAJOR_ILLNESS_MEDICAL_ANNUAL_CAP;
  const setContribution = (
    key: keyof CNContributionInputs,
    amount: number
  ) => {
    const limit = contributionLimits[key]?.limit ?? Number.POSITIVE_INFINITY;
    setInputs((current) => ({
      ...current,
      contributions: {
        ...current.contributions,
        [key]: Math.min(Math.max(0, amount), limit),
      },
    }));
  };
  const setForeignAllowance = (
    key: keyof CNForeignAllowanceExemptions,
    amount: number
  ) => {
    setInputs((current) => ({
      ...current,
      foreignAllowanceExemptions: {
        ...current.foreignAllowanceExemptions,
        [key]: clampAmount(amount, Infinity),
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
            <NumberField
              id="cn-social-insurance-base"
              label="Social Insurance Base (monthly)"
              value={inputs.socialInsuranceBase}
              onChange={(socialInsuranceBase) =>
                setInputs((current) => ({ ...current, socialInsuranceBase }))
              }
              min={0}
              step={100}
              description="Monthly base salary for social insurance calculation (capped at 36,000 CNY)"
            />
            <SelectField
              id="cn-housing-fund-rate"
              label="Housing Fund Rate"
              value={String(inputs.housingFundRate)}
              onChange={(v) =>
                setInputs((current) => ({
                  ...current,
                  housingFundRate: parseFloat(v),
                }))
              }
              options={HOUSING_FUND_RATE_OPTIONS}
              description="PRC Housing Provident Fund employee contribution rate"
            />
          </CalculatorFieldGrid>

          <PayFrequencyField value={inputs.payFrequency} onChange={setPayFrequency} />

          <CalculatorFieldGrid columns={2}>
            <CurrencyAmountField
              id="cn-year-end-bonus"
              label="Annual One-Time Bonus"
              value={inputs.yearEndBonus ?? 0}
              onChange={(yearEndBonus) =>
                setInputs((current) => ({
                  ...current,
                  yearEndBonus: clampAmount(yearEndBonus, Infinity),
                }))
              }
              currency={currency}
              min={0}
              step={1000}
              description="Resident taxpayers can choose separate preferential taxation for eligible annual one-time bonuses through 2027."
            />
            <SelectField
              id="cn-year-end-bonus-tax"
              label="Bonus Tax Treatment"
              value={inputs.yearEndBonusTaxTreatment ?? "separate"}
              onChange={(yearEndBonusTaxTreatment) =>
                setInputs((current) => ({
                  ...current,
                  yearEndBonusTaxTreatment,
                }))
              }
              options={YEAR_END_BONUS_TAX_OPTIONS}
              description="Separate tax divides the bonus by 12 to pick the monthly rate; combined tax adds it to comprehensive income."
            />
          </CalculatorFieldGrid>

          <CalculatorFieldGrid columns={2}>
            <CurrencyAmountField
              id="cn-taxable-in-kind-benefits"
              label="Taxable In-Kind Benefits"
              value={inputs.taxableInKindBenefits ?? 0}
              onChange={(taxableInKindBenefits) =>
                setInputs((current) => ({
                  ...current,
                  taxableInKindBenefits: clampAmount(taxableInKindBenefits, Infinity),
                }))
              }
              currency={currency}
              min={0}
              step={1000}
              description="Annual taxable value of employer-provided in-kind or other economic benefits; increases IIT income but not modeled cash take-home."
            />
            <SelectField
              id="cn-deduction-mode"
              label="Resident Deduction Package"
              value={inputs.deductionMode ?? "specialAdditionalDeductions"}
              onChange={(deductionMode: CNDeductionMode) =>
                setInputs((current) => ({ ...current, deductionMode }))
              }
              options={DEDUCTION_MODE_OPTIONS}
              description="Foreign resident individuals may choose allowance exemptions instead of special additional deductions through 2027."
            />
          </CalculatorFieldGrid>

          {inputs.deductionMode === "foreignAllowanceExemption" ? (
            <>
              <p className="text-xs font-medium text-zinc-400">
                Foreign Individual Allowance Exemptions
              </p>
              <CalculatorFieldGrid columns={2}>
                <CurrencyAmountField
                  id="cn-foreign-housing-meals-laundry-relocation"
                  label="Housing / Meals / Laundry / Relocation"
                  value={foreignAllowances.housingMealsLaundryRelocation}
                  onChange={(amount) =>
                    setForeignAllowance(
                      "housingMealsLaundryRelocation",
                      amount
                    )
                  }
                  currency={currency}
                  min={0}
                  step={1000}
                  description="Reasonable non-cash or reimbursement-form allowances with supporting vouchers."
                />
                <CurrencyAmountField
                  id="cn-foreign-business-travel"
                  label="Business Travel Allowance"
                  value={foreignAllowances.businessTravelAllowance}
                  onChange={(amount) =>
                    setForeignAllowance("businessTravelAllowance", amount)
                  }
                  currency={currency}
                  min={0}
                  step={1000}
                  description="Reasonable work travel allowance entered only if included in gross compensation."
                />
                <CurrencyAmountField
                  id="cn-foreign-home-leave"
                  label="Home Leave Travel"
                  value={foreignAllowances.homeLeaveTravel}
                  onChange={(amount) =>
                    setForeignAllowance("homeLeaveTravel", amount)
                  }
                  currency={currency}
                  min={0}
                  step={1000}
                  description="Reasonable home-leave travel subsidy with required documentation."
                />
                <CurrencyAmountField
                  id="cn-foreign-language-training"
                  label="Language Training"
                  value={foreignAllowances.languageTraining}
                  onChange={(amount) =>
                    setForeignAllowance("languageTraining", amount)
                  }
                  currency={currency}
                  min={0}
                  step={1000}
                  description="Reasonable China language-training allowance for the foreign individual."
                />
                <CurrencyAmountField
                  id="cn-foreign-children-education"
                  label="Children's Education"
                  value={foreignAllowances.childrenEducation}
                  onChange={(amount) =>
                    setForeignAllowance("childrenEducation", amount)
                  }
                  currency={currency}
                  min={0}
                  step={1000}
                  description="Reasonable children's education allowance supported by expense documents."
                />
              </CalculatorFieldGrid>
            </>
          ) : (
            <>
              <p className="text-xs font-medium text-zinc-400">
                Special Additional Deductions (专项附加扣除)
              </p>
              <CalculatorFieldGrid columns={2}>
                <NumberStepperField
                  id="cn-children"
                  label="Children (age 3+)"
                  value={sd.numberOfChildren}
                  onChange={(numberOfChildren) =>
                    setInputs((current) => ({
                      ...current,
                      specialDeductions: {
                        ...current.specialDeductions,
                        numberOfChildren,
                      },
                    }))
                  }
                  min={0}
                  max={10}
                  description="2,000 CNY/month per child"
                />
                <NumberStepperField
                  id="cn-children-under3"
                  label="Children under 3"
                  value={sd.numberOfChildrenUnder3}
                  onChange={(numberOfChildrenUnder3) =>
                    setInputs((current) => ({
                      ...current,
                      specialDeductions: {
                        ...current.specialDeductions,
                        numberOfChildrenUnder3,
                      },
                    }))
                  }
                  min={0}
                  max={10}
                  description="2,000 CNY/month per child"
                />
                <BooleanSelectField
                  id="cn-elderly-care"
                  label="Supports Elderly Relative"
                  value={sd.numberOfElderlyCare > 0}
                  onChange={(hasElderlyCare) =>
                    setInputs((current) => ({
                      ...current,
                      specialDeductions: {
                        ...current.specialDeductions,
                        numberOfElderlyCare: hasElderlyCare ? 1 : 0,
                      },
                    }))
                  }
                  description="3,000 CNY/month if only child, or modeled 1,500 CNY/month shared deduction"
                />
                <BooleanSelectField
                  id="cn-only-child"
                  label="Only Child"
                  value={sd.isOnlyChild}
                  onChange={(isOnlyChild) =>
                    setInputs((current) => ({
                      ...current,
                      specialDeductions: {
                        ...current.specialDeductions,
                        isOnlyChild,
                      },
                    }))
                  }
                  description="Affects elderly care deduction: 3,000 vs 1,500/month"
                />
              </CalculatorFieldGrid>

              <CalculatorFieldGrid columns={2}>
                <SelectField
                  id="cn-housing-rent-city"
                  label="Housing Rent City"
                  value={sd.housingRentCity}
                  onChange={(
                    housingRentCity: CNSpecialDeductions["housingRentCity"]
                  ) =>
                    setInputs((current) => ({
                      ...current,
                      specialDeductions: {
                        ...current.specialDeductions,
                        housingRentCity,
                        housingLoanInterest:
                          housingRentCity !== "none"
                            ? false
                            : current.specialDeductions.housingLoanInterest,
                      },
                    }))
                  }
                  options={HOUSING_RENT_CITY_OPTIONS}
                  description="Mutually exclusive with mortgage interest deduction"
                />
                <BooleanSelectField
                  id="cn-housing-loan"
                  label="First Home Mortgage Interest"
                  value={sd.housingLoanInterest}
                  onChange={(housingLoanInterest) =>
                    setInputs((current) => ({
                      ...current,
                      specialDeductions: {
                        ...current.specialDeductions,
                        housingLoanInterest,
                        housingRentCity: housingLoanInterest
                          ? "none"
                          : current.specialDeductions.housingRentCity,
                      },
                    }))
                  }
                  description="1,000 CNY/month (mutually exclusive with rent)"
                />
                <BooleanSelectField
                  id="cn-continuing-ed"
                  label="Degree Continuing Education"
                  value={sd.continuingEducation}
                  onChange={(continuingEducation) =>
                    setInputs((current) => ({
                      ...current,
                      specialDeductions: {
                        ...current.specialDeductions,
                        continuingEducation,
                      },
                    }))
                  }
                  description="400 CNY/month for eligible degree continuing education"
                />
                <BooleanSelectField
                  id="cn-professional-qualification-ed"
                  label="Professional Qualification"
                  value={sd.professionalQualificationEducation}
                  onChange={(professionalQualificationEducation) =>
                    setInputs((current) => ({
                      ...current,
                      specialDeductions: {
                        ...current.specialDeductions,
                        professionalQualificationEducation,
                      },
                    }))
                  }
                  description="3,600 CNY in the year an eligible professional certificate is obtained"
                />
                <ContributionSlider
                  label="Major Illness Medical Costs"
                  value={Math.min(
                    sd.majorIllnessMedicalExpenses,
                    majorIllnessMedicalInputLimit
                  )}
                  onChange={(majorIllnessMedicalExpenses) =>
                    setInputs((current) => ({
                      ...current,
                      specialDeductions: {
                        ...current.specialDeductions,
                        majorIllnessMedicalExpenses: clampAmount(
                          majorIllnessMedicalExpenses,
                          majorIllnessMedicalInputLimit
                        ),
                      },
                    }))
                  }
                  max={majorIllnessMedicalInputLimit}
                  currency={currency}
                  step={1000}
                  description="Annual post-reimbursement basic-medical-insurance self-pay costs; amount above 15,000 CNY is deductible up to 80,000 CNY"
                />
              </CalculatorFieldGrid>
            </>
          )}

          <InfoPanel title="China assumptions" tone="neutral">
            Modeled with 2026 IIT brackets (3–45%), social insurance at national
            guidance rates (pension 8%, medical 2%, unemployment 0.5%), and
            housing fund at the selected rate (5–12%). Standard deduction is
            60,000 CNY/year. Social insurance ceilings use Tier 1 city caps
            (36,000 CNY/month). Eligible annual one-time bonuses can be taxed
            separately under the preferential method through 2027 or combined
            with comprehensive income. Taxable in-kind/economic benefits can be
            entered as IIT salary income without increasing modeled cash
            take-home. Foreign resident allowance exemptions are mutually
            exclusive with special additional deductions in the same tax year
            and are modeled as document-supported reasonable amounts. The
            optional section models employee
            enterprise/occupational annuity, individual pension, qualified
            commercial health insurance, and approved public-welfare donations.
            Employer contributions, local city variations, employer plan
            eligibility, benefit valuation worksheets, and treaty positions are
            excluded.
          </InfoPanel>
        </div>
      }
      seoInfo={<CNTaxInfo />}
      contributionsTitle="Resident Pension / Insurance / Donation Deductions"
      contributionsDescription="Modeled employee-controlled deductions that reduce China comprehensive income tax where eligible"
      contributions={
        <div className="space-y-6">
          {contributionKeys.map((key) => {
            const limit = contributionLimits[key];
            if (!limit) {
              return null;
            }

            return (
              <ContributionSlider
                key={key}
                label={limit.name}
                value={Math.min(inputs.contributions[key] ?? 0, limit.limit)}
                onChange={(amount) => setContribution(key, amount)}
                max={limit.limit}
                step={key === "taxPreferredHealthInsurance" ? 100 : 1000}
                currency={currency}
                description={limit.description}
              />
            );
          })}
        </div>
      }
    />
  );
}

function CNTaxInfoContent() {
  return (
    <div>
      <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">China</h3>
      <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
        <li><strong className="text-zinc-300">Individual Income Tax</strong> – annual employment income is taxed with the progressive wage bands from 3% to 45%.</li>
        <li><strong className="text-zinc-300">Standard Deduction</strong> – CNY 60,000 per year is deducted before calculating taxable income.</li>
        <li><strong className="text-zinc-300">Social Insurance</strong> – pension, medical, and unemployment insurance are calculated from the entered monthly social insurance base, capped by the model.</li>
        <li><strong className="text-zinc-300">Housing Fund</strong> – the selected housing fund rate is applied to the same capped monthly base and reduces taxable income and take-home pay.</li>
        <li><strong className="text-zinc-300">Special Additional Deductions</strong> – child education, children under 3, elderly care, housing rent or first-home loan interest, continuing education, professional qualification, and major illness medical deductions are included when entered.</li>
        <li><strong className="text-zinc-300">Other Resident Deductions</strong> – employee enterprise or occupational annuity, individual pension, tax-preferred commercial health insurance, and approved public-welfare donations reduce taxable income when entered.</li>
      </ul>
      <p className="text-zinc-400 text-sm mt-3">Taxable income is gross salary minus the standard deduction, special deductions, social insurance, housing fund, and modeled resident deductions. City-specific bases, local housing fund caps, employer plan eligibility, and foreigner treaty rules are not modeled.</p>
    </div>
  );
}

function CNTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="mb-4 text-xl font-semibold text-zinc-200">
        How China Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <CNTaxInfoContent />
      </div>
    </section>
  );
}
