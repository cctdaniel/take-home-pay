"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SalaryInput } from "./salary-input";
import { TaxOptions } from "./tax-options";
import { ContributionOptions } from "./contribution-options";
import { ResultsBreakdown } from "./results-breakdown";
import { useSalaryCalculator } from "@/hooks/use-salary-calculator";

export function SalaryCalculator() {
  const {
    grossSalary,
    setGrossSalary,
    state,
    setState,
    filingStatus,
    setFilingStatus,
    payFrequency,
    setPayFrequency,
    traditional401k,
    setTraditional401k,
    rothIRA,
    setRothIRA,
    hsa,
    setHsa,
    hsaCoverageType,
    setHsaCoverageType,
    limits,
    result,
  } = useSalaryCalculator();

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
            <SalaryInput value={grossSalary} onChange={setGrossSalary} />
            <Separator />
            <TaxOptions
              state={state}
              onStateChange={setState}
              filingStatus={filingStatus}
              onFilingStatusChange={setFilingStatus}
              payFrequency={payFrequency}
              onPayFrequencyChange={setPayFrequency}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contributions</CardTitle>
            <CardDescription>
              Adjust your retirement and savings contributions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ContributionOptions
              traditional401k={traditional401k}
              onTraditional401kChange={setTraditional401k}
              traditional401kLimit={limits.traditional401k}
              rothIRA={rothIRA}
              onRothIRAChange={setRothIRA}
              rothIRALimit={limits.rothIRA}
              hsa={hsa}
              onHsaChange={setHsa}
              hsaLimit={limits.hsa}
              hsaCoverageType={hsaCoverageType}
              onHsaCoverageTypeChange={setHsaCoverageType}
            />
          </CardContent>
        </Card>
      </div>

      {/* Results Section */}
      <div className="lg:col-span-2">
        <ResultsBreakdown
          result={result}
          state={state}
          contributions={{
            traditional401k,
            rothIRA,
            hsa,
          }}
        />
      </div>
    </div>
  );
}
