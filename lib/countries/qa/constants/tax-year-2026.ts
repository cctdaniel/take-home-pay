// Qatar 2026 salary tax parameters
// Sources: https://www.gta.gov.qa/

export const QA_TAX_YEAR = 2026;

export const QA_SOURCE_URLS = {
  socialInsurance:
    "https://www.gta.gov.qa/en/services/social-insurance",
  taxation:
    "https://www.gta.gov.qa/en",
} as const;

export const QA_PERSONAL_INCOME_TAX_RATE = 0;
export const QA_SOCIAL_INSURANCE_EMPLOYEE_RATE = 0.05;
export const QA_CONTRIBUTION_SALARY_SHARE = 0.7;

export const QA_NATIONALITY_OPTIONS = [
  { value: "qatari_national", label: "Qatari national" },
  { value: "expatriate", label: "Expatriate / non-Qatari" },
] as const;
