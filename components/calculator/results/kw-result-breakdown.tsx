import { Separator } from "@/components/ui/separator";
import { isKWBreakdown, isKWTaxBreakdown } from "@/lib/countries/kw/types";
import { formatCurrency, formatPercentage } from "@/lib/format";
import { DeductionRow } from "../deduction-row";
import type { CountryResultBreakdownProps } from "./types";
import { getUniqueSourceUrls } from "./source-helpers";

const KW_WORKER_TYPE_LABELS = {
  expatriate: "Expatriate employee",
  kuwaiti: "Kuwaiti employee",
} as const;
const KW_SECTOR_LABELS = {
  government: "Government / public sector",
  privateOil: "Private or oil sector",
} as const;

function getKuwaitSourceLabel(url: string) {
  if (url.includes("mof.gov.kw")) {
    return "Kuwait Ministry of Finance";
  }

  if (url.includes("FAQ.aspx")) {
    return "PIFSS social security FAQ";
  }

  if (url.includes("pifss.gov.kw")) {
    return "Public Institution for Social Security";
  }

  if (url.includes("/other-taxes")) {
    return "PwC Kuwait other taxes cross-check";
  }

  return "PwC Kuwait personal income tax cross-check";
}

export function KWResultBreakdown({
  result,
  grossSalary,
  currency,
}: CountryResultBreakdownProps) {
  const { taxes, breakdown } = result;

  if (!isKWTaxBreakdown(taxes) || !isKWBreakdown(breakdown)) {
    return null;
  }

  const isKuwaitiEmployee = breakdown.workerType === "kuwaiti";
  const uniqueSourceUrls = getUniqueSourceUrls(breakdown.sourceUrls);

  return (
    <>
      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-zinc-400">Worker Type</span>
        <span className="rounded bg-zinc-700/50 px-2 py-1 text-xs font-medium text-zinc-300">
          {KW_WORKER_TYPE_LABELS[breakdown.workerType]}
        </span>
      </div>

      <Separator className="my-2" />
      <p className="pb-1 pt-2 text-xs text-zinc-500">Income Tax</p>
      <DeductionRow
        label="Personal income tax on employment salary"
        amount={taxes.incomeTax}
        grossSalary={grossSalary}
        currency={currency}
      />
      <p className="mt-1 text-xs italic text-zinc-500">
        Kuwait has no personal income tax on ordinary employment salary.
      </p>

      <Separator className="my-2" />
      <p className="pb-1 pt-2 text-xs text-zinc-500">PIFSS Employee Deductions</p>
      {isKuwaitiEmployee ? (
        <>
          <div className="flex items-center justify-between py-1">
            <span className="text-sm text-zinc-400">
              Basic insurance salary
            </span>
            <span className="text-sm tabular-nums text-zinc-300">
              {formatCurrency(breakdown.pifssBasicSalaryMonthly, currency)}
            </span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-sm text-zinc-400">
              Supplementary insurance salary
            </span>
            <span className="text-sm tabular-nums text-zinc-300">
              {formatCurrency(
                breakdown.pifssSupplementarySalaryMonthly,
                currency,
              )}
            </span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-sm text-zinc-400">PIFSS sector</span>
            <span className="text-sm tabular-nums text-zinc-300">
              {KW_SECTOR_LABELS[breakdown.sector]}
            </span>
          </div>
          {breakdown.includeFinancialRemuneration ? (
            <p className="text-xs italic text-zinc-500">
              Financial remuneration contribution is enabled for this scenario.
            </p>
          ) : null}
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
            PIFSS employee contributions are calculated on the selected basic
            and supplementary insurance salary bases, not automatically on total
            cash salary.
          </p>
        </>
      ) : (
        <p className="text-xs italic text-zinc-500">
          No Kuwait employee social security deduction is modeled for
          expatriate employees.
        </p>
      )}

      {breakdown.assumptions.length > 0 ? (
        <>
          <Separator className="my-2" />
          <div className="rounded-lg bg-zinc-800/50 p-3">
            <p className="mb-2 text-xs font-medium text-zinc-400">
              Kuwait Salary Assumptions
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
              Kuwait Items Requiring Separate Facts
            </p>
            <ul className="list-disc space-y-1 pl-4 text-xs text-zinc-500">
              {breakdown.modeledExclusions.map((exclusion) => (
                <li key={exclusion}>{exclusion}</li>
              ))}
            </ul>
          </div>
        </>
      ) : null}

      {uniqueSourceUrls.length > 0 ? (
        <>
          <Separator className="my-2" />
          <div className="rounded-lg bg-zinc-800/50 p-3">
            <p className="mb-2 text-xs font-medium text-zinc-400">
              Kuwait Sources
            </p>
            <ul className="list-disc space-y-1 pl-4 text-xs text-zinc-500">
              {uniqueSourceUrls.map((url) => (
                <li key={url}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-300 hover:text-emerald-200"
                  >
                    {getKuwaitSourceLabel(url)}
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
