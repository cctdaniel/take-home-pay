"use client";

import { SalaryInput } from "@/components/calculator/salary-input";
import { CompareBreakdown } from "@/components/compare/compare-breakdown";
import { CompareResults } from "@/components/compare/compare-results";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NumberStepper } from "@/components/ui/number-stepper";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useCountryComparison, type ComparisonAssumptions, type MaritalStatus } from "@/hooks/use-country-comparison";
import { useFxRates } from "@/hooks/use-fx-rates";
import { CURRENCIES } from "@/lib/countries/currency";
import { getSupportedCountries } from "@/lib/countries/registry";
import type { CountryCode, CurrencyCode } from "@/lib/countries/types";
import { getSupportedStates } from "@/lib/countries/us/state-tax";
import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";

const BASE_CURRENCIES: CurrencyCode[] = [
  "USD",
  "EUR",
  "SGD",
  "AUD",
  "HKD",
  "KRW",
  "THB",
  "IDR",
  "CHF",
];

const COUNTRIES = getSupportedCountries();
const US_STATES = getSupportedStates();

const STEPS = [
  {
    title: "Annual salary",
    shortLabel: "Salary",
    description: "We convert this base salary into local currencies.",
  },
  {
    title: "Marital status",
    shortLabel: "Status",
    description: "Used to estimate filing status and spouse allowances.",
  },
  {
    title: "Number of children",
    shortLabel: "Children",
    description: "Used for child-related reliefs across countries.",
  },
  {
    title: "Current fiscal residence",
    shortLabel: "Baseline",
    description: "Baseline for the +/- comparison.",
  },
  {
    title: "Assumptions",
    shortLabel: "Assumptions",
    description: "Optional toggles for special regimes and edge cases.",
  },
];

const TOTAL_STEPS = STEPS.length;

