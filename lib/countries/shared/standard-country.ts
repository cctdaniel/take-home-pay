import type {
  BaseCalculatorInputs,
  BaseTaxBreakdown,
  CalculationResult,
  CalculatorInputs,
  CountryCalculator,
  CountryCode,
  CountryConfig,
  CountrySpecificBreakdown,
  CurrencyCode,
  PayFrequency,
  RegionInfo,
  TaxBracket,
  TaxBreakdown,
} from "../types";

export interface StandardCountryContributionInputs {
  retirementContribution: number;
  qualifyingExpenses: number;
  educationExpenses?: number;
  medicalExpenses?: number;
  charitableDonations?: number;
  insurancePremiums?: number;
  housingExpenses?: number;
  tertiaryEducationExpenses?: number;
  carerWages?: number;
  unionFees?: number;
  sportsSubscriptions?: number;
  investmentSubscriptions?: number;
}

export interface StandardCountryCalculatorInputs<TCode extends string>
  extends Omit<BaseCalculatorInputs, "country"> {
  country: TCode;
  grossSalary: number;
  taxableNonCashBenefits?: number;
  payFrequency: PayFrequency;
  contributions: StandardCountryContributionInputs;
}

export interface StandardCountryTaxBreakdown<TCode extends string = string>
  extends BaseTaxBreakdown {
  type: TCode;
  incomeTax: number;
  socialContributions: number;
}

export interface StandardCountryContributionRule {
  name: string;
  calculateAmount?: (context: {
    grossSalary: number;
    inputs: StandardCountryCalculatorInputs<string>;
  }) => number;
  rate?: number;
  amount?: number;
  brackets?: TaxBracket[];
  cap?: number;
  exemption?: number;
  floor?: number;
  threshold?: number;
  preTax: boolean;
  base?: "gross" | "grossMinusPriorPreTaxContributions";
}

export interface StandardCountryPostTaxContributionRule {
  name: string;
  rate?: number;
  amount?: number;
  cap?: number;
  floor?: number;
  calculateAmount?: (context: {
    grossSalary: number;
    incomeTax: number;
    taxableIncome: number;
    priorContributions: Array<{
      name: string;
      amount: number;
      rate: number;
      cap?: number;
      preTax: boolean;
    }>;
    inputs: StandardCountryCalculatorInputs<string>;
  }) => number;
}

export interface StandardCountryDeductionRule {
  name: string;
  calculateAmount?: (context: {
    grossSalary: number;
    preTaxMandatoryContributions: number;
    inputs: StandardCountryCalculatorInputs<string>;
  }) => number;
  amount?: number;
  rate?: number;
  cap?: number;
  floor?: number;
  base?: "gross" | "grossMinusPreTaxMandatoryContributions";
  phaseOut?: {
    start: number;
    rate: number;
  };
}

export interface StandardCountryTaxCreditRule {
  name: string;
  amount?: number;
  refundable?: boolean;
  calculate?: (context: {
    grossSalary: number;
    taxableIncome: number;
    grossIncomeTax: number;
    inputs: StandardCountryCalculatorInputs<string>;
    mandatoryContributions: Array<{
      name: string;
      amount: number;
      rate: number;
      cap?: number;
      preTax: boolean;
    }>;
    voluntaryContributions: Array<{
      key: keyof StandardCountryContributionInputs;
      name: string;
      amount: number;
      limit: number;
      taxTreatment: StandardCountryVoluntaryContributionRule["taxTreatment"];
      taxBenefit: number;
      cashFlowTreatment: NonNullable<
        StandardCountryVoluntaryContributionRule["cashFlowTreatment"]
      >;
    }>;
  }) => number;
}

export interface StandardCountryTaxBracket extends TaxBracket {
  baseTax?: number;
  rateBase?: number;
}

export interface StandardCountryVoluntaryContributionRule {
  key: keyof StandardCountryContributionInputs;
  name: string;
  limit?: number;
  limitRate?: number;
  calculateLimit?: (context: {
    grossSalary: number;
    inputs?: unknown;
  }) => number;
  description: string;
  taxTreatment: "deduction" | "credit" | "none";
  cashFlowTreatment?: "deductFromNet" | "taxOnly";
  creditRate?: number;
  creditCap?: number;
  reducesMandatoryContributionBase?: boolean;
}

