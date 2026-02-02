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

// Country-specific descriptions for SEO
const COUNTRY_DESCRIPTIONS: Record<CountryCode, string> = {
  US: `Free ${TAX_YEAR} take home pay calculator for all 50 US states + DC. Calculate your salary after taxes including federal, state, Social Security, Medicare, 401(k), HSA, and IRA deductions.`,
  SG: `Free ${TAX_YEAR} take home pay calculator for Singapore. Calculate your salary after taxes including income tax, CPF contributions based on age and residency, and SRS deductions.`,
  KR: `Free ${TAX_YEAR} take home pay calculator for South Korea. Calculate your salary after taxes including income tax, local tax, national pension, health insurance, and employment insurance.`,
  NL: `Free ${TAX_YEAR} take home pay calculator for the Netherlands. Calculate your salary after taxes including income tax, national insurance, and the 30% ruling for expats.`,
  AU: `Free ${TAX_YEAR} take home pay calculator for Australia. Calculate your salary after taxes including income tax (Stage 3 cuts), Medicare levy, Medicare levy surcharge, Division 293 tax (high income earners), LITO, and superannuation.`,
  PT: `Free ${TAX_YEAR} take home pay calculator for Portugal. Calculate your salary after taxes including IRS income tax, Social Security contributions (Segurança Social), and solidarity surcharge for high incomes.`,
  TH: `Free ${TAX_YEAR} take home pay calculator for Thailand. Calculate your salary after taxes including personal income tax (progressive rates 0-35%), Social Security Fund contributions, and tax-saving options like Provident Fund, RMF, SSF, and ESG funds.`,
  HK: `Free ${TAX_YEAR} take home pay calculator for Hong Kong. Calculate your salary after salaries tax, MPF contributions, and key allowances and deductions.`,
  ID: `Free ${TAX_YEAR} take home pay calculator for Indonesia. Calculate your salary after taxes including PPh 21 income tax (progressive rates 5% to 35%), BPJS Kesehatan (health insurance), BPJS JHT (old age security), and BPJS JP (pension) contributions.`,
  DE: `Free ${TAX_YEAR} take home pay calculator for Germany. Calculate your salary after taxes including income tax (Einkommensteuer) per §32a EStG, Solidarity Surcharge (Solidaritätszuschlag), and social security contributions (pension, health, unemployment, and long-term care insurance).`,
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
  AU: [
    "australia take home pay calculator",
    "australian salary after tax",
    `${TAX_YEAR} australia tax calculator`,
    "ato tax calculator",
    "medicare levy calculator",
    "superannuation calculator",
    "stage 3 tax cuts calculator",
    "lito calculator",
    "division 293 tax calculator",
    "high income super tax",
  ],
  NL: [
    "netherlands take home pay calculator",
    "dutch salary after tax",
    `${TAX_YEAR} netherlands tax calculator`,
    "30 percent ruling calculator",
    "dutch income tax calculator",
    "loonbelasting calculator",
  ],
  PT: [
    "portugal take home pay calculator",
    "portuguese salary after tax",
    `${TAX_YEAR} portugal tax calculator`,
    "irs portugal calculator",
    "seguranca social calculator",
    "portugal income tax calculator",
    "portugal paycheck calculator",
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
  TH: [
    "thailand take home pay calculator",
    "thai salary after tax",
    `${TAX_YEAR} thailand tax calculator`,
    "thai income tax calculator",
    "personal income tax thailand",
    "social security thailand",
    "provident fund thailand",
    "rmf thailand calculator",
    "ssf thailand calculator",
    "thailand paycheck calculator",
    "rd go th tax calculator",
    "thai revenue department tax",
  ],
  HK: [
    "hong kong take home pay calculator",
    "hong kong salary after tax",
    `${TAX_YEAR} hong kong tax calculator`,
    "hong kong salaries tax calculator",
    "mpf contribution calculator",
    "hong kong payroll tax",
  ],
  ID: [
    "indonesia take home pay calculator",
    "indonesian salary after tax",
    `${TAX_YEAR} indonesia tax calculator`,
    "pph 21 calculator",
    "indonesia income tax calculator",
    "bpjs calculator",
    "bpjs kesehatan",
    "bpjs ketenagakerjaan",
    "indonesia paycheck calculator",
    "gaji bersih indonesia",
    "kalkulator pph 21",
    "tarif pph 21",
  ],
  DE: [
    "germany take home pay calculator",
    "german salary after tax",
    `${TAX_YEAR} germany tax calculator`,
    "germany income tax calculator",
    "einkommensteuer calculator",
    "solidaritätszuschlag calculator",
    "lohnsteuer calculator",
    "brutto netto rechner",
    "gehaltsrechner deutschland",
    "sozialversicherung beiträge",
    "krankenversicherung rechner",
    "rentenversicherung beitrag",
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
  AU: {
    tagline: "Calculate your actual salary after taxes in Australia.",
    details:
      "Income tax (Stage 3 cuts), LITO, Medicare levy, Medicare levy surcharge, Division 293 tax, superannuation",
  },
  NL: {
    tagline: "Calculate your actual salary after taxes in the Netherlands.",
    details: "Income tax, national insurance, 30% ruling for expats",
  },
  PT: {
    tagline: "Calculate your actual salary after taxes in Portugal.",
    details:
      "IRS income tax, Social Security (Segurança Social), solidarity surcharge, PPR tax credits, dependent deductions",
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
  TH: {
    tagline: "Calculate your actual salary after taxes in Thailand.",
    details:
      "Personal income tax (0-35% progressive), Social Security Fund (5%), Provident Fund, RMF, SSF, ESG funds, allowances & deductions",
  },
  HK: {
    tagline: "Calculate your actual salary after taxes in Hong Kong.",
    details:
      "Salaries tax, MPF contributions, allowances & deductible expenses",
  },
  ID: {
    tagline: "Calculate your actual salary after taxes in Indonesia.",
    details:
      "PPh 21 income tax (5-35% progressive), BPJS Kesehatan (1%), BPJS JHT (2%), BPJS JP (1%), PTKP allowances",
  },
  DE: {
    tagline: "Calculate your actual salary after taxes in Germany.",
    details:
      "Income tax (Einkommensteuer §32a EStG, progressive 0-45%), Solidarity Surcharge (Solidaritätszuschlag 5.5%), Pension Insurance (9.3%), Health Insurance (7.3% + Zusatzbeitrag), Unemployment Insurance (1.3%), Long-term Care Insurance (1.7-2.5%)",
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
