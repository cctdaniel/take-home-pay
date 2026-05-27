import { Separator } from "@/components/ui/separator";
import {
  isTWBreakdown,
  isTWTaxBreakdown,
} from "@/lib/countries/types";
import { TW_SOURCE_URLS } from "@/lib/countries/tw/constants/tax-brackets-2026";
import { formatCurrency, formatPercentage } from "@/lib/format";
import { DeductionRow } from "../deduction-row";
import { ResultNotes } from "./result-notes";
import type { CountryResultBreakdownProps } from "./types";

export function TWResultBreakdown({
  result,
  grossSalary,
  currency,
}: CountryResultBreakdownProps) {
  const { taxes, breakdown } = result;

  if (!isTWTaxBreakdown(taxes) || !isTWBreakdown(breakdown)) {
    return null;
  }

  const deductionRows = [
    ["Standard Deduction", breakdown.deductions.standardDeduction],
    ["Itemized Deduction", breakdown.deductions.itemizedDeduction],
    ["Personal Exemption", breakdown.deductions.personalExemption],
    ["Dependent Exemption", breakdown.deductions.dependentExemption],
    [
      "Elderly Lineal Ascendant Exemption",
      breakdown.deductions.elderlyLinealAscendantExemption,
    ],
    ["Special Salary Deduction", breakdown.deductions.specialSalaryDeduction],
    ["Disability Deduction", breakdown.deductions.disabilityDeduction],
    [
      "Savings and Investment Deduction",
      breakdown.deductions.savingsAndInvestmentDeduction,
    ],
    ["College Tuition Deduction", breakdown.deductions.collegeTuitionDeduction],
    [
      "Preschool Children Deduction",
      breakdown.deductions.preschoolChildrenDeduction,
    ],
    ["Long-Term Care Deduction", breakdown.deductions.longTermCareDeduction],
    ["Rent Deduction", breakdown.deductions.rentDeduction],
    [
      "Basic Living Expense Difference",
      breakdown.deductions.basicLivingExpenseDifference,
    ],
    ["Charitable Donations", breakdown.deductions.charitableDonations],
    ["Insurance Premiums", breakdown.deductions.insurancePremiums],
    [
      "Medical and Maternity Expenses",
      breakdown.deductions.medicalAndMaternityExpenses,
    ],
    ["Mortgage Interest", breakdown.deductions.mortgageInterest],
    ["Calamity Losses", breakdown.deductions.calamityLosses],
    [
      "Voluntary Pension Contribution",
      breakdown.deductions.voluntaryPensionContribution,
    ],
  ] as const;

  return (
    <>
      {breakdown.goldCard?.isApplied ? (
        <>
          <p className="pb-1 pt-2 text-xs text-zinc-500">
            Taiwan Gold Card Benefit
          </p>
          <div className="flex items-center justify-between py-1">
            <span className="text-sm text-zinc-400">Exempt Income</span>
            <span className="text-sm text-emerald-400 tabular-nums">
              -{formatCurrency(breakdown.goldCard.exemptionAmount, currency)}
            </span>
          </div>
          <Separator className="my-2" />
        </>
      ) : null}

      <p className="pb-1 pt-2 text-xs text-zinc-500">
        Deductions and Exemptions
      </p>
      <p className="mb-2 text-xs italic text-zinc-500">
        Deduction method applied: {breakdown.deductions.deductionMethodApplied}
      </p>
      {deductionRows.map(([label, amount]) =>
        amount > 0 ? (
          <div className="flex items-center justify-between py-1" key={label}>
            <span className="text-sm text-zinc-400">{label}</span>
            <span className="text-sm text-emerald-400 tabular-nums">
              -{formatCurrency(amount, currency)}
            </span>
          </div>
        ) : null,
      )}
      <div className="mt-1 flex items-center justify-between border-t border-zinc-700 py-1">
        <span className="text-sm text-zinc-300">Taxable Income</span>
        <span className="text-sm text-zinc-200 tabular-nums">
          {formatCurrency(breakdown.taxableIncome, currency)}
        </span>
      </div>

      <Separator className="my-2" />
      <p className="pb-1 pt-2 text-xs text-zinc-500">
        Comprehensive Income Tax
      </p>
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
        label="Income Tax"
        amount={taxes.incomeTax}
        grossSalary={grossSalary}
        currency={currency}
      />

      <Separator className="my-2" />
      <p className="pb-1 pt-2 text-xs text-zinc-500">
        Social Insurance
      </p>
      <DeductionRow
        label="Labor Insurance"
        amount={taxes.laborInsurance}
        grossSalary={grossSalary}
        currency={currency}
      />
      <DeductionRow
        label="Employment Insurance"
        amount={taxes.employmentInsurance}
        grossSalary={grossSalary}
        currency={currency}
      />
      <DeductionRow
        label="National Health Insurance"
        amount={taxes.nhi}
        grossSalary={grossSalary}
        currency={currency}
      />
      <p className="text-xs italic text-zinc-500">
        NHI, labour insurance, and employment insurance use Taiwan monthly
        insured-salary caps shown in the calculator assumptions.
      </p>
      <ResultNotes
        countryName="Taiwan"
        assumptions={[
          "Comprehensive income tax uses the selected resident/non-resident mode, exemptions, standard or itemized deductions, special deductions, and modeled Gold Card relief where selected.",
          "Labor insurance, employment insurance, and NHI are calculated from the modeled monthly insured salary caps.",
        ]}
        sourceUrls={Object.values(TW_SOURCE_URLS)}
      />
    </>
  );
}
