import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatPercentage } from "@/lib/format";
import { DeductionRow } from "../deduction-row";
import type { CountryResultBreakdownProps } from "./types";
import { isLKBreakdown, isLKTaxBreakdown } from "@/lib/countries/lk/types";
import { ResultNotes } from "./result-notes";

function ReliefRow({
  label,
  amount,
  currency,
  note,
}: {
  label: string;
  amount: number;
  currency: CountryResultBreakdownProps["currency"];
  note?: string;
}) {
  if (amount <= 0) {
    return null;
  }

  return (
    <div className="space-y-1 py-1">
      <div className="flex items-center justify-between">
        <span className="text-sm text-zinc-400">{label}</span>
        <span className="text-sm text-emerald-400 tabular-nums">
          -{formatCurrency(amount, currency)}
        </span>
      </div>
      {note ? <p className="text-xs italic text-zinc-500">{note}</p> : null}
    </div>
  );
}

export function LKResultBreakdown({
  result,
  grossSalary,
  currency,
}: CountryResultBreakdownProps) {
  const { taxes, breakdown } = result;

  if (!isLKTaxBreakdown(taxes) || !isLKBreakdown(breakdown)) {
    return null;
  }

  const ordinaryEmploymentApit = Math.max(
    0,
    taxes.incomeTax - breakdown.terminalBenefitsTax,
  );
  const employeeEpf = breakdown.mandatoryContributions.find(
    (contribution) => contribution.name === "Employee Provident Fund contribution",
  );
  const appliedReturnReliefs = breakdown.voluntaryContributions.filter(
    (contribution) => contribution.amount > 0,
  );
  const hasEmploymentAdditions =
    breakdown.cashLumpSumPayments > 0 ||
    breakdown.taxableNonCashBenefits > 0 ||
    breakdown.taxableTerminalBenefits > 0 ||
    breakdown.secondaryEmploymentRate !== undefined;
  const hasEmployerCostContext =
    breakdown.employerEpfContribution > 0 ||
    breakdown.employerEtfContribution > 0;

  return (
    <>
      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-zinc-400">Regular cash employment income</span>
        <span className="text-sm text-zinc-200 tabular-nums">
          {formatCurrency(breakdown.regularCashIncome, currency)}
        </span>
      </div>
      <div className="flex items-center justify-between py-1">
        <span className="text-sm text-zinc-400">APIT taxable employment income</span>
        <span className="text-sm text-zinc-200 tabular-nums">
          {formatCurrency(result.taxableIncome, currency)}
        </span>
      </div>

      {hasEmploymentAdditions ? (
        <>
          <Separator className="my-2" />
          <p className="pb-1 pt-2 text-xs text-zinc-500">
            Sri Lanka Employment Inputs
          </p>
          {breakdown.cashLumpSumPayments > 0 ? (
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-zinc-400">
                Annual bonus or lump-sum cash
              </span>
              <span className="text-sm text-zinc-200 tabular-nums">
                {formatCurrency(breakdown.cashLumpSumPayments, currency)}
              </span>
            </div>
          ) : null}
          {breakdown.taxableNonCashBenefits > 0 ? (
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-zinc-400">
                Taxable in-kind / non-cash benefits
              </span>
              <span className="text-sm text-amber-300 tabular-nums">
                +{formatCurrency(breakdown.taxableNonCashBenefits, currency)}{" "}
                taxable only
              </span>
            </div>
          ) : null}
          {breakdown.taxableTerminalBenefits > 0 ? (
            <>
              <div className="flex items-center justify-between py-1">
                <span className="text-sm text-zinc-400">
                  Taxable terminal benefits
                </span>
                <span className="text-sm text-zinc-200 tabular-nums">
                  {formatCurrency(breakdown.taxableTerminalBenefits, currency)}
                </span>
              </div>
              <p className="text-xs text-zinc-500">
                {breakdown.terminalBenefitTreatment === "approvedOrEtf"
                  ? "Table 03 approved scheme / ETF-style treatment applies."
                  : "Table 03 other or unapproved payment treatment applies."}
              </p>
            </>
          ) : null}
          {breakdown.secondaryEmploymentRate !== undefined ? (
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-zinc-400">
                Secondary employment APIT rate
              </span>
              <span className="text-sm text-zinc-200 tabular-nums">
                {formatPercentage(breakdown.secondaryEmploymentRate)}
              </span>
            </div>
          ) : null}
        </>
      ) : null}

      {(breakdown.personalAllowance > 0 || appliedReturnReliefs.length > 0) ? (
        <>
          <Separator className="my-2" />
          <p className="pb-1 pt-2 text-xs text-zinc-500">
            Resident Reliefs and Annual-Return Deductions
          </p>
          <ReliefRow
            label={breakdown.personalAllowanceName ?? "Personal relief"}
            amount={breakdown.personalAllowance}
            currency={currency}
          />
          {appliedReturnReliefs.map((contribution) => (
            <ReliefRow
              key={contribution.key}
              label={contribution.name}
              amount={contribution.amount}
              currency={currency}
              note={
                contribution.cashFlowTreatment === "taxOnly"
                  ? "Tax relief only; this does not reduce cash paid by the employer."
                  : undefined
              }
            />
          ))}
        </>
      ) : null}

      <Separator className="my-2" />
      <p className="pb-1 pt-2 text-xs text-zinc-500">APIT Income Tax</p>
      <DeductionRow
        label="Employment APIT"
        amount={ordinaryEmploymentApit}
        grossSalary={grossSalary}
        currency={currency}
      />
      {breakdown.terminalBenefitsTax > 0 ? (
        <DeductionRow
          label="Terminal benefit APIT"
          amount={breakdown.terminalBenefitsTax}
          grossSalary={grossSalary}
          currency={currency}
        />
      ) : null}
      {breakdown.bracketTaxes.length > 0 ? (
        <div className="space-y-1 pt-1">
          {breakdown.bracketTaxes.map((bracket) => (
            <div
              className="flex items-center justify-between py-1"
              key={`${bracket.min}-${bracket.max}-${bracket.rate}`}
            >
              <span className="text-xs text-zinc-500">
                {formatPercentage(bracket.rate)} APIT band above{" "}
                {formatCurrency(bracket.min, currency)}
              </span>
              <span className="text-xs text-zinc-400 tabular-nums">
                {formatCurrency(bracket.tax, currency)}
              </span>
            </div>
          ))}
        </div>
      ) : null}

      {employeeEpf ? (
        <>
          <Separator className="my-2" />
          <p className="pb-1 pt-2 text-xs text-zinc-500">
            Employee Provident Fund
          </p>
          <DeductionRow
            label={`Employee EPF (${formatPercentage(employeeEpf.rate)})`}
            amount={employeeEpf.amount}
            grossSalary={grossSalary}
            currency={currency}
          />
          <p className="text-xs italic text-zinc-500">
            EPF is calculated on regular cash remuneration of{" "}
            {formatCurrency(breakdown.epfContributionBase, currency)} and does
            not reduce APIT taxable employment income.
          </p>
        </>
      ) : null}

      {hasEmployerCostContext ? (
        <>
          <Separator className="my-2" />
          <p className="pb-1 pt-2 text-xs text-zinc-500">
            Employer Cost Context
          </p>
          {breakdown.employerEpfContribution > 0 ? (
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-zinc-400">
                Employer EPF (
                {formatPercentage(
                  breakdown.employerEpfContribution /
                    breakdown.employerContributionBase,
                )}
                )
              </span>
              <span className="text-sm text-zinc-200 tabular-nums">
                {formatCurrency(breakdown.employerEpfContribution, currency)}
              </span>
            </div>
          ) : null}
          {breakdown.employerEtfContribution > 0 ? (
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-zinc-400">
                Employer ETF (
                {formatPercentage(
                  breakdown.employerEtfContribution /
                    breakdown.employerContributionBase,
                )}
                )
              </span>
              <span className="text-sm text-zinc-200 tabular-nums">
                {formatCurrency(breakdown.employerEtfContribution, currency)}
              </span>
            </div>
          ) : null}
          <div className="flex items-center justify-between py-1">
            <span className="text-sm text-zinc-400">
              Estimated employer salary cost
            </span>
            <span className="text-sm text-zinc-200 tabular-nums">
              {formatCurrency(breakdown.estimatedEmployerSalaryCost, currency)}
            </span>
          </div>
          <p className="text-xs italic text-zinc-500">
            Employer EPF and ETF are shown for transparency only. They are not
            employee deductions and do not reduce take-home pay.
          </p>
        </>
      ) : null}

      {breakdown.assumptions.length > 0 ? (
        <>
          <Separator className="my-2" />
          <div className="rounded-lg bg-zinc-800/50 p-3">
            <p className="mb-2 text-xs font-medium text-zinc-400">
              Sri Lanka Salary Assumptions
            </p>
            <ul className="list-disc space-y-1 pl-4 text-xs text-zinc-500">
              {breakdown.assumptions.map((assumption) => (
                <li key={assumption}>{assumption}</li>
              ))}
            </ul>
          </div>
        </>
      ) : null}

      {breakdown.modeledExclusions.length > 0 ? (
        <>
          <Separator className="my-2" />
          <div className="rounded-lg bg-zinc-800/50 p-3">
            <p className="mb-2 text-xs font-medium text-zinc-400">
              Sri Lanka Items Requiring Separate Facts
            </p>
            <ul className="list-disc space-y-1 pl-4 text-xs text-zinc-500">
              {breakdown.modeledExclusions.map((exclusion) => (
                <li key={exclusion}>{exclusion}</li>
              ))}
            </ul>
          </div>
        </>
      ) : null}

      <ResultNotes countryName="Sri Lanka" sourceUrls={breakdown.sourceUrls} />
    </>
  );
}
