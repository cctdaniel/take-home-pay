import { Separator } from "@/components/ui/separator";
import {
  isTHBreakdown,
  isTHTaxBreakdown,
} from "@/lib/countries/types";
import { formatCurrency, formatPercentage } from "@/lib/format";
import { DeductionRow } from "../deduction-row";
import type { CountryResultBreakdownProps } from "./types";

function getThaiSourceLabel(url: string) {
  if (url.includes("GUIDE_90")) {
    return "Revenue Department P.N.D.90 guide";
  }

  if (url.includes("67846")) {
    return "Revenue Department 2025 e-forms";
  }

  return "Revenue Department PIT overview";
}

export function THResultBreakdown({
  result,
  grossSalary,
  currency,
}: CountryResultBreakdownProps) {
  const { taxes, breakdown } = result;

  if (!isTHTaxBreakdown(taxes) || !isTHBreakdown(breakdown)) {
    return null;
  }

  const allowanceRows = [
    ["Personal Allowance", breakdown.allowances.personalAllowance],
    ["Spouse Allowance", breakdown.allowances.spouseAllowance],
    ["Child Allowance", breakdown.allowances.childAllowance],
    ["Parent Allowance", breakdown.allowances.parentAllowance],
    ["Disabled Person Allowance", breakdown.allowances.disabledPersonAllowance],
    ["Life Insurance", breakdown.allowances.lifeInsurance],
    ["Health Insurance", breakdown.allowances.healthInsurance],
    ["Social Security Allowance", breakdown.allowances.socialSecurity],
    ["Provident Fund", breakdown.allowances.providentFund],
    ["RMF", breakdown.allowances.rmf],
    ["SSF", breakdown.allowances.ssf],
    ["Thai ESG Fund", breakdown.allowances.esg],
    ["Mortgage Interest", breakdown.allowances.mortgageInterest],
    ["Donations", breakdown.allowances.donations],
    ["Political Donation", breakdown.allowances.politicalDonation],
    [
      "Elderly / Disabled Allowance",
      breakdown.allowances.elderlyDisabledAllowance,
    ],
  ] as const;

  return (
    <>
      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-zinc-400">Tax Residency</span>
        <span className="rounded bg-zinc-700/50 px-2 py-1 text-xs font-medium text-zinc-300">
          {breakdown.isResident ? "Thai Tax Resident" : "Non-resident"}
        </span>
      </div>

      <p className="pb-1 pt-2 text-xs text-zinc-500">
        Thai Allowances and Deductions
      </p>
      <div className="flex items-center justify-between py-1">
        <span className="text-sm text-zinc-400">Standard Expense Deduction</span>
        <span className="text-sm text-emerald-400 tabular-nums">
          -{formatCurrency(breakdown.standardDeduction, currency)}
        </span>
      </div>
      {allowanceRows.map(([label, amount]) =>
        amount > 0 ? (
          <div className="flex items-center justify-between py-1" key={label}>
            <span className="text-sm text-zinc-400">{label}</span>
            <span className="text-sm text-emerald-400 tabular-nums">
              -{formatCurrency(amount, currency)}
            </span>
          </div>
        ) : null,
      )}
      <div className="mt-1 flex items-center justify-between border-t border-zinc-700 py-1">
        <span className="text-sm text-zinc-300">Taxable Income</span>
        <span className="text-sm text-zinc-200 tabular-nums">
          {formatCurrency(breakdown.taxableIncome, currency)}
        </span>
      </div>

      <Separator className="my-2" />
      <p className="pb-1 pt-2 text-xs text-zinc-500">
        Personal Income Tax
      </p>
      {breakdown.bracketTaxes.map((bracket) => (
        <div
          className="flex items-center justify-between py-1"
          key={`${bracket.min}-${bracket.max}-${bracket.rate}`}
        >
          <span className="text-xs text-zinc-500">
            {formatPercentage(bracket.rate)} above{" "}
            {formatCurrency(bracket.min, currency)}
          </span>
          <span className="text-xs text-zinc-400 tabular-nums">
            {formatCurrency(bracket.tax, currency)}
          </span>
        </div>
      ))}
      <DeductionRow
        label="Thai Income Tax"
        amount={taxes.incomeTax}
        grossSalary={grossSalary}
        currency={currency}
      />

      <Separator className="my-2" />
      <p className="pb-1 pt-2 text-xs text-zinc-500">Social Security</p>
      <DeductionRow
        label="Employee Social Security"
        amount={taxes.socialSecurity}
        grossSalary={grossSalary}
        currency={currency}
      />
      <p className="text-xs italic text-zinc-500">
        {formatPercentage(breakdown.socialSecurity.rate)} of monthly wages up
        to {formatCurrency(breakdown.socialSecurity.cap, currency)} per month.
      </p>

      {breakdown.voluntaryContributions.total > 0 ? (
        <>
          <Separator className="my-2" />
          <p className="pb-1 pt-2 text-xs text-zinc-500">
            Retirement and Savings Contributions
          </p>
          <div className="flex items-center justify-between py-1">
            <span className="text-sm text-zinc-400">
              Provident Fund / RMF / SSF / ESG / NSF
            </span>
            <span className="text-sm text-emerald-400 tabular-nums">
              -{formatCurrency(breakdown.voluntaryContributions.total, currency)}
            </span>
          </div>
        </>
      ) : null}

      {breakdown.assumptions.length > 0 ? (
        <>
          <Separator className="my-2" />
          <div className="rounded-lg bg-zinc-800/50 p-3">
            <p className="mb-2 text-xs font-medium text-zinc-400">
              Thailand Salary Assumptions
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
              Thailand Items Requiring Separate Facts
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
              Thailand Official Sources
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
                    {getThaiSourceLabel(url)}
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
