"use client";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { NumberStepper } from "@/components/ui/number-stepper";
import { ContributionSlider } from "@/components/ui/contribution-slider";
import { formatCurrency } from "@/lib/format";
import type { KRTaxReliefInputs } from "@/lib/countries/types";
import { KR_TAX_CREDITS, KR_NON_TAXABLE_ALLOWANCES } from "@/lib/countries/kr/constants/tax-brackets-2026";

interface KRAdditionalReliefsProps {
  reliefs: KRTaxReliefInputs;
  onChange: (reliefs: KRTaxReliefInputs) => void;
}

const PENSION_MAX = KR_TAX_CREDITS.pensionCredit.maxContribution;

export function KRAdditionalReliefs({ reliefs, onChange }: KRAdditionalReliefsProps) {
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
      <div>
        <h4 className="text-sm font-medium text-zinc-300 mb-3">Deductions (소득공제)</h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm">Dependents (spouse, parents)</Label>
              <p className="text-xs text-zinc-500 mt-0.5">₩1,500,000 each</p>
            </div>
            <NumberStepper
              value={reliefs.numberOfDependents || 0}
              onChange={(value) => handleChange("numberOfDependents", value)}
              min={0}
              max={10}
              label="Dependents"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm">Total Children (under 20)</Label>
              <p className="text-xs text-zinc-500 mt-0.5">₩1,500,000 deduction each</p>
            </div>
            <NumberStepper
              value={reliefs.numberOfChildrenUnder20 || 0}
              onChange={(value) => handleChange("numberOfChildrenUnder20", value)}
              min={0}
              max={10}
              label="Children under 20"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm">Of which, under age 7</Label>
              <p className="text-xs text-zinc-500 mt-0.5">Extra ₩1,000,000 deduction each</p>
            </div>
            <NumberStepper
              value={reliefs.numberOfChildrenUnder7 || 0}
              onChange={(value) => handleChange("numberOfChildrenUnder7", value)}
              min={0}
              max={reliefs.numberOfChildrenUnder20 || 0}
              label="Children under 7"
            />
          </div>
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
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm">Meal Allowance (식대)</Label>
              <p className="text-xs text-zinc-500 mt-0.5">
                {formatCurrency(KR_NON_TAXABLE_ALLOWANCES.mealAllowance.monthlyLimit, "KRW")}/month not taxed
              </p>
            </div>
            <Switch
              checked={reliefs.hasMealAllowance}
              onCheckedChange={(checked) => handleChange("hasMealAllowance", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm">Childcare Allowance (자녀보육수당)</Label>
              <p className="text-xs text-zinc-500 mt-0.5">
                {formatCurrency(KR_NON_TAXABLE_ALLOWANCES.childcareAllowance.monthlyLimit, "KRW")}/month for children under 6
              </p>
            </div>
            <Switch
              checked={reliefs.hasChildcareAllowance}
              onCheckedChange={(checked) => handleChange("hasChildcareAllowance", checked)}
            />
          </div>
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
            description="12% credit, capped at ₩1,000,000 (life, casualty insurance)"
            value={reliefs.insurancePremiums || 0}
            onChange={(value) => handleChange("insurancePremiums", value)}
            max={10000000}
            step={100000}
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
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm">Homeowner (주택 소유)</Label>
              <p className="text-xs text-zinc-500 mt-0.5">Check if you own your home (disables rent credit)</p>
            </div>
            <Switch
              checked={reliefs.isHomeowner}
              onCheckedChange={(checked) => handleChange("isHomeowner", checked)}
            />
          </div>

          {!reliefs.isHomeowner && (
            <ContributionSlider
              label="Monthly Rent (월세)"
              description="15-17% credit based on income (single ≤₩35M/45M, married ≤₩55M/70M)"
              value={reliefs.monthlyRent || 0}
              onChange={(value) => handleChange("monthlyRent", value)}
              max={3000000}
              step={50000}
              currency="KRW"
            />
          )}
        </div>
      </div>
    </div>
  );
}
