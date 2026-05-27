import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/format";
import {
  isStandardCountryBreakdown,
  isStandardCountryTaxBreakdown,
} from "@/lib/countries/shared/standard-country";
import { DeductionRow } from "../deduction-row";
import { ResultNotes } from "./result-notes";
import type { CountryResultBreakdownProps } from "./types";
import type { RWBreakdown, RWTaxBreakdown } from "@/lib/countries/rw/types";
import type {
  CountrySpecificBreakdown,
  TaxBreakdown,
} from "@/lib/countries/types";

function isRWTaxBreakdown(taxes: TaxBreakdown): taxes is RWTaxBreakdown {
  return (
    isStandardCountryTaxBreakdown(taxes) &&
    taxes.type === "RW" &&
    "cashIncomeTax" in taxes &&
    "benefitsInKindTaxEffect" in taxes
  );
}

function isRWBreakdown(
  breakdown: CountrySpecificBreakdown,
): breakdown is RWBreakdown {
  return (
    isStandardCountryBreakdown(breakdown) &&
    breakdown.type === "RW" &&
    "cashSalary" in breakdown &&
    "taxableBenefitsInKind" in breakdown
  );
}

export function RWResultBreakdown({
  result,
  grossSalary,
  currency,
}: CountryResultBreakdownProps) {
  const { taxes, breakdown } = result;

  if (!isRWTaxBreakdown(taxes) || !isRWBreakdown(breakdown)) {
    return null;
  }

  const taxableBenefits = breakdown.taxableBenefitsInKind;

  return (
    <>
      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-zinc-400">Cash Taxable Income</span>
        <span className="text-sm text-zinc-200 tabular-nums">
          {formatCurrency(breakdown.cashTaxableIncome, currency)}
        </span>
      </div>
      {taxableBenefits.total > 0 ? (
        <>
          <div className="flex items-center justify-between py-1">
            <span className="text-sm text-zinc-400">
              Taxable benefits in kind
            </span>
            <span className="text-sm text-zinc-200 tabular-nums">
              {formatCurrency(taxableBenefits.total, currency)}
            </span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-sm text-zinc-400">Total PAYE base</span>
            <span className="text-sm text-zinc-200 tabular-nums">
              {formatCurrency(result.taxableIncome, currency)}
            </span>
          </div>
        </>
      ) : null}

      <Separator className="my-2" />
      <p className="text-xs text-zinc-500 pt-2 pb-1">
        Rwanda RSSB Salary Bases
      </p>
      <div className="flex items-center justify-between py-1">
        <span className="text-sm text-zinc-400">
          Pension and maternity salary
        </span>
        <span className="text-sm text-zinc-200 tabular-nums">
          {formatCurrency(breakdown.rssbContributionSalaryMonthly, currency)}
        </span>
      </div>
      {breakdown.rssbMedicalBasicSalaryMonthly > 0 ? (
        <div className="flex items-center justify-between py-1">
          <span className="text-sm text-zinc-400">
            Medical basic salary
          </span>
          <span className="text-sm text-zinc-200 tabular-nums">
            {formatCurrency(
              breakdown.rssbMedicalBasicSalaryMonthly,
              currency,
            )}
          </span>
        </div>
      ) : null}

      <Separator className="my-2" />
      <p className="text-xs text-zinc-500 pt-2 pb-1">
        Tax and Payroll Deductions
      </p>
      <DeductionRow
        label={breakdown.incomeTaxName}
        amount={taxes.incomeTax}
        grossSalary={grossSalary}
        currency={currency}
      />
      {taxes.benefitsInKindTaxEffect > 0 ? (
        <div className="flex items-center justify-between py-1">
          <span className="text-sm text-zinc-400">
            PAYE increase from benefits in kind
          </span>
          <span className="text-sm text-zinc-200 tabular-nums">
            {formatCurrency(taxes.benefitsInKindTaxEffect, currency)}
          </span>
        </div>
      ) : null}
      {breakdown.mandatoryContributions.map((contribution) => (
        <DeductionRow
          key={contribution.name}
          label={contribution.name}
          amount={contribution.amount}
          grossSalary={grossSalary}
          currency={currency}
        />
      ))}
      <ResultNotes
        countryName="Rwanda"
        assumptions={breakdown.assumptions}
        exclusions={breakdown.modeledExclusions}
        sourceUrls={breakdown.sourceUrls}
      />
    </>
  );
}
