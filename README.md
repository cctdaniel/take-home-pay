# Take Home Pay Calculator

A multi-country salary calculator that shows your actual take-home pay after all taxes and deductions. Built with Next.js and updated for the 2026 tax year.

## URLs

Each country has its own page for better SEO and shareability:

| Country       | URL                             |
| ------------- | ------------------------------- |
| United States | [/us](http://localhost:3000/us) |
| Singapore     | [/sg](http://localhost:3000/sg) |
| South Korea   | [/kr](http://localhost:3000/kr) |
| Netherlands   | [/nl](http://localhost:3000/nl) |

Root `/` redirects to `/us` by default.

## Supported Countries

### United States

- **All 50 States + DC** — Accurate state tax calculations including progressive, flat, and no-income-tax states
- **Federal Taxes** — 2026 tax brackets (10% to 37%)
- **FICA Taxes** — Social Security (6.2% up to $181,200) and Medicare (1.45% + 0.9% above $200k)
- **State Disability Insurance** — Automatically calculated for CA, HI, NJ, NY, and RI
- **Retirement Contributions** — 401(k), Roth IRA, and HSA with 2026 contribution limits
- **Filing Status** — Single, Married Filing Jointly, Married Filing Separately, Head of Household

### Singapore

- **Income Tax** — 2026 progressive tax brackets (0% to 24%)
- **CPF Contributions** — Mandatory Central Provident Fund with age-dependent rates
- **CPF Breakdown** — Ordinary Account, Special Account, and MediSave allocations
- **Tax Reliefs** — Spouse, children, parent, working mother, and course fee reliefs
- **Voluntary Contributions** — CPF top-up and Supplementary Retirement Scheme (SRS)

### South Korea

- **Income Tax** — 2026 progressive brackets (6% to 45%, 8 brackets)
- **Local Income Tax** — 10% of national income tax
- **4 Major Insurance** — National Pension, Health Insurance, Long-term Care, Employment Insurance
- **Tax Deductions** — Employment income, basic, dependent, and child deductions
- **Tax Credits** — Wage earner credit, child tax credit, pension credit

### Netherlands

- **Income Tax** — 2026 progressive brackets with two tiers
- **National Insurance** — Combined with income tax for most employees under AOW age
- **30% Ruling** — Optional tax-exempt allowance for eligible expats
- **Uniform Rates** — National rates apply (no regional tax adjustments)
- **Tax Credits** — Includes estimated general and labor tax credits

## Getting Started

```bash
npm install
npm run dev
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
  [country]/page.tsx     # Dynamic country pages (/us, /sg, /kr, /nl)
  page.tsx               # Redirect to /us
/lib/countries/          # Country-specific calculators
  /us/                   # US tax calculations
  /sg/                   # Singapore tax calculations
  /kr/                   # South Korea tax calculations
  /nl/                   # Netherlands tax calculations
  registry.ts            # Country calculator factory
  types.ts               # Shared interfaces
/components/calculator/  # Calculator UI components
/hooks/                  # React state management
```

## Data Sources

- **US:** Tax brackets and contribution limits based on IRS announcements for 2026
- **Singapore:** IRAS tax rates and CPF contribution rates for 2026
- **South Korea:** NTS tax rates and social insurance rates for 2026
- **Netherlands:** Income tax brackets and national insurance rates for 2026

## Disclaimer

This calculator provides estimates only. Actual tax liability may vary based on individual circumstances. Consult a tax professional for personalized advice.
