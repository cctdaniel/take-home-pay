import { Separator } from "@/components/ui/separator";
import { isMUBreakdown, isMUTaxBreakdown } from "@/lib/countries/mu/types";
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

export function MUResultBreakdown({
  result,
  grossSalary,
  currency,
}: CountryResultBreakdownProps) {
  const { taxes, breakdown } = result;

  if (!isMUTaxBreakdown(taxes) || !isMUBreakdown(breakdown)) {
    return null;
  }

  const appliedDeductions = breakdown.deductions.filter(
    (deduction) => deduction.amount > 0,
  );
  const appliedReliefs = breakdown.voluntaryContributions.filter(
    (contribution) => contribution.amount > 0,
  );
  const hasReliefs = appliedDeductions.length > 0 || appliedReliefs.length > 0;

  return (
    <>
      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-zinc-400">
          Mauritius employment income
        </span>
        <span className="text-sm text-zinc-200 tabular-nums">
          {formatCurrency(breakdown.grossIncome, currency)}
        </span>
      </div>
      <div className="flex items-center justify-between py-1">
        <span className="text-sm text-zinc-400">Chargeable income</span>
        <span className="text-sm text-zinc-200 tabular-nums">
          {formatCurrency(result.taxableIncome, currency)}
        </span>
      </div>

      <Separator className="my-2" />
      <p className="pb-1 pt-2 text-xs text-zinc-500">
        MRA Reliefs And Deductions
      </p>
      {hasReliefs ? (
        <>
          {appliedDeductions.map((deduction) => (
            <ReliefRow
              key={deduction.name}
              label={deduction.name}
              amount={deduction.amount}
              currency={currency}
            />
          ))}
          {appliedReliefs.map((contribution) => (
            <ReliefRow
              key={contribution.key}
              label={contribution.name}
              amount={contribution.amount}
              currency={currency}
            />
          ))}
        </>
      ) : (
        <p className="text-xs italic text-zinc-500">
          No dependent deduction, pension, medical insurance, charity, school
          fee, carer wage, housing-interest, or green-investment relief is
          entered.
        </p>
      )}

      <Separator className="my-2" />
      <p className="pb-1 pt-2 text-xs text-zinc-500">Income Tax</p>
      <DeductionRow
        label="Mauritius income tax"
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
                {formatPercentage(bracket.rate)} MRA band above{" "}
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
      <p className="pb-1 pt-2 text-xs text-zinc-500">CSG</p>
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
              Mauritius Salary Assumptions
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
              Mauritius Items Requiring Separate Facts
            </p>
            <ul className="list-disc space-y-1 pl-4 text-xs text-zinc-500">
              {breakdown.modeledExclusions.map((exclusion) => (
                <li key={exclusion}>{exclusion}</li>
              ))}
            </ul>
          </div>
        </>
      ) : null}
      <ResultNotes countryName="Mauritius" sourceUrls={breakdown.sourceUrls} />
    </>
  );
}
