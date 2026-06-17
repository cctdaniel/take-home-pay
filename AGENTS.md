# AGENTS.md

This file provides guidance for AI coding agents working with this codebase.

## Project Overview

**Take Home Pay Calculator** — A Next.js web application for calculating take-home salary after taxes and deductions. Supported countries are generated from country module directories; do not duplicate the current country list in this file.

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
  /compare/
    page.tsx              # Compare flow (questionnaire + results)
  /api/
    /fx/
      route.ts            # FX rates proxy (Exchangerate-API)
  /[country]/
    page.tsx              # Dynamic country page with generateStaticParams
/components/
  /calculator/            # Domain-specific calculator components
    calculator-fields.tsx # Shared calculator form controls (selects, numbers, pay frequency, currency amounts)
    info-panel.tsx        # Shared informational callout panel
  /compare/               # Compare flow UI components
  /ui/                    # Reusable UI primitives (card, input, select, etc.)
/hooks/                   # React custom hooks for state management
  use-country-comparison.ts # Compare flow calculations
  use-fx-rates.ts          # FX rate fetching hook
/lib/
  /countries/             # Country-specific calculator implementations
    /{country-code}/      # Country calculators, config, and tax constants
    country-page-content.ts # Country-specific SEO/header copy
    registry.ts           # Reads generated calculator registry
    types.ts              # Shared TypeScript interfaces
  /constants/             # Tax brackets, contribution limits, tax year
  /tax-calculations/      # Legacy calculation utilities (backwards compat)
/scripts/                 # Build scripts and generated registry scripts
/public/                  # Static assets
```

## URL Structure

Each supported country has its own route for SEO:

- `/{country-code-lowercase}` is generated from `SUPPORTED_COUNTRIES` in `lib/countries/registry.ts`, backed by generated country registration
- `app/[country]/page.tsx` uses `generateStaticParams()` to statically generate all registry countries
- `/compare` is the static compare flow
- Root `/` redirects to `/us` (default country)
- Country selector navigates to the selected country's route
- Each page has country-specific metadata (title, description, keywords) sourced from `lib/countries/country-page-content.ts`

## Commands

```bash
npm run generate:countries # Generate country registries from convention-based files
npm run dev      # Start development server (localhost:3000)
npm test         # Run Vitest calculator tests
npm run test:watch
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

The codebase uses a generated registry pattern for country support:

1. **Generated Registry** (`lib/countries/registry.generated.ts`) — Built by `scripts/generate-country-registries.mjs` from `lib/countries/{country-code}/` directories. `lib/countries/registry.ts` derives `SUPPORTED_COUNTRIES`, calculator lookup, and `COUNTRY_CONFIGS` from it.
2. **Country Calculator Interface** (`lib/countries/types.ts`) — Each country implements `CountryCalculator`
3. **Country Page Content** (`lib/countries/country-page-content.ts`) — Country SEO descriptions, keywords, and header copy
4. **Country Implementations** — `/lib/countries/{country-code}/`
5. **Generated UI Extension Points** — The generator also discovers optional country result breakdowns, full calculator extensions, and compare adapters.

### Reusable Calculator UI Pattern

Country option UIs should compose shared controls instead of duplicating labels, grids, parsing, and select markup:

- Use `CalculatorFieldGrid` for option layouts.
- Use `PayFrequencyField` for pay frequency.
- Use `SelectField` for string enums such as residency, filing status, state/region, and regimes.
- Use `BooleanSelectField` for yes/no choices.
- Use `CountStepperField` for discrete counts (dependents, children, parents, disabled dependents, etc.). Layout matches SG reliefs: label + hint on the left, `NumberStepper` on the right. Inside `CalculatorFieldGrid`, pass `spanColumns` so each stepper is a full-width row. Do not use `NumberField` or a small `SelectField` enum for counts.
- Use `NumberField` for bounded non-count scalars such as age or monthly insurance bases. It keeps an editable string draft, allows temporarily empty values, and clamps min/max on blur.
- Use `CurrencyAmountField` for free-form annual currency amounts.
- Use `ContributionSlider` from `components/ui/contribution-slider.tsx` for bounded contribution/deduction amounts with max toggles.
- Use `InfoPanel` for repeated note/tip callouts (short “Modeled scope” notes only — not a substitute for the Contributions card).

