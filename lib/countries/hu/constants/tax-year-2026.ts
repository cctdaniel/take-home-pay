import type { StandardCountryTaxConfig } from "../../shared/standard-country";
import type { HUCalculatorInputs, HUPitBaseAllowance } from "../types";

export const HU_TAX_YEAR = 2026;
export const HU_INCOME_TAX_RATE = 0.15;
export const HU_SOCIAL_SECURITY_RATE = 0.185;
export const HU_VOLUNTARY_PENSION_CREDIT_RATE = 0.2;
export const HU_VOLUNTARY_PENSION_CREDIT_CAP = 150000;
export const HU_VOLUNTARY_PENSION_CONTRIBUTION_FOR_MAX_CREDIT = 750000;
export const HU_UNDER_25_ALLOWANCE_MONTHLY_2026 = 715765;
export const HU_UNDER_25_ALLOWANCE_ANNUAL_2026 =
  HU_UNDER_25_ALLOWANCE_MONTHLY_2026 * 12;
export const HU_PERSONAL_ALLOWANCE_MONTHLY_2026 = 107600;
export const HU_PERSONAL_ALLOWANCE_ANNUAL_2026 =
  HU_PERSONAL_ALLOWANCE_MONTHLY_2026 * 12;
export const HU_FIRST_MARRIAGE_ALLOWANCE_MONTHLY = 33335;
export const HU_FIRST_MARRIAGE_ALLOWANCE_ANNUAL =
  HU_FIRST_MARRIAGE_ALLOWANCE_MONTHLY * 12;
export const HU_FAMILY_ALLOWANCE_ONE_DEPENDENT = 133340;
export const HU_FAMILY_ALLOWANCE_TWO_DEPENDENTS = 266660;
export const HU_FAMILY_ALLOWANCE_THREE_PLUS_DEPENDENTS = 440000;

export const HU_SOURCE_URLS = [
  "https://nav.gov.hu/pfile/file?path=%2Fen%2Ftaxation%2Ftaxinfo%2Fa-short-summary-on-the-taxation-of-private-persons",
  "https://nav.gov.hu/pfile/file?path=%2Fen%2Ftaxation%2FBooklets%2F73---personal-income-tax-base-allowances",
  "https://nav.gov.hu/pfile/file?path=%2Fen%2Ftaxation%2Ftax_reliefs%2Fclaiming-family-tax-allowance",
  "https://nav.gov.hu/pfile/file?path=%2Fen%2Ftaxation%2Ftaxinfo%2Fsocial-security-contributions-payable",
  "https://nav.gov.hu/print/sajtoszoba/hirek/Erdemes_kihasznalni_az_onkentes_penztari_befizetesek_utan_jaro_adokedvezmenyt",
  "https://taxsummaries.pwc.com/hungary/individual/taxes-on-personal-income",
] as const;

function asHUInputs(inputs?: unknown): Partial<HUCalculatorInputs> {
  return (inputs ?? {}) as Partial<HUCalculatorInputs>;
}

function getFamilyAllowancePerBeneficiary(inputs?: unknown): number {
  const huInputs = asHUInputs(inputs);
  const beneficiaryDependents = Math.min(
    Math.max(0, huInputs.beneficiaryDependents ?? 0),
    10,
  );
  const totalDependents = Math.min(
    Math.max(beneficiaryDependents, huInputs.totalDependents ?? 0),
    10,
  );

  if (totalDependents <= 0 || beneficiaryDependents <= 0) {
    return 0;
  }

  if (totalDependents === 1) {
    return HU_FAMILY_ALLOWANCE_ONE_DEPENDENT;
  }

  if (totalDependents === 2) {
    return HU_FAMILY_ALLOWANCE_TWO_DEPENDENTS;
  }

  return HU_FAMILY_ALLOWANCE_THREE_PLUS_DEPENDENTS;
}

function normalizePitBaseAllowance(
  value?: HUPitBaseAllowance,
): HUPitBaseAllowance {
  switch (value) {
    case "under_25":
    case "mother_under_30":
    case "mother_two_children":
    case "mother_three_children":
    case "mother_four_plus_children":
      return value;
    default:
      return "none";
  }
}

function calculatePrimaryPitBaseAllowance({
  grossSalary,
  inputs,
}: {
  grossSalary: number;
  inputs?: unknown;
}): number {
  const pitBaseAllowance = normalizePitBaseAllowance(
    asHUInputs(inputs).pitBaseAllowance,
  );

  if (pitBaseAllowance === "under_25") {
    return Math.min(grossSalary, HU_UNDER_25_ALLOWANCE_ANNUAL_2026);
  }

  if (pitBaseAllowance !== "none") {
    return grossSalary;
  }

  return 0;
}

function calculatePersonalAllowance({
  grossSalary,
  inputs,
}: {
  grossSalary: number;
  inputs?: unknown;
}): number {
  if (!asHUInputs(inputs).claimPersonalAllowance) {
    return 0;
  }

  const remainingTaxBase = Math.max(
    0,
    grossSalary - calculatePrimaryPitBaseAllowance({ grossSalary, inputs }),
  );

  return Math.min(remainingTaxBase, HU_PERSONAL_ALLOWANCE_ANNUAL_2026);
}

