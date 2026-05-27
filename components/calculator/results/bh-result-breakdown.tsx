import { Separator } from "@/components/ui/separator";
import { BH_SIO_MONTHLY_CONTRIBUTORY_WAGE_CAP } from "@/lib/countries/bh/constants/tax-year-2026";
import { isBHBreakdown, isBHTaxBreakdown } from "@/lib/countries/bh/types";
import { formatCurrency, formatPercentage } from "@/lib/format";
import { DeductionRow } from "../deduction-row";
import type { CountryResultBreakdownProps } from "./types";
import { getUniqueSourceUrls } from "./source-helpers";

const BH_WORKER_TYPE_LABELS = {
  expatriate: "Expatriate employee",
  bahraini: "Bahraini employee",
} as const;

function getBahrainSourceLabel(url: string) {
  if (url.includes("insurance-against-unemployment")) {
    return "Bahrain SIO unemployment insurance";
  }

  if (url.includes("unemployement-ministerial-orders")) {
    return "Bahrain SIO unemployment ministerial orders";
  }

  if (url.includes("law-no-24-of-1976") || url.includes("SIO_law")) {
    return "Bahrain SIO social insurance law";
  }

  if (url.includes("optional-insurance")) {
    return "Bahrain SIO optional insurance guidance";
  }

  if (url.includes("end-of-service-benefits")) {
    return "Bahrain SIO end-of-service benefits";
  }

  if (url.includes("sio-guides")) {
    return "Bahrain SIO guides";
  }

  if (url.includes("bahrain.bh")) {
    return "Bahrain government SIO wage component service reference";
  }

  if (url.includes("doing-business-guides")) {
    return "PwC Bahrain doing-business social insurance cross-check";
  }

  if (url.includes("sio.gov.bh")) {
    return "Social Insurance Organization";
  }

  if (url.includes("mercans.com")) {
    return "Bahrain SIO rate change cross-check";
  }

  if (url.includes("/other-taxes")) {
    return "PwC Bahrain other taxes cross-check";
  }

  return "PwC Bahrain personal income tax cross-check";
}

export function BHResultBreakdown({
  result,
  grossSalary,
  currency,
}: CountryResultBreakdownProps) {
  const { taxes, breakdown } = result;

  if (!isBHTaxBreakdown(taxes) || !isBHBreakdown(breakdown)) {
    return null;
  }
  const uniqueSourceUrls = getUniqueSourceUrls(breakdown.sourceUrls);

  return (
    <>
      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-zinc-400">Worker Type</span>
        <span className="rounded bg-zinc-700/50 px-2 py-1 text-xs font-medium text-zinc-300">
          {BH_WORKER_TYPE_LABELS[breakdown.workerType]}
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
        Bahrain has no personal income tax on ordinary employment salary.
      </p>

      <Separator className="my-2" />
      <p className="pb-1 pt-2 text-xs text-zinc-500">SIO Employee Deductions</p>
      <div className="flex items-center justify-between py-1">
        <span className="text-sm text-zinc-400">
          Basic wage for SIO
        </span>
        <span className="text-sm tabular-nums text-zinc-300">
          {formatCurrency(breakdown.sioBasicWageMonthly, currency)}
        </span>
      </div>
      <div className="flex items-center justify-between py-1">
        <span className="text-sm text-zinc-400">
          Recurring allowances for SIO
        </span>
        <span className="text-sm tabular-nums text-zinc-300">
          {formatCurrency(breakdown.sioRecurringAllowancesMonthly, currency)}
        </span>
      </div>
      <div className="flex items-center justify-between py-1">
        <span className="text-sm text-zinc-400">
          SIO wage before caps
        </span>
        <span className="text-sm tabular-nums text-zinc-300">
          {formatCurrency(breakdown.sioSelectedWageMonthly, currency)}
        </span>
      </div>
      <div className="flex items-center justify-between py-1">
        <span className="text-sm text-zinc-400">
          Monthly contributory wage after caps
        </span>
        <span className="text-sm tabular-nums text-zinc-300">
          {formatCurrency(breakdown.sioContributoryWageMonthly, currency)}
        </span>
      </div>
      <div className="flex items-center justify-between py-1">
        <span className="text-sm text-zinc-400">
          Annual contributory wage
        </span>
        <span className="text-sm tabular-nums text-zinc-300">
          {formatCurrency(breakdown.sioContributoryWageAnnual, currency)}
        </span>
      </div>
      {breakdown.mandatoryContributions.map((contribution) => (
        <DeductionRow
          key={contribution.name}
          label={`${contribution.name} (${formatPercentage(contribution.rate)})`}
          amount={contribution.amount}
          grossSalary={grossSalary}
          currency={currency}
        />
      ))}
      <p className="mt-1 text-xs italic text-zinc-500">
        SIO employee contributions are calculated on basic wage plus recurring
        cash allowances, capped at {formatCurrency(
          BH_SIO_MONTHLY_CONTRIBUTORY_WAGE_CAP,
          currency,
        )}{" "}
        per month and at monthly cash gross salary.
      </p>

      {breakdown.assumptions.length > 0 ? (
        <>
          <Separator className="my-2" />
          <div className="rounded-lg bg-zinc-800/50 p-3">
            <p className="mb-2 text-xs font-medium text-zinc-400">
              Bahrain Salary Assumptions
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
              Bahrain Items Requiring Separate Facts
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
              Bahrain Sources
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
                    {getBahrainSourceLabel(url)}
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
