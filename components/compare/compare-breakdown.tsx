"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  formatCurrencyWithCode,
  formatCurrencyWithCodeAndCents,
  formatPercentage,
} from "@/lib/format";
import type { CurrencyCode } from "@/lib/countries/types";
import { cn } from "@/lib/utils";
import type { CountryComparison, MaritalStatus } from "@/hooks/use-country-comparison";
import Link from "next/link";

interface BreakdownLine {
  label: string;
  amount: number;
}

function BreakdownRow({
  label,
  amount,
  grossSalary,
  currency,
}: {
  label: string;
  amount: number;
  grossSalary: number;
  currency: CurrencyCode;
}) {
  const percentage = grossSalary > 0 ? amount / grossSalary : 0;

  return (
    <div className="flex items-center justify-between py-1 text-xs text-zinc-500">
      <span className="pl-4">{label}</span>
      <div className="flex items-center gap-4">
        <span className="text-[11px] text-zinc-600 tabular-nums w-12 text-right">
          {formatPercentage(percentage)}
        </span>
        <span className="tabular-nums text-zinc-400 min-w-[80px] text-right">
          -{formatCurrencyWithCode(amount, currency)}
        </span>
      </div>
    </div>
  );
}

function CompareDeductionRow({
  label,
  amount,
  grossSalary,
  variant = "default",
  showPercentage = true,
  currency,
}: {
  label: string;
  amount: number;
  grossSalary: number;
  variant?: "default" | "total" | "net";
  showPercentage?: boolean;
  currency: CurrencyCode;
}) {
  const percentage = grossSalary > 0 ? amount / grossSalary : 0;

  return (
    <div
      className={cn(
        "flex items-center justify-between py-2",
        variant === "total" && "border-t border-zinc-700 pt-3 mt-1",
        variant === "net" && "border-t border-zinc-700 pt-3 mt-1",
      )}
    >
      <span
        className={cn(
          "text-sm",
          variant === "default" && "text-zinc-400",
          variant === "total" && "text-zinc-300 font-medium",
          variant === "net" && "text-emerald-400 font-semibold",
        )}
      >
        {label}
      </span>
      <div className="flex items-center gap-4">
        {showPercentage && (
          <span className="text-xs text-zinc-500 tabular-nums w-14 text-right">
            {formatPercentage(percentage)}
          </span>
        )}
        <span
          className={cn(
            "tabular-nums text-right min-w-[90px]",
            variant === "default" && "text-sm text-zinc-300",
            variant === "total" && "text-sm font-medium text-zinc-200",
            variant === "net" && "text-base font-semibold text-emerald-400",
          )}
        >
          {variant === "net"
            ? formatCurrencyWithCode(amount, currency)
            : `-${formatCurrencyWithCode(amount, currency)}`}
        </span>
      </div>
    </div>
  );
}

interface CompareBreakdownProps {
  selected: CountryComparison | null;
  baseSalary: number;
  baseCurrency: CurrencyCode;
  maritalStatus: MaritalStatus;
  numberOfChildren: number;
  baselineName: string;
}

