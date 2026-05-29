import type {
  CalculationResult,
  CalculatorInputs,
  ContributionLimits,
  CountryCalculator,
  MYBreakdown,
  MYCalculatorInputs,
  MYTaxBreakdown,
  RegionInfo,
} from "../types";
import { MY_CONFIG } from "./config";
import {
  calculateMYProgressiveTax,
  calculateMYResidentReliefs,
  MY_EPF_2025,
  MY_NON_RESIDENT_EMPLOYMENT_TAX_RATE,
  MY_PERKESO_2025,
  MY_PRS_RELIEF_LIMIT,
  MY_VOLUNTARY_EPF_ANNUAL_LIMIT,
} from "./constants/tax-brackets-2025";
import { getPeriodsPerYear, roundCurrency } from "../calculator-utils";

function roundUpRinggit(value: number): number {
  return Math.ceil(value);
}

function calculateMonthlyEpf({
  monthlySalary,
  age,
  epfCategory,
}: Pick<MYCalculatorInputs, "age" | "epfCategory"> & {
  monthlySalary: number;
}) {
  const isAge60AndAbove = age >= MY_EPF_2025.age60;

  if (epfCategory === "foreigner_post_1998") {
    return {
      employeeRate: MY_EPF_2025.foreignerPost1998.employee,
      employerRate: MY_EPF_2025.foreignerPost1998.employer,
      employee: roundUpRinggit(
        monthlySalary * MY_EPF_2025.foreignerPost1998.employee,
      ),
      employer: roundUpRinggit(
        monthlySalary * MY_EPF_2025.foreignerPost1998.employer,
      ),
    };
  }

  if (isAge60AndAbove) {
    if (epfCategory === "citizen") {
      const rates = MY_EPF_2025.citizen.age60AndAbove;
      return {
        employeeRate: rates.employee,
        employerRate: rates.employer,
        employee: 0,
        employer: roundUpRinggit(monthlySalary * rates.employer),
      };
    }

    const rates = MY_EPF_2025.prOrLegacy.age60AndAbove;
    const employerRate =
      monthlySalary <= MY_EPF_2025.monthlyWageThreshold
        ? rates.employerBelowOrEqual5000
        : rates.employerAbove5000;

    return {
      employeeRate: rates.employee,
      employerRate,
      employee: roundUpRinggit(monthlySalary * rates.employee),
      employer: roundUpRinggit(monthlySalary * employerRate),
    };
  }

  const rates =
    epfCategory === "citizen"
      ? MY_EPF_2025.citizen.below60
      : MY_EPF_2025.prOrLegacy.below60;
  const employerRate =
    monthlySalary <= MY_EPF_2025.monthlyWageThreshold
      ? rates.employerBelowOrEqual5000
      : rates.employerAbove5000;

  return {
    employeeRate: rates.employee,
    employerRate,
    employee: roundUpRinggit(monthlySalary * rates.employee),
    employer: roundUpRinggit(monthlySalary * employerRate),
  };
}

function calculateMYContributions(inputs: MYCalculatorInputs) {
  const monthlySalary = inputs.grossSalary / 12;
  const monthlyEpf = calculateMonthlyEpf({
    monthlySalary,
    age: inputs.age,
    epfCategory: inputs.epfCategory,
  });
  const epfEmployee = monthlyEpf.employee * 12;
  const epfEmployer = monthlyEpf.employer * 12;

  const perkesoBase = Math.min(
    monthlySalary,
    MY_PERKESO_2025.monthlyWageCeiling,
  );
  const socsoEmployee =
    roundCurrency(perkesoBase * MY_PERKESO_2025.socsoEmployeeRate) * 12;
  const eisEmployee =
    inputs.age >= MY_PERKESO_2025.eisMinAge &&
    inputs.age < MY_PERKESO_2025.eisMaxAge
      ? roundCurrency(perkesoBase * MY_PERKESO_2025.eisEmployeeRate) * 12
      : 0;

  return {
    epfEmployee,
    epfEmployer,
    epfEmployeeRate: monthlyEpf.employeeRate,
    epfEmployerRate: monthlyEpf.employerRate,
    socsoEmployee: roundCurrency(socsoEmployee),
    eisEmployee: roundCurrency(eisEmployee),
    perkesoMonthlyWageBase: perkesoBase,
    perkesoMonthlyWageCeiling: MY_PERKESO_2025.monthlyWageCeiling,
  };
}