Every country page should expose a **Contributions** card via `CountryCalculatorExtensionShell` when the country has any modeled voluntary inputs or when the checklist below requires explaining why none exist. Pick the contributions content by tax treatment (see **Contributions card content** under Voluntary Contribution Checklist):

- `contributionsTitle="Retirement & Savings Contributions"` (or country-appropriate title)
- `contributionsDescription="Adjust voluntary contributions that reduce your tax base"` (adapt copy for credits-only or no-PIT cases)
- `contributions={...}` — one or more `ContributionSlider` rows in a `space-y-6` wrapper, matching US/SG/IE/CZ patterns

For annual currency inputs, decide the control from the modeled legal or calculator limit:

- If an official or modeled maximum exists for a user-entered contribution, deduction, relief, credit, or qualifying expense, use `ContributionSlider` and clamp the hook setter and calculator logic to the same maximum.
- If a contribution has a contribution/payment cap and a separate tax-relief cap, use the contribution/payment cap as the slider max and explain the lower relief cap in the description or results copy. Do not use the relief cap as the slider max unless the contribution itself is legally capped there.
- If several inputs share a combined cap, keep each input as a `ContributionSlider`, show the remaining/shared cap or an over-cap warning, and cap the deductible amount in the calculator.
- Use `CurrencyAmountField` only when the amount is genuinely free-form or no credible cap is modeled. If an official cap is discovered, add it to country constants and switch the UI to `ContributionSlider`.

Do not introduce a country-specific version of these controls unless the shared primitive cannot model the interaction. If a new country needs the same concept (for example health insurance, pension, CPF-style savings, or retirement contributions), use the same shared control type and visual language as existing countries.

Mobile note: `Input` and `Select` intentionally render at 16px on mobile (`text-base sm:text-sm`) to avoid iOS Safari focus zoom. Do not override calculator inputs below 16px on mobile.

### Input Control Standards

Use this matrix for every new or updated country UI. The US calculator is the reference for voluntary pre-tax deductions and family inputs.

| Input type | Control | Notes |
| --- | --- | --- |
| Dependents, children, parents, disabled dependents | `CountStepperField` (+ `spanColumns` in grids) | Country-specific `max`; clamp in hook and calculator |
| Age, monthly bases, non-count scalars | `NumberField` | Editable draft; clamp on blur |
| State, region, residency, regime, contract type | `SelectField` | Group with `<optgroup>` only when 30+ options |
| Married / yes-no (2 outcomes) | `BooleanSelectField` | Not raw `Switch` except inside dense relief grids |
| Filing status (3+ outcomes) | `SelectField` | e.g. US MFJ/MFS/HOH; ES/PT joint variants |
| Boolean married when tax has only 2 outcomes | `BooleanSelectField` or mapped `SelectField` | DE, TW |
| Capped annual contributions (401k, HSA, FSA, pension) | `ContributionSlider` | Same max in UI, hook setter, and calculator |
| Uncapped annual amounts | `CurrencyAmountField` | Migrate to slider when an official cap is modeled |

**Official sources (required):**

- Rates, brackets, caps, and relief rules must come from **official government** sites (tax authority, social insurance agency, central bank payroll guidance) — not blogs, aggregators, or outdated PDFs unless cross-checked against the current official page.
- Put the source URL next to every rate constant in `lib/countries/{code}/constants/` (comment or `SOURCE_URLS` export).
- Confirm the **tax year / assessment year** matches what the calculator claims (see `lib/constants/tax-year.ts` and page copy).
- Golden tests must cite the official calculator or table URL in `calculator.test.ts`.
- After implementation, cross-check net pay against a **second** public calculator (PaycheckCity, SalaryAfterTax, Talent.com, etc.); target ≤1% difference on net salary.

**Implementing a new country (accuracy workflow):**

1. Research official sources (step above); document gaps in constants comments if something is intentionally excluded.
2. Implement `lib/countries/{code}/` calculator, types, config, compare adapter.
3. Complete the **Voluntary Contribution Checklist** (below); add sliders + calculator logic, or the correct no-voluntary note with a source-backed explanation.
4. Add `calculator.test.ts` with 5+ golden numbers from the official source (low/mid/high salary; with/without dependents; max retirement if modeled).
5. Compose UI from shared primitives per the matrix above; include the Contributions card on the country extension.
6. Add SEO block titled **How Your Take Home Pay Is Calculated** (inline in `country-extensions/{code}.tsx` is preferred).
7. Run `npm run generate:countries && npm test && npm run lint && npm run build`.
8. **Local UI check** (required for any calculator/constants/UI change) — see **Local verification** below.

