import { Separator } from "@/components/ui/separator";
import {
  isIDBreakdown,
  isIDTaxBreakdown,
} from "@/lib/countries/types";
import { ID_SOURCE_URLS } from "@/lib/countries/id/constants/tax-brackets-2026";
import { formatCurrency, formatPercentage } from "@/lib/format";
import { DeductionRow } from "../deduction-row";
import { ResultNotes } from "./result-notes";
import type { CountryResultBreakdownProps } from "./types";

export function IDResultBreakdown({
  result,
  grossSalary,
  currency,
}: CountryResultBreakdownProps) {
  const { taxes, breakdown } = result;

  if (!isIDTaxBreakdown(taxes) || !isIDBreakdown(breakdown)) {
    return null;
  }

  const voluntaryRows = [
    ["DPLK Pension Deduction", breakdown.voluntaryDeductions.dplk],
    ["Zakat / Religious Donation", breakdown.voluntaryDeductions.zakat],
  ] as const;
  const bpjsEmployer =
    breakdown.bpjs.healthEmployer +
    breakdown.bpjs.jhtEmployer +
    breakdown.bpjs.jpEmployer;

  return (
    <>
      <p className="pb-1 pt-2 text-xs text-zinc-500">
        Indonesia Taxable Income
      </p>
      <div className="flex items-center justify-between py-1">
        <span className="text-sm text-zinc-400">Gross Income</span>
        <span className="text-sm text-zinc-200 tabular-nums">
          {formatCurrency(breakdown.grossIncome, currency)}
        </span>
      </div>
      <div className="flex items-center justify-between py-1">
        <span className="text-sm text-zinc-400">
          Job Expense Deduction (Biaya Jabatan)
        </span>
        <span className="text-sm text-emerald-400 tabular-nums">
          -{formatCurrency(breakdown.jobExpense, currency)}
        </span>
      </div>
      {breakdown.pensionDeduction > 0 ? (
        <div className="flex items-center justify-between py-1">
          <span className="text-sm text-zinc-400">Pension Deduction</span>
          <span className="text-sm text-emerald-400 tabular-nums">
            -{formatCurrency(breakdown.pensionDeduction, currency)}
          </span>
        </div>
      ) : null}
      {voluntaryRows.map(([label, amount]) =>
        amount > 0 ? (
          <div className="flex items-center justify-between py-1" key={label}>
            <span className="text-sm text-zinc-400">{label}</span>
            <span className="text-sm text-emerald-400 tabular-nums">
              -{formatCurrency(amount, currency)}
            </span>
          </div>
        ) : null,
      )}
      <div className="flex items-center justify-between py-1">
        <span className="text-sm text-zinc-400">PTKP Allowance</span>
        <span className="text-sm text-emerald-400 tabular-nums">
          -{formatCurrency(breakdown.ptkp, currency)}
        </span>
      </div>
      <div className="mt-1 flex items-center justify-between border-t border-zinc-700 py-1">
        <span className="text-sm text-zinc-300">Rounded Taxable Income</span>
        <span className="text-sm text-zinc-200 tabular-nums">
          {formatCurrency(breakdown.taxableIncome, currency)}
        </span>
      </div>

      <Separator className="my-2" />
      <p className="pb-1 pt-2 text-xs text-zinc-500">PPh 21 Income Tax</p>
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
      <DeductionRow
        label="PPh 21"
        amount={taxes.incomeTax}
        grossSalary={grossSalary}
        currency={currency}
      />

      <Separator className="my-2" />
      <p className="pb-1 pt-2 text-xs text-zinc-500">
        BPJS Employee Contributions
      </p>
      <DeductionRow
        label="BPJS Kesehatan"
        amount={taxes.bpjsHealth}
        grossSalary={grossSalary}
        currency={currency}
      />
      <DeductionRow
        label="BPJS JHT"
        amount={taxes.bpjsJht}
        grossSalary={grossSalary}
        currency={currency}
      />
      <DeductionRow
        label="BPJS JP"
        amount={taxes.bpjsJp}
        grossSalary={grossSalary}
        currency={currency}
      />
      <div className="flex items-center justify-between py-2 opacity-60">
        <span className="text-sm text-zinc-400">Employer BPJS</span>
        <span className="text-sm text-zinc-500 tabular-nums">
          +{formatCurrency(bpjsEmployer, currency)}
        </span>
      </div>
      <p className="text-xs italic text-zinc-500">
        Employer BPJS is shown for context and is not deducted from take-home
        pay.
      </p>

      <Separator className="my-2" />
      <div className="mt-2 rounded-lg bg-zinc-800/50 p-3">
        <p className="mb-1 text-xs font-medium text-zinc-400">About PTKP</p>
        <p className="text-xs text-zinc-500">
          PTKP is Indonesia&apos;s non-taxable income allowance. This calculator
          applies the selected marital/dependent PTKP status before rounding
          annual taxable income down to the PPh 21 tax base.
        </p>
      </div>
      <ResultNotes countryName="Indonesia" sourceUrls={ID_SOURCE_URLS} />
    </>
  );
}
