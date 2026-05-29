// Ukraine 2026 employment income tax parameters
// Sources: https://taxsummaries.pwc.com/ukraine/individual/significant-developments

export const UA_TAX_YEAR = 2026;

export const UA_SOURCE_URLS = {
  personalIncomeTax:
    "https://taxsummaries.pwc.com/ukraine/individual/taxes-on-personal-income",
  militaryTax:
    "https://taxsummaries.pwc.com/ukraine/individual/significant-developments",
  socialContribution:
    "https://taxsummaries.pwc.com/ukraine/individual/other-taxes",
} as const;

/** Personal income tax on employment income (resident/non-resident salary). */
export const UA_PIT_RATE = 0.18;

/** Military tax on the same base as PIT (5% from 1 Dec 2024 for individuals). */
export const UA_MILITARY_TAX_RATE = 0.05;

/** Employer unified social contribution — not deducted from employee net pay. */
export const UA_EMPLOYER_USC_RATE = 0.22;

/** Monthly USC assessment cap (20 × minimum wage 2026). */
export const UA_USC_MONTHLY_CAP_2026 = 172_940;
