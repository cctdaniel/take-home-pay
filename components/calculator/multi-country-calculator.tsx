"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SalaryInput } from "./salary-input";
import { CountrySelector } from "./country-selector";
import { USTaxOptions } from "./us-tax-options";
import { SGTaxOptions } from "./sg-tax-options";
import { ContributionOptions } from "./contribution-options";
import { SGContributionOptions } from "./sg-contribution-options";
import { MultiCountryResults } from "./multi-country-results";
import { useMultiCountryCalculator } from "@/hooks/use-multi-country-calculator";

export function MultiCountryCalculator() {
  const {
    // Country
    country,
    setCountry,
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
    sgLimits,

    // Results
    result,
  } = useMultiCountryCalculator();

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
              <CountrySelector value={country} onChange={setCountry} />
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
          </CardContent>
        </Card>

        {/* Contributions Card */}
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
              <SGContributionOptions
                voluntaryCpfTopUp={voluntaryCpfTopUp}
                onVoluntaryCpfTopUpChange={setVoluntaryCpfTopUp}
                voluntaryCpfTopUpLimit={sgLimits.voluntaryCpfTopUp}
                srsContribution={srsContribution}
                onSrsContributionChange={setSrsContribution}
                srsContributionLimit={sgLimits.srsContribution}
              />
            )}
          </CardContent>
        </Card>
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
    </div>
  );
}
