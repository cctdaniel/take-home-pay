import { Separator } from "@/components/ui/separator";
import { isBGBreakdown, isBGTaxBreakdown } from "@/lib/countries/bg/types";
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

export function BGResultBreakdown({
  result,
  grossSalary,
  currency,
}: CountryResultBreakdownProps) {
  const { taxes, breakdown } = result;

  if (!isBGTaxBreakdown(taxes) || !isBGBreakdown(breakdown)) {
    return null;
  }

  const appliedReliefs = breakdown.deductions.filter(
    (deduction) => deduction.amount > 0,
  );
  const appliedVoluntary = breakdown.voluntaryContributions.filter(
    (contribution) => contribution.amount > 0,
  );
  const hasReliefs = appliedReliefs.length > 0 || appliedVoluntary.length > 0;
  const socialContribution = breakdown.mandatoryContributions.find(
    (contribution) =>
      contribution.name === "Employee social and health insurance",
  );

  return (
    <>
      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-zinc-400">Bulgaria gross salary</span>
        <span className="text-sm text-zinc-200 tabular-nums">
          {formatCurrency(breakdown.grossIncome, currency)}
        </span>
      </div>
      <div className="flex items-center justify-between py-1">
        <span className="text-sm text-zinc-400">
          Personal-income-tax base
        </span>
        <span className="text-sm text-zinc-200 tabular-nums">
          {formatCurrency(result.taxableIncome, currency)}
        </span>
      </div>

      {hasReliefs ? (
        <>
          <Separator className="my-2" />
          <p className="pb-1 pt-2 text-xs text-zinc-500">
            Bulgaria Resident Reliefs
          </p>
          {appliedReliefs.map((deduction) => (
            <ReliefRow
              key={deduction.name}
              label={deduction.name}
              amount={deduction.amount}
              currency={currency}
            />
          ))}
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
        Personal Income Tax And Insurance
      </p>
      <DeductionRow
        label="Bulgaria personal income tax"
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
                {formatPercentage(bracket.rate)} PIT band above{" "}
                {formatCurrency(bracket.min, currency)}
              </span>
              <span className="text-xs text-zinc-400 tabular-nums">
                {formatCurrency(bracket.tax, currency)}
              </span>
            </div>
          ))}
        </div>
      ) : null}
      {socialContribution ? (
        <>
          <DeductionRow
            label={`${socialContribution.name} (${formatPercentage(
              socialContribution.rate,
            )})`}
            amount={socialContribution.amount}
            grossSalary={grossSalary}
            currency={currency}
          />
          <p className="text-xs italic text-zinc-500">
            Employee social and health insurance is capped at the modeled annual
            contribution ceiling before the flat PIT calculation.
          </p>
        </>
      ) : null}

      {breakdown.assumptions.length > 0 ? (
        <>
          <Separator className="my-2" />
          <div className="rounded-lg bg-zinc-800/50 p-3">
            <p className="mb-2 text-xs font-medium text-zinc-400">
              Bulgaria Salary Assumptions
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
              Bulgaria Items Requiring Separate Facts
            </p>
            <ul className="list-disc space-y-1 pl-4 text-xs text-zinc-500">
              {breakdown.modeledExclusions.map((exclusion) => (
                <li key={exclusion}>{exclusion}</li>
              ))}
            </ul>
          </div>
        </>
      ) : null}
      <ResultNotes countryName="Bulgaria" sourceUrls={breakdown.sourceUrls} />
    </>
  );
}
