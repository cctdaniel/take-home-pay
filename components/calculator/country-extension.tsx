"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  calculateNetSalary,
  getCountryConfig,
  getDefaultInputs,
} from "@/lib/countries/registry";
import type { CountryCode } from "@/lib/countries/types";
import type {
  CalculationResult,
  CalculatorInputs,
  CurrencyCode,
  PayFrequency,
} from "@/lib/countries/types";
import type { ComponentType, ReactNode } from "react";
import { useCallback, useMemo, useState } from "react";
import { CountrySelector } from "./country-selector";
import { MultiCountryResults } from "./multi-country-results";
import { SalaryInput } from "./salary-input";

export interface CountryCalculatorExtensionProps {
  country: CountryCode;
}

export type CountryCalculatorExtensionComponent =
  ComponentType<CountryCalculatorExtensionProps>;

export function useCountryCalculatorExtension<
  TInputs extends CalculatorInputs,
>(country: CountryCode) {
  const [inputs, setInputsState] = useState<TInputs>(
    () => getDefaultInputs(country) as TInputs,
  );
  const [prevCountry, setPrevCountry] = useState(country);

  if (prevCountry !== country) {
    setPrevCountry(country);
    setInputsState(getDefaultInputs(country) as TInputs);
  }

  const setInputs = useCallback(
    (updater: TInputs | ((current: TInputs) => TInputs)) => {
      setInputsState((current) =>
        typeof updater === "function"
          ? (updater as (current: TInputs) => TInputs)(current)
          : updater,
      );
    },
    [],
  );

  const setGrossSalary = useCallback(
    (grossSalary: number) =>
      setInputs((current) => ({ ...current, grossSalary }) as TInputs),
    [setInputs],
  );

  const setPayFrequency = useCallback(
    (payFrequency: PayFrequency) =>
      setInputs((current) => ({ ...current, payFrequency }) as TInputs),
    [setInputs],
  );

  const currency = useMemo<CurrencyCode>(
    () => getCountryConfig(country).currency.code,
    [country],
  );
  const result = useMemo<CalculationResult>(
    () => calculateNetSalary(inputs),
    [inputs],
  );

  return {
    inputs,
    setInputs,
    currency,
    result,
    setGrossSalary,
    setPayFrequency,
  };
}

interface CountryCalculatorExtensionShellProps {
  country: CountryCode;
  currency: CurrencyCode;
  grossSalary: number;
  onGrossSalaryChange: (value: number) => void;
  result: CalculationResult;
  taxOptions?: ReactNode;
  contributions?: ReactNode;
  contributionsTitle?: string;
  contributionsDescription?: string;
  infoCard?: ReactNode;
  seoInfo?: ReactNode;
}

export function CountryCalculatorExtensionShell({
  country,
  currency,
  grossSalary,
  onGrossSalaryChange,
  result,
  taxOptions,
  contributions,
  contributionsTitle = "Voluntary Contributions",
  contributionsDescription = "Optional tax-saving contributions",
  infoCard,
  seoInfo,
}: CountryCalculatorExtensionShellProps) {
  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Income Details</CardTitle>
              <CardDescription>
                Enter your annual gross salary and tax information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <CountrySelector value={country} />
                <SalaryInput
                  value={grossSalary}
                  onChange={onGrossSalaryChange}
                  currency={currency}
                />
              </div>

              {taxOptions && (
                <>
                  <Separator />
                  {taxOptions}
                </>
              )}
            </CardContent>
          </Card>

          {contributions && (
            <Card>
              <CardHeader>
                <CardTitle>{contributionsTitle}</CardTitle>
                <CardDescription>{contributionsDescription}</CardDescription>
              </CardHeader>
              <CardContent>{contributions}</CardContent>
            </Card>
          )}

          {infoCard}
        </div>

        <div className="lg:col-span-2">
          <MultiCountryResults result={result} />
        </div>
      </div>

      {seoInfo}
    </>
  );
}
