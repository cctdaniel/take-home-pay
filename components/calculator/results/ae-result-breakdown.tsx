import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatPercentage } from "@/lib/format";
import { DeductionRow } from "../deduction-row";
import type { CountryResultBreakdownProps } from "./types";
import { getUniqueSourceUrls } from "./source-helpers";

function getUaeSourceLabel(url: string) {
  if (url.includes("taxation")) {
    return "UAE Government taxation overview";
  }

  if (url.includes("natural.person")) {
    return "Federal Tax Authority natural-person wage guidance";
  }

  if (url.includes("unemployment-insurance-scheme")) {
    return "UAE Government unemployment insurance scheme";
  }

  if (url.includes("mohre.gov.ae")) {
    return "MoHRE unemployment insurance premium notice";
  }

  if (url.includes("contribution-payment")) {
    return "GPSSA contribution-account salary and rates";
  }

  if (url.includes("which-salary-upon-which-contributions")) {
    return "GPSSA contribution salary timing FAQ";
  }

  if (url.includes("registration-gpssa-mandatory")) {
    return "GPSSA Emirati registration guidance";
  }

  if (url.includes("gcc-overview")) {
    return "GPSSA GCC insurance extension program";
  }

  if (url.includes("registration-gcc-nationals")) {
    return "GPSSA GCC national registration";
  }

  return "UAE payroll source";
}

export function AEResultBreakdown({
  result,
  grossSalary,
  currency,
}: CountryResultBreakdownProps) {
  const { taxes, breakdown } = result;

  if (!("type" in taxes) || taxes.type !== "AE" || breakdown.type !== "AE") {
    return null;
  }

  const hasPension = taxes.pensionEmployee > 0;
  const hasEmployerPension = breakdown.pension.employer > 0;
  const uniqueSourceUrls = getUniqueSourceUrls(breakdown.sourceUrls);

  return (
    <>
      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-zinc-400">Employee Category</span>
        <span className="rounded bg-zinc-700/50 px-2 py-1 text-xs font-medium text-zinc-300">
          {breakdown.employeeCategoryLabel}
        </span>
      </div>

      <Separator className="my-2" />
      <p className="pb-1 pt-2 text-xs text-zinc-500">Income Tax</p>
      <DeductionRow
        label="UAE Personal Income Tax"
        amount={taxes.incomeTax}
        grossSalary={grossSalary}
        currency={currency}
      />
      <p className="mt-1 text-xs italic text-zinc-500">
        Salary and wage income is modeled with no UAE personal income tax.
      </p>

      <Separator className="my-2" />
      <p className="pb-1 pt-2 text-xs text-zinc-500">
        Employee Insurance
      </p>
      {breakdown.unemploymentInsurance.basicSalaryMonthly > 0 ? (
        <div className="flex items-center justify-between py-1">
          <span className="text-sm text-zinc-400">
            Basic salary for ILOE
          </span>
          <span className="text-sm tabular-nums text-zinc-300">
            {formatCurrency(
              breakdown.unemploymentInsurance.basicSalaryMonthly,
              currency,
            )}
          </span>
        </div>
      ) : null}
      <DeductionRow
        label={`ILOE unemployment insurance - ${breakdown.unemploymentInsurance.label}`}
        amount={taxes.unemploymentInsurance}
        grossSalary={grossSalary}
        currency={currency}
      />
      {taxes.unemploymentInsurance > 0 ? (
        <p className="mt-1 text-xs italic text-zinc-500">
          Premium modeled at{" "}
          {formatCurrency(
            breakdown.unemploymentInsurance.monthlyPremium,
            currency,
          )}
          /month for covered employees.
        </p>
      ) : (
        <p className="mt-1 text-xs italic text-zinc-500">
          No ILOE premium is deducted for the selected uncovered/excluded
          status.
        </p>
      )}

      {hasPension ? (
        <>
          <Separator className="my-2" />
          <p className="pb-1 pt-2 text-xs text-zinc-500">
            Pension / Social Security
          </p>
          <p className="mb-2 text-xs text-zinc-400">
            Employee rate {formatPercentage(breakdown.pension.employeeRate)} on
            {" "}
            {formatCurrency(
              breakdown.pension.contributionSalaryMonthly,
              currency,
            )}
            /month contribution salary.
          </p>
          <DeductionRow
            label="Employee pension"
            amount={taxes.pensionEmployee}
            grossSalary={grossSalary}
            currency={currency}
          />
          {breakdown.pension.monthlyMaximum !== undefined &&
            grossSalary / 12 > breakdown.pension.monthlyMaximum && (
              <p className="-mt-1 mb-1 text-xs italic text-zinc-500">
                Contribution salary capped at{" "}
                {formatCurrency(breakdown.pension.monthlyMaximum, currency)}
                /month.
              </p>
            )}
          {hasEmployerPension && (
            <div className="flex items-center justify-between py-2 opacity-60">
              <span className="text-sm text-zinc-400">
                Employer pension ({formatPercentage(breakdown.pension.employerRate)})
              </span>
              <span className="text-sm tabular-nums text-zinc-500">
                +{formatCurrency(breakdown.pension.employer, currency)}
              </span>
            </div>
          )}
          {breakdown.pension.governmentSupport > 0 && (
            <>
              <div className="flex items-center justify-between py-1 opacity-60">
                <span className="text-sm text-zinc-400">
                  Government support ({formatPercentage(breakdown.pension.governmentSupportRate)})
                </span>
                <span className="text-sm tabular-nums text-zinc-500">
                  +{formatCurrency(breakdown.pension.governmentSupport, currency)}
                </span>
              </div>
              <p className="text-xs italic text-zinc-500">
                Government support offsets the employer share; employer cash
                plus support equals{" "}
                {formatPercentage(breakdown.pension.statutoryEmployerRate)}.
              </p>
            </>
          )}
          <p className="text-xs italic text-zinc-500">
            Employer and government amounts are informational and are not
            deducted from take-home pay.
          </p>
        </>
      ) : (
        <>
          <Separator className="my-2" />
          <div className="rounded-lg bg-zinc-800/50 p-3 text-xs text-zinc-400">
            No UAE employee pension deduction is modeled for foreign / expat
            employees.
          </div>
        </>
      )}

      <Separator className="my-2" />
      <div className="rounded-lg bg-zinc-800/50 p-3">
        <p className="mb-1 text-xs font-medium text-zinc-400">
          UAE Salary Assumptions
        </p>
        <ul className="list-disc space-y-1 pl-4 text-xs text-zinc-500">
          {breakdown.assumptions.map((assumption) => (
            <li key={assumption}>{assumption}</li>
          ))}
        </ul>
      </div>

      {breakdown.exclusions.length > 0 ? (
        <>
          <Separator className="my-2" />
          <div className="rounded-lg bg-zinc-800/50 p-3">
            <p className="mb-1 text-xs font-medium text-zinc-400">
              UAE Items Requiring Separate Facts
            </p>
            <ul className="list-disc space-y-1 pl-4 text-xs text-zinc-500">
              {breakdown.exclusions.map((exclusion) => (
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
            <p className="mb-1 text-xs font-medium text-zinc-400">
              UAE Sources
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
                    {getUaeSourceLabel(url)}
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
