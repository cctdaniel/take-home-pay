import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/format";
import { DeductionRow } from "../deduction-row";
import { ResultNotes } from "./result-notes";
import type { CountryResultBreakdownProps } from "./types";

function CreditRow({
  label,
  amount,
  currency,
}: {
  label: string;
  amount: number;
  currency: CountryResultBreakdownProps["currency"];
}) {
  if (amount <= 0) return null;

  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm text-emerald-400">{label}</span>
      <span className="text-sm text-emerald-400 tabular-nums">
        -{formatCurrency(amount, currency)}
      </span>
    </div>
  );
}

export function IEResultBreakdown({
  result,
  grossSalary,
  currency,
}: CountryResultBreakdownProps) {
  const { taxes, breakdown } = result;
  if (!("type" in taxes) || taxes.type !== "IE" || breakdown.type !== "IE") {
    return null;
  }

  return (
    <>
      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-zinc-400">Tax Status</span>
        <span className="rounded bg-zinc-700/50 px-2 py-1 text-xs font-medium text-zinc-300">
          {breakdown.taxStatus.replaceAll("_", " ")}
        </span>
      </div>
      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-zinc-400">Age</span>
        <span className="text-sm text-zinc-200 tabular-nums">
          {breakdown.age}
        </span>
      </div>
      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-zinc-400">Standard Rate Band</span>
        <span className="text-sm text-zinc-200 tabular-nums">
          {formatCurrency(breakdown.standardRateBand, currency)}
        </span>
      </div>
      {breakdown.taxableBenefitsInKind > 0 && (
        <>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-zinc-400">
              Taxable Benefit-in-Kind
            </span>
            <span className="text-sm text-zinc-200 tabular-nums">
              +{formatCurrency(breakdown.taxableBenefitsInKind, currency)}
            </span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-sm text-zinc-400">
              PAYE / PRSI / USC Pay Base
            </span>
            <span className="text-sm text-zinc-200 tabular-nums">
              {formatCurrency(breakdown.taxablePayForPayroll, currency)}
            </span>
          </div>
        </>
      )}

      {(breakdown.pensionDeduction > 0 ||
        breakdown.flatRateExpenses > 0 ||
        breakdown.sarpRelief.reliefAmount > 0) && (
        <>
          <Separator className="my-2" />
          <p className="pb-1 pt-2 text-xs text-zinc-500">
            Taxable Income Deductions
          </p>
          {breakdown.sarpRelief.reliefAmount > 0 && (
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-zinc-400">
                SARP Exempt Employment Income
              </span>
              <span className="text-sm text-emerald-400 tabular-nums">
                -{formatCurrency(breakdown.sarpRelief.reliefAmount, currency)}
              </span>
            </div>
          )}
          {breakdown.pensionDeduction > 0 && (
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-zinc-400">
                Pension Contribution Relief (
                {(breakdown.pensionReliefPercent * 100).toFixed(0)}% cap)
              </span>
              <span className="text-sm text-emerald-400 tabular-nums">
                -{formatCurrency(breakdown.pensionDeduction, currency)}
              </span>
            </div>
          )}
          {breakdown.flatRateExpenses > 0 && (
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-zinc-400">
                Revenue Flat-Rate Expenses
              </span>
              <span className="text-sm text-emerald-400 tabular-nums">
                -{formatCurrency(breakdown.flatRateExpenses, currency)}
              </span>
            </div>
          )}
        </>
      )}

      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-zinc-400">Taxable Income</span>
        <span className="text-sm text-zinc-200 tabular-nums">
          {formatCurrency(result.taxableIncome, currency)}
        </span>
      </div>

      {breakdown.sarpRelief.applies && (
        <div className="my-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3">
          <p className="mb-1 text-xs font-medium text-emerald-400">
            SARP Relief Active
          </p>
          <p className="text-xs text-zinc-400">
            30% income-tax relief on employment income above{" "}
            {formatCurrency(breakdown.sarpRelief.incomeThreshold, currency)},
            capped at {formatCurrency(breakdown.sarpRelief.upperIncomeLimit, currency)}.
            Modeled private pension relief reduces that SARP base; USC and PRSI
            are still calculated on full salary.
          </p>
        </div>
      )}

      <Separator className="my-2" />
      <p className="pb-1 pt-2 text-xs text-zinc-500">PAYE Income Tax</p>
      {breakdown.bracketTaxes.map((bracket) => (
        <DeductionRow
          key={`${bracket.min}-${bracket.max}-${bracket.rate}`}
          label={`${(bracket.rate * 100).toFixed(0)}% ${formatCurrency(
            bracket.min,
            currency,
          )}${bracket.max === Infinity ? "+" : ` - ${formatCurrency(bracket.max, currency)}`}`}
          amount={bracket.tax}
          grossSalary={grossSalary}
          currency={currency}
        />
      ))}

      <Separator className="my-2" />
      <p className="pb-1 pt-2 text-xs text-zinc-500">Tax Credits</p>
      <CreditRow
        label="Personal Tax Credit"
        amount={breakdown.personalTaxCredit}
        currency={currency}
      />
      <CreditRow
        label="Employee PAYE Tax Credit"
        amount={breakdown.employeeTaxCredit}
        currency={currency}
      />
      <CreditRow
        label="Single Person Child Carer Credit"
        amount={breakdown.taxCreditDetails.singlePersonChildCarer}
        currency={currency}
      />
      <CreditRow
        label="Home Carer Tax Credit"
        amount={breakdown.taxCreditDetails.homeCarer}
        currency={currency}
      />
      <CreditRow
        label="Dependent Relative Credit"
        amount={breakdown.taxCreditDetails.dependentRelative}
        currency={currency}
      />
      <CreditRow
        label="Rent Tax Credit"
        amount={breakdown.taxCreditDetails.rent}
        currency={currency}
      />
      <CreditRow
        label="Health Expense Relief"
        amount={breakdown.taxCreditDetails.healthExpenses}
        currency={currency}
      />
      <DeductionRow
        label="PAYE Income Tax After Credits"
        amount={taxes.incomeTax}
        grossSalary={grossSalary}
        currency={currency}
      />

      <Separator className="my-2" />
      <p className="pb-1 pt-2 text-xs text-zinc-500">
        PRSI and Universal Social Charge
      </p>
      <DeductionRow
        label={
          breakdown.additionalIncomeTax.reducedRateApplied
            ? "Universal Social Charge (reduced rate)"
            : "Universal Social Charge"
        }
        amount={taxes.additionalIncomeTax}
        grossSalary={grossSalary}
        currency={currency}
      />
      <DeductionRow
        label={`Employee PRSI Class A (${(
          breakdown.employeeSocialContribution.effectiveRate * 100
        ).toFixed(2)}% effective)`}
        amount={taxes.employeeSocialContribution}
        grossSalary={grossSalary}
        currency={currency}
      />

      {(breakdown.pensionContribution > 0 ||
        breakdown.myFutureFund.employeeContribution > 0) && (
        <>
          <Separator className="my-2" />
          <p className="pb-1 pt-2 text-xs text-zinc-500">
            Retirement Cash Deductions
          </p>
          {breakdown.pensionContribution > 0 && (
            <DeductionRow
              label="Private Pension / AVC Contribution"
              amount={breakdown.pensionContribution}
              grossSalary={grossSalary}
              currency={currency}
            />
          )}
          {breakdown.myFutureFund.employeeContribution > 0 && (
            <>
              <DeductionRow
                label="MyFutureFund Employee Contribution"
                amount={breakdown.myFutureFund.employeeContribution}
                grossSalary={grossSalary}
                currency={currency}
              />
              <div className="flex items-center justify-between py-1">
                <span className="text-sm text-zinc-400">
                  Employer + State top-up shown outside take-home
                </span>
                <span className="text-sm text-zinc-200 tabular-nums">
                  {formatCurrency(
                    breakdown.myFutureFund.employerContribution +
                      breakdown.myFutureFund.stateTopUp,
                    currency,
                  )}
                </span>
              </div>
            </>
          )}
        </>
      )}
      <ResultNotes
        countryName="Ireland"
        assumptions={breakdown.assumptions}
        sourceUrls={breakdown.sourceUrls}
      />
    </>
  );
}
