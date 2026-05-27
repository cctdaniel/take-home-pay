import { Separator } from "@/components/ui/separator";
import {
  isSGBreakdown,
  isSGTaxBreakdown,
} from "@/lib/countries/types";
import { SG_SOURCE_URLS } from "@/lib/countries/sg/constants/tax-brackets-2026";
import { formatCurrency, formatPercentage } from "@/lib/format";
import { DeductionRow } from "../deduction-row";
import { ResultNotes } from "./result-notes";
import type { CountryResultBreakdownProps } from "./types";

export function SGResultBreakdown({
  result,
  grossSalary,
  currency,
}: CountryResultBreakdownProps) {
  const { taxes, breakdown } = result;

  if (!isSGTaxBreakdown(taxes) || !isSGBreakdown(breakdown)) {
    return null;
  }

  const reliefRows = [
    ["Earned Income Relief", breakdown.taxReliefs.earnedIncomeRelief],
    ["CPF Relief", breakdown.taxReliefs.cpfRelief],
    ["SRS Relief", breakdown.taxReliefs.srsRelief],
    ["CPF Top-up Relief", breakdown.taxReliefs.voluntaryCpfTopUpRelief],
    ["Spouse Relief", breakdown.taxReliefs.spouseRelief],
    ["Spouse Relief (Disability)", breakdown.taxReliefs.disabledSpouseRelief],
    ["Child Relief", breakdown.taxReliefs.childRelief],
    ["Handicapped Child Relief", breakdown.taxReliefs.disabledChildRelief],
    ["Working Mother's Relief", breakdown.taxReliefs.workingMotherRelief],
    ["Parent Relief", breakdown.taxReliefs.parentRelief],
    [
      "Grandparent Caregiver Relief",
      breakdown.taxReliefs.grandparentCaregiverRelief,
    ],
    [
      "Handicapped Brother/Sister Relief",
      breakdown.taxReliefs.disabledSiblingRelief,
    ],
    ["Life Insurance Relief", breakdown.taxReliefs.lifeInsuranceRelief],
    ["NSman Relief", breakdown.taxReliefs.nsmanRelief],
    ["Course Fees Relief", breakdown.taxReliefs.courseFeesRelief],
    ["Approved Donation Deduction", breakdown.taxReliefs.donationDeduction],
  ] as const;

  return (
    <>
      {breakdown.taxReliefs.totalReliefs > 0 ? (
        <>
          <p className="pb-1 pt-2 text-xs text-zinc-500">
            Tax Reliefs Applied
          </p>
          {reliefRows.map(([label, amount]) =>
            amount > 0 ? (
              <div className="flex items-center justify-between py-1" key={label}>
                <span className="text-sm text-zinc-400">{label}</span>
                <span className="text-sm text-emerald-400 tabular-nums">
                  -{formatCurrency(amount, currency)}
                </span>
              </div>
            ) : null,
          )}
          {breakdown.taxReliefs.reliefCapReduction > 0 ? (
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-amber-300">
                S$80,000 Relief Cap Reduction
              </span>
              <span className="text-sm text-amber-300 tabular-nums">
                +
                {formatCurrency(
                  breakdown.taxReliefs.reliefCapReduction,
                  currency,
                )}
              </span>
            </div>
          ) : null}
          <div className="mt-1 flex items-center justify-between border-t border-zinc-700 py-1">
            <span className="text-sm text-zinc-300">Chargeable Income</span>
            <span className="text-sm text-zinc-200 tabular-nums">
              {formatCurrency(breakdown.chargeableIncome, currency)}
            </span>
          </div>
          <Separator className="my-2" />
        </>
      ) : null}

      <p className="pb-1 pt-2 text-xs text-zinc-500">Income Tax</p>
      <DeductionRow
        label="Singapore Income Tax"
        amount={taxes.incomeTax}
        grossSalary={grossSalary}
        currency={currency}
      />
      {breakdown.grossTaxBeforeReliefs > taxes.incomeTax ? (
        <p className="mt-1 text-xs italic text-zinc-500">
          Tax before reliefs:{" "}
          {formatCurrency(breakdown.grossTaxBeforeReliefs, currency)} (per IRAS
          table)
        </p>
      ) : null}
      {breakdown.taxRebates.totalRebates > 0 ? (
        <p className="mt-1 text-xs italic text-zinc-500">
          Parenthood Tax Rebate applied:{" "}
          {formatCurrency(breakdown.taxRebates.parenthoodTaxRebate, currency)}
        </p>
      ) : null}

      <Separator className="my-2" />
      <p className="pb-1 pt-2 text-xs text-zinc-500">CPF Contributions</p>

      {breakdown.cpfEmployeeRate > 0 ? (
        <p className="mb-2 text-xs text-zinc-400">
          Rate: {(breakdown.cpfEmployeeRate * 100).toFixed(0)}% of wages up to
          S${breakdown.cpfMonthlyCeiling.toLocaleString()}/month
        </p>
      ) : null}

      <DeductionRow
        label="CPF (Employee)"
        amount={taxes.cpfEmployee}
        grossSalary={grossSalary}
        currency={currency}
      />

      {grossSalary / 12 > breakdown.cpfMonthlyCeiling &&
      breakdown.cpfEmployeeRate > 0 ? (
        <p className="mt-1 text-xs italic text-zinc-500">
          Effective rate: {formatPercentage(taxes.cpfEmployee / grossSalary)}{" "}
          (capped at S${breakdown.cpfMonthlyCeiling.toLocaleString()}/month
          ceiling)
        </p>
      ) : null}

      <div className="flex items-center justify-between py-2 opacity-60">
        <span className="text-sm text-zinc-400">CPF (Employer)</span>
        <span className="text-sm text-zinc-500 tabular-nums">
          +{formatCurrency(taxes.cpfEmployer, currency)}
        </span>
      </div>
      <p className="text-xs italic text-zinc-500">
        Employer CPF is additional and not deducted from your salary
      </p>

      {breakdown.voluntaryContributions > 0 ? (
        <>
          <Separator className="my-2" />
          <p className="pb-1 pt-2 text-xs text-zinc-500">
            CPF and SRS Reliefs
          </p>
          <DeductionRow
            label="CPF and SRS Relief Contributions"
            amount={breakdown.voluntaryContributions}
            grossSalary={grossSalary}
            currency={currency}
          />
        </>
      ) : null}

      <Separator className="my-2" />
      <p className="text-xs text-zinc-500">
        Non-resident employment income uses the IRAS 15% flat rate or resident
        progressive rates, whichever produces higher tax.
      </p>

      <ResultNotes
        countryName="Singapore"
        assumptions={[
          "Resident employment income uses IRAS resident tax rates after modeled CPF, SRS, CPF top-up, family, NSman, course-fee, life-insurance, and donation reliefs.",
          "Non-resident employment income uses the higher of 15% of employment income or resident progressive rates, following IRAS treatment.",
          "CPF employee contributions are deducted from take-home; employer CPF is shown for context and not deducted from salary.",
          "The IRAS S$80,000 personal relief cap is applied to resident personal reliefs before tax is calculated.",
        ]}
        exclusions={[
          "Director fees, trade or business income, foreign-tax-credit claims, treaty positions, and actual CPF account allocation timing require separate filing facts.",
        ]}
        sourceUrls={Object.values(SG_SOURCE_URLS)}
      />
    </>
  );
}
