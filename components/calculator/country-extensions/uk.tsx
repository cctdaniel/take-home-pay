"use client";

import { UKTaxOptions } from "@/components/calculator/uk-tax-options";
import { CurrencyAmountField } from "@/components/calculator/calculator-fields";
import {
  CountryCalculatorExtensionShell,
  useCountryCalculatorExtension,
  type CountryCalculatorExtensionProps,
} from "@/components/calculator/country-extension";
import { InfoPanel } from "@/components/calculator/info-panel";
import { ContributionSlider } from "@/components/ui/contribution-slider";
import { UKCalculator } from "@/lib/countries/uk";
import type { UKCalculatorInputs } from "@/lib/countries/types";
import { formatCurrency } from "@/lib/format";
import { clampAmount, clampCount } from "@/lib/utils";

function getPensionLimit(inputs: UKCalculatorInputs) {
  const limit =
    UKCalculator.getContributionLimits(inputs).pensionContribution?.limit ?? 0;
  return Math.min(limit, inputs.grossSalary);
}

export default function UKCountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const {
    inputs,
    currency,
    result,
    setPayFrequency,
    setInputs,
  } = useCountryCalculatorExtension<UKCalculatorInputs>(country);
  const pensionLimit = getPensionLimit(inputs);

  const setGrossSalary = (grossSalary: number) => {
    setInputs((current) => {
      const nextInputs = { ...current, grossSalary };
      const nextLimit = getPensionLimit(nextInputs);

      return {
        ...nextInputs,
        contributions: {
          pensionContribution: clampAmount(
            current.contributions.pensionContribution,
            nextLimit,
          ),
        },
      };
    });
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
          <UKTaxOptions
            payFrequency={inputs.payFrequency}
            onPayFrequencyChange={setPayFrequency}
            residencyType={inputs.residencyType}
            onResidencyTypeChange={(residencyType) =>
              setInputs((current) => ({
                ...current,
                residencyType,
                marriageAllowance:
                  residencyType === "resident"
                    ? current.marriageAllowance
                    : "none",
              }))
            }
            region={inputs.region}
            onRegionChange={(region) =>
              setInputs((current) => ({ ...current, region }))
            }
            studentLoanPlan={inputs.studentLoanPlan}
            onStudentLoanPlanChange={(studentLoanPlan) =>
              setInputs((current) => ({ ...current, studentLoanPlan }))
            }
            hasPostgraduateLoan={inputs.hasPostgraduateLoan}
            onPostgraduateLoanChange={(hasPostgraduateLoan) =>
              setInputs((current) => ({ ...current, hasPostgraduateLoan }))
            }
            marriageAllowance={inputs.marriageAllowance}
            onMarriageAllowanceChange={(marriageAllowance) =>
              setInputs((current) => ({
                ...current,
                marriageAllowance:
                  current.residencyType === "resident"
                    ? marriageAllowance
                    : "none",
              }))
            }
          />
          <CurrencyAmountField
            id="uk-taxable-benefits-in-kind"
            label="Taxable Benefits in Kind"
            value={inputs.taxableBenefitsInKind ?? 0}
            onChange={(taxableBenefitsInKind) =>
              setInputs((current) => ({
                ...current,
                taxableBenefitsInKind: clampAmount(taxableBenefitsInKind, Infinity),
              }))
            }
            currency={currency}
            step={100}
            description="Annual HMRC cash-equivalent value of taxable company benefits; increases income tax but is not treated as cash salary or employee Class 1 NI."
          />
        </div>
      }
      contributions={
        <div className="space-y-6">
          <ContributionSlider
            label="Pension Contribution (Gross)"
            description="Gross amount going into your pension pot, capped at the annual allowance and gross salary."
            value={Math.min(
              inputs.contributions.pensionContribution,
              pensionLimit,
            )}
            onChange={(pensionContribution) =>
              setInputs((current) => ({
                ...current,
                contributions: {
                  pensionContribution: clampAmount(
                    pensionContribution,
                    pensionLimit,
                  ),
                },
              }))
            }
            max={pensionLimit}
            currency={currency}
          />
          {result.breakdown.type === "UK" &&
            result.breakdown.pensionNetCost > 0 && (
              <div className="space-y-2 rounded-lg bg-zinc-800/50 p-3">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Gross contribution:</span>
                  <span className="text-zinc-200">
                    {formatCurrency(
                      result.breakdown.pensionContribution,
                      currency,
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-emerald-400">Tax relief:</span>
                  <span className="text-emerald-400">
                    -
                    {formatCurrency(
                      result.breakdown.pensionTaxRelief,
                      currency,
                    )}
                  </span>
                </div>
                <div className="flex justify-between border-t border-zinc-700 pt-2 text-sm">
                  <span className="text-zinc-300">Your actual cost:</span>
                  <span className="font-medium text-zinc-100">
                    {formatCurrency(result.breakdown.pensionNetCost, currency)}
                  </span>
                </div>
              </div>
            )}
          <p className="rounded bg-zinc-800/50 p-2 text-xs text-zinc-500">
            Relief-at-source is modeled: basic-rate relief is added to the
            pension and higher-rate relief reduces the effective cost. NI is
            still calculated on gross salary.
          </p>
        </div>
      }
      contributionsTitle="UK Pension Relief Inputs"
      contributionsDescription="Relief-at-source pension contributions with basic and higher-rate tax relief"
      seoInfo={<UKTaxInfo />}
      infoCard={
        <InfoPanel title="United Kingdom Payroll Scope">
          <p>
            This models UK employment salary with resident or non-resident
            Personal Allowance treatment, England/Wales/Northern Ireland or
            Scottish income-tax bands, taxable benefits in kind, Class 1
            employee National Insurance, and selected pension contribution
            relief.
          </p>
          <p className="mt-2">
            Student loan Plan 1, 2, 4, 5 and postgraduate loan repayments use
            the 2026/27 HMRC employer thresholds. Marriage Allowance is modeled
            as either a tax reducer when received or a personal-allowance
            reduction when transferred to a spouse or civil partner.
          </p>
          <p className="mt-2">
            Enter taxable benefits in kind after the employer has worked out
            the HMRC cash-equivalent value. Salary sacrifice plan mechanics, tax
            code underpayments, benefit valuation worksheets, cash-voucher
            National Insurance treatment, Scottish non-savings edge cases beyond
            the published bands, and annual allowance tapering require
            additional payroll, plan, or tax-code facts before they can be
            modeled accurately.
          </p>
        </InfoPanel>
      }
    />
  );
}

