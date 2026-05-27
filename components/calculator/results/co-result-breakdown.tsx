import { Separator } from "@/components/ui/separator";
import {
  isStandardCountryBreakdown,
  isStandardCountryTaxBreakdown,
} from "@/lib/countries/shared/standard-country";
import { formatCurrency, formatPercentage } from "@/lib/format";
import { DeductionRow } from "../deduction-row";
import type { CountryResultBreakdownProps } from "./types";
import { getUniqueSourceUrls } from "./source-helpers";

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

function getColombiaSourceLabel(url: string) {
  if (url.includes("normograma.dian.gov.co")) {
    return "DIAN 2026 UVT resolution";
  }

  if (url.includes("presidencia.gov.co")) {
    return "Colombia 2026 tax calendar announcement";
  }

  if (url.includes("funcionpublica.gov.co")) {
    return "Colombian tax statute reference";
  }

  if (url.includes("suin-juriscol.gov.co")) {
    return "SUIN-Juriscol pension reform reference";
  }

  return "Colombia tax source";
}

export function COResultBreakdown({
  result,
  grossSalary,
  currency,
}: CountryResultBreakdownProps) {
  const { taxes, breakdown } = result;

  if (
    !isStandardCountryTaxBreakdown(taxes) ||
    !isStandardCountryBreakdown(breakdown) ||
    taxes.type !== "CO" ||
    breakdown.type !== "CO"
  ) {
    return null;
  }

  const uniqueSourceUrls = getUniqueSourceUrls(breakdown.sourceUrls);

  const findRelief = (name: string) =>
    breakdown.deductions.find((deduction) => deduction.name === name)?.amount ??
    0;
  const mandatoryPreTaxTotal = breakdown.mandatoryContributions
    .filter((contribution) => contribution.preTax)
    .reduce((sum, contribution) => sum + contribution.amount, 0);
  const incomeAfterEmployeeSocial = Math.max(
    0,
    breakdown.grossIncome - mandatoryPreTaxTotal,
  );
  const voluntaryPension = breakdown.voluntaryContributions.find(
    (contribution) => contribution.key === "retirementContribution",
  );
  const hasGeneralReliefs =
    breakdown.deductions.some((deduction) => deduction.amount > 0) ||
    (voluntaryPension?.amount ?? 0) > 0;

  return (
    <>
      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-zinc-400">
          Colombia gross employment income
        </span>
        <span className="text-sm text-zinc-200 tabular-nums">
          {formatCurrency(breakdown.grossIncome, currency)}
        </span>
      </div>
      <div className="flex items-center justify-between py-1">
        <span className="text-sm text-zinc-400">
          Income after employee social security
        </span>
        <span className="text-sm text-zinc-200 tabular-nums">
          {formatCurrency(incomeAfterEmployeeSocial, currency)}
        </span>
      </div>
      <div className="flex items-center justify-between py-1">
        <span className="text-sm text-zinc-400">
          Cedula general taxable income
        </span>
        <span className="text-sm text-zinc-200 tabular-nums">
          {formatCurrency(result.taxableIncome, currency)}
        </span>
      </div>

      {hasGeneralReliefs ? (
        <>
          <Separator className="my-2" />
          <p className="pb-1 pt-2 text-xs text-zinc-500">
            Cedula General Reliefs
          </p>
          <ReliefRow
            label="25% exempt employment income"
            amount={findRelief("25% exempt employment income")}
            currency={currency}
          />
          <ReliefRow
            label="Article 387 dependent deduction"
            amount={findRelief("Article 387 dependent deduction")}
            currency={currency}
          />
          <ReliefRow
            label="Article 336 additional dependent deduction"
            amount={findRelief("Article 336 dependent deduction")}
            currency={currency}
          />
          <ReliefRow
            label="Prepaid medicine or health insurance"
            amount={findRelief("Prepaid medicine or health insurance")}
            currency={currency}
          />
          <ReliefRow
            label="Housing loan interest"
            amount={findRelief("Housing loan interest")}
            currency={currency}
          />
          <ReliefRow
            label="Electronic invoice deduction"
            amount={findRelief("Electronic invoice deduction")}
            currency={currency}
          />
          {voluntaryPension && voluntaryPension.amount > 0 ? (
            <div className="space-y-1 py-1">
              <ReliefRow
                label="Voluntary pension or AFC savings"
                amount={voluntaryPension.amount}
                currency={currency}
              />
              <p className="text-xs italic text-zinc-500">
                Applied within the 30% individual limit and the remaining 40% /
                1,340 UVT cedula general cap. Current input cap:{" "}
                {formatCurrency(voluntaryPension.limit, currency)}.
              </p>
            </div>
          ) : null}
        </>
      ) : null}

      <Separator className="my-2" />
      <p className="pb-1 pt-2 text-xs text-zinc-500">
        Article 241 Income Tax
      </p>
      <DeductionRow
        label={breakdown.incomeTaxName}
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
                {formatPercentage(bracket.rate)} band on income above{" "}
                {formatCurrency(bracket.min, currency)}
              </span>
              <span className="text-xs text-zinc-400 tabular-nums">
                {formatCurrency(bracket.tax, currency)}
              </span>
            </div>
          ))}
        </div>
      ) : null}

      <Separator className="my-2" />
      <p className="pb-1 pt-2 text-xs text-zinc-500">
        Employee Social Security
      </p>
      {breakdown.mandatoryContributions.map((contribution) => (
        <DeductionRow
          key={contribution.name}
          label={`${contribution.name} (${formatPercentage(contribution.rate)})`}
          amount={contribution.amount}
          grossSalary={grossSalary}
          currency={currency}
        />
      ))}

      {breakdown.assumptions.length > 0 ? (
        <>
          <Separator className="my-2" />
          <div className="rounded-lg bg-zinc-800/50 p-3">
            <p className="mb-2 text-xs font-medium text-zinc-400">
              Colombia Salary Assumptions
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
              Colombia Items Requiring Separate Facts
            </p>
            <ul className="list-disc space-y-1 pl-4 text-xs text-zinc-500">
              {breakdown.modeledExclusions.map((exclusion) => (
                <li key={exclusion}>{exclusion}</li>
              ))}
            </ul>
          </div>
        </>
      ) : null}

      {uniqueSourceUrls.length > 0 ? (
        <>
          <Separator className="my-2" />
          <div className="rounded-lg bg-zinc-800/50 p-3">
            <p className="mb-2 text-xs font-medium text-zinc-400">
              Colombia Sources
            </p>
            <ul className="list-disc space-y-1 pl-4 text-xs text-zinc-500">
              {uniqueSourceUrls.map((url) => (
                <li key={url}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-300 hover:text-emerald-200"
                  >
                    {getColombiaSourceLabel(url)}
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
