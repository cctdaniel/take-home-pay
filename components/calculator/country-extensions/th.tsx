"use client";

import { THAdditionalReliefs } from "@/components/calculator/th-additional-reliefs";
import { THContributionOptions } from "@/components/calculator/th-contribution-options";
import { THTaxOptions } from "@/components/calculator/th-tax-options";
import {
  CountryCalculatorExtensionShell,
  useCountryCalculatorExtension,
  type CountryCalculatorExtensionProps,
} from "@/components/calculator/country-extension";
import { InfoPanel } from "@/components/calculator/info-panel";
import { Separator } from "@/components/ui/separator";
import { THCalculator } from "@/lib/countries/th";
import type { THCalculatorInputs } from "@/lib/countries/types";

function clampAmount(value: number, max: number) {
  return Math.min(Math.max(0, value), Math.max(0, max));
}

function getThaiLimits(inputs: THCalculatorInputs) {
  const limits = THCalculator.getContributionLimits(inputs);

  return {
    providentFund: limits.providentFundContribution?.limit ?? 0,
    rmf: limits.rmfContribution?.limit ?? 0,
    ssf: limits.ssfContribution?.limit ?? 0,
    esg: limits.esgContribution?.limit ?? 0,
    nsf: limits.nationalSavingsFundContribution?.limit ?? 0,
  };
}

function clampThaiContributions(
  contributions: THCalculatorInputs["contributions"],
  limits: ReturnType<typeof getThaiLimits>,
) {
  return {
    providentFundContribution: clampAmount(
      contributions.providentFundContribution,
      limits.providentFund,
    ),
    rmfContribution: clampAmount(contributions.rmfContribution, limits.rmf),
    ssfContribution: clampAmount(contributions.ssfContribution, limits.ssf),
    esgContribution: clampAmount(contributions.esgContribution, limits.esg),
    nationalSavingsFundContribution: clampAmount(
      contributions.nationalSavingsFundContribution,
      limits.nsf,
    ),
  };
}

