"use client";

import { SelectField } from "@/components/calculator/calculator-fields";
import { InfoPanel } from "@/components/calculator/info-panel";
import { ContributionSlider } from "@/components/ui/contribution-slider";
import { MY_RELIEFS_YA_2025 } from "@/lib/countries/my/constants/tax-brackets-2025";
import type { MYTaxReliefInputs } from "@/lib/countries/types";

type MYFirstHomePriceBand = MYTaxReliefInputs["firstHomePriceBand"];

const FIRST_HOME_PRICE_OPTIONS: Array<{
  value: MYFirstHomePriceBand;
  label: string;
}> = [
  { value: "none", label: "No first-home claim" },
  { value: "up_to_500k", label: "SPA price up to RM500k" },
  { value: "500k_to_750k", label: "SPA price RM500k-RM750k" },
];

interface MYContributionOptionsProps {
  voluntaryEpfContribution: number;
  onVoluntaryEpfContributionChange: (value: number) => void;
  voluntaryEpfLimit: number;
  prsContribution: number;
  onPrsContributionChange: (value: number) => void;
  prsLimit: number;
  parentMedicalRelief?: number;
  onParentMedicalReliefChange?: (value: number) => void;
  supportingEquipmentRelief?: number;
  onSupportingEquipmentReliefChange?: (value: number) => void;
  selfEducationFees?: number;
  onSelfEducationFeesChange?: (value: number) => void;
  lifestyleRelief: number;
  onLifestyleReliefChange: (value: number) => void;
  sportsLifestyleRelief?: number;
  onSportsLifestyleReliefChange?: (value: number) => void;
  medicalRelief: number;
  onMedicalReliefChange: (value: number) => void;
  breastfeedingEquipmentRelief?: number;
  onBreastfeedingEquipmentReliefChange?: (value: number) => void;
  childcareFees?: number;
  onChildcareFeesChange?: (value: number) => void;
  sspnNetSavings?: number;
  onSspnNetSavingsChange?: (value: number) => void;
  educationMedicalInsurance?: number;
  onEducationMedicalInsuranceChange?: (value: number) => void;
  lifeInsuranceRelief?: number;
  onLifeInsuranceReliefChange?: (value: number) => void;
  evChargingRelief?: number;
  onEvChargingReliefChange?: (value: number) => void;
  firstHomePriceBand?: MYFirstHomePriceBand;
  onFirstHomePriceBandChange?: (value: MYFirstHomePriceBand) => void;
  firstHomeLoanInterest?: number;
  onFirstHomeLoanInterestChange?: (value: number) => void;
  firstHomeLoanInterestLimit?: number;
  approvedDonations?: number;
  onApprovedDonationsChange?: (value: number) => void;
  approvedDonationLimit?: number;
  zakatFitrah?: number;
  onZakatFitrahChange?: (value: number) => void;
  zakatFitrahLimit?: number;
  departureLevyRebate?: number;
  onDepartureLevyRebateChange?: (value: number) => void;
}

