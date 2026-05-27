"use client";

import { ContributionSlider } from "@/components/ui/contribution-slider";
import { formatCurrency } from "@/lib/format";
import {
  BooleanSelectField,
  NumberStepperField,
} from "@/components/calculator/calculator-fields";
import type { KRTaxReliefInputs } from "@/lib/countries/types";
import { KR_TAX_CREDITS, KR_NON_TAXABLE_ALLOWANCES } from "@/lib/countries/kr/constants/tax-brackets-2026";

interface KRAdditionalReliefsProps {
  reliefs: KRTaxReliefInputs;
  onChange: (reliefs: KRTaxReliefInputs) => void;
}

const PENSION_MAX = KR_TAX_CREDITS.pensionCredit.maxContribution;

export function KRAdditionalReliefs({ reliefs, onChange }: KRAdditionalReliefsProps) {
  const usesFlatTax = reliefs.foreignWorkerFlatTax === true;

  const handleChange = <K extends keyof KRTaxReliefInputs>(
    field: K,
    value: KRTaxReliefInputs[K]
  ) => {
    onChange({
      ...reliefs,
      [field]: value,
    });
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-zinc-700 bg-zinc-900/50 p-3">
        <BooleanSelectField
          id="kr-foreign-worker-flat-tax"
          label="Foreign Employee Flat-Tax Election"
          value={usesFlatTax}
          onChange={(checked) => handleChange("foreignWorkerFlatTax", checked)}
          trueLabel="Use 19% flat tax"
          falseLabel="Use ordinary settlement"
          description="Eligible foreign employees can elect 19% national tax plus 10% local income tax on gross employment income."
        />
        {usesFlatTax && (
          <p className="mt-3 text-xs text-amber-300">
            The flat-tax election uses gross salary as the tax base and forfeits
            ordinary non-taxation, deductions, exemptions, and tax credits. The
            four major employee social insurance deductions still apply.
          </p>
        )}
      </div>

      {!usesFlatTax && (
        <>
          <div>
        <h4 className="text-sm font-medium text-zinc-300 mb-3">Deductions (소득공제)</h4>
        <div className="space-y-4">
          <NumberStepperField
            id="kr-dependents"
            label="Dependents (spouse, parents)"
            value={reliefs.numberOfDependents || 0}
            onChange={(value) => handleChange("numberOfDependents", value)}
            min={0}
            max={10}
            description="KRW 1,500,000 basic deduction per eligible dependant."
          />

          <NumberStepperField
            id="kr-children-under-20"
            label="Total Children Under 20"
            value={reliefs.numberOfChildrenUnder20 || 0}
            onChange={(value) => handleChange("numberOfChildrenUnder20", value)}
            min={0}
            max={10}
            description="KRW 1,500,000 child deduction each; also drives the child tax credit."
          />

          <NumberStepperField
            id="kr-children-under-7"
            label="Children Under 7"
            value={reliefs.numberOfChildrenUnder7 || 0}
            onChange={(value) => handleChange("numberOfChildrenUnder7", value)}
            min={0}
            max={reliefs.numberOfChildrenUnder20 || 0}
            description="Additional KRW 1,000,000 deduction per eligible child under age 7."
          />
        </div>
      </div>

      <div className="bg-zinc-800/50 rounded-lg p-3 mt-2">
        <p className="text-xs text-zinc-400 font-medium mb-2">Example: 2 children (ages 6 and 10)</p>
        <ul className="text-xs text-zinc-500 space-y-1">
          <li>→ Total Children = <span className="text-zinc-300">2</span> (both are under 20)</li>
          <li>→ Of which, under 7 = <span className="text-zinc-300">1</span> (only the 6-year-old)</li>
        </ul>
        <p className="text-xs text-zinc-500 mt-2">
          Child tax credit (₩150,000 for 1st-2nd, ₩300,000 for 3rd+) is automatically applied based on total children.
        </p>
      </div>

      {/* Non-Taxable Allowances */}
      <div className="pt-4 border-t border-zinc-700">
        <h4 className="text-sm font-medium text-zinc-300 mb-3">Non-Taxable Allowances (비과세)</h4>
        <div className="space-y-3">
          <BooleanSelectField
            id="kr-meal-allowance"
            label="Meal Allowance (식대)"
            value={reliefs.hasMealAllowance}
            onChange={(checked) => handleChange("hasMealAllowance", checked)}
            trueLabel="Included"
            falseLabel="Not included"
            description={`${formatCurrency(KR_NON_TAXABLE_ALLOWANCES.mealAllowance.monthlyLimit, "KRW")}/month not taxed.`}
          />

          <BooleanSelectField
            id="kr-childcare-allowance"
            label="Childcare Allowance (자녀보육수당)"
            value={reliefs.hasChildcareAllowance}
            onChange={(checked) => handleChange("hasChildcareAllowance", checked)}
            trueLabel="Included"
            falseLabel="Not included"
            description={`${formatCurrency(KR_NON_TAXABLE_ALLOWANCES.childcareAllowance.monthlyLimit, "KRW")}/month for children under 6.`}
          />
        </div>
      </div>

      {/* Personal Pension */}
      <div className="pt-4 border-t border-zinc-700">
        <h4 className="text-sm font-medium text-zinc-300 mb-3">Personal Pension (연금저축/IRP)</h4>
        <ContributionSlider
          label="Annual Contribution"
          description="Tax credit: 16.5% (income ≤ ₩55M) or 13.2% (income > ₩55M)"
          value={reliefs.personalPensionContribution || 0}
          onChange={(value) => handleChange("personalPensionContribution", value)}
          max={PENSION_MAX}
          step={100000}
          currency="KRW"
        />
      </div>

      {/* Tax Credits (세액공제) */}
      <div className="pt-4 border-t border-zinc-700">
        <h4 className="text-sm font-medium text-zinc-300 mb-3">Tax Credits (세액공제)</h4>
        <div className="space-y-4">
          <ContributionSlider
            label="Insurance Premiums (보험료)"
            description="12% credit on eligible protection insurance premiums, capped at ₩1,000,000."
            value={reliefs.insurancePremiums || 0}
            onChange={(value) => handleChange("insurancePremiums", value)}
            max={KR_TAX_CREDITS.insurancePremium.maxPremium}
            step={50000}
            currency="KRW"
          />

          <ContributionSlider
            label="Medical Expenses (의료비)"
            description="15% credit on amount exceeding 3% of income"
            value={reliefs.medicalExpenses || 0}
            onChange={(value) => handleChange("medicalExpenses", value)}
            max={50000000}
            step={100000}
            currency="KRW"
          />

          <ContributionSlider
            label="Education Expenses (교육비)"
            description="15% credit (preschool ₩3M, K-12 ₩3M, university ₩9M per person)"
            value={reliefs.educationExpenses || 0}
            onChange={(value) => handleChange("educationExpenses", value)}
            max={30000000}
            step={100000}
            currency="KRW"
          />

          <ContributionSlider
            label="Donations (기부금)"
            description="15% credit up to ₩10M, 30% above"
            value={reliefs.donations || 0}
            onChange={(value) => handleChange("donations", value)}
            max={50000000}
            step={100000}
            currency="KRW"
          />
        </div>
      </div>

      {/* Housing (주거 관련) */}
      <div className="pt-4 border-t border-zinc-700">
        <h4 className="text-sm font-medium text-zinc-300 mb-3">Housing (주거)</h4>
        <div className="space-y-3">
          <BooleanSelectField
            id="kr-homeowner"
            label="Homeowner (주택 소유)"
            value={reliefs.isHomeowner}
            onChange={(checked) => handleChange("isHomeowner", checked)}
            trueLabel="Owns home"
            falseLabel="Renter"
            description="Rent credit applies only when the employee is an eligible renter."
          />

          {!reliefs.isHomeowner && (
            <ContributionSlider
              label="Annual Rent Paid (월세)"
              description="NTS rent credit: 17% if total salary is ≤₩55M, 15% if ≤₩80M, capped at ₩10M annual rent."
              value={reliefs.annualRentPaid ?? (reliefs.monthlyRent || 0) * 12}
              onChange={(value) =>
                onChange({
                  ...reliefs,
                  annualRentPaid: value,
                  monthlyRent: 0,
                })
              }
              max={KR_TAX_CREDITS.rentCredit.annualRentCap}
              step={100000}
              currency="KRW"
            />
          )}
        </div>
      </div>
        </>
      )}
    </div>
  );
}
