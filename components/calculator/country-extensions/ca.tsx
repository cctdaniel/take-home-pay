"use client";

import { ContributionSlider } from "@/components/ui/contribution-slider";
import { InfoPanel } from "@/components/calculator/info-panel";
import {
  CalculatorFieldGrid,
  CurrencyAmountField,
  NumberStepperField,
  PayFrequencyField,
  SelectField,
} from "@/components/calculator/calculator-fields";
import {
  type CountryCalculatorExtensionProps,
  CountryCalculatorExtensionShell,
  useCountryCalculatorExtension,
} from "@/components/calculator/country-extension";
import {
  calculateCanadaChildcareLimit,
  calculateCanadaCharitableDonationLimit,
  CANADA_CHARITABLE_DONATION_CREDIT_2026,
  CANADA_FHSA_2026,
  CANADA_PROVINCES,
  CANADA_RPP_2026,
  CANADA_RRSP_2026,
} from "@/lib/countries/ca/constants/tax-year-2026";
import type {
  CACalculatorInputs,
  CAFederalFamilyCreditType,
} from "@/lib/countries/ca/types";
import type { CanadaProvinceCode } from "@/lib/countries/ca/constants/tax-year-2026";


function getRrspLimit(grossSalary: number): number {
  return Math.min(
    Math.max(0, grossSalary) * CANADA_RRSP_2026.contributionRateLimit,
    CANADA_RRSP_2026.annualDollarLimit,
  );
}

function getRppLimit(grossSalary: number): number {
  return Math.min(
    Math.max(0, grossSalary) * CANADA_RPP_2026.modeledContributionRateLimit,
    CANADA_RPP_2026.moneyPurchaseDollarLimit,
  );
}

const FEDERAL_FAMILY_CREDIT_OPTIONS: Array<{
  value: CAFederalFamilyCreditType;
  label: string;
}> = [
  { value: "none", label: "None" },
  { value: "spouse_or_common_law", label: "Spouse / common-law amount" },
  { value: "eligible_dependant", label: "Eligible dependant amount" },
];

function clampCount(value: number): number {
  return Math.min(10, Math.max(0, Math.floor(value)));
}