**Local verification (required after changes):**

After any change to country calculators, constants, extensions, or shared calculator UI:

1. Run `npm run dev` and open the affected route(s), e.g. `http://localhost:3000/{country-code}`.
2. Confirm layout: Income Details → **Retirement & Savings Contributions** (when applicable) → results column; no cramped steppers, overlapping labels, or broken grids.
3. Capture a **desktop** screenshot (full calculator + contributions card visible).
4. Capture a **mobile** screenshot (narrow viewport ~390px width, or device toolbar in browser DevTools) — check stepper rows, slider max toggles, and that inputs stay ≥16px (no iOS zoom).
5. Fix formatting issues before considering the task done (use `spanColumns` on `CountStepperField` in grids, `space-y-6` between multiple sliders, full-width contribution rows like SG reliefs).

Agents should perform this check themselves when possible; attach or reference screenshots in the PR when UI was touched.

### Tax Calculation Flow

```
URL (/{country-code}) → Country Page → MultiCountryCalculator → Country Calculator → Tax Breakdown → Results Display
```

Compare flow:

```
/compare → Questionnaire → FX conversion → Country Calculator → Ranked Results + Snapshot
```

Each country calculator handles country-specific combinations of:

- Income tax
- Statutory payroll, pension, social insurance, or savings contributions
- Deductions and contributions
- Tax reliefs

### State Management

- Custom hooks in `/hooks/` manage calculator state
- `use-multi-country-calculator.ts` accepts country as parameter (from URL)
- Country changes trigger navigation, not state updates
- Uses `useMemo` for memoized calculations
- Default gross salary should come from each calculator's `getDefaultInputs()`, not a separate per-country map in the hook

## Key Files

| File                                         | Purpose                                |
| -------------------------------------------- | -------------------------------------- |
| `app/[country]/page.tsx`                     | Country calculator page with metadata  |
| `app/page.tsx`                               | Redirect to /us                        |
| `app/layout.tsx`                             | Root layout with fonts                 |
| `hooks/use-multi-country-calculator.ts`      | Calculator state management            |
| `lib/countries/registry.ts`                  | Country calculator factory using generated registry |
| `scripts/generate-country-registries.mjs`    | Generates country registration files   |
| `lib/countries/country-page-content.ts`      | Country SEO/header content             |
| `lib/countries/types.ts`                     | Shared interfaces and extensible type maps |
| `lib/countries/{code}/calculator.ts`         | Country tax calculation logic          |
| `lib/countries/{code}/config.ts`             | Country display/config metadata        |
| `lib/countries/{code}/constants/`            | Country tax/contribution constants     |
| `lib/constants/tax-year.ts`                  | Current tax year and build metadata    |
| `components/calculator/country-selector.tsx` | Country dropdown (navigates on change) |
| `components/calculator/calculator-fields.tsx` | Shared calculator field primitives    |
| `components/calculator/results/`             | Country-specific result breakdown renderers, auto-registered by filename |
| `components/calculator/country-extensions/`  | Optional full country calculator extensions, auto-registered by filename |
| `components/ui/contribution-slider.tsx`      | Shared contribution slider             |

## Shared Utilities

`lib/utils.ts` provides `clampAmount` and `clampCount` as shared helper functions. Do not inline duplicate `clampAmount`/`clampCount` definitions in individual country extension, tax-option, or additional-reliefs files — import them from `@/lib/utils` instead.

```typescript
import { clampAmount, clampCount } from "@/lib/utils";

// Two-argument form: clamp to [0, max]
clampAmount(value, max);

// Three-argument form: clamp to [min, max]
clampAmount(value, min, max);

// Integer count clamped to [0, max]
clampCount(value, max);
```

Both functions accept `undefined` values (treated as 0), so callers can safely pass optional inputs without null-coalescing.

Mobile note: `Input` and `Select` intentionally render at 16px on mobile (`text-base sm:text-sm`) to avoid iOS Safari focus zoom. Do not override calculator inputs below 16px on mobile.