export interface StandardCountryTaxConfig<TCode extends string = string> {
  code: TCode;
  currency: CurrencyCode;
  taxYear: number;
  defaultSalary: number;
  incomeTaxName: string;
  brackets: StandardCountryTaxBracket[];
  taxBracketMode?: "marginal" | "fixedBase";
  roundIncomeTax?: (tax: number) => number;
  resolveBrackets?: (context: {
    grossSalary: number;
    taxableIncome: number;
    inputs: StandardCountryCalculatorInputs<TCode>;
  }) => StandardCountryTaxBracket[];
  personalAllowance?: number;
  resolvePersonalAllowance?: (context: {
    grossSalary: number;
    inputs: StandardCountryCalculatorInputs<TCode>;
  }) => number;
  deductions?: StandardCountryDeductionRule[];
  minimumTaxableDeduction?: StandardCountryDeductionRule;
  taxCredits?: StandardCountryTaxCreditRule[];
  socialContributions?: StandardCountryContributionRule[];
  resolveSocialContributions?: (context: {
    grossSalary: number;
    inputs: StandardCountryCalculatorInputs<TCode>;
  }) => StandardCountryContributionRule[];
  postTaxSocialContributions?: StandardCountryPostTaxContributionRule[];
  voluntaryContributions?: StandardCountryVoluntaryContributionRule[];
  assumptions: string[];
  modeledExclusions?: string[];
  sourceUrls: string[];
}

export interface StandardCountryBreakdown<TCode extends string = string> {
  type: TCode;
  grossIncome: number;
  taxableNonCashBenefits?: number;
  taxableGrossIncome?: number;
  taxableIncome: number;
  incomeTaxName: string;
  personalAllowance: number;
  personalAllowanceName?: string;
  deductions: Array<{
    name: string;
    amount: number;
  }>;
  mandatoryContributions: Array<{
    name: string;
    amount: number;
    rate: number;
    cap?: number;
    preTax: boolean;
  }>;
  voluntaryContributions: Array<{
    key: keyof StandardCountryContributionInputs;
    name: string;
    amount: number;
    limit: number;
    taxTreatment: StandardCountryVoluntaryContributionRule["taxTreatment"];
    taxBenefit: number;
    cashFlowTreatment: NonNullable<
      StandardCountryVoluntaryContributionRule["cashFlowTreatment"]
    >;
  }>;
  taxCredits: Array<{
    name: string;
    amount: number;
  }>;
  bracketTaxes: Array<{
    min: number;
    max: number;
    rate: number;
    tax: number;
  }>;
  assumptions: string[];
  modeledExclusions: string[];
  sourceUrls: string[];
}

export type AnyStandardCountryTaxBreakdown = Extract<
  TaxBreakdown,
  { socialContributions: number }
>;

export type AnyStandardCountryBreakdown = Extract<
  CountrySpecificBreakdown,
  { mandatoryContributions: StandardCountryBreakdown["mandatoryContributions"] }
>;

export function isStandardCountryTaxBreakdown(
  taxes: TaxBreakdown,
): taxes is AnyStandardCountryTaxBreakdown {
  return (
    "type" in taxes &&
    "incomeTax" in taxes &&
    "socialContributions" in taxes
  );
}

export function isStandardCountryBreakdown(
  breakdown: CountrySpecificBreakdown,
): breakdown is AnyStandardCountryBreakdown {
  return (
    "type" in breakdown &&
    "incomeTaxName" in breakdown &&
    "mandatoryContributions" in breakdown &&
    "sourceUrls" in breakdown
  );
}

function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}

function clampAmount(value: number, min = 0, max = Infinity): number {
  if (!Number.isFinite(value)) {
    return min;
  }

  return Math.min(Math.max(value, min), max);
}

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