export default function CACountryExtension({ country }: CountryCalculatorExtensionProps) {
  const { inputs, setInputs, currency, result } =
    useCountryCalculatorExtension<CACalculatorInputs>(country);
  const taxableGrossIncome =
    Math.max(0, inputs.grossSalary) + Math.max(0, inputs.taxableNonCashBenefits ?? 0);
  const rrspLimit = getRrspLimit(taxableGrossIncome);
  const rppLimit = getRppLimit(taxableGrossIncome);
  const childcareLimit = calculateCanadaChildcareLimit({
    grossSalary: taxableGrossIncome,
    numberOfChildrenUnder7: inputs.numberOfChildrenUnder7,
    numberOfChildrenAge7To16: inputs.numberOfChildrenAge7To16,
    numberOfDisabledChildren: inputs.numberOfDisabledChildren,
  });
  const selectedProvince = CANADA_PROVINCES.find((province) => province.code === inputs.province);

  const updateInputs = (updater: (current: CACalculatorInputs) => CACalculatorInputs) => {
    setInputs((current) => {
      const next = updater(current);
      const nextTaxableGrossIncome =
        Math.max(0, next.grossSalary) + Math.max(0, next.taxableNonCashBenefits ?? 0);
      const nextRrspLimit = getRrspLimit(nextTaxableGrossIncome);
      const nextRppLimit = getRppLimit(nextTaxableGrossIncome);
      const nextChildcareLimit = calculateCanadaChildcareLimit({
        grossSalary: nextTaxableGrossIncome,
        numberOfChildrenUnder7: clampCount(next.numberOfChildrenUnder7),
        numberOfChildrenAge7To16: clampCount(next.numberOfChildrenAge7To16),
        numberOfDisabledChildren: clampCount(next.numberOfDisabledChildren),
      });
      const nextRrspContribution = Math.min(
        Math.max(0, next.contributions.rrspContribution),
        nextRrspLimit,
      );
      const nextFhsaContribution = Math.min(
        Math.max(0, next.contributions.fhsaContribution),
        CANADA_FHSA_2026.annualDollarLimit,
      );
      const nextRegisteredPensionContribution = Math.min(
        Math.max(0, next.contributions.registeredPensionContribution),
        nextRppLimit,
      );
      const nextUnionDues = Math.max(0, next.contributions.unionDues);
      const nextChildcareExpenses = Math.min(
        Math.max(0, next.contributions.childcareExpenses),
        nextChildcareLimit,
      );
      const nextCharitableDonationLimit = calculateCanadaCharitableDonationLimit({
        grossSalary: nextTaxableGrossIncome,
        province: next.province,
        rrspContribution: nextRrspContribution,
        fhsaContribution: nextFhsaContribution,
        registeredPensionContribution: nextRegisteredPensionContribution,
        unionDues: nextUnionDues,
        childcareExpenses: nextChildcareExpenses,
      });
      return {
        ...next,
        taxableNonCashBenefits: Math.max(0, next.taxableNonCashBenefits ?? 0),
        federalFamilyCreditDependentNetIncome: Math.max(
          0,
          next.federalFamilyCreditDependentNetIncome,
        ),
        numberOfChildrenUnder7: clampCount(next.numberOfChildrenUnder7),
        numberOfChildrenAge7To16: clampCount(next.numberOfChildrenAge7To16),
        numberOfDisabledChildren: clampCount(next.numberOfDisabledChildren),
        contributions: {
          rrspContribution: nextRrspContribution,
          fhsaContribution: nextFhsaContribution,
          registeredPensionContribution: nextRegisteredPensionContribution,
          unionDues: nextUnionDues,
          childcareExpenses: nextChildcareExpenses,
          charitableDonations: Math.min(
            Math.max(0, next.contributions.charitableDonations),
            nextCharitableDonationLimit,
          ),
        },
      };
    });
  };

  const updateContribution = (
    key: keyof CACalculatorInputs["contributions"],
    value: number,
  ) => {
    updateInputs((current) => ({
      ...current,
      contributions: {
        ...current.contributions,
        [key]: value,
      },
    }));
  };

  return (
    <CountryCalculatorExtensionShell
      country={country}
      currency={currency}
      grossSalary={inputs.grossSalary}
      onGrossSalaryChange={(grossSalary) =>
        updateInputs((current) => ({ ...current, grossSalary }))
      }
      result={result}
      taxOptions={
        <CalculatorFieldGrid columns={2}>
          <SelectField<CanadaProvinceCode>
            id="ca-province"
            label="Province / Territory"
            value={inputs.province}
            onChange={(province) =>
              updateInputs((current) => ({ ...current, province }))
            }
            options={CANADA_PROVINCES.map((province) => ({
              value: province.code,
              label: province.name,
            }))}
            description="Applies the selected provincial or territorial tax brackets."
          />
          <PayFrequencyField
            id="ca-pay-frequency"
            value={inputs.payFrequency}
            onChange={(payFrequency) =>
              updateInputs((current) => ({ ...current, payFrequency }))
            }
          />
          <CurrencyAmountField
            id="ca-taxable-non-cash-benefits"
            label="Taxable Non-Cash Benefits"
            value={inputs.taxableNonCashBenefits ?? 0}
            onChange={(taxableNonCashBenefits) =>
              updateInputs((current) => ({
                ...current,
                taxableNonCashBenefits,
              }))
            }
            currency={currency}
            min={0}
            step={100}
            description="Annual CRA taxable non-cash or in-kind benefit value; adds to taxable income and CPP/QPP, not cash salary, EI, or generic QPIP."
          />
          <SelectField<CAFederalFamilyCreditType>
            id="ca-federal-family-credit"
            label="Federal Family Credit"
            value={inputs.federalFamilyCreditType}
            onChange={(federalFamilyCreditType) =>
              updateInputs((current) => ({
                ...current,
                federalFamilyCreditType,
                federalFamilyCreditDependentNetIncome:
                  federalFamilyCreditType === "none"
                    ? 0
                    : current.federalFamilyCreditDependentNetIncome,
              }))
            }
            options={FEDERAL_FAMILY_CREDIT_OPTIONS}
            description="Models the federal spouse/common-law or eligible-dependant amount; Canada has no joint tax brackets."
          />
          {inputs.federalFamilyCreditType !== "none" ? (
            <CurrencyAmountField
              id="ca-dependent-net-income"
              label="Dependant Net Income"
              value={inputs.federalFamilyCreditDependentNetIncome}
              onChange={(federalFamilyCreditDependentNetIncome) =>
                updateInputs((current) => ({
                  ...current,
                  federalFamilyCreditDependentNetIncome,
                }))
              }
              currency={currency}
              min={0}
              step={100}
              description="Reduces the modeled federal family amount dollar for dollar."
            />
          ) : null}
          <NumberStepperField
            id="ca-children-under-7"
            label="Children Under 7"
            value={inputs.numberOfChildrenUnder7}
            onChange={(numberOfChildrenUnder7) =>
              updateInputs((current) => ({ ...current, numberOfChildrenUnder7 }))
            }
            min={0}
            max={10}
            description="Sets the CRA childcare deduction cap at CAD 8,000 per child."
          />
          <NumberStepperField
            id="ca-children-7-to-16"
            label="Children 7 to 16"
            value={inputs.numberOfChildrenAge7To16}
            onChange={(numberOfChildrenAge7To16) =>
              updateInputs((current) => ({ ...current, numberOfChildrenAge7To16 }))
            }
            min={0}
            max={10}
            description="Sets the CRA childcare deduction cap at CAD 5,000 per child."
          />
          <NumberStepperField
            id="ca-disabled-children"
            label="Disabled Children"
            value={inputs.numberOfDisabledChildren}
            onChange={(numberOfDisabledChildren) =>
              updateInputs((current) => ({ ...current, numberOfDisabledChildren }))
            }
            min={0}
            max={10}
            description="Sets the CRA childcare deduction cap at CAD 11,000 per child eligible for the DTC."
          />
        </CalculatorFieldGrid>
      }
      contributions={
        <div className="space-y-6">
          <ContributionSlider
            label="RRSP Contribution"
            description="Tax-deductible registered retirement savings contribution."
            value={inputs.contributions.rrspContribution}
            onChange={(value) => updateContribution("rrspContribution", value)}
            max={rrspLimit}
            step={100}
            currency={currency}
          />
          <ContributionSlider
            label="FHSA Contribution"
            description="Tax-deductible first home savings account contribution."
            value={inputs.contributions.fhsaContribution}
            onChange={(value) => updateContribution("fhsaContribution", value)}
            max={CANADA_FHSA_2026.annualDollarLimit}
            step={100}
            currency={currency}
          />
          <ContributionSlider
            label="Registered Pension / RPP"
            description="Employee registered pension plan contribution, modeled as pre-tax."
            value={inputs.contributions.registeredPensionContribution}
            onChange={(value) => updateContribution("registeredPensionContribution", value)}
            max={rppLimit}
            step={100}
            currency={currency}
          />
          <ContributionSlider
            label="Union / Professional Dues"
            description="Modeled as a taxable-income deduction."
            value={inputs.contributions.unionDues}
            onChange={(value) => updateContribution("unionDues", value)}
            max={Math.max(10_000, inputs.contributions.unionDues)}
            step={50}
            currency={currency}
          />
          {childcareLimit > 0 ? (
            <ContributionSlider
              label="Childcare Expenses"
              description="Line 21400 deduction, capped by child age/disability counts and two-thirds of earned income."
              value={inputs.contributions.childcareExpenses}
              onChange={(value) => updateContribution("childcareExpenses", value)}
              max={childcareLimit}
              step={100}
              currency={currency}
            />
          ) : (
            <div className="rounded-md bg-zinc-800/50 p-3 text-sm text-zinc-400">
              Enter qualifying children in Income Details to enable the capped
              childcare expense deduction.
            </div>
          )}
          <ContributionSlider
            label="Claimed Charitable Donations"
            description={`Federal line 34900 and provincial/territorial line 58969 donation credits, capped here at ${(CANADA_CHARITABLE_DONATION_CREDIT_2026.netIncomeLimitRate * 100).toFixed(0)}% of modeled net income.`}
            value={inputs.contributions.charitableDonations}
            onChange={(value) => updateContribution("charitableDonations", value)}
            max={result.breakdown.type === "CA"
              ? result.breakdown.voluntaryContributions.charitableDonationLimit
              : 0}
            step={100}
            currency={currency}
          />
        </div>
      }
      contributionsTitle="Retirement, Benefits & Deductions"
      contributionsDescription="RRSP, FHSA, pension, dues, childcare deductions, and charitable donation credits"
      infoCard={
        <InfoPanel title="Modeled Scope">
          Uses 2026 federal and {selectedProvince?.name ?? "selected province"} brackets.
          Quebec uses QPP/QPP2, QPIP, and reduced EI; other provinces and territories
          use CPP/CPP2 and EI. The calculator includes the federal and provincial
          basic personal amounts, modeled CPP/QPP and EI/QPIP non-refundable credits,
          CRA taxable non-cash benefits as employment income with CPP/QPP treatment,
          the federal spouse/common-law or eligible-dependant amount when selected,
          capped CRA childcare deductions, charitable donation credits, the Quebec
          federal abatement, and Ontario surtax/health premium where applicable.
          Canada child benefits, medical credits, exact TD1 claim-code changes, and employer-only costs
          are separate tax-return or employer items rather than employee-paid salary controls.
        </InfoPanel>
      }
      seoInfo={
        <section className="mt-12 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 text-sm text-zinc-400">
          <h2 className="text-xl font-semibold text-zinc-100 mb-3">Canada salary after tax calculator by province</h2>
          <p>
            Estimate Canadian take-home pay using federal and selected provincial or
            territorial income tax, CPP/CPP2 or Quebec QPP/QPP2, EI, Quebec QPIP,
            taxable non-cash benefits, non-refundable personal credits, federal family credits, RRSP, FHSA,
            registered pension, union dues, capped childcare deductions, and
            federal plus provincial charitable donation credits.
          </p>
        </section>
      }
    />
  );
}
