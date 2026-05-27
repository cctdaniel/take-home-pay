import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatPercentage } from "@/lib/format";
import { DeductionRow } from "../deduction-row";
import type { CountryResultBreakdownProps } from "./types";

function getNorwaySourceLabel(url: string) {
  if (url.includes("trinnskatt")) {
    return "Skatteetaten bracket tax rates";
  }

  if (url.includes("minstefradrag")) {
    return "Skatteetaten minimum standard deduction";
  }

  if (url.includes("personfradrag")) {
    return "Skatteetaten personal allowance";
  }

  if (url.includes("fagforeningsfradrag")) {
    return "Skatteetaten union-dues deduction";
  }

  if (url.includes("reiser-mellom-hjem-og-arbeid")) {
    return "Skatteetaten commuting deduction";
  }

  if (url.includes("foreldrefradrag")) {
    return "Skatteetaten childcare deduction";
  }

  if (url.includes("lan-og-renter")) {
    return "Skatteetaten loan-interest deduction";
  }

  if (url.includes("trygdeavgift")) {
    return "Skatteetaten National Insurance rates";
  }

  if (url.includes("/paye/")) {
    return "Skatteetaten PAYE for foreign workers";
  }

  if (url.includes("ipa-og-ips")) {
    return "Skatteetaten IPS deduction";
  }

  if (url.includes("sample-personal-income-tax-calculation")) {
    return "PwC Norway sample calculation cross-check";
  }

  return "PwC Norway tax summary cross-check";
}