export default function THCountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const {
    inputs,
    currency,
    result,
    setPayFrequency,
    setInputs,
  } = useCountryCalculatorExtension<THCalculatorInputs>(country);
  const limits = getThaiLimits(inputs);

  const setGrossSalary = (grossSalary: number) => {
    setInputs((current) => {
      const nextInputs = { ...current, grossSalary };
      const nextLimits = getThaiLimits(nextInputs);
      const nextContributions = clampThaiContributions(
        current.contributions,
        nextLimits,
      );

      return {
        ...nextInputs,
        contributions: nextContributions,
        taxReliefs: {
          ...current.taxReliefs,
          ...nextContributions,
        },
      };
    });
  };

  const updateContribution = (
    key: keyof THCalculatorInputs["contributions"],
    value: number,
    limit: number,
  ) => {
    const nextAmount = clampAmount(value, limit);
    setInputs((current) => ({
      ...current,
      contributions: {
        ...current.contributions,
        [key]: nextAmount,
      },
      taxReliefs: {
        ...current.taxReliefs,
        [key]: nextAmount,
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
        <THTaxOptions
          residencyType={inputs.residencyType}
          onResidencyTypeChange={(residencyType) =>
            setInputs((current) => ({ ...current, residencyType }))
          }
          payFrequency={inputs.payFrequency}
          onPayFrequencyChange={setPayFrequency}
        />
      }
      contributions={
        <div className="space-y-6">
          <THContributionOptions
            providentFund={Math.min(
              inputs.contributions.providentFundContribution,
              limits.providentFund,
            )}
            onProvidentFundChange={(providentFundContribution) =>
              updateContribution(
                "providentFundContribution",
                providentFundContribution,
                limits.providentFund,
              )
            }
            providentFundLimit={limits.providentFund}
            rmf={Math.min(inputs.contributions.rmfContribution, limits.rmf)}
            onRmfChange={(rmfContribution) =>
              updateContribution("rmfContribution", rmfContribution, limits.rmf)
            }
            rmfLimit={limits.rmf}
            ssf={Math.min(inputs.contributions.ssfContribution, limits.ssf)}
            onSsfChange={(ssfContribution) =>
              updateContribution("ssfContribution", ssfContribution, limits.ssf)
            }
            ssfLimit={limits.ssf}
            esg={Math.min(inputs.contributions.esgContribution, limits.esg)}
            onEsgChange={(esgContribution) =>
              updateContribution("esgContribution", esgContribution, limits.esg)
            }
            esgLimit={limits.esg}
            nsf={Math.min(
              inputs.contributions.nationalSavingsFundContribution,
              limits.nsf,
            )}
            onNsfChange={(nationalSavingsFundContribution) =>
              updateContribution(
                "nationalSavingsFundContribution",
                nationalSavingsFundContribution,
                limits.nsf,
              )
            }
            nsfLimit={limits.nsf}
          />

          <Separator />

          <THAdditionalReliefs
            reliefs={inputs.taxReliefs}
            onChange={(taxReliefs) =>
              setInputs((current) => ({
                ...current,
                taxReliefs: {
                  ...taxReliefs,
                  ...current.contributions,
                },
              }))
            }
          />
        </div>
      }
      contributionsTitle="Thailand Allowances and Fund Contributions"
      contributionsDescription="Provident fund, RMF, SSF, Thai ESG, NSF, insurance, family, and donation reliefs"
      seoInfo={<THTaxInfo />}
      infoCard={
        <InfoPanel title="Thailand Payroll Scope">
          <p>
            This models Thai employment income with resident or non-resident
            treatment, standard employment deduction, personal allowance, Social
            Security where selected, family allowances, insurance deductions,
            selected donations, and the main retirement or savings fund reliefs.
          </p>
          <p className="mt-2">
            For employment salary, both resident and non-resident scenarios use
            the Revenue Department progressive PIT table. Residency controls
            whether the salary entered is resident worldwide/remitted income or
            non-resident Thai-source salary. PVD, RMF, and SSF share the modeled
            retirement cap; employer plan matching, plan eligibility,
            self-employment contributions, and one-off government campaign
            deductions require separate taxpayer facts.
          </p>
        </InfoPanel>
      }
    />
  );
}

function THTaxInfoContent() {
  return (
    <div>
      <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">Thailand</h3>
      <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
        <li>
          <strong className="text-zinc-300">Personal Income Tax</strong> –
          Progressive rates from 0% to 35% (8 brackets)
        </li>
        <li>
          <strong className="text-zinc-300">Standard Deduction</strong> –
          50% of employment income, capped at ฿100,000
        </li>
        <li>
          <strong className="text-zinc-300">Personal Allowance</strong> –
          ฿60,000 per taxpayer
        </li>
        <li>
          <strong className="text-zinc-300">Social Security Fund</strong> –
          5% employee contribution (capped at ฿750/month)
        </li>
        <li>
          <strong className="text-zinc-300">Provident Fund (PVD)</strong> –
          Voluntary contribution up to 15% of income (max ฿500,000 deduction)
        </li>
        <li>
          <strong className="text-zinc-300">Retirement Mutual Fund (RMF)</strong> –
          Tax deductible up to 30% of income (max ฿500,000)
        </li>
        <li>
          <strong className="text-zinc-300">Super Savings Fund (SSF)</strong> –
          Tax deductible up to 30% of income (max ฿200,000)
        </li>
      </ul>

      <h4 className="text-md font-medium text-zinc-300 mt-4 mb-2">
        Tax Brackets 2026
      </h4>
      <ul className="text-zinc-400 space-y-1 mt-2 list-disc list-inside text-sm">
        <li>฿0 – ฿150,000: 0% (exempt)</li>
        <li>฿150,001 – ฿300,000: 5%</li>
        <li>฿300,001 – ฿500,000: 10%</li>
        <li>฿500,001 – ฿750,000: 15%</li>
        <li>฿750,001 – ฿1,000,000: 20%</li>
        <li>฿1,000,001 – ฿2,000,000: 25%</li>
        <li>฿2,000,001 – ฿5,000,000: 30%</li>
        <li>฿5,000,001+: 35%</li>
      </ul>

      <h4 className="text-md font-medium text-zinc-300 mt-4 mb-2">
        Personal Allowances & Deductions
      </h4>
      <ul className="text-zinc-400 space-y-1 mt-2 list-disc list-inside text-sm">
        <li>Personal allowance: ฿60,000</li>
        <li>Spouse allowance: ฿60,000 (if no income)</li>
        <li>Child allowance: ฿30,000 per child (฿60,000 if born 2018+)</li>
        <li>Parent allowance: ฿30,000 per parent (age 60+, income ≤฿30,000)</li>
        <li>Disabled person: ฿60,000 per person</li>
        <li>Life insurance: Up to ฿100,000 (10+ year policy)</li>
        <li>Health insurance (self): Up to ฿25,000</li>
        <li>Health insurance (parents): Up to ฿15,000</li>
        <li>Home mortgage interest: Up to ฿100,000</li>
        <li>Donations: Up to 10% of net income</li>
        <li>Elderly/disabled taxpayer: ฿190,000 exemption</li>
      </ul>

      <h4 className="text-md font-medium text-zinc-300 mt-4 mb-2">
        Retirement Savings (Combined ฿500,000 Limit)
      </h4>
      <ul className="text-zinc-400 space-y-1 mt-2 list-disc list-inside text-sm">
        <li>Provident Fund (PVD): Up to 15% of income</li>
        <li>Retirement Mutual Fund (RMF): Up to 30% of income</li>
        <li>Super Savings Fund (SSF): Up to 30% of income</li>
        <li>Pension life insurance: Up to 15% of income (max ฿200,000)</li>
      </ul>

      <h4 className="text-md font-medium text-zinc-300 mt-4 mb-2">
        Thai ESG Fund (2024-2026 Special Period)
      </h4>
      <ul className="text-zinc-400 space-y-1 mt-2 list-disc list-inside text-sm">
        <li>Tax deductible up to 30% of income (max ฿300,000)</li>
        <li>Must hold units for at least 5 years (normally 8 years)</li>
        <li>Supports environmental, social, and governance investments</li>
      </ul>

      <h4 className="text-md font-medium text-zinc-300 mt-4 mb-2">
        Non-Residents
      </h4>
      <p className="text-zinc-400 text-sm">
        Non-residents are subject to Thai personal income tax only on
        Thai-sourced income. This salary calculator applies the same progressive
        employment-income scale to the Thai-source salary entered here; the 15%
        rule is not used for ordinary Section 40(1) employment salary.
      </p>

      <h4 className="text-md font-medium text-zinc-300 mt-4 mb-2">
        Sources
      </h4>
      <ul className="text-zinc-400 space-y-1 mt-2 list-disc list-inside text-sm">
        <li>
          Revenue Department PIT overview, including residency, salary
          deductions, allowances, and progressive rates
        </li>
        <li>
          Revenue Department P.N.D.90 guide for the latest detailed English
          allowance mechanics currently available
        </li>
        <li>
          Revenue Department 2025 e-form index, last updated May 5, 2026
        </li>
      </ul>

      <h4 className="text-md font-medium text-zinc-300 mt-4 mb-2">
        Employer Contributions
      </h4>
      <p className="text-zinc-400 text-sm">
        Employers match the employee&apos;s Social Security contribution (5% up to ฿750/month).
        For Provident Fund, employers typically match employee contributions (2-15%).
        These employer contributions are not deducted from your salary but are shown for reference.
      </p>

      <h4 className="text-md font-medium text-zinc-300 mt-4 mb-2">
        Tax Filing
      </h4>
      <p className="text-zinc-400 text-sm">
        The tax year in Thailand follows the calendar year (January 1 – December 31).
        Tax returns must be filed by March 31 of the following year. Employers 
        are required to withhold tax from salaries and remit it to the Revenue Department monthly.
      </p>
    </div>
  );
}

function THTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="mb-4 text-xl font-semibold text-zinc-200">
        How Thailand Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <THTaxInfoContent />
      </div>
    </section>
  );
}