export function CompareBreakdown({
  selected,
  baseSalary,
  baseCurrency,
  maritalStatus,
  numberOfChildren,
  baselineName,
}: CompareBreakdownProps) {
  if (!selected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-zinc-200">
            Country snapshot
          </CardTitle>
          <CardDescription>
            Select a country on the right to see a quick breakdown.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4 text-sm text-zinc-400">
            Complete the questionnaire to compare take-home pay.
          </div>
        </CardContent>
      </Card>
    );
  }

  const { calculation, name, country, currency, assumptions } = selected;
  const grossSalary = calculation.grossSalary;
  const incomeTax = calculation.taxes.totalIncomeTax;
  const usesTotalTaxLabel = calculation.totalTax === incomeTax;
  const mandatoryContributions = Math.max(
    0,
    calculation.totalTax - incomeTax,
  );
  const voluntaryContributions = Math.max(
    0,
    calculation.totalDeductions - calculation.totalTax,
  );
  const takeHomeRate = grossSalary > 0 ? calculation.netSalary / grossSalary : 0;
  const taxes = calculation.taxes;

  const incomeTaxBreakdown: BreakdownLine[] = [];
  const mandatoryBreakdown: BreakdownLine[] = [];

  const pushLine = (target: BreakdownLine[], label: string, amount: number) => {
    if (amount > 0) {
      target.push({ label, amount });
    }
  };

  if ("federalIncomeTax" in taxes) {
    pushLine(incomeTaxBreakdown, "Federal income tax", taxes.federalIncomeTax);
    pushLine(incomeTaxBreakdown, "State income tax", taxes.stateIncomeTax);
    pushLine(mandatoryBreakdown, "Social Security", taxes.socialSecurity);
    pushLine(mandatoryBreakdown, "Medicare", taxes.medicare);
    pushLine(mandatoryBreakdown, "Additional Medicare", taxes.additionalMedicare);
    pushLine(mandatoryBreakdown, "State disability", taxes.stateDisabilityInsurance);
  } else if ("cpfEmployee" in taxes) {
    pushLine(mandatoryBreakdown, "CPF (employee)", taxes.cpfEmployee);
  } else if ("localIncomeTax" in taxes) {
    pushLine(incomeTaxBreakdown, "National income tax", taxes.incomeTax);
    pushLine(incomeTaxBreakdown, "Local income tax", taxes.localIncomeTax);
    pushLine(mandatoryBreakdown, "National pension", taxes.nationalPension);
    pushLine(mandatoryBreakdown, "Health insurance", taxes.nationalHealthInsurance);
    pushLine(mandatoryBreakdown, "Long-term care", taxes.longTermCareInsurance);
    pushLine(mandatoryBreakdown, "Employment insurance", taxes.employmentInsurance);
  } else if ("socialSecurityTax" in taxes) {
    pushLine(incomeTaxBreakdown, "Income tax", taxes.incomeTax);
    pushLine(incomeTaxBreakdown, "Social security tax", taxes.socialSecurityTax);
  } else if ("medicareLevy" in taxes) {
    pushLine(incomeTaxBreakdown, "Income tax", taxes.incomeTax);
    pushLine(incomeTaxBreakdown, "Medicare levy", taxes.medicareLevy);
    pushLine(
      incomeTaxBreakdown,
      "Medicare levy surcharge",
      taxes.medicareLevySurcharge,
    );
    pushLine(incomeTaxBreakdown, "Division 293 tax", taxes.division293Tax);
  } else if ("solidaritySurcharge" in taxes && "type" in taxes && taxes.type === "PT") {
    pushLine(incomeTaxBreakdown, "IRS income tax", taxes.incomeTax);
    pushLine(incomeTaxBreakdown, "Solidarity surcharge", taxes.solidaritySurcharge);
    pushLine(mandatoryBreakdown, "Social security", taxes.socialSecurity);
  } else if ("solidaritySurcharge" in taxes && "type" in taxes && taxes.type === "DE") {
    pushLine(incomeTaxBreakdown, "Income tax", taxes.incomeTax);
    pushLine(incomeTaxBreakdown, "Solidarity surcharge", taxes.solidaritySurcharge);
    pushLine(incomeTaxBreakdown, "Church tax", taxes.churchTax);
    pushLine(mandatoryBreakdown, "Pension insurance", taxes.pensionInsurance);
    pushLine(mandatoryBreakdown, "Health insurance", taxes.healthInsurance);
    pushLine(mandatoryBreakdown, "Unemployment insurance", taxes.unemploymentInsurance);
    pushLine(mandatoryBreakdown, "Long-term care", taxes.longTermCareInsurance);
  } else if ("mpfEmployee" in taxes) {
    pushLine(mandatoryBreakdown, "MPF (employee)", taxes.mpfEmployee);
  } else if ("socialSecurity" in taxes) {
    pushLine(mandatoryBreakdown, "Social security", taxes.socialSecurity);
  } else if ("bpjsHealth" in taxes) {
    pushLine(incomeTaxBreakdown, "Income tax", taxes.incomeTax);
    pushLine(mandatoryBreakdown, "BPJS Health", taxes.bpjsHealth);
    pushLine(mandatoryBreakdown, "BPJS JHT", taxes.bpjsJht);
    pushLine(mandatoryBreakdown, "BPJS JP", taxes.bpjsJp);
  } else if ("epfEmployee" in taxes) {
    pushLine(incomeTaxBreakdown, "Income tax", taxes.incomeTax);
    pushLine(mandatoryBreakdown, "EPF", taxes.epfEmployee);
    pushLine(mandatoryBreakdown, "SOCSO", taxes.socsoEmployee);
    pushLine(mandatoryBreakdown, "EIS", taxes.eisEmployee);
  } else if ("laborInsurance" in taxes) {
    pushLine(incomeTaxBreakdown, "Income tax", taxes.incomeTax);
    pushLine(mandatoryBreakdown, "Labor Insurance", taxes.laborInsurance);
    pushLine(mandatoryBreakdown, "Employment Insurance", taxes.employmentInsurance);
    pushLine(mandatoryBreakdown, "National Health Insurance", taxes.nhi);
  } else if ("nationalInsurance" in taxes && !("localIncomeTax" in taxes)) {
    // UK - distinguish from KR by checking for localIncomeTax
    pushLine(incomeTaxBreakdown, "Income tax", taxes.incomeTax);
    pushLine(mandatoryBreakdown, "National Insurance", taxes.nationalInsurance);
  }

  const showIncomeBreakdown =
    incomeTaxBreakdown.length > 1 || (country === "US" && incomeTaxBreakdown.length > 0);
  const showMandatoryBreakdown = mandatoryBreakdown.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg text-zinc-200">Country snapshot</CardTitle>
        <CardDescription>
          Showing {name}. Click another country to compare.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4 text-sm text-zinc-300 space-y-2">
          <div className="flex items-center justify-between">
            <span>Base salary</span>
            <span className="font-medium">
              {formatCurrencyWithCode(baseSalary, baseCurrency)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Status</span>
            <span className="font-medium capitalize">{maritalStatus}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Children</span>
            <span className="font-medium">{numberOfChildren}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Baseline</span>
            <span className="font-medium">{baselineName}</span>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
          <div className="text-center py-2">
            <div className="text-4xl font-bold text-emerald-400 tracking-tight">
              {formatCurrencyWithCode(calculation.netSalary, currency)}
            </div>
            <div className="text-zinc-500 text-sm mt-1">
              {formatCurrencyWithCodeAndCents(calculation.perPeriod.net, currency)} per
              month
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between rounded-lg bg-zinc-800/60 px-3 py-2 text-sm">
            <span className="text-zinc-400">Take-home rate</span>
            <span className="font-semibold text-zinc-100">
              {formatPercentage(takeHomeRate)}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between rounded-lg bg-zinc-800/40 px-3 py-2 text-sm">
            <span className="text-zinc-400">Effective tax rate</span>
            <span className="font-semibold text-zinc-100">
              {formatPercentage(calculation.effectiveTaxRate)}
            </span>
          </div>

          <Separator className="my-4" />

          <div className="space-y-1">
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-zinc-300 font-medium">
                Gross Salary
              </span>
              <span className="text-sm font-medium text-zinc-200 tabular-nums">
                {formatCurrencyWithCode(grossSalary, currency)}
              </span>
            </div>
            <Separator className="my-2" />
            <CompareDeductionRow
              label={usesTotalTaxLabel ? "Total tax" : "Income tax"}
              amount={incomeTax}
              grossSalary={grossSalary}
              currency={currency}
            />
            {showIncomeBreakdown && (
              <div className="mt-1">
                {incomeTaxBreakdown.map((line) => (
                  <BreakdownRow
                    key={line.label}
                    label={line.label}
                    amount={line.amount}
                    grossSalary={grossSalary}
                    currency={currency}
                  />
                ))}
              </div>
            )}
            {mandatoryContributions > 0 && (
              <>
                <CompareDeductionRow
                  label="Mandatory contributions"
                  amount={mandatoryContributions}
                  grossSalary={grossSalary}
                  currency={currency}
                />
                {showMandatoryBreakdown && (
                  <div className="mt-1">
                    {mandatoryBreakdown.map((line) => (
                      <BreakdownRow
                        key={line.label}
                        label={line.label}
                        amount={line.amount}
                        grossSalary={grossSalary}
                        currency={currency}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
            {voluntaryContributions > 0 && (
              <CompareDeductionRow
                label="Voluntary contributions"
                amount={voluntaryContributions}
                grossSalary={grossSalary}
                currency={currency}
              />
            )}
            <CompareDeductionRow
              label="Total deductions"
              amount={calculation.totalDeductions}
              grossSalary={grossSalary}
              currency={currency}
              variant="total"
            />
            <CompareDeductionRow
              label="Net salary"
              amount={calculation.netSalary}
              grossSalary={grossSalary}
              currency={currency}
              variant="net"
              showPercentage={false}
            />
          </div>
        </div>

        {assumptions.length > 0 && (
          <p className="text-[11px] text-zinc-500">
            {assumptions.join(" • ")}
          </p>
        )}

        <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3 text-xs text-zinc-400">
          This is a simplified snapshot. For the most accurate take-home pay,
          use the full country calculator.
        </div>
        <Link
          href={`/${country.toLowerCase()}`}
          className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-200 hover:text-emerald-100"
        >
          Open full {name} calculator
          <span aria-hidden="true">→</span>
        </Link>
      </CardContent>
    </Card>
  );
}
