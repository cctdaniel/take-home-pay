"use client";

import { TWAdditionalDeductions } from "@/components/calculator/tw-additional-deductions";
import { TWTaxOptions } from "@/components/calculator/tw-tax-options";
import {
  CountryCalculatorExtensionShell,
  useCountryCalculatorExtension,
  type CountryCalculatorExtensionProps,
} from "@/components/calculator/country-extension";
import { InfoPanel } from "@/components/calculator/info-panel";
import { Separator } from "@/components/ui/separator";
import { ContributionSlider } from "@/components/ui/contribution-slider";
import { TWCalculator } from "@/lib/countries/tw";
import type { TWCalculatorInputs } from "@/lib/countries/types";
import { clampAmount } from "@/lib/utils";

export default function TWCountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const {
    inputs,
    currency,
    result,
    setGrossSalary,
    setPayFrequency,
    setInputs,
  } = useCountryCalculatorExtension<TWCalculatorInputs>(country);
  const contributionLimits = TWCalculator.getContributionLimits(inputs);
  const voluntaryPensionLimit =
    contributionLimits.voluntaryPensionContribution?.limit ?? 0;
  const isResident = inputs.taxResidency === "resident";

  return (
    <CountryCalculatorExtensionShell
      country={country}
      currency={currency}
      grossSalary={inputs.grossSalary}
      onGrossSalaryChange={setGrossSalary}
      result={result}
      taxOptions={
        <TWTaxOptions
          taxResidency={inputs.taxResidency}
          onTaxResidencyChange={(taxResidency) =>
            setInputs((current) => {
              const nextLimits = TWCalculator.getContributionLimits({
                ...current,
                taxResidency,
              });

              return {
                ...current,
                taxResidency,
                contributions: {
                  voluntaryPensionContribution: clampAmount(
                    current.contributions.voluntaryPensionContribution,
                    nextLimits.voluntaryPensionContribution?.limit ?? 0,
                  ),
                },
                taxReliefs: {
                  ...current.taxReliefs,
                  isGoldCardHolder:
                    taxResidency === "resident"
                      ? current.taxReliefs.isGoldCardHolder
                      : false,
                },
              };
            })
          }
          isMarried={inputs.taxReliefs.isMarried}
          onMarriedChange={(isMarried) =>
            setInputs((current) => ({
              ...current,
              taxReliefs: { ...current.taxReliefs, isMarried },
            }))
          }
          isGoldCardHolder={inputs.taxReliefs.isGoldCardHolder}
          onGoldCardChange={(isGoldCardHolder) =>
            setInputs((current) => ({
              ...current,
              taxReliefs: {
                ...current.taxReliefs,
                isGoldCardHolder:
                  current.taxResidency === "resident"
                    ? isGoldCardHolder
                    : false,
              },
            }))
          }
          payFrequency={inputs.payFrequency}
          onPayFrequencyChange={setPayFrequency}
        />
      }
      contributions={
        isResident ? (
          <div className="space-y-6">
            <ContributionSlider
              label="Voluntary Labor Pension Contribution"
              description="Employee voluntary labor-pension contributions are deductible up to 6% of monthly salary, capped at the modeled NT$150,000 monthly wage base."
              value={Math.min(
                inputs.contributions.voluntaryPensionContribution,
                voluntaryPensionLimit,
              )}
              onChange={(voluntaryPensionContribution) =>
                setInputs((current) => ({
                  ...current,
                  contributions: {
                    ...current.contributions,
                    voluntaryPensionContribution: clampAmount(
                      voluntaryPensionContribution,
                      voluntaryPensionLimit,
                    ),
                  },
                }))
              }
              max={voluntaryPensionLimit}
              currency={currency}
              step={1000}
            />
            <p className="rounded bg-zinc-800/50 p-2 text-xs text-zinc-500">
              Employer labor-pension contributions are mandatory and are not
              deducted from employee take-home pay. This slider models only the
              employee-controlled voluntary amount.
            </p>

            <Separator />

            <TWAdditionalDeductions
              reliefs={inputs.taxReliefs}
              grossSalary={inputs.grossSalary}
              onChange={(taxReliefs) =>
                setInputs((current) => ({ ...current, taxReliefs }))
              }
            />
          </div>
        ) : (
          <InfoPanel title="Non-Resident Taiwan Salary Tax">
            Taiwan non-resident salary income is modeled at 18% of gross salary.
            Resident exemptions, standard or itemized deductions, special
            deductions, voluntary labor-pension deduction, and Gold Card
            resident tax incentives are not applied.
          </InfoPanel>
        )
      }
      contributionsTitle="Resident Contributions and Deductions"
      contributionsDescription="Voluntary labor pension, exemptions, resident special deductions, and itemized deduction inputs"
      seoInfo={<TWTaxInfo />}
      infoCard={
        <InfoPanel title="Taiwan Payroll Scope">
          <p>
            This models Taiwan employment salary with comprehensive income tax,
            resident and non-resident salary tax treatment, standard or
            itemized deductions, special deductions, labor insurance,
            employment insurance, NHI, voluntary labor-pension contribution,
            and the Employment Gold Card salary exemption where selected.
          </p>
          <p className="mt-2">
            Overseas-income AMT treatment, spouse separate-tax calculations,
            employer-only pension funding, and documentary eligibility for each
            deduction require return-specific facts beyond this salary model.
          </p>
        </InfoPanel>
      }
    />
  );
}

