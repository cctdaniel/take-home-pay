import { Separator } from "@/components/ui/separator";
import { IN_SOURCE_URLS } from "@/lib/countries/in/constants/tax-parameters-2026";
import { formatCurrency, formatPercentage } from "@/lib/format";
import { DeductionRow } from "../deduction-row";
import { ResultNotes } from "./result-notes";
import type { CountryResultBreakdownProps } from "./types";

export function INResultBreakdown({
  result,
  grossSalary,
  currency,
}: CountryResultBreakdownProps) {
  const { taxes, breakdown } = result;

  if (!("type" in taxes) || taxes.type !== "IN" || breakdown.type !== "IN") {
    return null;
  }

  const hasEpf = taxes.epfEmployee > 0;
  const hasSurcharge = taxes.surcharge > 0;
  const hasRebate = breakdown.rebateUnder87A > 0;
  const hasHra = breakdown.hraExemption > 0;
  const hasProfessionalTaxPaid = breakdown.professionalTaxPaid > 0;
  const hasProfessionalTaxDeduction = breakdown.professionalTaxDeduction > 0;
  const hasSection80C = breakdown.section80CDeduction > 0;
  const hasNps = breakdown.nps80CCD1BDeduction > 0;
  const has80D = breakdown.section80DDeduction.total > 0;
  const voluntaryOutflow =
    breakdown.voluntaryContributions.section80CInvestments +
    breakdown.voluntaryContributions.npsEmployeeContribution +
    breakdown.voluntaryContributions.section80DHealthInsuranceSelfFamily +
    breakdown.voluntaryContributions.section80DHealthInsuranceParents;

  return (
    <>
      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-zinc-400">Tax Regime</span>
        <span className="rounded bg-zinc-700/50 px-2 py-1 text-xs font-medium text-zinc-300">
          {breakdown.regime === "new" ? "New Regime" : "Old Regime"}
        </span>
      </div>

      <Separator className="my-2" />
      <p className="pb-1 pt-2 text-xs text-zinc-500">Income Tax</p>
      <DeductionRow
        label="Income tax"
        amount={breakdown.grossTax > 0 ? breakdown.grossTax : 0}
        grossSalary={grossSalary}
        currency={currency}
      />
      {hasRebate && (
        <div className="flex items-center justify-between py-1 opacity-60">
          <span className="text-sm text-zinc-400">Section 87A Rebate</span>
          <span className="text-sm tabular-nums text-green-400">
            −{formatCurrency(breakdown.rebateUnder87A, currency)}
          </span>
        </div>
      )}
      <DeductionRow
        label={`Cess (${formatPercentage(0.04)})`}
        amount={taxes.cess}
        grossSalary={grossSalary}
        currency={currency}
      />
      {hasSurcharge && (
        <DeductionRow
          label="Surcharge"
          amount={taxes.surcharge}
          grossSalary={grossSalary}
          currency={currency}
        />
      )}
      <p className="mt-1 text-xs italic text-zinc-500">
        Standard deduction: {formatCurrency(breakdown.standardDeduction, currency)}/year.
      </p>
      {(hasHra ||
        hasProfessionalTaxDeduction ||
        hasSection80C ||
        hasNps ||
        has80D) && (
        <div className="mt-2 space-y-1 text-xs text-zinc-500">
          {hasHra && (
            <p>
              HRA exemption applied:{" "}
              {formatCurrency(breakdown.hraExemption, currency)}.
            </p>
          )}
          {hasProfessionalTaxDeduction && (
            <p>
              Professional tax section 16(iii) deduction applied:{" "}
              {formatCurrency(breakdown.professionalTaxDeduction, currency)}.
            </p>
          )}
          {hasSection80C && (
            <p>
              Section 80C deduction applied:{" "}
              {formatCurrency(breakdown.section80CDeduction, currency)}.
            </p>
          )}
          {hasNps && (
            <p>
              NPS 80CCD(1B) deduction applied:{" "}
              {formatCurrency(breakdown.nps80CCD1BDeduction, currency)}.
            </p>
          )}
          {has80D && (
            <p>
              Section 80D deduction applied:{" "}
              {formatCurrency(breakdown.section80DDeduction.total, currency)}.
            </p>
          )}
        </div>
      )}

      {hasEpf && (
        <>
          <Separator className="my-2" />
          <p className="pb-1 pt-2 text-xs text-zinc-500">Provident Fund</p>
          <DeductionRow
            label={`EPF employee (${formatPercentage(breakdown.epf.rate)})`}
            amount={taxes.epfEmployee}
            grossSalary={grossSalary}
            currency={currency}
          />
          <p className="mt-1 text-xs italic text-zinc-500">
            Wage ceiling: {formatCurrency(breakdown.epf.ceiling, currency)}/month.
          </p>
        </>
      )}

      {taxes.epfEmployee <= 0 && hasProfessionalTaxPaid && (
        <Separator className="my-2" />
      )}
      {hasProfessionalTaxPaid && (
        <>
          {hasEpf && <Separator className="my-2" />}
          <p className="pb-1 pt-2 text-xs text-zinc-500">Professional Tax</p>
          <DeductionRow
            label="Employee-paid professional tax"
            amount={breakdown.professionalTaxPaid}
            grossSalary={grossSalary}
            currency={currency}
          />
          {!hasProfessionalTaxDeduction && (
            <p className="mt-1 text-xs italic text-zinc-500">
              Paid professional tax reduces cash take-home, but section 16(iii)
              is not deducted under the selected new regime.
            </p>
          )}
        </>
      )}

      {voluntaryOutflow > 0 && (
        <>
          <Separator className="my-2" />
          <p className="pb-1 pt-2 text-xs text-zinc-500">
            Old-Regime Deductions
          </p>
          {breakdown.voluntaryContributions.section80CInvestments > 0 && (
            <DeductionRow
              label="Section 80C investments"
              amount={breakdown.voluntaryContributions.section80CInvestments}
              grossSalary={grossSalary}
              currency={currency}
            />
          )}
          {breakdown.voluntaryContributions.npsEmployeeContribution > 0 && (
            <DeductionRow
              label="NPS employee contribution"
              amount={
                breakdown.voluntaryContributions.npsEmployeeContribution
              }
              grossSalary={grossSalary}
              currency={currency}
            />
          )}
          {breakdown.voluntaryContributions.section80DHealthInsuranceSelfFamily >
            0 && (
            <DeductionRow
              label="Section 80D self/family health insurance"
              amount={
                breakdown.voluntaryContributions
                  .section80DHealthInsuranceSelfFamily
              }
              grossSalary={grossSalary}
              currency={currency}
            />
          )}
          {breakdown.voluntaryContributions.section80DHealthInsuranceParents >
            0 && (
            <DeductionRow
              label="Section 80D parents health insurance"
              amount={
                breakdown.voluntaryContributions.section80DHealthInsuranceParents
              }
              grossSalary={grossSalary}
              currency={currency}
            />
          )}
        </>
      )}

      <Separator className="my-2" />
      <div className="rounded-lg bg-zinc-800/50 p-3">
        <p className="mb-1 text-xs font-medium text-zinc-400">
          India Model Notes
        </p>
        <p className="text-xs text-zinc-500">
          HRA, professional tax, Section 80C, NPS 80CCD(1B), and Section 80D are
          modeled for old-regime salary cases when entered. Employer EPF/EPS/NPS
          taxability, gratuity, Form 16 component splits, other Chapter VI-A
          schedules, surcharge marginal relief, and state-by-state professional
          tax schedules require separate facts.
        </p>
      </div>
      <ResultNotes countryName="India" sourceUrls={IN_SOURCE_URLS} />
    </>
  );
}
