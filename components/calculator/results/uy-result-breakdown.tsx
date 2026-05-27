import { Separator } from "@/components/ui/separator";
import { isUYBreakdown, isUYTaxBreakdown } from "@/lib/countries/uy/types";
import { formatCurrency, formatPercentage } from "@/lib/format";
import { DeductionRow } from "../deduction-row";
import { ResultNotes } from "./result-notes";
import type { CountryResultBreakdownProps } from "./types";

function ReliefRow({
  label,
  amount,
  currency,
  prefix = "-",
  note,
}: {
  label: string;
  amount: number;
  currency: CountryResultBreakdownProps["currency"];
  prefix?: "-" | "";
  note?: string;
}) {
  if (amount <= 0) {
    return null;
  }

  return (
    <div className="space-y-1 py-1">
      <div className="flex items-center justify-between">
        <span className="text-sm text-zinc-400">{label}</span>
        <span className="text-sm text-emerald-400 tabular-nums">
          {prefix}
          {formatCurrency(amount, currency)}
        </span>
      </div>
      {note ? <p className="text-xs italic text-zinc-500">{note}</p> : null}
    </div>
  );
}

export function UYResultBreakdown({
  result,
  grossSalary,
  currency,
}: CountryResultBreakdownProps) {
  const { taxes, breakdown } = result;

  if (!isUYTaxBreakdown(taxes) || !isUYBreakdown(breakdown)) {
    return null;
  }

  const regularIncomeTax = Math.max(
    0,
    taxes.incomeTax - taxes.aguinaldoIncomeTax,
  );
  const voluntaryAfap = breakdown.voluntaryContributions.find(
    (contribution) =>
      contribution.key === "retirementContribution" && contribution.amount > 0,
  );
  const housingClaim = breakdown.voluntaryContributions.find(
    (contribution) =>
      contribution.key === "housingExpenses" && contribution.amount > 0,
  );
  const hasCreditsOrClaims =
    breakdown.taxCredits.length > 0 || voluntaryAfap || housingClaim;

  return (
    <>
      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-zinc-400">Uruguay cash gross</span>
        <span className="text-sm text-zinc-200 tabular-nums">
          {formatCurrency(breakdown.grossIncome, currency)}
        </span>
      </div>
      <div className="flex items-center justify-between py-1">
        <span className="text-sm text-zinc-400">Regular IRPF income</span>
        <span className="text-sm text-zinc-200 tabular-nums">
          {formatCurrency(breakdown.regularIrpfIncome, currency)}
        </span>
      </div>
      {breakdown.aguinaldo > 0 ? (
        <>
          <div className="flex items-center justify-between py-1">
            <span className="text-sm text-zinc-400">
              Sueldo anual complementario
            </span>
            <span className="text-sm text-zinc-200 tabular-nums">
              {formatCurrency(breakdown.aguinaldo, currency)}
            </span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-sm text-zinc-400">
              Aguinaldo IRPF marginal rate
            </span>
            <span className="text-sm text-zinc-200 tabular-nums">
              {formatPercentage(breakdown.aguinaldoMarginalRate)}
            </span>
          </div>
        </>
      ) : null}
      <div className="flex items-center justify-between py-1">
        <span className="text-sm text-zinc-400">
          Social contribution base
        </span>
        <span className="text-sm text-zinc-200 tabular-nums">
          {formatCurrency(breakdown.socialContributionBase, currency)}
        </span>
      </div>
      <div className="flex items-center justify-between py-1">
        <span className="text-sm text-zinc-400">IRPF taxable income</span>
        <span className="text-sm text-zinc-200 tabular-nums">
          {formatCurrency(result.taxableIncome, currency)}
        </span>
      </div>

      {hasCreditsOrClaims ? (
        <>
          <Separator className="my-2" />
          <p className="pb-1 pt-2 text-xs text-zinc-500">
            Uruguay IRPF Deductions And Credits
          </p>
          <ReliefRow
            label={voluntaryAfap?.name ?? ""}
            amount={voluntaryAfap?.amount ?? 0}
            currency={currency}
            note="Cash AFAP saving; it is also included in the IRPF deduction-credit base."
          />
          <ReliefRow
            label={housingClaim?.name ?? ""}
            amount={housingClaim?.amount ?? 0}
            currency={currency}
            note="Tax claim only; rent becomes an 8% credit and mortgage payments enter the capped deduction base."
          />
          {breakdown.taxCredits.map((credit) => (
            <ReliefRow
              key={credit.name}
              label={credit.name}
              amount={credit.amount}
              currency={currency}
            />
          ))}
        </>
      ) : null}

      <Separator className="my-2" />
      <p className="pb-1 pt-2 text-xs text-zinc-500">
        IRPF And Payroll Contributions
      </p>
      <DeductionRow
        label="Uruguay regular IRPF"
        amount={regularIncomeTax}
        grossSalary={grossSalary}
        currency={currency}
      />
      {taxes.aguinaldoIncomeTax > 0 ? (
        <DeductionRow
          label="Aguinaldo IRPF"
          amount={taxes.aguinaldoIncomeTax}
          grossSalary={grossSalary}
          currency={currency}
        />
      ) : null}
      {breakdown.bracketTaxes.length > 0 ? (
        <div className="space-y-1 pt-1">
          {breakdown.bracketTaxes.map((bracket) => (
            <div
              className="flex items-center justify-between py-1"
              key={`${bracket.min}-${bracket.max}-${bracket.rate}`}
            >
              <span className="text-xs text-zinc-500">
                {formatPercentage(bracket.rate)} IRPF band above{" "}
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
              Uruguay Salary Assumptions
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
              Uruguay Items Requiring Separate Facts
            </p>
            <ul className="list-disc space-y-1 pl-4 text-xs text-zinc-500">
              {breakdown.modeledExclusions.map((exclusion) => (
                <li key={exclusion}>{exclusion}</li>
              ))}
            </ul>
          </div>
        </>
      ) : null}
      <ResultNotes countryName="Uruguay" sourceUrls={breakdown.sourceUrls} />
    </>
  );
}
