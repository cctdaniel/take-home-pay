import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatPercentage } from "@/lib/format";
import { DeductionRow } from "../deduction-row";
import type { CountryResultBreakdownProps } from "./types";

export function CNResultBreakdown({
  result,
  grossSalary,
  currency,
}: CountryResultBreakdownProps) {
  const { taxes, breakdown } = result;

  if (!("type" in taxes) || taxes.type !== "CN" || breakdown.type !== "CN") {
    return null;
  }

  const hasSocialInsurance = taxes.pensionInsurance > 0 || taxes.medicalInsurance > 0;
  const hasHousingFund = taxes.housingFund > 0;
  const hasSpecialDeductions = breakdown.specialDeductions.total > 0;

  return (
    <>
      <Separator className="my-2" />
      <p className="pb-1 pt-2 text-xs text-zinc-500">Income Tax</p>
      <DeductionRow
        label="Individual Income Tax (IIT)"
        amount={taxes.incomeTax}
        grossSalary={grossSalary}
        currency={currency}
      />
      <p className="mt-1 text-xs italic text-zinc-500">
        Standard deduction: {formatCurrency(60000, currency)}/year.
      </p>

      {hasSpecialDeductions && (
        <>
          <Separator className="my-2" />
          <p className="pb-1 pt-2 text-xs text-zinc-500">
            Special Additional Deductions
          </p>
          {breakdown.specialDeductions.children > 0 && (
            <div className="flex items-center justify-between py-1 opacity-60">
              <span className="text-sm text-zinc-400">Children (age 3+)</span>
              <span className="text-sm tabular-nums text-zinc-500">
                {formatCurrency(breakdown.specialDeductions.children, currency)}/yr
              </span>
            </div>
          )}
          {breakdown.specialDeductions.childrenUnder3 > 0 && (
            <div className="flex items-center justify-between py-1 opacity-60">
              <span className="text-sm text-zinc-400">Children under 3</span>
              <span className="text-sm tabular-nums text-zinc-500">
                {formatCurrency(breakdown.specialDeductions.childrenUnder3, currency)}/yr
              </span>
            </div>
          )}
          {breakdown.specialDeductions.elderlyCare > 0 && (
            <div className="flex items-center justify-between py-1 opacity-60">
              <span className="text-sm text-zinc-400">Elderly care</span>
              <span className="text-sm tabular-nums text-zinc-500">
                {formatCurrency(breakdown.specialDeductions.elderlyCare, currency)}/yr
              </span>
            </div>
          )}
          {breakdown.specialDeductions.housingRent > 0 && (
            <div className="flex items-center justify-between py-1 opacity-60">
              <span className="text-sm text-zinc-400">Housing rent</span>
              <span className="text-sm tabular-nums text-zinc-500">
                {formatCurrency(breakdown.specialDeductions.housingRent, currency)}/yr
              </span>
            </div>
          )}
          {breakdown.specialDeductions.housingLoanInterest > 0 && (
            <div className="flex items-center justify-between py-1 opacity-60">
              <span className="text-sm text-zinc-400">Mortgage interest</span>
              <span className="text-sm tabular-nums text-zinc-500">
                {formatCurrency(breakdown.specialDeductions.housingLoanInterest, currency)}/yr
              </span>
            </div>
          )}
          {breakdown.specialDeductions.continuingEducation > 0 && (
            <div className="flex items-center justify-between py-1 opacity-60">
              <span className="text-sm text-zinc-400">Continuing education</span>
              <span className="text-sm tabular-nums text-zinc-500">
                {formatCurrency(breakdown.specialDeductions.continuingEducation, currency)}/yr
              </span>
            </div>
          )}
        </>
      )}

      {hasSocialInsurance && (
        <>
          <Separator className="my-2" />
          <p className="pb-1 pt-2 text-xs text-zinc-500">Social Insurance</p>
          <DeductionRow
            label="Pension insurance (8%)"
            amount={taxes.pensionInsurance}
            grossSalary={grossSalary}
            currency={currency}
          />
          <DeductionRow
            label="Medical insurance (2%)"
            amount={taxes.medicalInsurance}
            grossSalary={grossSalary}
            currency={currency}
          />
          <DeductionRow
            label="Unemployment insurance (0.5%)"
            amount={taxes.unemploymentInsurance}
            grossSalary={grossSalary}
            currency={currency}
          />
          {grossSalary / 12 > breakdown.socialInsurance.pension.ceiling && (
            <p className="mt-1 text-xs italic text-zinc-500">
              Base capped at {formatCurrency(breakdown.socialInsurance.pension.ceiling, currency)}/month.
            </p>
          )}
        </>
      )}

      {hasHousingFund && (
        <>
          <Separator className="my-2" />
          <p className="pb-1 pt-2 text-xs text-zinc-500">Housing Fund</p>
          <DeductionRow
            label={`Housing fund (${formatPercentage(breakdown.housingFund.rate)})`}
            amount={taxes.housingFund}
            grossSalary={grossSalary}
            currency={currency}
          />
          <p className="mt-1 text-xs italic text-zinc-500">
            Base: {formatCurrency(breakdown.housingFund.base, currency)}/month.
          </p>
        </>
      )}

      <Separator className="my-2" />
      <div className="rounded-lg bg-zinc-800/50 p-3">
        <p className="mb-1 text-xs font-medium text-zinc-400">Exclusions</p>
        <p className="text-xs text-zinc-500">
          Employer social insurance contributions, employer housing fund
          matching, local city variations, year-end bonus tax treatment,
          self-employment tax, and other employer benefits are not modeled.
        </p>
      </div>
    </>
  );
}
