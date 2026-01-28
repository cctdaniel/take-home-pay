import { spawnSync } from "node:child_process";

const args = process.argv.slice(2);

if (args.length === 0) {
  console.error("Usage: node scripts/with-last-updated.mjs <command>");
  process.exit(1);
}

const gitResult = spawnSync("git", ["log", "-1", "--format=%cs"], {
  encoding: "utf8",
});

const lastUpdated = gitResult.status === 0 ? gitResult.stdout.trim() : "";
const buildTimestamp = new Date().toISOString();

const env = {
  ...process.env,
  NEXT_PUBLIC_BUILD_TIMESTAMP: buildTimestamp,
  ...(lastUpdated ? { NEXT_PUBLIC_LAST_UPDATED: lastUpdated } : {}),
};

const child = spawnSync(args[0], args.slice(1), {
  stdio: "inherit",
  shell: true,
  env,
});

process.exit(child.status ?? 1);
