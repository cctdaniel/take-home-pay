# AGENTS.md

This file provides guidance for AI coding agents working with this codebase.

## Project Overview

**Take Home Pay Calculator** — A Next.js web application for calculating take-home salary after taxes and deductions. Supports multiple countries (US, Singapore, South Korea, and Netherlands) with 2026 tax data.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript 5
- **UI:** React 19, Tailwind CSS 4
- **Fonts:** Geist Sans/Mono

## Directory Structure

```
/app/
  layout.tsx              # Root layout with fonts and base metadata
  page.tsx                # Redirects to /us (default country)
  /[country]/
    page.tsx              # Dynamic country page with generateStaticParams
/components/
  /calculator/            # Domain-specific calculator components
  /ui/                    # Reusable UI primitives (card, input, select, etc.)
/hooks/                   # React custom hooks for state management
/lib/
  /countries/             # Country-specific calculator implementations
    /us/                  # US tax calculator (federal, state, FICA)
    /sg/                  # Singapore tax calculator (income tax, CPF)
    /kr/                  # South Korea tax calculator (income tax, social insurance)
    /nl/                  # Netherlands tax calculator (income tax, national insurance)
    registry.ts           # Country calculator registry (factory pattern)
    types.ts              # Shared TypeScript interfaces
  /constants/             # Tax brackets, contribution limits, tax year
  /tax-calculations/      # Legacy calculation utilities (backwards compat)
/scripts/                 # Build scripts (last-updated injection)
/public/                  # Static assets
```

## URL Structure

Each country has its own route for better SEO:

| Country       | URL   | Generated at build |
| ------------- | ----- | ------------------ |
| United States | `/us` | Yes (static)       |
| Singapore     | `/sg` | Yes (static)       |
| South Korea   | `/kr` | Yes (static)       |
| Netherlands   | `/nl` | Yes (static)       |

- Root `/` redirects to `/us` (default country)
- Country selector navigates to the selected country's route
- Each page has country-specific metadata (title, description, keywords)

## Commands

```bash
npm run dev      # Start development server (localhost:3000)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Architecture

### Routing Pattern

The app uses Next.js dynamic routes with static generation:

1. `app/[country]/page.tsx` — Dynamic route for all countries
2. `generateStaticParams()` — Pre-renders pages for all supported countries at build time
3. `generateMetadata()` — Sets country-specific SEO metadata per page

### Multi-Country Calculator Pattern

The codebase uses a registry pattern for country support:

1. **Registry** (`lib/countries/registry.ts`) — Factory that returns the appropriate calculator
2. **Country Calculator Interface** (`lib/countries/types.ts`) — Each country implements `CountryCalculator`
3. **Country Implementations** — `/lib/countries/us/`, `/lib/countries/sg/`, `/lib/countries/kr/`, `/lib/countries/nl/`

### Tax Calculation Flow

```
URL (/us, /sg, etc.) → Country Page → MultiCountryCalculator → Country Calculator → Tax Breakdown → Results Display
```

Each country calculator handles:

- Income tax (federal/national)
- Payroll taxes (FICA for US, CPF for Singapore, 4 Major Insurance for Korea)
- Deductions and contributions
- Tax reliefs (country-specific)

### State Management

- Custom hooks in `/hooks/` manage calculator state
- `use-multi-country-calculator.ts` accepts country as parameter (from URL)
- Country changes trigger navigation, not state updates
- Uses `useMemo` for memoized calculations

## Key Files

| File                                         | Purpose                                |
| -------------------------------------------- | -------------------------------------- |
| `app/[country]/page.tsx`                     | Country calculator page with metadata  |
| `app/page.tsx`                               | Redirect to /us                        |
| `app/layout.tsx`                             | Root layout with fonts                 |
| `hooks/use-multi-country-calculator.ts`      | Calculator state management            |
| `lib/countries/registry.ts`                  | Country calculator factory             |
| `lib/countries/types.ts`                     | TypeScript interfaces                  |
| `lib/countries/us/calculator.ts`             | US tax calculation logic               |
| `lib/countries/sg/calculator.ts`             | Singapore tax calculation logic        |
| `lib/countries/kr/calculator.ts`             | South Korea tax calculation logic      |
| `lib/countries/nl/calculator.ts`             | Netherlands tax calculation logic      |
| `lib/constants/tax-year.ts`                  | Current tax year and build metadata    |
| `components/calculator/country-selector.tsx` | Country dropdown (navigates on change) |

## Adding a New Country

1. Create directory: `lib/countries/{country-code}/`
2. Implement `CountryCalculator` interface in `calculator.ts`
3. Define tax brackets in `constants/`
4. Export via `config.ts` and `index.ts`
5. Register in `lib/countries/registry.ts` (add to `SUPPORTED_COUNTRIES` array)
6. Add UI components in `components/calculator/`
7. Update `use-multi-country-calculator.ts` hook with country-specific state
8. Add country metadata in `app/[country]/page.tsx`:
   - Add to `COUNTRY_DESCRIPTIONS`
   - Add to `COUNTRY_KEYWORDS`
   - Add to `COUNTRY_HEADER_INFO`
9. Add country section to `components/calculator/seo-tax-info.tsx`
10. **Update documentation:** Update this file (AGENTS.md) and README.md to include the new country

## Code Style

- TypeScript strict mode enabled
- Tailwind CSS for styling (dark theme with zinc palette)
- Functional React components with hooks
- Memoization for expensive calculations
- Well-typed interfaces for all data structures

## Testing

No test framework is currently configured. When adding tests:

- Consider Jest or Vitest for unit tests
- Focus on tax calculation accuracy
- Test edge cases for contribution limits and tax brackets

## Build Pipeline

The build uses `scripts/with-last-updated.mjs` to inject:

- `NEXT_PUBLIC_BUILD_TIMESTAMP` — ISO 8601 build time
- `NEXT_PUBLIC_LAST_UPDATED` — Last git commit date

These are displayed in the UI footer.

## Common Tasks

### Update Tax Brackets

1. Edit `lib/countries/{country}/constants/tax-brackets-{year}.ts`
2. Update `lib/constants/tax-year.ts` if changing tax year

### Add New Contribution Type

1. Update types in `lib/countries/types.ts`
2. Add calculation logic in country calculator
3. Add UI controls in relevant component
4. Update hook state management

### Fix Tax Calculation Bug

1. Locate calculation in `lib/countries/{country}/`
2. Check constants for correct values
3. Verify calculation formula matches tax rules
4. Test with known salary amounts

### Change Default Country

1. Edit `app/page.tsx` — change redirect target from `/us` to desired country code
