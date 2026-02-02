# Take Home Pay Calculator

A multi-country salary calculator that shows your actual take-home pay after all taxes and deductions. Built with Next.js and updated for the 2026 tax year.

## URLs

Each country has its own page for better SEO and shareability:

| Country       | URL                             |
| ------------- | ------------------------------- |
| United States | [/us](http://localhost:3000/us) |
| Australia     | [/au](http://localhost:3000/au) |
| Singapore     | [/sg](http://localhost:3000/sg) |
| South Korea   | [/kr](http://localhost:3000/kr) |
| Netherlands   | [/nl](http://localhost:3000/nl) |
| Portugal      | [/pt](http://localhost:3000/pt) |
| Thailand      | [/th](http://localhost:3000/th) |
| Hong Kong     | [/hk](http://localhost:3000/hk) |
| Compare All   | [/compare](http://localhost:3000/compare) |

Root `/` redirects to `/us` by default.

## Compare Mode

The `/compare` page asks a few simple questions and shows take-home pay across all supported countries using FX conversion. It surfaces a compact breakdown per country and links out to the full country calculator for detailed inputs and accuracy.

FX rates are fetched from Exchangerate-API and cached on the server for performance.

## Supported Countries

### United States

- **All 50 States + DC** — Accurate state tax calculations including progressive, flat, and no-income-tax states
- **Federal Taxes** — 2026 tax brackets (10% to 37%)
- **FICA Taxes** — Social Security (6.2% up to $181,200) and Medicare (1.45% + 0.9% above $200k)
- **State Disability Insurance** — Automatically calculated for CA, HI, NJ, NY, and RI
- **Retirement Contributions** — 401(k), Roth IRA, and HSA with 2026 contribution limits
- **Filing Status** — Single, Married Filing Jointly, Married Filing Separately, Head of Household

### Australia

- **Income Tax** — 2025-26 progressive brackets with Stage 3 tax cuts (0% to 45%)
- **Tax-Free Threshold** — First A$18,200 is tax-free for residents
- **Low Income Tax Offset (LITO)** — Up to A$700 for incomes under A$66,667
- **Medicare Levy** — 2% of taxable income (with low-income reduction)
- **Medicare Levy Surcharge** — 1-1.5% if no private health insurance above A$101,000
- **Division 293 Tax** — Additional 15% on concessional super contributions when income + super exceeds A$250,000
- **Superannuation** — 12% employer contribution (shown as info, not deducted)
- **Residency** — Different tax brackets for Australian residents vs foreign residents

### Netherlands

- **Income Tax** — 2026 progressive brackets with two tiers
- **National Insurance** — Combined with income tax for most employees under AOW age
- **30% Ruling** — Optional tax-exempt allowance for eligible expats
- **Uniform Rates** — National rates apply (no regional tax adjustments)
- **Tax Credits** — Includes general, labor, and IACK (child) tax credits

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

### Portugal

- **IRS (Income Tax)** — 2026 progressive brackets (13% to 48%, 9 brackets for residents)
- **Social Security** — 11% employee contribution (Segurança Social)
- **Specific Deduction** — Minimum €4,104 or actual SS contributions (whichever is higher)
- **Solidarity Surcharge** — Additional 2.5% (€80k-€250k) and 5% (above €250k)
- **PPR (Retirement Savings Plan)** — 20% tax credit on contributions, age-based limits
- **Dependent Deductions** — €600 per dependent deducted from tax assessed
- **Non-Residents** — Flat 25% rate on Portuguese-source income

### Thailand

- **Income Tax** — 2026 progressive brackets (0% to 35%)
- **Social Security** — 5% employee contribution (capped monthly)
- **Allowances** — Personal, spouse, child, parent, and insurance deductions
- **Retirement Savings** — Provident Fund, RMF, SSF, ESG, and NSF contributions
- **Residency** — Non-residents pay 15% flat or progressive (whichever is higher)

### Hong Kong

- **Salaries Tax** — 2026 progressive rates (2% to 17%) or standard rate (15%/16%)
- **MPF Contributions** — Mandatory 5% of relevant income (capped at HK$1,500/month)
- **Allowances** — Basic, married, child, dependent parent, single parent
- **Deductions** — MPF TVC/QDAP, self-education, home loan interest, domestic rent, donations

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
  [country]/page.tsx     # Dynamic country pages (/us, /au, /hk, /sg, /kr, /nl, /pt, /th)
  page.tsx               # Redirect to /us
  compare/page.tsx       # Compare flow
  api/fx/route.ts         # FX rates proxy (Exchangerate-API)
/lib/countries/          # Country-specific calculators
  /us/                   # US tax calculations
  /au/                   # Australia tax calculations
  /sg/                   # Singapore tax calculations
  /kr/                   # South Korea tax calculations
  /nl/                   # Netherlands tax calculations
  registry.ts            # Country calculator factory
  types.ts               # Shared interfaces
/components/calculator/  # Calculator UI components
/components/compare/     # Compare flow UI components
/hooks/                  # React state management
```

## Data Sources

- **US:** Tax brackets and contribution limits based on IRS announcements for 2026
- **Australia:** ATO tax rates for 2025-26, Medicare levy rates, Division 293 tax, and superannuation guarantee
- **Netherlands:** Income tax brackets and national insurance rates for 2026
- **Singapore:** IRAS tax rates and CPF contribution rates for 2026
- **South Korea:** NTS tax rates and social insurance rates for 2026
- **Portugal:** IRS tax brackets and Social Security rates from Autoridade Tributária e Aduaneira (AT) for 2026
- **Thailand:** Revenue Department tax brackets and Social Security Fund rates for 2026
- **Hong Kong:** IRD salaries tax rates/allowances and MPFA MPF contribution rates for 2026
- **FX Rates:** Exchangerate-API (cached, used for `/compare`)

## Disclaimer

This calculator provides estimates only. Actual tax liability may vary based on individual circumstances. Consult a tax professional for personalized advice.
