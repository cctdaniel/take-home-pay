import type { CalculatorInputs, CalculationResult, PayFrequency } from "./types";
import type { FilingStatus } from "../constants/tax-brackets-2025";
import { calculateFederalIncomeTax, getFederalTaxableIncome } from "./federal-tax";
import { calculatePayrollTaxes } from "./payroll-tax";
import { getStateCalculator, hasNoIncomeTax } from "./state-tax";
import { STANDARD_DEDUCTIONS } from "../constants/tax-brackets-2025";

function getPeriodsPerYear(frequency: PayFrequency): number {
  switch (frequency) {
    case "annual":
      return 1;
    case "monthly":
      return 12;
    case "biweekly":
      return 26;
    case "weekly":
      return 52;
  }
}

// Get state-specific standard deduction or fall back to a default
function getStateStandardDeduction(
  stateCode: string,
  filingStatus: FilingStatus
): number {
  // For states with no income tax, deduction doesn't matter
  if (hasNoIncomeTax(stateCode)) {
    return 0;
  }

  // State-specific deductions are handled within each state calculator
  // This is a fallback for states that use federal-like deductions
  const stateDeductions: Record<string, Record<FilingStatus, number>> = {
    CA: { single: 5540, married_jointly: 11080, married_separately: 5540, head_of_household: 11080 },
    NY: { single: 8000, married_jointly: 16050, married_separately: 8000, head_of_household: 11200 },
    GA: { single: 12000, married_jointly: 24000, married_separately: 12000, head_of_household: 18000 },
    NC: { single: 12750, married_jointly: 25500, married_separately: 12750, head_of_household: 19125 },
    AZ: { single: 14600, married_jointly: 29200, married_separately: 14600, head_of_household: 21900 },
  };

  return stateDeductions[stateCode]?.[filingStatus] ?? 0;
}

export function calculateNetSalary(inputs: CalculatorInputs): CalculationResult {
  const { grossSalary, state, filingStatus, payFrequency, contributions } = inputs;

  // Pre-tax deductions (reduce taxable income)
  // 401(k) and HSA are pre-tax, Roth IRA is post-tax
  const preTaxDeductions = contributions.traditional401k + contributions.hsa;

  // Calculate federal taxable income
  const taxableIncomeForFederal = getFederalTaxableIncome(grossSalary, filingStatus, preTaxDeductions);

  // Calculate state taxable income
  const stateDeduction = getStateStandardDeduction(state, filingStatus);
  const taxableIncomeForState = Math.max(0, grossSalary - preTaxDeductions - stateDeduction);

  // Calculate federal taxes
  const federalIncomeTax = calculateFederalIncomeTax(grossSalary, filingStatus, preTaxDeductions);

  // Calculate state taxes using the appropriate calculator
  const stateCalculator = getStateCalculator(state);
  let stateIncomeTax = 0;
  let stateDisabilityInsurance = 0;

  if (stateCalculator) {
    stateIncomeTax = stateCalculator.calculateStateTax(taxableIncomeForState, filingStatus);
    stateDisabilityInsurance = stateCalculator.calculateSDI(grossSalary);
  }

  // Payroll taxes are calculated on gross income (not reduced by 401k/HSA)
  const payrollTaxes = calculatePayrollTaxes(grossSalary, filingStatus);

  const taxes = {
    federalIncomeTax,
    stateIncomeTax,
    socialSecurity: payrollTaxes.socialSecurity,
    medicare: payrollTaxes.medicare,
    additionalMedicare: payrollTaxes.additionalMedicare,
    stateDisabilityInsurance,
  };

  const totalTax =
    taxes.federalIncomeTax +
    taxes.stateIncomeTax +
    taxes.socialSecurity +
    taxes.medicare +
    taxes.additionalMedicare +
    taxes.stateDisabilityInsurance;

  // Total contributions include both pre-tax and post-tax
  const totalContributions =
    contributions.traditional401k +
    contributions.hsa +
    contributions.rothIRA;

  const netSalary = grossSalary - totalTax - totalContributions;
  const effectiveTaxRate = grossSalary > 0 ? totalTax / grossSalary : 0;

  const periodsPerYear = getPeriodsPerYear(payFrequency);

  return {
    grossSalary,
    taxableIncomeForFederal,
    taxableIncomeForState,
    taxes,
    totalTax,
    totalContributions,
    netSalary,
    effectiveTaxRate,
    perPeriod: {
      gross: grossSalary / periodsPerYear,
      net: netSalary / periodsPerYear,
      frequency: payFrequency,
    },
  };
}
