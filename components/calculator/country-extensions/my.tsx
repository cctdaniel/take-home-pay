"use client";

import { MYContributionOptions } from "@/components/calculator/my-contribution-options";
import { MYTaxOptions } from "@/components/calculator/my-tax-options";
import {
  CountryCalculatorExtensionShell,
  useCountryCalculatorExtension,
  type CountryCalculatorExtensionProps,
} from "@/components/calculator/country-extension";
import { InfoPanel } from "@/components/calculator/info-panel";
import { MYCalculator } from "@/lib/countries/my";
import {
  getMYFirstHomeLoanInterestLimit,
  MY_RELIEFS_YA_2025,
} from "@/lib/countries/my/constants/tax-brackets-2025";
import type { MYCalculatorInputs, MYTaxReliefInputs } from "@/lib/countries/types";
import { clampAmount } from "@/lib/utils";

export default function MYCountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const {
    inputs,
    currency,
    result,
    setGrossSalary,
    setPayFrequency,
    setInputs,
  } = useCountryCalculatorExtension<MYCalculatorInputs>(country);
  const contributionLimits = MYCalculator.getContributionLimits(inputs);
  const voluntaryEpfLimit =
    contributionLimits.voluntaryEpfContribution?.limit ?? 0;
  const prsLimit = contributionLimits.prsContribution?.limit ?? 0;
  const firstHomeLoanInterestLimit = getMYFirstHomeLoanInterestLimit(
    inputs.taxReliefs.firstHomePriceBand,
  );
  const approvedDonationLimit =
    inputs.residencyType === "resident"
      ? Math.max(0, inputs.grossSalary * MY_RELIEFS_YA_2025.approvedDonationRate)
      : 0;
  const myBreakdown = result.breakdown.type === "MY" ? result.breakdown : null;
  const incomeTax =
    "incomeTax" in result.taxes ? Number(result.taxes.incomeTax) : 0;
  const zakatFitrahLimit =
    inputs.residencyType === "resident" && myBreakdown
      ? incomeTax + myBreakdown.taxRebates.total
      : 0;
  const setTaxRelief = <K extends keyof MYTaxReliefInputs>(
    key: K,
    value: MYTaxReliefInputs[K],
  ) =>
    setInputs((current) => ({
      ...current,
      taxReliefs: {
        ...current.taxReliefs,
        [key]: value,
      },
    }));
  const setTaxReliefAmount = (
    key: keyof MYTaxReliefInputs,
    value: number,
    max: number,
  ) =>
    setInputs((current) => ({
      ...current,
      taxReliefs: {
        ...current.taxReliefs,
        [key]: clampAmount(value, max),
      },
    }));

  return (
    <CountryCalculatorExtensionShell
      country={country}
      currency={currency}
      grossSalary={inputs.grossSalary}
      onGrossSalaryChange={setGrossSalary}
      result={result}
      taxOptions={
        <MYTaxOptions
          payFrequency={inputs.payFrequency}
          onPayFrequencyChange={setPayFrequency}
          residencyType={inputs.residencyType}
          onResidencyTypeChange={(residencyType) =>
            setInputs((current) => ({ ...current, residencyType }))
          }
          age={inputs.age}
          onAgeChange={(age) => setInputs((current) => ({ ...current, age }))}
          epfCategory={inputs.epfCategory}
          onEpfCategoryChange={(epfCategory) =>
            setInputs((current) => ({ ...current, epfCategory }))
          }
          hasSpouseRelief={inputs.taxReliefs.hasSpouseRelief}
          onSpouseReliefChange={(hasSpouseRelief) =>
            setTaxRelief("hasSpouseRelief", hasSpouseRelief)
          }
          hasDisabledSpouseRelief={
            inputs.taxReliefs.hasDisabledSpouseRelief
          }
          onDisabledSpouseReliefChange={(hasDisabledSpouseRelief) =>
            setTaxRelief("hasDisabledSpouseRelief", hasDisabledSpouseRelief)
          }
          numberOfChildrenUnder18={inputs.taxReliefs.numberOfChildrenUnder18}
          onNumberOfChildrenUnder18Change={(numberOfChildrenUnder18) =>
            setTaxRelief("numberOfChildrenUnder18", numberOfChildrenUnder18)
          }
          numberOfChildren18PlusEducation={
            inputs.taxReliefs.numberOfChildren18PlusEducation
          }
          onNumberOfChildren18PlusEducationChange={(
            numberOfChildren18PlusEducation,
          ) =>
            setTaxRelief(
              "numberOfChildren18PlusEducation",
              numberOfChildren18PlusEducation,
            )
          }
          numberOfChildrenTertiary={inputs.taxReliefs.numberOfChildrenTertiary}
          onNumberOfChildrenTertiaryChange={(numberOfChildrenTertiary) =>
            setTaxRelief("numberOfChildrenTertiary", numberOfChildrenTertiary)
          }
          numberOfDisabledChildren={
            inputs.taxReliefs.numberOfDisabledChildren
          }
          onNumberOfDisabledChildrenChange={(numberOfDisabledChildren) =>
            setTaxRelief("numberOfDisabledChildren", numberOfDisabledChildren)
          }
          numberOfDisabledChildrenTertiary={
            inputs.taxReliefs.numberOfDisabledChildrenTertiary
          }
          onNumberOfDisabledChildrenTertiaryChange={(
            numberOfDisabledChildrenTertiary,
          ) =>
            setTaxRelief(
              "numberOfDisabledChildrenTertiary",
              numberOfDisabledChildrenTertiary,
            )
          }
          isDisabled={inputs.taxReliefs.isDisabled}
          onDisabledChange={(isDisabled) =>
            setTaxRelief("isDisabled", isDisabled)
          }
        />
      }
      contributions={
        <MYContributionOptions
          voluntaryEpfContribution={Math.min(
            inputs.contributions.voluntaryEpfContribution,
            voluntaryEpfLimit,
          )}
          onVoluntaryEpfContributionChange={(voluntaryEpfContribution) =>
            setInputs((current) => ({
              ...current,
              contributions: {
                ...current.contributions,
                voluntaryEpfContribution: clampAmount(
                  voluntaryEpfContribution,
                  voluntaryEpfLimit,
                ),
              },
            }))
          }
          voluntaryEpfLimit={voluntaryEpfLimit}
          prsContribution={Math.min(
            inputs.contributions.prsContribution,
            prsLimit,
          )}
          onPrsContributionChange={(prsContribution) =>
            setInputs((current) => ({
              ...current,
              contributions: {
                ...current.contributions,
                prsContribution: clampAmount(prsContribution, prsLimit),
              },
            }))
          }
          prsLimit={prsLimit}
          parentMedicalRelief={inputs.taxReliefs.parentMedicalRelief}
          onParentMedicalReliefChange={(value) =>
            setTaxReliefAmount(
              "parentMedicalRelief",
              value,
              MY_RELIEFS_YA_2025.parentMedical,
            )
          }
          supportingEquipmentRelief={
            inputs.taxReliefs.supportingEquipmentRelief
          }
          onSupportingEquipmentReliefChange={(value) =>
            setTaxReliefAmount(
              "supportingEquipmentRelief",
              value,
              MY_RELIEFS_YA_2025.supportingEquipment,
            )
          }
          selfEducationFees={inputs.taxReliefs.selfEducationFees}
          onSelfEducationFeesChange={(value) =>
            setTaxReliefAmount(
              "selfEducationFees",
              value,
              MY_RELIEFS_YA_2025.selfEducation,
            )
          }
          lifestyleRelief={inputs.taxReliefs.lifestyleRelief}
          onLifestyleReliefChange={(lifestyleRelief) =>
            setTaxReliefAmount(
              "lifestyleRelief",
              lifestyleRelief,
              MY_RELIEFS_YA_2025.lifestyle,
            )
          }
          sportsLifestyleRelief={inputs.taxReliefs.sportsLifestyleRelief}
          onSportsLifestyleReliefChange={(value) =>
            setTaxReliefAmount(
              "sportsLifestyleRelief",
              value,
              MY_RELIEFS_YA_2025.sportsLifestyle,
            )
          }
          medicalRelief={inputs.taxReliefs.medicalRelief}
          onMedicalReliefChange={(medicalRelief) =>
            setTaxReliefAmount(
              "medicalRelief",
              medicalRelief,
              MY_RELIEFS_YA_2025.medical,
            )
          }
          breastfeedingEquipmentRelief={
            inputs.taxReliefs.breastfeedingEquipmentRelief
          }
          onBreastfeedingEquipmentReliefChange={(value) =>
            setTaxReliefAmount(
              "breastfeedingEquipmentRelief",
              value,
              MY_RELIEFS_YA_2025.breastfeedingEquipment,
            )
          }
          childcareFees={inputs.taxReliefs.childcareFees}
          onChildcareFeesChange={(value) =>
            setTaxReliefAmount("childcareFees", value, MY_RELIEFS_YA_2025.childcare)
          }
          sspnNetSavings={inputs.taxReliefs.sspnNetSavings}
          onSspnNetSavingsChange={(value) =>
            setTaxReliefAmount("sspnNetSavings", value, MY_RELIEFS_YA_2025.sspn)
          }
          educationMedicalInsurance={inputs.taxReliefs.educationMedicalInsurance}
          onEducationMedicalInsuranceChange={(value) =>
            setTaxReliefAmount(
              "educationMedicalInsurance",
              value,
              MY_RELIEFS_YA_2025.educationMedicalInsurance,
            )
          }
          lifeInsuranceRelief={inputs.taxReliefs.lifeInsuranceRelief}
          onLifeInsuranceReliefChange={(value) =>
            setTaxReliefAmount(
              "lifeInsuranceRelief",
              value,
              MY_RELIEFS_YA_2025.lifeInsurance,
            )
          }
          evChargingRelief={inputs.taxReliefs.evChargingRelief}
          onEvChargingReliefChange={(value) =>
            setTaxReliefAmount(
              "evChargingRelief",
              value,
              MY_RELIEFS_YA_2025.evCharging,
            )
          }
          firstHomePriceBand={inputs.taxReliefs.firstHomePriceBand}
          onFirstHomePriceBandChange={(firstHomePriceBand) =>
            setInputs((current) => ({
              ...current,
              taxReliefs: {
                ...current.taxReliefs,
                firstHomePriceBand,
                firstHomeLoanInterest: Math.min(
                  current.taxReliefs.firstHomeLoanInterest,
                  getMYFirstHomeLoanInterestLimit(firstHomePriceBand),
                ),
              },
            }))
          }
          firstHomeLoanInterest={Math.min(
            inputs.taxReliefs.firstHomeLoanInterest,
            firstHomeLoanInterestLimit,
          )}
          onFirstHomeLoanInterestChange={(value) =>
            setTaxReliefAmount(
              "firstHomeLoanInterest",
              value,
              firstHomeLoanInterestLimit,
            )
          }
          firstHomeLoanInterestLimit={firstHomeLoanInterestLimit}
          approvedDonations={Math.min(
            inputs.taxReliefs.approvedDonations,
            approvedDonationLimit,
          )}
          onApprovedDonationsChange={(value) =>
            setTaxReliefAmount("approvedDonations", value, approvedDonationLimit)
          }
          approvedDonationLimit={approvedDonationLimit}
          zakatFitrah={Math.min(inputs.taxReliefs.zakatFitrah, zakatFitrahLimit)}
          onZakatFitrahChange={(value) =>
            setTaxReliefAmount("zakatFitrah", value, zakatFitrahLimit)
          }
          zakatFitrahLimit={zakatFitrahLimit}
          departureLevyRebate={Math.min(
            inputs.taxReliefs.departureLevyRebate,
            MY_RELIEFS_YA_2025.departureLevyRebate,
          )}
          onDepartureLevyRebateChange={(value) =>
            setTaxReliefAmount(
              "departureLevyRebate",
              value,
              MY_RELIEFS_YA_2025.departureLevyRebate,
            )
          }
        />
      }
      contributionsTitle="Malaysia EPF, PRS, and Relief Inputs"
      contributionsDescription="YA 2025 resident reliefs, rebates, voluntary EPF, and PRS inputs"
      seoInfo={<MYTaxInfo />}
      infoCard={
        <InfoPanel title="Malaysia Payroll Scope">
          <p>
            This models Malaysia employment income with resident progressive tax
            or non-resident flat tax, EPF by age and member category, SOCSO,
            EIS, family reliefs, voluntary EPF, PRS, lifestyle, education,
            medical, insurance, childcare, housing interest, donation, and
            resident rebate inputs.
          </p>
          <p className="mt-2">
            The model keeps employer EPF/SOCSO/EIS separate from employee
            take-home pay. Non-residents use the flat employment tax without
            resident reliefs or rebates.
          </p>
        </InfoPanel>
      }
    />
  );
}

