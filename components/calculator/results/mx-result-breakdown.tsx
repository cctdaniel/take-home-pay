import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/format";
import { DeductionRow } from "../deduction-row";
import { ResultNotes } from "./result-notes";
import type { CountryResultBreakdownProps } from "./types";
import type { MXBreakdown, MXTaxBreakdown } from "@/lib/countries/mx/types";

function isMXTaxBreakdown(taxes: unknown): taxes is MXTaxBreakdown {
  return (
    typeof taxes === "object" &&
    taxes !== null &&
    "type" in taxes &&
    taxes.type === "MX" &&
    "incomeTax" in taxes &&
    "socialSecurity" in taxes &&
    "employmentSubsidy" in taxes
  );
}

function isMXBreakdown(breakdown: unknown): breakdown is MXBreakdown {
  return (
    typeof breakdown === "object" &&
    breakdown !== null &&
    "type" in breakdown &&
    breakdown.type === "MX" &&
    "salaryPerceptions" in breakdown &&
    "imss" in breakdown
  );
}

export function MXResultBreakdown({
  result,
  grossSalary,
  currency,
}: CountryResultBreakdownProps) {
  const { taxes, breakdown } = result;

  if (!isMXTaxBreakdown(taxes) || !isMXBreakdown(breakdown)) {
    return null;
  }

  const perceptions = breakdown.salaryPerceptions;
  const hasSalaryExemptions =
    perceptions.aguinaldoAmount > 0 ||
    perceptions.vacationPremium > 0 ||
    perceptions.ptuProfitSharing > 0;

  return (
    <>
      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-zinc-400">Cash Gross Income</span>
        <span className="text-sm text-zinc-200 tabular-nums">
          {formatCurrency(breakdown.cashGrossIncome, currency)}
        </span>
      </div>
      <div className="flex items-center justify-between py-1">
        <span className="text-sm text-zinc-400">ISR Taxable Income</span>
        <span className="text-sm text-zinc-200 tabular-nums">
          {formatCurrency(result.taxableIncome, currency)}
        </span>
      </div>

      {hasSalaryExemptions ? (
        <>
          <Separator className="my-2" />
          <p className="text-xs text-zinc-500 pt-2 pb-1">
            Salary Perceptions and Exemptions
          </p>
          {perceptions.aguinaldoAmount > 0 ? (
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-zinc-400">
                Aguinaldo exempt amount
              </span>
              <span className="text-sm text-emerald-400 tabular-nums">
                -{formatCurrency(perceptions.aguinaldoExempt, currency)}
              </span>
            </div>
          ) : null}
          {perceptions.vacationPremium > 0 ? (
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-zinc-400">
                Vacation premium exempt amount
              </span>
              <span className="text-sm text-emerald-400 tabular-nums">
                -{formatCurrency(perceptions.vacationPremiumExempt, currency)}
              </span>
            </div>
          ) : null}
          {perceptions.ptuProfitSharing > 0 ? (
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-zinc-400">
                PTU exempt amount
              </span>
              <span className="text-sm text-emerald-400 tabular-nums">
                -{formatCurrency(perceptions.ptuExempt, currency)}
              </span>
            </div>
          ) : null}
          {perceptions.taxableAdditionalIncome > 0 ? (
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-zinc-400">
                Taxable salary perceptions
              </span>
              <span className="text-sm text-zinc-200 tabular-nums">
                {formatCurrency(perceptions.taxableAdditionalIncome, currency)}
              </span>
            </div>
          ) : null}
        </>
      ) : null}

      {breakdown.voluntaryContributions.total > 0 ? (
        <>
          <Separator className="my-2" />
          <p className="text-xs text-zinc-500 pt-2 pb-1">
            Personal Deductions
          </p>
          {[
            [
              "AFORE / voluntary retirement",
              breakdown.voluntaryContributions.voluntaryRetirementContribution,
            ],
            [
              "Medical and dental expenses",
              breakdown.voluntaryContributions.medicalDentalExpenses,
            ],
            ["Funeral expenses", breakdown.voluntaryContributions.funeralExpenses],
            ["Mortgage interest", breakdown.voluntaryContributions.mortgageInterest],
            ["Education expenses", breakdown.voluntaryContributions.educationExpenses],
          ].map(([label, amount]) =>
            typeof amount === "number" && amount > 0 ? (
              <div
                className="flex items-center justify-between py-1"
                key={label}
              >
                <span className="text-sm text-zinc-400">{label}</span>
                <span className="text-sm text-emerald-400 tabular-nums">
                  -{formatCurrency(amount, currency)}
                </span>
              </div>
            ) : null,
          )}
        </>
      ) : null}

      <Separator className="my-2" />
      <p className="text-xs text-zinc-500 pt-2 pb-1">
        Tax and Payroll Deductions
      </p>
      <DeductionRow
        label="ISR income tax"
        amount={taxes.incomeTax}
        grossSalary={grossSalary}
        currency={currency}
      />
      {taxes.employmentSubsidy > 0 ? (
        <div className="flex items-center justify-between py-1">
          <span className="text-sm text-zinc-400">Employment subsidy</span>
          <span className="text-sm text-emerald-400 tabular-nums">
            -{formatCurrency(taxes.employmentSubsidy, currency)}
          </span>
        </div>
      ) : null}
      <DeductionRow
        label="Employee IMSS"
        amount={taxes.socialSecurity}
        grossSalary={grossSalary}
        currency={currency}
      />
      <ResultNotes
        countryName="Mexico"
        assumptions={breakdown.assumptions}
        sourceUrls={breakdown.sourceUrls}
      />
    </>
  );
}
