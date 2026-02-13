import { MultiCountryCalculator } from "@/components/calculator/multi-country-calculator";
import { TaxYearBadge } from "@/components/calculator/tax-year-badge";
import { LAST_UPDATED, TAX_YEAR } from "@/lib/constants/tax-year";
import { COUNTRY_DESCRIPTIONS, COUNTRY_HEADER_INFO, COUNTRY_KEYWORDS } from "@/lib/countries/country-page-content";
import {
  SUPPORTED_COUNTRIES,
  getCountryConfig,
  isCountrySupported,
} from "@/lib/countries/registry";
import type { CountryCode } from "@/lib/countries/types";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

// ============================================================================
// STATIC PARAMS - Pre-render all supported country pages at build time
// ============================================================================
export function generateStaticParams() {
  return SUPPORTED_COUNTRIES.map((country) => ({
    country: country.toLowerCase(),
  }));
}

// ============================================================================
// METADATA - Country-specific SEO metadata
// ============================================================================
interface PageProps {
  params: Promise<{ country: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { country } = await params;
  const countryCode = country.toUpperCase();

  // Validate country code
  if (!isCountrySupported(countryCode)) {
    return {
      title: "Not Found",
    };
  }

  const config = getCountryConfig(countryCode as CountryCode);
  const description = COUNTRY_DESCRIPTIONS[countryCode as CountryCode];
  const keywords = COUNTRY_KEYWORDS[countryCode as CountryCode];

  return {
    title: `Take Home Pay Calculator ${TAX_YEAR} | ${config.name} Salary After Tax`,
    description,
    keywords: [
      "take home pay calculator",
      "salary after tax calculator",
      "paycheck calculator",
      `${TAX_YEAR} tax calculator`,
      "net pay calculator",
      ...keywords,
    ],
    openGraph: {
      title: `Take Home Pay Calculator ${TAX_YEAR} | ${config.name} Salary After Tax`,
      description,
      type: "website",
      locale: countryCode === "US" ? "en_US" : "en",
    },
    twitter: {
      card: "summary_large_image",
      title: `Take Home Pay Calculator ${TAX_YEAR} | ${config.name}`,
      description,
    },
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: `/${country.toLowerCase()}`,
    },
  };
}

// ============================================================================
// PAGE COMPONENT
// ============================================================================

export default async function CountryPage({ params }: PageProps) {
  const { country } = await params;
  const countryCode = country.toUpperCase();

  // Validate country code - return 404 if invalid
  if (!isCountrySupported(countryCode)) {
    notFound();
  }

  const validCountryCode = countryCode as CountryCode;
  const config = getCountryConfig(validCountryCode);
  const headerInfo = COUNTRY_HEADER_INFO[validCountryCode];

  return (
    <div className="min-h-screen bg-zinc-950">
      <main className="container mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="max-w-2xl mb-8 md:mb-12">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <h1 className="text-3xl md:text-4xl font-bold text-zinc-50 tracking-tight">
              {config.name} Take Home Pay Calculator
            </h1>
            <TaxYearBadge />
          </div>
          <p className="text-zinc-400 text-base md:text-lg">
            {headerInfo.tagline} Uses {TAX_YEAR} tax brackets and rates.
          </p>
          <p className="text-zinc-500 text-sm mt-2">{headerInfo.details}</p>
          <div className="mt-4">
            <Link
              href="/compare"
              className="inline-flex items-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-200 transition hover:border-emerald-400/70 hover:bg-emerald-500/20"
            >
              Compare all countries
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>

        {/* Calculator */}
        <MultiCountryCalculator country={validCountryCode} />

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-zinc-800">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p className="text-sm text-zinc-500">
              This calculator provides estimates based on {TAX_YEAR} tax rules.
              Actual tax liability may vary. Consult a tax professional for
              personalized advice.
            </p>
            {LAST_UPDATED ? (
              <p className="text-xs text-zinc-600 whitespace-nowrap">
                Last updated: {LAST_UPDATED}
              </p>
            ) : null}
          </div>
        </footer>
      </main>
    </div>
  );
}
