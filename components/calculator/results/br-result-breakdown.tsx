import { Separator } from "@/components/ui/separator";
import { isBRBreakdown, isBRTaxBreakdown } from "@/lib/countries/br/types";
import { formatCurrency, formatPercentage } from "@/lib/format";
import { DeductionRow } from "../deduction-row";
import { ResultNotes } from "./result-notes";
import type { CountryResultBreakdownProps } from "./types";

function ReliefRow({
  label,
  amount,
  currency,
  note,
}: {
  label: string;
  amount: number;
  currency: CountryResultBreakdownProps["currency"];
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
          -{formatCurrency(amount, currency)}
        </span>
      </div>
      {note ? <p className="text-xs italic text-zinc-500">{note}</p> : null}
    </div>
  );
}

export function BRResultBreakdown({
  result,
  grossSalary,
  currency,
}: CountryResultBreakdownProps) {
  const { taxes, breakdown } = result;

  if (!isBRTaxBreakdown(taxes) || !isBRBreakdown(breakdown)) {
    return null;
  }

  const findDeduction = (name: string) =>
    breakdown.deductions.find((deduction) => deduction.name === name)?.amount ??
    0;
  const simplifiedTopUp = findDeduction("Simplified annual deduction top-up");
  const legalDeductions = breakdown.deductions.filter(
    (deduction) => deduction.name !== "Simplified annual deduction top-up",
  );
  const voluntaryDeductions = breakdown.voluntaryContributions.filter(
    (contribution) => contribution.amount > 0,
  );
  const hasReturnDeductions =
    legalDeductions.some((deduction) => deduction.amount > 0) ||
    voluntaryDeductions.length > 0 ||
    simplifiedTopUp > 0;
  const ordinaryIncomeTax = Math.max(
    0,
    taxes.incomeTax - taxes.thirteenthSalaryIncomeTax,
  );
  const ordinaryInss = Math.max(
    0,
    taxes.socialContributions - taxes.thirteenthSalaryInssContribution,
  );

  return (
    <>
      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-zinc-400">Entered annual gross salary</span>
        <span className="text-sm text-zinc-200 tabular-nums">
          {formatCurrency(breakdown.enteredGrossSalary, currency)}
        </span>
      </div>
      <div className="flex items-center justify-between py-1">
        <span className="text-sm text-zinc-400">
          Brazil ordinary salary for IRPF
        </span>
        <span className="text-sm text-zinc-200 tabular-nums">
          {formatCurrency(breakdown.ordinarySalary, currency)}
        </span>
      </div>
      {breakdown.thirteenthSalary > 0 ? (
        <div className="flex items-center justify-between py-1">
          <span className="text-sm text-zinc-400">13th salary</span>
          <span className="text-sm text-zinc-200 tabular-nums">
            {formatCurrency(breakdown.thirteenthSalary, currency)}
          </span>
        </div>
      ) : null}
      <div className="flex items-center justify-between py-1">
        <span className="text-sm text-zinc-400">
          Ordinary annual IRPF taxable income
        </span>
        <span className="text-sm text-zinc-200 tabular-nums">
          {formatCurrency(result.taxableIncome, currency)}
        </span>
      </div>

      {hasReturnDeductions ? (
        <>
          <Separator className="my-2" />
          <p className="pb-1 pt-2 text-xs text-zinc-500">
            IRPF Complete-Return Deductions
          </p>
          {legalDeductions.map((deduction) => (
            <ReliefRow
              key={deduction.name}
              label={deduction.name}
              amount={deduction.amount}
              currency={currency}
            />
          ))}
          {voluntaryDeductions.map((contribution) => (
            <ReliefRow
              key={contribution.key}
              label={contribution.name}
              amount={contribution.amount}
              currency={currency}
              note={
                contribution.key === "medicalExpenses"
                  ? "Modeled as uncapped only when documented and unreimbursed."
                  : undefined
              }
            />
          ))}
          <ReliefRow
            label="Simplified annual deduction top-up"
            amount={simplifiedTopUp}
            currency={currency}
            note="Shown only when the simplified discount is better than the modeled complete-return deductions."
          />
        </>
      ) : null}

      {breakdown.taxCredits.length > 0 ? (
        <>
          <Separator className="my-2" />
          <p className="pb-1 pt-2 text-xs text-zinc-500">IRPF Reductions</p>
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
      <p className="pb-1 pt-2 text-xs text-zinc-500">IRPF Income Tax</p>
      <DeductionRow
        label="Ordinary salary IRPF"
        amount={ordinaryIncomeTax}
        grossSalary={grossSalary}
        currency={currency}
      />
      {taxes.thirteenthSalaryIncomeTax > 0 ? (
        <>
          <DeductionRow
            label="13th salary exclusive IRRF"
            amount={taxes.thirteenthSalaryIncomeTax}
            grossSalary={grossSalary}
            currency={currency}
          />
          <div className="flex items-center justify-between py-1">
            <span className="text-xs text-zinc-500">
              13th salary IRRF taxable base
            </span>
            <span className="text-xs text-zinc-400 tabular-nums">
              {formatCurrency(breakdown.thirteenthSalaryTaxableIncome, currency)}
            </span>
          </div>
        </>
      ) : null}
      {breakdown.bracketTaxes.length > 0 ? (
        <div className="space-y-1 pt-1">
          {breakdown.bracketTaxes.map((bracket) => (
            <div
              className="flex items-center justify-between py-1"
              key={`${bracket.min}-${bracket.max}-${bracket.rate}`}
            >
              <span className="text-xs text-zinc-500">
                {formatPercentage(bracket.rate)} annual IRPF band above{" "}
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
      <p className="pb-1 pt-2 text-xs text-zinc-500">Employee INSS</p>
      <DeductionRow
        label="Ordinary salary INSS"
        amount={ordinaryInss}
        grossSalary={grossSalary}
        currency={currency}
      />
      {taxes.thirteenthSalaryInssContribution > 0 ? (
        <DeductionRow
          label="13th salary INSS"
          amount={taxes.thirteenthSalaryInssContribution}
          grossSalary={grossSalary}
          currency={currency}
        />
      ) : null}

      {breakdown.assumptions.length > 0 ? (
        <>
          <Separator className="my-2" />
          <div className="rounded-lg bg-zinc-800/50 p-3">
            <p className="mb-2 text-xs font-medium text-zinc-400">
              Brazil Salary Assumptions
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
              Brazil Items Requiring Separate Facts
            </p>
            <ul className="list-disc space-y-1 pl-4 text-xs text-zinc-500">
              {breakdown.modeledExclusions.map((exclusion) => (
                <li key={exclusion}>{exclusion}</li>
              ))}
            </ul>
          </div>
        </>
      ) : null}
      <ResultNotes countryName="Brazil" sourceUrls={breakdown.sourceUrls} />
    </>
  );
}
