import { CURRENCIES } from "@/lib/countries/currency";
import type { CurrencyCode } from "@/lib/countries/types";
import { NextResponse } from "next/server";

const FX_API_BASE = "https://v6.exchangerate-api.com/v6";

export const revalidate = 43200;

function isCurrencyCode(value: string): value is CurrencyCode {
  return value in CURRENCIES;
}

export async function GET(request: Request) {
  const apiKey = process.env.EXCHANGERATE_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing EXCHANGERATE_API_KEY" },
      { status: 500 },
    );
  }

  const { searchParams } = new URL(request.url);
  const baseParam = (searchParams.get("base") ?? "USD").toUpperCase();

  if (!isCurrencyCode(baseParam)) {
    return NextResponse.json(
      { error: "Unsupported base currency" },
      { status: 400 },
    );
  }

  const requestUrl = `${FX_API_BASE}/${apiKey}/latest/${baseParam}`;

  try {
    const response = await fetch(requestUrl, { next: { revalidate } });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch FX rates" },
        { status: response.status },
      );
    }

    const data = (await response.json()) as {
      result?: string;
      error?: string;
      "error-type"?: string;
      base_code?: string;
      conversion_rates?: Record<string, number>;
      time_last_update_unix?: number;
      time_last_update_utc?: string;
    };

    if (data.result !== "success" || !data.conversion_rates) {
      return NextResponse.json(
        {
          error: data["error-type"] ?? data.error ?? "FX provider error",
        },
        { status: 502 },
      );
    }

    const supportedCurrencies = Object.keys(CURRENCIES) as CurrencyCode[];
    const rates = supportedCurrencies.reduce(
      (acc, code) => {
        const rate = data.conversion_rates?.[code];
        if (typeof rate === "number") {
          acc[code] = rate;
        }
        return acc;
      },
      {} as Record<CurrencyCode, number>,
    );

    if (!rates[baseParam]) {
      rates[baseParam] = 1;
    }

    const updatedAt =
      data.time_last_update_utc ??
      (data.time_last_update_unix
        ? new Date(data.time_last_update_unix * 1000).toISOString()
        : new Date().toISOString());

    return NextResponse.json(
      {
        base: baseParam,
        rates,
        updatedAt,
      },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { error: "FX request failed" },
      { status: 502 },
    );
  }
}
