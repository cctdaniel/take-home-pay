"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { DeductionRow } from "./deduction-row";
import { formatCurrency, formatCurrencyWithCents, formatPercentage } from "@/lib/format";
import type { CalculationResult, PayFrequency } from "@/lib/countries/types";
import { getStateCalculator, hasNoIncomeTax } from "@/lib/countries/us/state-tax";

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

export function MultiCountryResults({ result, usState, usContributions }: MultiCountryResultsProps) {
  const { taxes, grossSalary, country, currency } = result;
  const frequencyLabel = getFrequencyLabel(result.perPeriod.frequency);
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Determine which country-specific breakdown to show
  const isUS = country === "US";
  const isSG = country === "SG";
  const isKR = country === "KR";
  const isNL = country === "NL";

  // US-specific data
  let stateName = usState || "";
  let isNoTaxState = false;
  let hasStateTaxes = false;

  if (isUS && usState) {
    const stateCalculator = getStateCalculator(usState);
    stateName = stateCalculator?.getStateName() ?? usState;
    isNoTaxState = hasNoIncomeTax(usState);
    if ("stateIncomeTax" in taxes && "stateDisabilityInsurance" in taxes) {
      hasStateTaxes = taxes.stateIncomeTax > 0 || taxes.stateDisabilityInsurance > 0;
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
          !(node instanceof HTMLElement && node.dataset.downloadButton === "true"),
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
          className="inline-flex items-center justify-center rounded-md border border-zinc-800 bg-zinc-900/80 p-2 text-zinc-300 transition hover:text-zinc-100 hover:border-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
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
            {formatCurrencyWithCents(result.perPeriod.net, currency)} per {frequencyLabel}
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
            <span className="text-sm text-zinc-300 font-medium">Gross Salary</span>
            <span className="text-sm font-medium text-zinc-200 tabular-nums">
              {formatCurrency(grossSalary, currency)}
            </span>
          </div>

          <Separator className="my-2" />

          {/* US Tax Breakdown */}
          {isUS && "federalIncomeTax" in taxes && (
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
                  <p className="text-xs text-zinc-500 pt-2 pb-1">{stateName} Taxes</p>
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
                    <span className="text-sm text-zinc-400">{stateName} State Tax</span>
                    <span className="text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded">
                      No State Income Tax
                    </span>
                  </div>
                </>
              )}

              {/* US Contributions */}
              {usContributions && (usContributions.traditional401k > 0 || usContributions.rothIRA > 0 || usContributions.hsa > 0) && (
                <>
                  <Separator className="my-2" />
                  <p className="text-xs text-zinc-500 pt-2 pb-1">Contributions</p>
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
                  <p className="text-xs text-zinc-500 pt-2 pb-1">Tax Reliefs Applied</p>
                  {result.breakdown.taxReliefs.earnedIncomeRelief > 0 && (
                    <div className="flex items-center justify-between py-1">
                      <span className="text-sm text-zinc-400">Earned Income Relief</span>
                      <span className="text-sm text-emerald-400 tabular-nums">
                        -{formatCurrency(result.breakdown.taxReliefs.earnedIncomeRelief, currency)}
                      </span>
                    </div>
                  )}
                  {result.breakdown.taxReliefs.cpfRelief > 0 && (
                    <div className="flex items-center justify-between py-1">
                      <span className="text-sm text-zinc-400">CPF Relief</span>
                      <span className="text-sm text-emerald-400 tabular-nums">
                        -{formatCurrency(result.breakdown.taxReliefs.cpfRelief, currency)}
                      </span>
                    </div>
                  )}
                  {result.breakdown.taxReliefs.srsRelief > 0 && (
                    <div className="flex items-center justify-between py-1">
                      <span className="text-sm text-zinc-400">SRS Relief</span>
                      <span className="text-sm text-emerald-400 tabular-nums">
                        -{formatCurrency(result.breakdown.taxReliefs.srsRelief, currency)}
                      </span>
                    </div>
                  )}
                  {result.breakdown.taxReliefs.voluntaryCpfTopUpRelief > 0 && (
                    <div className="flex items-center justify-between py-1">
                      <span className="text-sm text-zinc-400">CPF Top-up Relief</span>
                      <span className="text-sm text-emerald-400 tabular-nums">
                        -{formatCurrency(result.breakdown.taxReliefs.voluntaryCpfTopUpRelief, currency)}
                      </span>
                    </div>
                  )}
                  {result.breakdown.taxReliefs.spouseRelief > 0 && (
                    <div className="flex items-center justify-between py-1">
                      <span className="text-sm text-zinc-400">Spouse Relief</span>
                      <span className="text-sm text-emerald-400 tabular-nums">
                        -{formatCurrency(result.breakdown.taxReliefs.spouseRelief, currency)}
                      </span>
                    </div>
                  )}
                  {result.breakdown.taxReliefs.childRelief > 0 && (
                    <div className="flex items-center justify-between py-1">
                      <span className="text-sm text-zinc-400">Child Relief</span>
                      <span className="text-sm text-emerald-400 tabular-nums">
                        -{formatCurrency(result.breakdown.taxReliefs.childRelief, currency)}
                      </span>
                    </div>
                  )}
                  {result.breakdown.taxReliefs.workingMotherRelief > 0 && (
                    <div className="flex items-center justify-between py-1">
                      <span className="text-sm text-zinc-400">Working Mother&apos;s Relief</span>
                      <span className="text-sm text-emerald-400 tabular-nums">
                        -{formatCurrency(result.breakdown.taxReliefs.workingMotherRelief, currency)}
                      </span>
                    </div>
                  )}
                  {result.breakdown.taxReliefs.parentRelief > 0 && (
                    <div className="flex items-center justify-between py-1">
                      <span className="text-sm text-zinc-400">Parent Relief</span>
                      <span className="text-sm text-emerald-400 tabular-nums">
                        -{formatCurrency(result.breakdown.taxReliefs.parentRelief, currency)}
                      </span>
                    </div>
                  )}
                  {result.breakdown.taxReliefs.courseFeesRelief > 0 && (
                    <div className="flex items-center justify-between py-1">
                      <span className="text-sm text-zinc-400">Course Fees Relief</span>
                      <span className="text-sm text-emerald-400 tabular-nums">
                        -{formatCurrency(result.breakdown.taxReliefs.courseFeesRelief, currency)}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between py-1 border-t border-zinc-700 mt-1">
                    <span className="text-sm text-zinc-300">Chargeable Income</span>
                    <span className="text-sm text-zinc-200 tabular-nums">
                      {formatCurrency(result.breakdown.chargeableIncome, currency)}
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
                  Tax before reliefs: {formatCurrency(result.breakdown.grossTaxBeforeReliefs, currency)} (per IRAS table)
                </p>
              )}

              <Separator className="my-2" />
              <p className="text-xs text-zinc-500 pt-2 pb-1">CPF Contributions</p>

              {/* Show CPF rate and ceiling info */}
              {result.breakdown.cpfEmployeeRate > 0 && (
                <p className="text-xs text-zinc-400 mb-2">
                  Rate: {(result.breakdown.cpfEmployeeRate * 100).toFixed(0)}% of wages up to S${result.breakdown.cpfMonthlyCeiling.toLocaleString()}/month
                </p>
              )}

              <DeductionRow
                label="CPF (Employee)"
                amount={taxes.cpfEmployee}
                grossSalary={grossSalary}
                currency={currency}
              />

              {/* Show effective vs actual rate when ceiling applies */}
              {grossSalary / 12 > result.breakdown.cpfMonthlyCeiling && result.breakdown.cpfEmployeeRate > 0 && (
                <p className="text-xs text-zinc-500 italic mt-1">
                  Effective rate: {formatPercentage(taxes.cpfEmployee / grossSalary)} (capped at S${result.breakdown.cpfMonthlyCeiling.toLocaleString()}/month ceiling)
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
                  <p className="text-xs text-zinc-500 pt-2 pb-1">Voluntary Contributions</p>
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
                <p className="text-xs text-zinc-400 font-medium mb-1">Other reliefs not included:</p>
                <p className="text-xs text-zinc-500">
                  Life insurance, donations, NSman, handicapped dependant, grandparent caregiver reliefs
                </p>
              </div>
            </>
          )}

          {/* KR Tax Breakdown */}
          {isKR && "nationalPension" in taxes && result.breakdown.type === "KR" && (
            <>
              {/* Tax Deductions Applied */}
              {result.breakdown.incomeDeductions.totalDeductions > result.breakdown.incomeDeductions.basicDeduction && (
                <>
                  <p className="text-xs text-zinc-500 pt-2 pb-1">Tax Deductions Applied</p>
                  {result.breakdown.incomeDeductions.employmentIncomeDeduction > 0 && (
                    <div className="flex items-center justify-between py-1">
                      <span className="text-sm text-zinc-400">Employment Income Deduction</span>
                      <span className="text-sm text-emerald-400 tabular-nums">
                        -{formatCurrency(result.breakdown.incomeDeductions.employmentIncomeDeduction, currency)}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between py-1">
                    <span className="text-sm text-zinc-400">Basic Deduction</span>
                    <span className="text-sm text-emerald-400 tabular-nums">
                      -{formatCurrency(result.breakdown.incomeDeductions.basicDeduction, currency)}
                    </span>
                  </div>
                  {result.breakdown.incomeDeductions.dependentDeduction > 0 && (
                    <div className="flex items-center justify-between py-1">
                      <span className="text-sm text-zinc-400">Dependent Deduction</span>
                      <span className="text-sm text-emerald-400 tabular-nums">
                        -{formatCurrency(result.breakdown.incomeDeductions.dependentDeduction, currency)}
                      </span>
                    </div>
                  )}
                  {result.breakdown.incomeDeductions.childDeduction > 0 && (
                    <div className="flex items-center justify-between py-1">
                      <span className="text-sm text-zinc-400">Child Deduction</span>
                      <span className="text-sm text-emerald-400 tabular-nums">
                        -{formatCurrency(result.breakdown.incomeDeductions.childDeduction, currency)}
                      </span>
                    </div>
                  )}
                  {result.breakdown.incomeDeductions.childUnder7Deduction > 0 && (
                    <div className="flex items-center justify-between py-1">
                      <span className="text-sm text-zinc-400">Child Under 7 Deduction</span>
                      <span className="text-sm text-emerald-400 tabular-nums">
                        -{formatCurrency(result.breakdown.incomeDeductions.childUnder7Deduction, currency)}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between py-1 border-t border-zinc-700 mt-1">
                    <span className="text-sm text-zinc-300">Taxable Income</span>
                    <span className="text-sm text-zinc-200 tabular-nums">
                      {formatCurrency(result.breakdown.taxableIncome, currency)}
                    </span>
                  </div>
                  <Separator className="my-2" />
                </>
              )}

              {/* Tax Credits Applied */}
              {result.breakdown.taxCredits.totalCredits > 0 && (
                <>
                  <p className="text-xs text-zinc-500 pt-2 pb-1">Tax Credits Applied</p>
                  {result.breakdown.taxCredits.wageEarnerCredit > 0 && (
                    <div className="flex items-center justify-between py-1">
                      <span className="text-sm text-zinc-400">Wage Earner Credit</span>
                      <span className="text-sm text-emerald-400 tabular-nums">
                        -{formatCurrency(result.breakdown.taxCredits.wageEarnerCredit, currency)}
                      </span>
                    </div>
                  )}
                  {result.breakdown.taxCredits.standardCredit > 0 && (
                    <div className="flex items-center justify-between py-1">
                      <span className="text-sm text-zinc-400">Standard Credit</span>
                      <span className="text-sm text-emerald-400 tabular-nums">
                        -{formatCurrency(result.breakdown.taxCredits.standardCredit, currency)}
                      </span>
                    </div>
                  )}
                  {result.breakdown.taxCredits.childTaxCredit > 0 && (
                    <div className="flex items-center justify-between py-1">
                      <span className="text-sm text-zinc-400">Child Tax Credit</span>
                      <span className="text-sm text-emerald-400 tabular-nums">
                        -{formatCurrency(result.breakdown.taxCredits.childTaxCredit, currency)}
                      </span>
                    </div>
                  )}
                  <Separator className="my-2" />
                </>
              )}

              <p className="text-xs text-zinc-500 pt-2 pb-1">Income Tax</p>
              <DeductionRow
                label="National Income Tax"
                amount={taxes.incomeTax}
                grossSalary={grossSalary}
                currency={currency}
              />
              <DeductionRow
                label="Local Income Tax (10%)"
                amount={taxes.localIncomeTax}
                grossSalary={grossSalary}
                currency={currency}
              />

              <Separator className="my-2" />
              <p className="text-xs text-zinc-500 pt-2 pb-1">Social Insurance (4 Major Insurance)</p>

              <DeductionRow
                label="National Pension"
                amount={taxes.nationalPension}
                grossSalary={grossSalary}
                currency={currency}
              />
              <p className="text-xs text-zinc-500 italic -mt-1 mb-1">
                {(result.breakdown.socialInsurance.nationalPensionRate * 100).toFixed(1)}% of monthly income (capped)
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
                {(result.breakdown.socialInsurance.longTermCareRate * 100).toFixed(1)}% of health insurance
              </p>

              <DeductionRow
                label="Employment Insurance"
                amount={taxes.employmentInsurance}
                grossSalary={grossSalary}
                currency={currency}
              />

              {/* Social Insurance Summary */}
              <div className="flex items-center justify-between py-2 border-t border-zinc-700 mt-2">
                <span className="text-sm text-zinc-300">Total Social Insurance</span>
                <span className="text-sm text-zinc-200 tabular-nums">
                  {formatCurrency(result.breakdown.socialInsurance.totalSocialInsurance, currency)}
                </span>
              </div>

              <Separator className="my-2" />
              <div className="bg-zinc-800/50 rounded-lg p-3 mt-2">
                <p className="text-xs text-zinc-400 font-medium mb-1">Note:</p>
                <p className="text-xs text-zinc-500">
                  Additional deductions (medical, education, donations) are not included.
                </p>
              </div>
            </>
          )}

          {/* NL Tax Breakdown */}
          {isNL && "incomeTax" in taxes && result.breakdown.type === "NL" && (
            <>
              {result.breakdown.thirtyPercentRulingApplied && (
                <>
                  <p className="text-xs text-zinc-500 pt-2 pb-1">30% Ruling</p>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-sm text-zinc-400">Tax-Exempt Allowance</span>
                    <span className="text-sm text-emerald-400 tabular-nums">
                      -{formatCurrency(result.breakdown.taxExemptAllowance, currency)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-t border-zinc-700 mt-1">
                    <span className="text-sm text-zinc-300">Taxable Income</span>
                    <span className="text-sm text-zinc-200 tabular-nums">
                      {formatCurrency(result.breakdown.taxableIncome, currency)}
                    </span>
                  </div>
                  <Separator className="my-2" />
                </>
              )}
              {result.breakdown.taxCredits.totalCredits > 0 && (
                <>
                  <p className="text-xs text-zinc-500 pt-2 pb-1">Tax Credits</p>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-sm text-zinc-400">General Tax Credit</span>
                    <span className="text-sm text-emerald-400 tabular-nums">
                      -{formatCurrency(result.breakdown.taxCredits.generalTaxCredit, currency)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-sm text-zinc-400">Labor Tax Credit</span>
                    <span className="text-sm text-emerald-400 tabular-nums">
                      -{formatCurrency(result.breakdown.taxCredits.laborTaxCredit, currency)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-t border-zinc-700 mt-1">
                    <span className="text-sm text-zinc-300">Tax Before Credits</span>
                    <span className="text-sm text-zinc-200 tabular-nums">
                      {formatCurrency(result.breakdown.taxBeforeCredits, currency)}
                    </span>
                  </div>
                  <Separator className="my-2" />
                </>
              )}
              <p className="text-xs text-zinc-500 pt-2 pb-1">Income Tax</p>
              <DeductionRow
                label="Income Tax & National Insurance"
                amount={taxes.incomeTax}
                grossSalary={grossSalary}
                currency={currency}
              />
              <p className="text-xs text-zinc-500 italic mt-1">
                Rates shown are combined for income tax and national insurance (AOW).
              </p>
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
            <span className="text-sm font-semibold text-emerald-400">Net Salary</span>
            <span className="text-lg font-bold text-emerald-400 tabular-nums">
              {formatCurrency(result.netSalary, currency)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
