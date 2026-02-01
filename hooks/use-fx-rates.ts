"use client";

import type { CurrencyCode } from "@/lib/countries/types";
import { useCallback, useEffect, useState } from "react";

export interface FxRatesResponse {
  base: CurrencyCode;
  rates: Record<CurrencyCode, number>;
  updatedAt: string;
}

interface FxRatesState {
  data: FxRatesResponse | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useFxRates(base: CurrencyCode): FxRatesState {
  const [data, setData] = useState<FxRatesResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshIndex, setRefreshIndex] = useState(0);

  const refresh = useCallback(() => {
    setRefreshIndex((value) => value + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchRates() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/fx?base=${base}`, {
          signal: controller.signal,
        });

        const payload = (await response.json()) as unknown;
        const payloadError =
          typeof payload === "object" &&
          payload !== null &&
          "error" in payload &&
          typeof (payload as { error?: string }).error === "string"
            ? (payload as { error?: string }).error
            : undefined;

        if (!response.ok) {
          throw new Error(payloadError ?? "Failed to fetch FX rates");
        }

        setData(payload as FxRatesResponse);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          return;
        }

        if (err instanceof Error) {
          setError(err.message);
          return;
        }

        setError("Failed to fetch FX rates");
      } finally {
        setIsLoading(false);
      }
    }

    fetchRates();

    return () => controller.abort();
  }, [base, refreshIndex]);

  return {
    data,
    isLoading,
    error,
    refresh,
  };
}
