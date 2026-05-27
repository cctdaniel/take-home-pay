import { Separator } from "@/components/ui/separator";
import { isPABreakdown, isPATaxBreakdown } from "@/lib/countries/pa/types";
import { formatCurrency, formatPercentage } from "@/lib/format";
import { DeductionRow } from "../deduction-row";
import { ResultNotes } from "./result-notes";
import type { CountryResultBreakdownProps } from "./types";

function DeductionReliefRow({
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

export function PAResultBreakdown({
  result,
  grossSalary,
  currency,
}: CountryResultBreakdownProps) {
  const { taxes, breakdown } = result;

  if (!isPATaxBreakdown(taxes) || !isPABreakdown(breakdown)) {
    return null;
  }

  const appliedDeductions = breakdown.deductions.filter(
    (deduction) => deduction.amount > 0,
  );
  const appliedVoluntary = breakdown.voluntaryContributions.filter(
    (contribution) => contribution.amount > 0,
  );
  const hasPersonalDeductions =
    appliedDeductions.length > 0 || appliedVoluntary.length > 0;

  return (
    <>
      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-zinc-400">
          Panama-source employment salary
        </span>
        <span className="text-sm text-zinc-200 tabular-nums">
          {formatCurrency(breakdown.grossIncome, currency)}
        </span>
      </div>
      <div className="flex items-center justify-between py-1">
        <span className="text-sm text-zinc-400">Taxable salary base</span>
        <span className="text-sm text-zinc-200 tabular-nums">
          {formatCurrency(result.taxableIncome, currency)}
        </span>
      </div>

      <Separator className="my-2" />
      <p className="pb-1 pt-2 text-xs text-zinc-500">
        Panama Personal Deductions
      </p>
      {hasPersonalDeductions ? (
        <>
          {appliedDeductions.map((deduction) => (
            <DeductionReliefRow
              key={deduction.name}
              label={deduction.name}
              amount={deduction.amount}
              currency={currency}
            />
          ))}
          {appliedVoluntary.map((contribution) => (
            <DeductionReliefRow
              key={contribution.key}
              label={contribution.name}
              amount={contribution.amount}
              currency={currency}
            />
          ))}
        </>
      ) : (
        <p className="text-xs italic text-zinc-500">
          No married exemption, approved retirement fund contribution,
          mortgage interest, education, medical, or authorised donation
          deduction is entered.
        </p>
      )}

      <Separator className="my-2" />
      <p className="pb-1 pt-2 text-xs text-zinc-500">Income Tax</p>
      <DeductionRow
        label="Panama income tax"
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
                {formatPercentage(bracket.rate)} band above{" "}
                {formatCurrency(bracket.min, currency)}
              </span>
              <span className="text-xs text-zinc-400 tabular-nums">
                {formatCurrency(bracket.tax, currency)}
              </span>
            </div>
          ))}
        </div>
      ) : null}

      <Separator className="my-2" />
      <p className="pb-1 pt-2 text-xs text-zinc-500">
        Employee Payroll Contributions
      </p>
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
              Panama Salary Assumptions
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
              Panama Items Requiring Separate Facts
            </p>
            <ul className="list-disc space-y-1 pl-4 text-xs text-zinc-500">
              {breakdown.modeledExclusions.map((exclusion) => (
                <li key={exclusion}>{exclusion}</li>
              ))}
            </ul>
          </div>
        </>
      ) : null}
      <ResultNotes countryName="Panama" sourceUrls={breakdown.sourceUrls} />
    </>
  );
}
