export const AT_TAX_YEAR = 2026;

export const AT_SOURCE_URLS = {
  taxTariff:
    "https://www.bmf.gv.at/themen/steuern/arbeitnehmerveranlagung/steuertarif-steuerabsetzbetrage/steuertarif-steuerabsetzbetrage.html",
  taxCredits:
    "https://www.bmf.gv.at/themen/steuern/arbeitnehmerveranlagung/steuertarif-steuerabsetzbetrage/uebersicht-steuerabsetzbetrage.html",
  familyBonus:
    "https://www.bmf.gv.at/en/topics/taxation/family-and-children/family-bonus-faq.html",
  commuterAllowance:
    "https://www.bmf.gv.at/themen/steuern/arbeitnehmerveranlagung/pendlerfoerderung-das-pendlerpauschale/allgemeines-zum-pendlerpauschale.html",
  specialExpenses:
    "https://www.bmf.gv.at/themen/steuern/arbeitnehmerveranlagung/was-kann-ich-geltend-machen/sonderausgaben/sonderausgaben-im-einzelnen.html",
  socialSecurity:
    "https://www.usp.gv.at/en/themen/mitarbeiter-und-gesundheit/einstellung-mitarbeiter-und-arten-der-beschaeftigung/weitere-informationen-einstellen-von-personal/zahlung-von-sozialversicherungsbeitraegen.html",
  remuneration:
    "https://www.usp.gv.at/en/themen/mitarbeiter-und-gesundheit/entgelt.html",
  benefitsInKind:
    "https://www.usp.gv.at/services/suchen-und-finden/lexikon/sachbezuege.html",
  taxBook2026:
    "https://www.bmf.gv.at/dam/jcr%3A436f8c01-38e0-41bf-b904-c0e62a862bf1/251117_Steuerbuch2026_DE_BF.pdf",
  specialPaymentSocial:
    "https://www.sozialversicherung.gv.at/cdscontent/?contentid=10007.905448",
  socialSecurityValues2026:
    "https://www.sozialversicherung.gv.at/cdscontent/?contentid=10007.907722",
  employeeContributionRates2026:
    "https://www.wko.at/entlohnung/beitragswesen-dienstnehmer-2026",
  pwcSocialSecurity:
    "https://taxsummaries.pwc.com/austria/corporate/other-taxes",
} as const;

export const AT_CHURCH_CONTRIBUTION_LIMIT_2026 = 600;
export const AT_DONATION_LIMIT_RATE_2026 = 0.1;
export const AT_SPECIAL_PAYMENT_TAX_FREE_AMOUNT_2026 = 620;
export const AT_SPECIAL_PAYMENT_LOW_INCOME_TAX_FREE_LIMIT_2026 = 2_615;
export const AT_SPECIAL_PAYMENT_SOCIAL_RATE_2026 = 0.1707;
export const AT_SPECIAL_PAYMENT_SOCIAL_CAP_2026 = 13_860;

export const AT_SPECIAL_PAYMENT_TAX_BRACKETS_2026 = [
  { min: 0, max: 620, rate: 0 },
  { min: 620, max: 25_000, rate: 0.06 },
  { min: 25_000, max: 50_000, rate: 0.27 },
  { min: 50_000, max: 83_333, rate: 0.3575 },
] as const;

export const AT_FAMILY_BONUS_PLUS_2026 = {
  under18PerChild: 2_000.16,
  over18PerChild: 700.08,
} as const;

export const AT_EMPLOYEE_TAX_CREDITS_2026 = {
  transportationCredit: 496,
  transportationSurcharge: 804,
  transportationSurchargeFullIncomeLimit: 19_761,
  transportationSurchargePhaseoutLimit: 30_259,
  elevatedCommuterCredit: 853,
  elevatedCommuterFullIncomeLimit: 15_069,
  elevatedCommuterPhaseoutLimit: 16_056,
  singleEarnerOrParent: {
    oneChild: 612,
    twoChildren: 828,
    threeChildren: 1_101,
    eachAdditionalChild: 273,
    partnerIncomeLimit: 7_411,
  },
} as const;

export const AT_COMMUTER_ALLOWANCE_2026 = {
  pendlereuroPerKm: 6,
  proration: {
    full: 1,
    twoThirds: 2 / 3,
    oneThird: 1 / 3,
  },
  annualAllowance: {
    none: {
      none: 0,
      km2to20: 0,
      km20to40: 0,
      km40to60: 0,
      km60plus: 0,
    },
    small: {
      none: 0,
      km2to20: 0,
      km20to40: 696,
      km40to60: 1_356,
      km60plus: 2_016,
    },
    large: {
      none: 0,
      km2to20: 372,
      km20to40: 1_476,
      km40to60: 2_568,
      km60plus: 3_672,
    },
  },
} as const;

