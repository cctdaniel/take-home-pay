import {
  existsSync,
  readdirSync,
  readFileSync,
  statSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, "..");
const strict = process.argv.includes("--strict");
const json = process.argv.includes("--json");
const countryPageContentSource = readIfExists(
  path.join(rootDir, "lib/countries/country-page-content.ts"),
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

const AMBIGUOUS_EXCLUSION_PATTERNS = [
  /outside this salary model unless shown as a separate input/i,
  /local surtaxes,\s*employer-only costs,\s*special expat regimes,\s*self-employment systems,\s*in-kind benefits,\s*and treaty positions/i,
  /Items Outside This Salary Model/i,
  /No separate local[-\s]surtax or expat[-\s]regime switch/i,
  /hidden salary (inputs|sliders)/i,
];

const RAW_COUNTRY_FORM_CONTROL_PATTERNS = [
  /from\s+["']@\/components\/ui\/switch["']/,
  /<Switch\b/,
  /<input\b/,
  /<select\b/,
  /<textarea\b/,
];

const VENDOR_SOURCE_HOST_PATTERNS = [
  /(^|\.)taxsummaries\.pwc\.com$/i,
  /(^|\.)pwc\.com\.tr$/i,
  /(^|\.)mercans\.com$/i,
  /(^|\.)ramco\.com$/i,
  /(^|\.)bdo\.cr$/i,
  /(^|\.)kpmg\.com$/i,
  /(^|\.)mercer\.com$/i,
  /(^|\.)aplusconsulting\.com\.kh$/i,
  /(^|\.)upsilon-consulting\.com$/i,
  /(^|\.)obracun\.me$/i,
  /(^|\.)idconline\.mx$/i,
  /(^|\.)ipc\.rs$/i,
  /(^|\.)prlegal\.rs$/i,
  /(^|\.)dmk\.rs$/i,
  /(^|\.)finanztip\.de$/i,
  /(^|\.)allaboutberlin\.com$/i,
  /(^|\.)vermoegenszentrum\.ch$/i,
];

const OFFICIAL_SOURCE_HOST_PATTERNS = [
  /(^|\.)gov(\.|$)/i,
  /(^|\.)gob(\.|$)/i,
  /(^|\.)gouv(\.|$)/i,
  /(^|\.)gv(\.|$)/i,
  /(^|\.)govt(\.|$)/i,
  /(^|\.)go(\.|$)/i,
  /(^|\.)gub(\.|$)/i,
  /(^|\.)government\./i,
  /(^|\.)admin\.ch$/i,
  /(^|\.)europa\.eu$/i,
  /(^|\.)u\.ae$/i,
  /(^|\.)govern\.ad$/i,
  /(^|\.)cass\.ad$/i,
  /(^|\.)src\.am$/i,
  /(^|\.)arlis\.am$/i,
  /(^|\.)hartak\.am$/i,
  /(^|\.)pufbih\.ba$/i,
  /(^|\.)poreskaupravars\.org$/i,
  /(^|\.)skupstinabd\.ba$/i,
  /(^|\.)finance\.belgium\.be$/i,
  /(^|\.)fin\.belgium\.be$/i,
  /(^|\.)vlaio\.be$/i,
  /(^|\.)socialsecurity\.be$/i,
  /(^|\.)nib-bahamas\.com$/i,
  /(^|\.)socialsecurity\.org\.bz$/i,
  /(^|\.)nra\.bg$/i,
  /(^|\.)minfin\.bg$/i,
  /(^|\.)sii\.cl$/i,
  /(^|\.)spensiones\.cl$/i,
  /(^|\.)belastingdienst\.cw$/i,
  /(^|\.)svbcur\.org$/i,
  /(^|\.)cssz\.cz$/i,
  /(^|\.)croso\.gov\.rs$/i,
  /(^|\.)vzp\.cz$/i,
  /(^|\.)buzer\.de$/i,
  /(^|\.)bundesfinanzministerium\.de$/i,
  /(^|\.)bundesregierung\.de$/i,
  /(^|\.)deutsche-rentenversicherung\.de$/i,
  /(^|\.)vdek\.com$/i,
  /(^|\.)canada\.ca$/i,
  /(^|\.)revenuquebec\.ca$/i,
  /(^|\.)ontario\.ca$/i,
  /(^|\.)skm\.dk$/i,
  /(^|\.)skat\.dk$/i,
  /(^|\.)emta\.ee$/i,
  /(^|\.)sii\.cl$/i,
  /(^|\.)vero\.fi$/i,
  /(^|\.)tela\.fi$/i,
  /(^|\.)rs\.ge$/i,
  /(^|\.)pensions\.ge$/i,
  /(^|\.)aade\.gr$/i,
  /(^|\.)efka\.gov\.gr$/i,
  /(^|\.)ird\.gov\.hk$/i,
  /(^|\.)mpfa\.org\.hk$/i,
  /(^|\.)narodne-novine\.nn\.hr$/i,
  /(^|\.)mirovinsko\.hr$/i,
  /(^|\.)hzzo\.hr$/i,
  /(^|\.)zakon\.hr$/i,
  /(^|\.)pajak\.go\.id$/i,
  /(^|\.)kemenkeu\.go\.id$/i,
  /(^|\.)bpjsketenagakerjaan\.go\.id$/i,
  /(^|\.)revenue\.ie$/i,
  /(^|\.)btl\.gov\.il$/i,
  /(^|\.)skatturinn\.is$/i,
  /(^|\.)island\.is$/i,
  /(^|\.)agenziaentrate\.gov\.it$/i,
  /(^|\.)normattiva\.it$/i,
  /(^|\.)aci\.gov\.it$/i,
  /(^|\.)nta\.go\.jp$/i,
  /(^|\.)mhlw\.go\.jp$/i,
  /(^|\.)tax\.gov\.kh$/i,
  /(^|\.)nssf\.gov\.kh$/i,
  /(^|\.)nps\.or\.kr$/i,
  /(^|\.)nhis\.or\.kr$/i,
  /(^|\.)nts\.go\.kr$/i,
  /(^|\.)pifss\.gov\.kw$/i,
  /(^|\.)ssc\.gov\.jo$/i,
  /(^|\.)ird\.gov\.lk$/i,
  /(^|\.)labourdept\.gov\.lk$/i,
  /(^|\.)epf\.lk$/i,
  /(^|\.)etfb\.lk$/i,
  /(^|\.)vmi\.lt$/i,
  /(^|\.)sodra\.lt$/i,
  /(^|\.)impotsdirects\.public\.lu$/i,
  /(^|\.)guichet\.public\.lu$/i,
  /(^|\.)ccss\.public\.lu$/i,
  /(^|\.)vid\.gov\.lv$/i,
  /(^|\.)tax\.gov\.ma$/i,
  /(^|\.)tgr\.gov\.ma$/i,
  /(^|\.)acaps\.ma$/i,
  /(^|\.)mra\.mu$/i,
  /(^|\.)kwsp\.gov\.my$/i,
  /(^|\.)perkeso\.gov\.my$/i,
  /(^|\.)belastingdienst\.nl$/i,
  /(^|\.)skatteetaten\.no$/i,
  /(^|\.)spf\.gov\.om$/i,
  /(^|\.)taxoman\.gov\.om$/i,
  /(^|\.)css\.gob\.pa$/i,
  /(^|\.)etax2\.mef\.gob\.pa$/i,
  /(^|\.)mef\.gob\.pa$/i,
  /(^|\.)sbs\.gob\.pe$/i,
  /(^|\.)bir\.gov\.ph$/i,
  /(^|\.)sss\.gov\.ph$/i,
  /(^|\.)philhealth\.gov\.ph$/i,
  /(^|\.)podatki\.gov\.pl$/i,
  /(^|\.)zus\.pl$/i,
  /(^|\.)portaldasfinancas\.gov\.pt$/i,
  /(^|\.)dnit\.gov\.py$/i,
  /(^|\.)almeezan\.qa$/i,
  /(^|\.)qna\.org\.qa$/i,
  /(^|\.)anaf\.ro$/i,
  /(^|\.)legislatie\.just\.ro$/i,
  /(^|\.)purs\.gov\.rs$/i,
  /(^|\.)welcometoserbia\.gov\.rs$/i,
  /(^|\.)rra\.gov\.rw$/i,
  /(^|\.)rssb\.rw$/i,
  /(^|\.)imisanzu\.rssb\.rw$/i,
  /(^|\.)zatca\.gov\.sa$/i,
  /(^|\.)gosi\.gov\.sa$/i,
  /(^|\.)src\.gov\.sc$/i,
  /(^|\.)pensionfund\.sc$/i,
  /(^|\.)skatteverket\.se$/i,
  /(^|\.)forskarskattenamnden\.se$/i,
  /(^|\.)cpf\.gov\.sg$/i,
  /(^|\.)iras\.gov\.sg$/i,
  /(^|\.)uradni-list\.si$/i,
  /(^|\.)fu\.gov\.si$/i,
  /(^|\.)ssf\.gob\.sv$/i,
  /(^|\.)rd\.go\.th$/i,
  /(^|\.)gib\.gov\.tr$/i,
  /(^|\.)sgk\.gov\.tr$/i,
  /(^|\.)mof\.gov\.tw$/i,
  /(^|\.)bli\.gov\.tw$/i,
  /(^|\.)nhi\.gov\.tw$/i,
  /(^|\.)bps\.gub\.uy$/i,
  /(^|\.)impo\.com\.uy$/i,
  /(^|\.)vss\.gov\.vn$/i,
];

function readIfExists(filePath) {
  return existsSync(filePath) ? readFileSync(filePath, "utf8") : "";
}

function getCountryDirectories() {
  const countriesDir = path.join(rootDir, "lib/countries");

  return readdirSync(countriesDir)
    .filter((entry) => {
      const countryPath = path.join(countriesDir, entry);
      return (
        statSync(countryPath).isDirectory() &&
        existsSync(path.join(countryPath, "index.ts")) &&
        existsSync(path.join(countryPath, "calculator.ts"))
      );
    })
    .sort((a, b) => a.localeCompare(b));
}

function countPattern(source, pattern) {
  return (source.match(pattern) ?? []).length;
}

function extractUrls(source) {
  return [
    ...new Set(
      Array.from(source.matchAll(/https?:\/\/[^"'`\s)]+/g)).map((match) =>
        match[0].replace(/[),.;]+$/, ""),
      ),
    ),
  ];
}

function getUrlHost(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function isVendorSourceUrl(url) {
  const host = getUrlHost(url);

  return VENDOR_SOURCE_HOST_PATTERNS.some((pattern) => pattern.test(host));
}

function isOfficialSourceUrl(url) {
  const host = getUrlHost(url);

  if (!host || isVendorSourceUrl(url)) {
    return false;
  }

  return OFFICIAL_SOURCE_HOST_PATTERNS.some(
    (pattern) => pattern.test(host) || pattern.test(url),
  );
}

function getCountryPageContentBlock(objectName) {
  const start = countryPageContentSource.indexOf(`const ${objectName}`);
  const next = countryPageContentSource.indexOf("\nconst ", start + 1);

  return countryPageContentSource.slice(
    start,
    next === -1 ? countryPageContentSource.length : next,
  );
}

function getCountryEntryBlock(objectBlock, code) {
  const start = objectBlock.search(new RegExp(`\\n\\s{2}${code}:`));

  if (start === -1) {
    return "";
  }

  const rest = objectBlock.slice(start + 1);
  const next = rest.search(/\n\s{2}[A-Z]{2}:/);

  return rest.slice(0, next === -1 ? undefined : next);
}

const countryDescriptionBlock = getCountryPageContentBlock(
  "COUNTRY_DESCRIPTIONS",
);
const countryKeywordBlock = getCountryPageContentBlock("COUNTRY_KEYWORDS");
const countryHeaderBlock = getCountryPageContentBlock("COUNTRY_HEADER_INFO");
const countryModeledInputsSource = readIfExists(
  path.join(rootDir, "components/compare/country-modeled-inputs.generated.ts"),
);

function getImportedCalculatorComponentSource(extensionSource) {
  const importedSources = [];
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

function getControlCounts(extensionSource) {
  const visibleSource =
    extensionSource + "\n" + getImportedCalculatorComponentSource(extensionSource);

  return Object.fromEntries(
    Object.entries(CONTROL_PATTERNS).map(([key, pattern]) => [
      key,
      countPattern(visibleSource, pattern),
    ]),
  );
}

function getSourceSignal(countryDir, calculatorSource, constantsSource) {
  const indexSource = readIfExists(
    path.join(rootDir, "lib/countries", countryDir, "index.ts"),
  );

  return (
    /SOURCE_URLS|sourceUrls/.test(calculatorSource) ||
    /SOURCE_URLS|sourceUrls/.test(constantsSource) ||
    /SOURCE_URLS/.test(indexSource)
  );
}

function getConstantsSource(countryDir) {
  const constantsDir = path.join(rootDir, "lib/countries", countryDir, "constants");

  if (!existsSync(constantsDir)) {
    return "";
  }

  return readdirSync(constantsDir)
    .filter((file) => file.endsWith(".ts"))
    .map((file) => readIfExists(path.join(constantsDir, file)))
    .join("\n");
}

function getResultSourceSignal(resultSource) {
  return /ResultNotes|LocalizedCountryResultBreakdown|sourceUrls\.map|Sources/.test(
    resultSource,
  );
}

function getExtensionScore(controlCounts, extensionSource) {
  void extensionSource;

  return (
    controlCounts.slider * 3 +
    controlCounts.number * 2 +
    controlCounts.numberStepper * 2 +
    controlCounts.select +
    controlCounts.booleanSelect +
    controlCounts.currency +
    controlCounts.payFrequency
  );
}

function getNumberFieldLabels(source) {
  return Array.from(
    source.matchAll(/<NumberField(?=[\s<])(?:<[^>]+>)?[\s\S]*?\/>/g),
  )
    .map((match) => {
      const labelMatch = match[0].match(/label=(?:"([^"]+)"|'([^']+)')/);
      return labelMatch?.[1] ?? labelMatch?.[2];
    })
    .filter(Boolean);
}

function getCountryModeledInputLabelCount(code) {
  const match = countryModeledInputsSource.match(
    new RegExp(`\\n\\s{2}${code}: \\[(.*?)\\],`),
  );

  return match ? (match[1].match(/"(?:[^"\\]|\\.)*"/g) ?? []).length : 0;
}

function auditCountry(countryDir) {
  const code = countryDir.toUpperCase();
  const calculatorPath = path.join(
    rootDir,
    "lib/countries",
    countryDir,
    "calculator.ts",
  );
  const comparePath = path.join(rootDir, "lib/countries", countryDir, "compare.ts");
  const extensionPath = path.join(
    rootDir,
    "components/calculator/country-extensions",
    `${countryDir}.tsx`,
  );
  const resultPath = path.join(
    rootDir,
    "components/calculator/results",
    `${countryDir}-result-breakdown.tsx`,
  );

  const calculatorSource = readIfExists(calculatorPath);
  const constantsSource = getConstantsSource(countryDir);
  const extensionSource = readIfExists(extensionPath);
  const resultSource = readIfExists(resultPath);
  const controlCounts = getControlCounts(extensionSource);
  const extensionScore = getExtensionScore(controlCounts, extensionSource);
  const visibleSource =
    extensionSource + "\n" + getImportedCalculatorComponentSource(extensionSource);
  const numberFieldLabels = getNumberFieldLabels(visibleSource);
  const modeledInputLabelCount = getCountryModeledInputLabelCount(code);
  const sourceSignal = getSourceSignal(
    countryDir,
    calculatorSource,
    constantsSource,
  );
  const sourceUrls = extractUrls(
    [
      calculatorSource,
      constantsSource,
      readIfExists(path.join(rootDir, "lib/countries", countryDir, "index.ts")),
    ].join("\n"),
  );
  const officialSourceUrls = sourceUrls.filter(isOfficialSourceUrl);
  const vendorSourceUrls = sourceUrls.filter(isVendorSourceUrl);
  const resultSourceSignal = getResultSourceSignal(resultSource);

  const warnings = [];
  const failures = [];

  if (!extensionSource) {
    failures.push("missing country extension");
  }

  if (!resultSource) {
    failures.push("missing result breakdown");
  }

  if (!existsSync(comparePath)) {
    failures.push("missing compare adapter");
  }

  if (!sourceSignal) {
    failures.push("missing calculator source URLs");
  }

  if (sourceSignal && officialSourceUrls.length === 0) {
    failures.push("missing official government or statutory-authority source URL");
  }

  const descriptionEntry = getCountryEntryBlock(countryDescriptionBlock, code);
  const keywordEntry = getCountryEntryBlock(countryKeywordBlock, code);
  const headerEntry = getCountryEntryBlock(countryHeaderBlock, code);

  if (!descriptionEntry) {
    failures.push("missing country-specific SEO description");
  } else if (descriptionEntry.length <= 120) {
    warnings.push("country-specific SEO description is thin");
  }

  if (!keywordEntry) {
    failures.push("missing country-specific SEO keywords");
  } else if ((keywordEntry.match(/"[^"]+"/g) ?? []).length < 6) {
    warnings.push("country-specific SEO keyword set is thin");
  }

  if (!headerEntry) {
    failures.push("missing country-specific header copy");
  } else if (!headerEntry.includes("tagline") || !headerEntry.includes("details")) {
    failures.push("country-specific header copy is incomplete");
  }

  if (!resultSourceSignal) {
    warnings.push("result panel does not visibly render sources");
  }

  if (/Items Outside This Salary Model/.test(resultSource)) {
    failures.push("uses old ambiguous exclusion heading");
  }

  const combinedCountrySource = [
    calculatorSource,
    constantsSource,
    extensionSource,
    resultSource,
  ].join("\n");
  const ambiguousExclusionPattern = AMBIGUOUS_EXCLUSION_PATTERNS.find(
    (pattern) => pattern.test(combinedCountrySource),
  );

  if (ambiguousExclusionPattern) {
    failures.push("uses ambiguous generic outside-model copy");
  }

  const countLikeNumberField = numberFieldLabels.find(
    (label) =>
      /\b(child|children|dependent|dependant|parent|sibling|spouse)\b/i.test(
        label,
      ) && !/\b(age|days|credit points?|capital sum|income)\b/i.test(label),
  );

  if (countLikeNumberField) {
    warnings.push(
      `count-like field "${countLikeNumberField}" uses NumberField instead of NumberStepperField`,
    );
  }

  if (
    RAW_COUNTRY_FORM_CONTROL_PATTERNS.some((pattern) =>
      pattern.test(visibleSource),
    )
  ) {
    failures.push("country option UI uses raw form controls instead of shared calculator primitives");
  }

  if (extensionSource && extensionScore <= 2) {
    warnings.push("extension has a low visible-control score");
  }

  if (extensionSource && modeledInputLabelCount === 0) {
    failures.push("compare modeled-control metadata is empty");
  }

  if (extensionSource && controlCounts.slider > 0 && modeledInputLabelCount === 0) {
    failures.push("contribution sliders are missing compare modeled-control labels");
  }

  if (
    extensionSource.includes("contributionsEmptyState") &&
    !/no personal income tax|no .*income tax|not a general employee|selected above|require separate|need .*facts/i.test(
      extensionSource,
    )
  ) {
    warnings.push("empty contribution state lacks a clear legal/scope reason");
  }

  if (
    extensionSource &&
    controlCounts.slider === 0 &&
    !extensionSource.includes("contributionsEmptyState")
  ) {
    failures.push("countries without contribution sliders must show an empty-state explanation");
  }

  return {
    code,
    countryDir,
    paths: {
      calculator: path.relative(rootDir, calculatorPath),
      compare: path.relative(rootDir, comparePath),
      extension: path.relative(rootDir, extensionPath),
      result: path.relative(rootDir, resultPath),
    },
    controls: controlCounts,
    extensionScore,
    modeledInputLabelCount,
    hasCompare: existsSync(comparePath),
    hasExtension: Boolean(extensionSource),
    hasResult: Boolean(resultSource),
    hasSourceUrls: sourceSignal,
    sourceUrlCount: sourceUrls.length,
    officialSourceUrlCount: officialSourceUrls.length,
    vendorSourceUrlCount: vendorSourceUrls.length,
    officialSourceHosts: [
      ...new Set(officialSourceUrls.map(getUrlHost).filter(Boolean)),
    ],
    resultRendersSources: resultSourceSignal,
    warnings,
    failures,
  };
}

const results = getCountryDirectories().map(auditCountry);
const failures = results.flatMap((result) =>
  result.failures.map((failure) => `${result.code}: ${failure}`),
);
const warnings = results.flatMap((result) =>
  result.warnings.map((warning) => `${result.code}: ${warning}`),
);

if (json) {
  console.log(JSON.stringify({ results, failures, warnings }, null, 2));
} else {
  console.log(`Audited ${results.length} countries.`);
  console.log(`Failures: ${failures.length}`);
  console.log(`Warnings: ${warnings.length}`);

  if (failures.length > 0) {
    console.log("\nFailures");
    for (const failure of failures) {
      console.log(`- ${failure}`);
    }
  }

  if (warnings.length > 0) {
    console.log("\nWarnings");
    for (const warning of warnings) {
      console.log(`- ${warning}`);
    }
  }
}

if (strict && failures.length > 0) {
  process.exitCode = 1;
}
