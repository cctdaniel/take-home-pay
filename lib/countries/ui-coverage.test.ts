import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { COUNTRY_MODELED_INPUT_LABELS } from "@/components/compare/country-modeled-inputs.generated";
import { describe, expect, it } from "vitest";
import {
  SUPPORTED_COUNTRIES,
  getCountryCalculator,
  getDefaultInputs,
} from "./registry";
import type { CountryCode } from "./types";

const rootDir = process.cwd();
const countryPageContentPath = path.join(
  rootDir,
  "lib/countries/country-page-content.ts",
);

const CONTROL_PATTERNS = {
  payFrequency: /<PayFrequencyField\b/g,
  select: /<SelectField(?=[\s<])/g,
  booleanSelect: /<BooleanSelectField\b/g,
  number: /<NumberField\b/g,
  numberStepper: /<NumberStepperField\b/g,
  currency: /<CurrencyAmountField\b/g,
  slider: /<ContributionSlider\b/g,
};

function countryDir(country: CountryCode) {
  return country.toLowerCase();
}

function readIfExists(filePath: string) {
  return existsSync(filePath) ? readFileSync(filePath, "utf8") : "";
}

function getImportedCalculatorComponentSource(extensionSource: string) {
  const importedSources: string[] = [];
  const importPattern =
    /from\s+["']@\/components\/calculator\/([^"']+)["']/g;
  const ignoredPrefixes = [
    "calculator-fields",
    "country-extension",
    "info-panel",
    "results/",
  ];

  for (const match of extensionSource.matchAll(importPattern)) {
    const importPath = match[1];

    if (ignoredPrefixes.some((prefix) => importPath.startsWith(prefix))) {
      continue;
    }

    const candidates = [
      path.join(rootDir, "components/calculator", `${importPath}.tsx`),
      path.join(rootDir, "components/calculator", importPath, "index.tsx"),
    ];
    const importedSource = candidates.map(readIfExists).find(Boolean);

    if (importedSource) {
      importedSources.push(importedSource);
    }
  }

  return importedSources.join("\n");
}

function getExtensionSource(country: CountryCode) {
  const filePath = path.join(
    rootDir,
    "components/calculator/country-extensions",
    `${countryDir(country)}.tsx`,
  );
  return readIfExists(filePath);
}

function getCalculatorSource(country: CountryCode) {
  return readIfExists(
    path.join(rootDir, "lib/countries", countryDir(country), "calculator.ts"),
  );
}

function getConstantsSource(country: CountryCode) {
  const constantsDir = path.join(
    rootDir,
    "lib/countries",
    countryDir(country),
    "constants",
  );

  if (!existsSync(constantsDir)) {
    return "";
  }

  return readdirSync(constantsDir)
    .filter((file) => file.endsWith(".ts"))
    .map((file) => readIfExists(path.join(constantsDir, file)))
    .join("\n");
}

function getResultSource(country: CountryCode) {
  return readIfExists(
    path.join(
      rootDir,
      "components/calculator/results",
      `${countryDir(country)}-result-breakdown.tsx`,
    ),
  );
}

function getVisibleSource(extensionSource: string) {
  return `${extensionSource}\n${getImportedCalculatorComponentSource(extensionSource)}`;
}

function countPattern(source: string, pattern: RegExp) {
  return (source.match(pattern) ?? []).length;
}

function getControlCounts(source: string) {
  return Object.fromEntries(
    Object.entries(CONTROL_PATTERNS).map(([key, pattern]) => [
      key,
      countPattern(source, pattern),
    ]),
  ) as Record<keyof typeof CONTROL_PATTERNS, number>;
}

function getExtensionScore(source: string) {
  const controls = getControlCounts(source);

  return (
    controls.slider * 3 +
    controls.number * 2 +
    controls.numberStepper * 2 +
    controls.select +
    controls.booleanSelect +
    controls.currency +
    controls.payFrequency
  );
}

function getNumberFieldLabels(source: string) {
  return Array.from(
    source.matchAll(/<NumberField(?=[\s<])(?:<[^>]+>)?[\s\S]*?\/>/g),
  )
    .map((match) => {
      const labelMatch = match[0].match(/label=(?:"([^"]+)"|'([^']+)')/);
      return labelMatch?.[1] ?? labelMatch?.[2];
    })
    .filter((label): label is string => Boolean(label));
}

function isCountLikeLabel(label: string) {
  return (
    /\b(child|children|dependent|dependant|parent|sibling|spouse)\b/i.test(
      label,
    ) && !/\b(age|days|credit points?|capital sum|income)\b/i.test(label)
  );
}