export function NOResultBreakdown({
  result,
  grossSalary,
  currency,
}: CountryResultBreakdownProps) {
  const { taxes, breakdown } = result;

  if (!("type" in taxes) || taxes.type !== "NO" || breakdown.type !== "NO") {
    return null;
  }

  const hasIpsContribution =
    breakdown.voluntaryContributions.ipsContribution > 0;
  const hasUnionDues = breakdown.voluntaryContributions.tradeUnionFees > 0;
  const hasChildcareDeduction =
    breakdown.voluntaryContributions.childcareDeductionApplied > 0;
  const hasCommutingDeduction =
    breakdown.voluntaryContributions.commutingDeduction > 0;
  const hasDebtInterest = breakdown.voluntaryContributions.debtInterestPaid > 0;

  return (
    <>
      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-zinc-400">Tax Scheme</span>
        <span className="text-sm text-zinc-200 text-right">
          {breakdown.paye.applied
            ? "PAYE for foreign workers"
            : "General taxation rules"}
        </span>
      </div>

      {breakdown.paye.selected && !breakdown.paye.applied && (
        <p className="text-xs text-amber-300/90">
          PAYE is not available above{" "}
          {formatCurrency(breakdown.paye.threshold, currency)} in 2026, so the
          ordinary tax calculation is applied.
        </p>
      )}

      {breakdown.paye.applied && (
        <>
          <div className="flex items-center justify-between py-1">
            <span className="text-sm text-zinc-400">PAYE Rate</span>
            <span className="text-sm text-zinc-200 tabular-nums">
              {formatPercentage(breakdown.paye.totalRate)}
            </span>
          </div>
          <p className="text-xs text-zinc-500 italic">
            PAYE is a gross tax scheme. Ordinary deductions, including IPS, are
            not applied.
          </p>
        </>
      )}

      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-zinc-400">Taxable Income</span>
        <span className="text-sm text-zinc-200 tabular-nums">
          {formatCurrency(result.taxableIncome, currency)}
        </span>
      </div>

      {!breakdown.paye.applied && (
        <div className="flex items-center justify-between py-1">
          <span className="text-sm text-zinc-400">
            Personal Allowance + Minimum Deduction
          </span>
          <span className="text-sm text-emerald-400 tabular-nums">
            -{formatCurrency(breakdown.standardDeduction, currency)}
          </span>
        </div>
      )}

      {hasIpsContribution && (
        <div className="flex items-center justify-between py-1">
          <span className="text-sm text-zinc-400">IPS Deduction Applied</span>
          <span className="text-sm text-emerald-400 tabular-nums">
            -
            {formatCurrency(
              breakdown.voluntaryContributions.ipsDeductionApplied,
              currency,
            )}
          </span>
        </div>
      )}
      {hasUnionDues && (
        <div className="flex items-center justify-between py-1">
          <span className="text-sm text-zinc-400">Trade Union Dues</span>
          <span className="text-sm text-emerald-400 tabular-nums">
            -{formatCurrency(breakdown.voluntaryContributions.tradeUnionFees, currency)}
          </span>
        </div>
      )}
      {hasChildcareDeduction && (
        <div className="flex items-center justify-between py-1">
          <span className="text-sm text-zinc-400">Childcare Deduction</span>
          <span className="text-sm text-emerald-400 tabular-nums">
            -
            {formatCurrency(
              breakdown.voluntaryContributions.childcareDeductionApplied,
              currency,
            )}
          </span>
        </div>
      )}
      {hasCommutingDeduction && (
        <div className="flex items-center justify-between py-1">
          <span className="text-sm text-zinc-400">Commuting Deduction</span>
          <span className="text-sm text-emerald-400 tabular-nums">
            -
            {formatCurrency(
              breakdown.voluntaryContributions.commutingDeduction,
              currency,
            )}
          </span>
        </div>
      )}
      {hasDebtInterest && (
        <div className="flex items-center justify-between py-1">
          <span className="text-sm text-zinc-400">Debt Interest Paid</span>
          <span className="text-sm text-emerald-400 tabular-nums">
            -
            {formatCurrency(
              breakdown.voluntaryContributions.debtInterestPaid,
              currency,
            )}
          </span>
        </div>
      )}

      {!breakdown.paye.applied && breakdown.bracketTaxes.length > 0 && (
        <>
          <Separator className="my-2" />
          <p className="text-xs text-zinc-500 pt-2 pb-1">
            Bracket Tax (Trinnskatt)
          </p>
          {breakdown.bracketTaxes
            .filter((bracket) => bracket.tax > 0)
            .map((bracket) => (
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
        </>
      )}

      <Separator className="my-2" />
      <p className="text-xs text-zinc-500 pt-2 pb-1">
        Tax and Payroll Deductions
      </p>
      <DeductionRow
        label={breakdown.paye.applied ? "PAYE income tax" : "Income tax"}
        amount={taxes.incomeTax}
        grossSalary={grossSalary}
        currency={currency}
      />
      {taxes.employeeSocialContribution > 0 && (
        <DeductionRow
          label={breakdown.employeeSocialContribution.name}
          amount={taxes.employeeSocialContribution}
          grossSalary={grossSalary}
          currency={currency}
        />
      )}
	      {hasIpsContribution && (
	        <DeductionRow
	          label="IPS pension savings"
	          amount={breakdown.voluntaryContributions.ipsContribution}
          grossSalary={grossSalary}
          currency={currency}
	        />
	      )}

      {breakdown.assumptions.length > 0 ? (
        <>
          <Separator className="my-2" />
          <div className="rounded-lg bg-zinc-800/50 p-3">
            <p className="mb-2 text-xs font-medium text-zinc-400">
              Norway Salary Assumptions
            </p>
            <ul className="list-disc space-y-1 pl-4 text-xs text-zinc-500">
              {breakdown.assumptions.map((assumption) => (
                <li key={assumption}>{assumption}</li>
              ))}
            </ul>
          </div>
        </>
      ) : null}

      {breakdown.sourceUrls.length > 0 ? (
        <>
          <Separator className="my-2" />
          <div className="rounded-lg bg-zinc-800/50 p-3">
            <p className="mb-2 text-xs font-medium text-zinc-400">
              Norway Sources
            </p>
            <ul className="list-disc space-y-1 pl-4 text-xs text-zinc-500">
              {breakdown.sourceUrls.map((url) => (
                <li key={url}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-300 hover:text-emerald-200"
                  >
                    {getNorwaySourceLabel(url)}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </>
      ) : null}
    </>
  );
}
