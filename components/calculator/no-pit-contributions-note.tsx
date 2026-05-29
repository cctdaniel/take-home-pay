/** Shown when employment salary has no personal income tax (0% PIT countries). */
export function NoPitContributionsNote({
  mandatoryLabel,
  sourceUrl,
  sourceLabel,
}: {
  mandatoryLabel: string;
  sourceUrl: string;
  sourceLabel: string;
}) {
  return (
    <div className="space-y-3 text-sm text-zinc-400">
      <p>
        Employment salary is not subject to personal income tax here, so there
        are no voluntary wage contributions that reduce income tax. Mandatory
        payroll items are calculated automatically from your inputs above.
      </p>
      <p>
        <strong className="text-zinc-300">Mandatory:</strong> {mandatoryLabel}
      </p>
      <p className="text-xs text-zinc-500">
        Source:{" "}
        <a
          href={sourceUrl}
          className="text-blue-400 hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          {sourceLabel}
        </a>
      </p>
    </div>
  );
}
