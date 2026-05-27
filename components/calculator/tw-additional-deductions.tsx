"use client";

import {
  CalculatorFieldGrid,
  CurrencyAmountField,
  NumberStepperField,
  SelectField,
} from "@/components/calculator/calculator-fields";
import { InfoPanel } from "@/components/calculator/info-panel";
import { ContributionSlider } from "@/components/ui/contribution-slider";
import {
  TW_ITEMIZED_DEDUCTIONS_2026,
  TW_SPECIAL_DEDUCTIONS_2026,
} from "@/lib/countries/tw/constants/tax-brackets-2026";
import type {
  TWDeductionMethod,
  TWTaxReliefInputs,
} from "@/lib/countries/types";
import { clampAmount, clampCount } from "@/lib/utils";

const DEDUCTION_METHOD_OPTIONS: Array<{
  value: TWDeductionMethod;
  label: string;
}> = [
  { value: "auto", label: "Use larger deduction" },
  { value: "standard", label: "Standard deduction" },
  { value: "itemized", label: "Itemized deductions" },
];

interface TWAdditionalDeductionsProps {
  reliefs: TWTaxReliefInputs;
  grossSalary: number;
  onChange: (reliefs: TWTaxReliefInputs) => void;
}

export function TWAdditionalDeductions({
  reliefs,
  grossSalary,
  onChange,
}: TWAdditionalDeductionsProps) {
  const updateRelief = <K extends keyof TWTaxReliefInputs>(
    key: K,
    value: TWTaxReliefInputs[K],
  ) => {
    onChange({ ...reliefs, [key]: value });
  };
  const householdMembers =
    1 +
    (reliefs.isMarried ? 1 : 0) +
    Math.max(0, reliefs.numberOfDependents) +
    Math.max(0, reliefs.numberOfElderlyLinealAscendants);
  const rentLimit =
    householdMembers >= 3
      ? TW_SPECIAL_DEDUCTIONS_2026.rentExpandedHousehold
      : TW_SPECIAL_DEDUCTIONS_2026.rent;
  const charitableDonationLimit =
    grossSalary *
    TW_ITEMIZED_DEDUCTIONS_2026.charitableDonationGrossIncomeCapRate;
  const insurancePremiumLimit =
    householdMembers *
    TW_ITEMIZED_DEDUCTIONS_2026.insurancePremiumPerPersonCap;
  const mortgageInterestLimit = Math.max(
    0,
    TW_ITEMIZED_DEDUCTIONS_2026.mortgageInterestCap -
      Math.min(
        reliefs.savingsAndInvestmentIncome,
        TW_SPECIAL_DEDUCTIONS_2026.savingsAndInvestment,
      ),
  );

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-sm font-medium uppercase tracking-wider text-zinc-400">
          Resident Exemptions and Special Deductions
        </h3>

        <CalculatorFieldGrid columns={3}>
          <SelectField
            id="tw-deduction-method"
            label="Deduction Method"
            value={reliefs.deductionMethod}
            onChange={(deductionMethod) =>
              updateRelief("deductionMethod", deductionMethod)
            }
            options={DEDUCTION_METHOD_OPTIONS}
            description="Choose standard, itemized, or let the calculator use the larger amount."
          />
          <NumberStepperField
            id="tw-general-dependents"
            label="General Dependents"
            value={reliefs.numberOfDependents}
            onChange={(value) => updateRelief("numberOfDependents", value)}
            min={0}
            max={10}
            description="Adds the NT$101,000 exemption per qualifying dependent."
          />
          <NumberStepperField
            id="tw-elderly-ascendants"
            label="70+ Lineal Ascendants"
            value={reliefs.numberOfElderlyLinealAscendants}
            onChange={(value) =>
              updateRelief("numberOfElderlyLinealAscendants", value)
            }
            min={0}
            max={8}
            description="Uses the NT$151,500 higher exemption for qualifying 70+ lineal ascendants."
          />
          <NumberStepperField
            id="tw-disabled-persons"
            label="Disabled Persons"
            value={Math.max(
              reliefs.disabledPersons,
              reliefs.hasDisability ? 1 : 0,
            )}
            onChange={(value) => {
              onChange({
                ...reliefs,
                disabledPersons: value,
                hasDisability: value > 0,
              });
            }}
            min={0}
            max={10}
            description="Special deduction of NT$227,000 per qualifying person."
          />
          <NumberStepperField
            id="tw-college-tuition"
            label="College Tuition Children"
            value={reliefs.collegeTuitionChildren}
            onChange={(value) => updateRelief("collegeTuitionChildren", value)}
            min={0}
            max={8}
            description="NT$25,000 special deduction per qualifying child."
          />
          <NumberStepperField
            id="tw-preschool-children"
            label="Preschool Children"
            value={reliefs.preschoolChildren}
            onChange={(value) => updateRelief("preschoolChildren", value)}
            min={0}
            max={8}
            description="NT$150,000 for the first child and NT$225,000 for each additional child, subject to income tests."
          />
          <NumberStepperField
            id="tw-long-term-care"
            label="Long-Term Care Persons"
            value={reliefs.longTermCarePersons}
            onChange={(value) => updateRelief("longTermCarePersons", value)}
            min={0}
            max={10}
            description="NT$180,000 per qualifying person, subject to income tests."
          />
        </CalculatorFieldGrid>

        <ContributionSlider
          label="Savings and Investment Income"
          description="Special deduction for eligible savings/investment income, capped at NT$270,000. It also reduces the owner-occupied mortgage-interest cap."
          value={Math.min(
            reliefs.savingsAndInvestmentIncome,
            TW_SPECIAL_DEDUCTIONS_2026.savingsAndInvestment,
          )}
          onChange={(value) =>
            updateRelief(
              "savingsAndInvestmentIncome",
              clampAmount(value, TW_SPECIAL_DEDUCTIONS_2026.savingsAndInvestment),
            )
          }
          max={TW_SPECIAL_DEDUCTIONS_2026.savingsAndInvestment}
          step={1000}
          currency="TWD"
        />

        <ContributionSlider
          label="Housing Rent Paid"
          description="Self-use Taiwan housing rent special deduction, subject to income tests. The higher cap is used for modeled households of three or more people."
          value={Math.min(reliefs.rentPaid, rentLimit)}
          onChange={(value) =>
            updateRelief("rentPaid", clampAmount(value, rentLimit))
          }
          max={rentLimit}
          step={1000}
          currency="TWD"
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-medium uppercase tracking-wider text-zinc-400">
          Itemized Deductions
        </h3>

        <ContributionSlider
          label="Charitable Donations"
          description="Donations to qualifying Taiwan charities or public welfare bodies, capped here at 20% of gross income."
          value={Math.min(reliefs.charitableDonations, charitableDonationLimit)}
          onChange={(value) =>
            updateRelief(
              "charitableDonations",
              clampAmount(value, charitableDonationLimit),
            )
          }
          max={charitableDonationLimit}
          step={1000}
          currency="TWD"
        />

        <ContributionSlider
          label="Insurance Premiums"
          description="Non-NHI insurance premiums, capped at NT$24,000 per household member in this model."
          value={Math.min(reliefs.insurancePremiums, insurancePremiumLimit)}
          onChange={(value) =>
            updateRelief(
              "insurancePremiums",
              clampAmount(value, insurancePremiumLimit),
            )
          }
          max={insurancePremiumLimit}
          step={1000}
          currency="TWD"
        />

        <ContributionSlider
          label="Owner-Occupied Mortgage Interest"
          description="Self-use home loan interest deduction, capped at NT$300,000 and reduced by the savings/investment special deduction."
          value={Math.min(reliefs.mortgageInterest, mortgageInterestLimit)}
          onChange={(value) =>
            updateRelief(
              "mortgageInterest",
              clampAmount(value, mortgageInterestLimit),
            )
          }
          max={mortgageInterestLimit}
          step={1000}
          currency="TWD"
        />

        <CalculatorFieldGrid columns={2}>
          <CurrencyAmountField
            id="tw-medical-maternity"
            label="Medical and Maternity Expenses"
            value={reliefs.medicalAndMaternityExpenses}
            onChange={(value) =>
              updateRelief("medicalAndMaternityExpenses", Math.max(0, value))
            }
            currency="TWD"
            step={1000}
            description="Qualifying hospital/clinic expenses are modeled as uncapped itemized deductions."
          />
          <CurrencyAmountField
            id="tw-calamity-losses"
            label="Calamity Losses"
            value={reliefs.calamityLosses}
            onChange={(value) =>
              updateRelief("calamityLosses", Math.max(0, value))
            }
            currency="TWD"
            step={1000}
            description="Disaster losses after insurance and other compensation."
          />
        </CalculatorFieldGrid>
      </div>

      <InfoPanel title="Taiwan Deduction Notes" tone="neutral">
        The calculator compares standard and itemized deductions when “use
        larger deduction” is selected, applies the basic living expense
        difference, and gates preschool, long-term care, and rent deductions
        using the modeled salary-only income tests. Mixed income, spouse
        separate taxation, overseas AMT, and documentary eligibility still need
        return-specific review.
      </InfoPanel>
    </div>
  );
}