function UKTaxInfoContent() {
  return (
    <div>
      <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">United Kingdom</h3>
      <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
        <li>
          <strong className="text-zinc-300">Income Tax</strong> –
          Progressive rates with Personal Allowance and tapered relief
        </li>
        <li>
          <strong className="text-zinc-300">Personal Allowance</strong> –
          £12,570 tax-free (tapered above £100,000, zero at £125,140)
        </li>
        <li>
          <strong className="text-zinc-300">Class 1 National Insurance</strong> –
          8% on earnings between £12,570 and £50,270, 2% above
        </li>
        <li>
          <strong className="text-zinc-300">Scottish Rates</strong> –
          Different tax bands for Scottish residents (6 rates from 19% to 48%)
        </li>
        <li>
          <strong className="text-zinc-300">Pension Tax Relief</strong> –
          20% basic rate automatically, higher/additional rates claimable
        </li>
        <li>
          <strong className="text-zinc-300">Student Loans</strong> –
          Plan 1, 2, 4, 5 and postgraduate loan deductions use HMRC 2026/27
          employer thresholds
        </li>
        <li>
          <strong className="text-zinc-300">Marriage Allowance</strong> –
          eligible transfers can reduce the recipient&apos;s tax or reduce the
          transferor&apos;s Personal Allowance
        </li>
      </ul>

      <h4 className="text-md font-medium text-zinc-300 mt-4 mb-2">
        Tax Bands 2026/27 — England, Wales &amp; Northern Ireland
      </h4>
      <ul className="text-zinc-400 space-y-1 mt-2 list-disc list-inside text-sm">
        <li>Personal Allowance: Up to £12,570 — 0%</li>
        <li>Basic Rate: £12,571 to £50,270 — 20%</li>
        <li>Higher Rate: £50,271 to £125,140 — 40%</li>
        <li>Additional Rate: Over £125,140 — 45%</li>
      </ul>

      <h4 className="text-md font-medium text-zinc-300 mt-4 mb-2">
        Tax Bands 2026/27 — Scotland
      </h4>
      <ul className="text-zinc-400 space-y-1 mt-2 list-disc list-inside text-sm">
        <li>Personal Allowance: Up to £12,570 — 0%</li>
        <li>Starter Rate: £12,571 to £16,537 — 19%</li>
        <li>Basic Rate: £16,538 to £29,526 — 20%</li>
        <li>Intermediate Rate: £29,527 to £43,662 — 21%</li>
        <li>Higher Rate: £43,663 to £75,000 — 42%</li>
        <li>Advanced Rate: £75,001 to £125,140 — 45%</li>
        <li>Top Rate: Over £125,140 — 48%</li>
      </ul>

      <h4 className="text-md font-medium text-zinc-300 mt-4 mb-2">
        National Insurance (Employee) 2026/27
      </h4>
      <ul className="text-zinc-400 space-y-1 mt-2 list-disc list-inside text-sm">
        <li>Below £12,570 (Primary Threshold): 0%</li>
        <li>£12,570 to £50,270 (Upper Earnings Limit): 8%</li>
        <li>Above £50,270: 2%</li>
      </ul>
      <p className="text-zinc-400 text-sm mt-2">
        National Insurance is calculated on gross earnings before tax. The Lower Earnings Limit (£6,708) 
        determines benefit entitlement but no contributions are due below the Primary Threshold.
      </p>

      <h4 className="text-md font-medium text-zinc-300 mt-4 mb-2">
        Personal Allowance Taper
      </h4>
      <p className="text-zinc-400 text-sm mb-2">
        For high earners, the Personal Allowance is reduced by £1 for every £2 of income above £100,000:
      </p>
      <ul className="text-zinc-400 space-y-1 mt-2 list-disc list-inside text-sm">
        <li>Income £100,000 or below: Full £12,570 allowance</li>
        <li>Income £100,001 to £125,140: Reduced allowance</li>
        <li>Income £125,140 or above: No Personal Allowance</li>
      </ul>
      <p className="text-zinc-400 text-sm mt-2">
        This creates an effective 60% tax rate on income between £100,000 and £125,140.
      </p>

      <h4 className="text-md font-medium text-zinc-300 mt-4 mb-2">
        Pension Contributions &amp; Tax Relief
      </h4>
      <ul className="text-zinc-400 space-y-1 mt-2 list-disc list-inside text-sm">
        <li>Basic rate (20%) tax relief applied automatically by pension provider</li>
        <li>Higher rate (40%) taxpayers can claim additional 20% through tax return</li>
        <li>Additional rate (45%) taxpayers can claim additional 25% through tax return</li>
        <li>Annual allowance: £60,000 (may be tapered for high earners)</li>
      </ul>

      <h4 className="text-md font-medium text-zinc-300 mt-4 mb-2">
        Student and Postgraduate Loans 2026/27
      </h4>
      <ul className="text-zinc-400 space-y-1 mt-2 list-disc list-inside text-sm">
        <li>Plan 1: 9% above £26,900</li>
        <li>Plan 2: 9% above £29,385</li>
        <li>Plan 4: 9% above £33,795</li>
        <li>Plan 5: 9% above £25,000</li>
        <li>Postgraduate loan: 6% above £21,000</li>
      </ul>

      <h4 className="text-md font-medium text-zinc-300 mt-4 mb-2">
        Tax Year
      </h4>
      <p className="text-zinc-400 text-sm">
        The UK tax year runs from 6 April to 5 April the following year. This calculator uses 
        the 2026/27 tax year rates (6 April 2026 to 5 April 2027).
      </p>

      <h4 className="text-md font-medium text-zinc-300 mt-4 mb-2">
        Sources
      </h4>
      <p className="text-zinc-400 text-sm">
        Tax rates and thresholds from HMRC (HM Revenue &amp; Customs) Rates and Thresholds for 
        Employers 2026 to 2027. Available at: gov.uk/guidance/rates-and-thresholds-for-employers-2026-to-2027
      </p>
    </div>
  );
}

function UKTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="mb-4 text-xl font-semibold text-zinc-200">
        How United Kingdom Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <UKTaxInfoContent />
      </div>
    </section>
  );
}