function getCountryPageContentSource() {
  return readFileSync(countryPageContentPath, "utf8");
}

function getObjectBlock(source: string, objectName: string) {
  const start = source.indexOf(`const ${objectName}`);
  const next = source.indexOf("\nconst ", start + 1);

  return source.slice(start, next === -1 ? source.length : next);
}

function getCountryEntryBlock(objectBlock: string, country: CountryCode) {
  const start = objectBlock.search(new RegExp(`\\n\\s{2}${country}:`));

  if (start === -1) {
    return "";
  }

  const rest = objectBlock.slice(start + 1);
  const next = rest.search(/\n\s{2}[A-Z]{2}:/);

  return rest.slice(0, next === -1 ? undefined : next);
}

describe("country calculator UI coverage", () => {
  it("passes the generated strict country audit", () => {
    const output = execFileSync(
      process.execPath,
      ["scripts/audit-country-coverage.mjs", "--json"],
      {
        cwd: rootDir,
        encoding: "utf8",
      },
    );
    const audit = JSON.parse(output) as {
      results: unknown[];
      failures: string[];
      warnings: string[];
    };

    expect(audit.results.length).toBe(SUPPORTED_COUNTRIES.length);
    expect(audit.failures).toEqual([]);
    expect(audit.warnings).toEqual([]);
  });

  it("has explicit localized SEO and header copy for every supported country", () => {
    const source = getCountryPageContentSource();
    const descriptionBlock = getObjectBlock(source, "COUNTRY_DESCRIPTIONS");
    const keywordBlock = getObjectBlock(source, "COUNTRY_KEYWORDS");
    const headerBlock = getObjectBlock(source, "COUNTRY_HEADER_INFO");

    for (const country of SUPPORTED_COUNTRIES) {
      const descriptionEntry = getCountryEntryBlock(descriptionBlock, country);
      const keywordEntry = getCountryEntryBlock(keywordBlock, country);
      const headerEntry = getCountryEntryBlock(headerBlock, country);

      expect(descriptionEntry, `${country} SEO description override`).not.toBe("");
      expect(keywordEntry, `${country} SEO keyword override`).not.toBe("");
      expect(headerEntry, `${country} header override`).not.toBe("");
      expect(
        descriptionEntry.length,
        `${country} SEO description entry length`,
      ).toBeGreaterThan(
        120,
      );
      expect(
        (keywordEntry.match(/"[^"]+"/g) ?? []).length,
        `${country} SEO keyword count`,
      ).toBeGreaterThanOrEqual(
        6,
      );
      expect(headerEntry, `${country} header tagline`).toContain("tagline");
      expect(headerEntry, `${country} header details`).toContain("details");
      expect(
        headerEntry.length,
        `${country} header entry length`,
      ).toBeGreaterThan(
        60,
      );
    }
  });

  it("uses a custom country extension with localized controls for every supported country", () => {
    for (const country of SUPPORTED_COUNTRIES) {
      const extensionSource = getExtensionSource(country);
      const visibleSource = getVisibleSource(extensionSource);

      expect(extensionSource, `${country} extension source`).not.toBe("");
      expect(
        extensionSource,
        `${country} extension shell`,
      ).toContain("CountryCalculatorExtensionShell");
      expect(
        getExtensionScore(visibleSource),
        `${country} visible localized control score`,
      ).toBeGreaterThanOrEqual(3);
    }
  });

  it("surfaces modeled capped contribution limits through standardized sliders", () => {
    for (const country of SUPPORTED_COUNTRIES) {
      const calculator = getCountryCalculator(country);
      const defaultInputs = getDefaultInputs(country);
      const contributionInputs =
        "contributions" in defaultInputs && defaultInputs.contributions
          ? defaultInputs.contributions
          : {};
      const limits = Object.entries(
        calculator.getContributionLimits(defaultInputs),
      ).filter(
        ([key, limit]) =>
          key in contributionInputs &&
          Number.isFinite(limit.limit) &&
          limit.limit > 0,
      );

      if (limits.length === 0) {
        continue;
      }

      const extensionSource = getExtensionSource(country);
      const visibleSource = getVisibleSource(extensionSource);

      expect(
        visibleSource,
        `${country} has positive modeled contribution limits: ${limits
          .map(([key]) => key)
          .join(", ")}`,
      ).toMatch(/<ContributionSlider\b/);

      for (const [key] of limits) {
        expect(
          visibleSource.includes(key) ||
            /Object\.entries\(\s*contributionLimits\s*\)/.test(visibleSource),
          `${country} positive modeled contribution limit "${key}" should be wired to the country UI`,
        ).toBe(true);
      }
    }
  });

  it("publishes full country-specific modeled controls for compare snapshots", () => {
    for (const country of SUPPORTED_COUNTRIES) {
      const calculator = getCountryCalculator(country);
      const defaultInputs = getDefaultInputs(country);
      const modeledLabels = COUNTRY_MODELED_INPUT_LABELS[country] ?? [];
      const contributionLimitLabels = Object.values(
        calculator.getContributionLimits(defaultInputs),
      )
        .filter((limit) =>
          Number.isFinite(limit.limit) ? limit.limit > 0 : true,
        )
        .map((limit) => limit.name);
      const availableCompareLabels = [
        ...modeledLabels,
        ...contributionLimitLabels,
      ];

      expect(
        availableCompareLabels.length,
        `${country} compare snapshot should list full country-specific controls, not only one retirement/contribution input`,
      ).toBeGreaterThan(0);

      if (getControlCounts(getVisibleSource(getExtensionSource(country))).slider > 0) {
        expect(
          modeledLabels.length,
          `${country} compare metadata should include visible labels for modeled contribution sliders`,
        ).toBeGreaterThan(0);
      }

      for (const label of contributionLimitLabels) {
        expect(
          modeledLabels,
          `${country} compare metadata should include contribution limit label "${label}"`,
        ).toContain(label);
      }
    }
  });

  it("explains countries without contribution sliders instead of leaving an empty tax-saving area", () => {
    const reasonPattern =
      /no personal income tax|no .*income tax|not a general employee|selected above|require separate|need .*facts|not shown as annual sliders|no .*voluntary contribution slider/i;

    for (const country of SUPPORTED_COUNTRIES) {
      const extensionSource = getExtensionSource(country);
      const visibleSource = getVisibleSource(extensionSource);

      if (getControlCounts(visibleSource).slider > 0) {
        continue;
      }

      expect(
        extensionSource,
        `${country} should show a visible reason when there are no tax-saving sliders`,
      ).toContain("contributionsEmptyState");
      expect(
        extensionSource,
        `${country} empty contribution state should explain the legal/payroll reason`,
      ).toMatch(reasonPattern);
    }
  });

  it("uses steppers instead of free-form numbers for count-like dependent inputs", () => {
    for (const country of SUPPORTED_COUNTRIES) {
      const extensionSource = getExtensionSource(country);
      const visibleSource = getVisibleSource(extensionSource);
      const countLikeNumberField = getNumberFieldLabels(visibleSource).find(
        isCountLikeLabel,
      );

      expect(
        countLikeNumberField,
        `${country} count-like field should use NumberStepperField`,
      ).toBeUndefined();
    }
  });

  it("uses shared calculator primitives instead of raw form controls in country option UIs", () => {
    const rawControlPatterns = [
      /from\s+["']@\/components\/ui\/switch["']/,
      /<Switch\b/,
      /<input\b/,
      /<select\b/,
      /<textarea\b/,
    ];

    for (const country of SUPPORTED_COUNTRIES) {
      const extensionSource = getExtensionSource(country);
      const visibleSource = getVisibleSource(extensionSource);

      for (const pattern of rawControlPatterns) {
        expect(
          visibleSource,
          `${country} country UI should compose shared calculator fields instead of raw form controls`,
        ).not.toMatch(pattern);
      }
    }
  });

  it("does not use ambiguous generic outside-model copy", () => {
    const forbiddenPatterns = [
      /outside this salary model unless shown as a separate input/i,
      /local surtaxes,\s*employer-only costs,\s*special expat regimes,\s*self-employment systems,\s*in-kind benefits,\s*and treaty positions/i,
      /Items Outside This Salary Model/i,
      /No separate local[-\s]surtax or expat[-\s]regime switch/i,
      /hidden salary (inputs|sliders)/i,
    ];

    for (const country of SUPPORTED_COUNTRIES) {
      const countrySource = [
        getCalculatorSource(country),
        getConstantsSource(country),
        getExtensionSource(country),
        getResultSource(country),
      ].join("\n");

      for (const pattern of forbiddenPatterns) {
        expect(
          countrySource,
          `${country} should explain non-salary facts specifically instead of using generic outside-model copy`,
        ).not.toMatch(pattern);
      }
    }
  });
});