export function CompareWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [baseSalary, setBaseSalary] = useState(100000);
  const [baseCurrency, setBaseCurrency] = useState<CurrencyCode>("USD");
  const [maritalStatus, setMaritalStatus] = useState<MaritalStatus>("single");
  const [numberOfChildren, setNumberOfChildren] = useState(0);
  const [baselineCountry, setBaselineCountry] = useState<CountryCode>("US");
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>("US");
  const [hasYoungChildrenTouched, setHasYoungChildrenTouched] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [viewMode, setViewMode] = useState<"edit" | "summary">("edit");
  const [assumptions, setAssumptions] = useState<ComparisonAssumptions>({
    isResident: true,
    spouseHasNoIncome: false,
    eligibleNl30Ruling: false,
    eligiblePtNhr2: false,
    usState: "CA",
    age: 30,
    hasYoungChildren: false,
    hasPrivateHealthInsurance: true,
    retirementContributions: "none",
  });

  const fx = useFxRates(baseCurrency);

  const handleMaritalStatusChange = (value: MaritalStatus) => {
    setMaritalStatus(value);
    if (value === "single") {
      setAssumptions((prev) => ({ ...prev, spouseHasNoIncome: false }));
    }
  };

  const handleChildrenChange = (value: number) => {
    setNumberOfChildren(value);
    if (!hasYoungChildrenTouched) {
      setAssumptions((prev) => ({
        ...prev,
        hasYoungChildren: value > 0,
      }));
    }
  };

  const comparisonInputs = useMemo(
    () => ({
      baseSalary,
      baseCurrency,
      maritalStatus,
      numberOfChildren,
      baselineCountry,
      assumptions,
    }),
    [
      baseSalary,
      baseCurrency,
      maritalStatus,
      numberOfChildren,
      baselineCountry,
      assumptions,
    ],
  );

  const comparison = useCountryComparison(comparisonInputs, fx.data);
  const hasResults = hasSubmitted;
  const isSummary = hasResults && viewMode === "summary";
  const progress = Math.min(
    100,
    Math.round(((currentStep + 1) / TOTAL_STEPS) * 100),
  );

  const baselineName =
    COUNTRIES.find((country) => country.code === baselineCountry)?.name ??
    baselineCountry;

  const selectedResult =
    comparison.results.find((result) => result.country === selectedCountry) ??
    comparison.baseline ??
    comparison.results[0] ??
    null;

  const handleBaselineChange = (value: CountryCode) => {
    setBaselineCountry(value);
    setSelectedCountry(value);
  };

  const handleSelectCountry = (value: CountryCode) => {
    setSelectedCountry(value);
    setViewMode("summary");
  };

  const isNextDisabled = currentStep === 0 && baseSalary <= 0;

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS - 1) {
      setCurrentStep((step) => step + 1);
      return;
    }

    setHasSubmitted(true);
    setViewMode("summary");
    setCurrentStep(TOTAL_STEPS);
  };

  const handleBack = () => {
    if (currentStep === 0) return;
    setCurrentStep((step) => Math.max(0, step - 1));
  };

  const activeStep = STEPS[Math.min(currentStep, TOTAL_STEPS - 1)];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <div className="lg:col-span-3">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 mb-4">
          <p className="text-xs text-zinc-500">Jump to a step</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {STEPS.map((step, index) => {
              const isActive = viewMode === "edit" && currentStep === index;
              return (
                <button
                  key={step.title}
                  type="button"
                  onClick={() => {
                    setCurrentStep(index);
                    setViewMode("edit");
                  }}
                  aria-current={isActive ? "step" : undefined}
                  className={cn(
                    "flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition",
                    isActive
                      ? "border-emerald-400/50 bg-emerald-500/10 text-emerald-200"
                      : "border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200",
                  )}
                >
                  <span
                    className={cn(
                      "inline-flex h-5 w-5 items-center justify-center rounded-full text-[11px]",
                      isActive
                        ? "bg-emerald-500 text-zinc-950"
                        : "bg-zinc-800 text-zinc-400",
                    )}
                  >
                    {index + 1}
                  </span>
                  {step.shortLabel}
                </button>
              );
            })}
          </div>
        </div>

        {viewMode === "edit" && (
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.08),_transparent_55%)]" />
            <CardHeader className="relative">
              <div className="flex items-center justify-between text-xs text-zinc-500">
                <span>
                  Step {currentStep + 1} of {TOTAL_STEPS}
                </span>
                <span>{progress}% complete</span>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <CardTitle className="text-2xl text-zinc-100 mt-4">
                {activeStep.title}
              </CardTitle>
              <CardDescription>{activeStep.description}</CardDescription>
            </CardHeader>
            <CardContent className="relative space-y-8">
              {currentStep === 0 && (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-[1.2fr_0.8fr]">
                  <SalaryInput
                    value={baseSalary}
                    onChange={setBaseSalary}
                    currency={baseCurrency}
                  />
                  <div className="space-y-2">
                    <Label htmlFor="base-currency">Base currency</Label>
                    <Select
                      id="base-currency"
                      value={baseCurrency}
                      onChange={(event) =>
                        setBaseCurrency(event.target.value as CurrencyCode)
                      }
                    >
                      {BASE_CURRENCIES.map((currency) => (
                        <option key={currency} value={currency}>
                          {currency} - {CURRENCIES[currency].name}
                        </option>
                      ))}
                    </Select>
                    <p className="text-xs text-zinc-500">
                      Used to convert your salary into each local currency.
                    </p>
                  </div>
                </div>
              )}

              {currentStep === 1 && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {([
                    {
                      value: "single",
                      title: "Single",
                      description: "No spouse or partner allowances",
                    },
                    {
                      value: "married",
                      title: "Married",
                      description: "Joint filing or spouse allowances",
                    },
                  ] as const).map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleMaritalStatusChange(option.value)}
                      className={cn(
                        "rounded-xl border p-4 text-left transition",
                        maritalStatus === option.value
                          ? "border-emerald-400/50 bg-emerald-500/10 text-emerald-100"
                          : "border-zinc-800 bg-zinc-900/60 text-zinc-200 hover:border-zinc-700",
                      )}
                    >
                      <p className="text-base font-semibold">{option.title}</p>
                      <p className="text-xs text-zinc-400 mt-1">
                        {option.description}
                      </p>
                    </button>
                  ))}
                </div>
              )}

              {currentStep === 2 && (
                <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
                  <div>
                    <p className="text-sm font-medium text-zinc-200">
                      Number of children
                    </p>
                    <p className="text-xs text-zinc-500 mt-1">
                      Used for child reliefs and credits.
                    </p>
                  </div>
                  <NumberStepper
                    value={numberOfChildren}
                    onChange={handleChildrenChange}
                    min={0}
                    max={6}
                    label="children"
                  />
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-2">
                  <Label htmlFor="baseline-country">Current fiscal residence</Label>
                  <Select
                    id="baseline-country"
                    value={baselineCountry}
                    onChange={(event) =>
                      handleBaselineChange(event.target.value as CountryCode)
                    }
                  >
                    {COUNTRIES.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.name}
                      </option>
                    ))}
                  </Select>
                  <p className="text-xs text-zinc-500">
                    Delta values show the difference vs this baseline country.
                  </p>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-4">
                  <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-zinc-200">
                          Assume resident for destination countries
                        </p>
                        <p className="text-xs text-zinc-500 mt-1">
                          Applies to AU, KR, TH, HK, SG, and PT.
                        </p>
                      </div>
                      <Switch
                        checked={assumptions.isResident}
                        onCheckedChange={(checked) =>
                          setAssumptions((prev) => ({
                            ...prev,
                            isResident: checked,
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-zinc-200">
                          Spouse has no income
                        </p>
                        <p className="text-xs text-zinc-500 mt-1">
                          Enables spouse reliefs where available.
                        </p>
                      </div>
                      <Switch
                        checked={assumptions.spouseHasNoIncome}
                        disabled={maritalStatus === "single"}
                        onCheckedChange={(checked) =>
                          setAssumptions((prev) => ({
                            ...prev,
                            spouseHasNoIncome: checked,
                          }))
                        }
                      />
                    </div>
                    {maritalStatus === "single" && (
                      <p className="text-xs text-zinc-500 mt-2">
                        Switch to married to enable this.
                      </p>
                    )}
                  </div>

                  <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
                    <p className="text-sm font-medium text-zinc-200">
                      Retirement contributions
                    </p>
                    <p className="text-xs text-zinc-500 mt-1">
                      Applies to tax-advantaged plans where supported.
                    </p>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {([
                        { label: "None", value: "none" },
                        { label: "Max", value: "max" },
                      ] as const).map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() =>
                            setAssumptions((prev) => ({
                              ...prev,
                              retirementContributions: option.value,
                            }))
                          }
                          className={cn(
                            "rounded-lg border px-3 py-2 text-xs font-semibold transition",
                            assumptions.retirementContributions === option.value
                              ? "border-emerald-400/50 bg-emerald-500/10 text-emerald-100"
                              : "border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200",
                          )}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-zinc-200">
                            NL 30% ruling
                          </p>
                          <p className="text-xs text-zinc-500 mt-1">
                            Expat tax regime for Netherlands.
                          </p>
                        </div>
                        <Switch
                          checked={assumptions.eligibleNl30Ruling}
                          onCheckedChange={(checked) =>
                            setAssumptions((prev) => ({
                              ...prev,
                              eligibleNl30Ruling: checked,
                            }))
                          }
                        />
                      </div>
                    </div>

                    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-zinc-200">
                            PT NHR 2.0
                          </p>
                          <p className="text-xs text-zinc-500 mt-1">
                            Special regime for new residents.
                          </p>
                        </div>
                        <Switch
                          checked={assumptions.eligiblePtNhr2}
                          onCheckedChange={(checked) =>
                            setAssumptions((prev) => ({
                              ...prev,
                              eligiblePtNhr2: checked,
                            }))
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-2">
                      <Label htmlFor="us-state">US state</Label>
                      <Select
                        id="us-state"
                        value={assumptions.usState}
                        onChange={(event) =>
                          setAssumptions((prev) => ({
                            ...prev,
                            usState: event.target.value,
                          }))
                        }
                      >
                        {US_STATES.map((state) => (
                          <option key={state.code} value={state.code}>
                            {state.name}
                          </option>
                        ))}
                      </Select>
                      <p className="text-xs text-zinc-500">
                        Used for US state income tax estimates.
                      </p>
                    </div>

                    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-2">
                      <Label htmlFor="age-input">Age</Label>
                      <Input
                        id="age-input"
                        type="number"
                        min={18}
                        max={80}
                        value={assumptions.age}
                        onChange={(event) =>
                          setAssumptions((prev) => ({
                            ...prev,
                            age: Number(event.target.value) || 0,
                          }))
                        }
                      />
                      <p className="text-xs text-zinc-500">
                        Used for SG CPF and PT contribution limits.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-zinc-200">
                            Youngest child under 12
                          </p>
                          <p className="text-xs text-zinc-500 mt-1">
                            Enables NL IACK credit.
                          </p>
                        </div>
                        <Switch
                          checked={assumptions.hasYoungChildren}
                          disabled={numberOfChildren === 0}
                          onCheckedChange={(checked) => {
                            setHasYoungChildrenTouched(true);
                            setAssumptions((prev) => ({
                              ...prev,
                              hasYoungChildren: checked,
                            }));
                          }}
                        />
                      </div>
                    </div>

                    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-zinc-200">
                            Private health insurance (AU)
                          </p>
                          <p className="text-xs text-zinc-500 mt-1">
                            Affects Medicare levy surcharge.
                          </p>
                        </div>
                        <Switch
                          checked={assumptions.hasPrivateHealthInsurance}
                          onCheckedChange={(checked) =>
                            setAssumptions((prev) => ({
                              ...prev,
                              hasPrivateHealthInsurance: checked,
                            }))
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between border-t border-zinc-800 pt-4">
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={currentStep === 0}
                  className={cn(
                    "rounded-lg border px-4 py-2 text-xs font-medium transition",
                    currentStep === 0
                      ? "border-zinc-800 text-zinc-600"
                      : "border-zinc-700 text-zinc-300 hover:border-zinc-600 hover:text-zinc-100",
                  )}
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={isNextDisabled}
                  className={cn(
                    "rounded-lg bg-emerald-500 px-4 py-2 text-xs font-semibold text-zinc-950 transition hover:bg-emerald-400",
                    isNextDisabled && "cursor-not-allowed opacity-60",
                  )}
                >
                  {currentStep === TOTAL_STEPS - 1 ? "See results" : "Next"}
                </button>
              </div>
            </CardContent>
          </Card>
        )}

        {isSummary && (
          <CompareBreakdown
            selected={selectedResult}
            baseSalary={baseSalary}
            baseCurrency={baseCurrency}
            maritalStatus={maritalStatus}
            numberOfChildren={numberOfChildren}
            baselineName={baselineName}
          />
        )}
      </div>

      <div className="lg:col-span-2">
        <CompareResults
          hasResults={hasResults}
          isLoading={fx.isLoading}
          error={fx.error}
          comparison={comparison}
          baseCurrency={baseCurrency}
          baseSalary={baseSalary}
          onRetry={fx.refresh}
          selectedCountry={selectedCountry}
          onSelectCountry={handleSelectCountry}
        />
      </div>
    </div>
  );
}
