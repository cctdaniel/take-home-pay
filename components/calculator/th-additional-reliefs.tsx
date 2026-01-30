"use client";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { NumberStepper } from "@/components/ui/number-stepper";
import { formatCurrency } from "@/lib/format";
import type { THTaxReliefInputs } from "@/lib/countries/types";

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
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-sm">Social Security Fund</Label>
          <p className="text-xs text-zinc-500 mt-0.5">
            Deduct actual contributions (5% up to ฿750/month)
          </p>
        </div>
        <Switch
          checked={reliefs.hasSocialSecurity}
          onCheckedChange={(checked) => updateRelief("hasSocialSecurity", checked)}
        />
      </div>

      {/* Personal Allowances */}
      <div className="space-y-3">
        <h4 className="text-xs font-medium text-zinc-500">Personal Allowances</h4>
        
        {/* Spouse Allowance */}
        <div className="flex items-center justify-between pl-4 border-l-2 border-zinc-700">
          <div>
            <Label className="text-sm">Spouse Allowance</Label>
            <p className="text-xs text-zinc-500 mt-0.5">
              ฿60,000 if spouse has no income
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={reliefs.hasSpouse}
              onCheckedChange={(checked) => {
                updateRelief("hasSpouse", checked);
                if (!checked) updateRelief("spouseHasNoIncome", false);
              }}
            />
            {reliefs.hasSpouse && (
              <div className="flex items-center gap-1">
                <input
                  type="checkbox"
                  id="spouse-no-income"
                  checked={reliefs.spouseHasNoIncome}
                  onChange={(e) => updateRelief("spouseHasNoIncome", e.target.checked)}
                  className="rounded border-zinc-600 bg-zinc-800 text-emerald-500"
                />
                <Label htmlFor="spouse-no-income" className="text-xs text-zinc-400">
                  No income
                </Label>
              </div>
            )}
          </div>
        </div>

        {/* Child Allowance */}
        <div className="pl-4 border-l-2 border-zinc-700 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm">Number of Children</Label>
              <p className="text-xs text-zinc-500 mt-0.5">
                ฿30,000 per child (฿60,000 if born 2018+)
              </p>
            </div>
            <NumberStepper
              value={reliefs.numberOfChildren}
              onChange={(value) => updateRelief("numberOfChildren", value)}
              min={0}
              max={10}
              label="Number of Children"
            />
          </div>
          {reliefs.numberOfChildren > 0 && (
            <div className="flex items-center justify-between">
              <Label className="text-xs text-zinc-400">
                Children born 2018 or later
              </Label>
              <NumberStepper
                value={reliefs.numberOfChildrenBornAfter2018}
                onChange={(value) => updateRelief("numberOfChildrenBornAfter2018", value)}
                min={0}
                max={reliefs.numberOfChildren}
                label="Children born 2018+"
              />
            </div>
          )}
        </div>

        {/* Parent Allowance */}
        <div className="flex items-center justify-between pl-4 border-l-2 border-zinc-700">
          <div>
            <Label className="text-sm">Dependent Parents</Label>
            <p className="text-xs text-zinc-500 mt-0.5">
              ฿30,000 per parent (age 60+, income ≤฿30,000)
            </p>
          </div>
          <NumberStepper
            value={reliefs.numberOfParents}
            onChange={(value) => updateRelief("numberOfParents", value)}
            min={0}
            max={4}
            label="Number of Parents"
          />
        </div>

        {/* Disabled Dependents */}
        <div className="flex items-center justify-between pl-4 border-l-2 border-zinc-700">
          <div>
            <Label className="text-sm">Disabled Dependents</Label>
            <p className="text-xs text-zinc-500 mt-0.5">
              ฿60,000 per disabled person
            </p>
          </div>
          <NumberStepper
            value={reliefs.numberOfDisabledDependents}
            onChange={(value) => updateRelief("numberOfDisabledDependents", value)}
            min={0}
            max={4}
            label="Disabled Dependents"
          />
        </div>

        {/* Elderly/Disabled Taxpayer */}
        <div className="flex items-center justify-between pl-4 border-l-2 border-zinc-700">
          <div>
            <Label className="text-sm">Elderly or Disabled Taxpayer</Label>
            <p className="text-xs text-zinc-500 mt-0.5">
              ฿190,000 exemption (age 65+ or disabled)
            </p>
          </div>
          <Switch
            checked={reliefs.isElderlyOrDisabled}
            onCheckedChange={(checked) => updateRelief("isElderlyOrDisabled", checked)}
          />
        </div>
      </div>

      {/* Insurance */}
      <div className="space-y-3">
        <h4 className="text-xs font-medium text-zinc-500">Insurance Premiums</h4>
        
        {/* Life Insurance */}
        <div className="space-y-2 pl-4 border-l-2 border-zinc-700">
          <div className="flex items-center justify-between">
            <Label className="text-sm">Life Insurance (Self)</Label>
            <span className="text-sm font-medium text-zinc-300 tabular-nums">
              {formatCurrency(reliefs.lifeInsurancePremium, "THB")}
            </span>
          </div>
          <Slider
            value={reliefs.lifeInsurancePremium}
            onChange={(value) => updateRelief("lifeInsurancePremium", value)}
            max={100000}
            step={1000}
          />
          <div className="flex justify-between text-xs text-zinc-500">
            <span>฿0</span>
            <span>Max ฿100,000 (10+ year policy)</span>
          </div>
        </div>

        {/* Health Insurance */}
        <div className="space-y-2 pl-4 border-l-2 border-zinc-700">
          <div className="flex items-center justify-between">
            <Label className="text-sm">Health Insurance (Self)</Label>
            <span className="text-sm font-medium text-zinc-300 tabular-nums">
              {formatCurrency(reliefs.healthInsurancePremium, "THB")}
            </span>
          </div>
          <Slider
            value={reliefs.healthInsurancePremium}
            onChange={(value) => updateRelief("healthInsurancePremium", value)}
            max={25000}
            step={1000}
          />
          <div className="flex justify-between text-xs text-zinc-500">
            <span>฿0</span>
            <span>Max ฿25,000</span>
          </div>
        </div>

        {/* Health Insurance for Parents */}
        <div className="space-y-2 pl-4 border-l-2 border-zinc-700">
          <div className="flex items-center justify-between">
            <Label className="text-sm">Health Insurance (Parents)</Label>
            <span className="text-sm font-medium text-zinc-300 tabular-nums">
              {formatCurrency(reliefs.healthInsuranceParentsPremium, "THB")}
            </span>
          </div>
          <Slider
            value={reliefs.healthInsuranceParentsPremium}
            onChange={(value) => updateRelief("healthInsuranceParentsPremium", value)}
            max={15000}
            step={1000}
          />
          <div className="flex justify-between text-xs text-zinc-500">
            <span>฿0</span>
            <span>Max ฿15,000</span>
          </div>
        </div>
        
        <p className="text-xs text-zinc-500 pl-4">
          Note: Life + Health insurance combined cannot exceed ฿100,000
        </p>
      </div>

      {/* Other Deductions */}
      <div className="space-y-3">
        <h4 className="text-xs font-medium text-zinc-500">Other Deductions</h4>
        
        {/* Mortgage Interest */}
        <div className="space-y-2 pl-4 border-l-2 border-zinc-700">
          <div className="flex items-center justify-between">
            <Label className="text-sm">Home Mortgage Interest</Label>
            <span className="text-sm font-medium text-zinc-300 tabular-nums">
              {formatCurrency(reliefs.mortgageInterest, "THB")}
            </span>
          </div>
          <Slider
            value={reliefs.mortgageInterest}
            onChange={(value) => updateRelief("mortgageInterest", value)}
            max={100000}
            step={1000}
          />
          <div className="flex justify-between text-xs text-zinc-500">
            <span>฿0</span>
            <span>Max ฿100,000</span>
          </div>
        </div>

        {/* Donations */}
        <div className="space-y-2 pl-4 border-l-2 border-zinc-700">
          <div className="flex items-center justify-between">
            <Label className="text-sm">Charitable Donations</Label>
            <span className="text-sm font-medium text-zinc-300 tabular-nums">
              {formatCurrency(reliefs.donations, "THB")}
            </span>
          </div>
          <Slider
            value={reliefs.donations}
            onChange={(value) => updateRelief("donations", value)}
            max={100000}
            step={1000}
          />
          <div className="flex justify-between text-xs text-zinc-500">
            <span>฿0</span>
            <span>Up to 10% of net income</span>
          </div>
        </div>

        {/* Political Donation */}
        <div className="space-y-2 pl-4 border-l-2 border-zinc-700">
          <div className="flex items-center justify-between">
            <Label className="text-sm">Political Party Donation</Label>
            <span className="text-sm font-medium text-zinc-300 tabular-nums">
              {formatCurrency(reliefs.politicalDonation, "THB")}
            </span>
          </div>
          <Slider
            value={reliefs.politicalDonation}
            onChange={(value) => updateRelief("politicalDonation", value)}
            max={10000}
            step={1000}
          />
          <div className="flex justify-between text-xs text-zinc-500">
            <span>฿0</span>
            <span>Max ฿10,000</span>
          </div>
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
