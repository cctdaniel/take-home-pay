"use client";

import { NLTaxOptions } from "@/components/calculator/nl-tax-options";
import {
  CountryCalculatorExtensionShell,
  useCountryCalculatorExtension,
  type CountryCalculatorExtensionProps,
} from "@/components/calculator/country-extension";
import { InfoPanel } from "@/components/calculator/info-panel";
import { ContributionSlider } from "@/components/ui/contribution-slider";
import { getCountryCalculator } from "@/lib/countries/registry";
import {
  NL_LIJFRENTE_2026,
  NL_THIRTY_PERCENT_RULING_2026,
} from "@/lib/countries/nl/constants/tax-brackets-2026";
import {
  GENERAL_TAX_CREDIT,
  IACK,
  LABOR_TAX_CREDIT,
} from "@/lib/countries/nl/constants/tax-credits-2026";
import type {
  NLCalculatorInputs,
  NLContributionInputs,
} from "@/lib/countries/types";
import { clampAmount } from "@/lib/utils";

export default function NLCountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const {
    inputs,
    currency,
    result,
    setGrossSalary,
    setPayFrequency,
    setInputs,
  } = useCountryCalculatorExtension<NLCalculatorInputs>(country);
  const contributionLimits =
    getCountryCalculator(country).getContributionLimits(inputs);
  const lijfrenteLimit =
    contributionLimits.lijfrenteContribution?.limit ?? 0;

  const setContribution = (
    key: keyof NLContributionInputs,
    amount: number,
  ) => {
    const limit = contributionLimits[key]?.limit ?? 0;

    setInputs((current) => ({
      ...current,
      contributions: {
        ...current.contributions,
        [key]: clampAmount(amount, limit),
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
        <NLTaxOptions
          currency={currency}
          payFrequency={inputs.payFrequency}
          onPayFrequencyChange={setPayFrequency}
          employeePensionPremiumAnnual={
            inputs.employeePensionPremiumAnnual ?? 0
          }
          onEmployeePensionPremiumAnnualChange={(
            employeePensionPremiumAnnual,
          ) =>
            setInputs((current) => ({
              ...current,
              employeePensionPremiumAnnual: Math.min(
                Math.max(0, employeePensionPremiumAnnual),
                Math.max(0, current.grossSalary),
              ),
            }))
          }
          pensionAccrualFactorA={inputs.pensionAccrualFactorA}
          onPensionAccrualFactorAChange={(pensionAccrualFactorA) =>
            setInputs((current) => ({
              ...current,
              pensionAccrualFactorA: Math.max(0, pensionAccrualFactorA),
            }))
          }
          unusedAnnuityReserveMargin={inputs.unusedAnnuityReserveMargin}
          onUnusedAnnuityReserveMarginChange={(unusedAnnuityReserveMargin) =>
            setInputs((current) => ({
              ...current,
              unusedAnnuityReserveMargin: clampAmount(
                unusedAnnuityReserveMargin,
                NL_LIJFRENTE_2026.maxReserveMargin,
              ),
            }))
          }
          maxUnusedAnnuityReserveMargin={NL_LIJFRENTE_2026.maxReserveMargin}
          hasThirtyPercentRuling={inputs.hasThirtyPercentRuling}
          onThirtyPercentRulingChange={(hasThirtyPercentRuling) =>
            setInputs((current) => ({ ...current, hasThirtyPercentRuling }))
          }
          thirtyPercentRulingType={inputs.thirtyPercentRulingType}
          onThirtyPercentRulingTypeChange={(thirtyPercentRulingType) =>
            setInputs((current) => ({
              ...current,
              hasThirtyPercentRuling: thirtyPercentRulingType !== "none",
              thirtyPercentRulingType,
            }))
          }
          hasYoungChildren={inputs.hasYoungChildren}
          onYoungChildrenChange={(hasYoungChildren) =>
            setInputs((current) => ({ ...current, hasYoungChildren }))
          }
          iackEligibility={inputs.iackEligibility}
          onIackEligibilityChange={(iackEligibility) =>
            setInputs((current) => ({
              ...current,
              hasYoungChildren: iackEligibility !== "none",
              iackEligibility,
            }))
          }
        />
      }
      contributions={
        lijfrenteLimit > 0 ? (
          <ContributionSlider
            label={contributionLimits.lijfrenteContribution.name}
            value={Math.min(
              inputs.contributions.lijfrenteContribution ?? 0,
              lijfrenteLimit,
            )}
            onChange={(amount) =>
              setContribution("lijfrenteContribution", amount)
            }
            max={lijfrenteLimit}
            step={100}
            currency={currency}
            description={contributionLimits.lijfrenteContribution.description}
          />
        ) : undefined
      }
      contributionsTitle="Netherlands Retirement Tax Inputs"
      contributionsDescription="Self-paid lijfrente or pension-account deposits within jaarruimte and reserveringsruimte"
      seoInfo={<NetherlandsTaxInfo />}
      infoCard={
        <InfoPanel title="Netherlands Payroll Scope">
          <p>
            This models Dutch box 1 employment salary with income tax,
            national-insurance tax, general tax credit, labour tax credit, IACK
            where selected, employee pension premiums withheld through payroll,
            self-paid lijfrente deposits within the modeled annual room, and
            the 30% ruling with its 2026 salary-norm caps.
          </p>
          <p className="mt-2">
            Mortgage interest, box 2/3 income, payroll withholding timing, and
            partner-specific credits depend on facts not collected here. The
            lijfrente annual margin uses the salary shown here as a proxy for
            prior-year income; enter Factor A and reserveringsruimte to refine
            the cap.
          </p>
        </InfoPanel>
      }
    />
  );
}

function NetherlandsTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="mb-4 text-xl font-semibold text-zinc-200">
        How Netherlands Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <ul className="mt-3 list-inside list-disc space-y-1 text-zinc-400">
          <li>
            <strong className="text-zinc-300">Box 1 Payroll Tax</strong> uses
            the 2026 wage-tax and national-insurance bands for employees below
            AOW age.
          </li>
          <li>
            <strong className="text-zinc-300">Employee Pension Premium</strong>{" "}
            is a plan-specific payroll withholding amount. It reduces the wage
            tax base and take-home cash when entered.
          </li>
          <li>
            <strong className="text-zinc-300">Lijfrente Deduction</strong>{" "}
            uses the 2026 annual-margin rate of{" "}
            {(NL_LIJFRENTE_2026.annualMarginRate * 100).toFixed(0)}%, the EUR{" "}
            {NL_LIJFRENTE_2026.aowFranchise.toLocaleString()} AOW franchise,
            the EUR {NL_LIJFRENTE_2026.incomeCap.toLocaleString()} income cap,
            Factor A at {NL_LIJFRENTE_2026.factorAMultiplier.toFixed(2)}x, and
            the EUR {NL_LIJFRENTE_2026.maxReserveMargin.toLocaleString()} 2026
            reserveringsruimte cap.
          </li>
          <li>
            <strong className="text-zinc-300">30% Ruling</strong> is capped by
            the 30% rate, the EUR{" "}
            {NL_THIRTY_PERCENT_RULING_2026.maxTaxFreeAllowance.toLocaleString()}{" "}
            annual maximum, and the selected expertise salary norm: EUR{" "}
            {NL_THIRTY_PERCENT_RULING_2026.standardSalaryNorm.toLocaleString()}{" "}
            standard or EUR{" "}
            {NL_THIRTY_PERCENT_RULING_2026.under30MastersSalaryNorm.toLocaleString()}{" "}
            for the under-30 master&apos;s track.
          </li>
          <li>
            <strong className="text-zinc-300">Tax Credits</strong> apply the
            general tax credit up to EUR{" "}
            {GENERAL_TAX_CREDIT.maxCredit.toLocaleString()}, labour tax credit
            up to EUR {LABOR_TAX_CREDIT.tier4Base.toLocaleString()}, and IACK
            up to EUR {IACK.maxCredit.toLocaleString()} when the child and
            fiscal-partner conditions are selected.
          </li>
        </ul>
      </div>
    </section>
  );
}
