import { Separator } from "@/components/ui/separator";
import { isPYBreakdown, isPYTaxBreakdown } from "@/lib/countries/py/types";
import { formatCurrency, formatPercentage } from "@/lib/format";
import { DeductionRow } from "../deduction-row";
import { ResultNotes } from "./result-notes";
import type { CountryResultBreakdownProps } from "./types";

function ReliefRow({
  label,
  amount,
  currency,
  taxOnly = false,
}: {
  label: string;
  amount: number;
  currency: CountryResultBreakdownProps["currency"];
  taxOnly?: boolean;
}) {
  if (amount <= 0) {
    return null;
  }

  return (
    <div className="space-y-1 py-1">
      <div className="flex items-center justify-between">
        <span className="text-sm text-zinc-400">{label}</span>
        <span className="text-sm text-emerald-400 tabular-nums">
          -{formatCurrency(amount, currency)}
        </span>
      </div>
      {taxOnly ? (
        <p className="text-xs italic text-zinc-500">
          Annual IRP deduction only; this is not a separate payroll cash
          deduction.
        </p>
      ) : null}
    </div>
  );
}

export function PYResultBreakdown({
  result,
  grossSalary,
  currency,
}: CountryResultBreakdownProps) {
  const { taxes, breakdown } = result;

  if (!isPYTaxBreakdown(taxes) || !isPYBreakdown(breakdown)) {
    return null;
  }

  const deductibleExpenses = breakdown.voluntaryContributions.find(
    (contribution) =>
      contribution.key === "qualifyingExpenses" && contribution.amount > 0,
  );

  return (
    <>
      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-zinc-400">Paraguay cash gross</span>
        <span className="text-sm text-zinc-200 tabular-nums">
          {formatCurrency(breakdown.grossIncome, currency)}
        </span>
      </div>
      <div className="flex items-center justify-between py-1">
        <span className="text-sm text-zinc-400">Ordinary salary</span>
        <span className="text-sm text-zinc-200 tabular-nums">
          {formatCurrency(breakdown.ordinarySalary, currency)}
        </span>
      </div>
      {breakdown.aguinaldo > 0 ? (
        <div className="flex items-center justify-between py-1">
          <span className="text-sm text-zinc-400">
            Statutory aguinaldo excluded from IRP/IPS
          </span>
          <span className="text-sm text-zinc-200 tabular-nums">
            {formatCurrency(breakdown.aguinaldo, currency)}
          </span>
        </div>
      ) : null}
      <div className="flex items-center justify-between py-1">
        <span className="text-sm text-zinc-400">IRP and IPS salary base</span>
        <span className="text-sm text-zinc-200 tabular-nums">
          {formatCurrency(breakdown.taxableAndIpsSalaryBase, currency)}
        </span>
      </div>
      <div className="flex items-center justify-between py-1">
        <span className="text-sm text-zinc-400">IRP taxable income</span>
        <span className="text-sm text-zinc-200 tabular-nums">
          {formatCurrency(result.taxableIncome, currency)}
        </span>
      </div>

      {deductibleExpenses ? (
        <>
          <Separator className="my-2" />
          <p className="pb-1 pt-2 text-xs text-zinc-500">
            Paraguay IRP Deductible Expenses
          </p>
          <ReliefRow
            label={deductibleExpenses.name}
            amount={deductibleExpenses.amount}
            currency={currency}
            taxOnly
          />
        </>
      ) : null}

      <Separator className="my-2" />
      <p className="pb-1 pt-2 text-xs text-zinc-500">IRP And IPS</p>
      <DeductionRow
        label="Paraguay IRP personal income tax"
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
                {formatPercentage(bracket.rate)} IRP band above{" "}
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
              Paraguay Salary Assumptions
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
              Paraguay Items Requiring Separate Facts
            </p>
            <ul className="list-disc space-y-1 pl-4 text-xs text-zinc-500">
              {breakdown.modeledExclusions.map((exclusion) => (
                <li key={exclusion}>{exclusion}</li>
              ))}
            </ul>
          </div>
        </>
      ) : null}
      <ResultNotes countryName="Paraguay" sourceUrls={breakdown.sourceUrls} />
    </>
  );
}
