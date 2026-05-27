import { Separator } from "@/components/ui/separator";
import {
  isPTBreakdown,
  isPTTaxBreakdown,
} from "@/lib/countries/types";
import { PT_SOURCE_URLS } from "@/lib/countries/pt/constants/tax-brackets-2026";
import { formatCurrency, formatPercentage } from "@/lib/format";
import { DeductionRow } from "../deduction-row";
import { ResultNotes } from "./result-notes";
import type { CountryResultBreakdownProps } from "./types";

export function PTResultBreakdown({
  result,
  grossSalary,
  currency,
}: CountryResultBreakdownProps) {
  const { taxes, breakdown } = result;

  if (!isPTTaxBreakdown(taxes) || !isPTBreakdown(breakdown)) {
    return null;
  }

  return (
    <>
      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-zinc-400">Tax Residency</span>
        <span className="rounded bg-zinc-700/50 px-2 py-1 text-xs font-medium text-zinc-300">
          {breakdown.isResident ? "Resident" : "Non-resident"}
          {breakdown.isNhr2 ? " + NHR 2.0" : ""}
        </span>
      </div>

      {breakdown.irsJovem.applies ? (
        <>
          <p className="pb-1 pt-2 text-xs text-zinc-500">IRS Jovem</p>
          <div className="flex items-center justify-between py-1">
            <span className="text-sm text-zinc-400">
              Exempt Income ({formatPercentage(breakdown.irsJovem.exemptionRate)})
            </span>
            <span className="text-sm text-emerald-400 tabular-nums">
              -{formatCurrency(breakdown.irsJovem.exemptIncome, currency)}
            </span>
          </div>
          <Separator className="my-2" />
        </>
      ) : null}

      <p className="pb-1 pt-2 text-xs text-zinc-500">
        IRS Deductions and Credits
      </p>
      <div className="flex items-center justify-between py-1">
        <span className="text-sm text-zinc-400">Specific Deduction</span>
        <span className="text-sm text-emerald-400 tabular-nums">
          -{formatCurrency(breakdown.specificDeduction, currency)}
        </span>
      </div>
      {breakdown.dependentDeduction > 0 ? (
        <div className="flex items-center justify-between py-1">
          <span className="text-sm text-zinc-400">
            Dependent Deduction ({breakdown.numberOfDependents})
          </span>
          <span className="text-sm text-emerald-400 tabular-nums">
            -{formatCurrency(breakdown.dependentDeduction, currency)}
          </span>
        </div>
      ) : null}
      {breakdown.pprContribution > 0 ? (
        <div className="flex items-center justify-between py-1">
          <span className="text-sm text-zinc-400">PPR Tax Credit</span>
          <span className="text-sm text-emerald-400 tabular-nums">
            -{formatCurrency(breakdown.pprTaxCredit, currency)}
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
      <p className="pb-1 pt-2 text-xs text-zinc-500">Portugal Income Tax</p>
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
        label="IRS"
        amount={taxes.incomeTax}
        grossSalary={grossSalary}
        currency={currency}
      />
      {taxes.solidaritySurcharge > 0 ? (
        <DeductionRow
          label="Solidarity Surcharge"
          amount={taxes.solidaritySurcharge}
          grossSalary={grossSalary}
          currency={currency}
        />
      ) : null}
      {breakdown.jointFilingSavings && breakdown.jointFilingSavings > 0 ? (
        <p className="mt-1 text-xs italic text-emerald-400">
          Joint filing savings modeled:{" "}
          {formatCurrency(breakdown.jointFilingSavings, currency)}
        </p>
      ) : null}
      {breakdown.nhr2TaxSavings && breakdown.nhr2TaxSavings > 0 ? (
        <p className="mt-1 text-xs italic text-emerald-400">
          NHR 2.0 savings vs standard regime:{" "}
          {formatCurrency(breakdown.nhr2TaxSavings, currency)}
        </p>
      ) : null}

      <Separator className="my-2" />
      <p className="pb-1 pt-2 text-xs text-zinc-500">Social Security</p>
      <DeductionRow
        label="Employee Social Security"
        amount={taxes.socialSecurity}
        grossSalary={grossSalary}
        currency={currency}
      />
      <div className="flex items-center justify-between py-2 opacity-60">
        <span className="text-sm text-zinc-400">
          Employer Social Security
        </span>
        <span className="text-sm text-zinc-500 tabular-nums">
          +{formatCurrency(breakdown.employerSocialSecurity, currency)}
        </span>
      </div>

      <ResultNotes
        countryName="Portugal"
        assumptions={[
          "Resident employment uses the modeled 2026 IRS brackets, specific employment deduction, social-security employee contribution, solidarity surcharge, dependent deduction, and PPR credit where entered.",
          "IRS Jovem is applied only when selected and capped by the modeled 55 IAS limit and selected benefit year.",
          "NHR 2.0 and non-resident salary modes use the selected regime rates instead of ordinary resident employment brackets where applicable.",
        ]}
        exclusions={[
          "Final Portal das Finanças return expense categories, withholding table timing, treaty positions, autonomous taxation, and self-employment category B details require separate filing facts.",
        ]}
        sourceUrls={PT_SOURCE_URLS}
      />
    </>
  );
}