export function calculateMY(inputs: MYCalculatorInputs): CalculationResult {
  const { grossSalary, payFrequency, residencyType, contributions, taxReliefs } =
    inputs;
  const statutoryContributions = calculateMYContributions(inputs);
  const voluntaryEpf = Math.min(
    Math.max(0, contributions.voluntaryEpfContribution || 0),
    MY_VOLUNTARY_EPF_ANNUAL_LIMIT,
  );
  const prsContribution = Math.min(
    Math.max(0, contributions.prsContribution || 0),
    MY_PRS_RELIEF_LIMIT,
  );
  const voluntaryContributions = voluntaryEpf + prsContribution;

  const isResident = residencyType === "resident";
  const reliefs = isResident
    ? calculateMYResidentReliefs({
        taxReliefs,
        epfEmployee: statutoryContributions.epfEmployee,
        voluntaryEpf,
        prsContribution,
        socsoEmployee: statutoryContributions.socsoEmployee,
      })
    : {
        individual: 0,
        spouse: 0,
        childUnder18: 0,
        childTertiary: 0,
        disabledIndividual: 0,
        epf: 0,
        prs: 0,
        socso: 0,
        lifestyle: 0,
        medical: 0,
        total: 0,
      };

  const taxableIncome = isResident
    ? Math.max(0, Math.floor(grossSalary - reliefs.total))
    : Math.max(0, grossSalary);

  const taxResult = isResident
    ? calculateMYProgressiveTax(taxableIncome)
    : {
        totalTax: Math.round(taxableIncome * MY_NON_RESIDENT_EMPLOYMENT_TAX_RATE),
        bracketTaxes: [
          {
            min: 0,
            max: Infinity,
            rate: MY_NON_RESIDENT_EMPLOYMENT_TAX_RATE,
            tax: Math.round(taxableIncome * MY_NON_RESIDENT_EMPLOYMENT_TAX_RATE),
          },
        ],
      };

  const taxes: MYTaxBreakdown = {
    totalIncomeTax: taxResult.totalTax,
    incomeTax: taxResult.totalTax,
    epfEmployee: statutoryContributions.epfEmployee,
    socsoEmployee: statutoryContributions.socsoEmployee,
    eisEmployee: statutoryContributions.eisEmployee,
  };

  const totalTax =
    taxes.incomeTax +
    taxes.epfEmployee +
    taxes.socsoEmployee +
    taxes.eisEmployee;
  const totalDeductions = totalTax + voluntaryContributions;
  const netSalary = grossSalary - totalDeductions;
  const effectiveTaxRate = grossSalary > 0 ? totalTax / grossSalary : 0;
  const periodsPerYear = getPeriodsPerYear(payFrequency);

  const breakdown: MYBreakdown = {
    type: "MY",
    grossIncome: grossSalary,
    isResident,
    epfCategory: inputs.epfCategory,
    age: inputs.age,
    taxableIncome,
    chargeableIncome: taxableIncome,
    taxReliefs: reliefs,
    bracketTaxes: taxResult.bracketTaxes,
    statutoryContributions,
    voluntaryContributions: {
      voluntaryEpf,
      prs: prsContribution,
      total: voluntaryContributions,
    },
  };

  return {
    country: "MY",
    currency: "MYR",
    grossSalary,
    taxableIncome,
    taxes,
    totalTax,
    totalDeductions,
    netSalary,
    effectiveTaxRate,
    perPeriod: {
      gross: grossSalary / periodsPerYear,
      net: netSalary / periodsPerYear,
      frequency: payFrequency,
    },
    breakdown,
  };
}

export const MYCalculator: CountryCalculator = {
  countryCode: "MY",
  config: MY_CONFIG,

  calculate(inputs: CalculatorInputs): CalculationResult {
    if (inputs.country !== "MY") {
      throw new Error("MYCalculator can only calculate MY inputs");
    }
    return calculateMY(inputs as MYCalculatorInputs);
  },

  getRegions(): RegionInfo[] {
    return [];
  },

  getContributionLimits(): ContributionLimits {
    return {
      voluntaryEpfContribution: {
        limit: MY_VOLUNTARY_EPF_ANNUAL_LIMIT,
        name: "Voluntary EPF",
        description:
          "Additional voluntary EPF contributions; tax relief still shares the EPF/life insurance limits.",
        preTax: true,
      },
      prsContribution: {
        limit: MY_PRS_RELIEF_LIMIT,
        name: "PRS Contribution",
        description: "Private Retirement Scheme contributions, restricted to RM3,000 relief.",
        preTax: true,
      },
    };
  },

  getDefaultInputs(): MYCalculatorInputs {
    return {
      country: "MY",
      grossSalary: 96_000,
      payFrequency: "monthly",
      residencyType: "resident",
      age: 30,
      epfCategory: "citizen",
      contributions: {
        voluntaryEpfContribution: 0,
        prsContribution: 0,
      },
      taxReliefs: {
        hasSpouseRelief: false,
        numberOfChildrenUnder18: 0,
        numberOfChildrenTertiary: 0,
        isDisabled: false,
        lifestyleRelief: 0,
        medicalRelief: 0,
      },
    };
  },
};
