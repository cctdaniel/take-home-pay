// Brazil 2026 salary tax parameters (IRPF 2025 monthly table annualized; INSS 2025 bands)
// Sources: https://www.gov.br/receitafederal/

export const BR_TAX_YEAR = 2026;

export const BR_SOURCE_URLS = {
  irpf:
    "https://www.gov.br/receitafederal/pt-br/assuntos/meu-imposto-de-renda/tabelas",
  inss:
    "https://www.gov.br/inss/pt-br/direitos-e-deveres/todo-o-conteudo-sobre-contribuicao",
} as const;

export const BR_DEPENDENT_DEDUCTION_MONTHLY = 189.59;
export const BR_INSS_MONTHLY_CEILING = 8_157.41;

/** PGBL/VGBL — deductible up to 12% of gross annual income (Receita Federal). */
export const BR_PRIVATE_PENSION_DEDUCTION_RATE = 0.12;

/** Monthly IRPF 2025 brackets (min, max, rate, fixed monthly deduction). */
export const BR_IRPF_MONTHLY_BRACKETS = [
  { min: 0, max: 2_428.8, rate: 0, deduction: 0 },
  { min: 2_428.81, max: 2_826.65, rate: 0.075, deduction: 182.16 },
  { min: 2_826.66, max: 3_751.05, rate: 0.15, deduction: 394.16 },
  { min: 3_751.06, max: 4_664.68, rate: 0.225, deduction: 675.49 },
  { min: 4_664.69, max: Infinity, rate: 0.275, deduction: 908.73 },
] as const;

/** Monthly INSS employee bands (min, max, rate). */
export const BR_INSS_MONTHLY_BANDS = [
  { min: 0, max: 1_518, rate: 0.075 },
  { min: 1_518.01, max: 2_793.88, rate: 0.09 },
  { min: 2_793.89, max: 4_190.83, rate: 0.12 },
  { min: 4_190.84, max: BR_INSS_MONTHLY_CEILING, rate: 0.14 },
] as const;

export function calculateBrazilInssMonthly(monthlyGross: number): number {
  const capped = Math.min(Math.max(0, monthlyGross), BR_INSS_MONTHLY_CEILING);
  let total = 0;
  let previousLimit = 0;

  for (const band of BR_INSS_MONTHLY_BANDS) {
    if (capped <= previousLimit) {
      break;
    }
    const bandTop = Math.min(capped, band.max);
    const amountInBand = bandTop - previousLimit;
    if (amountInBand > 0) {
      total += amountInBand * band.rate;
    }
    previousLimit = band.max;
  }

  return Math.round(total * 100) / 100;
}

export function calculateBrazilIrpfMonthly(monthlyTaxable: number): number {
  const taxable = Math.max(0, monthlyTaxable);
  const bracket =
    BR_IRPF_MONTHLY_BRACKETS.find(
      (candidate) => taxable >= candidate.min && taxable <= candidate.max,
    ) ?? BR_IRPF_MONTHLY_BRACKETS[BR_IRPF_MONTHLY_BRACKETS.length - 1];
  return Math.max(0, taxable * bracket.rate - bracket.deduction);
}
