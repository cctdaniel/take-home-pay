"use client";

import {
  BooleanSelectField,
  CalculatorFieldGrid,
  NumberStepperField,
  SelectField,
} from "@/components/calculator/calculator-fields";
import { InfoPanel } from "@/components/calculator/info-panel";
import { ContributionSlider } from "@/components/ui/contribution-slider";
import { SG_TAX_RELIEFS } from "@/lib/countries/sg/constants/tax-brackets-2026";
import type {
  SGNsmanSelfReliefType,
  SGParentReliefType,
  SGTaxResidencyType,
  SGTaxReliefInputs,
} from "@/lib/countries/types";

const PARENT_RELIEF_OPTIONS: Array<{
  value: SGParentReliefType;
  label: string;
}> = [
  { value: "none", label: "No parent claim" },
  { value: "not_staying", label: "Not staying with you" },
  { value: "staying", label: "Staying with you" },
];

const NSMAN_RELIEF_OPTIONS: Array<{
  value: SGNsmanSelfReliefType;
  label: string;
}> = [
  { value: "none", label: "No self claim" },
  { value: "basic", label: "Basic NSman" },
  { value: "active", label: "Active NSman" },
  { value: "key_or_command", label: "Key/command appointment" },
];

interface SGAdditionalReliefsProps {
  reliefs: SGTaxReliefInputs;
  onChange: (reliefs: SGTaxReliefInputs) => void;
  grossSalary: number;
  taxResidency: SGTaxResidencyType;
}

function clampAmount(value: number, max: number) {
  return Math.min(Math.max(0, value), Math.max(0, max));
}

