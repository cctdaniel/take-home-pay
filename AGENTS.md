# AGENTS.md

This file provides guidance for AI coding agents working with this codebase.

## Project Overview

**Take Home Pay Calculator** — A Next.js web application for calculating take-home salary after taxes and deductions. Supports multiple countries (US and Singapore) with 2026 tax data.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript 5
- **UI:** React 19, Tailwind CSS 4
- **Fonts:** Geist Sans/Mono

## Directory Structure

```
/app/                    # Next.js App Router pages and layouts
/components/
  /calculator/           # Domain-specific calculator components
  /ui/                   # Reusable UI primitives (card, input, select, etc.)
/hooks/                  # React custom hooks for state management
/lib/
  /countries/            # Country-specific calculator implementations
    /us/                 # US tax calculator (federal, state, FICA)
    /sg/                 # Singapore tax calculator (income tax, CPF)
    registry.ts          # Country calculator registry (factory pattern)
    types.ts             # Shared TypeScript interfaces
  /constants/            # Tax brackets, contribution limits, tax year
  /tax-calculations/     # Legacy calculation utilities (backwards compat)
/scripts/                # Build scripts (last-updated injection)
/public/                 # Static assets
```

## Commands

```bash
npm run dev      # Start development server (localhost:3000)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Architecture

### Multi-Country Calculator Pattern

The codebase uses a registry pattern for country support:

1. **Registry** (`lib/countries/registry.ts`) — Factory that returns the appropriate calculator
2. **Country Calculator Interface** (`lib/countries/types.ts`) — Each country implements `CountryCalculator`
3. **Country Implementations** — `/lib/countries/us/` and `/lib/countries/sg/`

### Tax Calculation Flow

```
User Input → Country Calculator → Tax Breakdown → Results Display
```

Each country calculator handles:
- Income tax (federal/national)
- Payroll taxes (FICA for US, CPF for Singapore)
- Deductions and contributions
- Tax reliefs (country-specific)

### State Management

- Custom hooks in `/hooks/` manage calculator state
- `use-multi-country-calculator.ts` is the primary hook
- Uses `useMemo` for memoized calculations

## Key Files

| File | Purpose |
|------|---------|
| `app/page.tsx` | Main calculator page |
| `app/layout.tsx` | Root layout with metadata and fonts |
| `hooks/use-multi-country-calculator.ts` | Calculator state management |
| `lib/countries/registry.ts` | Country calculator factory |
| `lib/countries/types.ts` | TypeScript interfaces |
| `lib/countries/us/calculator.ts` | US tax calculation logic |
| `lib/countries/sg/calculator.ts` | Singapore tax calculation logic |
| `lib/constants/tax-year.ts` | Current tax year and build metadata |

## Adding a New Country

1. Create directory: `lib/countries/{country-code}/`
2. Implement `CountryCalculator` interface in `calculator.ts`
3. Define tax brackets in `constants/`
4. Export via `config.ts` and `index.ts`
5. Register in `lib/countries/registry.ts`
6. Add UI components in `components/calculator/`
7. Update `use-multi-country-calculator.ts` hook

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
