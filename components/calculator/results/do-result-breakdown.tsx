import { Separator } from "@/components/ui/separator";
import { isDOBreakdown } from "@/lib/countries/do/types";
import { formatCurrency } from "@/lib/format";
import { LocalizedCountryResultBreakdown } from "./localized-country-result";
import type { CountryResultBreakdownProps } from "./types";

export function DOResultBreakdown(props: CountryResultBreakdownProps) {
  const { result, currency } = props;
  const breakdown = isDOBreakdown(result.breakdown) ? result.breakdown : null;

  return (
    <>
      <LocalizedCountryResultBreakdown
        {...props}
        grossSalary={result.grossSalary}
        expectedCountry="DO"
        countryName="Dominican Republic"
        taxableNonCashBenefitsLabel="Employee-taxable fringe benefits"
        taxableGrossIncomeLabel="ISR taxable gross including employee-taxable fringe benefits"
        taxSectionTitle="Dominican ISR And SDSS Deductions"
      />
      {breakdown ? (
        <>
          <Separator className="my-2" />
          <p className="text-xs text-zinc-500 pt-2 pb-1">
            Dominican Republic Salary Structure
          </p>
          <div className="flex items-center justify-between py-1">
            <span className="text-sm text-zinc-400">Ordinary salary</span>
            <span className="text-sm text-zinc-200 tabular-nums">
              {formatCurrency(breakdown.ordinarySalary, currency)}
            </span>
          </div>
          {breakdown.christmasSalary > 0 ? (
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-zinc-400">
                Salario de Navidad
              </span>
              <span className="text-sm text-zinc-200 tabular-nums">
                {formatCurrency(breakdown.christmasSalary, currency)}
              </span>
            </div>
          ) : null}
          <div className="flex items-center justify-between py-1">
            <span className="text-sm text-zinc-400">ISR and SDSS base</span>
            <span className="text-sm text-zinc-200 tabular-nums">
              {formatCurrency(breakdown.isrAndSddsSalaryBase, currency)}
            </span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-sm text-zinc-400">SDSS coverage</span>
            <span className="rounded bg-zinc-700/50 px-2 py-1 text-xs font-medium text-zinc-300">
              {breakdown.sdssCovered
                ? "AFP and SFS withheld"
                : "No employee SDSS withholding"}
            </span>
          </div>
          {breakdown.sdssCovered ? (
            <>
              <div className="flex items-center justify-between py-1">
                <span className="text-sm text-zinc-400">
                  Monthly SDSS salary
                </span>
                <span className="text-sm text-zinc-200 tabular-nums">
                  {formatCurrency(breakdown.sdssSalaryMonthly, currency)}
                </span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-sm text-zinc-400">
                  Annual SDSS salary
                </span>
                <span className="text-sm text-zinc-200 tabular-nums">
                  {formatCurrency(breakdown.sdssSalaryAnnual, currency)}
                </span>
              </div>
            </>
          ) : null}
          <div className="flex items-center justify-between py-1">
            <span className="text-sm text-zinc-400">
              Fringe benefit treatment
            </span>
            <span className="rounded bg-zinc-700/50 px-2 py-1 text-xs font-medium text-zinc-300">
              {breakdown.fringeBenefitsTaxedToEmployee
                ? "Taxed to employee"
                : "Employer substitute tax"}
            </span>
          </div>
        </>
      ) : null}
    </>
  );
}
