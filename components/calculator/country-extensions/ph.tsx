"use client";

import {
  BooleanSelectField,
  CalculatorFieldGrid,
  PayFrequencyField,
  SelectField,
} from "@/components/calculator/calculator-fields";
import {
  CountryCalculatorExtensionShell,
  useCountryCalculatorExtension,
} from "@/components/calculator/country-extension";
import { InfoPanel } from "@/components/calculator/info-panel";
import { ContributionSlider } from "@/components/ui/contribution-slider";
import { getCountryCalculator } from "@/lib/countries/registry";
import {
  PH_13TH_MONTH_AND_OTHER_BENEFITS_EXEMPT_LIMIT,
  PH_DE_MINIMIS_BENEFIT_LIMITS_2026,
  PH_PAGIBIG_2026,
  PH_PHILHEALTH_2026,
  PH_SSS_2026,
} from "@/lib/countries/ph/constants/tax-parameters-2026";
import type {
  PHCalculatorInputs,
  PHContributionInputs,
  PHTaxpayerType,
} from "@/lib/countries/types";
import type { CountryCalculatorExtensionProps } from "../country-extension";

const PH_TAXPAYER_TYPE_OPTIONS: Array<{
  value: PHTaxpayerType;
  label: string;
}> = [
  { value: "residentOrNraEtb", label: "Resident / NRA engaged in trade" },
  { value: "nraNotEngaged", label: "NRA not engaged in trade" },
];

const DE_MINIMIS_KEYS: Array<keyof PHContributionInputs> = [
  "deMinimisMedicalCashAllowance",
  "deMinimisRiceSubsidy",
  "deMinimisUniformClothing",
  "deMinimisActualMedicalAssistance",
  "deMinimisLaundryAllowance",
  "deMinimisAchievementAwards",
  "deMinimisChristmasGifts",
  "deMinimisCbaProductivityIncentives",
];

