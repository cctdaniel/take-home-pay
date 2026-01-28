# Take Home Pay Calculator

A multi-country salary calculator that shows your actual take-home pay after all taxes and deductions. Built with Next.js and updated for the 2026 tax year.

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

### Netherlands
- **Income Tax** — 2026 progressive brackets with two tiers
- **National Insurance** — Combined with income tax for most employees under AOW age
- **Uniform Rates** — National rates apply (no regional tax adjustments)
- **Credits Not Modeled** — General/labor tax credits are not included yet

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to use the calculator.

## Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS

## Project Structure

```
/lib/countries/          # Country-specific calculators
  /us/                   # US tax calculations
  /sg/                   # Singapore tax calculations
  /nl/                   # Netherlands tax calculations
  registry.ts            # Country calculator factory
  types.ts               # Shared interfaces
/components/calculator/  # Calculator UI components
/hooks/                  # React state management
```

## Data Sources

- **US:** Tax brackets and contribution limits based on IRS announcements for 2026
- **Singapore:** IRAS tax rates and CPF contribution rates for 2026
- **Netherlands:** Income tax brackets and national insurance rates for 2026

## Disclaimer

This calculator provides estimates only. Actual tax liability may vary based on individual circumstances. Consult a tax professional for personalized advice.
