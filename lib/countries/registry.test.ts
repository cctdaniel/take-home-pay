import { describe, expect, it } from "vitest";
import {
  COUNTRY_CONFIGS,
  SUPPORTED_COUNTRIES,
  calculateNetSalary,
  getCountryCalculator,
  getDefaultInputs,
} from "./registry";
import type {
  CalculatorInputs,
  CalculationResult,
  ContributionLimits,
  CountryCode,
} from "./types";

function expectFiniteCurrency(value: number, label: string) {
  expect(Number.isFinite(value), label).toBe(true);
  expect(value, label).toBeGreaterThanOrEqual(0);
}

function expectCalculationResultInvariant(
  country: CountryCode,
  result: CalculationResult,
  options: { allowNegativeNet?: boolean } = {},
) {
  expect(result.country).toBe(country);
  expect(result.currency).toBe(COUNTRY_CONFIGS[country].currency.code);
  expect(result.perPeriod.frequency).toBeDefined();
  expect(result.breakdown).toBeDefined();
  expect(result.breakdown.type).toBe(country);

  expectFiniteCurrency(result.grossSalary, `${country} grossSalary`);
  expectFiniteCurrency(result.taxableIncome, `${country} taxableIncome`);
  expectFiniteCurrency(result.totalTax, `${country} totalTax`);
  expectFiniteCurrency(result.totalDeductions, `${country} totalDeductions`);
  expect(Number.isFinite(result.netSalary), `${country} netSalary`).toBe(true);
  if (!options.allowNegativeNet) {
    expect(result.netSalary, `${country} netSalary`).toBeGreaterThanOrEqual(0);
  }
  expectFiniteCurrency(result.perPeriod.gross, `${country} per-period gross`);
  expect(Number.isFinite(result.perPeriod.net), `${country} per-period net`).toBe(
    true,
  );
  if (!options.allowNegativeNet) {
    expect(
      result.perPeriod.net,
      `${country} per-period net`,
    ).toBeGreaterThanOrEqual(0);
  }

  expect(Number.isFinite(result.effectiveTaxRate)).toBe(true);
  expect(
    result.effectiveTaxRate,
    `${country} effectiveTaxRate`,
  ).toBeGreaterThanOrEqual(0);
  expect(result.effectiveTaxRate, `${country} effectiveTaxRate`).toBeLessThanOrEqual(
    1,
  );
  expect(result.totalDeductions).toBeGreaterThanOrEqual(result.totalTax);

  if (result.grossSalary > 0) {
    expect(result.effectiveTaxRate, `${country} effectiveTaxRate`).toBeCloseTo(
      result.totalTax / result.grossSalary,
      8,
    );
  } else {
    expect(result.effectiveTaxRate).toBe(0);
  }

  expect(result.perPeriod.gross).toBeGreaterThanOrEqual(result.perPeriod.net);
}

function zeroContributionValues(contributions: unknown) {
  if (!contributions || typeof contributions !== "object") {
    return {};
  }

  return Object.fromEntries(
    Object.entries(contributions).map(([key, value]) => [
      key,
      typeof value === "number" ? 0 : value,
    ]),
  );
}

function zeroNumericValues<T>(value: T): T {
  if (typeof value === "number") {
    return 0 as T;
  }

  if (Array.isArray(value)) {
    return value.map((item) => zeroNumericValues(item)) as T;
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [
        key,
        zeroNumericValues(entry),
      ]),
    ) as T;
  }

  return value;
}

function cloneWithGrossSalary(
  inputs: CalculatorInputs,
  grossSalary: number,
): CalculatorInputs {
  return {
    ...zeroNumericValues(inputs),
    grossSalary,
    contributions: zeroContributionValues(
      (inputs as { contributions?: unknown }).contributions,
    ),
  } as CalculatorInputs;
}

function cloneWithContributionLimits(
  inputs: CalculatorInputs,
  limits: ContributionLimits,
): CalculatorInputs {
  const currentContributions =
    ((inputs as { contributions?: unknown }).contributions as
      | Record<string, unknown>
      | undefined) ?? {};
  const cappedContributions = { ...currentContributions };

  for (const [key, limit] of Object.entries(limits)) {
    if (Number.isFinite(limit.limit)) {
      cappedContributions[key] = limit.limit;
    }
  }

  return {
    ...inputs,
    contributions: cappedContributions,
  } as CalculatorInputs;
}

function cloneWithOverLimitContributions(
  inputs: CalculatorInputs,
  limits: ContributionLimits,
): CalculatorInputs {
  const currentContributions =
    ((inputs as { contributions?: unknown }).contributions as
      | Record<string, unknown>
      | undefined) ?? {};
  const overLimitContributions = { ...currentContributions };

  for (const [key, limit] of Object.entries(limits)) {
    if (Number.isFinite(limit.limit) && limit.limit > 0) {
      overLimitContributions[key] = limit.limit * 10 + 1;
    }
  }

  return {
    ...inputs,
    contributions: overLimitContributions,
  } as CalculatorInputs;
}

