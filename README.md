# Take Home Pay Calculator

A multi-country salary calculator that shows your actual take-home pay after all taxes and deductions. Built with Next.js and updated for the 2026 tax year.

## URLs

Each country has its own page for better SEO and shareability:

- Country calculator pages are generated from `lib/countries/registry.ts` at `/{country-code-lowercase}`.
- `/compare` shows a cross-country comparison using the same registry.

Root `/` redirects to `/us` by default.

## Compare Mode

The `/compare` page asks a few simple questions and shows take-home pay across all supported countries using FX conversion. It surfaces a compact breakdown per country and links out to the full country calculator for detailed inputs and accuracy.

FX rates are fetched from Exchangerate-API and cached on the server for performance.

## Supported Countries

Supported countries are the entries in `lib/countries/registry.ts`. Country-specific
rules, assumptions, and source URLs live next to each implementation under
`lib/countries/{country-code}/`.

## Getting Started

```bash
npm install
npm run dev
```

Create a `.env` file with your Exchangerate-API key:

```bash
EXCHANGERATE_API_KEY=your_key_here
```

Open [http://localhost:3000](http://localhost:3000) to use the calculator. You'll be redirected to `/us` by default.

## Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS

## Project Structure

```
/app/
  [country]/page.tsx     # Dynamic country pages generated from registry
  page.tsx               # Redirect to /us
  compare/page.tsx       # Compare flow
  api/fx/route.ts         # FX rates proxy (Exchangerate-API)
/lib/countries/          # Country-specific calculators
  /{country-code}/       # Country calculators, config, constants, and notes
  registry.ts            # Country calculator factory
  types.ts               # Shared interfaces
/components/calculator/  # Calculator UI components
/components/compare/     # Compare flow UI components
/hooks/                  # React state management
```

## Data Sources

- Country tax and contribution source URLs are kept in each country implementation
  under `lib/countries/{country-code}/constants/` and related calculator files.
- **FX Rates:** Exchangerate-API (cached, used for `/compare`)

## Disclaimer

This calculator provides estimates only. Actual tax liability may vary based on individual circumstances. Consult a tax professional for personalized advice.
