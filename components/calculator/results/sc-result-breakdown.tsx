import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/format";
import {
  isStandardCountryBreakdown,
  isStandardCountryTaxBreakdown,
} from "@/lib/countries/shared/standard-country";
import { DeductionRow } from "../deduction-row";
import type { CountryResultBreakdownProps } from "./types";
import type { SCBreakdown, SCTaxBreakdown } from "@/lib/countries/sc/types";
import type {
  CountrySpecificBreakdown,
  TaxBreakdown,
} from "@/lib/countries/types";
import type { SCEmployeeTaxTable } from "@/lib/countries/sc/types";
import { getUniqueSourceUrls } from "./source-helpers";

const EMPLOYEE_TAX_TABLE_LABELS: Record<SCEmployeeTaxTable, string> = {
  citizen: "Citizen employee table",
  non_citizen: "Non-citizen employee table",
  specific_project: "Specific-project 3% table",
  stevedore: "Stevedore 10% table",
};

function getSeychellesSourceLabel(url: string) {
  if (url.includes("income-and-non-monetary-benefits-tax")) {
    return "SRC income and non-monetary benefits tax";
  }

  if (url.includes("tax-calculator")) {
    return "SRC tax calculator";
  }

  if (url.includes("mandatory-contribution")) {
    return "Seychelles Pension Fund mandatory contributions";
  }

  if (url.includes("voluntary-contribution")) {
    return "Seychelles Pension Fund voluntary contributions";
  }

  return "Seychelles payroll source";
}

function isSCTaxBreakdown(taxes: TaxBreakdown): taxes is SCTaxBreakdown {
  return (
    isStandardCountryTaxBreakdown(taxes) &&
    taxes.type === "SC" &&
    "nonMonetaryBenefitsTax" in taxes
  );
}

function isSCBreakdown(
  breakdown: CountrySpecificBreakdown,
): breakdown is SCBreakdown {
  return (
    isStandardCountryBreakdown(breakdown) &&
    breakdown.type === "SC" &&
    "taxableNonMonetaryBenefits" in breakdown &&
    "nonMonetaryBenefitsTax" in breakdown
  );
}

export function SCResultBreakdown({
  result,
  grossSalary,
  currency,
}: CountryResultBreakdownProps) {
  const { taxes, breakdown } = result;

  if (!isSCTaxBreakdown(taxes) || !isSCBreakdown(breakdown)) {
    return null;
  }
  const uniqueSourceUrls = getUniqueSourceUrls(breakdown.sourceUrls);

  return (
    <>
      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-zinc-400">Employee Tax Table</span>
        <span className="text-xs font-medium text-zinc-300 bg-zinc-700/50 px-2 py-1 rounded">
          {EMPLOYEE_TAX_TABLE_LABELS[breakdown.employeeTaxTable]}
        </span>
      </div>

      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-zinc-400">Taxable Income</span>
        <span className="text-sm text-zinc-200 tabular-nums">
          {formatCurrency(result.taxableIncome, currency)}
        </span>
      </div>

      <Separator className="my-2" />
      <p className="text-xs text-zinc-500 pt-2 pb-1">
        Tax and Payroll Deductions
      </p>
      <DeductionRow
        label={breakdown.incomeTaxName}
        amount={taxes.incomeTax}
        grossSalary={grossSalary}
        currency={currency}
      />
      {breakdown.mandatoryContributions.map((contribution) => (
        <DeductionRow
          key={contribution.name}
          label={contribution.name}
          amount={contribution.amount}
          grossSalary={grossSalary}
          currency={currency}
        />
      ))}
      {breakdown.voluntarySpfContribution > 0 ? (
        <DeductionRow
          label="SPF voluntary contribution"
          amount={breakdown.voluntarySpfContribution}
          grossSalary={grossSalary}
          currency={currency}
        />
      ) : null}

      {breakdown.nonMonetaryBenefitsTax > 0 ? (
        <>
          <Separator className="my-2" />
          <p className="text-xs text-zinc-500 pt-2 pb-1">
            Employer-Only Tax Estimate
          </p>
          <div className="flex items-center justify-between py-1">
            <span className="text-sm text-zinc-400">
              Taxable non-monetary benefits
            </span>
            <span className="text-sm text-zinc-200 tabular-nums">
              {formatCurrency(breakdown.taxableNonMonetaryBenefits, currency)}
            </span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-sm text-zinc-400">
              Non-monetary benefits tax, not deducted
            </span>
            <span className="text-sm text-zinc-200 tabular-nums">
              {formatCurrency(breakdown.nonMonetaryBenefitsTax, currency)}
            </span>
          </div>
        </>
      ) : null}

      {breakdown.assumptions.length > 0 ? (
        <>
          <Separator className="my-2" />
          <div className="rounded-lg bg-zinc-800/50 p-3">
            <p className="mb-2 text-xs font-medium text-zinc-400">
              Seychelles Salary Assumptions
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
              Seychelles Items Requiring Separate Facts
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
              Seychelles Sources
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
                    {getSeychellesSourceLabel(url)}
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