function calculateRuleAmount(
  grossSalary: number,
  rule: StandardCountryDeductionRule,
  preTaxMandatoryContributions = 0,
  inputs?: StandardCountryCalculatorInputs<string>,
): number {
  if (rule.calculateAmount) {
    return roundCurrency(
      clampAmount(
        rule.calculateAmount({
          grossSalary,
          preTaxMandatoryContributions,
          inputs:
            inputs ??
            ({
              country: "",
              grossSalary,
              payFrequency: "annual",
              contributions: {
                retirementContribution: 0,
                qualifyingExpenses: 0,
              },
            } as StandardCountryCalculatorInputs<string>),
        }),
        rule.floor ?? 0,
        rule.cap,
      ),
    );
  }

  const calculationBase =
    rule.base === "grossMinusPreTaxMandatoryContributions"
      ? Math.max(0, grossSalary - preTaxMandatoryContributions)
      : grossSalary;
  const ratedAmount = rule.rate ? calculationBase * rule.rate : 0;
  const fixedAmount = rule.amount ?? 0;
  const rawAmount = fixedAmount + ratedAmount;
  const phaseOutAmount = rule.phaseOut
    ? Math.max(0, grossSalary - rule.phaseOut.start) * rule.phaseOut.rate
    : 0;
  return roundCurrency(
    clampAmount(rawAmount - phaseOutAmount, rule.floor ?? 0, rule.cap),
  );
}

function calculateContributionAmount(
  grossSalary: number,
  rule: StandardCountryContributionRule,
  priorPreTaxContributions = 0,
  voluntaryContributionBaseReduction = 0,
  inputs?: StandardCountryCalculatorInputs<string>,
): number {
  if (rule.calculateAmount) {
    return roundCurrency(
      clampAmount(
        rule.calculateAmount({
          grossSalary,
          inputs:
            inputs ??
            ({
              country: "",
              grossSalary,
              payFrequency: "annual",
              contributions: {
                retirementContribution: 0,
                qualifyingExpenses: 0,
              },
            } as StandardCountryCalculatorInputs<string>),
        }),
        rule.floor ?? 0,
        rule.cap,
      ),
    );
  }

  const baseBeforeVoluntaryReduction =
    rule.base === "grossMinusPriorPreTaxContributions"
      ? Math.max(0, grossSalary - priorPreTaxContributions)
      : grossSalary;
  const base = Math.max(
    0,
    baseBeforeVoluntaryReduction - voluntaryContributionBaseReduction,
  );
  if (rule.threshold !== undefined && base < rule.threshold) {
    return 0;
  }

  const contributionBase = clampAmount(
    Math.max(0, base - (rule.exemption ?? 0)),
    rule.floor ?? 0,
    rule.cap,
  );
  const bracketAmount = rule.brackets
    ? calculateBracketTax(contributionBase, rule.brackets).total
    : 0;
  const ratedAmount = rule.rate ? contributionBase * rule.rate : 0;

  return roundCurrency((rule.amount ?? 0) + bracketAmount + ratedAmount);
}

function calculatePostTaxContributionAmount(
  grossSalary: number,
  incomeTax: number,
  taxableIncome: number,
  priorContributions: StandardCountryBreakdown["mandatoryContributions"],
  inputs: StandardCountryCalculatorInputs<string>,
  rule: StandardCountryPostTaxContributionRule,
): number {
  if (rule.calculateAmount) {
    return roundCurrency(
      clampAmount(
        rule.calculateAmount({
          grossSalary,
          incomeTax,
          taxableIncome,
          priorContributions,
          inputs,
        }),
        rule.floor ?? 0,
        rule.cap,
      ),
    );
  }

  return roundCurrency(
    clampAmount(
      (rule.amount ?? 0) + grossSalary * (rule.rate ?? 0),
      rule.floor ?? 0,
      rule.cap,
    ),
  );
}

function calculateBracketTax(
  taxableIncome: number,
  brackets: StandardCountryTaxBracket[],
  mode: StandardCountryTaxConfig["taxBracketMode"] = "marginal",
): {
  total: number;
  bracketTaxes: StandardCountryBreakdown["bracketTaxes"];
} {
  if (mode === "fixedBase") {
    const bracket = brackets.find(
      (candidate) =>
        taxableIncome > candidate.min && taxableIncome <= candidate.max,
    );

    if (!bracket) {
      return { total: 0, bracketTaxes: [] };
    }

    const tax = roundCurrency(
      (bracket.baseTax ?? 0) +
        Math.max(0, taxableIncome - (bracket.rateBase ?? bracket.min)) *
          bracket.rate,
    );

    return {
      total: tax,
      bracketTaxes:
        tax > 0
          ? [
              {
                min: bracket.min,
                max: bracket.max,
                rate: bracket.rate,
                tax,
              },
            ]
          : [],
    };
  }

  let total = 0;
  const bracketTaxes: StandardCountryBreakdown["bracketTaxes"] = [];

  for (const bracket of brackets) {
    if (taxableIncome <= bracket.min) {
      continue;
    }

    const upper = Number.isFinite(bracket.max) ? bracket.max : taxableIncome;
    const amountInBracket = Math.min(taxableIncome, upper) - bracket.min;

    if (amountInBracket <= 0) {
      continue;
    }

    const tax = roundCurrency(amountInBracket * bracket.rate);
    total += tax;
    bracketTaxes.push({
      min: bracket.min,
      max: bracket.max,
      rate: bracket.rate,
      tax,
    });
  }

  return { total: roundCurrency(total), bracketTaxes };
}

