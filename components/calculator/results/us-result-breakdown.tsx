import { Separator } from "@/components/ui/separator";
import {
  getStateCalculator,
  hasNoIncomeTax,
} from "@/lib/countries/us/state-tax";
import {
  isUSBreakdown,
  isUSTaxBreakdown,
} from "@/lib/countries/types";
import { US_SOURCE_URLS } from "@/lib/countries/us/constants/tax-brackets-2026";
import { formatCurrency } from "@/lib/format";
import { DeductionRow } from "../deduction-row";
import { ResultNotes } from "./result-notes";
import type { CountryResultBreakdownProps } from "./types";

export function USResultBreakdown({
  result,
  grossSalary,
  currency,
  usState,
  usContributions,
}: CountryResultBreakdownProps) {
  const { taxes, breakdown } = result;

  if (!isUSTaxBreakdown(taxes) || !isUSBreakdown(breakdown)) {
    return null;
  }

  const stateCalculator = usState ? getStateCalculator(usState) : undefined;
  const stateName =
    stateCalculator?.getStateName() ?? breakdown.stateName ?? usState ?? "";
  const isNoTaxState = usState ? hasNoIncomeTax(usState) : false;
  const hasStateTaxes =
    taxes.stateIncomeTax > 0 || taxes.stateDisabilityInsurance > 0;
  const contributions = usContributions ?? breakdown.contributions;
  const hasContributions =
    contributions.traditional401k > 0 ||
    contributions.rothIRA > 0 ||
    contributions.hsa > 0 ||
    (contributions.healthFsa ?? 0) > 0 ||
    (contributions.dependentCareFsa ?? 0) > 0;

  return (
    <>
      <p className="pb-1 pt-2 text-xs text-zinc-500">Federal Taxes</p>
      <DeductionRow
        label={
          taxes.federalTaxCredits > 0
            ? "Federal Income Tax (after credits)"
            : "Federal Income Tax"
        }
        amount={taxes.federalIncomeTax}
        grossSalary={grossSalary}
        currency={currency}
      />
      {taxes.federalTaxCredits > 0 ? (
        <div className="space-y-1 py-1">
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-400">
              Federal Tax Before Credits
            </span>
            <span className="text-sm text-zinc-300 tabular-nums">
              {formatCurrency(taxes.federalIncomeTaxBeforeCredits, currency)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-emerald-400">
              Child / Other Dependent Credits
            </span>
            <span className="text-sm text-emerald-400 tabular-nums">
              -{formatCurrency(taxes.federalTaxCredits, currency)}
            </span>
          </div>
          {breakdown.taxCredits.phaseoutReduction > 0 ? (
            <p className="text-xs text-zinc-500">
              Dependent credits reduced by{" "}
              {formatCurrency(
                breakdown.taxCredits.phaseoutReduction,
                currency,
              )}{" "}
              under the federal income phaseout.
            </p>
          ) : null}
        </div>
      ) : null}
      <DeductionRow
        label="Social Security"
        amount={taxes.socialSecurity}
        grossSalary={grossSalary}
        currency={currency}
      />
      <DeductionRow
        label="Medicare"
        amount={taxes.medicare}
        grossSalary={grossSalary}
        currency={currency}
      />
      {taxes.additionalMedicare > 0 ? (
        <DeductionRow
          label="Additional Medicare"
          amount={taxes.additionalMedicare}
          grossSalary={grossSalary}
          currency={currency}
        />
      ) : null}

      {hasStateTaxes ? (
        <>
          <Separator className="my-2" />
          <p className="pb-1 pt-2 text-xs text-zinc-500">
            {stateName} Taxes
          </p>
          {taxes.stateIncomeTax > 0 ? (
            <DeductionRow
              label="State Income Tax"
              amount={taxes.stateIncomeTax}
              grossSalary={grossSalary}
              currency={currency}
            />
          ) : null}
          {taxes.stateDisabilityInsurance > 0 ? (
            <DeductionRow
              label="State Disability Insurance"
              amount={taxes.stateDisabilityInsurance}
              grossSalary={grossSalary}
              currency={currency}
            />
          ) : null}
        </>
      ) : null}

      {isNoTaxState ? (
        <>
          <Separator className="my-2" />
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-zinc-400">
              {stateName} State Tax
            </span>
            <span className="rounded bg-emerald-400/10 px-2 py-1 text-xs font-medium text-emerald-400">
              No State Income Tax
            </span>
          </div>
        </>
      ) : null}

      {hasContributions ? (
        <>
          <Separator className="my-2" />
          <p className="pb-1 pt-2 text-xs text-zinc-500">Contributions</p>
          {contributions.traditional401k > 0 ? (
            <DeductionRow
              label="401(k)"
              amount={contributions.traditional401k}
              grossSalary={grossSalary}
              currency={currency}
            />
          ) : null}
          {contributions.hsa > 0 ? (
            <DeductionRow
              label="HSA"
              amount={contributions.hsa}
              grossSalary={grossSalary}
              currency={currency}
            />
          ) : null}
          {(contributions.healthFsa ?? 0) > 0 ? (
            <DeductionRow
              label="Health FSA"
              amount={contributions.healthFsa ?? 0}
              grossSalary={grossSalary}
              currency={currency}
            />
          ) : null}
          {(contributions.dependentCareFsa ?? 0) > 0 ? (
            <DeductionRow
              label="Dependent Care FSA"
              amount={contributions.dependentCareFsa ?? 0}
              grossSalary={grossSalary}
              currency={currency}
            />
          ) : null}
          {contributions.rothIRA > 0 ? (
            <DeductionRow
              label="Roth IRA"
              amount={contributions.rothIRA}
              grossSalary={grossSalary}
              currency={currency}
            />
          ) : null}
        </>
      ) : null}

      <ResultNotes
        countryName="United States"
        assumptions={[
          "Federal income tax uses 2026 IRS brackets and standard deductions, with child and other-dependent credits based on the entered dependent counts.",
          "401(k), HSA, health FSA, and dependent care FSA are treated as pre-tax salary reductions; Roth IRA is shown as a post-tax cash contribution.",
          "Traditional 401(k) does not reduce FICA wages, while HSA and Section 125-style FSA inputs reduce Social Security and Medicare wages in this model.",
          "The selected state calculator applies modeled state income tax, deductions, and state disability insurance where implemented.",
        ]}
        exclusions={[
          "Exact W-4 withholding, local city or county payroll taxes, itemized deductions, AMT, employer matching, premium tax credits, and self-employment taxes require return or payroll facts beyond this salary model.",
        ]}
        sourceUrls={US_SOURCE_URLS}
      />
    </>
  );
}
