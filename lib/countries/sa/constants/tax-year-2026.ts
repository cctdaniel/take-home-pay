// Saudi Arabia 2026 salary tax parameters
// Sources: https://www.gosi.gov.sa/ | https://zatca.gov.sa/

export const SA_TAX_YEAR = 2026;

export const SA_SOURCE_URLS = {
  gosi:
    "https://www.gosi.gov.sa/GOSIOnline/About_GOSI/About_GOSI.htm",
  zatca:
    "https://zatca.gov.sa/en/RulesRegulations/Taxes/Pages/default.aspx",
} as const;

export const SA_PERSONAL_INCOME_TAX_RATE = 0;
export const SA_GOSI_EMPLOYEE_RATE = 0.1;
export const SA_CONTRIBUTION_SALARY_SHARE = 0.7;
export const SA_GOSI_MONTHLY_CAP = 45_000;

export const SA_NATIONALITY_OPTIONS = [
  { value: "saudi_national", label: "Saudi national" },
  { value: "expatriate", label: "Expatriate / non-Saudi" },
] as const;
