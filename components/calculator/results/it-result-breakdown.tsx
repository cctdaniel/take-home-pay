import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/format";
import { DeductionRow } from "../deduction-row";
import { ResultNotes } from "./result-notes";
import type { CountryResultBreakdownProps } from "./types";

export function ITResultBreakdown({
  result,
  grossSalary,
  currency,
}: CountryResultBreakdownProps) {
  const { taxes, breakdown } = result;
  if (!("type" in taxes) || taxes.type !== "IT" || breakdown.type !== "IT") {
    return null;
  }

  return (
    <>
      {breakdown.taxableFringeBenefits > 0 && (
        <>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-zinc-400">
              Taxable Fringe Benefits
            </span>
            <span className="text-sm text-zinc-200 tabular-nums">
              +{formatCurrency(breakdown.taxableFringeBenefits, currency)}
            </span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-sm text-zinc-400">
              IRPEF / INPS Gross Base
            </span>
            <span className="text-sm text-zinc-200 tabular-nums">
              {formatCurrency(breakdown.taxableGrossIncome, currency)}
            </span>
          </div>
        </>
      )}
      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-zinc-400">Taxable Income</span>
        <span className="text-sm text-zinc-200 tabular-nums">
          {formatCurrency(result.taxableIncome, currency)}
        </span>
      </div>
      {(breakdown.impatriateIncomeExemption > 0 ||
        breakdown.pensionDeduction > 0) && (
        <>
          <Separator className="my-2" />
          <p className="text-xs text-zinc-500 pt-2 pb-1">
            Taxable Income Deductions
          </p>
          {breakdown.impatriateIncomeExemption > 0 && (
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-zinc-400">
                Impatriate Income Exemption
              </span>
              <span className="text-sm text-emerald-400 tabular-nums">
                -
                {formatCurrency(
                  breakdown.impatriateIncomeExemption,
                  currency,
                )}
              </span>
            </div>
          )}
          {breakdown.pensionDeduction > 0 && (
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-zinc-400">
                Supplementary Pension Deduction
              </span>
              <span className="text-sm text-emerald-400 tabular-nums">
                -{formatCurrency(breakdown.pensionDeduction, currency)}
              </span>
            </div>
          )}
        </>
      )}
      <Separator className="my-2" />
      <p className="text-xs text-zinc-500 pt-2 pb-1">
        Credits, Tax, and Payroll Deductions
      </p>
      {breakdown.employmentTaxCredit > 0 && (
        <div className="flex items-center justify-between py-1">
          <span className="text-sm text-zinc-400">Employment Tax Credit</span>
          <span className="text-sm text-emerald-400 tabular-nums">
            -{formatCurrency(breakdown.employmentTaxCredit, currency)}
          </span>
        </div>
      )}
      {breakdown.familyCredits.dependentSpouse > 0 && (
        <div className="flex items-center justify-between py-1">
          <span className="text-sm text-zinc-400">
            Dependent Spouse Credit
          </span>
          <span className="text-sm text-emerald-400 tabular-nums">
            -{formatCurrency(breakdown.familyCredits.dependentSpouse, currency)}
          </span>
        </div>
      )}
      {breakdown.familyCredits.eligibleChildren > 0 && (
        <div className="flex items-center justify-between py-1">
          <span className="text-sm text-zinc-400">Eligible Child Credits</span>
          <span className="text-sm text-emerald-400 tabular-nums">
            -{formatCurrency(breakdown.familyCredits.eligibleChildren, currency)}
          </span>
        </div>
      )}
      {breakdown.familyCredits.cohabitingAscendants > 0 && (
        <div className="flex items-center justify-between py-1">
          <span className="text-sm text-zinc-400">
            Cohabiting Ascendant Credits
          </span>
          <span className="text-sm text-emerald-400 tabular-nums">
            -
            {formatCurrency(
              breakdown.familyCredits.cohabitingAscendants,
              currency,
            )}
          </span>
        </div>
      )}
      <DeductionRow
        label="IRPEF"
        amount={taxes.incomeTax}
        grossSalary={grossSalary}
        currency={currency}
      />
      <DeductionRow
        label={`Regional/Municipal Add-ons (${(
          breakdown.additionalIncomeTax.rate * 100
        ).toFixed(2)}%)`}
        amount={taxes.additionalIncomeTax}
        grossSalary={grossSalary}
        currency={currency}
      />
      <DeductionRow
        label="Employee INPS"
        amount={taxes.employeeSocialContribution}
        grossSalary={grossSalary}
        currency={currency}
      />
      {breakdown.pensionContribution > 0 && (
        <DeductionRow
          label="Supplementary Pension"
          amount={breakdown.pensionContribution}
          grossSalary={grossSalary}
          currency={currency}
        />
      )}
      <ResultNotes
        countryName="Italy"
        assumptions={breakdown.assumptions}
        sourceUrls={breakdown.sourceUrls}
      />
    </>
  );
}