function calculateFirstMarriageAllowance({
  grossSalary,
  inputs,
}: {
  grossSalary: number;
  inputs?: unknown;
}): number {
  if (!asHUInputs(inputs).claimFirstMarriageAllowance) {
    return 0;
  }

  const primaryAllowance = calculatePrimaryPitBaseAllowance({
    grossSalary,
    inputs,
  });
  const personalAllowance = calculatePersonalAllowance({
    grossSalary,
    inputs,
  });
  const remainingTaxBase = Math.max(
    0,
    grossSalary - primaryAllowance - personalAllowance,
  );

  return Math.min(remainingTaxBase, HU_FIRST_MARRIAGE_ALLOWANCE_ANNUAL);
}

function calculateFamilyAllowance(inputs?: unknown): number {
  const beneficiaryDependents = Math.min(
    Math.max(0, asHUInputs(inputs).beneficiaryDependents ?? 0),
    10,
  );

  return beneficiaryDependents * getFamilyAllowancePerBeneficiary(inputs) * 12;
}

function calculateTaxBaseBeforeFamilyAllowance({
  grossSalary,
  inputs,
}: {
  grossSalary: number;
  inputs?: unknown;
}): number {
  return Math.max(
    0,
    grossSalary -
      calculatePrimaryPitBaseAllowance({ grossSalary, inputs }) -
      calculatePersonalAllowance({ grossSalary, inputs }) -
      calculateFirstMarriageAllowance({ grossSalary, inputs }),
  );
}

function calculateFamilyContributionAllowance({
  grossSalary,
  inputs,
  socialContributions,
}: {
  grossSalary: number;
  inputs?: unknown;
  socialContributions: number;
}): number {
  if (!asHUInputs(inputs).claimFamilyContributionAllowance) {
    return 0;
  }

  const familyAllowance = calculateFamilyAllowance(inputs);
  const unusedFamilyAllowanceBase = Math.max(
    0,
    familyAllowance -
      calculateTaxBaseBeforeFamilyAllowance({ grossSalary, inputs }),
  );

  return Math.min(
    socialContributions,
    unusedFamilyAllowanceBase * HU_INCOME_TAX_RATE,
  );
}

export const HU_TAX_CONFIG = {
  code: "HU",
  currency: "HUF",
  taxYear: HU_TAX_YEAR,
  defaultSalary: 24000000,
  incomeTaxName: "Personal income tax",
  personalAllowance: 0,
  deductions: [
    {
      name: "Mother / under-25 PIT base allowance",
      calculateAmount: ({ grossSalary, inputs }) =>
        calculatePrimaryPitBaseAllowance({ grossSalary, inputs }),
    },
    {
      name: "Personal allowance",
      calculateAmount: ({ grossSalary, inputs }) =>
        calculatePersonalAllowance({ grossSalary, inputs }),
    },
    {
      name: "First-marriage allowance",
      calculateAmount: ({ grossSalary, inputs }) =>
        calculateFirstMarriageAllowance({ grossSalary, inputs }),
    },
    {
      name: "Family tax allowance",
      calculateAmount: ({ inputs }) => calculateFamilyAllowance(inputs),
    },
  ],
  taxCredits: [
    {
      name: "Family contribution allowance",
      refundable: true,
      calculate: ({ grossSalary, inputs, mandatoryContributions }) =>
        calculateFamilyContributionAllowance({
          grossSalary,
          inputs,
          socialContributions: mandatoryContributions.reduce(
            (sum, contribution) => sum + contribution.amount,
            0,
          ),
        }),
    },
  ],
  brackets: [{ min: 0, max: Infinity, rate: HU_INCOME_TAX_RATE }],
  socialContributions: [{ name: "Employee social security contribution", rate: HU_SOCIAL_SECURITY_RATE, preTax: false }],
  voluntaryContributions: [{ key: "retirementContribution", name: "Voluntary pension fund contribution", limit: HU_VOLUNTARY_PENSION_CONTRIBUTION_FOR_MAX_CREDIT, description: "Hungarian voluntary pension fund contribution: 20% tax credit capped at HUF 150,000, reached at HUF 750,000 of annual contributions.", taxTreatment: "credit", creditRate: HU_VOLUNTARY_PENSION_CREDIT_RATE, creditCap: HU_VOLUNTARY_PENSION_CREDIT_CAP }],
  assumptions: ["Hungary is modeled with the 2026 NAV flat 15% personal income tax rate and 18.5% employee social security contribution.", "NAV personal income-tax base allowances are modeled in the 2026 order: mother allowances, under-25 allowance, personal allowance, first-marriage allowance, then family allowance.", "Mother-under-30 and mother-of-two/three/four-plus settings are user-selected eligibility modes and are modeled as full salary PIT-base exemptions for qualifying employment income.", "The under-25 allowance is capped at HUF 715,765 per eligibility month, modeled here as a full-year HUF 8,589,180 annual cap.", "Family tax allowance is modeled as a tax-base allowance using the 2026 per-beneficiary monthly amounts based on total dependants.", "When selected, unused family tax allowance is modeled as a family contribution allowance against employee social security contributions.", "Voluntary pension fund savings are modeled as a 20% tax credit capped at HUF 150,000, reached at HUF 750,000 of annual contributions."],
  modeledExclusions: ["Eligibility-month proration, non-salary benefit income, infant-care/child-care/adoption-benefit allowance income, employer social contribution tax, and detailed benefit taxation are excluded."],
  sourceUrls: [...HU_SOURCE_URLS],
} satisfies StandardCountryTaxConfig<"HU">;