## Adding a New Country

1. Create directory: `lib/countries/{country-code}/`
2. Implement `CountryCalculator` interface in `calculator.ts`
3. Define tax brackets in `constants/`
4. Export via `config.ts` and `index.ts`
5. Add country-specific input, contribution, tax, and breakdown types near the country implementation. Prefer `lib/countries/{country-code}/types.ts` with TypeScript module augmentation for `CountryCodeMap`, `CurrencyCodeMap`, `ContributionInputMap`, `CalculatorInputMap`, `TaxBreakdownMap`, and `CountrySpecificBreakdownMap`. Edit `lib/countries/types.ts` only for genuinely shared primitives.
6. Do not edit `lib/countries/registry.ts`. The registry is generated from country directories by `npm run generate:countries`.
7. For new country UI, prefer adding `components/calculator/country-extensions/{country-code}.tsx` as a default export. This extension owns the country-specific form state and should use `useCountryCalculatorExtension` and `CountryCalculatorExtensionShell` from `components/calculator/country-extension.tsx`. Compose shared fields from `calculator-fields.tsx`. Wire `contributions` / `contributionsTitle` / `contributionsDescription` on the shell for every country (see **Input Control Standards**). Do not add new country branches to `components/calculator/multi-country-calculator.tsx` or `hooks/use-multi-country-calculator.ts`.
8. Add country-specific result display in `components/calculator/results/{country-code}-result-breakdown.tsx`. The result breakdown registry is generated from this filename; do not edit `components/calculator/results/country-result-breakdown.tsx`.
9. Add country metadata overrides in `lib/countries/country-page-content.ts` only when the generic metadata from country config is not good enough:
   - `COUNTRY_DESCRIPTIONS`
   - `COUNTRY_KEYWORDS`
   - `COUNTRY_HEADER_INFO`
10. Add SEO/tax explanatory copy inside the country extension or a country-local component. Do not add new country branches to `components/calculator/seo-tax-info.tsx`.
11. Update compare flow:
    - Add `lib/countries/{country-code}/compare.ts` exporting `buildCountryComparison` for country-specific assumptions, input mapping, and retirement max rules. The compare adapter registry is generated from this file; do not edit `hooks/use-country-comparison.ts` for routine country additions.
    - Add simple breakdown mapping in `components/compare/compare-breakdown.tsx` if needed
12. Run `npm run generate:countries`, `npm test`, `npm run lint`, and `npm run build`.
13. Run **local verification** (desktop + mobile screenshots) for the new or changed country UI.
14. **Update documentation:** Do not add country lists or country-specific sections to README. Keep country source URLs and notes near the country constants/calculator, and update AGENTS.md only when the architecture or workflow changes.

**Note:** Any time you add a new country, also update `/compare` assumptions and documentation to keep the experience consistent.

### Voluntary Contribution Checklist

**Do not ship a country with only a “Modeled scope” info panel.** Every country extension must either (a) implement local voluntary contribution sliders, or (b) show a Contributions card that explains why none apply, with official sources cited.

**Default assumption: voluntary tax-saving contributions probably exist.** Most countries with income tax offer at least one employee-controlled pension top-up, supplemental fund, or deductible savings scheme (401(k)-style, SRS-style, third pillar, APV, AVC, CIMR, etc.). Do not conclude “none modeled” until you have searched official tax-authority and social-insurance guidance and can cite why payroll modeling is out of scope.

Before deciding a country has no optional tax-saving inputs, check **official government** guidance for resident tax-reducing contributions and reliefs, including:

- Pension, retirement, provident, occupational pension, and social welfare schemes (PGBL/VGBL, Pillar 3a, IKZE, RA, BES, third pillar, APV, AVC, AFAP, voluntary PF, etc.)
- Voluntary top-ups to mandatory retirement or savings systems (PPK, III pillar, supplemental pension)
- Life/medical insurance premiums when user-controlled and tax-relevant
- Charitable/religious payments, education, lifestyle, or qualifying expense reliefs that are common enough to model

**Voluntary contribution research (required):**

