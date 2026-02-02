"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { CalculationResult, PayFrequency } from "@/lib/countries/types";
import {
  getStateCalculator,
  hasNoIncomeTax,
} from "@/lib/countries/us/state-tax";
import {
  formatCurrency,
  formatCurrencyWithCents,
  formatPercentage,
} from "@/lib/format";
import { toPng } from "html-to-image";
import { useRef, useState } from "react";
import { DeductionRow } from "./deduction-row";

interface MultiCountryResultsProps {
  result: CalculationResult;
  usState?: string; // Only for US
  usContributions?: {
    traditional401k: number;
    rothIRA: number;
    hsa: number;
  };
}

function getFrequencyLabel(frequency: PayFrequency): string {
  switch (frequency) {
    case "annual":
      return "year";
    case "monthly":
      return "month";
    case "biweekly":
      return "pay period";
    case "weekly":
      return "week";
  }
}

export function MultiCountryResults({
  result,
  usState,
  usContributions,
}: MultiCountryResultsProps) {
  const { taxes, grossSalary, country, currency } = result;
  const frequencyLabel = getFrequencyLabel(result.perPeriod.frequency);
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Determine which country-specific breakdown to show
  const isUS = country === "US";
  const isSG = country === "SG";
  const isKR = country === "KR";
  const isNL = country === "NL";
  const isAU = country === "AU";
  const isPT = country === "PT";
  const isTH = country === "TH";
  const isHK = country === "HK";
  const isID = country === "ID";
  const isCH = country === "CH";

  // US-specific data
  let stateName = usState || "";
  let isNoTaxState = false;
  let hasStateTaxes = false;

  if (isUS && usState) {
    const stateCalculator = getStateCalculator(usState);
    stateName = stateCalculator?.getStateName() ?? usState;
    isNoTaxState = hasNoIncomeTax(usState);
    if ("stateIncomeTax" in taxes && "stateDisabilityInsurance" in taxes) {
      hasStateTaxes =
        taxes.stateIncomeTax > 0 || taxes.stateDisabilityInsurance > 0;
    }
  }

  const handleDownload = async () => {
    if (!cardRef.current || isDownloading) {
      return;
    }

    setIsDownloading(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        filter: (node) =>
          !(
            node instanceof HTMLElement &&
            node.dataset.downloadButton === "true"
          ),
      });
      const link = document.createElement("a");
      link.href = dataUrl;
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      link.download = `take-home-pay-${timestamp}.png`;
      link.click();
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Card className="sticky top-6" ref={cardRef}>
      <CardHeader className="pb-4 flex-row items-center justify-between space-y-0">
        <CardTitle className="text-lg font-medium text-zinc-300">
          Take-Home Pay
        </CardTitle>
        <button
          type="button"
          onClick={handleDownload}
          disabled={isDownloading}
          data-download-button="true"
          aria-label="Download take-home pay section"
          className="inline-flex items-center justify-center rounded-md border border-zinc-800 bg-zinc-900/80 p-2 text-zinc-300 transition cursor-pointer hover:text-zinc-100 hover:border-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 3v12" />
            <path d="m7 10 5 5 5-5" />
            <path d="M5 21h14" />
          </svg>
        </button>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Net Amount */}
        <div className="text-center py-4">
          <div className="text-5xl font-bold text-emerald-400 tracking-tight">
            {formatCurrency(result.netSalary, currency)}
          </div>
          <div className="text-zinc-500 text-sm mt-2">
            {formatCurrencyWithCents(result.perPeriod.net, currency)} per{" "}
            {frequencyLabel}
          </div>
        </div>

        {/* Effective Tax Rate */}
        <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
          <span className="text-sm text-zinc-400">Effective Tax Rate</span>
          <span className="text-lg font-semibold text-zinc-200">
            {formatPercentage(result.effectiveTaxRate)}
          </span>
        </div>

        <Separator />

        {/* Breakdown */}
        <div className="space-y-1">
          <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">
            Breakdown
          </h4>

          {/* Gross */}
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-zinc-300 font-medium">
              Gross Salary
            </span>
            <span className="text-sm font-medium text-zinc-200 tabular-nums">
              {formatCurrency(grossSalary, currency)}
            </span>
          </div>

          <Separator className="my-2" />

          {/* US Tax Breakdown - check for stateIncomeTax to distinguish from Switzerland */}
          {isUS && "federalIncomeTax" in taxes && "stateIncomeTax" in taxes && (
            <>
              <p className="text-xs text-zinc-500 pt-2 pb-1">Federal Taxes</p>
              <DeductionRow
                label="Federal Income Tax"
                amount={taxes.federalIncomeTax}
                grossSalary={grossSalary}
                currency={currency}
              />
              <DeductionRow
                label="Social Security"
                amount={taxes.socialSecurity}
                grossSalary={grossSalary}
                currency={currency}
              />
              <DeductionRow
                label="Medicare"
                amount={taxes.medicare}
                grossSalary={grossSalary}
                currency={currency}
              />
              {taxes.additionalMedicare > 0 && (
                <DeductionRow
                  label="Additional Medicare"
                  amount={taxes.additionalMedicare}
                  grossSalary={grossSalary}
                  currency={currency}
                />
              )}

              {/* State Taxes - only show if there are any */}
              {hasStateTaxes && (
                <>
                  <Separator className="my-2" />
                  <p className="text-xs text-zinc-500 pt-2 pb-1">
                    {stateName} Taxes
                  </p>
                  {taxes.stateIncomeTax > 0 && (
                    <DeductionRow
                      label="State Income Tax"
                      amount={taxes.stateIncomeTax}
                      grossSalary={grossSalary}
                      currency={currency}
                    />
                  )}
                  {taxes.stateDisabilityInsurance > 0 && (
                    <DeductionRow
                      label="State Disability Insurance"
                      amount={taxes.stateDisabilityInsurance}
                      grossSalary={grossSalary}
                      currency={currency}
                    />
                  )}
                </>
              )}

              {/* No State Tax Badge */}
              {isNoTaxState && (
                <>
                  <Separator className="my-2" />
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-zinc-400">
                      {stateName} State Tax
                    </span>
                    <span className="text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded">
                      No State Income Tax
                    </span>
                  </div>
                </>
              )}

              {/* US Contributions */}
              {usContributions &&
                (usContributions.traditional401k > 0 ||
                  usContributions.rothIRA > 0 ||
                  usContributions.hsa > 0) && (
                  <>
                    <Separator className="my-2" />
                    <p className="text-xs text-zinc-500 pt-2 pb-1">
                      Contributions
                    </p>
                    {usContributions.traditional401k > 0 && (
                      <DeductionRow
                        label="401(k)"
                        amount={usContributions.traditional401k}
                        grossSalary={grossSalary}
                        currency={currency}
                      />
                    )}
                    {usContributions.hsa > 0 && (
                      <DeductionRow
                        label="HSA"
                        amount={usContributions.hsa}
                        grossSalary={grossSalary}
                        currency={currency}
                      />
                    )}
                    {usContributions.rothIRA > 0 && (
                      <DeductionRow
                        label="Roth IRA"
                        amount={usContributions.rothIRA}
                        grossSalary={grossSalary}
                        currency={currency}
                      />
                    )}
                  </>
                )}
            </>
          )}

          {/* SG Tax Breakdown */}
          {isSG && "cpfEmployee" in taxes && result.breakdown.type === "SG" && (
            <>
              {/* Tax Reliefs Info */}
              {result.breakdown.taxReliefs.totalReliefs > 0 && (
                <>
                  <p className="text-xs text-zinc-500 pt-2 pb-1">
                    Tax Reliefs Applied
                  </p>
                  {result.breakdown.taxReliefs.earnedIncomeRelief > 0 && (
                    <div className="flex items-center justify-between py-1">
                      <span className="text-sm text-zinc-400">
                        Earned Income Relief
                      </span>
                      <span className="text-sm text-emerald-400 tabular-nums">
                        -
                        {formatCurrency(
                          result.breakdown.taxReliefs.earnedIncomeRelief,
                          currency,
                        )}
                      </span>
                    </div>
                  )}
                  {result.breakdown.taxReliefs.cpfRelief > 0 && (
                    <div className="flex items-center justify-between py-1">
                      <span className="text-sm text-zinc-400">CPF Relief</span>
                      <span className="text-sm text-emerald-400 tabular-nums">
                        -
                        {formatCurrency(
                          result.breakdown.taxReliefs.cpfRelief,
                          currency,
                        )}
                      </span>
                    </div>
                  )}
                  {result.breakdown.taxReliefs.srsRelief > 0 && (
                    <div className="flex items-center justify-between py-1">
                      <span className="text-sm text-zinc-400">SRS Relief</span>
                      <span className="text-sm text-emerald-400 tabular-nums">
                        -
                        {formatCurrency(
                          result.breakdown.taxReliefs.srsRelief,
                          currency,
                        )}
                      </span>
                    </div>
                  )}
                  {result.breakdown.taxReliefs.voluntaryCpfTopUpRelief > 0 && (
                    <div className="flex items-center justify-between py-1">
                      <span className="text-sm text-zinc-400">
                        CPF Top-up Relief
                      </span>
                      <span className="text-sm text-emerald-400 tabular-nums">
                        -
                        {formatCurrency(
                          result.breakdown.taxReliefs.voluntaryCpfTopUpRelief,
                          currency,
                        )}
                      </span>
                    </div>
                  )}
                  {result.breakdown.taxReliefs.spouseRelief > 0 && (
                    <div className="flex items-center justify-between py-1">
                      <span className="text-sm text-zinc-400">
                        Spouse Relief
                      </span>
                      <span className="text-sm text-emerald-400 tabular-nums">
                        -
                        {formatCurrency(
                          result.breakdown.taxReliefs.spouseRelief,
                          currency,
                        )}
                      </span>
                    </div>
                  )}
                  {result.breakdown.taxReliefs.childRelief > 0 && (
                    <div className="flex items-center justify-between py-1">
                      <span className="text-sm text-zinc-400">
                        Child Relief
                      </span>
                      <span className="text-sm text-emerald-400 tabular-nums">
                        -
                        {formatCurrency(
                          result.breakdown.taxReliefs.childRelief,
                          currency,
                        )}
                      </span>
                    </div>
                  )}
                  {result.breakdown.taxReliefs.workingMotherRelief > 0 && (
                    <div className="flex items-center justify-between py-1">
                      <span className="text-sm text-zinc-400">
                        Working Mother&apos;s Relief
                      </span>
                      <span className="text-sm text-emerald-400 tabular-nums">
                        -
                        {formatCurrency(
                          result.breakdown.taxReliefs.workingMotherRelief,
                          currency,
                        )}
                      </span>
                    </div>
                  )}
                  {result.breakdown.taxReliefs.parentRelief > 0 && (
                    <div className="flex items-center justify-between py-1">
                      <span className="text-sm text-zinc-400">
                        Parent Relief
                      </span>
                      <span className="text-sm text-emerald-400 tabular-nums">
                        -
                        {formatCurrency(
                          result.breakdown.taxReliefs.parentRelief,
                          currency,
                        )}
                      </span>
                    </div>
                  )}
                  {result.breakdown.taxReliefs.courseFeesRelief > 0 && (
                    <div className="flex items-center justify-between py-1">
                      <span className="text-sm text-zinc-400">
                        Course Fees Relief
                      </span>
                      <span className="text-sm text-emerald-400 tabular-nums">
                        -
                        {formatCurrency(
                          result.breakdown.taxReliefs.courseFeesRelief,
                          currency,
                        )}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between py-1 border-t border-zinc-700 mt-1">
                    <span className="text-sm text-zinc-300">
                      Chargeable Income
                    </span>
                    <span className="text-sm text-zinc-200 tabular-nums">
                      {formatCurrency(
                        result.breakdown.chargeableIncome,
                        currency,
                      )}
                    </span>
                  </div>
                  <Separator className="my-2" />
                </>
              )}

              <p className="text-xs text-zinc-500 pt-2 pb-1">Income Tax</p>
              <DeductionRow
                label="Singapore Income Tax"
                amount={taxes.incomeTax}
                grossSalary={grossSalary}
                currency={currency}
              />
              {result.breakdown.grossTaxBeforeReliefs > taxes.incomeTax && (
                <p className="text-xs text-zinc-500 italic mt-1">
                  Tax before reliefs:{" "}
                  {formatCurrency(
                    result.breakdown.grossTaxBeforeReliefs,
                    currency,
                  )}{" "}
                  (per IRAS table)
                </p>
              )}

              <Separator className="my-2" />
              <p className="text-xs text-zinc-500 pt-2 pb-1">
                CPF Contributions
              </p>

              {/* Show CPF rate and ceiling info */}
              {result.breakdown.cpfEmployeeRate > 0 && (
                <p className="text-xs text-zinc-400 mb-2">
                  Rate: {(result.breakdown.cpfEmployeeRate * 100).toFixed(0)}%
                  of wages up to S$
                  {result.breakdown.cpfMonthlyCeiling.toLocaleString()}/month
                </p>
              )}

              <DeductionRow
                label="CPF (Employee)"
                amount={taxes.cpfEmployee}
                grossSalary={grossSalary}
                currency={currency}
              />

              {/* Show effective vs actual rate when ceiling applies */}
              {grossSalary / 12 > result.breakdown.cpfMonthlyCeiling &&
                result.breakdown.cpfEmployeeRate > 0 && (
                  <p className="text-xs text-zinc-500 italic mt-1">
                    Effective rate:{" "}
                    {formatPercentage(taxes.cpfEmployee / grossSalary)} (capped
                    at S${result.breakdown.cpfMonthlyCeiling.toLocaleString()}
                    /month ceiling)
                  </p>
                )}

              <div className="flex items-center justify-between py-2 opacity-60">
                <span className="text-sm text-zinc-400">CPF (Employer)</span>
                <span className="text-sm text-zinc-500 tabular-nums">
                  +{formatCurrency(taxes.cpfEmployer, currency)}
                </span>
              </div>
              <p className="text-xs text-zinc-500 italic">
                Employer CPF is additional and not deducted from your salary
              </p>

              {/* SG Breakdown Details */}
              {result.breakdown.voluntaryContributions > 0 && (
                <>
                  <Separator className="my-2" />
                  <p className="text-xs text-zinc-500 pt-2 pb-1">
                    Voluntary Contributions
                  </p>
                  <DeductionRow
                    label="Tax-Saving Contributions"
                    amount={result.breakdown.voluntaryContributions}
                    grossSalary={grossSalary}
                    currency={currency}
                  />
                </>
              )}

              {/* Additional reliefs disclaimer */}
              <Separator className="my-2" />
              <div className="bg-zinc-800/50 rounded-lg p-3 mt-2">
                <p className="text-xs text-zinc-400 font-medium mb-1">
                  Other reliefs not included:
                </p>
                <p className="text-xs text-zinc-500">
                  Life insurance, donations, NSman, handicapped dependant,
                  grandparent caregiver reliefs
                </p>
              </div>
            </>
          )}

          {/* KR Tax Breakdown */}
          {isKR &&
            "nationalPension" in taxes &&
            result.breakdown.type === "KR" && (
              <>
                {/* Non-Taxable Income */}
                {result.breakdown.nonTaxableIncome.total > 0 && (
                  <>
                    <p className="text-xs text-zinc-500 pt-2 pb-1">
                      Non-Taxable Income
                    </p>
                    {result.breakdown.nonTaxableIncome.mealAllowance > 0 && (
                      <div className="flex items-center justify-between py-1">
                        <span className="text-sm text-zinc-400">
                          Meal Allowance (식대)
                        </span>
                        <span className="text-sm text-emerald-400 tabular-nums">
                          -
                          {formatCurrency(
                            result.breakdown.nonTaxableIncome.mealAllowance,
                            currency,
                          )}
                        </span>
                      </div>
                    )}
                    {result.breakdown.nonTaxableIncome.childcareAllowance >
                      0 && (
                      <div className="flex items-center justify-between py-1">
                        <span className="text-sm text-zinc-400">
                          Childcare Allowance (자녀보육수당)
                        </span>
                        <span className="text-sm text-emerald-400 tabular-nums">
                          -
                          {formatCurrency(
                            result.breakdown.nonTaxableIncome
                              .childcareAllowance,
                            currency,
                          )}
                        </span>
                      </div>
                    )}
                    <Separator className="my-2" />
                  </>
                )}

                {/* Tax Deductions Applied */}
                {result.breakdown.incomeDeductions.totalDeductions >
                  result.breakdown.incomeDeductions.basicDeduction && (
                  <>
                    <p className="text-xs text-zinc-500 pt-2 pb-1">
                      Tax Deductions Applied
                    </p>
                    {result.breakdown.incomeDeductions
                      .employmentIncomeDeduction > 0 && (
                      <div className="flex items-center justify-between py-1">
                        <span className="text-sm text-zinc-400">
                          Employment Income Deduction
                        </span>
                        <span className="text-sm text-emerald-400 tabular-nums">
                          -
                          {formatCurrency(
                            result.breakdown.incomeDeductions
                              .employmentIncomeDeduction,
                            currency,
                          )}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between py-1">
                      <span className="text-sm text-zinc-400">
                        Basic Deduction
                      </span>
                      <span className="text-sm text-emerald-400 tabular-nums">
                        -
                        {formatCurrency(
                          result.breakdown.incomeDeductions.basicDeduction,
                          currency,
                        )}
                      </span>
                    </div>
                    {result.breakdown.incomeDeductions.dependentDeduction >
                      0 && (
                      <div className="flex items-center justify-between py-1">
                        <span className="text-sm text-zinc-400">
                          Dependent Deduction
                        </span>
                        <span className="text-sm text-emerald-400 tabular-nums">
                          -
                          {formatCurrency(
                            result.breakdown.incomeDeductions
                              .dependentDeduction,
                            currency,
                          )}
                        </span>
                      </div>
                    )}
                    {result.breakdown.incomeDeductions.childDeduction > 0 && (
                      <div className="flex items-center justify-between py-1">
                        <span className="text-sm text-zinc-400">
                          Child Deduction
                        </span>
                        <span className="text-sm text-emerald-400 tabular-nums">
                          -
                          {formatCurrency(
                            result.breakdown.incomeDeductions.childDeduction,
                            currency,
                          )}
                        </span>
                      </div>
                    )}
                    {result.breakdown.incomeDeductions.childUnder7Deduction >
                      0 && (
                      <div className="flex items-center justify-between py-1">
                        <span className="text-sm text-zinc-400">
                          Child Under 7 Deduction
                        </span>
                        <span className="text-sm text-emerald-400 tabular-nums">
                          -
                          {formatCurrency(
                            result.breakdown.incomeDeductions
                              .childUnder7Deduction,
                            currency,
                          )}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between py-1 border-t border-zinc-700 mt-1">
                      <span className="text-sm text-zinc-300">
                        Taxable Income
                      </span>
                      <span className="text-sm text-zinc-200 tabular-nums">
                        {formatCurrency(
                          result.breakdown.taxableIncome,
                          currency,
                        )}
                      </span>
                    </div>
                    <Separator className="my-2" />
                  </>
                )}

                {/* Tax Calculation Flow */}
                <p className="text-xs text-zinc-500 pt-2 pb-1">Income Tax Calculation</p>
                
                {/* Gross Tax (before credits) */}
                <div className="flex items-center justify-between py-1">
                  <span className="text-sm text-zinc-400">
                    Gross Tax (before credits)
                  </span>
                  <span className="text-sm text-zinc-300 tabular-nums">
                    {formatCurrency(
                      result.breakdown.taxDetails.grossIncomeTax,
                      currency,
                    )}
                  </span>
                </div>

                {/* Tax Credits - shown as reductions */}
                {result.breakdown.taxCredits.totalCredits > 0 && (
                  <>
                    <p className="text-xs text-zinc-500 pt-3 pb-1">
                      Tax Credits (세액공제)
                    </p>
                    {result.breakdown.taxCredits.wageEarnerCredit > 0 && (
                      <div className="flex items-center justify-between py-1">
                        <span className="text-sm text-zinc-400">
                          Wage Earner Credit
                        </span>
                        <span className="text-sm text-emerald-400 tabular-nums">
                          -
                          {formatCurrency(
                            result.breakdown.taxCredits.wageEarnerCredit,
                            currency,
                          )}
                        </span>
                      </div>
                    )}
                    {result.breakdown.taxCredits.standardCredit > 0 && (
                      <div className="flex items-center justify-between py-1">
                        <span className="text-sm text-zinc-400">
                          Standard Credit
                        </span>
                        <span className="text-sm text-emerald-400 tabular-nums">
                          -
                          {formatCurrency(
                            result.breakdown.taxCredits.standardCredit,
                            currency,
                          )}
                        </span>
                      </div>
                    )}
                    {result.breakdown.taxCredits.childTaxCredit > 0 && (
                      <div className="flex items-center justify-between py-1">
                        <span className="text-sm text-zinc-400">
                          Child Tax Credit
                        </span>
                        <span className="text-sm text-emerald-400 tabular-nums">
                          -
                          {formatCurrency(
                            result.breakdown.taxCredits.childTaxCredit,
                            currency,
                          )}
                        </span>
                      </div>
                    )}
                    {result.breakdown.taxCredits.pensionCredit > 0 && (
                      <div className="flex items-center justify-between py-1">
                        <span className="text-sm text-zinc-400">
                          Pension Credit (IRP)
                        </span>
                        <span className="text-sm text-emerald-400 tabular-nums">
                          -
                          {formatCurrency(
                            result.breakdown.taxCredits.pensionCredit,
                            currency,
                          )}
                        </span>
                      </div>
                    )}
                    {result.breakdown.taxCredits.insuranceCredit > 0 && (
                      <div className="flex items-center justify-between py-1">
                        <span className="text-sm text-zinc-400">
                          Insurance Premium Credit
                        </span>
                        <span className="text-sm text-emerald-400 tabular-nums">
                          -
                          {formatCurrency(
                            result.breakdown.taxCredits.insuranceCredit,
                            currency,
                          )}
                        </span>
                      </div>
                    )}
                    {result.breakdown.taxCredits.medicalCredit > 0 && (
                      <div className="flex items-center justify-between py-1">
                        <span className="text-sm text-zinc-400">
                          Medical Expense Credit
                        </span>
                        <span className="text-sm text-emerald-400 tabular-nums">
                          -
                          {formatCurrency(
                            result.breakdown.taxCredits.medicalCredit,
                            currency,
                          )}
                        </span>
                      </div>
                    )}
                    {result.breakdown.taxCredits.educationCredit > 0 && (
                      <div className="flex items-center justify-between py-1">
                        <span className="text-sm text-zinc-400">
                          Education Expense Credit
                        </span>
                        <span className="text-sm text-emerald-400 tabular-nums">
                          -
                          {formatCurrency(
                            result.breakdown.taxCredits.educationCredit,
                            currency,
                          )}
                        </span>
                      </div>
                    )}
                    {result.breakdown.taxCredits.donationCredit > 0 && (
                      <div className="flex items-center justify-between py-1">
                        <span className="text-sm text-zinc-400">
                          Donation Credit
                        </span>
                        <span className="text-sm text-emerald-400 tabular-nums">
                          -
                          {formatCurrency(
                            result.breakdown.taxCredits.donationCredit,
                            currency,
                          )}
                        </span>
                      </div>
                    )}
                    {result.breakdown.taxCredits.rentCredit > 0 && (
                      <div className="flex items-center justify-between py-1">
                        <span className="text-sm text-zinc-400">
                          Rent Credit (월세)
                        </span>
                        <span className="text-sm text-emerald-400 tabular-nums">
                          -
                          {formatCurrency(
                            result.breakdown.taxCredits.rentCredit,
                            currency,
                          )}
                        </span>
                      </div>
                    )}
                    
                    {/* Total Credits */}
                    <div className="flex items-center justify-between py-1 border-t border-zinc-700/50 mt-1">
                      <span className="text-sm text-zinc-300">
                        Total Credits
                      </span>
                      <span className="text-sm text-emerald-400 tabular-nums font-medium">
                        -
                        {formatCurrency(
                          result.breakdown.taxCredits.totalCredits,
                          currency,
                        )}
                      </span>
                    </div>
                  </>
                )}

                {/* Final National Tax */}
                <div className="flex items-center justify-between py-2 border-t border-zinc-700 mt-1">
                  <span className="text-sm text-zinc-200 font-medium">
                    National Income Tax
                  </span>
                  <span className="text-sm text-zinc-200 tabular-nums font-medium">
                    {formatCurrency(
                      result.breakdown.taxDetails.finalIncomeTax,
                      currency,
                    )}
                  </span>
                </div>
                
                {/* Show warning when credits exceed tax */}
                {result.breakdown.taxCredits.totalCredits > result.breakdown.taxDetails.grossIncomeTax && (
                  <p className="text-xs text-amber-400 italic mt-1">
                    Credits exceed gross tax — no income tax due
                  </p>
                )}

                <DeductionRow
                  label="Local Income Tax (10%)"
                  amount={taxes.localIncomeTax}
                  grossSalary={grossSalary}
                  currency={currency}
                />

                <Separator className="my-2" />
                <p className="text-xs text-zinc-500 pt-2 pb-1">
                  Social Insurance (4 Major Insurance)
                </p>

                <DeductionRow
                  label="National Pension"
                  amount={taxes.nationalPension}
                  grossSalary={grossSalary}
                  currency={currency}
                />
                <p className="text-xs text-zinc-500 italic -mt-1 mb-1">
                  {(
                    result.breakdown.socialInsurance.nationalPensionRate * 100
                  ).toFixed(1)}
                  % of monthly income (capped)
                </p>

                <DeductionRow
                  label="Health Insurance"
                  amount={taxes.nationalHealthInsurance}
                  grossSalary={grossSalary}
                  currency={currency}
                />

                <DeductionRow
                  label="Long-term Care"
                  amount={taxes.longTermCareInsurance}
                  grossSalary={grossSalary}
                  currency={currency}
                />
                <p className="text-xs text-zinc-500 italic -mt-1 mb-1">
                  {(
                    result.breakdown.socialInsurance.longTermCareRate * 100
                  ).toFixed(2)}
                  % of health insurance
                </p>

                <DeductionRow
                  label="Employment Insurance"
                  amount={taxes.employmentInsurance}
                  grossSalary={grossSalary}
                  currency={currency}
                />

                {/* Social Insurance Summary */}
                <div className="flex items-center justify-between py-2 border-t border-zinc-700 mt-2">
                  <span className="text-sm text-zinc-300">
                    Total Social Insurance
                  </span>
                  <span className="text-sm text-zinc-200 tabular-nums">
                    {formatCurrency(
                      result.breakdown.socialInsurance.totalSocialInsurance,
                      currency,
                    )}
                  </span>
                </div>

                <Separator className="my-2" />
                <div className="bg-zinc-800/50 rounded-lg p-3 mt-2">
                  <p className="text-xs text-zinc-400 font-medium mb-1">
                    About Tax Credits:
                  </p>
                  <p className="text-xs text-zinc-500">
                    Tax credits reduce your tax bill dollar-for-dollar. If credits 
                    exceed your gross tax, you pay ₩0 in income tax (but still owe 
                    social insurance contributions).
                  </p>
                </div>
              </>
            )}

          {/* HK Tax Breakdown */}
          {isHK &&
            "mpfEmployee" in taxes &&
            result.breakdown.type === "HK" && (
              <>
                <p className="text-xs text-zinc-500 pt-2 pb-1">
                  Allowances &amp; Deductions
                </p>
                {result.breakdown.deductions.totalDeductions > 0 && (
                  <>
                    {result.breakdown.deductions.mandatoryMpf > 0 && (
                      <div className="flex items-center justify-between py-1">
                        <span className="text-sm text-zinc-400">
                          MPF Mandatory Contributions
                        </span>
                        <span className="text-sm text-emerald-400 tabular-nums">
                          -
                          {formatCurrency(
                            result.breakdown.deductions.mandatoryMpf,
                            currency,
                          )}
                        </span>
                      </div>
                    )}
                    {result.breakdown.deductions.voluntaryMpfAnnuity > 0 && (
                      <div className="flex items-center justify-between py-1">
                        <span className="text-sm text-zinc-400">
                          MPF TVC + QDAP
                        </span>
                        <span className="text-sm text-emerald-400 tabular-nums">
                          -
                          {formatCurrency(
                            result.breakdown.deductions.voluntaryMpfAnnuity,
                            currency,
                          )}
                        </span>
                      </div>
                    )}
                    {result.breakdown.deductions.selfEducation > 0 && (
                      <div className="flex items-center justify-between py-1">
                        <span className="text-sm text-zinc-400">
                          Self-education Expenses
                        </span>
                        <span className="text-sm text-emerald-400 tabular-nums">
                          -
                          {formatCurrency(
                            result.breakdown.deductions.selfEducation,
                            currency,
                          )}
                        </span>
                      </div>
                    )}
                    {result.breakdown.deductions.homeLoanInterest > 0 && (
                      <div className="flex items-center justify-between py-1">
                        <span className="text-sm text-zinc-400">
                          Home Loan Interest
                        </span>
                        <span className="text-sm text-emerald-400 tabular-nums">
                          -
                          {formatCurrency(
                            result.breakdown.deductions.homeLoanInterest,
                            currency,
                          )}
                        </span>
                      </div>
                    )}
                    {result.breakdown.deductions.domesticRent > 0 && (
                      <div className="flex items-center justify-between py-1">
                        <span className="text-sm text-zinc-400">
                          Domestic Rent
                        </span>
                        <span className="text-sm text-emerald-400 tabular-nums">
                          -
                          {formatCurrency(
                            result.breakdown.deductions.domesticRent,
                            currency,
                          )}
                        </span>
                      </div>
                    )}
                    {result.breakdown.deductions.elderlyResidentialCare > 0 && (
                      <div className="flex items-center justify-between py-1">
                        <span className="text-sm text-zinc-400">
                          Elderly Residential Care
                        </span>
                        <span className="text-sm text-emerald-400 tabular-nums">
                          -
                          {formatCurrency(
                            result.breakdown.deductions.elderlyResidentialCare,
                            currency,
                          )}
                        </span>
                      </div>
                    )}
                    {result.breakdown.deductions.charitableDonations > 0 && (
                      <div className="flex items-center justify-between py-1">
                        <span className="text-sm text-zinc-400">
                          Charitable Donations
                        </span>
                        <span className="text-sm text-emerald-400 tabular-nums">
                          -
                          {formatCurrency(
                            result.breakdown.deductions.charitableDonations,
                            currency,
                          )}
                        </span>
                      </div>
                    )}
                  </>
                )}
                {result.breakdown.allowances.totalAllowances > 0 && (
                  <>
                    <p className="text-xs text-zinc-500 pt-3 pb-1">
                      Allowances Applied
                    </p>
                    {result.breakdown.allowances.basic > 0 && (
                      <div className="flex items-center justify-between py-1">
                        <span className="text-sm text-zinc-400">
                          Basic Allowance
                        </span>
                        <span className="text-sm text-emerald-400 tabular-nums">
                          -
                          {formatCurrency(
                            result.breakdown.allowances.basic,
                            currency,
                          )}
                        </span>
                      </div>
                    )}
                    {result.breakdown.allowances.married > 0 && (
                      <div className="flex items-center justify-between py-1">
                        <span className="text-sm text-zinc-400">
                          Married Person&apos;s Allowance
                        </span>
                        <span className="text-sm text-emerald-400 tabular-nums">
                          -
                          {formatCurrency(
                            result.breakdown.allowances.married,
                            currency,
                          )}
                        </span>
                      </div>
                    )}
                    {result.breakdown.allowances.singleParent > 0 && (
                      <div className="flex items-center justify-between py-1">
                        <span className="text-sm text-zinc-400">
                          Single Parent Allowance
                        </span>
                        <span className="text-sm text-emerald-400 tabular-nums">
                          -
                          {formatCurrency(
                            result.breakdown.allowances.singleParent,
                            currency,
                          )}
                        </span>
                      </div>
                    )}
                    {result.breakdown.allowances.child > 0 && (
                      <div className="flex items-center justify-between py-1">
                        <span className="text-sm text-zinc-400">
                          Child Allowance
                        </span>
                        <span className="text-sm text-emerald-400 tabular-nums">
                          -
                          {formatCurrency(
                            result.breakdown.allowances.child,
                            currency,
                          )}
                        </span>
                      </div>
                    )}
                    {result.breakdown.allowances.newbornChild > 0 && (
                      <div className="flex items-center justify-between py-1">
                        <span className="text-sm text-zinc-400">
                          Newborn Child Allowance
                        </span>
                        <span className="text-sm text-emerald-400 tabular-nums">
                          -
                          {formatCurrency(
                            result.breakdown.allowances.newbornChild,
                            currency,
                          )}
                        </span>
                      </div>
                    )}
                    {result.breakdown.allowances.dependentParent > 0 && (
                      <div className="flex items-center justify-between py-1">
                        <span className="text-sm text-zinc-400">
                          Dependent Parent/Grandparent
                        </span>
                        <span className="text-sm text-emerald-400 tabular-nums">
                          -
                          {formatCurrency(
                            result.breakdown.allowances.dependentParent,
                            currency,
                          )}
                        </span>
                      </div>
                    )}
                    {result.breakdown.allowances.dependentParentLivingWith > 0 && (
                      <div className="flex items-center justify-between py-1">
                        <span className="text-sm text-zinc-400">
                          Parent Living With You
                        </span>
                        <span className="text-sm text-emerald-400 tabular-nums">
                          -
                          {formatCurrency(
                            result.breakdown.allowances.dependentParentLivingWith,
                            currency,
                          )}
                        </span>
                      </div>
                    )}
                    {result.breakdown.allowances.dependentSibling > 0 && (
                      <div className="flex items-center justify-between py-1">
                        <span className="text-sm text-zinc-400">
                          Dependent Sibling
                        </span>
                        <span className="text-sm text-emerald-400 tabular-nums">
                          -
                          {formatCurrency(
                            result.breakdown.allowances.dependentSibling,
                            currency,
                          )}
                        </span>
                      </div>
                    )}
                    {result.breakdown.allowances.disability > 0 && (
                      <div className="flex items-center justify-between py-1">
                        <span className="text-sm text-zinc-400">
                          Personal Disability
                        </span>
                        <span className="text-sm text-emerald-400 tabular-nums">
                          -
                          {formatCurrency(
                            result.breakdown.allowances.disability,
                            currency,
                          )}
                        </span>
                      </div>
                    )}
                    {result.breakdown.allowances.disabledDependent > 0 && (
                      <div className="flex items-center justify-between py-1">
                        <span className="text-sm text-zinc-400">
                          Disabled Dependent
                        </span>
                        <span className="text-sm text-emerald-400 tabular-nums">
                          -
                          {formatCurrency(
                            result.breakdown.allowances.disabledDependent,
                            currency,
                          )}
                        </span>
                      </div>
                    )}
                  </>
                )}
                <div className="flex items-center justify-between py-1 border-t border-zinc-700 mt-2">
                  <span className="text-sm text-zinc-300">
                    Net Chargeable Income
                  </span>
                  <span className="text-sm text-zinc-200 tabular-nums">
                    {formatCurrency(
                      result.breakdown.netChargeableIncome,
                      currency,
                    )}
                  </span>
                </div>
                <Separator className="my-2" />

                <p className="text-xs text-zinc-500 pt-2 pb-1">Salaries Tax</p>
                {(() => {
                  const { progressiveTax, standardTax } =
                    result.breakdown.taxComparison;
                  const usesStandardRate = standardTax <= progressiveTax;
                  const progressiveClass = usesStandardRate
                    ? "text-zinc-500"
                    : "text-zinc-300";
                  const standardClass = usesStandardRate
                    ? "text-zinc-300"
                    : "text-zinc-500";

                  return (
                    <>
                      <p className="text-xs text-zinc-500 italic">
                        Lower tax method is highlighted; the higher one is dimmed.
                      </p>
                      <div className="flex items-center justify-between py-1">
                        <span className={`text-sm ${progressiveClass}`}>
                          Progressive Tax
                        </span>
                        <span
                          className={`text-sm tabular-nums ${
                            usesStandardRate ? "text-zinc-500" : "text-zinc-200"
                          }`}
                        >
                          {formatCurrency(progressiveTax, currency)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-1">
                        <span className={`text-sm ${standardClass}`}>
                          Standard Rate Tax
                        </span>
                        <span
                          className={`text-sm tabular-nums ${
                            usesStandardRate ? "text-zinc-200" : "text-zinc-500"
                          }`}
                        >
                          {formatCurrency(standardTax, currency)}
                        </span>
                      </div>
                    </>
                  );
                })()}
                <DeductionRow
                  label="Final Salaries Tax"
                  amount={taxes.incomeTax}
                  grossSalary={grossSalary}
                  currency={currency}
                />

                <Separator className="my-2" />
                <p className="text-xs text-zinc-500 pt-2 pb-1">
                  MPF Contributions
                </p>
                <DeductionRow
                  label="MPF (Employee)"
                  amount={taxes.mpfEmployee}
                  grossSalary={grossSalary}
                  currency={currency}
                />
                {result.breakdown.mpf.monthlyRelevantIncome > 0 && (
                  <p className="text-xs text-zinc-500 italic mt-1">
                    {(
                      result.breakdown.mpf.rate * 100
                    ).toFixed(1)}
                    % of monthly income up to HK$
                    {result.breakdown.mpf.maxRelevantIncomeMonthly.toLocaleString()}
                    /month (max HK$
                    {result.breakdown.mpf.monthlyCap.toLocaleString()})
                  </p>
                )}

                {result.breakdown.voluntaryContributions
                  .taxDeductibleVoluntaryContributions > 0 && (
                  <>
                    <Separator className="my-2" />
                    <p className="text-xs text-zinc-500 pt-2 pb-1">
                      Voluntary Contributions
                    </p>
                    <DeductionRow
                      label="MPF TVC + QDAP"
                      amount={
                        result.breakdown.voluntaryContributions
                          .taxDeductibleVoluntaryContributions
                      }
                      grossSalary={grossSalary}
                      currency={currency}
                    />
                  </>
                )}
              </>
            )}

          {/* NL Tax Breakdown */}
          {isNL &&
            "incomeTax" in taxes &&
            "socialSecurityTax" in taxes &&
            result.breakdown.type === "NL" && (
              <>
                {result.breakdown.thirtyPercentRulingApplied && (
                  <>
                    <p className="text-xs text-zinc-500 pt-2 pb-1">
                      30% Ruling
                    </p>
                    <div className="flex items-center justify-between py-1">
                      <span className="text-sm text-zinc-400">
                        Tax-Exempt Allowance
                      </span>
                      <span className="text-sm text-emerald-400 tabular-nums">
                        -
                        {formatCurrency(
                          result.breakdown.taxExemptAllowance,
                          currency,
                        )}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-t border-zinc-700 mt-1">
                      <span className="text-sm text-zinc-300">
                        Taxable Income
                      </span>
                      <span className="text-sm text-zinc-200 tabular-nums">
                        {formatCurrency(
                          result.breakdown.taxableIncome,
                          currency,
                        )}
                      </span>
                    </div>
                    <Separator className="my-2" />
                  </>
                )}

                {/* Income Tax (Payroll Tax) - show GROSS amount before credits */}
                <p className="text-xs text-zinc-500 pt-2 pb-1">
                  Income Tax (Inkomstenbelasting)
                </p>
                <DeductionRow
                  label="Payroll Tax"
                  amount={result.breakdown.incomeTaxBreakdown.total}
                  grossSalary={grossSalary}
                  currency={currency}
                />

                <Separator className="my-2" />

                {/* Social Security (Volksverzekeringen) - show GROSS amount */}
                <p className="text-xs text-zinc-500 pt-2 pb-1">
                  Social Security (Volksverzekeringen)
                </p>
                <DeductionRow
                  label="Social Security Tax"
                  amount={result.breakdown.socialSecurity.total}
                  grossSalary={grossSalary}
                  currency={currency}
                />
                <p className="text-xs text-zinc-500 italic mt-1">
                  AOW, Anw, Wlz — capped at €
                  {result.breakdown.socialSecurity.ceiling.toLocaleString()}
                </p>

                {/* Tax Credits - shown as positive values that reduce total tax */}
                {result.breakdown.taxCredits.totalCredits > 0 && (
                  <>
                    <Separator className="my-2" />
                    <p className="text-xs text-zinc-500 pt-2 pb-1">
                      Tax Credits
                    </p>
                    {result.breakdown.taxCredits.generalTaxCredit > 0 && (
                      <div className="flex items-center justify-between py-1">
                        <span className="text-sm text-zinc-400">
                          General Tax Credit
                        </span>
                        <span className="text-sm text-emerald-400 tabular-nums">
                          +
                          {formatCurrency(
                            result.breakdown.taxCredits.generalTaxCredit,
                            currency,
                          )}
                        </span>
                      </div>
                    )}
                    {result.breakdown.taxCredits.laborTaxCredit > 0 && (
                      <div className="flex items-center justify-between py-1">
                        <span className="text-sm text-zinc-400">
                          Labour Tax Credit
                        </span>
                        <span className="text-sm text-emerald-400 tabular-nums">
                          +
                          {formatCurrency(
                            result.breakdown.taxCredits.laborTaxCredit,
                            currency,
                          )}
                        </span>
                      </div>
                    )}
                    {result.breakdown.taxCredits.iackCredit > 0 && (
                      <div className="flex items-center justify-between py-1">
                        <span className="text-sm text-zinc-400">
                          IACK (Child Credit)
                        </span>
                        <span className="text-sm text-emerald-400 tabular-nums">
                          +
                          {formatCurrency(
                            result.breakdown.taxCredits.iackCredit,
                            currency,
                          )}
                        </span>
                      </div>
                    )}
                  </>
                )}
              </>
            )}

          {/* AU Tax Breakdown */}
          {isAU &&
            "medicareLevy" in taxes &&
            result.breakdown.type === "AU" && (
              <>
                {/* Residency Status */}
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-zinc-400">Tax Residency</span>
                  <span className="text-xs font-medium text-zinc-300 bg-zinc-700/50 px-2 py-1 rounded">
                    {result.breakdown.isResident
                      ? "Australian Resident"
                      : "Foreign Resident"}
                  </span>
                </div>

                <Separator className="my-2" />

                {/* Income Tax */}
                <p className="text-xs text-zinc-500 pt-2 pb-1">Income Tax</p>
                <DeductionRow
                  label="Gross Income Tax"
                  amount={result.breakdown.grossIncomeTax}
                  grossSalary={grossSalary}
                  currency={currency}
                />

                {/* LITO (only for residents with non-zero LITO) */}
                {result.breakdown.isResident && result.breakdown.lito > 0 && (
                  <>
                    <div className="flex items-center justify-between py-1">
                      <span className="text-sm text-zinc-400">
                        Low Income Tax Offset (LITO)
                      </span>
                      <span className="text-sm text-emerald-400 tabular-nums">
                        -{formatCurrency(result.breakdown.lito, currency)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-t border-zinc-700/50 mt-1 pt-1">
                      <span className="text-sm text-zinc-300 font-medium">
                        Net Income Tax
                      </span>
                      <span className="text-sm text-zinc-100 tabular-nums font-medium">
                        {formatCurrency(taxes.incomeTax, currency)}
                      </span>
                    </div>
                  </>
                )}

                <Separator className="my-2" />

                {/* Medicare */}
                <p className="text-xs text-zinc-500 pt-2 pb-1">Medicare</p>
                {result.breakdown.isResident ? (
                  <>
                    <DeductionRow
                      label="Medicare Levy (2%)"
                      amount={taxes.medicareLevy}
                      grossSalary={grossSalary}
                      currency={currency}
                    />
                    {taxes.medicareLevySurcharge > 0 && (
                      <DeductionRow
                        label="Medicare Levy Surcharge"
                        amount={taxes.medicareLevySurcharge}
                        grossSalary={grossSalary}
                        currency={currency}
                      />
                    )}
                    {taxes.medicareLevySurcharge === 0 &&
                      result.breakdown.hasPrivateHealthInsurance && (
                        <p className="text-xs text-emerald-400 italic mt-1">
                          No surcharge - private health insurance held
                        </p>
                      )}
                  </>
                ) : (
                  <div className="flex items-center justify-between py-1">
                    <span className="text-sm text-zinc-400">Medicare Levy</span>
                    <span className="text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded">
                      Exempt (Non-Resident)
                    </span>
                  </div>
                )}

                {/* Division 293 Tax (High Income Earners) */}
                {taxes.division293Tax > 0 && (
                  <>
                    <Separator className="my-2" />
                    <p className="text-xs text-zinc-500 pt-2 pb-1">
                      Division 293 Tax (High Income Earners)
                    </p>
                    <DeductionRow
                      label="Additional Tax on Super"
                      amount={taxes.division293Tax}
                      grossSalary={grossSalary}
                      currency={currency}
                    />
                    <p className="text-xs text-zinc-500 italic mt-1">
                      Applies when income + super exceeds $250,000
                    </p>
                    <p className="text-xs text-zinc-500 italic">
                      15% on lesser of super contributions or excess over threshold
                    </p>
                  </>
                )}

                {/* Superannuation (Informational) */}
                <Separator className="my-2" />
                <p className="text-xs text-zinc-500 pt-2 pb-1">
                  Superannuation (Employer Contribution)
                </p>
                <div className="flex items-center justify-between py-2 opacity-60">
                  <span className="text-sm text-zinc-400">
                    Super Guarantee (
                    {(result.breakdown.superannuation.rate * 100).toFixed(0)}%)
                  </span>
                  <span className="text-sm text-zinc-500 tabular-nums">
                    +
                    {formatCurrency(
                      result.breakdown.superannuation.employerContribution,
                      currency,
                    )}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 italic">
                  Employer pays this on top of your salary - not deducted from
                  take-home pay
                </p>
              </>
            )}

          {/* PT Tax Breakdown */}
          {isPT &&
            "solidaritySurcharge" in taxes &&
            result.breakdown.type === "PT" && (
              <>
                {/* Residency Status */}
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-zinc-400">Tax Residency</span>
                  <span className={`text-xs font-medium px-2 py-1 rounded ${
                    result.breakdown.isNhr2
                      ? "text-emerald-300 bg-emerald-500/20"
                      : "text-zinc-300 bg-zinc-700/50"
                  }`}>
                    {result.breakdown.isNhr2
                      ? "NHR 2.0 (20% flat)"
                      : result.breakdown.isResident
                        ? "Portuguese Resident"
                        : "Non-Resident (25% flat)"}
                  </span>
                </div>

                {/* NHR 2.0 Info Banner */}
                {result.breakdown.isNhr2 && (
                  <div className="bg-emerald-500/10 rounded-lg p-3 my-3 border border-emerald-500/20">
                    <p className="text-xs text-emerald-400 font-medium mb-1">
                      NHR 2.0 Regime Active
                    </p>
                    <p className="text-xs text-zinc-400">
                      20% flat tax rate on Portuguese employment income for 10 years.
                      Exempt from solidarity surcharge.
                    </p>
                    {result.breakdown.nhr2TaxSavings && result.breakdown.nhr2TaxSavings > 0 && (
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-emerald-500/20">
                        <span className="text-xs text-emerald-400">
                          Savings vs Standard Regime
                        </span>
                        <span className="text-sm font-medium text-emerald-400 tabular-nums">
                          {formatCurrency(result.breakdown.nhr2TaxSavings, currency)}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Filing Status */}
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-zinc-400">Filing Status</span>
                  <span className="text-xs font-medium text-zinc-300 bg-zinc-700/50 px-2 py-1 rounded">
                    {result.breakdown.filingStatus === "single" && "Single"}
                    {result.breakdown.filingStatus === "married_jointly" && "Married Filing Jointly"}
                    {result.breakdown.filingStatus === "married_separately" && "Married Filing Separately"}
                  </span>
                </div>

                {/* Specific Deduction - only for standard residents, not NHR 2.0 */}
                {result.breakdown.specificDeduction > 0 && !result.breakdown.isNhr2 && (
                  <>
                    <Separator className="my-2" />
                    <p className="text-xs text-zinc-500 pt-2 pb-1">
                      Specific Deduction (Dedução Específica)
                    </p>
                    <div className="flex items-center justify-between py-1">
                      <span className="text-sm text-zinc-400">
                        Minimum Deduction
                      </span>
                      <span className="text-sm text-emerald-400 tabular-nums">
                        -
                        {formatCurrency(
                          result.breakdown.specificDeduction,
                          currency,
                        )}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-t border-zinc-700 mt-1">
                      <span className="text-sm text-zinc-300">
                        Taxable Income
                      </span>
                      <span className="text-sm text-zinc-200 tabular-nums">
                        {formatCurrency(result.taxableIncome, currency)}
                      </span>
                    </div>
                  </>
                )}

                <Separator className="my-2" />

                {/* IRS Income Tax */}
                <p className="text-xs text-zinc-500 pt-2 pb-1">
                  IRS (Imposto sobre o Rendimento)
                </p>
                
                {/* Show joint filing comparison if applicable */}
                {result.breakdown.jointFilingSavings && result.breakdown.jointFilingSavings > 0 && (
                  <>
                    <div className="flex items-center justify-between py-1">
                      <span className="text-sm text-zinc-400">
                        Tax (Separate Filing)
                      </span>
                      <span className="text-sm text-zinc-500 tabular-nums line-through">
                        {formatCurrency(
                          result.breakdown.incomeTaxBeforeJointFiling ?? 0,
                          currency,
                        )}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <span className="text-sm text-zinc-400">
                        Tax (Joint Filing)
                      </span>
                      <span className="text-sm text-zinc-200 tabular-nums">
                        {formatCurrency(taxes.incomeTax, currency)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <span className="text-sm text-emerald-400">
                        Joint Filing Savings
                      </span>
                      <span className="text-sm text-emerald-400 tabular-nums">
                        -{formatCurrency(result.breakdown.jointFilingSavings, currency)}
                      </span>
                    </div>
                  </>
                )}
                
                {!result.breakdown.jointFilingSavings && (
                  <DeductionRow
                    label="Income Tax"
                    amount={taxes.incomeTax}
                    grossSalary={grossSalary}
                    currency={currency}
                  />
                )}

                {/* Solidarity Surcharge for high incomes */}
                {taxes.solidaritySurcharge > 0 && (
                  <DeductionRow
                    label="Solidarity Surcharge"
                    amount={taxes.solidaritySurcharge}
                    grossSalary={grossSalary}
                    currency={currency}
                  />
                )}

                <Separator className="my-2" />

                {/* Social Security */}
                <p className="text-xs text-zinc-500 pt-2 pb-1">
                  Social Security (Segurança Social)
                </p>
                <DeductionRow
                  label="Employee Contribution (11%)"
                  amount={taxes.socialSecurity}
                  grossSalary={grossSalary}
                  currency={currency}
                />

                {/* Employer SS Contribution (informational) */}
                <div className="flex items-center justify-between py-2 opacity-60">
                  <span className="text-sm text-zinc-400">
                    Employer Contribution (23.75%)
                  </span>
                  <span className="text-sm text-zinc-500 tabular-nums">
                    +
                    {formatCurrency(
                      result.breakdown.employerSocialSecurity,
                      currency,
                    )}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 italic">
                  Employer pays this on top of your salary - not deducted from
                  take-home pay
                </p>

                {/* PPR Contribution & Tax Credits */}
                {result.breakdown.pprContribution > 0 && (
                  <>
                    <Separator className="my-2" />
                    <p className="text-xs text-zinc-500 pt-2 pb-1">
                      Tax Savings (PPR)
                    </p>
                    <div className="flex items-center justify-between py-1">
                      <span className="text-sm text-zinc-400">
                        PPR Contribution
                      </span>
                      <span className="text-sm text-zinc-200 tabular-nums">
                        {formatCurrency(result.breakdown.pprContribution, currency)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <span className="text-sm text-zinc-400">
                        Tax Credit (20%)
                      </span>
                      <span className="text-sm text-emerald-400 tabular-nums">
                        -{formatCurrency(result.breakdown.pprTaxCredit, currency)}
                      </span>
                    </div>
                  </>
                )}

                {/* Dependent Deductions */}
                {result.breakdown.dependentDeduction > 0 && (
                  <>
                    <Separator className="my-2" />
                    <p className="text-xs text-zinc-500 pt-2 pb-1">
                      Family Deductions
                    </p>
                    <div className="flex items-center justify-between py-1">
                      <span className="text-sm text-zinc-400">
                        Dependents ({result.breakdown.numberOfDependents})
                      </span>
                      <span className="text-sm text-emerald-400 tabular-nums">
                        -{formatCurrency(result.breakdown.dependentDeduction, currency)}
                      </span>
                    </div>
                  </>
                )}

                {/* Tax Summary */}
                {(result.breakdown.pprContribution > 0 || result.breakdown.dependentDeduction > 0) && (
                  <>
                    <div className="flex items-center justify-between py-1 border-t border-zinc-700 mt-1">
                      <span className="text-sm text-zinc-300">
                        Gross Tax Before Credits
                      </span>
                      <span className="text-sm text-zinc-200 tabular-nums">
                        {formatCurrency(result.breakdown.grossTaxBeforeCredits, currency)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <span className="text-sm text-zinc-300">Total Credits</span>
                      <span className="text-sm text-emerald-400 tabular-nums">
                        -{formatCurrency(result.breakdown.totalTaxCredits, currency)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-t border-zinc-700 mt-1">
                      <span className="text-sm text-zinc-300 font-medium">
                        Final Tax Payable
                      </span>
                      <span className="text-sm text-zinc-100 tabular-nums font-medium">
                        {formatCurrency(result.totalTax, currency)}
                      </span>
                    </div>
                  </>
                )}

                {/* Marital Status & Dependents Info */}
                <Separator className="my-2" />
                <div className="bg-zinc-800/50 rounded-lg p-3 mt-2">
                  <p className="text-xs text-zinc-400 font-medium mb-1">
                    Taxpayer Information
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="text-xs text-zinc-500 bg-zinc-700/50 px-2 py-1 rounded">
                      {result.breakdown.filingStatus === "single"
                        ? "Single"
                        : "Married"}
                    </span>
                    {result.breakdown.numberOfDependents > 0 && (
                      <span className="text-xs text-zinc-500 bg-zinc-700/50 px-2 py-1 rounded">
                        {result.breakdown.numberOfDependents} dependent
                        {result.breakdown.numberOfDependents > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-500 mt-2">
                    Note: Additional deductions for health, education, housing,
                    and other expenses are not included.
                  </p>
                </div>
              </>
            )}

          {/* TH Tax Breakdown */}
          {isTH &&
            "incomeTax" in taxes &&
            "socialSecurity" in taxes &&
            result.breakdown.type === "TH" && (
              <>
                {/* Residency Status */}
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-zinc-400">Tax Residency</span>
                  <span className="text-xs font-medium text-zinc-300 bg-zinc-700/50 px-2 py-1 rounded">
                    {result.breakdown.isResident
                      ? "Thai Resident"
                      : "Non-Resident (15% flat)"}
                  </span>
                </div>

                {/* Standard Deduction */}
                <Separator className="my-2" />
                <p className="text-xs text-zinc-500 pt-2 pb-1">
                  Standard Deduction
                </p>
                <div className="flex items-center justify-between py-1">
                  <span className="text-sm text-zinc-400">
                    Employment Income (50%)
                  </span>
                  <span className="text-sm text-emerald-400 tabular-nums">
                    -{formatCurrency(result.breakdown.standardDeduction, currency)}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1 border-t border-zinc-700/50 mt-1">
                  <span className="text-sm text-zinc-300">Net Income</span>
                  <span className="text-sm text-zinc-200 tabular-nums">
                    {formatCurrency(result.breakdown.netIncome, currency)}
                  </span>
                </div>

                {/* Allowances Applied */}
                {result.breakdown.totalAllowances > 0 && (
                  <>
                    <Separator className="my-2" />
                    <p className="text-xs text-zinc-500 pt-2 pb-1">
                      Personal Allowances
                    </p>
                    {result.breakdown.allowances.personalAllowance > 0 && (
                      <div className="flex items-center justify-between py-1">
                        <span className="text-sm text-zinc-400">
                          Personal Allowance
                        </span>
                        <span className="text-sm text-emerald-400 tabular-nums">
                          -{formatCurrency(result.breakdown.allowances.personalAllowance, currency)}
                        </span>
                      </div>
                    )}
                    {result.breakdown.allowances.spouseAllowance > 0 && (
                      <div className="flex items-center justify-between py-1">
                        <span className="text-sm text-zinc-400">
                          Spouse Allowance
                        </span>
                        <span className="text-sm text-emerald-400 tabular-nums">
                          -{formatCurrency(result.breakdown.allowances.spouseAllowance, currency)}
                        </span>
                      </div>
                    )}
                    {result.breakdown.allowances.childAllowance > 0 && (
                      <div className="flex items-center justify-between py-1">
                        <span className="text-sm text-zinc-400">
                          Child Allowance
                        </span>
                        <span className="text-sm text-emerald-400 tabular-nums">
                          -{formatCurrency(result.breakdown.allowances.childAllowance, currency)}
                        </span>
                      </div>
                    )}
                    {result.breakdown.allowances.parentAllowance > 0 && (
                      <div className="flex items-center justify-between py-1">
                        <span className="text-sm text-zinc-400">
                          Parent Allowance
                        </span>
                        <span className="text-sm text-emerald-400 tabular-nums">
                          -{formatCurrency(result.breakdown.allowances.parentAllowance, currency)}
                        </span>
                      </div>
                    )}
                    {result.breakdown.allowances.lifeInsurance > 0 && (
                      <div className="flex items-center justify-between py-1">
                        <span className="text-sm text-zinc-400">
                          Life Insurance
                        </span>
                        <span className="text-sm text-emerald-400 tabular-nums">
                          -{formatCurrency(result.breakdown.allowances.lifeInsurance, currency)}
                        </span>
                      </div>
                    )}
                    {result.breakdown.allowances.healthInsurance > 0 && (
                      <div className="flex items-center justify-between py-1">
                        <span className="text-sm text-zinc-400">
                          Health Insurance
                        </span>
                        <span className="text-sm text-emerald-400 tabular-nums">
                          -{formatCurrency(result.breakdown.allowances.healthInsurance, currency)}
                        </span>
                      </div>
                    )}
                    {result.breakdown.allowances.socialSecurity > 0 && (
                      <div className="flex items-center justify-between py-1">
                        <span className="text-sm text-zinc-400">
                          Social Security
                        </span>
                        <span className="text-sm text-emerald-400 tabular-nums">
                          -{formatCurrency(result.breakdown.allowances.socialSecurity, currency)}
                        </span>
                      </div>
                    )}
                    {result.breakdown.allowances.providentFund > 0 && (
                      <div className="flex items-center justify-between py-1">
                        <span className="text-sm text-zinc-400">
                          Provident Fund
                        </span>
                        <span className="text-sm text-emerald-400 tabular-nums">
                          -{formatCurrency(result.breakdown.allowances.providentFund, currency)}
                        </span>
                      </div>
                    )}
                    {result.breakdown.allowances.rmf > 0 && (
                      <div className="flex items-center justify-between py-1">
                        <span className="text-sm text-zinc-400">
                          Retirement Mutual Fund (RMF)
                        </span>
                        <span className="text-sm text-emerald-400 tabular-nums">
                          -{formatCurrency(result.breakdown.allowances.rmf, currency)}
                        </span>
                      </div>
                    )}
                    {result.breakdown.allowances.ssf > 0 && (
                      <div className="flex items-center justify-between py-1">
                        <span className="text-sm text-zinc-400">
                          Super Savings Fund (SSF)
                        </span>
                        <span className="text-sm text-emerald-400 tabular-nums">
                          -{formatCurrency(result.breakdown.allowances.ssf, currency)}
                        </span>
                      </div>
                    )}
                    {result.breakdown.allowances.mortgageInterest > 0 && (
                      <div className="flex items-center justify-between py-1">
                        <span className="text-sm text-zinc-400">
                          Mortgage Interest
                        </span>
                        <span className="text-sm text-emerald-400 tabular-nums">
                          -{formatCurrency(result.breakdown.allowances.mortgageInterest, currency)}
                        </span>
                      </div>
                    )}
                    {result.breakdown.allowances.donations > 0 && (
                      <div className="flex items-center justify-between py-1">
                        <span className="text-sm text-zinc-400">
                          Donations
                        </span>
                        <span className="text-sm text-emerald-400 tabular-nums">
                          -{formatCurrency(result.breakdown.allowances.donations, currency)}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between py-1 border-t border-zinc-700 mt-1">
                      <span className="text-sm text-zinc-300">Taxable Income</span>
                      <span className="text-sm text-zinc-200 tabular-nums">
                        {formatCurrency(result.breakdown.taxableIncome, currency)}
                      </span>
                    </div>
                  </>
                )}

                {/* Income Tax */}
                <Separator className="my-2" />
                <p className="text-xs text-zinc-500 pt-2 pb-1">
                  Personal Income Tax (Progressive Rates)
                </p>
                
                {/* Tax Bracket Breakdown */}
                {result.breakdown.bracketTaxes.map((bracket, index) => (
                  <div key={index} className="flex items-center justify-between py-1">
                    <span className="text-sm text-zinc-400">
                      {(bracket.rate * 100).toFixed(0)}% on {formatCurrency(bracket.min, currency)}
                      {bracket.max === Infinity ? "+" : ` - ${formatCurrency(bracket.max, currency)}`}
                    </span>
                    <span className="text-sm text-zinc-200 tabular-nums">
                      {formatCurrency(bracket.tax, currency)}
                    </span>
                  </div>
                ))}

                <Separator className="my-2" />

                {/* Social Security */}
                <p className="text-xs text-zinc-500 pt-2 pb-1">
                  Social Security Fund (SSF)
                </p>
                <DeductionRow
                  label="Employee Contribution (5%)"
                  amount={taxes.socialSecurity}
                  grossSalary={grossSalary}
                  currency={currency}
                />
                <p className="text-xs text-zinc-500 italic mt-1">
                  Capped at ฿750/month (฿9,000/year)
                </p>

                {/* Employer Contribution (informational) */}
                <div className="flex items-center justify-between py-2 opacity-60">
                  <span className="text-sm text-zinc-400">
                    Employer Contribution (5%)
                  </span>
                  <span className="text-sm text-zinc-500 tabular-nums">
                    +{formatCurrency(taxes.socialSecurity, currency)}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 italic">
                  Employer matches your contribution - not deducted from take-home pay
                </p>

                {/* Voluntary Contributions Summary */}
                {result.breakdown.voluntaryContributions.total > 0 && (
                  <>
                    <Separator className="my-2" />
                    <p className="text-xs text-zinc-500 pt-2 pb-1">
                      Voluntary Contributions
                    </p>
                    {result.breakdown.voluntaryContributions.providentFund > 0 && (
                      <DeductionRow
                        label="Provident Fund"
                        amount={result.breakdown.voluntaryContributions.providentFund}
                        grossSalary={grossSalary}
                        currency={currency}
                      />
                    )}
                    {result.breakdown.voluntaryContributions.rmf > 0 && (
                      <DeductionRow
                        label="Retirement Mutual Fund (RMF)"
                        amount={result.breakdown.voluntaryContributions.rmf}
                        grossSalary={grossSalary}
                        currency={currency}
                      />
                    )}
                    {result.breakdown.voluntaryContributions.ssf > 0 && (
                      <DeductionRow
                        label="Super Savings Fund (SSF)"
                        amount={result.breakdown.voluntaryContributions.ssf}
                        grossSalary={grossSalary}
                        currency={currency}
                      />
                    )}
                    {result.breakdown.voluntaryContributions.esg > 0 && (
                      <DeductionRow
                        label="Thai ESG Fund"
                        amount={result.breakdown.voluntaryContributions.esg}
                        grossSalary={grossSalary}
                        currency={currency}
                      />
                    )}
                    {result.breakdown.voluntaryContributions.nationalSavingsFund > 0 && (
                      <DeductionRow
                        label="National Savings Fund"
                        amount={result.breakdown.voluntaryContributions.nationalSavingsFund}
                        grossSalary={grossSalary}
                        currency={currency}
                      />
                    )}
                  </>
                )}

                {/* Note */}
                <Separator className="my-2" />
                <div className="bg-zinc-800/50 rounded-lg p-3 mt-2">
                  <p className="text-xs text-zinc-400 font-medium mb-1">
                    Other deductions not included:
                  </p>
                  <p className="text-xs text-zinc-500">
                    ESG fund contributions (held 5+ years), pension life insurance,
                    prenatal care expenses, disabled dependent care, elderly taxpayer allowance.
                  </p>
                </div>
              </>
            )}

          {/* ID Tax Breakdown */}
          {isID &&
            "bpjsHealth" in taxes &&
            result.breakdown.type === "ID" && (
              <>
                {/* PTKP Info */}
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-zinc-400">PTKP Status</span>
                  <span className="text-xs font-medium text-zinc-300 bg-zinc-700/50 px-2 py-1 rounded">
                    {result.breakdown.taxReliefs.maritalStatus === "married"
                      ? `Married${result.breakdown.taxReliefs.spouseIncomeCombined ? " (Combined)" : ""}`
                      : "Single"}
                    {result.breakdown.taxReliefs.numberOfDependents > 0 &&
                      ` + ${result.breakdown.taxReliefs.numberOfDependents} dependent${result.breakdown.taxReliefs.numberOfDependents > 1 ? "s" : ""}`}
                  </span>
                </div>

                <Separator className="my-2" />

                {/* Income Deductions */}
                <p className="text-xs text-zinc-500 pt-2 pb-1">
                  Income Deductions
                </p>
                <div className="flex items-center justify-between py-1">
                  <span className="text-sm text-zinc-400">
                    Job Expense (5%)
                  </span>
                  <span className="text-sm text-emerald-400 tabular-nums">
                    -{formatCurrency(result.breakdown.jobExpense, currency)}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-sm text-zinc-400">
                    Pension Deductions (JHT + JP)
                  </span>
                  <span className="text-sm text-emerald-400 tabular-nums">
                    -{formatCurrency(result.breakdown.pensionDeduction, currency)}
                  </span>
                </div>
                {result.breakdown.voluntaryDeductions.dplk > 0 && (
                  <div className="flex items-center justify-between py-1">
                    <span className="text-sm text-zinc-400">
                      DPLK Pension
                    </span>
                    <span className="text-sm text-emerald-400 tabular-nums">
                      -{formatCurrency(result.breakdown.voluntaryDeductions.dplk, currency)}
                    </span>
                  </div>
                )}
                {result.breakdown.voluntaryDeductions.zakat > 0 && (
                  <div className="flex items-center justify-between py-1">
                    <span className="text-sm text-zinc-400">
                      Zakat
                    </span>
                    <span className="text-sm text-emerald-400 tabular-nums">
                      -{formatCurrency(result.breakdown.voluntaryDeductions.zakat, currency)}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between py-1 border-t border-zinc-700 mt-1">
                  <span className="text-sm text-zinc-300">Net Income</span>
                  <span className="text-sm text-zinc-200 tabular-nums">
                    {formatCurrency(result.breakdown.netIncome, currency)}
                  </span>
                </div>

                {/* PTKP Allowance */}
                <Separator className="my-2" />
                <p className="text-xs text-zinc-500 pt-2 pb-1">
                  PTKP (Non-Taxable Income)
                </p>
                <div className="flex items-center justify-between py-1">
                  <span className="text-sm text-zinc-400">PTKP Allowance</span>
                  <span className="text-sm text-emerald-400 tabular-nums">
                    -{formatCurrency(result.breakdown.ptkp, currency)}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1 border-t border-zinc-700 mt-1">
                  <span className="text-sm text-zinc-300">Taxable Income</span>
                  <span className="text-sm text-zinc-200 tabular-nums">
                    {formatCurrency(result.taxableIncome, currency)}
                  </span>
                </div>

                {/* Income Tax */}
                <Separator className="my-2" />
                <p className="text-xs text-zinc-500 pt-2 pb-1">
                  PPh 21 (Income Tax)
                </p>
                
                {/* Tax Bracket Breakdown */}
                {result.breakdown.bracketTaxes.map((bracket, index) => (
                  <div key={index} className="flex items-center justify-between py-1">
                    <span className="text-sm text-zinc-400">
                      {(bracket.rate * 100).toFixed(0)}% on {formatCurrency(bracket.min, currency)}
                      {bracket.max === Infinity ? "+" : ` - ${formatCurrency(bracket.max, currency)}`}
                    </span>
                    <span className="text-sm text-zinc-200 tabular-nums">
                      {formatCurrency(bracket.tax, currency)}
                    </span>
                  </div>
                ))}

                <DeductionRow
                  label="Total PPh 21 Tax"
                  amount={taxes.incomeTax}
                  grossSalary={grossSalary}
                  currency={currency}
                />

                <Separator className="my-2" />

                {/* BPJS Contributions */}
                <p className="text-xs text-zinc-500 pt-2 pb-1">
                  BPJS Contributions
                </p>
                <DeductionRow
                  label="Health Insurance (1%)"
                  amount={taxes.bpjsHealth}
                  grossSalary={grossSalary}
                  currency={currency}
                />
                {grossSalary / 12 > result.breakdown.bpjs.healthMonthlyCap && (
                  <p className="text-xs text-zinc-500 italic -mt-1 mb-1">
                    Capped at Rp{result.breakdown.bpjs.healthMonthlyCap.toLocaleString()}/month
                  </p>
                )}

                <DeductionRow
                  label="Old Age Security JHT (2%)"
                  amount={taxes.bpjsJht}
                  grossSalary={grossSalary}
                  currency={currency}
                />

                <DeductionRow
                  label="Pension JP (1%)"
                  amount={taxes.bpjsJp}
                  grossSalary={grossSalary}
                  currency={currency}
                />
                {grossSalary / 12 > result.breakdown.bpjs.jpMonthlyCap && (
                  <p className="text-xs text-zinc-500 italic -mt-1 mb-1">
                    Capped at Rp{result.breakdown.bpjs.jpMonthlyCap.toLocaleString()}/month
                  </p>
                )}

                {/* Employer Contributions (informational) */}
                <div className="flex items-center justify-between py-2 opacity-60">
                  <span className="text-sm text-zinc-400">
                    Employer BPJS (4% + 3.7% + 2%)
                  </span>
                  <span className="text-sm text-zinc-500 tabular-nums">
                    +
                    {formatCurrency(
                      result.breakdown.bpjs.healthEmployer +
                        result.breakdown.bpjs.jhtEmployer +
                        result.breakdown.bpjs.jpEmployer,
                      currency
                    )}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 italic">
                  Employer pays this on top of your salary - not deducted from take-home pay
                </p>

                <Separator className="my-2" />
                <div className="bg-zinc-800/50 rounded-lg p-3 mt-2">
                  <p className="text-xs text-zinc-400 font-medium mb-1">
                    About PTKP:
                  </p>
                  <p className="text-xs text-zinc-500">
                    PTKP (Penghasilan Tidak Kena Pajak) is the non-taxable income threshold.
                    Rp54M for individuals, +Rp4.5M if married, +Rp4.5M per dependent (max 3),
                    +Rp54M if spouse income is combined.
                  </p>
                </div>
              </>
            )}

          {/* Totals */}
          <DeductionRow
            label="Total Deductions"
            amount={result.totalDeductions}
            grossSalary={grossSalary}
            variant="total"
            currency={currency}
          />

          <div className="flex items-center justify-between py-3 mt-2 bg-emerald-500/10 rounded-lg px-3 -mx-3">
            <span className="text-sm font-semibold text-emerald-400">
              Net Salary
            </span>
            <span className="text-lg font-bold text-emerald-400 tabular-nums">
              {formatCurrency(result.netSalary, currency)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
