import type { StandardCountryTaxConfig } from "../../shared/standard-country";
import type { EECalculatorInputs, EESecondPillarRate } from "../types";

export const EE_TAX_YEAR = 2026;
export const EE_INCOME_TAX_RATE = 0.22;
export const EE_BASIC_EXEMPTION = 8400;
export const EE_PENSIONABLE_AGE_BASIC_EXEMPTION = 9312;
export const EE_UNEMPLOYMENT_RATE = 0.016;
export const EE_THIRD_PILLAR_ABSOLUTE_LIMIT = 6000;
export const EE_THIRD_PILLAR_RATE_LIMIT = 0.15;

export const EE_SOURCE_URLS = ["https://www.emta.ee/en/business-client/taxes-and-payment/income-and-social-taxes/tax-rates", "https://www.emta.ee/en/private-client/taxes-and-payment/tax-incentives/calculation-basic-exemption", "https://www.emta.ee/en/private-client/taxes-and-payment/tax-incentives/basic-exemption-pensionable-age", "https://www.emta.ee/en/private-client/taxes-and-payment/tax-incentives/contributions-supplementary-funded-pension", "https://taxsummaries.pwc.com/estonia/individual/taxes-on-personal-income"] as const;

export function getEESecondPillarRateValue(rate: EESecondPillarRate): number {
  return Number(rate) / 100;
}

function asEEInputs(inputs?: unknown): Partial<EECalculatorInputs> {
  return (inputs ?? {}) as Partial<EECalculatorInputs>;
}

function getEEPersonalAllowance(inputs?: unknown): number {
  const eeInputs = asEEInputs(inputs);

  if (!eeInputs.isPensionableAge) {
    return EE_BASIC_EXEMPTION;
  }

  return Math.max(
    0,
    EE_PENSIONABLE_AGE_BASIC_EXEMPTION -
      Math.min(
        Math.max(0, eeInputs.pensionBasicExemptionUsedElsewhere ?? 0),
        EE_PENSIONABLE_AGE_BASIC_EXEMPTION,
      ),
  );
}

export const EE_TAX_CONFIG = {
  code: "EE",
  currency: "EUR",
  taxYear: EE_TAX_YEAR,
  defaultSalary: 60000,
  incomeTaxName: "Income tax",
  personalAllowance: EE_BASIC_EXEMPTION,
  resolvePersonalAllowance: ({ inputs }) => getEEPersonalAllowance(inputs),
  deductions: [],
  taxCredits: [],
  brackets: [{ min: 0, max: Infinity, rate: EE_INCOME_TAX_RATE }],
  resolveSocialContributions: ({ inputs }) => [
    ...(!asEEInputs(inputs).isPensionableAge
      ? [
          {
            name: "Unemployment insurance employee contribution",
            rate: EE_UNEMPLOYMENT_RATE,
            preTax: true,
          },
        ]
      : []),
    {
      name: "Funded pension employee contribution",
      rate: getEESecondPillarRateValue(asEEInputs(inputs).secondPillarRate ?? "2"),
      preTax: true,
    },
  ],
  voluntaryContributions: [{ key: "retirementContribution", name: "Third pillar pension contribution", limit: EE_THIRD_PILLAR_ABSOLUTE_LIMIT, limitRate: EE_THIRD_PILLAR_RATE_LIMIT, description: "Estonian III pillar deduction: up to 15% of income taxable in Estonia, capped at EUR 6,000 per year.", taxTreatment: "deduction" }],
  assumptions: ["Estonia is modeled with the 22% resident income tax rate and the 2026 flat EUR 8,400 annual basic exemption for employees below pensionable age.", "For pensionable-age employees, the salary allowance is modeled as the 2026 EUR 9,312 pensionable-age basic exemption minus any amount already applied to state pension or taxable second-pillar pension payments.", "Employee unemployment insurance is deducted before tax for employees below pensionable age, and the selected funded-pension contribution rate is deducted before tax.", "Second-pillar employee contributions can be modeled at 0%, 2%, 4%, or 6%.", "Third pillar pension contributions are capped at the lower of 15% of modeled salary and EUR 6,000."],
  modeledExclusions: ["Employer social tax, non-salary income, and exact Pension Centre allocation of taxable pension payments are not modeled."],
  sourceUrls: [...EE_SOURCE_URLS],
} satisfies StandardCountryTaxConfig<"EE">;
