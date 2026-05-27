import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatPercentage } from "@/lib/format";
import { DeductionRow } from "../deduction-row";
import { ResultNotes } from "./result-notes";
import type { CountryResultBreakdownProps } from "./types";

export function DKResultBreakdown({
  result,
  grossSalary,
  currency,
}: CountryResultBreakdownProps) {
  const { taxes, breakdown } = result;

  if (
    !("type" in taxes) ||
    taxes.type !== "DK" ||
    breakdown.type !== "DK" ||
    !("employeeSocialContribution" in breakdown)
  ) {
    return null;
  }

  const dkBreakdown = breakdown;
  const voluntary = dkBreakdown.voluntaryDeductions;
  const allowances = dkBreakdown.automaticAllowances;
  const stateTaxes = dkBreakdown.stateTaxes;
  const hasVoluntaryRows =
    voluntary.privateRatePension > 0 ||
    voluntary.extraPensionDeduction > 0 ||
    voluntary.tradeUnionFees > 0 ||
    voluntary.unemploymentInsuranceFees > 0 ||
    voluntary.commutingDeduction > 0 ||
    voluntary.householdServices > 0 ||
    voluntary.otherWorkExpensesDeduction > 0;

  return (
    <>
      {dkBreakdown.specialRegime && (
        <>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-zinc-400">Tax Regime</span>
            <span className="text-sm text-zinc-200 text-right">
              {dkBreakdown.specialRegime.name}
            </span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-sm text-zinc-400">Regime Rate</span>
            <span className="text-sm text-zinc-200 tabular-nums">
              {formatPercentage(dkBreakdown.specialRegime.rate)}
            </span>
          </div>
        </>
      )}

      {dkBreakdown.taxableBenefitsInKind > 0 && (
        <>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-zinc-400">
              Taxable Benefits in Kind
            </span>
            <span className="text-sm text-zinc-200 tabular-nums">
              +{formatCurrency(dkBreakdown.taxableBenefitsInKind, currency)}
            </span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-sm text-zinc-400">
              AM / Income-Tax Gross Base
            </span>
            <span className="text-sm text-zinc-200 tabular-nums">
              {formatCurrency(dkBreakdown.taxableGrossIncome, currency)}
            </span>
          </div>
        </>
      )}

      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-zinc-400">Municipal Taxable Income</span>
        <span className="text-sm text-zinc-200 tabular-nums">
          {formatCurrency(result.taxableIncome, currency)}
        </span>
      </div>

      {dkBreakdown.taxRegime === "ordinary" && (
        <>
          <Separator className="my-2" />
          <p className="text-xs text-zinc-500 pt-2 pb-1">
            Allowances and Deductions
          </p>
          <div className="flex items-center justify-between py-1">
            <span className="text-sm text-zinc-400">Personal Allowance</span>
            <span className="text-sm text-emerald-400 tabular-nums">
              -{formatCurrency(dkBreakdown.personalAllowance, currency)}
            </span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-sm text-zinc-400">Employment Allowance</span>
            <span className="text-sm text-emerald-400 tabular-nums">
              -{formatCurrency(allowances.employmentAllowance, currency)}
            </span>
          </div>
          {allowances.jobAllowance > 0 && (
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-zinc-400">Job Allowance</span>
              <span className="text-sm text-emerald-400 tabular-nums">
                -{formatCurrency(allowances.jobAllowance, currency)}
              </span>
            </div>
          )}
          {allowances.singleParentEmploymentAllowance > 0 && (
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-zinc-400">
                Single-Parent Employment Allowance
              </span>
              <span className="text-sm text-emerald-400 tabular-nums">
                -
                {formatCurrency(
                  allowances.singleParentEmploymentAllowance,
                  currency,
                )}
              </span>
            </div>
          )}
          {allowances.seniorEmploymentAllowance > 0 && (
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-zinc-400">
                Senior Employment Allowance
              </span>
              <span className="text-sm text-emerald-400 tabular-nums">
                -{formatCurrency(allowances.seniorEmploymentAllowance, currency)}
              </span>
            </div>
          )}
          {hasVoluntaryRows && (
            <>
              {voluntary.privateRatePension > 0 && (
                <div className="flex items-center justify-between py-1">
                  <span className="text-sm text-zinc-400">
                    Rate Pension Cash Contribution
                  </span>
                  <span className="text-sm text-emerald-400 tabular-nums">
                    -{formatCurrency(voluntary.privateRatePension, currency)}
                  </span>
                </div>
              )}
              {voluntary.extraPensionDeduction > 0 && (
                <div className="flex items-center justify-between py-1">
                  <span className="text-sm text-zinc-400">
                    Extra Pension Deduction
                  </span>
                  <span className="text-sm text-emerald-400 tabular-nums">
                    -{formatCurrency(voluntary.extraPensionDeduction, currency)}
                  </span>
                </div>
              )}
              {voluntary.tradeUnionFees > 0 && (
                <div className="flex items-center justify-between py-1">
                  <span className="text-sm text-zinc-400">Trade Union Fees</span>
                  <span className="text-sm text-emerald-400 tabular-nums">
                    -{formatCurrency(voluntary.tradeUnionFees, currency)}
                  </span>
                </div>
              )}
              {voluntary.unemploymentInsuranceFees > 0 && (
                <div className="flex items-center justify-between py-1">
                  <span className="text-sm text-zinc-400">A-kasse Fees</span>
                  <span className="text-sm text-emerald-400 tabular-nums">
                    -
                    {formatCurrency(
                      voluntary.unemploymentInsuranceFees,
                      currency,
                    )}
                  </span>
                </div>
              )}
              {voluntary.commutingDeduction > 0 && (
                <div className="flex items-center justify-between py-1">
                  <span className="text-sm text-zinc-400">
                    Commuting Deduction
                  </span>
                  <span className="text-sm text-emerald-400 tabular-nums">
                    -{formatCurrency(voluntary.commutingDeduction, currency)}
                  </span>
                </div>
              )}
              {voluntary.householdServices > 0 && (
                <div className="flex items-center justify-between py-1">
                  <span className="text-sm text-zinc-400">
                    Household Services
                  </span>
                  <span className="text-sm text-emerald-400 tabular-nums">
                    -{formatCurrency(voluntary.householdServices, currency)}
                  </span>
                </div>
              )}
              {voluntary.otherWorkExpensesDeduction > 0 && (
                <div className="flex items-center justify-between py-1">
                  <span className="text-sm text-zinc-400">
                    Other Work Expenses Deduction
                  </span>
                  <span className="text-sm text-emerald-400 tabular-nums">
                    -
                    {formatCurrency(
                      voluntary.otherWorkExpensesDeduction,
                      currency,
                    )}
                  </span>
                </div>
              )}
            </>
          )}
        </>
      )}

      <Separator className="my-2" />
      <p className="text-xs text-zinc-500 pt-2 pb-1">
        Tax and Payroll Deductions
      </p>
      {stateTaxes && (
        <>
          <DeductionRow
            label="Municipal tax"
            amount={stateTaxes.municipalTax}
            grossSalary={grossSalary}
            currency={currency}
          />
          <DeductionRow
            label="Bottom tax"
            amount={stateTaxes.bottomTax}
            grossSalary={grossSalary}
            currency={currency}
          />
          {stateTaxes.middleTax > 0 && (
            <DeductionRow
              label="Middle tax"
              amount={stateTaxes.middleTax}
              grossSalary={grossSalary}
              currency={currency}
            />
          )}
          {stateTaxes.topTax > 0 && (
            <DeductionRow
              label="Top tax"
              amount={stateTaxes.topTax}
              grossSalary={grossSalary}
              currency={currency}
            />
          )}
          {stateTaxes.topTopTax > 0 && (
            <DeductionRow
              label="Top-top tax"
              amount={stateTaxes.topTopTax}
              grossSalary={grossSalary}
              currency={currency}
            />
          )}
        </>
      )}
      {!stateTaxes && (
        <DeductionRow
          label="Income tax"
          amount={taxes.incomeTax as number}
          grossSalary={grossSalary}
          currency={currency}
        />
      )}
      {dkBreakdown.employeeSocialContribution.amount > 0 && (
        <DeductionRow
          label={dkBreakdown.employeeSocialContribution.name}
          amount={dkBreakdown.employeeSocialContribution.amount}
          grossSalary={grossSalary}
          currency={currency}
        />
      )}
      <ResultNotes
        countryName="Denmark"
        assumptions={dkBreakdown.assumptions}
        sourceUrls={dkBreakdown.sourceUrls}
      />
    </>
  );
}
