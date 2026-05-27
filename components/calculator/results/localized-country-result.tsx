import { Separator } from "@/components/ui/separator";
import {
  isStandardCountryBreakdown,
  isStandardCountryTaxBreakdown,
} from "@/lib/countries/shared/standard-country";
import { formatCurrency } from "@/lib/format";
import { DeductionRow } from "../deduction-row";
import type { CountryResultBreakdownProps } from "./types";

function getSourceHost(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "source";
  }
}

function getLocalizedSourceLabel(url: string, countryName: string) {
  if (url.includes("taxsummaries.pwc.com")) {
    return `PwC ${countryName} tax summary cross-check`;
  }

  return `${countryName} source: ${getSourceHost(url)}`;
}

export function LocalizedCountryResultBreakdown({
  result,
  grossSalary,
  currency,
  expectedCountry,
  countryName,
  taxableNonCashBenefitsLabel = "Taxable Non-Cash Benefits",
  taxableGrossIncomeLabel,
  taxableIncomeLabel = "Taxable Income",
  reliefSectionTitle,
  taxSectionTitle,
  assumptionsTitle,
  exclusionsTitle,
}: CountryResultBreakdownProps & {
  expectedCountry: string;
  countryName: string;
  taxableNonCashBenefitsLabel?: string;
  taxableGrossIncomeLabel?: string;
  taxableIncomeLabel?: string;
  reliefSectionTitle?: string;
  taxSectionTitle?: string;
  assumptionsTitle?: string;
  exclusionsTitle?: string;
}) {
  const { taxes, breakdown } = result;

  if (
    !isStandardCountryTaxBreakdown(taxes) ||
    !isStandardCountryBreakdown(breakdown) ||
    taxes.type !== expectedCountry ||
    breakdown.type !== expectedCountry
  ) {
    return null;
  }

  const appliedDeductions = breakdown.deductions.filter(
    (deduction) => deduction.amount > 0,
  );
  const visibleVoluntaryContributions =
    breakdown.voluntaryContributions.filter(
      (contribution) =>
        contribution.amount > 0 &&
        (contribution.cashFlowTreatment !== "taxOnly" ||
          contribution.taxTreatment === "deduction"),
    );
  const hasReliefs =
    breakdown.personalAllowance > 0 ||
    appliedDeductions.length > 0 ||
    visibleVoluntaryContributions.length > 0;

  return (
    <>
      {(breakdown.taxableNonCashBenefits ?? 0) > 0 ? (
        <>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-zinc-400">
              {taxableNonCashBenefitsLabel}
            </span>
            <span className="text-sm text-zinc-200 tabular-nums">
              +{formatCurrency(breakdown.taxableNonCashBenefits ?? 0, currency)}
            </span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-sm text-zinc-400">
              {taxableGrossIncomeLabel ??
                `${countryName} Tax / Contribution Gross Base`}
            </span>
            <span className="text-sm text-zinc-200 tabular-nums">
              {formatCurrency(
                breakdown.taxableGrossIncome ?? breakdown.grossIncome,
                currency,
              )}
            </span>
          </div>
        </>
      ) : null}
      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-zinc-400">{taxableIncomeLabel}</span>
        <span className="text-sm text-zinc-200 tabular-nums">
          {formatCurrency(result.taxableIncome, currency)}
        </span>
      </div>

      {hasReliefs ? (
        <>
          <Separator className="my-2" />
          <p className="pb-1 pt-2 text-xs text-zinc-500">
            {reliefSectionTitle ?? `${countryName} Allowances, Reliefs, And Deductions`}
          </p>
          {breakdown.personalAllowance > 0 ? (
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-zinc-400">
                {breakdown.personalAllowanceName ?? "Personal Allowance"}
              </span>
              <span className="text-sm text-emerald-400 tabular-nums">
                -{formatCurrency(breakdown.personalAllowance, currency)}
              </span>
            </div>
          ) : null}
          {appliedDeductions.map((deduction) => (
            <div
              className="flex items-center justify-between py-1"
              key={deduction.name}
            >
              <span className="text-sm text-zinc-400">{deduction.name}</span>
              <span className="text-sm text-emerald-400 tabular-nums">
                -{formatCurrency(deduction.amount, currency)}
              </span>
            </div>
          ))}
          {visibleVoluntaryContributions.map((contribution) => (
            <div
              className="flex items-center justify-between py-1"
              key={contribution.key}
            >
              <span className="text-sm text-zinc-400">
                {contribution.name}
              </span>
              <span className="text-sm text-emerald-400 tabular-nums">
                -{formatCurrency(contribution.amount, currency)}
              </span>
            </div>
          ))}
        </>
      ) : null}

      {breakdown.taxCredits.length > 0 ? (
        <>
          <Separator className="my-2" />
          <p className="pb-1 pt-2 text-xs text-zinc-500">
            {countryName} Tax Credits
          </p>
          {breakdown.taxCredits.map((credit) => (
            <div
              className="flex items-center justify-between py-1"
              key={credit.name}
            >
              <span className="text-sm text-zinc-400">{credit.name}</span>
              <span className="text-sm text-emerald-400 tabular-nums">
                -{formatCurrency(credit.amount, currency)}
              </span>
            </div>
          ))}
        </>
      ) : null}

      <Separator className="my-2" />
      <p className="pb-1 pt-2 text-xs text-zinc-500">
        {taxSectionTitle ?? `${countryName} Tax And Payroll Deductions`}
      </p>
      <DeductionRow
        label={breakdown.incomeTaxName}
        amount={taxes.incomeTax}
        grossSalary={grossSalary}
        currency={currency}
      />
      {breakdown.mandatoryContributions.map((contribution) => (
        <DeductionRow
          key={contribution.name}
          label={contribution.name}
          amount={contribution.amount}
          grossSalary={grossSalary}
          currency={currency}
        />
      ))}

      {breakdown.assumptions.length > 0 ? (
        <>
          <Separator className="my-2" />
          <div className="rounded-lg bg-zinc-800/50 p-3">
            <p className="mb-2 text-xs font-medium text-zinc-400">
              {assumptionsTitle ?? `${countryName} Salary Assumptions`}
            </p>
            <ul className="list-disc space-y-1 pl-4 text-xs text-zinc-500">
              {breakdown.assumptions.map((assumption) => (
                <li key={assumption}>{assumption}</li>
              ))}
            </ul>
          </div>
        </>
      ) : null}

      {breakdown.modeledExclusions.length > 0 ? (
        <>
          <Separator className="my-2" />
          <div className="rounded-lg bg-zinc-800/50 p-3">
            <p className="mb-2 text-xs font-medium text-zinc-400">
              {exclusionsTitle ??
                `${countryName} Items Requiring Separate Facts`}
            </p>
            <ul className="list-disc space-y-1 pl-4 text-xs text-zinc-500">
              {breakdown.modeledExclusions.map((exclusion) => (
                <li key={exclusion}>{exclusion}</li>
              ))}
            </ul>
          </div>
        </>
      ) : null}

      {breakdown.sourceUrls.length > 0 ? (
        <>
          <Separator className="my-2" />
          <div className="rounded-lg bg-zinc-800/50 p-3">
            <p className="mb-2 text-xs font-medium text-zinc-400">
              {countryName} Sources
            </p>
            <ul className="list-disc space-y-1 pl-4 text-xs text-zinc-500">
              {breakdown.sourceUrls.map((url) => (
                <li key={url}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-300 hover:text-emerald-200"
                  >
                    {getLocalizedSourceLabel(url, countryName)}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </>
      ) : null}
    </>
  );
}
