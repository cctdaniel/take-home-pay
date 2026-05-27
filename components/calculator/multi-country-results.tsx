"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { CalculationResult, PayFrequency } from "@/lib/countries/types";
import {
  formatCurrency,
  formatCurrencyWithCents,
  formatPercentage,
} from "@/lib/format";
import { toPng } from "html-to-image";
import { useRef, useState } from "react";
import { CountryResultBreakdown } from "./results/country-result-breakdown";
import { COUNTRY_RESULT_BREAKDOWNS } from "./results/country-result-breakdowns.generated";

interface MultiCountryResultsProps {
  result: CalculationResult;
  usState?: string;
  usContributions?: {
    traditional401k: number;
    rothIRA: number;
    hsa: number;
    healthFsa?: number;
    dependentCareFsa?: number;
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
  const { grossSalary, country, currency } = result;
  const frequencyLabel = getFrequencyLabel(result.perPeriod.frequency);
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const hasCountryBreakdown = Boolean(COUNTRY_RESULT_BREAKDOWNS[country]);

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
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-medium text-zinc-300">
          Take-Home Pay
        </CardTitle>
        <button
          type="button"
          onClick={handleDownload}
          disabled={isDownloading}
          data-download-button="true"
          aria-label="Download take-home pay section"
          className="inline-flex cursor-pointer items-center justify-center rounded-md border border-zinc-800 bg-zinc-900/80 p-2 text-zinc-300 transition hover:border-zinc-700 hover:text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
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
        <div className="py-4 text-center">
          <div className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Net Salary
          </div>
          <div className="text-5xl font-bold tracking-tight text-emerald-400">
            {formatCurrency(result.netSalary, currency)}
          </div>
          <div className="mt-2 text-sm text-zinc-500">
            {formatCurrencyWithCents(result.perPeriod.net, currency)} per{" "}
            {frequencyLabel}
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg bg-zinc-800/50 p-3">
          <span className="text-sm text-zinc-400">Effective Tax Rate</span>
          <span className="text-lg font-semibold text-zinc-200">
            {formatPercentage(result.effectiveTaxRate)}
          </span>
        </div>

        <Separator />

        <div className="space-y-1">
          <h4 className="mb-3 text-xs font-medium uppercase tracking-wider text-zinc-500">
            Breakdown
          </h4>

          <div className="flex items-center justify-between py-2">
            <span className="text-sm font-medium text-zinc-300">
              Gross Salary
            </span>
            <span className="text-sm font-medium tabular-nums text-zinc-200">
              {formatCurrency(grossSalary, currency)}
            </span>
          </div>

          {hasCountryBreakdown ? <Separator className="my-2" /> : null}

          <CountryResultBreakdown
            result={result}
            grossSalary={grossSalary}
            currency={currency}
            usState={usState}
            usContributions={usContributions}
          />

          <Separator className="my-2" />

          <div className="flex items-center justify-between py-2 font-semibold">
            <span className="text-sm text-zinc-200">Total Deductions</span>
            <span className="text-sm tabular-nums text-red-400">
              -{formatCurrency(result.totalDeductions, currency)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
