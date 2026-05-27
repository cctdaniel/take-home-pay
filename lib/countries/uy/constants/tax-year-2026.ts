import type { StandardCountryTaxConfig } from "../../shared/standard-country";
import type { UYCalculatorInputs } from "../types";

export const UY_TAX_YEAR = 2026;

export const UY_BPC = 6864;
export const UY_CHILD_DEDUCTION_BPC = 20;
export const UY_DISABLED_CHILD_DEDUCTION_BPC = 40;
export const UY_MORTGAGE_DEDUCTION_LIMIT_BPC = 36;
export const UY_RENT_CREDIT_RATE = 0.08;
export const UY_PENSION_RATE = 0.15;
export const UY_FONASA_RATE = 0.045;
export const UY_LABOR_RECONVERSION_RATE = 0.001;
export const UY_VOLUNTARY_AFAP_LIMIT_RATE = 0.15;
export const UY_AGUINALDO_MONTHS = 1;

export const UY_SOURCE_URLS = [
  "https://www.gub.uy/direccion-general-impositiva/comunicacion/publicaciones/base-prestaciones-contribuciones-bpc",
  "https://www.bps.gub.uy/23860/2026---comunicado-5---valores-escalas-irpf-2026.html",
  "https://www.gub.uy/direccion-general-impositiva/comunicacion/publicaciones/deducciones-admitidas-liquidacion-del-irpf",
  "https://www.impo.com.uy/bases/decretos-originales/412-2023/8",
  "https://www.gub.uy/ministerio-trabajo-seguridad-social/politicas-y-gestion/derecho-reglamentacion-laboral/derecho-laboral-uruguayo/sueldo-anual-complementario-aguinaldo",
  "https://www.bps.gub.uy/23657/",
] as const;

function bpc(amount: number): number {
  return amount * UY_BPC;
}

function asUYInputs(inputs?: unknown): Partial<UYCalculatorInputs> {
  return (inputs ?? {}) as Partial<UYCalculatorInputs>;
}

function getDeductionRate(grossSalary: number) {
  return grossSalary <= bpc(180) ? 0.14 : 0.08;
}

function getChildDeductionBase(inputs?: unknown) {
  const uyInputs = asUYInputs(inputs);
  return (
    Math.max(0, uyInputs.numberOfChildren ?? 0) *
      bpc(UY_CHILD_DEDUCTION_BPC) +
    Math.max(0, uyInputs.numberOfDisabledChildren ?? 0) *
      bpc(UY_DISABLED_CHILD_DEDUCTION_BPC)
  );
}

function getMortgageDeductionBase(
  inputs: UYCalculatorInputs,
  voluntaryContributions: Array<{ key: string; amount: number }>,
) {
  if (inputs.housingCreditType !== "mortgage") {
    return 0;
  }

  const housingPayments =
    voluntaryContributions.find(
      (contribution) => contribution.key === "housingExpenses",
    )?.amount ?? 0;

  return Math.min(housingPayments, bpc(UY_MORTGAGE_DEDUCTION_LIMIT_BPC));
}

function getRentCredit(
  inputs: UYCalculatorInputs,
  voluntaryContributions: Array<{ key: string; amount: number }>,
) {
  if (inputs.housingCreditType !== "rent") {
    return 0;
  }

  const rentPaid =
    voluntaryContributions.find(
      (contribution) => contribution.key === "housingExpenses",
    )?.amount ?? 0;

  return rentPaid * UY_RENT_CREDIT_RATE;
}

