import type { AEEmployeeCategory } from "../types";

export const UAE_TAX_YEAR = 2026;

export const UAE_PERSONAL_INCOME_TAX_RATE = 0;

export const UAE_SOURCE_URLS = {
  // Ministry of Finance: UAE does not impose personal income tax.
  personalIncomeTax: "https://mof.gov.ae/en/retail-sukuk/",
  // Federal Tax Authority: wages are outside natural-person business activity for UAE Corporate Tax.
  naturalPersonWages:
    "https://tax.gov.ae/en/taxes/corporate.tax/corporate.tax.topics/basis.of.taxation.natural.person.aspx",
  // GPSSA: Emirati contribution rates and UAE national contribution salary caps.
  emiratePensionRates:
    "https://www.gpssa.gov.ae/pages/en/media-center/news/gpssa-insureds-contribution-payment-may-be-extended-15th-day-each-month",
  // GPSSA: GPSSA registration and contributions are mandatory for Emiratis.
  emirateRegistration:
    "https://www.gpssa.gov.ae/pages/en/help/faq/registration-gpssa-mandatory",
  // GPSSA: GCC insurance protection extension program and contribution rate table.
  gccInsuranceExtension:
    "https://www.gpssa.gov.ae/pages/en/services/gcc-overview",
  // GPSSA: GCC national registration service confirms mandatory insurance extension contributions.
  gccRegistration:
    "https://gpssa.gov.ae/pages/en/services/registration-gcc-nationals",
} as const;

export interface AEPensionCategorySettings {
  label: string;
  shortLabel: string;
  employeeRate: number;
  employerRate: number;
  governmentSupportRate: number;
  monthlyMinimum?: number;
  monthlyMaximum?: number;
  governmentSupportMonthlyThreshold?: number;
  salaryBaseDescription: string;
  sourceUrl: string;
  notes: string[];
}

export const UAE_EMPLOYEE_CATEGORY_SETTINGS: Record<
  AEEmployeeCategory,
  AEPensionCategorySettings
> = {
  foreign_expat: {
    label: "Foreign / expat employee",
    shortLabel: "Foreign / expat",
    employeeRate: 0,
    employerRate: 0,
    governmentSupportRate: 0,
    salaryBaseDescription:
      "No UAE personal income tax or GPSSA employee pension deduction is modeled.",
    sourceUrl: UAE_SOURCE_URLS.personalIncomeTax,
    notes: [
      "Default category for non-UAE and non-GCC employees.",
      "End-of-service gratuity, unemployment insurance, private medical cover, and visa costs are excluded.",
    ],
  },
  uae_national_new_private: {
    label: "UAE national - private sector, Federal Law 57/2023",
    shortLabel: "UAE national (Law 57)",
    employeeRate: 0.11,
    employerRate: 0.15,
    governmentSupportRate: 0.025,
    monthlyMinimum: 3_000,
    monthlyMaximum: 70_000,
    governmentSupportMonthlyThreshold: 20_000,
    salaryBaseDescription:
      "Private-sector contribution account salary, floored at AED 3,000/month and capped at AED 70,000/month.",
    sourceUrl: UAE_SOURCE_URLS.emiratePensionRates,
    notes: [
      "Uses the employee share stated for Federal Law No. 57 of 2023.",
      "Government support is shown separately when the contribution account salary is below AED 20,000/month.",
    ],
  },
  uae_national_legacy_private: {
    label: "UAE national - private sector, legacy Law 7/1999",
    shortLabel: "UAE national (legacy)",
    employeeRate: 0.05,
    employerRate: 0.15,
    governmentSupportRate: 0.025,
    monthlyMaximum: 50_000,
    salaryBaseDescription:
      "Private-sector gross salary used as the contribution account salary, capped at AED 50,000/month.",
    sourceUrl: UAE_SOURCE_URLS.emiratePensionRates,
    notes: [
      "Uses the employee share stated for Federal Law No. 7 of 1999.",
      "Included for existing insured members covered by the legacy pension law.",
    ],
  },
  gcc_bahrain_private: {
    label: "GCC national - Bahrain private sector",
    shortLabel: "Bahrain GCC",
    employeeRate: 0.07,
    employerRate: 0.15,
    governmentSupportRate: 0,
    salaryBaseDescription:
      "Bahrain private-sector insurance extension rate applied to full gross salary.",
    sourceUrl: UAE_SOURCE_URLS.gccInsuranceExtension,
    notes: [
      "Uses GPSSA's January 2026 up-to-date Bahrain private-sector employee and employer shares.",
    ],
  },
  gcc_oman_private: {
    label: "GCC national - Oman private sector",
    shortLabel: "Oman GCC",
    employeeRate: 0.075,
    employerRate: 0.11,
    governmentSupportRate: 0,
    salaryBaseDescription:
      "Oman private-sector insurance extension rate applied to full gross salary.",
    sourceUrl: UAE_SOURCE_URLS.gccInsuranceExtension,
    notes: [
      "Uses GPSSA's 1 January 2024 up-to-date Oman private-sector employee and employer shares.",
    ],
  },
  gcc_saudi_private: {
    label: "GCC national - Saudi Arabia private sector",
    shortLabel: "Saudi GCC",
    employeeRate: 0.09,
    employerRate: 0.09,
    governmentSupportRate: 0,
    salaryBaseDescription:
      "Saudi private-sector insurance extension rate applied to full gross salary.",
    sourceUrl: UAE_SOURCE_URLS.gccInsuranceExtension,
    notes: [
      "Uses GPSSA's up-to-date Saudi private-sector employee and employer shares.",
    ],
  },
  gcc_kuwait_private: {
    label: "GCC national - Kuwait government/private sector",
    shortLabel: "Kuwait GCC",
    employeeRate: 0.10,
    employerRate: 0.11,
    governmentSupportRate: 0,
    salaryBaseDescription:
      "Kuwait insurance extension rate applied to full gross salary.",
    sourceUrl: UAE_SOURCE_URLS.gccInsuranceExtension,
    notes: [
      "GPSSA lists 7.5% plus an additional 2.5% employee share from 1 January 2015, with a Kuwait-dinar cap not converted here.",
    ],
  },
  gcc_qatar_private: {
    label: "GCC national - Qatar government/private sector",
    shortLabel: "Qatar GCC",
    employeeRate: 0.07,
    employerRate: 0.14,
    governmentSupportRate: 0,
    salaryBaseDescription:
      "Qatar 2023 insurance extension rate applied to full gross salary.",
    sourceUrl: UAE_SOURCE_URLS.gccInsuranceExtension,
    notes: [
      "Uses GPSSA's 3 January 2023 up-to-date Qatar employee and employer shares.",
    ],
  },
};

export const UAE_EMPLOYEE_CATEGORY_OPTIONS = Object.entries(
  UAE_EMPLOYEE_CATEGORY_SETTINGS,
).map(([value, settings]) => ({
  value: value as AEEmployeeCategory,
  label: settings.label,
}));

export const UAE_MODELED_EXCLUSIONS = [
  "Visa, work-permit, relocation, and free-zone employment costs.",
  "Corporate tax, free-zone corporate tax, VAT, and business/self-employment tax positions.",
  "End-of-service gratuity, unemployment insurance, private medical insurance, and employer-specific benefits.",
  "Emirate-level pension funds outside this simplified GPSSA/GCC extension model.",
  "Detailed GCC home-country salary components and foreign-currency contribution caps.",
];
