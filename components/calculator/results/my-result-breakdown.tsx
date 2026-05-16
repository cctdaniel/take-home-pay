import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/format";
import { DeductionRow } from "../deduction-row";
import type { CountryResultBreakdownProps } from "./types";

export function MYResultBreakdown({
  result,
  grossSalary,
  currency,
}: CountryResultBreakdownProps) {
  const { taxes, breakdown } = result;

  if (!("socsoEmployee" in taxes) || breakdown.type !== "MY") {
    return null;
  }

  return (
    <>
      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-zinc-400">Tax Residency</span>
        <span className="text-xs font-medium text-zinc-300 bg-zinc-700/50 px-2 py-1 rounded">
          {breakdown.isResident
            ? "Malaysian Resident"
            : "Non-Resident (30% flat)"}
        </span>
      </div>

      <Separator className="my-2" />

      {breakdown.taxReliefs.total > 0 && (
        <>
          <p className="text-xs text-zinc-500 pt-2 pb-1">
            Resident Reliefs Applied
          </p>
          {Object.entries({
            "Individual relief": breakdown.taxReliefs.individual,
            "Spouse relief": breakdown.taxReliefs.spouse,
            "Child under 18": breakdown.taxReliefs.childUnder18,
            "Tertiary child": breakdown.taxReliefs.childTertiary,
            "Disabled individual": breakdown.taxReliefs.disabledIndividual,
            "EPF relief": breakdown.taxReliefs.epf,
            "PRS relief": breakdown.taxReliefs.prs,
            "SOCSO relief": breakdown.taxReliefs.socso,
            "Lifestyle relief": breakdown.taxReliefs.lifestyle,
            "Medical relief": breakdown.taxReliefs.medical,
          }).map(([label, amount]) =>
            amount > 0 ? (
              <div
                key={label}
                className="flex items-center justify-between py-1"
              >
                <span className="text-sm text-zinc-400">{label}</span>
                <span className="text-sm text-emerald-400 tabular-nums">
                  -{formatCurrency(amount, currency)}
                </span>
              </div>
            ) : null,
          )}
          <div className="flex items-center justify-between py-1 border-t border-zinc-700 mt-1">
            <span className="text-sm text-zinc-300">Chargeable Income</span>
            <span className="text-sm text-zinc-200 tabular-nums">
              {formatCurrency(breakdown.chargeableIncome, currency)}
            </span>
          </div>
          <Separator className="my-2" />
        </>
      )}

      <p className="text-xs text-zinc-500 pt-2 pb-1">Income Tax</p>
      {breakdown.bracketTaxes.map((bracket, index) => (
        <div key={index} className="flex items-center justify-between py-1">
          <span className="text-sm text-zinc-400">
            {(bracket.rate * 100).toFixed(1).replace(".0", "")}% on{" "}
            {formatCurrency(bracket.min, currency)}
            {bracket.max === Infinity
              ? "+"
              : ` - ${formatCurrency(bracket.max, currency)}`}
          </span>
          <span className="text-sm text-zinc-200 tabular-nums">
            {formatCurrency(bracket.tax, currency)}
          </span>
        </div>
      ))}
      <DeductionRow
        label="Malaysia Income Tax"
        amount={taxes.incomeTax}
        grossSalary={grossSalary}
        currency={currency}
      />

      <Separator className="my-2" />
      <p className="text-xs text-zinc-500 pt-2 pb-1">
        Statutory Contributions
      </p>
      <DeductionRow
        label={`EPF Employee (${(
          breakdown.statutoryContributions.epfEmployeeRate * 100
        )
          .toFixed(1)
          .replace(".0", "")}%)`}
        amount={taxes.epfEmployee}
        grossSalary={grossSalary}
        currency={currency}
      />
      <DeductionRow
        label="SOCSO Employee"
        amount={taxes.socsoEmployee}
        grossSalary={grossSalary}
        currency={currency}
      />
      <DeductionRow
        label="EIS Employee"
        amount={taxes.eisEmployee}
        grossSalary={grossSalary}
        currency={currency}
      />
      {grossSalary / 12 >
        breakdown.statutoryContributions.perkesoMonthlyWageCeiling && (
        <p className="text-xs text-zinc-500 italic mt-1">
          SOCSO/EIS wage base capped at RM
          {breakdown.statutoryContributions.perkesoMonthlyWageCeiling.toLocaleString()}
          /month.
        </p>
      )}

      <div className="flex items-center justify-between py-2 opacity-60">
        <span className="text-sm text-zinc-400">
          EPF Employer (
          {(breakdown.statutoryContributions.epfEmployerRate * 100)
            .toFixed(1)
            .replace(".0", "")}
          %)
        </span>
        <span className="text-sm text-zinc-500 tabular-nums">
          +{formatCurrency(breakdown.statutoryContributions.epfEmployer, currency)}
        </span>
      </div>
      <p className="text-xs text-zinc-500 italic">
        Employer EPF is paid on top of salary and is not deducted from take-home
        pay.
      </p>

      {breakdown.voluntaryContributions.total > 0 && (
        <>
          <Separator className="my-2" />
          <p className="text-xs text-zinc-500 pt-2 pb-1">
            Voluntary Contributions
          </p>
          {breakdown.voluntaryContributions.voluntaryEpf > 0 && (
            <DeductionRow
              label="Voluntary EPF"
              amount={breakdown.voluntaryContributions.voluntaryEpf}
              grossSalary={grossSalary}
              currency={currency}
            />
          )}
          {breakdown.voluntaryContributions.prs > 0 && (
            <DeductionRow
              label="Private Retirement Scheme"
              amount={breakdown.voluntaryContributions.prs}
              grossSalary={grossSalary}
              currency={currency}
            />
          )}
        </>
      )}
    </>
  );
}
