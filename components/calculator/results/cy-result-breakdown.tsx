import { Separator } from "@/components/ui/separator";
import { CY_SOURCE_URLS } from "@/lib/countries/cy/constants/tax-brackets-2026";
import { formatCurrency, formatPercentage } from "@/lib/format";
import { DeductionRow } from "../deduction-row";
import { ResultNotes } from "./result-notes";
import type { CountryResultBreakdownProps } from "./types";

function getEmploymentExemptionLabel(
  selected: string,
  applies: boolean,
): string {
  if (selected === "article_8_21a_20") {
    return applies ? "Article 8(21A) 20%" : "Article 8(21A) selected";
  }

  if (selected === "article_8_23a_50") {
    return applies ? "Article 8(23A) 50%" : "Article 8(23A) selected";
  }

  return "None";
}

export function CYResultBreakdown({
  result,
  grossSalary,
  currency,
}: CountryResultBreakdownProps) {
  const { taxes, breakdown } = result;

  if (!("type" in taxes) || taxes.type !== "CY" || breakdown.type !== "CY") {
    return null;
  }

  return (
    <>
      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-zinc-400">Tax Residency</span>
        <span className="text-xs font-medium text-zinc-300 bg-zinc-700/50 px-2 py-1 rounded">
          {breakdown.isResident ? "Cyprus Resident" : "Non-Resident"}
        </span>
      </div>

      {breakdown.employmentExemption !== "none" && (
        <div className="flex items-center justify-between py-2">
          <span className="text-sm text-zinc-400">
            First-Employment Exemption
          </span>
          <span className="text-xs font-medium text-zinc-300 bg-zinc-700/50 px-2 py-1 rounded">
            {getEmploymentExemptionLabel(
              breakdown.employmentExemption,
              breakdown.firstEmploymentExemption.applies,
            )}
          </span>
        </div>
      )}

      <div className="flex items-center justify-between py-2">
        <span className="text-sm text-zinc-400">Chargeable Income</span>
        <span className="text-sm text-zinc-200 tabular-nums">
          {formatCurrency(result.taxableIncome, currency)}
        </span>
      </div>

      <Separator className="my-2" />
      <p className="text-xs text-zinc-500 pt-2 pb-1">Taxable Income Deductions</p>
      {breakdown.firstEmploymentExemption.exemptIncome > 0 && (
        <div className="flex items-center justify-between py-1">
          <span className="text-sm text-zinc-400">
            First-Employment Exempt Income
          </span>
          <span className="text-sm text-emerald-400 tabular-nums">
            -
            {formatCurrency(
              breakdown.firstEmploymentExemption.exemptIncome,
              currency,
            )}
          </span>
        </div>
      )}
      {breakdown.employmentExemption === "article_8_23a_50" &&
        !breakdown.firstEmploymentExemption.thresholdMet && (
          <p className="text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded p-2 mt-2">
            The Article 8(23A) exemption is selected, but it is not applied
            because annual remuneration must exceed {" "}
            {formatCurrency(
              breakdown.firstEmploymentExemption.threshold ?? 0,
              currency,
            )}
            .
          </p>
        )}
      {breakdown.deductions.homeInsurance > 0 && (
        <div className="flex items-center justify-between py-1">
          <span className="text-sm text-zinc-400">Home Insurance</span>
          <span className="text-sm text-emerald-400 tabular-nums">
            -{formatCurrency(breakdown.deductions.homeInsurance, currency)}
          </span>
        </div>
      )}
      {breakdown.deductions.contributionGroupDeduction > 0 && (
        <div className="flex items-center justify-between py-1">
          <span className="text-sm text-zinc-400">
            SI, GHS, Pension/Provident/Medical Deduction
          </span>
          <span className="text-sm text-emerald-400 tabular-nums">
            -
            {formatCurrency(
              breakdown.deductions.contributionGroupDeduction,
              currency,
            )}
          </span>
        </div>
      )}
      {breakdown.deductions.childDeduction > 0 && (
        <div className="flex items-center justify-between py-1">
          <span className="text-sm text-zinc-400">Dependent Children</span>
          <span className="text-sm text-emerald-400 tabular-nums">
            -{formatCurrency(breakdown.deductions.childDeduction, currency)}
          </span>
        </div>
      )}
      {breakdown.deductions.primaryResidence > 0 && (
        <div className="flex items-center justify-between py-1">
          <span className="text-sm text-zinc-400">Primary Residence</span>
          <span className="text-sm text-emerald-400 tabular-nums">
            -{formatCurrency(breakdown.deductions.primaryResidence, currency)}
          </span>
        </div>
      )}
      {breakdown.deductions.greenTransition > 0 && (
        <div className="flex items-center justify-between py-1">
          <span className="text-sm text-zinc-400">Green / EV Expense</span>
          <span className="text-sm text-emerald-400 tabular-nums">
            -{formatCurrency(breakdown.deductions.greenTransition, currency)}
          </span>
        </div>
      )}
      {breakdown.deductions.disallowedContributionDeduction > 0 && (
        <p className="text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded p-2 mt-2">
          {formatCurrency(
            breakdown.deductions.disallowedContributionDeduction,
            currency,
          )} of SI, GHS, pension/provident, medical, and life-insurance
          deductions is over the TD59 one-fifth aggregate deduction cap.
        </p>
      )}

      <Separator className="my-2" />
      <p className="text-xs text-zinc-500 pt-2 pb-1">Income Tax</p>
      <DeductionRow
        label="Income Tax"
        amount={taxes.incomeTax}
        grossSalary={grossSalary}
        currency={currency}
      />

      <Separator className="my-2" />
      <p className="text-xs text-zinc-500 pt-2 pb-1">Social Insurance</p>
      <p className="text-xs text-zinc-500 mb-1">
        Employee Social Insurance is capped at {" "}
        {formatCurrency(breakdown.socialInsurance.monthlyCeiling, currency)}
        /month for this annual salary estimate.
      </p>
      <DeductionRow
        label={`Employee SI (${formatPercentage(
          breakdown.socialInsurance.employeeRate,
        )})`}
        amount={taxes.socialInsurance}
        grossSalary={grossSalary}
        currency={currency}
      />
      <div className="flex items-center justify-between py-2 opacity-60">
        <span className="text-sm text-zinc-400">
          Employer SI ({formatPercentage(breakdown.socialInsurance.employerRate)})
        </span>
        <span className="text-sm text-zinc-500 tabular-nums">
          +{formatCurrency(breakdown.socialInsurance.employer, currency)}
        </span>
      </div>
      <div className="flex items-center justify-between py-1 opacity-60">
        <span className="text-sm text-zinc-400">
          State SI ({formatPercentage(breakdown.socialInsurance.stateRate)})
        </span>
        <span className="text-sm text-zinc-500 tabular-nums">
          +{formatCurrency(breakdown.socialInsurance.state, currency)}
        </span>
      </div>

      <Separator className="my-2" />
      <p className="text-xs text-zinc-500 pt-2 pb-1">General Healthcare System</p>
      <DeductionRow
        label={`Employee GHS (${formatPercentage(breakdown.gesy.employeeRate)})`}
        amount={taxes.gesy}
        grossSalary={grossSalary}
        currency={currency}
      />
      <div className="flex items-center justify-between py-2 opacity-60">
        <span className="text-sm text-zinc-400">
          Employer GHS ({formatPercentage(breakdown.gesy.employerRate)})
        </span>
        <span className="text-sm text-zinc-500 tabular-nums">
          +{formatCurrency(breakdown.gesy.employer, currency)}
        </span>
      </div>
      <p className="text-xs text-zinc-500 italic">
        Employer and state amounts are informational and are not deducted from
        take-home pay.
      </p>

      {breakdown.voluntaryContributions.total > 0 && (
        <>
          <Separator className="my-2" />
          <p className="text-xs text-zinc-500 pt-2 pb-1">
            Approved Fund Contributions
          </p>
          <DeductionRow
            label="Approved Pension / Provident Fund"
            amount={breakdown.voluntaryContributions.approvedPensionProvidentFund}
            grossSalary={grossSalary}
            currency={currency}
          />
          {breakdown.voluntaryContributions.medicalFundContribution > 0 && (
            <DeductionRow
              label="Approved Medical Fund Contribution"
              amount={breakdown.voluntaryContributions.medicalFundContribution}
              grossSalary={grossSalary}
              currency={currency}
            />
          )}
        </>
      )}

      <ResultNotes
        countryName="Cyprus"
        assumptions={[
          "Family reliefs are applied only when the income-criteria option is eligible.",
          "Article 8 first-employment exemptions are applied only when selected; SI and GHS remain based on full salary.",
          "Approved pension/provident and medical-fund inputs are capped in the UI and again in the calculator, then included within the TD59 one-fifth aggregate deduction cap.",
        ]}
        exclusions={[
          "Life-insurance capital-sum tests, approved-fund provider eligibility, Special Defence Contribution, non-salary income, overseas employment exemptions, and stock-option valuation require separate facts.",
        ]}
        sourceUrls={CY_SOURCE_URLS}
      />
    </>
  );
}
