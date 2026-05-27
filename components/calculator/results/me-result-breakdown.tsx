import { Separator } from "@/components/ui/separator";
import { isMEBreakdown, isMETaxBreakdown } from "@/lib/countries/me/types";
import { formatCurrency, formatPercentage } from "@/lib/format";
import { DeductionRow } from "../deduction-row";
import { ResultNotes } from "./result-notes";
import type { CountryResultBreakdownProps } from "./types";

function ReliefRow({
  label,
  amount,
  currency,
}: {
  label: string;
  amount: number;
  currency: CountryResultBreakdownProps["currency"];
}) {
  if (amount <= 0) {
    return null;
  }

  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm text-zinc-400">{label}</span>
      <span className="text-sm text-emerald-400 tabular-nums">
        -{formatCurrency(amount, currency)}
      </span>
    </div>
  );
}

export function MEResultBreakdown({
  result,
  grossSalary,
  currency,
}: CountryResultBreakdownProps) {
  const { taxes, breakdown } = result;

  if (!isMETaxBreakdown(taxes) || !isMEBreakdown(breakdown)) {
    return null;
  }

  const isDigitalNomad =
    breakdown.incomeScenario === "digitalNomadForeignSource";
  const pensionContribution = breakdown.mandatoryContributions.find(
    (contribution) =>
      contribution.name === "Pension and disability insurance employee contribution",
  );
  const unemploymentContribution = breakdown.mandatoryContributions.find(
    (contribution) =>
      contribution.name === "Unemployment insurance employee contribution",
  );
  const taxableNonCashBenefits = breakdown.taxableNonCashBenefits ?? 0;
  const taxableGrossIncome =
    breakdown.taxableGrossIncome ?? breakdown.grossIncome;

  return (
    <>
      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-zinc-400">Income Scenario</span>
        <span className="rounded bg-zinc-700/50 px-2 py-1 text-xs font-medium text-zinc-300">
          {isDigitalNomad
            ? "Digital nomad foreign-source"
            : "Montenegro payroll salary"}
        </span>
      </div>

      {taxableNonCashBenefits > 0 ? (
        <>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-zinc-400">
              Taxable benefits in kind
            </span>
            <span className="text-sm text-amber-300 tabular-nums">
              +{formatCurrency(taxableNonCashBenefits, currency)}{" "}
              taxable only
            </span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-sm text-zinc-400">
              PIT / contribution gross base
            </span>
            <span className="text-sm text-zinc-200 tabular-nums">
              {formatCurrency(
                taxableGrossIncome,
                currency,
              )}
            </span>
          </div>
        </>
      ) : null}

      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-zinc-400">PIT taxable income</span>
        <span className="text-sm text-zinc-200 tabular-nums">
          {formatCurrency(result.taxableIncome, currency)}
        </span>
      </div>

      <Separator className="my-2" />
      <p className="pb-1 pt-2 text-xs text-zinc-500">Montenegro PIT</p>
      <ReliefRow
        label="Monthly salary tax-free band annualized"
        amount={breakdown.personalAllowance}
        currency={currency}
      />
      <DeductionRow
        label={
          isDigitalNomad
            ? "Personal income tax (foreign-source exempt)"
            : breakdown.incomeTaxName
        }
        amount={taxes.incomeTax}
        grossSalary={grossSalary}
        currency={currency}
      />
      {breakdown.bracketTaxes.length > 0 ? (
        <div className="space-y-1 pt-1">
          {breakdown.bracketTaxes.map((bracket) => (
            <div
              className="flex items-center justify-between py-1"
              key={`${bracket.min}-${bracket.max}-${bracket.rate}`}
            >
              <span className="text-xs text-zinc-500">
                {formatPercentage(bracket.rate)} PIT band above{" "}
                {formatCurrency(bracket.min, currency)}
              </span>
              <span className="text-xs text-zinc-400 tabular-nums">
                {formatCurrency(bracket.tax, currency)}
              </span>
            </div>
          ))}
        </div>
      ) : null}
      {isDigitalNomad ? (
        <p className="mt-1 text-xs italic text-zinc-500">
          Qualifying foreign-source income from an employer or own company not
          registered in Montenegro is modeled with no Montenegro salary PIT.
        </p>
      ) : null}

      <Separator className="my-2" />
      <p className="pb-1 pt-2 text-xs text-zinc-500">
        Employee Social Contributions
      </p>
      {pensionContribution ? (
        <DeductionRow
          label={`Pension and disability (${formatPercentage(
            pensionContribution.rate,
          )})`}
          amount={pensionContribution.amount}
          grossSalary={grossSalary}
          currency={currency}
        />
      ) : null}
      {unemploymentContribution ? (
        <DeductionRow
          label={`Unemployment insurance (${formatPercentage(
            unemploymentContribution.rate,
          )})`}
          amount={unemploymentContribution.amount}
          grossSalary={grossSalary}
          currency={currency}
        />
      ) : null}
      {isDigitalNomad ? (
        <p className="mt-1 text-xs italic text-zinc-500">
          No Montenegro employee social contribution deduction is modeled for
          the qualifying digital-nomad foreign-source scenario.
        </p>
      ) : null}

      <Separator className="my-2" />
      <div className="flex items-center justify-between py-2 opacity-60">
        <span className="text-sm text-zinc-400">
          Municipal surtax context ({breakdown.municipalSurtaxName},{" "}
          {formatPercentage(breakdown.municipalSurtaxRateValue)})
        </span>
        <span className="text-sm text-zinc-500 tabular-nums">
          +{formatCurrency(breakdown.municipalSurtaxEmployerCostEstimate, currency)}
        </span>
      </div>
      <p className="text-xs italic text-zinc-500">
        Shown as employer-cost context only; it is not deducted from employee
        take-home pay in this model.
      </p>

      {breakdown.assumptions.length > 0 ? (
        <>
          <Separator className="my-2" />
          <div className="rounded-lg bg-zinc-800/50 p-3">
            <p className="mb-2 text-xs font-medium text-zinc-400">
              Montenegro Salary Assumptions
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
              Montenegro Items Requiring Separate Facts
            </p>
            <ul className="list-disc space-y-1 pl-4 text-xs text-zinc-500">
              {breakdown.modeledExclusions.map((exclusion) => (
                <li key={exclusion}>{exclusion}</li>
              ))}
            </ul>
          </div>
        </>
      ) : null}
      <ResultNotes countryName="Montenegro" sourceUrls={breakdown.sourceUrls} />
    </>
  );
}
