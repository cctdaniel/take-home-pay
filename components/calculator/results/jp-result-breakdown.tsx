import { Separator } from "@/components/ui/separator";
import { JP_SOURCE_URLS } from "@/lib/countries/jp/constants/tax-parameters-2026";
import { formatCurrency, formatPercentage } from "@/lib/format";
import { DeductionRow } from "../deduction-row";
import { ResultNotes } from "./result-notes";
import type { CountryResultBreakdownProps } from "./types";

export function JPResultBreakdown({
  result,
  grossSalary,
  currency,
}: CountryResultBreakdownProps) {
  const { taxes, breakdown } = result;

  if (!("type" in taxes) || taxes.type !== "JP" || breakdown.type !== "JP") {
    return null;
  }

  return (
    <>
      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-zinc-400">Employment income deduction</span>
        <span className="rounded bg-zinc-700/50 px-2 py-1 text-xs font-medium text-zinc-300">
          {formatCurrency(breakdown.employmentIncomeDeduction, currency)}
        </span>
      </div>
      {breakdown.incomeAdjustmentDeduction > 0 && (
        <div className="flex items-center justify-between py-2">
          <span className="text-sm text-zinc-400">
            Income adjustment deduction
          </span>
          <span className="rounded bg-zinc-700/50 px-2 py-1 text-xs font-medium text-zinc-300">
            {formatCurrency(breakdown.incomeAdjustmentDeduction, currency)}
          </span>
        </div>
      )}
      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-zinc-400">Basic deduction</span>
        <span className="rounded bg-zinc-700/50 px-2 py-1 text-xs font-medium text-zinc-300">
          {formatCurrency(breakdown.basicDeduction, currency)}
        </span>
      </div>
      {breakdown.spouseDeduction > 0 && (
        <div className="flex items-center justify-between py-2">
          <span className="text-sm text-zinc-400">Spouse deduction</span>
          <span className="rounded bg-zinc-700/50 px-2 py-1 text-xs font-medium text-zinc-300">
            {formatCurrency(breakdown.spouseDeduction, currency)}
          </span>
        </div>
      )}
      {breakdown.dependentDeduction > 0 && (
        <div className="flex items-center justify-between py-2">
          <span className="text-sm text-zinc-400">Dependent deductions</span>
          <span className="rounded bg-zinc-700/50 px-2 py-1 text-xs font-medium text-zinc-300">
            {formatCurrency(breakdown.dependentDeduction, currency)}
          </span>
        </div>
      )}
      {breakdown.idecoDeduction > 0 && (
        <DeductionRow
          label="iDeCo pension contribution"
          amount={breakdown.idecoDeduction}
          grossSalary={grossSalary}
          currency={currency}
        />
      )}
      {breakdown.lifeInsurancePremiumDeduction > 0 && (
        <div className="flex items-center justify-between py-2">
          <span className="text-sm text-zinc-400">
            Life insurance premium deduction
          </span>
          <span className="rounded bg-zinc-700/50 px-2 py-1 text-xs font-medium text-zinc-300">
            {formatCurrency(breakdown.lifeInsurancePremiumDeduction, currency)}
          </span>
        </div>
      )}
      {breakdown.earthquakeInsuranceDeduction > 0 && (
        <div className="flex items-center justify-between py-2">
          <span className="text-sm text-zinc-400">
            Earthquake insurance deduction
          </span>
          <span className="rounded bg-zinc-700/50 px-2 py-1 text-xs font-medium text-zinc-300">
            {formatCurrency(breakdown.earthquakeInsuranceDeduction, currency)}
          </span>
        </div>
      )}
      {breakdown.medicalExpenseDeduction > 0 && (
        <div className="space-y-1 py-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-400">
              Medical expense deduction
            </span>
            <span className="rounded bg-zinc-700/50 px-2 py-1 text-xs font-medium text-zinc-300">
              {formatCurrency(breakdown.medicalExpenseDeduction, currency)}
            </span>
          </div>
          <p className="text-xs italic text-zinc-500">
            Net medical expenses{" "}
            {formatCurrency(breakdown.medicalExpenseNetAmount, currency)} minus
            threshold{" "}
            {formatCurrency(breakdown.medicalExpenseThreshold, currency)}.
          </p>
        </div>
      )}
      {breakdown.qualifiedDonationAmount > 0 && (
        <div className="space-y-1 py-2">
          <DeductionRow
            label="Qualified donations paid"
            amount={breakdown.qualifiedDonationAmount}
            grossSalary={grossSalary}
            currency={currency}
          />
          <p className="text-xs italic text-zinc-500">
            Income-tax donation deduction{" "}
            {formatCurrency(breakdown.qualifiedDonationDeduction, currency)}
            after the JPY 2,000 floor.
          </p>
        </div>
      )}

      <Separator className="my-2" />
      <p className="pb-1 pt-2 text-xs text-zinc-500">National Income Tax</p>
      <DeductionRow
        label="National income tax"
        amount={breakdown.nationalIncomeTax}
        grossSalary={grossSalary}
        currency={currency}
      />
      <DeductionRow
        label="Reconstruction surtax (2.1%)"
        amount={taxes.reconstructionSurtax}
        grossSalary={grossSalary}
        currency={currency}
      />

      <Separator className="my-2" />
      <p className="pb-1 pt-2 text-xs text-zinc-500">Resident Tax</p>
      <DeductionRow
        label="Resident tax (10%)"
        amount={taxes.residentTax}
        grossSalary={grossSalary}
        currency={currency}
      />
      <p className="mt-1 text-xs italic text-zinc-500">
        Flat 10% proxy on resident-tax taxable income of{" "}
        {formatCurrency(breakdown.residentTaxableIncome, currency)}, plus the
        modeled per-capita amount when taxable. Resident-tax insurance
        deductions used here: life{" "}
        {formatCurrency(
          breakdown.residentTaxLifeInsurancePremiumDeduction,
          currency,
        )}
        , earthquake{" "}
        {formatCurrency(
          breakdown.residentTaxEarthquakeInsuranceDeduction,
          currency,
        )}
        .
        {breakdown.furusatoResidentBasicCredit +
          breakdown.furusatoResidentSpecialCredit >
          0
          ? ` Furusato resident-tax credits applied: basic ${formatCurrency(
              breakdown.furusatoResidentBasicCredit,
              currency,
            )}, special ${formatCurrency(
              breakdown.furusatoResidentSpecialCredit,
              currency,
            )} (20% special-credit cap ${formatCurrency(
              breakdown.furusatoResidentCreditLimit,
              currency,
            )}).`
          : ""}
      </p>

      <Separator className="my-2" />
      <p className="pb-1 pt-2 text-xs text-zinc-500">Social Insurance</p>
      <DeductionRow
        label={`Pension (${formatPercentage(breakdown.socialInsurance.pension.rate)})`}
        amount={taxes.pensionInsurance}
        grossSalary={grossSalary}
        currency={currency}
      />
      <DeductionRow
        label={`Health insurance (${formatPercentage(breakdown.socialInsurance.health.rate)})`}
        amount={taxes.healthInsurance}
        grossSalary={grossSalary}
        currency={currency}
      />
      <DeductionRow
        label={`Employment insurance (${formatPercentage(breakdown.socialInsurance.employment.rate)})`}
        amount={taxes.employmentInsurance}
        grossSalary={grossSalary}
        currency={currency}
      />

      <ResultNotes
        countryName="Japan"
        exclusions={[
          "Local inhabitant tax variations, age-40 care insurance, bonus insurance caps, NTA housing-loan credit worksheets/certificates, employer social insurance contributions, and employer benefits require separate facts.",
        ]}
        sourceUrls={JP_SOURCE_URLS}
      />
    </>
  );
}
