import { Separator } from "@/components/ui/separator";
import {
  isNLBreakdown,
  isNLTaxBreakdown,
} from "@/lib/countries/types";
import { NL_SOURCE_URLS } from "@/lib/countries/nl/constants/tax-brackets-2026";
import { formatCurrency, formatPercentage } from "@/lib/format";
import { DeductionRow } from "../deduction-row";
import { ResultNotes } from "./result-notes";
import type { CountryResultBreakdownProps } from "./types";

export function NLResultBreakdown({
  result,
  grossSalary,
  currency,
}: CountryResultBreakdownProps) {
  const { taxes, breakdown } = result;

  if (!isNLTaxBreakdown(taxes) || !isNLBreakdown(breakdown)) {
    return null;
  }

  return (
    <>
      {breakdown.thirtyPercentRulingApplied ? (
        <>
          <p className="pb-1 pt-2 text-xs text-zinc-500">30% Ruling</p>
          <div className="flex items-center justify-between py-1">
            <span className="text-sm text-zinc-400">Tax-Exempt Allowance</span>
            <span className="text-sm text-emerald-400 tabular-nums">
              -{formatCurrency(breakdown.taxExemptAllowance, currency)}
            </span>
          </div>
          {breakdown.thirtyPercentSalaryNorm ? (
            <p className="text-xs italic text-zinc-500">
              Salary norm checked against{" "}
              {formatCurrency(breakdown.thirtyPercentSalaryNorm, currency)}.
            </p>
          ) : null}
          <Separator className="my-2" />
        </>
      ) : null}

      <p className="pb-1 pt-2 text-xs text-zinc-500">
        Dutch Taxable Income
      </p>
      <div className="flex items-center justify-between py-1">
        <span className="text-sm text-zinc-400">
          Payroll Tax Base Before Ruling
        </span>
        <span className="text-sm text-zinc-200 tabular-nums">
          {formatCurrency(breakdown.payrollTaxBaseBeforeRuling, currency)}
        </span>
      </div>
      {breakdown.employeePensionPremiumAnnual > 0 ? (
        <div className="flex items-center justify-between py-1">
          <span className="text-sm text-zinc-400">
            Employee Pension Premium
          </span>
          <span className="text-sm text-emerald-400 tabular-nums">
            -{formatCurrency(breakdown.employeePensionPremiumAnnual, currency)}
          </span>
        </div>
      ) : null}
      {breakdown.personalAnnuityContribution > 0 ? (
        <div className="flex items-center justify-between py-1">
          <span className="text-sm text-zinc-400">
            Lijfrente / Annuity Deduction
          </span>
          <span className="text-sm text-emerald-400 tabular-nums">
            -{formatCurrency(breakdown.personalAnnuityContribution, currency)}
          </span>
        </div>
      ) : null}
      <div className="mt-1 flex items-center justify-between border-t border-zinc-700 py-1">
        <span className="text-sm text-zinc-300">Taxable Income</span>
        <span className="text-sm text-zinc-200 tabular-nums">
          {formatCurrency(breakdown.taxableIncome, currency)}
        </span>
      </div>

      <Separator className="my-2" />
      <p className="pb-1 pt-2 text-xs text-zinc-500">Box 1 Tax and Credits</p>
      <DeductionRow
        label="Income Tax"
        amount={taxes.incomeTax}
        grossSalary={grossSalary}
        currency={currency}
      />
      <DeductionRow
        label="National Insurance Contributions"
        amount={taxes.socialSecurityTax}
        grossSalary={grossSalary}
        currency={currency}
      />
      <div className="space-y-1 pt-1">
        {breakdown.bracketTaxes.map((bracket) => (
          <div
            className="flex items-center justify-between py-1"
            key={`${bracket.min}-${bracket.max}-${bracket.rate}`}
          >
            <span className="text-xs text-zinc-500">
              {formatPercentage(bracket.rate)} above{" "}
              {formatCurrency(bracket.min, currency)}
            </span>
            <span className="text-xs text-zinc-400 tabular-nums">
              {formatCurrency(bracket.tax, currency)}
            </span>
          </div>
        ))}
      </div>
      {breakdown.taxCredits.totalCredits > 0 ? (
        <div className="mt-1 flex items-center justify-between border-t border-zinc-700/50 py-1">
          <span className="text-sm text-emerald-400">
            General/Labour/IACK Credits
          </span>
          <span className="text-sm text-emerald-400 tabular-nums">
            -{formatCurrency(breakdown.taxCredits.totalCredits, currency)}
          </span>
        </div>
      ) : null}

      <Separator className="my-2" />
      <p className="text-xs text-zinc-500">
        Social security covers AOW, Anw, and Wlz up to the Dutch annual
        contribution ceiling. IACK appears only when the selected child and
        partner-income assumptions make it eligible.
      </p>

      <ResultNotes
        countryName="Netherlands"
        assumptions={[
          "Box 1 payroll tax combines modeled income tax, AOW, Anw, and Wlz national-insurance components using the 2026 Belastingdienst rates.",
          "The 30% ruling applies only when selected and when the entered salary meets the modeled salary norm; the tax-free allowance is capped by the 2026 published cap.",
          "Employee pension premium and lijfrente inputs are deducted before the Box 1 tax base where entered.",
        ]}
        exclusions={[
          "Exact payroll withholding tables, Box 2/Box 3 income, expat-ruling proof, employer plan eligibility, and partner-income allocation beyond the shown IACK assumptions require separate facts.",
        ]}
        sourceUrls={NL_SOURCE_URLS}
      />
    </>
  );
}