1. Search the tax authority and social-insurance agency sites for: voluntary pension, supplementary pension, additional voluntary contributions, private pension fund, retirement savings deduction, pillar 3, APV/APVC, provident fund top-up.
2. For each scheme found, record: official name, whether relief is payroll/pre-tax or annual return claim, legal payment cap, and any lower tax-relief cap.
3. If relief is payroll/pre-tax or commonly modeled as an annual capped deduction (US 401(k), SG SRS, BG third pillar, RS voluntary PF, PE AFP APV, NG AVC, MA CIMR): add a `ContributionSlider`, calculator logic, and compare `isMaxRetirement`.
4. If relief exists only on annual filing (e.g. some AFAP-style claims): use `NoVoluntaryPitReliefNote` with accurate copy — do not imply the scheme does not exist.
5. Document excluded schemes in constants comments and visible assumptions copy.

**Contributions card content (never contradict the calculator):**

| Country PIT | Voluntary scheme modeled | Use |
| --- | --- | --- |
| 0% employment PIT | — | `NoPitContributionsNote` — only when salary truly has no PIT (AE, QA, SA, etc.) |
| Taxed | Yes (capped) | `ContributionSlider`(s) in `space-y-6` |
| Taxed | No payroll slider (researched) | `NoVoluntaryPitReliefNote` — explain why nothing is adjustable on this page |

**Never use `NoPitContributionsNote` on a country that deducts income tax.** That component states employment salary is not subject to PIT; using it on taxed countries (e.g. BG, RS, PE) contradicts the results column. When in doubt, use `NoVoluntaryPitReliefNote` or add the slider.

**When applicable (most countries with income tax):**

1. Add fields to `{code}ContributionInputs` in `lib/countries/{code}/types.ts`.
2. Add caps in `constants/` with official source URLs.
3. Apply pre-tax / credit logic in `calculator.ts`; include amounts in `totalDeductions` and breakdown `voluntaryContributions` where useful.
4. Implement `getContributionLimits(inputs?)` returning each slider’s legal max.
5. Add `contributions` UI on `country-extensions/{code}.tsx` (US/SG-style card title and description).
6. Wire `isMaxRetirement` in `lib/countries/{code}/compare.ts` for each tax-reducing contribution.

If a user-entered amount has an official or modeled cap, use `ContributionSlider`, expose the cap from `getContributionLimits()`, clamp the hook setter, and clamp again in the calculator. Mandatory payroll/social-insurance contributions stay automatic — not voluntary sliders.

When a scheme has multiple caps, keep them separate in constants and UI copy. Use the legal contribution/payment cap as the slider max, then apply any lower tax-relief cap in the calculator and breakdown. If a complex employer-plan or plan-specific extra limit is intentionally excluded, state that exclusion near the constants and in visible assumptions copy.

For `/compare`, the "max retirement" assumption must include each modeled tax-reducing retirement contribution where the user's assumptions make them eligible. If no voluntary contribution is modeled after research, the Contributions card must still explain why (`NoVoluntaryPitReliefNote` for taxed countries; `NoPitContributionsNote` only for 0% PIT) with a source-backed link.

### Calculation accuracy (common mistakes)

Accuracy is not optional. Golden tests must use official calculators/tables; also sanity-check these pitfalls before opening a PR:

- **Social-insurance wage ceilings:** Many countries cap the base before applying employee rates (monthly or annual ceiling). Never multiply full gross by the rate when a statutory cap exists — model the cap in constants and apply `min(gross, cap)` first.
- **PIT base vs social base:** Employee social contributions and income-tax base are often computed separately. Do not subtract social security from the PIT base unless the official rules explicitly allow it (Serbia: PIT base is gross minus non-taxable minus voluntary pension; social is computed on capped gross separately).
- **Annual vs monthly amounts:** Confirm whether credits, caps, and non-taxable amounts are expressed per month, per year, or per tax period. Do not multiply or divide by 12 unless the source defines it that way (Morocco dependent credit: MAD 600/year per dependent, cap MAD 3,600 — not MAD 360/month × 12).
- **High earners:** Check bracket elimination, surcharge rules, and additional caps that change effective rates above common defaults.
- **Cross-check:** Compare net pay to a second public calculator at low, mid, and high salary; target ≤1% difference. Mismatches often indicate a missing cap, wrong base order, or unit error.

When fixing accuracy bugs, update golden tests, assumptions copy in the country extension, and compare adapter if affected.

### Updating Tax Data