export function MYContributionOptions({
  voluntaryEpfContribution,
  onVoluntaryEpfContributionChange,
  voluntaryEpfLimit,
  prsContribution,
  onPrsContributionChange,
  prsLimit,
  parentMedicalRelief = 0,
  onParentMedicalReliefChange = () => {},
  supportingEquipmentRelief = 0,
  onSupportingEquipmentReliefChange = () => {},
  selfEducationFees = 0,
  onSelfEducationFeesChange = () => {},
  lifestyleRelief,
  onLifestyleReliefChange,
  sportsLifestyleRelief = 0,
  onSportsLifestyleReliefChange = () => {},
  medicalRelief,
  onMedicalReliefChange,
  breastfeedingEquipmentRelief = 0,
  onBreastfeedingEquipmentReliefChange = () => {},
  childcareFees = 0,
  onChildcareFeesChange = () => {},
  sspnNetSavings = 0,
  onSspnNetSavingsChange = () => {},
  educationMedicalInsurance = 0,
  onEducationMedicalInsuranceChange = () => {},
  lifeInsuranceRelief = 0,
  onLifeInsuranceReliefChange = () => {},
  evChargingRelief = 0,
  onEvChargingReliefChange = () => {},
  firstHomePriceBand = "none",
  onFirstHomePriceBandChange = () => {},
  firstHomeLoanInterest = 0,
  onFirstHomeLoanInterestChange = () => {},
  firstHomeLoanInterestLimit = 0,
  approvedDonations = 0,
  onApprovedDonationsChange = () => {},
  approvedDonationLimit = 0,
  zakatFitrah = 0,
  onZakatFitrahChange = () => {},
  zakatFitrahLimit = 0,
  departureLevyRebate = 0,
  onDepartureLevyRebateChange = () => {},
}: MYContributionOptionsProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-sm font-medium uppercase tracking-wider text-zinc-400">
          Retirement and Insurance
        </h3>

        <ContributionSlider
          label="Voluntary EPF (RM/year)"
          value={voluntaryEpfContribution}
          onChange={onVoluntaryEpfContributionChange}
          currency="MYR"
          max={voluntaryEpfLimit}
          step={100}
          description="Extra EPF/i-Topup contribution. EPF relief first shares the RM4,000 EPF bucket, then extra voluntary EPF can fill the RM3,000 life-insurance bucket."
        />

        <ContributionSlider
          label="Private Retirement Scheme (RM/year)"
          value={prsContribution}
          onChange={onPrsContributionChange}
          currency="MYR"
          max={prsLimit}
          step={100}
          description={`PRS relief is capped at RM${prsLimit.toLocaleString()} per year.`}
        />

        <ContributionSlider
          label="Life insurance or family takaful"
          value={lifeInsuranceRelief}
          onChange={onLifeInsuranceReliefChange}
          currency="MYR"
          max={MY_RELIEFS_YA_2025.lifeInsurance}
          step={100}
          description="Life insurance, family takaful, or additional voluntary EPF relief bucket capped at RM3,000."
        />

        <ContributionSlider
          label="Education or medical insurance"
          value={educationMedicalInsurance}
          onChange={onEducationMedicalInsuranceChange}
          currency="MYR"
          max={MY_RELIEFS_YA_2025.educationMedicalInsurance}
          step={100}
          description="Education and medical insurance relief capped at RM4,000."
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-medium uppercase tracking-wider text-zinc-400">
          Family, Care, and Education Reliefs
        </h3>

        <ContributionSlider
          label="Parent or grandparent medical care"
          value={parentMedicalRelief}
          onChange={onParentMedicalReliefChange}
          currency="MYR"
          max={MY_RELIEFS_YA_2025.parentMedical}
          step={100}
          description="Medical treatment, special needs, or carer expenses for parents or grandparents, capped at RM8,000."
        />

        <ContributionSlider
          label="Basic supporting equipment"
          value={supportingEquipmentRelief}
          onChange={onSupportingEquipmentReliefChange}
          currency="MYR"
          max={MY_RELIEFS_YA_2025.supportingEquipment}
          step={100}
          description="Basic supporting equipment for the taxpayer, spouse, child, parent, or grandparent, capped at RM6,000."
        />

        <ContributionSlider
          label="Self education fees"
          value={selfEducationFees}
          onChange={onSelfEducationFeesChange}
          currency="MYR"
          max={MY_RELIEFS_YA_2025.selfEducation}
          step={100}
          description="Qualifying self education fees at approved institutions, capped at RM7,000."
        />

        <ContributionSlider
          label="Registered childcare or kindergarten"
          value={childcareFees}
          onChange={onChildcareFeesChange}
          currency="MYR"
          max={MY_RELIEFS_YA_2025.childcare}
          step={100}
          description="Child-care centre or kindergarten fees for children age 6 and below, capped at RM3,000."
        />

        <ContributionSlider
          label="Net SSPN savings"
          value={sspnNetSavings}
          onChange={onSspnNetSavingsChange}
          currency="MYR"
          max={MY_RELIEFS_YA_2025.sspn}
          step={100}
          description="Net deposit into Skim Simpanan Pendidikan Nasional, capped at RM8,000."
        />

        <ContributionSlider
          label="Breastfeeding equipment"
          value={breastfeedingEquipmentRelief}
          onChange={onBreastfeedingEquipmentReliefChange}
          currency="MYR"
          max={MY_RELIEFS_YA_2025.breastfeedingEquipment}
          step={100}
          description="Breastfeeding equipment for a child age 2 and below, capped at RM1,000."
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-medium uppercase tracking-wider text-zinc-400">
          Lifestyle, Medical, Housing, and Gifts
        </h3>

        <ContributionSlider
          label="Lifestyle relief"
          value={lifestyleRelief}
          onChange={onLifestyleReliefChange}
          currency="MYR"
          max={MY_RELIEFS_YA_2025.lifestyle}
          step={100}
          description="Books, devices, internet, sport equipment, and qualifying lifestyle expenses, capped at RM2,500."
        />

        <ContributionSlider
          label="Additional sports relief"
          value={sportsLifestyleRelief}
          onChange={onSportsLifestyleReliefChange}
          currency="MYR"
          max={MY_RELIEFS_YA_2025.sportsLifestyle}
          step={100}
          description="Additional sports equipment, facility rental, competition, or training fees, capped at RM1,000."
        />

        <ContributionSlider
          label="Medical relief"
          value={medicalRelief}
          onChange={onMedicalReliefChange}
          currency="MYR"
          max={MY_RELIEFS_YA_2025.medical}
          step={100}
          description="Selected medical treatment, check-up, vaccination, dental, or intervention expenses, capped at RM10,000."
        />

        <ContributionSlider
          label="EV charging or composting equipment"
          value={evChargingRelief}
          onChange={onEvChargingReliefChange}
          currency="MYR"
          max={MY_RELIEFS_YA_2025.evCharging}
          step={100}
          description="Qualifying EV charging or food-waste composting equipment relief capped at RM2,500."
        />

        <SelectField
          id="my-first-home-price-band"
          label="First-home loan interest cap"
          value={firstHomePriceBand}
          onChange={onFirstHomePriceBandChange}
          options={FIRST_HOME_PRICE_OPTIONS}
          description="Select the SPA price band for the YA 2025 first-home loan interest relief."
        />

        {firstHomeLoanInterestLimit > 0 ? (
          <ContributionSlider
            label="First-home loan interest"
            value={firstHomeLoanInterest}
            onChange={onFirstHomeLoanInterestChange}
            currency="MYR"
            max={firstHomeLoanInterestLimit}
            step={100}
            description={`Housing loan interest relief capped at RM${firstHomeLoanInterestLimit.toLocaleString()} for the selected first-home price band.`}
          />
        ) : null}

        <ContributionSlider
          label="Approved donations and gifts"
          value={approvedDonations}
          onChange={onApprovedDonationsChange}
          currency="MYR"
          max={approvedDonationLimit}
          step={100}
          description="Approved donations or gifts subject to the 10% aggregate-income limit."
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-medium uppercase tracking-wider text-zinc-400">
          Resident Tax Rebates
        </h3>

        <ContributionSlider
          label="Zakat or fitrah"
          value={zakatFitrah}
          onChange={onZakatFitrahChange}
          currency="MYR"
          max={zakatFitrahLimit}
          step={100}
          description="Zakat or fitrah paid to an Islamic religious authority, capped at the remaining tax charged."
        />

        <ContributionSlider
          label="Departure levy rebate"
          value={departureLevyRebate}
          onChange={onDepartureLevyRebateChange}
          currency="MYR"
          max={MY_RELIEFS_YA_2025.departureLevyRebate}
          step={10}
          description="Religious travel departure-levy rebate, modeled up to RM300 for two overseas trips."
        />
      </div>

      <InfoPanel title="Malaysia assumptions" tone="neutral">
        Mandatory EPF, SOCSO, and EIS are calculated automatically. YA 2025
        resident reliefs and rebates above use HASiL caps; non-residents use
        the flat employment tax without resident reliefs.
      </InfoPanel>
    </div>
  );
}
