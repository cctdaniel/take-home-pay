"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ContributionSlider } from "@/components/ui/contribution-slider";
import { Separator } from "@/components/ui/separator";
import { useMultiCountryCalculator } from "@/hooks/use-multi-country-calculator";
import { formatCurrency } from "@/lib/format";
import type { CountryCode } from "@/lib/countries/types";
import { AUTaxOptions } from "./au-tax-options";
import { DETaxOptions } from "./de-tax-options";
import { HKAdditionalReliefs } from "./hk-additional-reliefs";
import { HKTaxOptions } from "./hk-tax-options";
import { IDContributionOptions } from "./id-contribution-options";
import { IDTaxOptions } from "./id-tax-options";
import { PTTaxOptions } from "./pt-tax-options";
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
import { THAdditionalReliefs } from "./th-additional-reliefs";
import { THContributionOptions } from "./th-contribution-options";
import { THTaxOptions } from "./th-tax-options";
import { UKTaxOptions } from "./uk-tax-options";
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
    hasYoungChildren,
    setHasYoungChildren,

    // AU-specific
    auResidencyType,
    setAuResidencyType,
    hasPrivateHealthInsurance,
    setHasPrivateHealthInsurance,

    // PT-specific
    ptResidencyType,
    setPtResidencyType,
    ptFilingStatus,
    setPtFilingStatus,
    ptNumberOfDependents,
    setPtNumberOfDependents,
    ptAge,
    setPtAge,
    ptPprContribution,
    setPtPprContribution,
    ptLimits,

    // TH-specific
    thResidencyType,
    setThResidencyType,
    thTaxReliefs,
    setThTaxReliefs,
    thProvidentFund,
    setThProvidentFund,
    thRmf,
    setThRmf,
    thSsf,
    setThSsf,
    thEsg,
    setThEsg,
    thNsf,
    setThNsf,
    thLimits,

    // HK-specific
    hkResidencyType,
    setHkResidencyType,
    hkTaxReliefs,
    setHkTaxReliefs,
    hkVoluntaryContributions,
    setHkVoluntaryContributions,
    hkLimits,

    // ID-specific
    idTaxReliefs,
    setIdTaxReliefs,
    idDplkContribution,
    setIdDplkContribution,
    idZakatContribution,
    setIdZakatContribution,

    // DE-specific
    deState,
    setDeState,
    deIsMarried,
    setDeIsMarried,
    deIsChurchMember,
    setDeIsChurchMember,
    deIsChildless,
    setDeIsChildless,

    // UK-specific
    ukResidencyType,
    setUkResidencyType,
    ukRegion,
    setUkRegion,
    ukPensionContribution,
    setUkPensionContribution,

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
                hasYoungChildren={hasYoungChildren}
                onYoungChildrenChange={setHasYoungChildren}
              />
            )}

            {country === "AU" && (
              <AUTaxOptions
                payFrequency={payFrequency}
                onPayFrequencyChange={setPayFrequency}
                residencyType={auResidencyType}
                onResidencyTypeChange={setAuResidencyType}
                hasPrivateHealthInsurance={hasPrivateHealthInsurance}
                onPrivateHealthInsuranceChange={setHasPrivateHealthInsurance}
              />
            )}

            {country === "PT" && (
              <PTTaxOptions
                payFrequency={payFrequency}
                onPayFrequencyChange={setPayFrequency}
                residencyType={ptResidencyType}
                onResidencyTypeChange={setPtResidencyType}
                filingStatus={ptFilingStatus}
                onFilingStatusChange={setPtFilingStatus}
                numberOfDependents={ptNumberOfDependents}
                onNumberOfDependentsChange={setPtNumberOfDependents}
                age={ptAge}
                onAgeChange={setPtAge}
              />
            )}

            {country === "TH" && (
              <THTaxOptions
                residencyType={thResidencyType}
                onResidencyTypeChange={setThResidencyType}
                payFrequency={payFrequency}
                onPayFrequencyChange={setPayFrequency}
              />
            )}

            {country === "HK" && (
              <HKTaxOptions
                residencyType={hkResidencyType}
                onResidencyTypeChange={setHkResidencyType}
                payFrequency={payFrequency}
                onPayFrequencyChange={setPayFrequency}
              />
            )}

            {country === "ID" && (
              <IDTaxOptions
                payFrequency={payFrequency}
                onPayFrequencyChange={setPayFrequency}
                maritalStatus={idTaxReliefs.maritalStatus}
                onMaritalStatusChange={(value) =>
                  setIdTaxReliefs({
                    ...idTaxReliefs,
                    maritalStatus: value,
                    spouseIncomeCombined:
                      value === "married" && idTaxReliefs.spouseIncomeCombined,
                  })
                }
                numberOfDependents={idTaxReliefs.numberOfDependents}
                onNumberOfDependentsChange={(value) =>
                  setIdTaxReliefs({
                    ...idTaxReliefs,
                    numberOfDependents: value,
                  })
                }
                spouseIncomeCombined={idTaxReliefs.spouseIncomeCombined}
                onSpouseIncomeCombinedChange={(value) =>
                  setIdTaxReliefs({
                    ...idTaxReliefs,
                    spouseIncomeCombined: value,
                  })
                }
              />
            )}

            {country === "DE" && (
              <DETaxOptions
                payFrequency={payFrequency}
                onPayFrequencyChange={setPayFrequency}
                state={deState}
                onStateChange={setDeState}
                isMarried={deIsMarried}
                onMarriedChange={setDeIsMarried}
                isChurchMember={deIsChurchMember}
                onChurchMemberChange={setDeIsChurchMember}
                isChildless={deIsChildless}
                onChildlessChange={setDeIsChildless}
              />
            )}
            {country === "UK" && (
              <UKTaxOptions
                payFrequency={payFrequency}
                onPayFrequencyChange={setPayFrequency}
                residencyType={ukResidencyType}
                onResidencyTypeChange={setUkResidencyType}
                region={ukRegion}
                onRegionChange={setUkRegion}
              />
            )}
          </CardContent>
        </Card>

        {/* Contributions Card - US, SG, PT, TH, HK, ID, DE, and UK */}
        {(country === "US" || country === "SG" || country === "PT" || country === "TH" || country === "HK" || country === "ID" || country === "DE" || country === "UK") && (
          <Card>
            <CardHeader>
              <CardTitle>
                {country === "US" ? "Contributions" : "Voluntary Contributions"}
              </CardTitle>
              <CardDescription>
                {country === "US"
                  ? "Adjust your retirement and savings contributions"
                  : country === "PT"
                    ? "Optional tax-saving contributions to PPR (Retirement Savings Plan)"
                    : country === "SG"
                      ? "Optional tax-saving contributions (CPF is mandatory)"
                      : country === "HK"
                        ? "Optional MPF/annuity contributions (tax deductible)"
                        : country === "ID"
                          ? "Optional tax-saving contributions (BPJS is mandatory)"
                          : country === "UK"
                            ? "Optional pension contributions (with tax relief)"
                            : "Optional tax-saving contributions (Social Security is mandatory)"}
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

              {country === "PT" && (
                <div className="space-y-6">
                  <ContributionSlider
                    label="PPR Contribution (Retirement Savings Plan)"
                    description={`20% tax credit on contributions - age-based limit: €${ptLimits.pprMaxContribution.toLocaleString()} max (€${ptLimits.pprMaxTaxCredit.toLocaleString()} tax credit)`}
                    value={ptPprContribution}
                    onChange={setPtPprContribution}
                    max={ptLimits.pprMaxContribution}
                    currency="EUR"
                  />
                  <p className="text-xs text-zinc-500 bg-zinc-800/50 rounded p-2">
                    <span className="text-emerald-400">Tip:</span> PPR (Plano de Poupança Reforma) 
                    contributions qualify for a 20% tax credit. Limits vary by age: 
                    Under 35: €2,000, 35-50: €1,750, Over 50: €1,500.
                  </p>
                </div>
              )}

              {country === "TH" && (
                <div className="space-y-6">
                  <THContributionOptions
                    providentFund={thProvidentFund}
                    onProvidentFundChange={setThProvidentFund}
                    providentFundLimit={thLimits.providentFund}
                    rmf={thRmf}
                    onRmfChange={setThRmf}
                    rmfLimit={thLimits.rmf}
                    ssf={thSsf}
                    onSsfChange={setThSsf}
                    ssfLimit={thLimits.ssf}
                    esg={thEsg}
                    onEsgChange={setThEsg}
                    esgLimit={thLimits.esg}
                    nsf={thNsf}
                    onNsfChange={setThNsf}
                    nsfLimit={thLimits.nsf}
                  />

                  <Separator />

                  <THAdditionalReliefs
                    reliefs={thTaxReliefs}
                    onChange={setThTaxReliefs}
                  />
                </div>
              )}

              {country === "HK" && (
                <div className="space-y-6">
                  <ContributionSlider
                    label="Tax-Deductible Voluntary MPF & Annuity Contributions"
                    description={`Combined cap: HK$${hkLimits.taxDeductibleVoluntaryContributions.toLocaleString()}`}
                    value={hkVoluntaryContributions}
                    onChange={setHkVoluntaryContributions}
                    max={hkLimits.taxDeductibleVoluntaryContributions}
                    currency="HKD"
                  />
                  <p className="text-xs text-zinc-500 bg-zinc-800/50 rounded p-2">
                    Voluntary MPF Tax-Deductible Contributions (TVC) and Qualifying
                    Deferred Annuity Policy premiums share a combined annual cap.
                  </p>
                </div>
              )}

              {country === "ID" && (
                <IDContributionOptions
                  dplkContribution={idDplkContribution}
                  onDplkContributionChange={setIdDplkContribution}
                  zakatContribution={idZakatContribution}
                  onZakatContributionChange={setIdZakatContribution}
                />
              )}

              {country === "DE" && (
                <div className="bg-zinc-800/50 rounded-lg p-4">
                  <p className="text-sm font-medium text-zinc-300 mb-2">
                    Mandatory Social Security (Sozialversicherung)
                  </p>
                  <p className="text-xs text-zinc-400 mb-2">
                    Automatically deducted from your salary:
                  </p>
                  <ul className="text-xs text-zinc-500 space-y-1">
                    <li>Pension Insurance (Rentenversicherung): 9.3%</li>
                    <li>Health Insurance (Krankenversicherung): 7.3% + ~1.45% Zusatzbeitrag</li>
                    <li>Unemployment Insurance (Arbeitslosenversicherung): 1.3%</li>
                    <li>Long-term Care (Pflegeversicherung): 1.7% (2.5% if childless 23+)</li>
                  </ul>
                  <p className="text-xs text-zinc-500 mt-2">
                    Contributions are capped at €101,400 (pension/unemployment) and €69,750 (health/care).
                  </p>
                </div>
              )}
              {country === "UK" && (
                <div className="space-y-6">
                  <ContributionSlider
                    label="Pension Contribution"
                    description="Annual pension contribution (tax relief applied at 20% basic rate)"
                    value={ukPensionContribution}
                    onChange={setUkPensionContribution}
                    max={Math.min(60000, Math.max(0, grossSalary - result.totalTax))}
                    currency="GBP"
                  />
                  <p className="text-xs text-zinc-500 bg-zinc-800/50 rounded p-2">
                    <span className="text-emerald-400">Tip:</span> Higher and additional rate taxpayers can claim extra tax relief through their tax return (total 40% or 45% relief).
                  </p>
                  {grossSalary > 0 && result.totalTax > 0 && (
                    <p className="text-xs text-zinc-400">
                      Maximum affordable: {formatCurrency(Math.max(0, grossSalary - result.totalTax), currency)} 
                      (after {formatCurrency(result.totalTax, currency)} taxes)
                    </p>
                  )}
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
                Includes general, labor, and IACK tax credits
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-400">
                The Netherlands calculator applies general, labor, and IACK
                (child) tax credits and supports the optional 30% ruling.
                Additional deductions are not modeled.
              </p>
            </CardContent>
          </Card>
        )}

        {/* AU Deductions Info Card */}
        {country === "AU" && (
          <Card>
            <CardHeader>
              <CardTitle>Tax &amp; Levies</CardTitle>
              <CardDescription>
                Income tax, Medicare levy, and superannuation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-zinc-800/50 rounded-lg p-4">
                <p className="text-sm font-medium text-zinc-300 mb-2">
                  What&apos;s Included
                </p>
                <ul className="text-xs text-zinc-400 space-y-1">
                  <li>Income Tax (with Stage 3 tax cuts)</li>
                  <li>Low Income Tax Offset (LITO) for residents</li>
                  <li>Medicare Levy (2%)</li>
                  <li>Medicare Levy Surcharge (if no PHI)</li>
                  <li>Division 293 Tax (High Income Earners)</li>
                  <li>
                    Superannuation (12%) — employer-paid on top of salary, not
                    deducted from take-home (shown below for reference)
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}

        {/* PT Deductions Info Card */}
        {country === "PT" && (
          <Card>
            <CardHeader>
              <CardTitle>Tax &amp; Contributions</CardTitle>
              <CardDescription>
                IRS income tax, Social Security, and tax-saving options
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-zinc-800/50 rounded-lg p-4">
                <p className="text-sm font-medium text-zinc-300 mb-2">
                  What&apos;s Included
                </p>
                <ul className="text-xs text-zinc-400 space-y-1">
                  <li>IRS (Imposto sobre o Rendimento) — progressive tax brackets</li>
                  <li>Specific deduction (€4,104 minimum or SS contributions)</li>
                  <li>Social Security — 11% employee contribution</li>
                  <li>Solidarity Surcharge (Adicional de Solidariedade) for high incomes</li>
                  <li>PPR contributions — 20% tax credit (age-based limits)</li>
                  <li>Dependent deductions — €600 per dependent</li>
                  <li>NHR 2.0 — 20% flat rate for new residents (10-year regime)</li>
                </ul>
                <p className="text-xs text-zinc-500 mt-3">
                  Note: Non-residents pay a flat 25% rate. NHR 2.0 offers 20% flat rate for eligible new residents. Marital status and dependents affect deductions.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* TH Deductions Info Card */}
        {country === "TH" && (
          <Card>
            <CardHeader>
              <CardTitle>Tax &amp; Contributions</CardTitle>
              <CardDescription>
                Personal income tax, Social Security, and tax-saving options
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-zinc-800/50 rounded-lg p-4">
                <p className="text-sm font-medium text-zinc-300 mb-2">
                  What&apos;s Included
                </p>
                <ul className="text-xs text-zinc-400 space-y-1">
                  <li>Personal Income Tax — progressive rates 0% to 35%</li>
                  <li>Standard deduction — 50% of income (max ฿100,000)</li>
                  <li>Personal allowance — ฿60,000 per taxpayer</li>
                  <li>Social Security Fund — 5% employee contribution (capped at ฿750/month)</li>
                  <li>Voluntary contributions — Provident Fund, RMF, SSF, ESG, NSF</li>
                  <li>Insurance deductions — Life & health insurance premiums</li>
                </ul>
                <p className="text-xs text-zinc-500 mt-3">
                  Note: Non-residents pay 15% flat rate or progressive, whichever is higher. 
                  Retirement savings (PVD+RMF+SSF) share a ฿500,000 combined limit.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* UK Tax & Contributions Info Card */}
        {country === "UK" && (
          <Card>
            <CardHeader>
              <CardTitle>Tax &amp; Contributions</CardTitle>
              <CardDescription>
                Income Tax, National Insurance, and pension contributions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-zinc-800/50 rounded-lg p-4">
                <p className="text-sm font-medium text-zinc-300 mb-2">
                  What&apos;s Included
                </p>
                <ul className="text-xs text-zinc-400 space-y-1">
                  <li>Income Tax — progressive rates (see below for regional differences)</li>
                  <li>Personal Allowance — £12,570 (tapered above £100,000, zero at £125,140)</li>
                  <li>Class 1 National Insurance — 8% (PT to UEL), 2% (above UEL)</li>
                  <li>Pension contributions — Tax relief at 20% (basic), claimable 40%/45%</li>
                </ul>
                <p className="text-xs text-zinc-500 mt-3">
                  Note: Scottish residents pay different tax rates (19%, 20%, 21%, 42%, 45%, 48%).
                  Non-residents do not receive a Personal Allowance.
                </p>
              </div>
              
              <div className="mt-4 bg-zinc-800/50 rounded-lg p-4">
                <p className="text-sm font-medium text-zinc-300 mb-2">
                  England, Wales &amp; Northern Ireland Tax Bands 2026/27
                </p>
                <ul className="text-xs text-zinc-400 space-y-1">
                  <li>Personal Allowance: Up to £12,570 — 0%</li>
                  <li>Basic Rate: £12,571 to £50,270 — 20%</li>
                  <li>Higher Rate: £50,271 to £125,140 — 40%</li>
                  <li>Additional Rate: Over £125,140 — 45%</li>
                </ul>
              </div>
              
              <div className="mt-4 bg-zinc-800/50 rounded-lg p-4">
                <p className="text-sm font-medium text-zinc-300 mb-2">
                  Scotland Tax Bands 2026/27
                </p>
                <ul className="text-xs text-zinc-400 space-y-1">
                  <li>Personal Allowance: Up to £12,570 — 0%</li>
                  <li>Starter Rate: £12,571 to £16,537 — 19%</li>
                  <li>Basic Rate: £16,538 to £28,527 — 20%</li>
                  <li>Intermediate Rate: £28,528 to £43,662 — 21%</li>
                  <li>Higher Rate: £43,663 to £75,000 — 42%</li>
                  <li>Advanced Rate: £75,001 to £125,140 — 45%</li>
                  <li>Top Rate: Over £125,140 — 48%</li>
                </ul>
              </div>
              
              <div className="mt-4 bg-zinc-800/50 rounded-lg p-4">
                <p className="text-sm font-medium text-zinc-300 mb-2">
                  National Insurance (Employee) 2026/27
                </p>
                <ul className="text-xs text-zinc-400 space-y-1">
                  <li>Below £12,570 (Primary Threshold): 0%</li>
                  <li>£12,570 to £50,270 (UEL): 8%</li>
                  <li>Above £50,270: 2%</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}

        {/* HK Allowances & Deductions */}
        {country === "HK" && (
          <Card>
            <CardHeader>
              <CardTitle>Allowances &amp; Deductions</CardTitle>
              <CardDescription>
                Apply allowances and deductible expenses for Hong Kong salaries tax
              </CardDescription>
            </CardHeader>
            <CardContent>
              <HKAdditionalReliefs
                reliefs={hkTaxReliefs}
                onChange={setHkTaxReliefs}
              />
              <Separator className="my-6" />
              <div className="bg-zinc-800/50 rounded-lg p-4">
                <p className="text-sm font-medium text-zinc-300 mb-2">
                  Mandatory MPF (Employee)
                </p>
                <p className="text-xs text-zinc-400">
                  5% of monthly income between HK$7,100 and HK$30,000 (max HK$1,500/month)
                </p>
              </div>
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