export const UY_TAX_CONFIG = {
  code: "UY",
  currency: "UYU",
  taxYear: UY_TAX_YEAR,
  defaultSalary: 2400000,
  incomeTaxName: "IRPF employment income tax",
  personalAllowance: 0,
  deductions: [],
  taxCredits: [
    {
      name: "IRPF deduction credit for social and pension contributions",
      calculate: ({
        grossSalary,
        mandatoryContributions,
        voluntaryContributions,
        inputs,
      }) => {
        const uyInputs = inputs as UYCalculatorInputs;
        const deductionRate = getDeductionRate(grossSalary);
        const deductionBase =
          mandatoryContributions.reduce(
            (sum, contribution) => sum + contribution.amount,
            0,
          ) +
          voluntaryContributions.reduce(
            (sum, contribution) =>
              contribution.key === "retirementContribution"
                ? sum + contribution.amount
                : sum,
            0,
          ) +
          getChildDeductionBase(inputs) +
          getMortgageDeductionBase(uyInputs, voluntaryContributions);

        return deductionBase * deductionRate;
      },
    },
    {
      name: "IRPF rent credit",
      calculate: ({ inputs, voluntaryContributions }) =>
        getRentCredit(inputs as UYCalculatorInputs, voluntaryContributions),
    },
  ],
  brackets: [
    { min: 0, max: bpc(84), rate: 0 },
    { min: bpc(84), max: bpc(120), rate: 0.1 },
    { min: bpc(120), max: bpc(180), rate: 0.15 },
    { min: bpc(180), max: bpc(360), rate: 0.24 },
    { min: bpc(360), max: bpc(600), rate: 0.25 },
    { min: bpc(600), max: bpc(900), rate: 0.27 },
    { min: bpc(900), max: bpc(1380), rate: 0.31 },
    { min: bpc(1380), max: Infinity, rate: 0.36 },
  ],
  socialContributions: [
    {
      name: "Employee pension contribution",
      rate: UY_PENSION_RATE,
      preTax: false,
    },
    {
      name: "FONASA health contribution",
      rate: UY_FONASA_RATE,
      preTax: false,
    },
    {
      name: "Labor reconversion fund",
      rate: UY_LABOR_RECONVERSION_RATE,
      preTax: false,
    },
  ],
  voluntaryContributions: [
    {
      key: "retirementContribution",
      name: "Voluntary AFAP pension savings",
      calculateLimit: ({ grossSalary }) =>
        grossSalary * UY_VOLUNTARY_AFAP_LIMIT_RATE,
      description:
        "Voluntary AFAP pension savings, modeled as deductible up to the equivalent of the mandatory 15% pension contribution.",
      taxTreatment: "none",
    },
    {
      key: "housingExpenses",
      name: "Rent or eligible mortgage payments",
      calculateLimit: ({ grossSalary, inputs }) =>
        asUYInputs(inputs).housingCreditType === "mortgage"
          ? bpc(UY_MORTGAGE_DEDUCTION_LIMIT_BPC)
          : grossSalary,
      description:
        "Annual rent for permanent housing, or mortgage payments for an eligible unique and permanent home. Rent gives an 8% credit; mortgage is capped at 36 BPC in the deduction base.",
      taxTreatment: "none",
      cashFlowTreatment: "taxOnly",
    },
  ],
  assumptions: [
    "Uruguay uses the 2026 BPC value of UYU 6,864 and annualized IRPF Category II labor-income bands.",
    "Mandatory pension, FONASA, labor reconversion fund, child deductions, eligible mortgage payments, and voluntary AFAP savings are credited through the IRPF deduction scale.",
    "The IRPF deduction credit is modeled at 8% for annual nominal income above 180 BPC and 14% otherwise.",
    "Aguinaldo can be separated from regular salary; when modeled it remains subject to personal social-security contributions and is taxed at the top ordinary IRPF marginal rate when ordinary IRPF remains due after deductions.",
    "Rent for permanent housing is modeled as a separate 8% IRPF credit.",
  ],
  modeledExclusions: [
    "Dependent/family FONASA surcharges, multi-employer adjustments, salary vacation, mortgage home-cost UI eligibility checks, and rent contract/document validation are excluded.",
  ],
  sourceUrls: [...UY_SOURCE_URLS],
} satisfies StandardCountryTaxConfig<"UY">;