function MYTaxInfoContent() {
  return (
    <div>
      <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">Malaysia</h3>
      <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
        <li>
          <strong className="text-zinc-300">Individual Income Tax</strong> –
          Resident YA 2025 progressive rates from 0% to 30%
        </li>
        <li>
          <strong className="text-zinc-300">Non-Residents</strong> – Employment
          income modeled at the flat 30% non-resident individual rate
        </li>
        <li>
          <strong className="text-zinc-300">EPF/KWSP</strong> – Mandatory
          employee retirement contribution by age and membership category
        </li>
        <li>
          <strong className="text-zinc-300">SOCSO</strong> – 0.5% employee share,
          capped at the RM6,000 monthly wage ceiling
        </li>
        <li>
          <strong className="text-zinc-300">EIS</strong> – 0.2% employee share for
          eligible employees below age 60, also capped at RM6,000/month
        </li>
        <li>
          <strong className="text-zinc-300">Resident Reliefs</strong> – Personal,
          spouse, child, disability, EPF, PRS, SOCSO, insurance, education,
          medical, childcare, SSPN, lifestyle, housing-interest, and donation
          reliefs are modeled
        </li>
        <li>
          <strong className="text-zinc-300">Resident Rebates</strong> – Low
          chargeable-income individual/spouse rebate, zakat or fitrah, and
          departure-levy rebate inputs reduce income tax where applicable
        </li>
      </ul>

      <h4 className="text-md font-medium text-zinc-300 mt-4 mb-2">
        YA 2025 Resident Tax Brackets
      </h4>
      <ul className="text-zinc-400 space-y-1 mt-2 list-disc list-inside text-sm">
        <li>RM0 – RM5,000: 0%</li>
        <li>RM5,001 – RM20,000: 1%</li>
        <li>RM20,001 – RM35,000: 3%</li>
        <li>RM35,001 – RM50,000: 6%</li>
        <li>RM50,001 – RM70,000: 11%</li>
        <li>RM70,001 – RM100,000: 19%</li>
        <li>RM100,001 – RM400,000: 25%</li>
        <li>RM400,001 – RM600,000: 26%</li>
        <li>RM600,001 – RM2,000,000: 28%</li>
        <li>RM2,000,001+: 30%</li>
      </ul>

      <h4 className="text-md font-medium text-zinc-300 mt-4 mb-2">
        EPF, SOCSO, and EIS Assumptions
      </h4>
      <ul className="text-zinc-400 space-y-1 mt-2 list-disc list-inside text-sm">
        <li>Citizen EPF below age 60: 11% employee share</li>
        <li>Citizen EPF age 60 and above: 0% employee share</li>
        <li>Non-citizen post-1998 EPF: 2% employee share</li>
        <li>SOCSO employee share: 0.5% up to RM6,000 monthly wage base</li>
        <li>EIS employee share: 0.2% up to RM6,000 monthly wage base</li>
      </ul>

      <p className="text-zinc-400 text-sm mt-3">
        The calculator uses HASiL YA 2025 rates and reliefs, KWSP rates effective
        for October 2025 wages onward, and PERKESO contribution rates with the
        RM6,000 wage ceiling. Director fee treatment, employer-only costs, and
        irregular wage contribution tables are separate payroll facts rather than
        resident salary relief inputs.
      </p>
    </div>
  );
}

function MYTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="mb-4 text-xl font-semibold text-zinc-200">
        How Malaysia Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <MYTaxInfoContent />
      </div>
    </section>
  );
}
