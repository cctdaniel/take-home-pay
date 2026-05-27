import { Separator } from "@/components/ui/separator";
import { isQABreakdown, isQATaxBreakdown } from "@/lib/countries/qa/types";
import { formatCurrency, formatPercentage } from "@/lib/format";
import { DeductionRow } from "../deduction-row";
import type { CountryResultBreakdownProps } from "./types";

const QA_EMPLOYEE_TYPE_LABELS = {
  expatriate: "Expatriate employee",
  qatariPensionCovered: "Qatari/GCC pension-covered employee",
} as const;

function getQatarSourceLabel(url: string) {
  if (url.includes("gta.gov.qa/en/taxes-info")) {
    return "Qatar General Tax Authority tax info";
  }

  if (url.includes("gta.gov.qa/en/laws")) {
    return "Qatar General Tax Authority laws";
  }

  if (url.includes("LawArticleID=83563")) {
    return "Al Meezan income tax law article";
  }

  if (url.includes("LawID=9861")) {
    return "Al Meezan social insurance law";
  }

  if (url.includes("qna.org.qa")) {
    return "QNA GRSIA social security law notice";
  }

  if (url.includes("issa.int")) {
    return "ISSA Qatar social security profile";
  }

  if (url.includes("/other-taxes")) {
    return "PwC Qatar other taxes cross-check";
  }

  return "PwC Qatar personal income tax cross-check";
}

export function QAResultBreakdown({
  result,
  grossSalary,
  currency,
}: CountryResultBreakdownProps) {
  const { taxes, breakdown } = result;

  if (!isQATaxBreakdown(taxes) || !isQABreakdown(breakdown)) {
    return null;
  }

  const isPensionCovered = breakdown.employeeType === "qatariPensionCovered";

  return (
    <>
      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-zinc-400">Employee Type</span>
        <span className="rounded bg-zinc-700/50 px-2 py-1 text-xs font-medium text-zinc-300">
          {QA_EMPLOYEE_TYPE_LABELS[breakdown.employeeType]}
        </span>
      </div>

      <Separator className="my-2" />
      <p className="pb-1 pt-2 text-xs text-zinc-500">Income Tax</p>
      <DeductionRow
        label="Personal income tax on salary, wages, and allowances"
        amount={taxes.incomeTax}
        grossSalary={grossSalary}
        currency={currency}
      />
      <p className="mt-1 text-xs italic text-zinc-500">
        Qatar does not impose income tax on employed individuals&apos; salaries,
        wages, and allowances.
      </p>

      <Separator className="my-2" />
      <p className="pb-1 pt-2 text-xs text-zinc-500">
        GRSIA Employee Social Insurance
      </p>
      {isPensionCovered ? (
        <>
          <div className="flex items-center justify-between py-1">
            <span className="text-sm text-zinc-400">
              Monthly GRSIA basic salary
            </span>
            <span className="text-sm tabular-nums text-zinc-300">
              {formatCurrency(breakdown.grsiaBasicSalaryMonthly, currency)}
            </span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-sm text-zinc-400">
              Monthly GRSIA social allowance
            </span>
            <span className="text-sm tabular-nums text-zinc-300">
              {formatCurrency(breakdown.grsiaSocialAllowanceMonthly, currency)}
            </span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-sm text-zinc-400">
              Monthly GRSIA housing allowance
            </span>
            <span className="text-sm tabular-nums text-zinc-300">
              {formatCurrency(breakdown.grsiaHousingAllowanceMonthly, currency)}
            </span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-sm text-zinc-400">
              Selected monthly GRSIA salary before total cap
            </span>
            <span className="text-sm tabular-nums text-zinc-300">
              {formatCurrency(breakdown.grsiaSelectedSalaryMonthly, currency)}
            </span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-sm text-zinc-400">
              Monthly contribution salary after cap
            </span>
            <span className="text-sm tabular-nums text-zinc-300">
              {formatCurrency(
                breakdown.grsiaContributionSalaryMonthly,
                currency,
              )}
            </span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-sm text-zinc-400">
              Annual contribution salary
            </span>
            <span className="text-sm tabular-nums text-zinc-300">
              {formatCurrency(
                breakdown.grsiaContributionSalaryAnnual,
                currency,
              )}
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
            {breakdown.contributionSalaryCapTreatment === "grandfathered"
              ? "Using the selected pre-law grandfathered contribution salary treatment."
              : `Using the standard monthly contribution salary cap of ${formatCurrency(
                  breakdown.grsiaMonthlySalaryCap,
                  currency,
                )}; housing allowance is capped at ${formatCurrency(
                  breakdown.grsiaHousingAllowanceMonthlyCap,
                  currency,
                )}.`}
            {breakdown.grsiaMonthlyCapApplied
              ? " The selected GRSIA components exceeded the total monthly contribution salary cap."
              : ""}
          </p>
        </>
      ) : (
        <p className="text-xs italic text-zinc-500">
          No Qatar employee-side statutory social insurance deduction is
          modeled for expatriate employees.
        </p>
      )}

      {breakdown.assumptions.length > 0 ? (
        <>
          <Separator className="my-2" />
          <div className="rounded-lg bg-zinc-800/50 p-3">
            <p className="mb-2 text-xs font-medium text-zinc-400">
              Qatar Salary Assumptions
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
              Qatar Items Requiring Separate Facts
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
              Qatar Sources
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
                    {getQatarSourceLabel(url)}
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
