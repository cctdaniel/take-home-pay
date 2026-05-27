"use client";

import {
  BooleanSelectField,
  NumberStepperField,
} from "@/components/calculator/calculator-fields";
import { ContributionSlider } from "@/components/ui/contribution-slider";
import type { THTaxReliefInputs } from "@/lib/countries/types";
import { clampAmount, clampCount } from "@/lib/utils";

interface THAdditionalReliefsProps {
  reliefs: THTaxReliefInputs;
  onChange: (reliefs: THTaxReliefInputs) => void;
}

export function THAdditionalReliefs({ reliefs, onChange }: THAdditionalReliefsProps) {
  const updateRelief = <K extends keyof THTaxReliefInputs>(
    key: K,
    value: THTaxReliefInputs[K]
  ) => {
    onChange({ ...reliefs, [key]: value });
  };

  return (
    <div className="space-y-6">
      <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
        Tax Allowances & Deductions
      </h3>

      {/* Social Security */}
      <BooleanSelectField
        id="th-social-security"
        label="Social Security Fund"
        value={reliefs.hasSocialSecurity}
        onChange={(checked) => updateRelief("hasSocialSecurity", checked)}
        description="Deduct actual contributions (5% up to THB 750/month)."
      />

      {/* Personal Allowances */}
      <div className="space-y-3">
        <h4 className="text-xs font-medium text-zinc-500">Personal Allowances</h4>
        
        {/* Spouse Allowance */}
        <div className="space-y-3 pl-4 border-l-2 border-zinc-700">
          <BooleanSelectField
            id="th-spouse-allowance"
            label="Spouse Allowance"
            value={reliefs.hasSpouse}
            onChange={(checked) => {
              updateRelief("hasSpouse", checked);
              if (!checked) updateRelief("spouseHasNoIncome", false);
            }}
            description="THB 60,000 if spouse has no income."
          />
          {reliefs.hasSpouse && (
            <BooleanSelectField
              id="th-spouse-no-income"
              label="Spouse has no income"
              value={reliefs.spouseHasNoIncome}
              onChange={(checked) =>
                updateRelief("spouseHasNoIncome", checked)
              }
              description="Required for the spouse allowance."
            />
          )}
        </div>

        {/* Child Allowance */}
        <div className="pl-4 border-l-2 border-zinc-700 space-y-2">
          <NumberStepperField
            id="th-children"
            label="Number of Children"
            value={reliefs.numberOfChildren}
            onChange={(value) => {
              const nextChildren = clampCount(value, 10);
              onChange({
                ...reliefs,
                numberOfChildren: nextChildren,
                numberOfChildrenBornAfter2018: Math.min(
                  reliefs.numberOfChildrenBornAfter2018,
                  nextChildren,
                ),
              });
            }}
            min={0}
            max={10}
            description="THB 30,000 per child, or THB 60,000 for children born from 2018 onward."
          />
          {reliefs.numberOfChildren > 0 && (
            <NumberStepperField
              id="th-children-born-after-2018"
              label="Children born 2018 or later"
              value={reliefs.numberOfChildrenBornAfter2018}
              onChange={(value) =>
                updateRelief(
                  "numberOfChildrenBornAfter2018",
                  clampCount(value, reliefs.numberOfChildren),
                )
              }
              min={0}
              max={reliefs.numberOfChildren}
              description="Cannot exceed the total number of children above."
            />
          )}
        </div>

        {/* Parent Allowance */}
        <div className="pl-4 border-l-2 border-zinc-700">
          <NumberStepperField
            id="th-dependent-parents"
            label="Dependent Parents"
            value={reliefs.numberOfParents}
            onChange={(value) =>
              updateRelief("numberOfParents", clampCount(value, 4))
            }
            min={0}
            max={4}
            description="THB 30,000 per parent age 60+ with income not above THB 30,000."
          />
        </div>

        {/* Disabled Dependents */}
        <div className="pl-4 border-l-2 border-zinc-700">
          <NumberStepperField
            id="th-disabled-dependents"
            label="Disabled Dependents"
            value={reliefs.numberOfDisabledDependents}
            onChange={(value) =>
              updateRelief("numberOfDisabledDependents", clampCount(value, 4))
            }
            min={0}
            max={4}
            description="THB 60,000 per qualifying disabled dependent."
          />
        </div>

        {/* Elderly/Disabled Taxpayer */}
        <BooleanSelectField
          id="th-elderly-or-disabled"
          label="Elderly or Disabled Taxpayer"
          value={reliefs.isElderlyOrDisabled}
          onChange={(checked) =>
            updateRelief("isElderlyOrDisabled", checked)
          }
          description="THB 190,000 exemption for age 65+ or disabled taxpayers."
          className="pl-4 border-l-2 border-zinc-700"
        />
      </div>

      {/* Insurance */}
      <div className="space-y-3">
        <h4 className="text-xs font-medium text-zinc-500">Insurance Premiums</h4>
        
        <div className="space-y-2 pl-4 border-l-2 border-zinc-700">
          <ContributionSlider
            label="Life Insurance (Self)"
            description="10+ year policy"
            value={reliefs.lifeInsurancePremium}
            onChange={(value) => updateRelief("lifeInsurancePremium", value)}
            max={100000}
            step={1000}
            currency="THB"
          />
        </div>

        <div className="space-y-2 pl-4 border-l-2 border-zinc-700">
          <ContributionSlider
            label="Health Insurance (Self)"
            value={reliefs.healthInsurancePremium}
            onChange={(value) => updateRelief("healthInsurancePremium", value)}
            max={25000}
            step={1000}
            currency="THB"
          />
        </div>

        <div className="space-y-2 pl-4 border-l-2 border-zinc-700">
          <ContributionSlider
            label="Health Insurance (Parents)"
            value={reliefs.healthInsuranceParentsPremium}
            onChange={(value) => updateRelief("healthInsuranceParentsPremium", value)}
            max={15000}
            step={1000}
            currency="THB"
          />
        </div>
        
        <p className="text-xs text-zinc-500 pl-4">
          Note: Life + Health insurance combined cannot exceed ฿100,000
        </p>
      </div>

      {/* Other Deductions */}
      <div className="space-y-3">
        <h4 className="text-xs font-medium text-zinc-500">Other Deductions</h4>
        
        <div className="space-y-2 pl-4 border-l-2 border-zinc-700">
          <ContributionSlider
            label="Home Mortgage Interest"
            value={reliefs.mortgageInterest}
            onChange={(value) => updateRelief("mortgageInterest", value)}
            max={100000}
            step={1000}
            currency="THB"
          />
        </div>

        <div className="space-y-2 pl-4 border-l-2 border-zinc-700">
          <ContributionSlider
            label="Charitable Donations"
            description="Up to 10% of net income"
            value={reliefs.donations}
            onChange={(value) => updateRelief("donations", value)}
            max={100000}
            step={1000}
            currency="THB"
          />
        </div>

        <div className="space-y-2 pl-4 border-l-2 border-zinc-700">
          <ContributionSlider
            label="Political Party Donation"
            value={reliefs.politicalDonation}
            onChange={(value) => updateRelief("politicalDonation", value)}
            max={10000}
            step={1000}
            currency="THB"
          />
        </div>
      </div>

      {/* Summary */}
      <div className="bg-zinc-800/50 rounded-lg p-4 mt-4">
        <p className="text-xs text-zinc-400">
          <span className="text-emerald-400">Note:</span> Standard deduction of 50% 
          (capped at ฿100,000) is automatically applied to employment income. 
          Personal allowance of ฿60,000 is also automatically applied.
        </p>
      </div>
    </div>
  );
}
