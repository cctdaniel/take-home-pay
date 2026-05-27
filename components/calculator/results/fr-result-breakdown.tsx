import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/format";
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
  if (amount <= 0) return null;

  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm text-emerald-400">{label}</span>
      <span className="text-sm text-emerald-400 tabular-nums">
        -{formatCurrency(amount, currency)}
      </span>
    </div>
  );
}

export function FRResultBreakdown({
  result,
  grossSalary,
  currency,
}: CountryResultBreakdownProps) {
  const { taxes, breakdown } = result;

  if (!("type" in taxes) || taxes.type !== "FR" || breakdown.type !== "FR") {
    return null;
  }

  return (
    <>
      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-zinc-400">Tax Household</span>
        <span className="rounded bg-zinc-700/50 px-2 py-1 text-xs font-medium text-zinc-300">
          {breakdown.householdStatus.replace("_", " ")}
        </span>
      </div>
      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-zinc-400">Dependent Children</span>
        <span className="text-sm text-zinc-200 tabular-nums">
          {breakdown.numberOfChildren}
        </span>
      </div>
      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-zinc-400">Family Quotient Parts</span>
        <span className="rounded bg-zinc-700/50 px-2 py-1 text-xs font-medium text-zinc-300">
          {breakdown.taxHouseholdParts} part
          {breakdown.taxHouseholdParts === 1 ? "" : "s"}
        </span>
      </div>
      {breakdown.taxableBenefitsInKind > 0 && (
        <>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-zinc-400">
              Taxable Benefits in Kind
            </span>
            <span className="text-sm text-zinc-200 tabular-nums">
              +{formatCurrency(breakdown.taxableBenefitsInKind, currency)}
            </span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-sm text-zinc-400">
              Income-Tax / Social Gross Base
            </span>
            <span className="text-sm text-zinc-200 tabular-nums">
              {formatCurrency(breakdown.taxableGrossIncome, currency)}
            </span>
          </div>
        </>
      )}

      <Separator className="my-2" />
      <p className="pb-1 pt-2 text-xs text-zinc-500">
        Taxable Income Deductions
      </p>
      {breakdown.impatriateSalaryExemption > 0 && (
        <div className="space-y-1 py-1">
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-400">
              Impatriate Salary Exemption
            </span>
            <span className="text-sm text-emerald-400 tabular-nums">
              -{formatCurrency(breakdown.impatriateSalaryExemption, currency)}
            </span>
          </div>
          {breakdown.frenchReferenceSalary > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-400">
                French Reference Salary Floor
              </span>
              <span className="text-sm text-zinc-300 tabular-nums">
                {formatCurrency(breakdown.frenchReferenceSalary, currency)}
              </span>
            </div>
          )}
        </div>
      )}
      <div className="flex items-center justify-between py-1">
        <span className="text-sm text-zinc-400">
          {breakdown.professionalExpenseMethod === "actual"
            ? "Actual Professional Expenses"
            : "10% Employment Expense Deduction"}
        </span>
        <span className="text-sm text-emerald-400 tabular-nums">
          -{formatCurrency(breakdown.standardDeduction, currency)}
        </span>
      </div>
      {breakdown.impatriateRegime !== "none" &&
        breakdown.impatriateSalaryExemption <= 0 && (
          <p className="py-1 text-xs text-amber-200">
            No impatriate premium exemption is applied because the modeled cap
            is zero after the selected salary and reference-salary floor.
          </p>
        )}
      {breakdown.retirementSavingsDeduction > 0 && (
        <div className="flex items-center justify-between py-1">
          <span className="text-sm text-zinc-400">
            PER Retirement Savings Deduction
          </span>
          <span className="text-sm text-emerald-400 tabular-nums">
            -{formatCurrency(breakdown.retirementSavingsDeduction, currency)}
          </span>
        </div>
      )}

      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-zinc-400">Taxable Income</span>
        <span className="text-sm text-zinc-200 tabular-nums">
          {formatCurrency(result.taxableIncome, currency)}
        </span>
      </div>

      <Separator className="my-2" />
      <p className="pb-1 pt-2 text-xs text-zinc-500">Income Tax</p>
      {breakdown.bracketTaxes.map((bracket) => (
        <DeductionRow
          key={`${bracket.min}-${bracket.max}-${bracket.rate}`}
          label={`${(bracket.rate * 100).toFixed(0)}% quotient bracket`}
          amount={bracket.tax}
          grossSalary={grossSalary}
          currency={currency}
        />
      ))}
      {breakdown.familyQuotientBenefit > 0 && (
        <div className="flex items-center justify-between py-1">
          <span className="text-sm text-zinc-400">
            Family Quotient Benefit
          </span>
          <span className="text-sm text-emerald-400 tabular-nums">
            -{formatCurrency(breakdown.familyQuotientBenefit, currency)}
          </span>
        </div>
      )}
      {breakdown.familyQuotientCapApplied && (
        <div className="flex items-center justify-between py-1">
          <span className="text-sm text-amber-300">
            Family Quotient Cap Applied
          </span>
          <span className="text-sm text-amber-300 tabular-nums">
            {formatCurrency(breakdown.familyQuotientCap, currency)} max benefit
          </span>
        </div>
      )}
      <ReliefRow label="Decote" amount={breakdown.decote} currency={currency} />
      <ReliefRow
        label="General Donation Reduction"
        amount={breakdown.charitableDonationReduction}
        currency={currency}
      />
      <ReliefRow
        label="Low-Tax Collection Threshold"
        amount={breakdown.lowTaxCollectionReduction}
        currency={currency}
      />
      <DeductionRow
        label="Income Tax"
        amount={taxes.incomeTax}
        grossSalary={grossSalary}
        currency={currency}
      />

      <Separator className="my-2" />
      <p className="pb-1 pt-2 text-xs text-zinc-500">Payroll Contributions</p>
      <DeductionRow
        label="Employee Social Contributions"
        amount={taxes.employeeSocialContribution}
        grossSalary={grossSalary}
        currency={currency}
      />
      {(breakdown.retirementSavingsDeduction > 0 ||
        breakdown.charitableDonations > 0) && (
        <>
          {breakdown.retirementSavingsDeduction > 0 && (
            <DeductionRow
              label="PER Retirement Savings"
              amount={breakdown.retirementSavingsDeduction}
              grossSalary={grossSalary}
              currency={currency}
            />
          )}
          {breakdown.charitableDonations > 0 && (
            <DeductionRow
              label="Charitable Donations Paid"
              amount={breakdown.charitableDonations}
              grossSalary={grossSalary}
              currency={currency}
            />
          )}
        </>
      )}
      <ResultNotes
        countryName="France"
        assumptions={breakdown.assumptions}
        sourceUrls={breakdown.sourceUrls}
      />
    </>
  );
}
