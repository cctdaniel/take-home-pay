import { Separator } from "@/components/ui/separator";
import { CN_SOURCE_URLS } from "@/lib/countries/cn/constants/tax-parameters-2026";
import { formatCurrency, formatPercentage } from "@/lib/format";
import { DeductionRow } from "../deduction-row";
import { ResultNotes } from "./result-notes";
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
  const hasVoluntaryDeductions = breakdown.voluntaryDeductions.total > 0;
  const hasYearEndBonus = breakdown.yearEndBonus > 0;
  const hasTaxableInKindBenefits = breakdown.taxableInKindBenefits > 0;
  const hasForeignAllowanceExemptions =
    breakdown.foreignAllowanceExemptions.total > 0;
  const hasSalaryStructure = hasYearEndBonus || hasTaxableInKindBenefits;

  return (
    <>
      {hasSalaryStructure && (
        <>
          <Separator className="my-2" />
          <p className="pb-1 pt-2 text-xs text-zinc-500">
            China Salary Structure
          </p>
          <div className="flex items-center justify-between py-1">
            <span className="text-sm text-zinc-400">Ordinary salary</span>
            <span className="text-sm tabular-nums text-zinc-200">
              {formatCurrency(breakdown.ordinarySalary, currency)}
            </span>
          </div>
          {hasTaxableInKindBenefits && (
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-zinc-400">
                Taxable in-kind / economic benefits
              </span>
              <span className="text-sm tabular-nums text-zinc-200">
                {formatCurrency(breakdown.taxableInKindBenefits, currency)}
              </span>
            </div>
          )}
          {hasYearEndBonus && (
            <>
              <div className="flex items-center justify-between py-1">
                <span className="text-sm text-zinc-400">
                  Annual one-time bonus
                </span>
                <span className="text-sm tabular-nums text-zinc-200">
                  {formatCurrency(breakdown.yearEndBonus, currency)}
                </span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-sm text-zinc-400">Bonus tax treatment</span>
                <span className="text-sm tabular-nums text-zinc-200">
                  {breakdown.yearEndBonusTaxTreatment === "separate"
                    ? "Separate preferential"
                    : "Combined with salary"}
                </span>
              </div>
            </>
          )}
          {hasTaxableInKindBenefits && (
            <p className="mt-1 text-xs italic text-zinc-500">
              Taxable gross for IIT includes non-cash benefits:{" "}
              {formatCurrency(breakdown.taxableGrossIncome, currency)}.
            </p>
          )}
        </>
      )}

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
      {breakdown.deductionMode === "foreignAllowanceExemption" && (
        <p className="mt-1 text-xs italic text-zinc-500">
          Foreign allowance exemptions are modeled instead of special additional
          deductions for this tax year.
        </p>
      )}
      {hasYearEndBonus && breakdown.yearEndBonusTaxTreatment === "separate" && (
        <>
          <div className="flex items-center justify-between py-1">
            <span className="text-sm text-zinc-400">
              Separate bonus IIT included
            </span>
            <span className="text-sm tabular-nums text-zinc-200">
              {formatCurrency(taxes.yearEndBonusTax, currency)}
            </span>
          </div>
          <p className="mt-1 text-xs italic text-zinc-500">
            Bonus rate: {formatPercentage(breakdown.yearEndBonusRate)}; quick
            deduction:{" "}
            {formatCurrency(breakdown.yearEndBonusQuickDeduction, currency)}.
          </p>
        </>
      )}

      {hasForeignAllowanceExemptions && (
        <>
          <Separator className="my-2" />
          <p className="pb-1 pt-2 text-xs text-zinc-500">
            Foreign Individual Allowance Exemptions
          </p>
          {breakdown.foreignAllowanceExemptions
            .housingMealsLaundryRelocation > 0 && (
            <DeductionRow
              label="Housing / meals / laundry / relocation"
              amount={
                breakdown.foreignAllowanceExemptions
                  .housingMealsLaundryRelocation
              }
              grossSalary={grossSalary}
              currency={currency}
            />
          )}
          {breakdown.foreignAllowanceExemptions.businessTravelAllowance > 0 && (
            <DeductionRow
              label="Business travel allowance"
              amount={breakdown.foreignAllowanceExemptions.businessTravelAllowance}
              grossSalary={grossSalary}
              currency={currency}
            />
          )}
          {breakdown.foreignAllowanceExemptions.homeLeaveTravel > 0 && (
            <DeductionRow
              label="Home leave travel"
              amount={breakdown.foreignAllowanceExemptions.homeLeaveTravel}
              grossSalary={grossSalary}
              currency={currency}
            />
          )}
          {breakdown.foreignAllowanceExemptions.languageTraining > 0 && (
            <DeductionRow
              label="Language training"
              amount={breakdown.foreignAllowanceExemptions.languageTraining}
              grossSalary={grossSalary}
              currency={currency}
            />
          )}
          {breakdown.foreignAllowanceExemptions.childrenEducation > 0 && (
            <DeductionRow
              label="Children's education"
              amount={breakdown.foreignAllowanceExemptions.childrenEducation}
              grossSalary={grossSalary}
              currency={currency}
            />
          )}
        </>
      )}

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
              <span className="text-sm text-zinc-400">Degree continuing education</span>
              <span className="text-sm tabular-nums text-zinc-500">
                {formatCurrency(breakdown.specialDeductions.continuingEducation, currency)}/yr
              </span>
            </div>
          )}
          {breakdown.specialDeductions.professionalQualificationEducation > 0 && (
            <div className="flex items-center justify-between py-1 opacity-60">
              <span className="text-sm text-zinc-400">Professional qualification</span>
              <span className="text-sm tabular-nums text-zinc-500">
                {formatCurrency(
                  breakdown.specialDeductions.professionalQualificationEducation,
                  currency
                )}/yr
              </span>
            </div>
          )}
          {breakdown.specialDeductions.majorIllnessMedical > 0 && (
            <div className="flex items-center justify-between py-1 opacity-60">
              <span className="text-sm text-zinc-400">Major illness medical</span>
              <span className="text-sm tabular-nums text-zinc-500">
                {formatCurrency(breakdown.specialDeductions.majorIllnessMedical, currency)}/yr
              </span>
            </div>
          )}
        </>
      )}

      {hasVoluntaryDeductions && (
        <>
          <Separator className="my-2" />
          <p className="pb-1 pt-2 text-xs text-zinc-500">
            Resident Pension / Insurance / Donation Deductions
          </p>
          {breakdown.voluntaryDeductions.enterpriseAnnuityContribution > 0 && (
            <DeductionRow
              label="Enterprise / occupational annuity"
              amount={breakdown.voluntaryDeductions.enterpriseAnnuityContribution}
              grossSalary={grossSalary}
              currency={currency}
            />
          )}
          {breakdown.voluntaryDeductions.individualPensionContribution > 0 && (
            <DeductionRow
              label="Individual pension"
              amount={breakdown.voluntaryDeductions.individualPensionContribution}
              grossSalary={grossSalary}
              currency={currency}
            />
          )}
          {breakdown.voluntaryDeductions.taxPreferredHealthInsurance > 0 && (
            <DeductionRow
              label="Tax-preferred health insurance"
              amount={breakdown.voluntaryDeductions.taxPreferredHealthInsurance}
              grossSalary={grossSalary}
              currency={currency}
            />
          )}
          {breakdown.voluntaryDeductions.charitableDonations > 0 && (
            <DeductionRow
              label="Approved charity donations"
              amount={breakdown.voluntaryDeductions.charitableDonations}
              grossSalary={grossSalary}
              currency={currency}
            />
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

      <ResultNotes
        countryName="China"
        assumptions={[
          "Resident salary IIT uses the annual comprehensive-income method, standard deduction, selected special additional deductions, and selected bonus treatment.",
          "Social insurance and housing fund use the selected modeled city/ceiling assumptions and the user-selected housing-fund rate.",
        ]}
        exclusions={[
          "Employer social insurance, employer housing fund matching, local city variations, employer plan eligibility, self-employment tax, foreigner treaty positions, and benefit valuation or exemption-documentation reviews require separate facts.",
        ]}
        sourceUrls={CN_SOURCE_URLS}
      />
    </>
  );
}
