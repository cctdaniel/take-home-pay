// Golden checks vs Bahrain NBR and SIO salary rules.
// https://www.nbr.gov.bh/ | https://www.sio.gov.bh/

import { describe, expect, it } from "vitest";
import { BHCalculator } from "./calculator";

describe("BH calculator", () => {
  it("has zero PIT for expatriates with unemployment on capped base", () => {
    const result = BHCalculator.calculate({
      ...BHCalculator.getDefaultInputs(),
      grossSalary: 60_000,
      nationality: "expatriate",
    });

    expect(result.taxes.incomeTax).toBe(0);
    expect(result.taxes.socialInsuranceEmployee).toBe(480);
    expect(result.netSalary).toBe(59_520);
  });

  it("withholds 8% SIO for Bahraini nationals on capped base", () => {
    const result = BHCalculator.calculate({
      ...BHCalculator.getDefaultInputs(),
      grossSalary: 60_000,
      nationality: "bahraini_national",
    });

    expect(result.taxes.incomeTax).toBe(0);
    expect(result.taxes.socialInsuranceEmployee).toBe(3_840);
    expect(result.netSalary).toBe(56_160);
  });

  it("caps social base at BHD 4,000/month annualized", () => {
    const result = BHCalculator.calculate({
      ...BHCalculator.getDefaultInputs(),
      grossSalary: 100_000,
      nationality: "bahraini_national",
    });

    expect(result.taxes.socialInsuranceEmployee).toBe(3_840);
  });

  it("has zero deductions on zero gross", () => {
    const result = BHCalculator.calculate({
      ...BHCalculator.getDefaultInputs(),
      grossSalary: 0,
    });

    expect(result.totalTax).toBe(0);
    expect(result.netSalary).toBe(0);
  });

  it("defaults to expatriate nationality", () => {
    const defaults = BHCalculator.getDefaultInputs();
    expect(defaults.nationality).toBe("expatriate");
  });
});
