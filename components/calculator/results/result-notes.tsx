import { Separator } from "@/components/ui/separator";
import { getUniqueSourceUrls } from "./source-helpers";

function getSourceHost(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "source";
  }
}

function getDefaultSourceLabel(url: string, countryName: string) {
  if (url.includes("taxsummaries.pwc.com")) {
    return `PwC ${countryName} tax summary cross-check`;
  }

  return `${countryName} source: ${getSourceHost(url)}`;
}

export function ResultNotes({
  countryName,
  assumptions = [],
  exclusions = [],
  sourceUrls = [],
  getSourceLabel,
}: {
  countryName: string;
  assumptions?: readonly string[];
  exclusions?: readonly string[];
  sourceUrls?: readonly string[];
  getSourceLabel?: (url: string) => string;
}) {
  const sourceLabel =
    getSourceLabel ?? ((url) => getDefaultSourceLabel(url, countryName));
  const uniqueSourceUrls = getUniqueSourceUrls(sourceUrls);

  if (
    assumptions.length === 0 &&
    exclusions.length === 0 &&
    uniqueSourceUrls.length === 0
  ) {
    return null;
  }

  return (
    <>
      {assumptions.length > 0 ? (
        <>
          <Separator className="my-2" />
          <div className="rounded-lg bg-zinc-800/50 p-3">
            <p className="mb-2 text-xs font-medium text-zinc-400">
              {countryName} Salary Assumptions
            </p>
            <ul className="list-disc space-y-1 pl-4 text-xs text-zinc-500">
              {assumptions.map((assumption) => (
                <li key={assumption}>{assumption}</li>
              ))}
            </ul>
          </div>
        </>
      ) : null}

      {exclusions.length > 0 ? (
        <>
          <Separator className="my-2" />
          <div className="rounded-lg bg-zinc-800/50 p-3">
            <p className="mb-2 text-xs font-medium text-zinc-400">
              {countryName} Items Requiring Separate Facts
            </p>
            <ul className="list-disc space-y-1 pl-4 text-xs text-zinc-500">
              {exclusions.map((exclusion) => (
                <li key={exclusion}>{exclusion}</li>
              ))}
            </ul>
          </div>
        </>
      ) : null}

      {uniqueSourceUrls.length > 0 ? (
        <>
          <Separator className="my-2" />
          <div className="rounded-lg bg-zinc-800/50 p-3">
            <p className="mb-2 text-xs font-medium text-zinc-400">
              {countryName} Sources
            </p>
            <ul className="list-disc space-y-1 pl-4 text-xs text-zinc-500">
              {uniqueSourceUrls.map((url) => (
                <li key={url}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-300 hover:text-emerald-200"
                  >
                    {sourceLabel(url)}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </>
      ) : null}
    </>
  );
}