export default function PHCountryExtension({
  country,
}: CountryCalculatorExtensionProps) {
  const {
    inputs,
    currency,
    result,
    setGrossSalary,
    setPayFrequency,
    setInputs,
  } =
    useCountryCalculatorExtension<PHCalculatorInputs>(country);
  const contributionLimits = getCountryCalculator(country).getContributionLimits(inputs);
  const thirteenthMonthLimit =
    contributionLimits.thirteenthMonthAndOtherBenefits?.limit ?? 0;

  const setTaxpayerType = (taxpayerType: PHTaxpayerType) => {
    setInputs((current) => ({
      ...current,
      taxpayerType,
      contributions: {
        ...current.contributions,
        thirteenthMonthAndOtherBenefits:
          taxpayerType === "nraNotEngaged"
            ? 0
            : current.contributions.thirteenthMonthAndOtherBenefits,
        deMinimisMedicalCashAllowance:
          taxpayerType === "nraNotEngaged"
            ? 0
            : current.contributions.deMinimisMedicalCashAllowance,
        deMinimisRiceSubsidy:
          taxpayerType === "nraNotEngaged"
            ? 0
            : current.contributions.deMinimisRiceSubsidy,
        deMinimisUniformClothing:
          taxpayerType === "nraNotEngaged"
            ? 0
            : current.contributions.deMinimisUniformClothing,
        deMinimisActualMedicalAssistance:
          taxpayerType === "nraNotEngaged"
            ? 0
            : current.contributions.deMinimisActualMedicalAssistance,
        deMinimisLaundryAllowance:
          taxpayerType === "nraNotEngaged"
            ? 0
            : current.contributions.deMinimisLaundryAllowance,
        deMinimisAchievementAwards:
          taxpayerType === "nraNotEngaged"
            ? 0
            : current.contributions.deMinimisAchievementAwards,
        deMinimisChristmasGifts:
          taxpayerType === "nraNotEngaged"
            ? 0
            : current.contributions.deMinimisChristmasGifts,
        deMinimisCbaProductivityIncentives:
          taxpayerType === "nraNotEngaged"
            ? 0
            : current.contributions.deMinimisCbaProductivityIncentives,
      },
    }));
  };

  const setCoverage = (
    key: "sssCovered" | "philHealthCovered" | "pagIbigCovered",
    value: boolean,
  ) => {
    setInputs((current) => ({ ...current, [key]: value }));
  };

  const setContribution = (key: keyof PHContributionInputs, amount: number) => {
    const limit = contributionLimits[key]?.limit ?? 0;

    setInputs((current) => ({
      ...current,
      contributions: {
        ...current.contributions,
        [key]: Math.min(Math.max(0, amount), limit),
      },
    }));
  };

  const renderContributionSlider = (key: keyof PHContributionInputs) => {
    const limit = contributionLimits[key]?.limit ?? 0;

    if (limit <= 0) {
      return null;
    }

    return (
      <ContributionSlider
        key={key}
        label={contributionLimits[key]?.name ?? key}
        value={Math.min(inputs.contributions[key] ?? 0, limit)}
        onChange={(amount) => setContribution(key, amount)}
        max={limit}
        step={key === "thirteenthMonthAndOtherBenefits" ? 1_000 : 500}
        currency={currency}
        description={contributionLimits[key]?.description}
      />
    );
  };

  const deMinimisSliders = DE_MINIMIS_KEYS.map(renderContributionSlider).filter(Boolean);

  return (
    <CountryCalculatorExtensionShell
      country={country}
      currency={currency}
      grossSalary={inputs.grossSalary}
      onGrossSalaryChange={setGrossSalary}
      result={result}
      taxOptions={
        <CalculatorFieldGrid columns={2}>
          <PayFrequencyField
            id="ph-pay-frequency"
            value={inputs.payFrequency}
            onChange={setPayFrequency}
          />
          <SelectField
            id="ph-taxpayer-type"
            label="Taxpayer Type"
            value={inputs.taxpayerType}
            onChange={setTaxpayerType}
            options={PH_TAXPAYER_TYPE_OPTIONS}
            description="Most employees use graduated compensation-income rates; NRA not engaged in trade uses 25% gross tax."
          />
          <BooleanSelectField
            id="ph-sss-covered"
            label="SSS Coverage"
            value={inputs.sssCovered}
            onChange={(value) => setCoverage("sssCovered", value)}
            trueLabel="Covered"
            falseLabel="Not covered"
            trueFirst
            description="Employee SSS is 5% of the 2025+ monthly salary credit."
          />
          <BooleanSelectField
            id="ph-philhealth-covered"
            label="PhilHealth Coverage"
            value={inputs.philHealthCovered}
            onChange={(value) => setCoverage("philHealthCovered", value)}
            trueLabel="Covered"
            falseLabel="Not covered"
            trueFirst
            description="Employee share is 2.5% on the capped monthly basic salary."
          />
          <BooleanSelectField
            id="ph-pagibig-covered"
            label="Pag-IBIG Coverage"
            value={inputs.pagIbigCovered}
            onChange={(value) => setCoverage("pagIbigCovered", value)}
            trueLabel="Covered"
            falseLabel="Not covered"
            trueFirst
            description="Employee share is 1% up to PHP 1,500 monthly salary, then 2% up to the current MFS cap."
          />
        </CalculatorFieldGrid>
      }
      contributions={
        thirteenthMonthLimit > 0 ? (
          <div className="space-y-6">
            {renderContributionSlider("thirteenthMonthAndOtherBenefits")}
            {deMinimisSliders.length > 0 ? (
              <>
                <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-3">
                  <p className="text-sm font-medium text-zinc-300">
                    De Minimis Benefits
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    BIR RR 29-2025 itemized annual ceilings. Enter only
                    amounts included in gross compensation.
                  </p>
                </div>
                {deMinimisSliders}
              </>
            ) : null}
          </div>
        ) : undefined
      }
      contributionsTitle="Tax-Exempt Compensation"
      contributionsDescription="13th month, other benefits, and BIR de minimis benefits that reduce taxable compensation but are still paid to you"
      seoInfo={<PHTaxInfo />}
      infoCard={
        <InfoPanel title="Philippines assumptions" tone="neutral">
          <p>
            Modeled with the post-TRAIN compensation income tax brackets,
            employee SSS using the 2025+ PHP{" "}
            {PH_SSS_2026.minMsc.toLocaleString()} to PHP{" "}
            {PH_SSS_2026.maxMsc.toLocaleString()} monthly salary credit range,
            PhilHealth at 2.5% employee share, and Pag-IBIG at the employee rate
            up to a PHP {PH_PAGIBIG_2026.mfsCeiling.toLocaleString()} monthly
            fund salary cap.
          </p>
          <p className="mt-2">
            The 13th month and other benefits exclusion is capped at PHP{" "}
            {PH_13TH_MONTH_AND_OTHER_BENEFITS_EXEMPT_LIMIT.toLocaleString()}.
            RR 29-2025 de minimis caps modeled here include rice subsidy at PHP{" "}
            {(
              PH_DE_MINIMIS_BENEFIT_LIMITS_2026.riceSubsidy / 12
            ).toLocaleString()}{" "}
            per month, uniform/clothing at PHP{" "}
            {PH_DE_MINIMIS_BENEFIT_LIMITS_2026.uniformClothing.toLocaleString()}{" "}
            per year, and the other itemized ceilings shown as sliders.
          </p>
          <p className="mt-2">
            PhilHealth uses the PHP{" "}
            {PH_PHILHEALTH_2026.monthlyFloor.toLocaleString()} floor and PHP{" "}
            {PH_PHILHEALTH_2026.monthlyCeiling.toLocaleString()} ceiling for
            monthly basic salary.
          </p>
          <p className="mt-2">
            Leave-credit valuation, monetized unused vacation leave, overtime
            meal allowance based on minimum wage, night-shift/overtime rules,
            employer shares, MP2 voluntary savings, substituted filing,
            self-employment, and mixed-income rules are not hidden generic
            sliders; they need separate payroll, benefit, or filing facts before
            they can be calculated correctly here.
          </p>
        </InfoPanel>
      }
    />
  );
}

