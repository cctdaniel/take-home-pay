import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/format";
import { DeductionRow } from "../deduction-row";
import { ResultNotes } from "./result-notes";
import type { CountryResultBreakdownProps } from "./types";

function CreditRow({
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

export function CAResultBreakdown({
  result,
  grossSalary,
  currency,
}: CountryResultBreakdownProps) {
  const { taxes, breakdown } = result;
  if (!("type" in taxes) || taxes.type !== "CA" || breakdown.type !== "CA") {
    return null;
  }

  const payrollPlan = breakdown.pension.plan;
  const contributions = breakdown.voluntaryContributions;

  return (
    <>
      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-zinc-400">Federal Taxable Income</span>
        <span className="text-sm text-zinc-200 tabular-nums">
          {formatCurrency(result.taxableIncome, currency)}
        </span>
      </div>
      {breakdown.taxableNonCashBenefits > 0 ? (
        <>
          <div className="flex items-center justify-between py-1">
            <span className="text-sm text-zinc-400">Taxable Non-Cash Benefits</span>
            <span className="text-sm text-zinc-200 tabular-nums">
              {formatCurrency(breakdown.taxableNonCashBenefits, currency)}
            </span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-sm text-zinc-400">Taxable Employment Income</span>
            <span className="text-sm text-zinc-200 tabular-nums">
              {formatCurrency(breakdown.taxableGrossIncome, currency)}
            </span>
          </div>
          <p className="pb-1 text-xs text-zinc-500">
            Included for income tax and CPP/QPP pensionable earnings; this
            generic in-kind input does not add EI or QPIP insurable earnings.
          </p>
        </>
      ) : null}
      {breakdown.provincialTaxableIncome !== result.taxableIncome ? (
        <div className="flex items-center justify-between py-1">
          <span className="text-sm text-zinc-400">
            {breakdown.provinceName} Taxable Income
          </span>
          <span className="text-sm text-zinc-200 tabular-nums">
            {formatCurrency(breakdown.provincialTaxableIncome, currency)}
          </span>
        </div>
      ) : null}

      <Separator className="my-2" />
      <p className="text-xs text-zinc-500 pt-2 pb-1">
        Taxable Income Deductions
      </p>
      <CreditRow
        label="RRSP Contribution"
        amount={contributions.rrspContribution}
        currency={currency}
      />
      <CreditRow
        label="FHSA Contribution"
        amount={contributions.fhsaContribution}
        currency={currency}
      />
      <CreditRow
        label="Registered Pension / RPP"
        amount={contributions.registeredPensionContribution}
        currency={currency}
      />
      <CreditRow
        label="Union / Professional Dues"
        amount={contributions.unionDues}
        currency={currency}
      />
      <CreditRow
        label="Allowed Childcare Expenses"
        amount={breakdown.childcare.allowedExpenses}
        currency={currency}
      />
      <CreditRow
        label={`Enhanced ${payrollPlan} Deduction`}
        amount={breakdown.taxableIncomeDeductions.enhancedPensionDeduction}
        currency={currency}
      />
      <CreditRow
        label="Quebec Worker Deduction"
        amount={breakdown.taxableIncomeDeductions.quebecWorkersDeduction}
        currency={currency}
      />

      <Separator className="my-2" />
      <p className="text-xs text-zinc-500 pt-2 pb-1">Non-Refundable Credits</p>
      <CreditRow
        label="Federal Credit Value"
        amount={taxes.federalTaxCredits - breakdown.taxCredits.federalDonationCredit}
        currency={currency}
      />
      <CreditRow
        label={`${breakdown.provinceName} Credit Value`}
        amount={
          taxes.provincialTaxCredits -
          breakdown.taxCredits.provincialDonationCredit
        }
        currency={currency}
      />
      <CreditRow
        label="Federal Donation Credit"
        amount={breakdown.taxCredits.federalDonationCredit}
        currency={currency}
      />
      <CreditRow
        label={`${breakdown.provinceName} Donation Credit`}
        amount={breakdown.taxCredits.provincialDonationCredit}
        currency={currency}
      />
      <CreditRow
        label="Quebec Federal Abatement"
        amount={taxes.quebecAbatement}
        currency={currency}
      />

      <Separator className="my-2" />
      <p className="text-xs text-zinc-500 pt-2 pb-1">
        Tax and Payroll Deductions
      </p>
      <DeductionRow
        label="Federal Income Tax"
        amount={taxes.incomeTax}
        grossSalary={grossSalary}
        currency={currency}
      />
      <DeductionRow
        label={`${breakdown.provinceName} Income Tax`}
        amount={
          taxes.provincialIncomeTax -
          taxes.ontarioSurtax -
          taxes.ontarioHealthPremium
        }
        grossSalary={grossSalary}
        currency={currency}
      />
      {taxes.ontarioSurtax > 0 ? (
        <DeductionRow
          label="Ontario Surtax"
          amount={taxes.ontarioSurtax}
          grossSalary={grossSalary}
          currency={currency}
        />
      ) : null}
      {taxes.ontarioHealthPremium > 0 ? (
        <DeductionRow
          label="Ontario Health Premium"
          amount={taxes.ontarioHealthPremium}
          grossSalary={grossSalary}
          currency={currency}
        />
      ) : null}
      <DeductionRow
        label={`${payrollPlan} Base Contribution`}
        amount={taxes.cpp + taxes.qpp}
        grossSalary={grossSalary}
        currency={currency}
      />
      <DeductionRow
        label={`${payrollPlan} Second Additional`}
        amount={taxes.cpp2 + taxes.qpp2}
        grossSalary={grossSalary}
        currency={currency}
      />
      <DeductionRow
        label="Employment Insurance"
        amount={taxes.ei}
        grossSalary={grossSalary}
        currency={currency}
      />
      {taxes.qpip > 0 ? (
        <DeductionRow
          label="Quebec Parental Insurance Plan"
          amount={taxes.qpip}
          grossSalary={grossSalary}
          currency={currency}
        />
      ) : null}
      {contributions.charitableDonations > 0 ? (
        <DeductionRow
          label="Charitable Donations Paid"
          amount={contributions.charitableDonations}
          grossSalary={grossSalary}
          currency={currency}
        />
      ) : null}

      <ResultNotes
        countryName="Canada"
        assumptions={breakdown.assumptions}
        sourceUrls={breakdown.sourceUrls}
      />
    </>
  );
}
