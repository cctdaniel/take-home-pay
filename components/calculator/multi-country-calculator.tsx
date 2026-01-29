"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useMultiCountryCalculator } from "@/hooks/use-multi-country-calculator";
import type { CountryCode } from "@/lib/countries/types";
import { ContributionOptions } from "./contribution-options";
import { CountrySelector } from "./country-selector";
import { KRAdditionalReliefs } from "./kr-additional-reliefs";
import { KRTaxOptions } from "./kr-tax-options";
import { MultiCountryResults } from "./multi-country-results";
import { NLTaxOptions } from "./nl-tax-options";
import { SalaryInput } from "./salary-input";
import { SEOTaxInfo } from "./seo-tax-info";
import { SGAdditionalReliefs } from "./sg-additional-reliefs";
import { SGContributionOptions } from "./sg-contribution-options";
import { SGTaxOptions } from "./sg-tax-options";
import { USTaxOptions } from "./us-tax-options";

interface MultiCountryCalculatorProps {
  country: CountryCode;
}

export function MultiCountryCalculator({
  country,
}: MultiCountryCalculatorProps) {
  const {
    // Currency (derived from country)
    currency,

    // Common
    grossSalary,
    setGrossSalary,
    payFrequency,
    setPayFrequency,

    // US-specific
    usState,
    setUsState,
    filingStatus,
    setFilingStatus,
    traditional401k,
    setTraditional401k,
    rothIRA,
    setRothIRA,
    hsa,
    setHsa,
    hsaCoverageType,
    setHsaCoverageType,
    usLimits,

    // SG-specific
    residencyType,
    setResidencyType,
    age,
    setAge,
    voluntaryCpfTopUp,
    setVoluntaryCpfTopUp,
    srsContribution,
    setSrsContribution,
    sgTaxReliefs,
    setSgTaxReliefs,
    sgLimits,

    // KR-specific
    krResidencyType,
    setKrResidencyType,
    krTaxReliefs,
    setKrTaxReliefs,

    // NL-specific
    hasThirtyPercentRuling,
    setHasThirtyPercentRuling,

    // Results
    result,
  } = useMultiCountryCalculator(country);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Input Section */}
      <div className="lg:col-span-3 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Income Details</CardTitle>
            <CardDescription>
              Enter your annual gross salary and tax information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Country Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <CountrySelector value={country} />
              <SalaryInput
                value={grossSalary}
                onChange={setGrossSalary}
                currency={currency}
              />
            </div>

            <Separator />

            {/* Country-specific options */}
            {country === "US" && (
              <USTaxOptions
                state={usState}
                onStateChange={setUsState}
                filingStatus={filingStatus}
                onFilingStatusChange={setFilingStatus}
                payFrequency={payFrequency}
                onPayFrequencyChange={setPayFrequency}
              />
            )}

            {country === "SG" && (
              <SGTaxOptions
                residencyType={residencyType}
                onResidencyTypeChange={setResidencyType}
                age={age}
                onAgeChange={setAge}
                payFrequency={payFrequency}
                onPayFrequencyChange={setPayFrequency}
              />
            )}

            {country === "KR" && (
              <KRTaxOptions
                residencyType={krResidencyType}
                onResidencyTypeChange={setKrResidencyType}
                payFrequency={payFrequency}
                onPayFrequencyChange={setPayFrequency}
              />
            )}

            {country === "NL" && (
              <NLTaxOptions
                payFrequency={payFrequency}
                onPayFrequencyChange={setPayFrequency}
                hasThirtyPercentRuling={hasThirtyPercentRuling}
                onThirtyPercentRulingChange={setHasThirtyPercentRuling}
              />
            )}
          </CardContent>
        </Card>

        {/* Contributions Card - US and SG */}
        {(country === "US" || country === "SG") && (
          <Card>
            <CardHeader>
              <CardTitle>
                {country === "US" ? "Contributions" : "Voluntary Contributions"}
              </CardTitle>
              <CardDescription>
                {country === "US"
                  ? "Adjust your retirement and savings contributions"
                  : "Optional tax-saving contributions (CPF is mandatory)"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {country === "US" && (
                <ContributionOptions
                  traditional401k={traditional401k}
                  onTraditional401kChange={setTraditional401k}
                  traditional401kLimit={usLimits.traditional401k}
                  rothIRA={rothIRA}
                  onRothIRAChange={setRothIRA}
                  rothIRALimit={usLimits.rothIRA}
                  hsa={hsa}
                  onHsaChange={setHsa}
                  hsaLimit={usLimits.hsa}
                  hsaCoverageType={hsaCoverageType}
                  onHsaCoverageTypeChange={setHsaCoverageType}
                />
              )}

              {country === "SG" && (
                <div className="space-y-6">
                  <SGContributionOptions
                    voluntaryCpfTopUp={voluntaryCpfTopUp}
                    onVoluntaryCpfTopUpChange={setVoluntaryCpfTopUp}
                    voluntaryCpfTopUpLimit={sgLimits.voluntaryCpfTopUp}
                    srsContribution={srsContribution}
                    onSrsContributionChange={setSrsContribution}
                    srsContributionLimit={sgLimits.srsContribution}
                  />

                  <Separator />

                  <SGAdditionalReliefs
                    reliefs={sgTaxReliefs}
                    onChange={setSgTaxReliefs}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Tax Deductions & Credits Card for KR */}
        {country === "KR" && (
          <Card>
            <CardHeader>
              <CardTitle>Tax Deductions &amp; Credits</CardTitle>
              <CardDescription>
                Add dependents and children for additional tax savings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <KRAdditionalReliefs
                reliefs={krTaxReliefs}
                onChange={setKrTaxReliefs}
              />

              <Separator className="my-6" />

              <div className="bg-zinc-800/50 rounded-lg p-4">
                <p className="text-sm font-medium text-zinc-300 mb-2">
                  Social Insurance (4 Major Insurance)
                </p>
                <p className="text-xs text-zinc-400 mb-2">
                  Automatically deducted from your salary:
                </p>
                <ul className="text-xs text-zinc-500 space-y-1">
                  <li>National Pension: 4.5% (capped at ₩5.9M/month)</li>
                  <li>Health Insurance: 3.545%</li>
                  <li>Long-term Care: 12.95% of health insurance</li>
                  <li>Employment Insurance: 0.8%</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}

        {/* NL Deductions Info Card */}
        {country === "NL" && (
          <Card>
            <CardHeader>
              <CardTitle>Deductions</CardTitle>
              <CardDescription>
                Includes estimated general and labor tax credits
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-400">
                The Netherlands calculator applies estimated general and labor
                tax credits and supports the optional 30% ruling. Additional
                deductions are not modeled.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Results Section */}
      <div className="lg:col-span-2">
        <MultiCountryResults
          result={result}
          usState={country === "US" ? usState : undefined}
          usContributions={
            country === "US"
              ? {
                  traditional401k,
                  rothIRA,
                  hsa,
                }
              : undefined
          }
        />
      </div>

      {/* SEO Tax Info - only renders content for the active country */}
      <div className="lg:col-span-5">
        <SEOTaxInfo country={country} />
      </div>
    </div>
  );
}
