import { describe, expect, it } from "vitest";
import { QACalculator } from "./calculator";

describe("QA calculator smoke", () => {
  it("returns full gross for expatriate default inputs", () => {
    const result = QACalculator.calculate(QACalculator.getDefaultInputs());
    expect(result.country).toBe("QA");
    expect(result.totalTax).toBe(0);
    expect(result.netSalary).toBe(result.grossSalary);
  });

  it("deducts 5% social insurance for Qatari nationals", () => {
    const result = QACalculator.calculate({
      ...QACalculator.getDefaultInputs(),
      nationality: "qatari_national",
    });
    expect(result.totalTax).toBe(12_600);
    expect(result.netSalary).toBe(347_400);
  });
});
