import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/format";
import {
  isStandardCountryBreakdown,
  isStandardCountryTaxBreakdown,
} from "@/lib/countries/shared/standard-country";
import { DeductionRow } from "../deduction-row";
import { ResultNotes } from "./result-notes";
import type { CountryResultBreakdownProps } from "./types";
import type { KHBreakdown, KHTaxBreakdown } from "@/lib/countries/kh/types";
import type {
  CountrySpecificBreakdown,
  TaxBreakdown,
} from "@/lib/countries/types";

function isKHTaxBreakdown(taxes: TaxBreakdown): taxes is KHTaxBreakdown {
  return (
    isStandardCountryTaxBreakdown(taxes) &&
    taxes.type === "KH" &&
    "fringeBenefitTax" in taxes
  );
}

function isKHBreakdown(
  breakdown: CountrySpecificBreakdown,
): breakdown is KHBreakdown {
  return (
    isStandardCountryBreakdown(breakdown) &&
    breakdown.type === "KH" &&
    "taxResidency" in breakdown &&
    "taxableFringeBenefits" in breakdown
  );
}

export function KHResultBreakdown({
  result,
  grossSalary,
  currency,
}: CountryResultBreakdownProps) {
  const { taxes, breakdown } = result;

  if (!isKHTaxBreakdown(taxes) || !isKHBreakdown(breakdown)) {
    return null;
  }

  const appliedDeductions = breakdown.deductions.filter(
    (deduction) => deduction.amount > 0,
  );

  return (
    <>
      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-zinc-400">Cash Taxable Salary</span>
        <span className="text-sm text-zinc-200 tabular-nums">
          {formatCurrency(
            Math.max(0, result.taxableIncome - breakdown.taxableFringeBenefits),
            currency,
          )}
        </span>
      </div>
      {breakdown.taxableFringeBenefits > 0 ? (
        <div className="flex items-center justify-between py-1">
          <span className="text-sm text-zinc-400">
            Taxable fringe benefits
          </span>
          <span className="text-sm text-zinc-200 tabular-nums">
            {formatCurrency(breakdown.taxableFringeBenefits, currency)}
          </span>
        </div>
      ) : null}

      {(breakdown.personalAllowance > 0 || appliedDeductions.length > 0) && (
        <>
          <Separator className="my-2" />
          <p className="text-xs text-zinc-500 pt-2 pb-1">
            Allowances and Contributions
          </p>
          {breakdown.personalAllowance > 0 ? (
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-zinc-400">
                Dependent family allowance
              </span>
              <span className="text-sm text-emerald-400 tabular-nums">
                -{formatCurrency(breakdown.personalAllowance, currency)}
              </span>
            </div>
          ) : null}
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
        </>
      )}

      <Separator className="my-2" />
      <p className="text-xs text-zinc-500 pt-2 pb-1">
        Cambodia NSSF Wage Base
      </p>
      <div className="flex items-center justify-between py-1">
        <span className="text-sm text-zinc-400">Monthly NSSF wage</span>
        <span className="text-sm text-zinc-200 tabular-nums">
          {formatCurrency(breakdown.nssfMonthlyWage, currency)}
        </span>
      </div>
      <div className="flex items-center justify-between py-1">
        <span className="text-sm text-zinc-400">
          Health care assumed wage
        </span>
        <span className="text-sm text-zinc-200 tabular-nums">
          {formatCurrency(breakdown.nssfHealthCareBaseMonthly, currency)}
        </span>
      </div>
      <div className="flex items-center justify-between py-1">
        <span className="text-sm text-zinc-400">Pension base wage</span>
        <span className="text-sm text-zinc-200 tabular-nums">
          {formatCurrency(breakdown.nssfPensionBaseMonthly, currency)}
        </span>
      </div>

      <Separator className="my-2" />
      <p className="text-xs text-zinc-500 pt-2 pb-1">
        Tax and Payroll Deductions
      </p>
      <DeductionRow
        label={
          breakdown.taxResidency === "nonResident"
            ? "Non-resident salary tax"
            : breakdown.incomeTaxName
        }
        amount={taxes.incomeTax - taxes.fringeBenefitTax}
        grossSalary={grossSalary}
        currency={currency}
      />
      {taxes.fringeBenefitTax > 0 ? (
        <DeductionRow
          label="Fringe benefit tax"
          amount={taxes.fringeBenefitTax}
          grossSalary={grossSalary}
          currency={currency}
        />
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
        countryName="Cambodia"
        assumptions={breakdown.assumptions}
        exclusions={breakdown.modeledExclusions}
        sourceUrls={breakdown.sourceUrls}
      />
    </>
  );
}
