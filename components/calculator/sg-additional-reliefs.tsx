"use client";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { formatCurrency } from "@/lib/format";
import type { SGTaxReliefInputs, SGParentReliefType } from "@/lib/countries/types";

interface SGAdditionalReliefsProps {
  reliefs: SGTaxReliefInputs;
  onChange: (reliefs: SGTaxReliefInputs) => void;
}

export function SGAdditionalReliefs({ reliefs, onChange }: SGAdditionalReliefsProps) {
  const updateRelief = <K extends keyof SGTaxReliefInputs>(
    key: K,
    value: SGTaxReliefInputs[K]
  ) => {
    onChange({ ...reliefs, [key]: value });
  };

  return (
    <div className="space-y-6">
      <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
        Additional Tax Reliefs
      </h3>

      {/* Spouse Relief */}
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-sm">Spouse Relief</Label>
          <p className="text-xs text-zinc-500 mt-0.5">
            S$2,000 if spouse income &lt; S$4,000/year
          </p>
        </div>
        <Switch
          checked={reliefs.hasSpouseRelief}
          onCheckedChange={(checked) => updateRelief("hasSpouseRelief", checked)}
        />
      </div>

      {/* Child Relief */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm">Number of Children</Label>
            <p className="text-xs text-zinc-500 mt-0.5">
              S$4,000 per qualifying child
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => updateRelief("numberOfChildren", Math.max(0, reliefs.numberOfChildren - 1))}
              className="w-8 h-8 rounded bg-zinc-700 hover:bg-zinc-600 text-zinc-300 flex items-center justify-center"
            >
              -
            </button>
            <span className="w-8 text-center text-zinc-300 tabular-nums">
              {reliefs.numberOfChildren}
            </span>
            <button
              type="button"
              onClick={() => updateRelief("numberOfChildren", Math.min(10, reliefs.numberOfChildren + 1))}
              className="w-8 h-8 rounded bg-zinc-700 hover:bg-zinc-600 text-zinc-300 flex items-center justify-center"
            >
              +
            </button>
          </div>
        </div>

        {/* Working Mother's Child Relief */}
        {reliefs.numberOfChildren > 0 && (
          <div className="flex items-center justify-between pl-4 border-l-2 border-zinc-700">
            <div>
              <Label className="text-sm">Working Mother&apos;s Child Relief</Label>
              <p className="text-xs text-zinc-500 mt-0.5">
                15-25% of income per child (up to S$50k each)
              </p>
            </div>
            <Switch
              checked={reliefs.isWorkingMother}
              onCheckedChange={(checked) => updateRelief("isWorkingMother", checked)}
            />
          </div>
        )}
      </div>

      {/* Parent Relief */}
      <div className="space-y-3">
        <div>
          <Label className="text-sm">Parent/Grandparent Relief</Label>
          <p className="text-xs text-zinc-500 mt-0.5">
            S$5,500 (not staying) or S$9,000 (staying with you)
          </p>
        </div>
        <div className="flex gap-2">
          {[
            { value: "none" as SGParentReliefType, label: "None" },
            { value: "not_staying" as SGParentReliefType, label: "Not staying" },
            { value: "staying" as SGParentReliefType, label: "Staying" },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => updateRelief("parentRelief", option.value)}
              className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                reliefs.parentRelief === option.value
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/50"
                  : "bg-zinc-700 text-zinc-400 hover:bg-zinc-600"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Number of Parents */}
        {reliefs.parentRelief !== "none" && (
          <div className="flex items-center justify-between pl-4 border-l-2 border-zinc-700">
            <Label className="text-sm text-zinc-400">Number of dependants</Label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => updateRelief("numberOfParents", Math.max(1, reliefs.numberOfParents - 1))}
                className="w-8 h-8 rounded bg-zinc-700 hover:bg-zinc-600 text-zinc-300 flex items-center justify-center"
              >
                -
              </button>
              <span className="w-8 text-center text-zinc-300 tabular-nums">
                {reliefs.numberOfParents || 1}
              </span>
              <button
                type="button"
                onClick={() => updateRelief("numberOfParents", Math.min(4, (reliefs.numberOfParents || 1) + 1))}
                className="w-8 h-8 rounded bg-zinc-700 hover:bg-zinc-600 text-zinc-300 flex items-center justify-center"
              >
                +
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Course Fees */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm">Course Fees Relief</Label>
            <p className="text-xs text-zinc-500 mt-0.5">Up to S$5,500 for approved courses</p>
          </div>
          <span className="text-sm font-medium text-zinc-300 tabular-nums">
            {formatCurrency(reliefs.courseFees, "SGD")}
          </span>
        </div>
        <Slider
          value={reliefs.courseFees}
          onChange={(value) => updateRelief("courseFees", value)}
          max={5500}
          step={100}
        />
        <div className="flex justify-between text-xs text-zinc-500">
          <span>S$0</span>
          <span>S$5,500 limit</span>
        </div>
      </div>
    </div>
  );
}
