import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/format";
import {
  isStandardCountryBreakdown,
  isStandardCountryTaxBreakdown,
} from "@/lib/countries/shared/standard-country";
import { DeductionRow } from "../deduction-row";
import { ResultNotes } from "./result-notes";
import type { CountryResultBreakdownProps } from "./types";
import type { KEBreakdown, KETaxBreakdown } from "@/lib/countries/ke/types";
import type {
  CountrySpecificBreakdown,
  TaxBreakdown,
} from "@/lib/countries/types";

function isKETaxBreakdown(taxes: TaxBreakdown): taxes is KETaxBreakdown {
  return (
    isStandardCountryTaxBreakdown(taxes) &&
    taxes.type === "KE" &&
    "cashIncomeTax" in taxes &&
    "nonCashBenefitTaxEffect" in taxes
  );
}

function isKEBreakdown(
  breakdown: CountrySpecificBreakdown,
): breakdown is KEBreakdown {
  return (
    isStandardCountryBreakdown(breakdown) &&
    breakdown.type === "KE" &&
    "cashTaxableIncome" in breakdown &&
    "taxableNonCashBenefits" in breakdown
  );
}

export function KEResultBreakdown({
  result,
  grossSalary,
  currency,
}: CountryResultBreakdownProps) {
  const { taxes, breakdown } = result;

  if (!isKETaxBreakdown(taxes) || !isKEBreakdown(breakdown)) {
    return null;
  }

  const appliedDeductions = breakdown.deductions.filter(
    (deduction) => deduction.amount > 0,
  );
  const appliedVoluntaryDeductions = breakdown.voluntaryContributions.filter(
    (contribution) =>
      contribution.amount > 0 &&
      (contribution.cashFlowTreatment !== "taxOnly" ||
        contribution.taxTreatment === "deduction"),
  );

  return (
    <>
      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-zinc-400">Cash Taxable Income</span>
        <span className="text-sm text-zinc-200 tabular-nums">
          {formatCurrency(breakdown.cashTaxableIncome, currency)}
        </span>
      </div>
      {breakdown.taxableNonCashBenefits > 0 ? (
        <>
          <div className="flex items-center justify-between py-1">
            <span className="text-sm text-zinc-400">
              Taxable non-cash benefits
            </span>
            <span className="text-sm text-zinc-200 tabular-nums">
              {formatCurrency(breakdown.taxableNonCashBenefits, currency)}
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

      {(appliedDeductions.length > 0 ||
        appliedVoluntaryDeductions.length > 0) && (
        <>
          <Separator className="my-2" />
          <p className="text-xs text-zinc-500 pt-2 pb-1">
            Allowances and Contributions
          </p>
          {appliedDeductions.map((deduction) => (
            <div
              className="flex items-center justify-between py-1"
              key={deduction.name}
            >
              <span className="text-sm text-zinc-400">{deduction.name}</span>
              <span className="text-sm text-emerald-400 tabular-nums">
                -{formatCurrency(deduction.amount, currency)}
              </span>
            </div>
          ))}
          {appliedVoluntaryDeductions.map((contribution) => (
            <div
              className="flex items-center justify-between py-1"
              key={contribution.key}
            >
              <span className="text-sm text-zinc-400">
                {contribution.name}
              </span>
              <span className="text-sm text-emerald-400 tabular-nums">
                -{formatCurrency(contribution.amount, currency)}
              </span>
            </div>
          ))}
        </>
      )}

      {breakdown.taxCredits.length > 0 ? (
        <>
          <Separator className="my-2" />
          <p className="text-xs text-zinc-500 pt-2 pb-1">Tax Credits</p>
          {breakdown.taxCredits.map((credit) => (
            <div
              className="flex items-center justify-between py-1"
              key={credit.name}
            >
              <span className="text-sm text-zinc-400">{credit.name}</span>
              <span className="text-sm text-emerald-400 tabular-nums">
                -{formatCurrency(credit.amount, currency)}
              </span>
            </div>
          ))}
        </>
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
      {taxes.nonCashBenefitTaxEffect > 0 ? (
        <div className="flex items-center justify-between py-1">
          <span className="text-sm text-zinc-400">
            PAYE increase from non-cash benefits
          </span>
          <span className="text-sm text-zinc-200 tabular-nums">
            {formatCurrency(taxes.nonCashBenefitTaxEffect, currency)}
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
        countryName="Kenya"
        assumptions={breakdown.assumptions}
        exclusions={breakdown.modeledExclusions}
        sourceUrls={breakdown.sourceUrls}
      />
    </>
  );
}
