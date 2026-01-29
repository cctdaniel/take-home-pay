import { MultiCountryCalculator } from "@/components/calculator/multi-country-calculator";
import { TaxYearBadge } from "@/components/calculator/tax-year-badge";
import { LAST_UPDATED, TAX_YEAR } from "@/lib/constants/tax-year";
import {
  SUPPORTED_COUNTRIES,
  getCountryConfig,
  isCountrySupported,
} from "@/lib/countries/registry";
import type { CountryCode } from "@/lib/countries/types";
import type { Metadata } from "next";
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

// Country-specific descriptions for SEO
const COUNTRY_DESCRIPTIONS: Record<CountryCode, string> = {
  US: `Free ${TAX_YEAR} take home pay calculator for all 50 US states + DC. Calculate your salary after taxes including federal, state, Social Security, Medicare, 401(k), HSA, and IRA deductions.`,
  SG: `Free ${TAX_YEAR} take home pay calculator for Singapore. Calculate your salary after taxes including income tax, CPF contributions based on age and residency, and SRS deductions.`,
  KR: `Free ${TAX_YEAR} take home pay calculator for South Korea. Calculate your salary after taxes including income tax, local tax, national pension, health insurance, and employment insurance.`,
  NL: `Free ${TAX_YEAR} take home pay calculator for the Netherlands. Calculate your salary after taxes including income tax, national insurance, and the 30% ruling for expats.`,
  AU: `Free ${TAX_YEAR} take home pay calculator for Australia. Calculate your salary after taxes including income tax (Stage 3 cuts), Medicare levy, Medicare levy surcharge, LITO, and superannuation.`,
};

// Country-specific keywords for SEO
const COUNTRY_KEYWORDS: Record<CountryCode, string[]> = {
  US: [
    "us take home pay calculator",
    "usa salary after tax",
    "american paycheck calculator",
    `${TAX_YEAR} federal tax calculator`,
    "state tax calculator",
    "401k tax savings",
    "california paycheck calculator",
    "new york salary calculator",
    "texas take home pay",
  ],
  SG: [
    "singapore take home pay calculator",
    "sg salary after tax",
    `${TAX_YEAR} singapore tax calculator`,
    "cpf contribution calculator",
    "singapore income tax",
    "srs contribution calculator",
  ],
  KR: [
    "korea take home pay calculator",
    "korean salary after tax",
    `${TAX_YEAR} korea tax calculator`,
    "korean income tax calculator",
    "national pension korea",
    "4 major insurance korea",
  ],
  NL: [
    "netherlands take home pay calculator",
    "dutch salary after tax",
    `${TAX_YEAR} netherlands tax calculator`,
    "30 percent ruling calculator",
    "dutch income tax calculator",
    "loonbelasting calculator",
  ],
  AU: [
    "australia take home pay calculator",
    "australian salary after tax",
    `${TAX_YEAR} australia tax calculator`,
    "ato tax calculator",
    "medicare levy calculator",
    "superannuation calculator",
    "stage 3 tax cuts calculator",
    "lito calculator",
  ],
};

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

// Country-specific header descriptions
const COUNTRY_HEADER_INFO: Record<
  CountryCode,
  { tagline: string; details: string }
> = {
  US: {
    tagline:
      "Calculate your actual salary after taxes for all 50 US states + D.C.",
    details:
      "Federal & state taxes, Social Security, Medicare, 401(k), HSA, IRA",
  },
  SG: {
    tagline: "Calculate your actual salary after taxes in Singapore.",
    details: "Income tax, CPF contributions (based on age and residency), SRS",
  },
  KR: {
    tagline: "Calculate your actual salary after taxes in South Korea.",
    details:
      "Income tax, local tax, national pension, health insurance, employment insurance",
  },
  NL: {
    tagline: "Calculate your actual salary after taxes in the Netherlands.",
    details: "Income tax, national insurance, 30% ruling for expats",
  },
  AU: {
    tagline: "Calculate your actual salary after taxes in Australia.",
    details:
      "Income tax (Stage 3 cuts), LITO, Medicare levy, Medicare levy surcharge, superannuation",
  },
};

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