function TWTaxInfoContent() {
  return (
    <div>
      <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">Taiwan</h3>
      <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
        <li>
          <strong className="text-zinc-300">Comprehensive Income Tax</strong> –
          Residents use progressive rates from 5% to 40%; non-resident salary
          income is modeled at 18%
        </li>
        <li>
          <strong className="text-zinc-300">Standard Deduction</strong> –
          NT$136,000 for single filers, NT$272,000 for married couples (joint filing)
        </li>
        <li>
          <strong className="text-zinc-300">Personal Exemption</strong> –
          NT$101,000 per taxpayer, spouse, or general dependent; qualifying
          70+ lineal ascendants use the higher exemption
        </li>
        <li>
          <strong className="text-zinc-300">Salary Special Deduction</strong> –
          NT$227,000 for wage earners (automatic deduction for employment income)
        </li>
        <li>
          <strong className="text-zinc-300">Disability Deduction</strong> –
          Additional NT$227,000 per qualifying disabled taxpayer, spouse, or
          dependent
        </li>
        <li>
          <strong className="text-zinc-300">Resident Deductions</strong> –
          Standard vs itemized deductions, savings/investment, tuition,
          preschool child, long-term care, rent, and basic living expense
          difference are modeled where entered
        </li>
        <li>
          <strong className="text-zinc-300">Labor Insurance</strong> –
          2.3% employee contribution (11.5% × 20%), capped at NT$45,800/month
        </li>
        <li>
          <strong className="text-zinc-300">Employment Insurance</strong> –
          0.2% employee contribution (1% × 20%), capped at NT$45,800/month
        </li>
        <li>
          <strong className="text-zinc-300">National Health Insurance</strong> –
          1.551% employee contribution (5.17% × 30%), capped at NT$313,000/month
        </li>
        <li>
          <strong className="text-zinc-300">Labor Pension</strong> –
          Employer contributes 6% mandatorily; employee can voluntarily contribute 0-6% (tax deductible)
        </li>
        <li>
          <strong className="text-zinc-300">Employment Gold Card</strong> –
          50% tax exemption on income above NT$3M for first 5 years as tax resident (for qualified foreign professionals)
        </li>
      </ul>

      <h4 className="text-md font-medium text-zinc-300 mt-4 mb-2">
        Tax Brackets 2026 (Residents)
      </h4>
      <ul className="text-zinc-400 space-y-1 mt-2 list-disc list-inside text-sm">
        <li>NT$0 – NT$610,000: 5%</li>
        <li>NT$610,001 – NT$1,380,000: 12%</li>
        <li>NT$1,380,001 – NT$2,770,000: 20%</li>
        <li>NT$2,770,001 – NT$5,190,000: 30%</li>
        <li>NT$5,190,001+: 40%</li>
      </ul>

      <h4 className="text-md font-medium text-zinc-300 mt-4 mb-2">
        Understanding Your Deductions
      </h4>
      <p className="text-zinc-400 text-sm mb-2">
        Taiwan offers several deductions that reduce your taxable income before tax is calculated:
      </p>
      <ul className="text-zinc-400 space-y-1 mt-2 list-disc list-inside text-sm">
        <li>
          <strong className="text-zinc-300">Standard Deduction</strong> –
          A flat amount that all taxpayers can claim. Choose this or itemized deductions (whichever is higher).
          Single: NT$136,000 | Married: NT$272,000.
        </li>
        <li>
          <strong className="text-zinc-300">Personal Exemption</strong> –
          A basic allowance for each taxpayer to cover basic living expenses. Amount: NT$101,000 per person.
        </li>
        <li>
          <strong className="text-zinc-300">Salary Special Deduction</strong> –
          An automatic deduction for wage earners to account for work-related expenses. 
          You do not need to provide receipts. Amount: NT$227,000.
        </li>
        <li>
          <strong className="text-zinc-300">Disability Deduction</strong> –
          Additional allowance for taxpayers holding a disability certificate. Amount: NT$227,000.
        </li>
        <li>
          <strong className="text-zinc-300">Special Deductions</strong> –
          The calculator includes savings/investment income, college tuition,
          preschool children, long-term care, housing rent, and the basic living
          expense difference. Preschool, long-term care, and rent are gated by
          the modeled salary-only income tests.
        </li>
        <li>
          <strong className="text-zinc-300">Itemized Deductions</strong> –
          Charitable donations, insurance premiums, medical and maternity
          expenses, owner-occupied mortgage interest, and calamity losses can be
          entered and compared against the standard deduction.
        </li>
        <li>
          <strong className="text-zinc-300">Voluntary Pension Contribution</strong> –
          Amounts you voluntarily contribute to your Labor Pension Fund (up to 6% of salary) are fully tax deductible.
        </li>
      </ul>

      <h4 className="text-md font-medium text-zinc-300 mt-4 mb-2">
        Social Insurance Contributions (Employee Share)
      </h4>
      <ul className="text-zinc-400 space-y-1 mt-2 list-disc list-inside text-sm">
        <li>
          <strong className="text-zinc-300">Labor Insurance (勞工保險)</strong> –
          Total premium 11.5%, employee pays 20% (effective 2.3%). Covers maternity, injury, sickness, disability, and death benefits.
          Monthly cap: NT$45,800.
        </li>
        <li>
          <strong className="text-zinc-300">Employment Insurance (就業保險)</strong> –
          Total premium 1%, employee pays 20% (effective 0.2%). Provides unemployment benefits and job training.
          Monthly cap: NT$45,800.
        </li>
        <li>
          <strong className="text-zinc-300">National Health Insurance (全民健康保險)</strong> –
          Total premium 5.17%, employee pays 30% (effective 1.551%). Provides universal healthcare coverage.
          Monthly cap: NT$313,000.
        </li>
      </ul>

      <h4 className="text-md font-medium text-zinc-300 mt-4 mb-2">
        Labor Pension (勞工退休金)
      </h4>
      <p className="text-zinc-400 text-sm mb-2">
        Taiwan operates a New Labor Pension System where employers must contribute at least 6% of your monthly 
        wages to an individual pension account. This is paid by the employer and not deducted from your salary.
      </p>
      <ul className="text-zinc-400 space-y-1 mt-2 list-disc list-inside text-sm">
        <li>
          <strong className="text-zinc-300">Employer Contribution</strong> –
          6% of monthly salary (mandatory, employer-paid, not deducted from take-home pay)
        </li>
        <li>
          <strong className="text-zinc-300">Employee Voluntary Contribution</strong> –
          You can choose to contribute an additional 0-6% of your salary, which is tax deductible.
          Monthly cap: NT$150,000 for contribution calculations.
        </li>
        <li>
          <strong className="text-zinc-300">Benefit</strong> –
          Upon retirement, you receive monthly payments or a lump sum based on your account balance.
        </li>
      </ul>

      <h4 className="text-md font-medium text-zinc-300 mt-4 mb-2">
        Employment Gold Card Special Tax Benefits
      </h4>
      <p className="text-zinc-400 text-sm mb-2">
        Foreign professionals holding an Employment Gold Card or Foreign Special Professional Work Permit 
        enjoy significant tax incentives under the Act for the Recruitment and Employment of Foreign Professionals.
        These benefits apply for the first 5 years as a tax resident in Taiwan.
      </p>
      <ul className="text-zinc-400 space-y-1 mt-2 list-disc list-inside text-sm">
        <li>
          <strong className="text-zinc-300">50% Exemption on Income Above NT$3 Million</strong> –
          Half of your salary income exceeding NT$3 million per year is excluded from taxable income.
          For example, with NT$5 million income: NT$3M + (50% × NT$2M) = NT$4M taxable (saving ~NT$200K in taxes).
        </li>
        <li>
          <strong className="text-zinc-300">Eligibility Requirements</strong> –
          1) First time approved to reside in Taiwan for work; 2) Reside &gt;183 days in the tax year;
          3) Earn &gt;NT$3 million in salary; 4) Hold Gold Card or Special Professional Work Permit.
        </li>
        <li>
          <strong className="text-zinc-300">5-Year Benefit Period</strong> –
          The tax benefit applies for 5 consecutive tax years starting from the first year you meet 
          all conditions (residency + income threshold). If you don&apos;t meet conditions in a year, 
          that year doesn&apos;t count toward the 5 years.
        </li>
        <li>
          <strong className="text-zinc-300">AMT Exemption</strong> –
          Overseas income is excluded from the Alternative Minimum Tax (AMT) calculation during the benefit period.
        </li>
        <li>
          <strong className="text-zinc-300">Non-Taxable Benefits</strong> –
          Additional benefits like housing allowance, utilities, and education expenses may be tax-free 
          for qualified foreign professionals.
        </li>
      </ul>

      <h4 className="text-md font-medium text-zinc-300 mt-4 mb-2">
        Tax Calculation Formula
      </h4>
      <p className="text-zinc-400 text-sm">
        Resident formula: Gross Salary − Gold Card exemption − Total
        Deductions & Exemptions = Taxable Income
        <br />
        Non-resident formula: Gross Salary × 18% salary tax
        <br />
        Taxable Income × Progressive Tax Rate = Income Tax
        <br />
        Income Tax + Social Insurance = Total Tax
        <br />
        Gross Salary − Total Tax − Pension Contributions = Net Salary
      </p>

      <h4 className="text-md font-medium text-zinc-300 mt-4 mb-2">
        Sources
      </h4>
      <p className="text-zinc-400 text-sm">
        Tax brackets and deductions are based on Ministry of Finance and eTax
        resident tables for the 2026 filing year, plus National Taxation Bureau
        guidance for Gold Card incentives and non-resident salary taxation.
        Social insurance rates come from Bureau of Labor Insurance and National
        Health Insurance Administration sources.
      </p>
    </div>
  );
}

function TWTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="mb-4 text-xl font-semibold text-zinc-200">
        How Taiwan Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <TWTaxInfoContent />
      </div>
    </section>
  );
}