function PHTaxInfoContent() {
  return (
    <div>
      <h3 className="text-lg font-medium text-zinc-300 mt-6 mb-2">Philippines</h3>
      <ul className="text-zinc-400 space-y-1 mt-3 list-disc list-inside">
        <li><strong className="text-zinc-300">Compensation Income Tax</strong> – annual taxable compensation is taxed with the post-TRAIN progressive bands from 0% to 35%.</li>
        <li><strong className="text-zinc-300">SSS</strong> – employee SSS is calculated from the modeled monthly salary credit floor and ceiling.</li>
        <li><strong className="text-zinc-300">PhilHealth</strong> – employee PhilHealth is modeled as the employee share of the premium on the capped monthly base.</li>
        <li><strong className="text-zinc-300">Pag-IBIG</strong> – employee Pag-IBIG is modeled at 1% for very low monthly pay and 2% above that, up to the current monthly fund salary cap.</li>
        <li><strong className="text-zinc-300">13th Month / Other Benefits</strong> – the modeled exempt portion reduces taxable compensation without reducing cash take-home pay.</li>
        <li><strong className="text-zinc-300">Taxable Income</strong> – modeled exempt benefits and mandatory employee SSS, PhilHealth, and Pag-IBIG reduce taxable income before income tax for ordinary compensation income.</li>
      </ul>
      <p className="text-zinc-400 text-sm mt-3">The model assumes salary compensation and includes the itemized de minimis benefit caps shown above. Overtime/night differential detail, substituted filing, voluntary MP2 or extra savings, and self-employed or mixed-income filing rules need separate payroll or filing facts.</p>
    </div>
  );
}

function PHTaxInfo() {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="mb-4 text-xl font-semibold text-zinc-200">
        How Philippines Take Home Pay Is Calculated
      </h2>
      <div className="prose prose-invert prose-zinc prose-sm">
        <PHTaxInfoContent />
      </div>
    </section>
  );
}