export function SGAdditionalReliefs({
  reliefs,
  onChange,
  grossSalary,
  taxResidency,
}: SGAdditionalReliefsProps) {
  const updateRelief = <K extends keyof SGTaxReliefInputs>(
    key: K,
    value: SGTaxReliefInputs[K],
  ) => {
    onChange({ ...reliefs, [key]: value });
  };
  const donationCashLimit =
    (grossSalary * SG_TAX_RELIEFS.donationDeductionStatutoryIncomeCapRate) /
    SG_TAX_RELIEFS.approvedDonationDeductionRate;
  const isTaxResident = taxResidency === "resident";

  if (!isTaxResident) {
    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-sm font-medium uppercase tracking-wider text-zinc-400">
            Non-Resident Deductions
          </h3>

          <ContributionSlider
            label="Approved IPC Donations"
            description="Enter the cash donation amount. The calculator applies the 2.5x tax deduction, capped at 40% of modeled income."
            value={Math.min(reliefs.approvedDonations, donationCashLimit)}
            onChange={(value) =>
              updateRelief(
                "approvedDonations",
                clampAmount(value, donationCashLimit),
              )
            }
            max={donationCashLimit}
            step={100}
            currency="SGD"
          />
        </div>

        <InfoPanel title="Non-resident relief rule" tone="neutral">
          IRAS allows non-residents to claim deductions such as approved
          donations, but personal reliefs are not available. Employment income
          is taxed at 15% or resident progressive rates, whichever gives the
          higher tax amount.
        </InfoPanel>
      </div>
    );
  }

  const parenthoodTaxRebateLimit =
    (reliefs.numberOfChildren >= 1
      ? SG_TAX_RELIEFS.parenthoodTaxRebateFirstChild
      : 0) +
    (reliefs.numberOfChildren >= 2
      ? SG_TAX_RELIEFS.parenthoodTaxRebateSecondChild
      : 0) +
    Math.max(0, reliefs.numberOfChildren - 2) *
      SG_TAX_RELIEFS.parenthoodTaxRebateThirdAndLaterChild;

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-sm font-medium uppercase tracking-wider text-zinc-400">
          Family and Caregiver Reliefs
        </h3>

        <CalculatorFieldGrid columns={2}>
          <BooleanSelectField
            id="sg-spouse-relief"
            label="Spouse Relief"
            value={reliefs.hasSpouseRelief}
            onChange={(checked) => updateRelief("hasSpouseRelief", checked)}
            trueLabel="Claim S$2,000"
            falseLabel="No"
            description="For spouse income below the IRAS threshold."
          />

          <BooleanSelectField
            id="sg-disabled-spouse-relief"
            label="Spouse Relief (Disability)"
            value={reliefs.hasDisabledSpouseRelief}
            onChange={(checked) =>
              updateRelief("hasDisabledSpouseRelief", checked)
            }
            trueLabel="Claim S$5,500"
            falseLabel="No"
            description="Higher relief for a spouse with disability."
          />

          <NumberStepperField
            id="sg-children"
            label="Qualifying Children"
            value={reliefs.numberOfChildren}
            onChange={(value) => updateRelief("numberOfChildren", value)}
            min={0}
            max={10}
            description="Qualifying Child Relief is S$4,000 per child."
          />

          <NumberStepperField
            id="sg-disabled-children"
            label="Children With Disability"
            value={reliefs.numberOfDisabledChildren}
            onChange={(value) =>
              updateRelief("numberOfDisabledChildren", value)
            }
            min={0}
            max={10}
            description="Handicapped Child Relief is S$7,500 per child."
          />

          <SelectField
            id="sg-parent-relief"
            label="Parent/Grandparent Relief"
            value={reliefs.parentRelief}
            onChange={(value) => updateRelief("parentRelief", value)}
            options={PARENT_RELIEF_OPTIONS}
            description="Claim S$5,500/S$9,000, or S$10,000/S$14,000 with disability."
          />

          <BooleanSelectField
            id="sg-parent-disability-relief"
            label="Parent Relief (Disability)"
            value={reliefs.parentReliefForDisability}
            onChange={(checked) =>
              updateRelief("parentReliefForDisability", checked)
            }
            trueLabel="Use disability amount"
            falseLabel="Standard amount"
          />

          {reliefs.parentRelief !== "none" ? (
            <NumberStepperField
              id="sg-parent-count"
              label="Parent/Grandparent Count"
              value={reliefs.numberOfParents || 1}
              onChange={(value) => updateRelief("numberOfParents", value)}
              min={1}
              max={4}
              description="Number of qualifying parents, grandparents, parents-in-law, or grandparents-in-law."
            />
          ) : null}

          <BooleanSelectField
            id="sg-grandparent-caregiver"
            label="Grandparent Caregiver Relief"
            value={reliefs.grandparentCaregiverRelief}
            onChange={(checked) =>
              updateRelief("grandparentCaregiverRelief", checked)
            }
            trueLabel="Claim S$3,000"
            falseLabel="No"
            description="For qualifying working mothers with a caregiver in Singapore."
          />

          <NumberStepperField
            id="sg-disabled-siblings"
            label="Siblings With Disability"
            value={reliefs.numberOfDisabledSiblings}
            onChange={(value) =>
              updateRelief("numberOfDisabledSiblings", value)
            }
            min={0}
            max={10}
            description="Handicapped Brother/Sister Relief is S$5,500 each."
          />
        </CalculatorFieldGrid>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-medium uppercase tracking-wider text-zinc-400">
          Working Mother and Parenthood
        </h3>

        <CalculatorFieldGrid columns={2}>
          <BooleanSelectField
            id="sg-working-mother"
            label="Working Mother's Child Relief"
            value={reliefs.isWorkingMother}
            onChange={(checked) => updateRelief("isWorkingMother", checked)}
            trueLabel="Eligible"
            falseLabel="Not eligible"
          />

          <NumberStepperField
            id="sg-wmcr-pre-2024"
            label="WMCR Children Before 2024"
            value={reliefs.wmcrPre2024Children}
            onChange={(value) => updateRelief("wmcrPre2024Children", value)}
            min={0}
            max={10}
            description="Uses 15%, 20%, then 25% of earned income by child order."
          />

          <BooleanSelectField
            id="sg-wmcr-post-2024-first"
            label="Post-2024 First Child WMCR"
            value={reliefs.wmcrPost2024FirstChild}
            onChange={(checked) =>
              updateRelief("wmcrPost2024FirstChild", checked)
            }
            trueLabel="Claim S$8,000"
            falseLabel="No"
          />

          <BooleanSelectField
            id="sg-wmcr-post-2024-second"
            label="Post-2024 Second Child WMCR"
            value={reliefs.wmcrPost2024SecondChild}
            onChange={(checked) =>
              updateRelief("wmcrPost2024SecondChild", checked)
            }
            trueLabel="Claim S$10,000"
            falseLabel="No"
          />

          <NumberStepperField
            id="sg-wmcr-post-2024-third"
            label="Post-2024 Third+ Children"
            value={reliefs.wmcrPost2024ThirdAndLaterChildren}
            onChange={(value) =>
              updateRelief("wmcrPost2024ThirdAndLaterChildren", value)
            }
            min={0}
            max={8}
            description="S$12,000 relief for each third or subsequent child born/adopted from 2024."
          />
        </CalculatorFieldGrid>

        <ContributionSlider
          label="Parenthood Tax Rebate Used"
          description="Tax rebate available for qualifying Singapore citizen children: S$5,000 first, S$10,000 second, S$20,000 third and subsequent."
          value={Math.min(reliefs.parenthoodTaxRebate, parenthoodTaxRebateLimit)}
          onChange={(value) =>
            updateRelief(
              "parenthoodTaxRebate",
              clampAmount(value, parenthoodTaxRebateLimit),
            )
          }
          max={parenthoodTaxRebateLimit}
          step={100}
          currency="SGD"
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-medium uppercase tracking-wider text-zinc-400">
          Insurance, Donations, and NSman Reliefs
        </h3>

        <ContributionSlider
          label="Life Insurance Premiums"
          description="Life insurance relief is limited by premiums paid, 7% of capital sum insured, and unused room under the S$5,000 CPF/life-insurance cap."
          value={reliefs.lifeInsurancePremiums}
          onChange={(value) =>
            updateRelief(
              "lifeInsurancePremiums",
              clampAmount(value, SG_TAX_RELIEFS.lifeInsuranceReliefCap),
            )
          }
          max={SG_TAX_RELIEFS.lifeInsuranceReliefCap}
          step={100}
          currency="SGD"
        />

        <ContributionSlider
          label="Life Insurance Capital Sum"
          description="Used for the IRAS 7% capital-sum limit on life insurance relief."
          value={reliefs.lifeInsuranceCapitalSum}
          onChange={(value) =>
            updateRelief("lifeInsuranceCapitalSum", Math.max(0, value))
          }
          max={100000}
          step={1000}
          currency="SGD"
        />

        <ContributionSlider
          label="Approved IPC Donations"
          description="Enter the cash donation amount. The calculator applies the 2.5x tax deduction, capped at 40% of modeled income."
          value={Math.min(reliefs.approvedDonations, donationCashLimit)}
          onChange={(value) =>
            updateRelief("approvedDonations", clampAmount(value, donationCashLimit))
          }
          max={donationCashLimit}
          step={100}
          currency="SGD"
        />

        <CalculatorFieldGrid columns={2}>
          <SelectField
            id="sg-nsman-self"
            label="NSman Self Relief"
            value={reliefs.nsmanSelfRelief}
            onChange={(value) => updateRelief("nsmanSelfRelief", value)}
            options={NSMAN_RELIEF_OPTIONS}
          />

          <BooleanSelectField
            id="sg-nsman-wife"
            label="NSman Wife Relief"
            value={reliefs.hasNsmanWifeRelief}
            onChange={(checked) =>
              updateRelief("hasNsmanWifeRelief", checked)
            }
            trueLabel="Claim S$750"
            falseLabel="No"
          />

          <NumberStepperField
            id="sg-nsman-parents"
            label="NSman Parent Reliefs"
            value={reliefs.numberOfNsmanParentReliefs}
            onChange={(value) =>
              updateRelief("numberOfNsmanParentReliefs", value)
            }
            min={0}
            max={2}
            description="S$750 each for qualifying parent claims."
          />
        </CalculatorFieldGrid>
      </div>

      <InfoPanel title="YA 2026 relief note" tone="neutral">
        Course Fees Relief has lapsed from YA 2026, so it is no longer shown as
        a personal relief input. The S$80,000 personal relief cap is applied in the
        calculator before donation deductions and Parenthood Tax Rebate.
      </InfoPanel>
    </div>
  );
}