export type ATCommuterAllowanceType =
  keyof typeof AT_COMMUTER_ALLOWANCE_2026.annualAllowance;
export type ATCommuterDistanceBand =
  keyof typeof AT_COMMUTER_ALLOWANCE_2026.annualAllowance.none;
export type ATCommuterWorkdayLevel =
  keyof typeof AT_COMMUTER_ALLOWANCE_2026.proration;

export function calculateAustriaCommuterAllowance(
  allowanceType: ATCommuterAllowanceType,
  distanceBand: ATCommuterDistanceBand,
  workdayLevel: ATCommuterWorkdayLevel,
): number {
  const annualAllowance =
    AT_COMMUTER_ALLOWANCE_2026.annualAllowance[allowanceType]?.[
      distanceBand
    ] ?? 0;
  return Math.round(
    annualAllowance * AT_COMMUTER_ALLOWANCE_2026.proration[workdayLevel],
  );
}

export function calculateAustriaPendlereuro(
  oneWayKm: number,
  workdayLevel: ATCommuterWorkdayLevel,
): number {
  const km = Math.min(Math.max(oneWayKm, 0), 300);
  return Math.round(
    km *
      AT_COMMUTER_ALLOWANCE_2026.pendlereuroPerKm *
      AT_COMMUTER_ALLOWANCE_2026.proration[workdayLevel],
  );
}

export function calculateAustriaSingleEarnerOrParentCredit(
  children: number,
): number {
  const childCount = Math.max(0, Math.trunc(children));
  if (childCount <= 0) return 0;
  const credit = AT_EMPLOYEE_TAX_CREDITS_2026.singleEarnerOrParent;
  if (childCount === 1) return credit.oneChild;
  if (childCount === 2) return credit.twoChildren;
  return credit.threeChildren + (childCount - 3) * credit.eachAdditionalChild;
}

export function calculateAustriaDonationLimit(incomeBeforeSpecialExpenses: number) {
  return Math.max(0, incomeBeforeSpecialExpenses) * AT_DONATION_LIMIT_RATE_2026;
}

export const AT_TAX_CONFIG = {
  code: "AT",
  currency: "EUR",
  taxYear: AT_TAX_YEAR,
  defaultSalary: 50000,
  standardDeduction: 0,
  commuterAllowanceLimit: 3_672,
  churchContributionLimit: AT_CHURCH_CONTRIBUTION_LIMIT_2026,
  donationLimitRate: AT_DONATION_LIMIT_RATE_2026,
  familyBonusPlusUnder18PerChild: AT_FAMILY_BONUS_PLUS_2026.under18PerChild,
  familyBonusPlusOver18PerChild: AT_FAMILY_BONUS_PLUS_2026.over18PerChild,
  employeeSocialRate: 0.1807,
  employeeSocialCap: 83_160,
  employeeSocialName:
    "Employee social insurance (general employee rate, capped)",
  deductEmployeeSocialBeforeIncomeTax: true,
  taxCredit: 0,
  brackets: [
    { min: 0, max: 13_539, rate: 0 },
    { min: 13_539, max: 21_992, rate: 0.2 },
    { min: 21_992, max: 36_458, rate: 0.3 },
    { min: 36_458, max: 70_365, rate: 0.4 },
    { min: 70_365, max: 104_859, rate: 0.48 },
    { min: 104_859, max: 1_000_000, rate: 0.5 },
    { min: 1_000_000, max: Infinity, rate: 0.55 },
  ],
  assumptions: [
    "Models an ordinary Austrian resident employee using the official 2026 progressive wage/income tax tariff.",
    "Employee social insurance is modeled with the general employee rate and the 2026 monthly contribution-base cap annualized for regular salary payments.",
    "The employee transportation credit, optional low-income transportation surcharge, elevated commuter credit, structured Pendlerpauschale, and Pendlereuro are modeled from BMF 2026 values.",
    "Family Bonus Plus, single-earner/single-parent credits, church contributions, donations, and voluntary statutory pension insurance are modeled when entered.",
    "Holiday and Christmas remuneration / 13th and 14th salary are modeled as Austrian special payments when selected, with the BMF 2026 fixed-rate schedule inside the annual one-sixth and the ÖGK special-payment social-insurance cap.",
    "Taxable benefits in kind can be entered as an annual value; they increase the wage-tax and employee social-insurance bases but are not cash paid to the employee.",
    "Social insurance, commuter allowance, and special expenses reduce the taxable base; no separate state or municipal employee income tax is modeled.",
    "Exact Pendlerrechner route certification, official in-kind benefit valuation worksheets, non-resident/treaty positions, and month-by-month payroll cap timing require taxpayer-specific payroll records before they can be modeled accurately.",
  ],
  sourceUrls: Object.values(AT_SOURCE_URLS),
};