- Re-verify rates against **official government** calculators or published tables for the correct tax year before merging.
- Preserve source URLs in constants comments (required, not optional).
- Update visible explanatory copy when rates change:
  - `components/calculator/seo-tax-info.tsx`
  - `components/calculator/multi-country-calculator.tsx`
  - `components/calculator/results/{country-code}-result-breakdown.tsx`
  - `lib/countries/country-page-content.ts`
  - inline SEO blocks in `components/calculator/country-extensions/{code}.tsx`
- Re-run golden tests; add or adjust cases if brackets/caps changed.
- Run `npm run generate:countries && npm test && npm run lint && npm run build` after calculation or shared UI changes.
- Run **local verification** (desktop + mobile screenshots) when UI or contribution controls change.
- Update this file only when the architecture or agent workflow changes, not for routine country additions.

### Parallel Agent Guidance

- Routine country PRs must not edit generated integration consumers: `lib/countries/registry.ts`, `hooks/use-multi-country-calculator.ts`, `hooks/use-country-comparison.ts`, `components/calculator/multi-country-calculator.tsx`, `components/calculator/results/country-result-breakdown.tsx`, or `components/calculator/seo-tax-info.tsx`. Use generated registries, country extensions, result breakdown files, and compare adapters instead.
- Avoid editing README, `components/calculator/multi-country-results.tsx`, `lib/countries/currency.ts`, or shared aliases/maps in `lib/countries/types.ts` for routine country additions. Put new country type extensions in `lib/countries/{country-code}/types.ts` instead. Avoid `lib/countries/country-page-content.ts` unless a country needs custom SEO/header copy beyond the generic config-based fallback. These files are structured to derive from generated registries or delegate to per-country modules.
- Country implementation directories (`lib/countries/{code}/`) are good parallel work units when each agent owns a different country.
- Country UI extension files (`components/calculator/country-extensions/{code}.tsx`), compare adapters (`lib/countries/{code}/compare.ts`), and result breakdown files (`components/calculator/results/{code}-result-breakdown.tsx`) are also safe parallel work units because the generator discovers them by filename.
- UI work should reuse shared field primitives first; if a new primitive is needed, add it generically and migrate obvious duplicate call sites.
- Keep country-specific legal/tax notes near the relevant constants or calculator implementation instead of adding country-specific sections to this file.

## Code Style

- TypeScript strict mode enabled
- Tailwind CSS for styling (dark theme with zinc palette)
- Functional React components with hooks
- Memoization for expensive calculations
- Well-typed interfaces for all data structures

## Testing

The project uses **Vitest** for unit tests on country calculators.

```bash
npm test          # Run all calculator tests once
npm run test:watch  # Watch mode during development
```

- Place tests at `lib/countries/{code}/calculator.test.ts`.
- Use `describe` / `it` / `expect` from `vitest` (not `node:test`).
- **Golden-number policy:** cite the official calculator URL in a file comment; assert low/mid/high salary and with/without dependents or max retirement where modeled.
- Cross-check net pay against a second public calculator when possible; target ≤1% difference on net salary.
- Run `npm test` after any change to `lib/countries/{code}/calculator.ts` or `constants/`.
- Focus on tax calculation accuracy and contribution-limit edge cases.
- After UI changes, run `npm run dev` and visually verify desktop and mobile layouts (see **Local verification** under Input Control Standards).

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

1. Confirm cap and rules on an **official government** source; add URL to country constants.
2. Update `{code}ContributionInputs` in `lib/countries/{code}/types.ts` (prefer country-local types + module augmentation).
3. Add calculation logic in country calculator; update breakdown and compare `isMaxRetirement` if tax-reducing.
4. Add constants for contribution/payment caps and tax-relief caps, keeping separate caps separate in naming and calculation.
5. Add `ContributionSlider` on `country-extensions/{code}.tsx` inside the Contributions card (`space-y-6` if multiple sliders).
6. Implement `getContributionLimits(inputs?)` with the same max as the UI.
7. Run `npm test`, `npm run lint`, `npm run build`, and **local verification** (desktop + mobile screenshots).

### Fix Tax Calculation Bug

1. Locate calculation in `lib/countries/{country}/`
2. Check constants for correct values
3. Verify calculation formula matches tax rules
4. Test with known salary amounts

### Change Default Country

1. Edit `app/page.tsx` — change redirect target from `/us` to desired country code
