import { Separator } from "@/components/ui/separator";
import { isSABreakdown, isSATaxBreakdown } from "@/lib/countries/sa/types";
import { formatCurrency, formatPercentage } from "@/lib/format";
import { DeductionRow } from "../deduction-row";
import type { CountryResultBreakdownProps } from "./types";

const SA_WORKER_TYPE_LABELS = {
  expatriate: "Expatriate employee",
  saudi_standard: "Saudi existing-system GOSI",
  saudi_new_system_2026: "Saudi new-system GOSI (2026 phase-in)",
} as const;
const SA_HOUSING_ALLOWANCE_LABELS = {
  none: "No housing allowance",
  cash: "Cash housing allowance",
  inKind: "In-kind employer housing",
} as const;

function getSaudiSourceLabel(url: string) {
  if (url.includes("zatca.gov.sa")) {
    return "ZATCA tax rules overview";
  }

  if (url.includes("gosi.gov.sa")) {
    return "GOSI employer FAQ";
  }

  if (url.includes("Social-Insurance-Law")) {
    return "Saudi Social Insurance Law reference";
  }

  if (url.includes("/other-taxes")) {
    return "PwC Saudi other taxes cross-check";
  }

  return "PwC Saudi personal income tax cross-check";
}

export function SAResultBreakdown({
  result,
  grossSalary,
  currency,
}: CountryResultBreakdownProps) {
  const { taxes, breakdown } = result;

  if (!isSATaxBreakdown(taxes) || !isSABreakdown(breakdown)) {
    return null;
  }

  const isSaudiEmployee = breakdown.workerType !== "expatriate";

  return (
    <>
      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-zinc-400">Worker Type</span>
        <span className="rounded bg-zinc-700/50 px-2 py-1 text-xs font-medium text-zinc-300">
          {SA_WORKER_TYPE_LABELS[breakdown.workerType]}
        </span>
      </div>

      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-zinc-400">Saudi salary PIT base</span>
        <span className="text-sm text-zinc-200 tabular-nums">
          {formatCurrency(result.taxableIncome, currency)}
        </span>
      </div>

      <Separator className="my-2" />
      <p className="pb-1 pt-2 text-xs text-zinc-500">Income Tax</p>
      <DeductionRow
        label="Personal income tax on employment earnings"
        amount={taxes.incomeTax}
        grossSalary={grossSalary}
        currency={currency}
      />
      <p className="mt-1 text-xs italic text-zinc-500">
        Saudi Arabia does not impose individual income tax on earnings derived
        only from employment in Saudi Arabia.
      </p>

      <Separator className="my-2" />
      <p className="pb-1 pt-2 text-xs text-zinc-500">GOSI / SANED</p>
      {isSaudiEmployee ? (
        <>
          <div className="flex items-center justify-between py-1">
            <span className="text-sm text-zinc-400">
              Basic wage for GOSI
            </span>
            <span className="text-sm tabular-nums text-zinc-300">
              {formatCurrency(breakdown.gosiBasicWageMonthly, currency)}
            </span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-sm text-zinc-400">
              Housing allowance treatment
            </span>
            <span className="text-sm tabular-nums text-zinc-300">
              {SA_HOUSING_ALLOWANCE_LABELS[breakdown.housingAllowanceType]}
            </span>
          </div>
          {breakdown.gosiHousingValueMonthly > 0 ? (
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-zinc-400">
                Monthly housing value for GOSI
              </span>
              <span className="text-sm tabular-nums text-zinc-300">
                {formatCurrency(breakdown.gosiHousingValueMonthly, currency)}
              </span>
            </div>
          ) : null}
          <div className="flex items-center justify-between py-1">
            <span className="text-sm text-zinc-400">
              Monthly contributory wage after min/cap
            </span>
            <span className="text-sm tabular-nums text-zinc-300">
              {formatCurrency(breakdown.gosiContributoryWageMonthly, currency)}
            </span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-sm text-zinc-400">
              Annual contributory wage
            </span>
            <span className="text-sm tabular-nums text-zinc-300">
              {formatCurrency(breakdown.gosiContributoryWageAnnual, currency)}
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
            GOSI contributions are calculated on the selected contributory wage,
            not automatically on total cash salary.
          </p>
        </>
      ) : (
        <p className="text-xs italic text-zinc-500">
          No employee-side GOSI deduction is modeled for expatriate employees;
          occupational hazard coverage is employer-paid.
        </p>
      )}

      {breakdown.assumptions.length > 0 ? (
        <>
          <Separator className="my-2" />
          <div className="rounded-lg bg-zinc-800/50 p-3">
            <p className="mb-2 text-xs font-medium text-zinc-400">
              Saudi Arabia Salary Assumptions
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
              Saudi Arabia Items Requiring Separate Facts
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
              Saudi Arabia Sources
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
                    {getSaudiSourceLabel(url)}
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
