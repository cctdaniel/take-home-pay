import { CURRENCIES } from "@/lib/countries/currency";
import type { CurrencyCode } from "@/lib/countries/types";
import { NextResponse } from "next/server";

const FX_API_BASE = "https://v6.exchangerate-api.com/v6";
const FX_CACHE_TTL_MS = 60 * 60 * 1000;

interface FxPayload {
  base: CurrencyCode;
  rates: Record<CurrencyCode, number>;
  updatedAt: string;
}

const fxCache = new Map<
  CurrencyCode,
  {
    expiresAt: number;
    payload: FxPayload;
  }
>();

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
  const forceRefresh = searchParams.get("refresh") === "1";

  if (!isCurrencyCode(baseParam)) {
    return NextResponse.json(
      { error: "Unsupported base currency" },
      { status: 400 },
    );
  }

  const cached = fxCache.get(baseParam);
  if (!forceRefresh && cached && cached.expiresAt > Date.now()) {
    return NextResponse.json(cached.payload, { status: 200 });
  }

  const requestUrl = `${FX_API_BASE}/${apiKey}/latest/${baseParam}`;

  try {
    const response = await fetch(requestUrl, { cache: "no-store" });

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

    const payload = {
      base: baseParam,
      rates,
      updatedAt,
    };

    fxCache.set(baseParam, {
      expiresAt: Date.now() + FX_CACHE_TTL_MS,
      payload,
    });

    return NextResponse.json(payload, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "FX request failed" },
      { status: 502 },
    );
  }
}
