import { Separator } from "@/components/ui/separator";
import { isOMBreakdown, isOMTaxBreakdown } from "@/lib/countries/om/types";
import { formatCurrency, formatPercentage } from "@/lib/format";
import { DeductionRow } from "../deduction-row";
import type { CountryResultBreakdownProps } from "./types";

const OM_WORKER_TYPE_LABELS = {
  expatriate: "Expatriate employee",
  omani: "Omani employee",
} as const;

function getOmanSourceLabel(url: string) {
  if (url.includes("issuance-of-personal-income-tax-pit-law")) {
    return "Oman Tax Authority PIT law issuance";
  }

  if (url.includes("personal-income-tax-law-and-regulation")) {
    return "Oman Tax Authority PIT law and regulation";
  }

  if (url.includes("personal-income-tax")) {
    return "Oman Tax Authority personal income tax";
  }

  if (url.includes("contribution-rates")) {
    return "Oman SPF contribution rates FAQ";
  }

  if (url.includes("non-omani-workers")) {
    return "Oman SPF non-Omani coverage FAQ";
  }

  if (url.includes("spf.gov.om/en/faq")) {
    return "Oman Social Protection Fund FAQ";
  }

  if (url.includes("provident-scheme")) {
    return "Oman SPF provident scheme";
  }

  if (url.includes("extension-insurance-protection")) {
    return "Oman SPF GCC extension insurance protection";
  }

  if (url.includes("Social-Protaction-Law")) {
    return "Oman Social Protection Law";
  }

  if (url.includes("ExecutiveRegulation")) {
    return "Oman Social Protection Law Executive Regulation";
  }

  if (url.includes("/other-taxes")) {
    return "PwC Oman other taxes cross-check";
  }

  return "PwC Oman personal income tax cross-check";
}

export function OMResultBreakdown({
  result,
  grossSalary,
  currency,
}: CountryResultBreakdownProps) {
  const { taxes, breakdown } = result;

  if (!isOMTaxBreakdown(taxes) || !isOMBreakdown(breakdown)) {
    return null;
  }

  const isOmaniEmployee = breakdown.workerType === "omani";
  const appliedVoluntarySavings = breakdown.voluntaryContributions.filter(
    (contribution) => contribution.amount > 0,
  );

  return (
    <>
      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-zinc-400">Worker Type</span>
        <span className="rounded bg-zinc-700/50 px-2 py-1 text-xs font-medium text-zinc-300">
          {OM_WORKER_TYPE_LABELS[breakdown.workerType]}
        </span>
      </div>

      <Separator className="my-2" />
      <p className="pb-1 pt-2 text-xs text-zinc-500">Income Tax</p>
      <DeductionRow
        label="Personal income tax on 2026 employment salary"
        amount={taxes.incomeTax}
        grossSalary={grossSalary}
        currency={currency}
      />
      <p className="mt-1 text-xs italic text-zinc-500">
        Oman has no personal income tax on 2026 employment salary; the enacted
        PIT regime is expected from 1 January 2028.
      </p>

      <Separator className="my-2" />
      <p className="pb-1 pt-2 text-xs text-zinc-500">
        Social Protection Fund Deductions
      </p>
      {isOmaniEmployee ? (
        <>
          <div className="flex items-center justify-between py-1">
            <span className="text-sm text-zinc-400">Monthly insured wage</span>
            <span className="text-sm tabular-nums text-zinc-300">
              {formatCurrency(breakdown.spfInsuredWageMonthly, currency)}
            </span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-sm text-zinc-400">Annual insured wage</span>
            <span className="text-sm tabular-nums text-zinc-300">
              {formatCurrency(breakdown.spfInsuredWageAnnual, currency)}
            </span>
          </div>
          {breakdown.mandatoryContributions.map((contribution) => (
            <DeductionRow
              key={contribution.name}
              label={`${contribution.name} (${formatPercentage(
                contribution.rate,
              )})`}
              amount={contribution.amount}
              grossSalary={grossSalary}
              currency={currency}
            />
          ))}
          <p className="mt-1 text-xs italic text-zinc-500">
            SPF employee contributions are calculated on the selected insured
            wage, not automatically on total cash salary.
          </p>
        </>
      ) : (
        <>
          <p className="text-xs italic text-zinc-500">
            No employee-side Oman social protection deduction is modeled for
            expatriate employees.
          </p>
          {breakdown.expatProvidentSchemeApplied ? (
            <div className="mt-2 rounded-md bg-zinc-800/50 p-3">
              <p className="mb-2 text-xs font-medium text-zinc-400">
                Employer Provident Scheme Context
              </p>
              <div className="flex items-center justify-between py-1">
                <span className="text-sm text-zinc-400">
                  Monthly basic wage used
                </span>
                <span className="text-sm tabular-nums text-zinc-300">
                  {formatCurrency(
                    breakdown.expatProvidentBasicWageMonthly,
                    currency,
                  )}
                </span>
              </div>
              <DeductionRow
                label="Employer provident-scheme deposit (9%, not deducted)"
                amount={breakdown.expatProvidentEmployerContributionAnnual}
                grossSalary={grossSalary}
                currency={currency}
              />
              <p className="mt-1 text-xs italic text-zinc-500">
                This is shown as employer-funded savings context under SPF
                rules; it does not reduce employee take-home pay.
              </p>
            </div>
          ) : null}
        </>
      )}

      {appliedVoluntarySavings.length > 0 ? (
        <>
          <Separator className="my-2" />
          <p className="pb-1 pt-2 text-xs text-zinc-500">
            Optional Savings Deducted From Take-Home
          </p>
          {appliedVoluntarySavings.map((contribution) => (
            <DeductionRow
              key={contribution.key}
              label={contribution.name}
              amount={contribution.amount}
              grossSalary={grossSalary}
              currency={currency}
            />
          ))}
          <p className="mt-1 text-xs italic text-zinc-500">
            Oman has no 2026 personal income tax relief for this modeled
            deposit; it is treated as a cash saving deducted from net pay.
          </p>
        </>
      ) : null}

      {breakdown.assumptions.length > 0 ? (
        <>
          <Separator className="my-2" />
          <div className="rounded-lg bg-zinc-800/50 p-3">
            <p className="mb-2 text-xs font-medium text-zinc-400">
              Oman Salary Assumptions
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
              Oman Items Requiring Separate Facts
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
              Oman Sources
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
                    {getOmanSourceLabel(url)}
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