function getVoluntaryContributionLimit(
  grossSalary: number,
  rule: StandardCountryVoluntaryContributionRule,
  inputs?: unknown,
): number {
  if (rule.calculateLimit) {
    return roundCurrency(
      clampAmount(rule.calculateLimit({ grossSalary, inputs })),
    );
  }

  const fixedLimit = rule.limit ?? Infinity;

  return roundCurrency(
    rule.limitRate === undefined
      ? fixedLimit
      : Math.min(fixedLimit, grossSalary * rule.limitRate),
  );
}

export function calculateStandardCountry<TCode extends CountryCode>(
  inputs: StandardCountryCalculatorInputs<TCode>,
  taxConfig: StandardCountryTaxConfig<TCode>,
): CalculationResult {
  const cashGrossSalary = Math.max(0, inputs.grossSalary);
  const taxableNonCashBenefits = roundCurrency(
    Math.max(0, inputs.taxableNonCashBenefits ?? 0),
  );
  const grossSalary = roundCurrency(
    cashGrossSalary + taxableNonCashBenefits,
  );
  const voluntaryContributions = (taxConfig.voluntaryContributions ?? []).map(
    (rule) => {
      const limit = getVoluntaryContributionLimit(grossSalary, rule, inputs);
      const amount = roundCurrency(
        clampAmount(inputs.contributions[rule.key] ?? 0, 0, limit),
      );
      const taxBenefit =
        rule.taxTreatment === "credit"
          ? roundCurrency(
              clampAmount(
                amount * (rule.creditRate ?? 0),
                0,
                rule.creditCap ?? Infinity,
              ),
            )
          : 0;

      return {
        key: rule.key,
        name: rule.name,
        amount,
        limit,
        taxTreatment: rule.taxTreatment,
        taxBenefit,
        cashFlowTreatment: rule.cashFlowTreatment ?? "deductFromNet",
        reducesMandatoryContributionBase:
          rule.reducesMandatoryContributionBase ?? false,
      };
    },
  );
  const preTaxVoluntaryContributions = voluntaryContributions
    .filter((contribution) => contribution.taxTreatment === "deduction")
    .reduce((sum, contribution) => sum + contribution.amount, 0);
  const mandatoryContributionBaseReduction = voluntaryContributions
    .filter((contribution) => contribution.reducesMandatoryContributionBase)
    .reduce((sum, contribution) => sum + contribution.amount, 0);
  const totalVoluntaryContributions = roundCurrency(
    voluntaryContributions
      .filter((contribution) => contribution.cashFlowTreatment !== "taxOnly")
      .reduce((sum, contribution) => sum + contribution.amount, 0),
  );

  const socialContributionRules =
    taxConfig.resolveSocialContributions?.({ grossSalary, inputs }) ??
    taxConfig.socialContributions ??
    [];
  let priorPreTaxContributions = 0;
  let mandatoryContributions = socialContributionRules.map((rule) => {
    const amount = calculateContributionAmount(
      grossSalary,
      rule,
      priorPreTaxContributions,
      mandatoryContributionBaseReduction,
      inputs,
    );
    if (rule.preTax) {
      priorPreTaxContributions += amount;
    }

    return {
      name: rule.name,
      amount,
      rate: rule.rate ?? 0,
      cap: rule.cap,
      preTax: rule.preTax,
    };
  });
  const preTaxMandatoryContributions = mandatoryContributions
    .filter((contribution) => contribution.preTax)
    .reduce((sum, contribution) => sum + contribution.amount, 0);
  const deductions = (taxConfig.deductions ?? []).map((rule) => ({
    name: rule.name,
    amount: calculateRuleAmount(
      grossSalary,
      rule,
      preTaxMandatoryContributions,
      inputs,
    ),
  }));
  const totalStandardDeductions = roundCurrency(
    deductions.reduce((sum, deduction) => sum + deduction.amount, 0),
  );

  const personalAllowance =
    taxConfig.resolvePersonalAllowance?.({ grossSalary, inputs }) ??
    taxConfig.personalAllowance ??
    0;
  const legalTaxableDeductions = roundCurrency(
    personalAllowance +
      totalStandardDeductions +
      preTaxMandatoryContributions +
      preTaxVoluntaryContributions,
  );
  const minimumTaxableDeduction = taxConfig.minimumTaxableDeduction
    ? calculateRuleAmount(
        grossSalary,
        taxConfig.minimumTaxableDeduction,
        preTaxMandatoryContributions,
        inputs,
      )
    : 0;
  const minimumDeductionTopUp = roundCurrency(
    Math.max(0, minimumTaxableDeduction - legalTaxableDeductions),
  );
  const taxableDeductions = roundCurrency(
    legalTaxableDeductions + minimumDeductionTopUp,
  );
  const taxableDeductionRows =
    minimumDeductionTopUp > 0 && taxConfig.minimumTaxableDeduction
      ? [
          ...deductions,
          {
            name: taxConfig.minimumTaxableDeduction.name,
            amount: minimumDeductionTopUp,
          },
        ]
      : deductions;
  const taxableIncome = roundCurrency(
    Math.max(0, grossSalary - taxableDeductions),
  );

  const incomeTaxBrackets =
    taxConfig.resolveBrackets?.({ grossSalary, taxableIncome, inputs }) ??
    taxConfig.brackets;
  const {
    total: calculatedGrossIncomeTax,
    bracketTaxes: calculatedBracketTaxes,
  } = calculateBracketTax(
    taxableIncome,
    incomeTaxBrackets,
    taxConfig.taxBracketMode,
  );
  const grossIncomeTax = taxConfig.roundIncomeTax
    ? taxConfig.roundIncomeTax(calculatedGrossIncomeTax)
    : calculatedGrossIncomeTax;
  const bracketTaxes =
    taxConfig.roundIncomeTax && calculatedBracketTaxes.length === 1
      ? [{ ...calculatedBracketTaxes[0], tax: grossIncomeTax }]
      : calculatedBracketTaxes;
  const configuredTaxCredits = (taxConfig.taxCredits ?? [])
    .map((credit) => ({
      name: credit.name,
      amount: roundCurrency(
        credit.calculate
          ? credit.calculate({
              grossSalary,
              taxableIncome,
              grossIncomeTax,
              inputs,
              mandatoryContributions,
              voluntaryContributions,
            })
          : credit.amount ?? 0,
      ),
      refundable: credit.refundable ?? false,
    }))
    .filter((credit) => credit.amount > 0);
  const voluntaryTaxCredits = voluntaryContributions
    .filter((contribution) => contribution.taxBenefit > 0)
    .map((contribution) => ({
      name: contribution.name.toLowerCase().includes("credit")
        ? contribution.name
        : `${contribution.name} credit`,
      amount: contribution.taxBenefit,
      refundable: false,
    }));
  const taxCredits = [...configuredTaxCredits, ...voluntaryTaxCredits];
  const totalNonRefundableTaxCredits = roundCurrency(
    taxCredits
      .filter((credit) => !credit.refundable)
      .reduce((sum, credit) => sum + credit.amount, 0),
  );
  const totalRefundableTaxCredits = roundCurrency(
    taxCredits
      .filter((credit) => credit.refundable)
      .reduce((sum, credit) => sum + credit.amount, 0),
  );
  const incomeTaxAfterNonRefundableCredits = roundCurrency(
    Math.max(0, grossIncomeTax - totalNonRefundableTaxCredits),
  );
  const incomeTax = roundCurrency(
    Math.max(
      0,
      incomeTaxAfterNonRefundableCredits - totalRefundableTaxCredits,
    ),
  );
  const refundableTaxCreditOffset = roundCurrency(
    Math.max(0, totalRefundableTaxCredits - incomeTaxAfterNonRefundableCredits),
  );
  const postTaxMandatoryContributions = (
    taxConfig.postTaxSocialContributions ?? []
  )
    .map((rule) => ({
      name: rule.name,
      amount: calculatePostTaxContributionAmount(
        grossSalary,
        incomeTax,
        taxableIncome,
        mandatoryContributions,
        inputs,
        rule,
      ),
      rate: rule.rate ?? 0,
      cap: rule.cap,
      preTax: false,
    }))
    .filter((contribution) => contribution.amount > 0);
  mandatoryContributions = [
    ...mandatoryContributions,
    ...postTaxMandatoryContributions,
  ];
  const totalMandatoryContributions = roundCurrency(
    mandatoryContributions.reduce(
      (sum, contribution) => sum + contribution.amount,
      0,
    ),
  );
  const totalTax = roundCurrency(
    incomeTax + totalMandatoryContributions - refundableTaxCreditOffset,
  );
  const totalDeductions = roundCurrency(totalTax + totalVoluntaryContributions);
  const netSalary = roundCurrency(cashGrossSalary - totalDeductions);
  const periodsPerYear = getPeriodsPerYear(inputs.payFrequency);

  const taxes: StandardCountryTaxBreakdown<TCode> = {
    type: taxConfig.code,
    totalIncomeTax: incomeTax,
    incomeTax,
    socialContributions: totalMandatoryContributions,
  };
  const breakdown: StandardCountryBreakdown<TCode> = {
    type: taxConfig.code,
    grossIncome: cashGrossSalary,
    taxableNonCashBenefits,
    taxableGrossIncome: grossSalary,
    taxableIncome,
    incomeTaxName: taxConfig.incomeTaxName,
    personalAllowance,
    deductions: taxableDeductionRows,
    mandatoryContributions,
    voluntaryContributions,
    taxCredits: taxCredits.map(({ name, amount }) => ({ name, amount })),
    bracketTaxes,
    assumptions: taxConfig.assumptions,
    modeledExclusions: taxConfig.modeledExclusions ?? [],
    sourceUrls: taxConfig.sourceUrls,
  };

  return {
    country: taxConfig.code,
    currency: taxConfig.currency,
    grossSalary: cashGrossSalary,
    taxableIncome,
    taxes: taxes as TaxBreakdown,
    totalTax,
    totalDeductions,
    netSalary,
    effectiveTaxRate: cashGrossSalary > 0 ? totalTax / cashGrossSalary : 0,
    perPeriod: {
      gross: cashGrossSalary / periodsPerYear,
      net: netSalary / periodsPerYear,
      frequency: inputs.payFrequency,
    },
    breakdown: breakdown as CountrySpecificBreakdown,
  };
}

