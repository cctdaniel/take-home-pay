import { Separator } from "@/components/ui/separator";
import {
  isHKBreakdown,
  isHKTaxBreakdown,
} from "@/lib/countries/types";
import { HK_SOURCE_URLS } from "@/lib/countries/hk/constants/tax-brackets-2026";
import { formatCurrency, formatPercentage } from "@/lib/format";
import { DeductionRow } from "../deduction-row";
import { ResultNotes } from "./result-notes";
import type { CountryResultBreakdownProps } from "./types";

export function HKResultBreakdown({
  result,
  grossSalary,
  currency,
}: CountryResultBreakdownProps) {
  const { taxes, breakdown } = result;

  if (!isHKTaxBreakdown(taxes) || !isHKBreakdown(breakdown)) {
    return null;
  }

  const deductionRows = [
    ["MPF Mandatory Contributions", breakdown.deductions.mandatoryMpf],
    ["MPF TVC + QDAP", breakdown.deductions.voluntaryMpfAnnuity],
    ["Self-education Expenses", breakdown.deductions.selfEducation],
    ["VHIS Premiums", breakdown.deductions.vhisPremiums],
    ["Domestic Rent", breakdown.deductions.domesticRent],
    ["Home Loan Interest", breakdown.deductions.homeLoanInterest],
    ["Elderly Residential Care", breakdown.deductions.elderlyResidentialCare],
    [
      "Assisted Reproductive Services",
      breakdown.deductions.assistedReproductiveServices,
    ],
    ["Approved Charitable Donations", breakdown.deductions.charitableDonations],
  ] as const;
  const allowanceRows = [
    ["Basic Allowance", breakdown.allowances.basic],
    ["Married Person's Allowance", breakdown.allowances.married],
    ["Single Parent Allowance", breakdown.allowances.singleParent],
    ["Child Allowance", breakdown.allowances.child],
    ["Newborn Child Allowance", breakdown.allowances.newbornChild],
    ["Dependent Parent/Grandparent", breakdown.allowances.dependentParent],
    [
      "Dependent Parent/Grandparent Living With You",
      breakdown.allowances.dependentParentLivingWith,
    ],
    [
      "Dependent Parent/Grandparent Age 55-59",
      breakdown.allowances.dependentParentAged55To59,
    ],
    [
      "Age 55-59 Parent/Grandparent Living With You",
      breakdown.allowances.dependentParentAged55To59LivingWith,
    ],
    ["Dependent Brother/Sister", breakdown.allowances.dependentSibling],
    ["Disabled Dependent Allowance", breakdown.allowances.disabledDependent],
    ["Personal Disability Allowance", breakdown.allowances.disability],
  ] as const;

  return (
    <>
      {breakdown.housingRentalValue > 0 ? (
        <div className="flex items-center justify-between py-1">
          <span className="text-sm text-zinc-400">
            Employer-Provided Housing Rental Value
          </span>
          <span className="text-sm text-zinc-200 tabular-nums">
            +{formatCurrency(breakdown.housingRentalValue, currency)}
          </span>
        </div>
      ) : null}

      <p className="pb-1 pt-2 text-xs text-zinc-500">
        Allowances and Deductions
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
      {allowanceRows.map(([label, amount]) =>
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
        <span className="text-sm text-zinc-300">Net Chargeable Income</span>
        <span className="text-sm text-zinc-200 tabular-nums">
          {formatCurrency(breakdown.netChargeableIncome, currency)}
        </span>
      </div>

      <Separator className="my-2" />
      <p className="pb-1 pt-2 text-xs text-zinc-500">Salaries Tax Comparison</p>
      <div className="flex items-center justify-between py-1">
        <span className="text-sm text-zinc-400">Progressive Tax</span>
        <span className="text-sm text-zinc-300 tabular-nums">
          {formatCurrency(breakdown.taxComparison.progressiveTax, currency)}
        </span>
      </div>
      <div className="flex items-center justify-between py-1">
        <span className="text-sm text-zinc-400">
          Standard Rate Tax ({formatPercentage(breakdown.taxComparison.standardRate)})
        </span>
        <span className="text-sm text-zinc-300 tabular-nums">
          {formatCurrency(breakdown.taxComparison.standardTax, currency)}
        </span>
      </div>
      <DeductionRow
        label={
          breakdown.taxComparison.taxReduction > 0
            ? "Salaries Tax After Reduction"
            : "Salaries Tax"
        }
        amount={taxes.incomeTax}
        grossSalary={grossSalary}
        currency={currency}
      />
      {breakdown.taxComparison.taxReduction > 0 ? (
        <p className="mt-1 text-xs italic text-zinc-500">
          Tax reduction applied:{" "}
          {formatCurrency(breakdown.taxComparison.taxReduction, currency)}
        </p>
      ) : null}

      <Separator className="my-2" />
      <p className="pb-1 pt-2 text-xs text-zinc-500">MPF Contributions</p>
      <DeductionRow
        label="MPF (Employee)"
        amount={taxes.mpfEmployee}
        grossSalary={grossSalary}
        currency={currency}
      />
      <p className="text-xs italic text-zinc-500">
        Employee MPF uses {formatPercentage(breakdown.mpf.rate)} of relevant
        income within the monthly minimum and maximum MPF thresholds.
      </p>

      <ResultNotes
        countryName="Hong Kong"
        assumptions={[
          "Salaries tax compares progressive rates against the standard-rate method and uses the lower tax after modeled allowances, deductions, and any one-off reduction.",
          "MPF employee contributions are modeled from relevant income and the statutory monthly minimum and maximum thresholds.",
          "Employer-provided housing is modeled by adding the selected rental value percentage to assessable income.",
        ]}
        exclusions={[
          "Personal assessment, provisional-tax cash timing, exact offshore-source claims, and employer benefit valuation disputes require separate filing facts.",
        ]}
        sourceUrls={HK_SOURCE_URLS}
      />
    </>
  );
}