function getVoluntaryContributionRows(result: CalculationResult) {
  const breakdown = result.breakdown as {
    voluntaryContributions?: unknown;
  };

  return Array.isArray(breakdown.voluntaryContributions)
    ? (breakdown.voluntaryContributions as Array<{
        key?: string;
        amount?: number;
        limit?: number;
      }>)
    : [];
}

describe("country registry calculator invariants", () => {
  it("has a unique calculator and matching config for every supported country", () => {
    expect(SUPPORTED_COUNTRIES.length).toBeGreaterThanOrEqual(50);
    expect(new Set(SUPPORTED_COUNTRIES).size).toBe(SUPPORTED_COUNTRIES.length);

    for (const country of SUPPORTED_COUNTRIES) {
      const calculator = getCountryCalculator(country);
      expect(calculator.countryCode).toBe(country);
      expect(calculator.config.code).toBe(country);
      expect(COUNTRY_CONFIGS[country].code).toBe(country);
      expect(calculator.config.currency.code).toBe(
        COUNTRY_CONFIGS[country].currency.code,
      );

      if (calculator.config.supportsRegions) {
        expect(calculator.getRegions().length).toBeGreaterThan(0);
      }
    }
  });

  it("calculates finite default salary results for every country", () => {
    for (const country of SUPPORTED_COUNTRIES) {
      const inputs = getDefaultInputs(country);
      expect(inputs.country).toBe(country);

      const result = calculateNetSalary(inputs);
      expectCalculationResultInvariant(country, result);
      expect(result.grossSalary).toBeGreaterThan(0);
      expect(result.grossSalary).toBeGreaterThanOrEqual(inputs.grossSalary);
    }
  });

  it("calculates finite high-income salary results for every country", () => {
    for (const country of SUPPORTED_COUNTRIES) {
      const defaultInputs = getDefaultInputs(country);
      const highIncomeInputs = {
        ...defaultInputs,
        grossSalary: Math.max(defaultInputs.grossSalary * 4, 1_000_000),
      } as CalculatorInputs;
      const result = calculateNetSalary(highIncomeInputs);

      expectCalculationResultInvariant(country, result);
      expect(result.grossSalary).toBeGreaterThanOrEqual(
        highIncomeInputs.grossSalary,
      );
    }
  });

  it("keeps zero salary calculations finite and non-negative for every country", () => {
    for (const country of SUPPORTED_COUNTRIES) {
      const zeroInputs = cloneWithGrossSalary(getDefaultInputs(country), 0);
      const result = calculateNetSalary(zeroInputs);

      expectCalculationResultInvariant(country, result);
      expect(result.grossSalary, `${country} zero grossSalary`).toBe(0);
      expect(result.taxableIncome, `${country} zero taxableIncome`).toBe(0);
      expect(result.totalTax, `${country} zero totalTax`).toBe(0);
      expect(result.totalDeductions, `${country} zero totalDeductions`).toBe(0);
      expect(result.netSalary, `${country} zero netSalary`).toBe(0);
    }
  });

  it("exposes finite contribution limits and calculates max modeled contributions", () => {
    for (const country of SUPPORTED_COUNTRIES) {
      const calculator = getCountryCalculator(country);
      const defaultInputs = getDefaultInputs(country);
      const limits = calculator.getContributionLimits(defaultInputs);

      for (const [key, limit] of Object.entries(limits)) {
        expect(limit.name, `${country} ${key} limit name`).not.toBe("");
        expect(limit.description, `${country} ${key} limit description`).not.toBe(
          "",
        );
        expect(limit.limit, `${country} ${key} limit`).toBeGreaterThanOrEqual(0);
      }

      const maxInputs = cloneWithContributionLimits(defaultInputs, limits);
      const result = calculateNetSalary(maxInputs);
      expectCalculationResultInvariant(country, result, {
        allowNegativeNet: true,
      });
    }
  });

  it("clamps over-limit modeled contributions in calculation results", () => {
    for (const country of SUPPORTED_COUNTRIES) {
      const calculator = getCountryCalculator(country);
      const defaultInputs = getDefaultInputs(country);
      const limits = calculator.getContributionLimits(defaultInputs);
      const finitePositiveLimits = Object.fromEntries(
        Object.entries(limits).filter(
          ([, limit]) => Number.isFinite(limit.limit) && limit.limit > 0,
        ),
      );

      if (Object.keys(finitePositiveLimits).length === 0) {
        continue;
      }

      const overLimitInputs = cloneWithOverLimitContributions(
        defaultInputs,
        finitePositiveLimits,
      );
      const result = calculateNetSalary(overLimitInputs);

      expectCalculationResultInvariant(country, result, {
        allowNegativeNet: true,
      });

      for (const contribution of getVoluntaryContributionRows(result)) {
        if (!contribution.key || !(contribution.key in finitePositiveLimits)) {
          continue;
        }

        const configuredLimit =
          finitePositiveLimits[contribution.key as keyof typeof finitePositiveLimits]
            .limit;

        expect(
          contribution.amount,
          `${country} ${contribution.key} calculated contribution`,
        ).toBeLessThanOrEqual(contribution.limit ?? configuredLimit);
        expect(
          contribution.limit,
          `${country} ${contribution.key} result limit`,
        ).toBeLessThanOrEqual(configuredLimit);
      }
    }
  });
});