export function createStandardCountryCalculator<TCode extends CountryCode>(
  config: CountryConfig & { code: TCode },
  taxConfig: StandardCountryTaxConfig<TCode>,
): CountryCalculator {
  return {
    countryCode: config.code,
    config,

    calculate(inputs: CalculatorInputs): CalculationResult {
      if (inputs.country !== config.code) {
        throw new Error(
          `${config.code}Calculator can only calculate ${config.code} inputs`,
        );
      }

      return calculateStandardCountry(
        inputs as StandardCountryCalculatorInputs<TCode>,
        taxConfig,
      );
    },

    getRegions(): RegionInfo[] {
      return [];
    },

    getContributionLimits(inputs?: Partial<CalculatorInputs>) {
      const grossSalary = inputs?.grossSalary ?? taxConfig.defaultSalary;

      return Object.fromEntries(
        (taxConfig.voluntaryContributions ?? []).map((contribution) => [
          contribution.key,
          {
            limit: getVoluntaryContributionLimit(
              grossSalary,
              contribution,
              inputs,
            ),
            name: contribution.name,
            description: contribution.description,
            preTax: contribution.taxTreatment === "deduction",
          },
        ]),
      );
    },

    getDefaultInputs(): CalculatorInputs {
      return {
        country: config.code,
        grossSalary: taxConfig.defaultSalary,
        taxableNonCashBenefits: 0,
        payFrequency: "monthly",
      contributions: {
        retirementContribution: 0,
        qualifyingExpenses: 0,
      },
    } as CalculatorInputs;
  },
  };
}
