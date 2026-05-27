import { Separator } from "@/components/ui/separator";
import { isROBreakdown, isROTaxBreakdown } from "@/lib/countries/ro/types";
import { formatCurrency, formatPercentage } from "@/lib/format";
import { DeductionRow } from "../deduction-row";
import { ResultNotes } from "./result-notes";
import type { CountryResultBreakdownProps } from "./types";

function ReliefRow({
  label,
  amount,
  currency,
}: {
  label: string;
  amount: number;
  currency: CountryResultBreakdownProps["currency"];
}) {
  if (amount <= 0) {
    return null;
  }

  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm text-zinc-400">{label}</span>
      <span className="text-sm text-emerald-400 tabular-nums">
        -{formatCurrency(amount, currency)}
      </span>
    </div>
  );
}

export function ROResultBreakdown({
  result,
  grossSalary,
  currency,
}: CountryResultBreakdownProps) {
  const { taxes, breakdown } = result;

  if (!isROTaxBreakdown(taxes) || !isROBreakdown(breakdown)) {
    return null;
  }

  const appliedVoluntary = breakdown.voluntaryContributions.filter(
    (contribution) => contribution.amount > 0,
  );
  const personalDeductionClaimed =
    breakdown.personalDeductionInputs.claimPersonalDeduction;
  const hasArticle77Detail =
    personalDeductionClaimed || breakdown.personalDeductionDetails.total > 0;

  return (
    <>
      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-zinc-400">Romania gross salary</span>
        <span className="text-sm text-zinc-200 tabular-nums">
          {formatCurrency(breakdown.grossIncome, currency)}
        </span>
      </div>
      <div className="flex items-center justify-between py-1">
        <span className="text-sm text-zinc-400">
          Income-tax taxable salary
        </span>
        <span className="text-sm text-zinc-200 tabular-nums">
          {formatCurrency(result.taxableIncome, currency)}
        </span>
      </div>

      {hasArticle77Detail || appliedVoluntary.length > 0 ? (
        <>
          <Separator className="my-2" />
          <p className="pb-1 pt-2 text-xs text-zinc-500">
            Romania Article 77 And Employee Deductions
          </p>
          <ReliefRow
            label="Basic personal deduction"
            amount={breakdown.personalDeductionDetails.basicPersonalDeduction}
            currency={currency}
          />
          <ReliefRow
            label="Under-26 supplemental deduction"
            amount={breakdown.personalDeductionDetails.youngEmployeeDeduction}
            currency={currency}
          />
          <ReliefRow
            label="School-child deduction"
            amount={breakdown.personalDeductionDetails.schoolChildDeduction}
            currency={currency}
          />
          {personalDeductionClaimed &&
          breakdown.personalDeductionDetails.total <= 0 ? (
            <p className="text-xs italic text-zinc-500">
              Article 77 personal deduction was claimed, but the salary is above
              the modeled minimum-wage phase-out band.
            </p>
          ) : null}
          {appliedVoluntary.map((contribution) => (
            <ReliefRow
              key={contribution.key}
              label={contribution.name}
              amount={contribution.amount}
              currency={currency}
            />
          ))}
        </>
      ) : null}

      <Separator className="my-2" />
      <p className="pb-1 pt-2 text-xs text-zinc-500">
        Income Tax, CAS And CASS
      </p>
      <DeductionRow
        label="Romania income tax"
        amount={taxes.incomeTax}
        grossSalary={grossSalary}
        currency={currency}
      />
      {breakdown.bracketTaxes.length > 0 ? (
        <div className="space-y-1 pt-1">
          {breakdown.bracketTaxes.map((bracket) => (
            <div
              className="flex items-center justify-between py-1"
              key={`${bracket.min}-${bracket.max}-${bracket.rate}`}
            >
              <span className="text-xs text-zinc-500">
                {formatPercentage(bracket.rate)} income tax band above{" "}
                {formatCurrency(bracket.min, currency)}
              </span>
              <span className="text-xs text-zinc-400 tabular-nums">
                {formatCurrency(bracket.tax, currency)}
              </span>
            </div>
          ))}
        </div>
      ) : null}
      {breakdown.mandatoryContributions.map((contribution) => (
        <DeductionRow
          key={contribution.name}
          label={`${contribution.name} (${formatPercentage(contribution.rate)})`}
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
              Romania Salary Assumptions
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
              Romania Items Requiring Separate Facts
            </p>
            <ul className="list-disc space-y-1 pl-4 text-xs text-zinc-500">
              {breakdown.modeledExclusions.map((exclusion) => (
                <li key={exclusion}>{exclusion}</li>
              ))}
            </ul>
          </div>
        </>
      ) : null}
      <ResultNotes countryName="Romania" sourceUrls={breakdown.sourceUrls} />
    </>
  );
}
