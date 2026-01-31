"use client";

import { Label } from "@/components/ui/label";
import { NumberStepper } from "@/components/ui/number-stepper";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { formatCurrency } from "@/lib/format";
import type { HKTaxReliefInputs } from "@/lib/countries/types";

interface HKAdditionalReliefsProps {
  reliefs: HKTaxReliefInputs;
  onChange: (reliefs: HKTaxReliefInputs) => void;
}

export function HKAdditionalReliefs({ reliefs, onChange }: HKAdditionalReliefsProps) {
  const updateRelief = <K extends keyof HKTaxReliefInputs>(
    key: K,
    value: HKTaxReliefInputs[K],
  ) => {
    onChange({ ...reliefs, [key]: value });
  };

  return (
    <div className="space-y-6">
      <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
        Allowances & Deductions
      </h3>

      <div className="space-y-3">
        <h4 className="text-xs font-medium text-zinc-500">Personal Allowances</h4>

        <div className="flex items-center justify-between pl-4 border-l-2 border-zinc-700">
          <div>
            <Label className="text-sm">Married Person&apos;s Allowance</Label>
            <p className="text-xs text-zinc-500 mt-0.5">HK$264,000 (replaces basic allowance)</p>
          </div>
          <Switch
            checked={reliefs.hasMarriedAllowance}
            onCheckedChange={(checked) => {
              updateRelief("hasMarriedAllowance", checked);
              if (checked) updateRelief("hasSingleParentAllowance", false);
            }}
          />
        </div>

        <div className="flex items-center justify-between pl-4 border-l-2 border-zinc-700">
          <div>
            <Label className="text-sm">Single Parent Allowance</Label>
            <p className="text-xs text-zinc-500 mt-0.5">HK$132,000 (not for married)</p>
          </div>
          <Switch
            checked={reliefs.hasSingleParentAllowance}
            onCheckedChange={(checked) => {
              updateRelief("hasSingleParentAllowance", checked);
              if (checked) updateRelief("hasMarriedAllowance", false);
            }}
          />
        </div>

        <div className="pl-4 border-l-2 border-zinc-700 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm">Number of Children</Label>
              <p className="text-xs text-zinc-500 mt-0.5">HK$130,000 per child</p>
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
                Children born this year (additional HK$130,000 each)
              </Label>
              <NumberStepper
                value={reliefs.numberOfNewbornChildren}
                onChange={(value) => updateRelief("numberOfNewbornChildren", value)}
                min={0}
                max={reliefs.numberOfChildren}
                label="Newborn Children"
              />
            </div>
          )}
        </div>

        <div className="pl-4 border-l-2 border-zinc-700 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm">Dependent Parents/Grandparents</Label>
              <p className="text-xs text-zinc-500 mt-0.5">HK$50,000 each (age 60+)</p>
            </div>
            <NumberStepper
              value={reliefs.numberOfDependentParents}
              onChange={(value) => updateRelief("numberOfDependentParents", value)}
              min={0}
              max={4}
              label="Dependent Parents"
            />
          </div>
          {reliefs.numberOfDependentParents > 0 && (
            <div className="flex items-center justify-between">
              <Label className="text-xs text-zinc-400">
                Parents living with you (additional HK$50,000 each)
              </Label>
              <NumberStepper
                value={reliefs.numberOfDependentParentsLivingWith}
                onChange={(value) => updateRelief("numberOfDependentParentsLivingWith", value)}
                min={0}
                max={reliefs.numberOfDependentParents}
                label="Parents Living With You"
              />
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pl-4 border-l-2 border-zinc-700">
          <div>
            <Label className="text-sm">Dependent Brothers/Sisters</Label>
            <p className="text-xs text-zinc-500 mt-0.5">HK$37,500 each</p>
          </div>
          <NumberStepper
            value={reliefs.numberOfDependentSiblings}
            onChange={(value) => updateRelief("numberOfDependentSiblings", value)}
            min={0}
            max={6}
            label="Dependent Siblings"
          />
        </div>

        <div className="flex items-center justify-between pl-4 border-l-2 border-zinc-700">
          <div>
            <Label className="text-sm">Personal Disability Allowance</Label>
            <p className="text-xs text-zinc-500 mt-0.5">HK$75,000</p>
          </div>
          <Switch
            checked={reliefs.hasDisabilityAllowance}
            onCheckedChange={(checked) => updateRelief("hasDisabilityAllowance", checked)}
          />
        </div>

        <div className="flex items-center justify-between pl-4 border-l-2 border-zinc-700">
          <div>
            <Label className="text-sm">Disabled Dependents</Label>
            <p className="text-xs text-zinc-500 mt-0.5">HK$75,000 each</p>
          </div>
          <NumberStepper
            value={reliefs.numberOfDisabledDependents}
            onChange={(value) => updateRelief("numberOfDisabledDependents", value)}
            min={0}
            max={4}
            label="Disabled Dependents"
          />
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-xs font-medium text-zinc-500">Deductions</h4>

        <div className="space-y-2 pl-4 border-l-2 border-zinc-700">
          <div className="flex items-center justify-between">
            <Label className="text-sm">Self-education Expenses</Label>
            <span className="text-sm font-medium text-zinc-300 tabular-nums">
              {formatCurrency(reliefs.selfEducationExpenses, "HKD")}
            </span>
          </div>
          <Slider
            value={reliefs.selfEducationExpenses}
            onChange={(value) => updateRelief("selfEducationExpenses", value)}
            max={100000}
            step={1000}
          />
          <div className="flex justify-between text-xs text-zinc-500">
            <span>HK$0</span>
            <span>Max HK$100,000</span>
          </div>
        </div>

        <div className="space-y-2 pl-4 border-l-2 border-zinc-700">
          <div className="flex items-center justify-between">
            <Label className="text-sm">Home Loan Interest</Label>
            <span className="text-sm font-medium text-zinc-300 tabular-nums">
              {formatCurrency(reliefs.homeLoanInterest, "HKD")}
            </span>
          </div>
          <Slider
            value={reliefs.homeLoanInterest}
            onChange={(value) => updateRelief("homeLoanInterest", value)}
            max={100000}
            step={1000}
          />
          <div className="flex justify-between text-xs text-zinc-500">
            <span>HK$0</span>
            <span>Max HK$100,000</span>
          </div>
        </div>

        <div className="space-y-2 pl-4 border-l-2 border-zinc-700">
          <div className="flex items-center justify-between">
            <Label className="text-sm">Domestic Rent</Label>
            <span className="text-sm font-medium text-zinc-300 tabular-nums">
              {formatCurrency(reliefs.domesticRent, "HKD")}
            </span>
          </div>
          <Slider
            value={reliefs.domesticRent}
            onChange={(value) => updateRelief("domesticRent", value)}
            max={100000}
            step={1000}
          />
          <div className="flex justify-between text-xs text-zinc-500">
            <span>HK$0</span>
            <span>Max HK$100,000</span>
          </div>
        </div>

        <div className="space-y-2 pl-4 border-l-2 border-zinc-700">
          <div className="flex items-center justify-between">
            <Label className="text-sm">Elderly Residential Care Expenses</Label>
            <span className="text-sm font-medium text-zinc-300 tabular-nums">
              {formatCurrency(reliefs.elderlyResidentialCareExpenses, "HKD")}
            </span>
          </div>
          <Slider
            value={reliefs.elderlyResidentialCareExpenses}
            onChange={(value) => updateRelief("elderlyResidentialCareExpenses", value)}
            max={100000}
            step={1000}
          />
          <div className="flex justify-between text-xs text-zinc-500">
            <span>HK$0</span>
            <span>Max HK$100,000</span>
          </div>
        </div>

        <div className="space-y-2 pl-4 border-l-2 border-zinc-700">
          <div className="flex items-center justify-between">
            <Label className="text-sm">Approved Charitable Donations</Label>
            <span className="text-sm font-medium text-zinc-300 tabular-nums">
              {formatCurrency(reliefs.charitableDonations, "HKD")}
            </span>
          </div>
          <Slider
            value={reliefs.charitableDonations}
            onChange={(value) => updateRelief("charitableDonations", value)}
            max={500000}
            step={5000}
          />
          <div className="flex justify-between text-xs text-zinc-500">
            <span>HK$0</span>
            <span>Capped at 35% of net income</span>
          </div>
        </div>
      </div>
    </div>
  );
}
