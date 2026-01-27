# Take Home Pay Calculator

A US salary calculator that shows your actual take-home pay after all taxes and deductions. Built with Next.js and updated for the 2026 tax year.

## Features

- **All 50 US States + DC** — Accurate state tax calculations including progressive, flat, and no-income-tax states
- **Federal Taxes** — 2026 tax brackets (10% to 37%)
- **FICA Taxes** — Social Security (6.2% up to $181,200) and Medicare (1.45% + 0.9% above $200k)
- **State Disability Insurance** — Automatically calculated for CA, HI, NJ, NY, and RI
- **Retirement Contributions** — 401(k), Roth IRA, and HSA with 2026 contribution limits
- **Filing Status** — Single, Married Filing Jointly, Married Filing Separately, Head of Household

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

## Data Sources

Tax brackets and contribution limits are based on IRS announcements for the 2026 tax year. State tax data is sourced from individual state revenue departments.

## Disclaimer

This calculator provides estimates only. Actual tax liability may vary based on individual circumstances. Consult a tax professional for personalized advice.
