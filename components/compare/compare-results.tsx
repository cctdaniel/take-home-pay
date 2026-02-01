"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatPercentage } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { CountryCode, CurrencyCode } from "@/lib/countries/types";
import type { ComparisonOutput } from "@/hooks/use-country-comparison";

interface CompareResultsProps {
  hasResults: boolean;
  isLoading: boolean;
  error: string | null;
  comparison: ComparisonOutput;
  baseCurrency: CurrencyCode;
  baseSalary: number;
  onRetry: () => void;
  selectedCountry: CountryCode | null;
  onSelectCountry: (country: CountryCode) => void;
}

function formatUpdatedAt(updatedAt?: string) {
  if (!updatedAt) return null;
  const parsed = new Date(updatedAt);
  if (Number.isNaN(parsed.getTime())) {
    return updatedAt;
  }

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "numeric",
  }).format(parsed);
}

export function CompareResults({
  hasResults,
  isLoading,
  error,
  comparison,
  baseCurrency,
  baseSalary,
  onRetry,
  selectedCountry,
  onSelectCountry,
}: CompareResultsProps) {
  const updatedAt = formatUpdatedAt(comparison.fxUpdatedAt);
  const topCountry = comparison.results[0];

  return (
    <Card className="sticky top-6">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-medium text-zinc-200">
          Results
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!hasResults && (
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4 text-sm text-zinc-400">
            Complete the questionnaire to unlock the comparison list.
          </div>
        )}

        {hasResults && isLoading && (
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4 text-sm text-zinc-400">
            Fetching FX rates...
          </div>
        )}

        {hasResults && !isLoading && error && (
          <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 p-4 text-sm text-rose-200">
            <p>{error}</p>
            <button
              type="button"
              onClick={onRetry}
              className="mt-3 inline-flex items-center rounded-md border border-rose-500/40 px-3 py-1.5 text-xs font-medium text-rose-100 transition hover:border-rose-400/70"
            >
              Retry FX rates
            </button>
          </div>
        )}

        {hasResults && !isLoading && !error && comparison.results.length === 0 && (
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4 text-sm text-zinc-400">
            FX rates are unavailable right now.
          </div>
        )}

        {hasResults && !isLoading && !error && comparison.results.length > 0 && (
          <div className="space-y-4">
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>
                  Base salary: {formatCurrency(baseSalary, baseCurrency)}
                </span>
                {updatedAt ? <span>Rates as of {updatedAt}</span> : null}
              </div>
            </div>

            <div className="space-y-3">
              {comparison.results.map((result) => {
                const isTop = topCountry?.country === result.country;
                const isSelected = selectedCountry === result.country;
                const isBaseline =
                  comparison.baseline?.country === result.country;
                const deltaClass =
                  result.deltaBase > 0
                    ? "text-emerald-300"
                    : result.deltaBase < 0
                      ? "text-rose-300"
                      : "text-zinc-400";
                const deltaPrefix = result.deltaBase > 0 ? "+" : "";
                const deltaPercentLabel = `${
                  result.deltaPercent > 0
                    ? "+"
                    : result.deltaPercent < 0
                      ? "-"
                      : ""
                }${formatPercentage(Math.abs(result.deltaPercent))}`;
                const deltaValueLabel = `${deltaPrefix}${formatCurrency(
                  Math.abs(result.deltaBase),
                  baseCurrency,
                )}`;

                return (
                  <button
                    key={result.country}
                    type="button"
                    onClick={() => onSelectCountry(result.country)}
                    className={cn(
                      "w-full text-left rounded-xl border p-4 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400",
                      isSelected
                        ? "border-emerald-400/70 bg-emerald-500/10"
                        : isTop
                          ? "border-emerald-400/40 bg-emerald-500/5"
                          : "border-zinc-800 bg-zinc-900/60 hover:border-zinc-700",
                    )}
                    aria-pressed={isSelected}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-semibold text-zinc-100">
                            {result.name}
                          </h3>
                          {isBaseline && (
                            <span className="rounded-full border border-emerald-400/40 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-200">
                              Baseline
                            </span>
                          )}
                          {isTop && !isBaseline && (
                            <span className="rounded-full border border-emerald-400/40 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-200">
                              Best take-home
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-400 mt-1">
                          {formatCurrency(result.netLocal, result.currency)} net
                          ({formatCurrency(result.netBase, baseCurrency)} base)
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-zinc-100">
                          {formatPercentage(result.takeHomeRate)}
                        </p>
                        <p className="text-xs text-zinc-400">
                          Effective tax {formatPercentage(result.effectiveTaxRate)}
                        </p>
                      </div>
                    </div>

                    <Separator className="my-3" />

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-500">Delta vs baseline</span>
                      <span className={cn("font-medium", deltaClass)}>
                        {deltaValueLabel} ({deltaPercentLabel})
                      </span>
                    </div>

                    {result.assumptions.length > 0 && (
                      <p className="mt-3 text-[11px] text-zinc-500">
                        {result.assumptions.join(" • ")}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>

          </div>
        )}
      </CardContent>
    </Card>
  );
}
