import { Separator } from "@/components/ui/separator";
import { CROATIA_SOURCE_URLS } from "@/lib/countries/hr/constants/tax-brackets-2026";
import { formatCurrency, formatPercentage } from "@/lib/format";
import { DeductionRow } from "../deduction-row";
import { ResultNotes } from "./result-notes";
import type { CountryResultBreakdownProps } from "./types";

export function HRResultBreakdown({
  result,
  grossSalary,
  currency,
}: CountryResultBreakdownProps) {
  const { taxes, breakdown } = result;

  if (!("type" in taxes) || taxes.type !== "HR" || breakdown.type !== "HR") {
    return null;
  }

  const isPensionCapped =
    breakdown.taxableGrossIncome > breakdown.pension.annualBaseCeiling &&
    breakdown.pension.contributionBase === breakdown.pension.annualBaseCeiling;

  return (
    <>
      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-zinc-400">Work Scenario</span>
        <span className="text-xs font-medium text-zinc-300 bg-zinc-700/50 px-2 py-1 rounded">
          {breakdown.isDigitalNomadForeignEmployer
            ? "Digital nomad foreign employer"
            : "Croatian payroll"}
        </span>
      </div>

      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-zinc-400">Tax Residency</span>
        <span className="text-xs font-medium text-zinc-300 bg-zinc-700/50 px-2 py-1 rounded">
          {breakdown.isResident ? "Croatian Tax Resident" : "Non-Resident"}
        </span>
      </div>

      {!breakdown.isDigitalNomadForeignEmployer && (
        <div className="flex items-center justify-between py-2">
          <span className="text-sm text-zinc-400">Local Tax Rate</span>
          <span className="text-xs font-medium text-zinc-300 bg-zinc-700/50 px-2 py-1 rounded">
            {breakdown.locality.name} (
            {formatPercentage(breakdown.locality.lowerRate)} /{" "}
            {formatPercentage(breakdown.locality.higherRate)})
          </span>
        </div>
      )}

      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-zinc-400">Taxable Income</span>
        <span className="text-sm text-zinc-200 tabular-nums">
          {formatCurrency(result.taxableIncome, currency)}
        </span>
      </div>

      {breakdown.taxableBenefitsInKind > 0 && (
        <div className="flex items-center justify-between py-2">
          <span className="text-sm text-zinc-400">
            Taxable Benefits in Kind
          </span>
          <span className="text-sm text-amber-300 tabular-nums">
            +{formatCurrency(breakdown.taxableBenefitsInKind, currency)}{" "}
            taxable only
          </span>
        </div>
      )}

      <Separator className="my-2" />

      <p className="text-xs text-zinc-500 pt-2 pb-1">Income Tax</p>
      <DeductionRow
        label={
          breakdown.isDigitalNomadForeignEmployer
            ? "Croatian Income Tax (exempt)"
            : "Croatian Income Tax"
        }
        amount={taxes.incomeTax}
        grossSalary={grossSalary}
        currency={currency}
      />
      {breakdown.taxReliefs.returneeRelief > 0 && (
        <div className="flex items-center justify-between py-1">
          <span className="text-sm text-zinc-400">
            Croatian Returnee Income-Tax Relief
          </span>
          <span className="text-sm text-emerald-400 tabular-nums">
            -{formatCurrency(breakdown.taxReliefs.returneeRelief, currency)}
          </span>
        </div>
      )}
      {breakdown.taxReliefs.youthRelief > 0 && (
        <div className="flex items-center justify-between py-1">
          <span className="text-sm text-zinc-400">
            Youth Income-Tax Relief (
            {formatPercentage(breakdown.taxReliefs.youthReliefRate)})
          </span>
          <span className="text-sm text-emerald-400 tabular-nums">
            -{formatCurrency(breakdown.taxReliefs.youthRelief, currency)}
          </span>
        </div>
      )}
      {breakdown.isDigitalNomadForeignEmployer && (
        <p className="text-xs text-zinc-500 italic mt-1">
          Qualifying foreign-employer or foreign-company work under Croatia&apos;s
          digital-nomad temporary stay is modeled with no Croatian income tax.
        </p>
      )}

      {breakdown.personalAllowance.total > 0 && (
        <div className="space-y-1 pt-1">
          <div className="flex items-center justify-between py-1">
            <span className="text-sm text-zinc-400">
              Basic Personal Allowance
            </span>
            <span className="text-sm text-emerald-400 tabular-nums">
              -{formatCurrency(breakdown.personalAllowance.basic, currency)}
            </span>
          </div>
          {breakdown.personalAllowance.dependentSpouse > 0 && (
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-zinc-400">
                Dependent Spouse Allowance
              </span>
              <span className="text-sm text-emerald-400 tabular-nums">
                -
                {formatCurrency(
                  breakdown.personalAllowance.dependentSpouse,
                  currency,
                )}
              </span>
            </div>
          )}
          {breakdown.personalAllowance.children > 0 && (
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-zinc-400">
                Dependent Child Allowance
              </span>
              <span className="text-sm text-emerald-400 tabular-nums">
                -{formatCurrency(breakdown.personalAllowance.children, currency)}
              </span>
            </div>
          )}
          {breakdown.personalAllowance.otherDependents > 0 && (
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-zinc-400">
                Other Dependent Allowance
              </span>
              <span className="text-sm text-emerald-400 tabular-nums">
                -
                {formatCurrency(
                  breakdown.personalAllowance.otherDependents,
                  currency,
                )}
              </span>
            </div>
          )}
          {breakdown.personalAllowance.disability > 0 && (
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-zinc-400">
                Disability Allowance
              </span>
              <span className="text-sm text-emerald-400 tabular-nums">
                -
                {formatCurrency(
                  breakdown.personalAllowance.disability,
                  currency,
                )}
              </span>
            </div>
          )}
          {breakdown.personalAllowance.severeDisability > 0 && (
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-zinc-400">
                100% Disability / Care Allowance
              </span>
              <span className="text-sm text-emerald-400 tabular-nums">
                -
                {formatCurrency(
                  breakdown.personalAllowance.severeDisability,
                  currency,
                )}
              </span>
            </div>
          )}
        </div>
      )}

      <Separator className="my-2" />

      <p className="text-xs text-zinc-500 pt-2 pb-1">
        Employee Pension Contributions
      </p>
      {breakdown.isDigitalNomadForeignEmployer ? (
        <p className="text-xs text-zinc-500 italic mt-1">
          No Croatian employee pension contribution is modeled for the
          foreign-employer digital-nomad scenario.
        </p>
      ) : (
        <DeductionRow
          label={`I Pillar (${formatPercentage(
            breakdown.pension.firstPillarRate,
          )})`}
          amount={taxes.employeePensionFirstPillar}
          grossSalary={grossSalary}
          currency={currency}
        />
      )}
      {!breakdown.isDigitalNomadForeignEmployer &&
        taxes.employeePensionSecondPillar > 0 && (
          <DeductionRow
            label={`II Pillar (${formatPercentage(
              breakdown.pension.secondPillarRate,
            )})`}
            amount={taxes.employeePensionSecondPillar}
            grossSalary={grossSalary}
            currency={currency}
          />
        )}
      {!breakdown.isDigitalNomadForeignEmployer && isPensionCapped && (
        <p className="text-xs text-zinc-500 italic mt-1">
          Pension contributions are capped at{" "}
          {formatCurrency(breakdown.pension.monthlyBaseCeiling, currency)} per
          month.
        </p>
      )}

      {!breakdown.isDigitalNomadForeignEmployer && (
        <>
          <div className="flex items-center justify-between py-2 opacity-60">
            <span className="text-sm text-zinc-400">
              Employer Health Insurance (
              {formatPercentage(
                breakdown.employerContributions.healthInsuranceRate,
              )}
              )
            </span>
            <span className="text-sm text-zinc-500 tabular-nums">
              +
              {formatCurrency(
                breakdown.employerContributions.healthInsurance,
                currency,
              )}
            </span>
          </div>
          <p className="text-xs text-zinc-500 italic">
            Employer health insurance is paid on top of gross salary and is not
            deducted from take-home pay.
          </p>
        </>
      )}

      <ResultNotes
        countryName="Croatia"
        assumptions={[
          "Croatian payroll mode models ordinary bruto 1 salary, employee pension contributions, local income-tax rates, personal allowance factors, youth relief, returnee relief, and taxable benefit value entered by the user.",
          "Digital-nomad foreign-employer mode is modeled as a separate exempt scenario and does not apply ordinary Croatian payroll pension contributions.",
          "Employer health insurance is shown for context and is not deducted from take-home pay.",
        ]}
        exclusions={breakdown.modeledExclusions}
        sourceUrls={CROATIA_SOURCE_URLS}
      />
    </>
  );
}
