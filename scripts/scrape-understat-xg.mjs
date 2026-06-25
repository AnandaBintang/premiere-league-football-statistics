import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const UNDERSTAT_URL = "https://understat.com/league/EPL/2025";
const UNDERSTAT_LEAGUE_DATA_URL = "https://understat.com/getLeagueData/EPL/2025";
const OUTPUT_PATH = new URL("../src/data/xgStats.json", import.meta.url);

function decodeUnderstatPayload(encoded) {
  return encoded
    .replace(/\\x([0-9a-fA-F]{2})/g, (_, hex) =>
      String.fromCharCode(Number.parseInt(hex, 16)),
    )
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, "\\");
}

function normalizeTeamData(rawTeamsData, source = UNDERSTAT_URL) {
  return Object.values(rawTeamsData).reduce((acc, team) => {
    const history = Array.isArray(team.history) ? team.history : [];
    const totals = history.reduce(
      (sum, match) => ({
        xG: sum.xG + Number.parseFloat(match.xG || 0),
        xGA: sum.xGA + Number.parseFloat(match.xGA || 0),
        npxG: sum.npxG + Number.parseFloat(match.npxG || 0),
        npxGA: sum.npxGA + Number.parseFloat(match.npxGA || 0),
      }),
      { xG: 0, xGA: 0, npxG: 0, npxGA: 0 },
    );

    acc[team.title] = {
      xG: Number(totals.xG.toFixed(2)),
      xGA: Number(totals.xGA.toFixed(2)),
      npxG: Number(totals.npxG.toFixed(2)),
      npxGA: Number(totals.npxGA.toFixed(2)),
      matches: history.length,
      source,
    };

    return acc;
  }, {});
}

export function normalizeLeaguePayload(payload) {
  if (!payload?.teams) {
    throw new Error("Understat league payload did not include teams data.");
  }

  return normalizeTeamData(payload.teams, UNDERSTAT_LEAGUE_DATA_URL);
}

async function fetchLeagueData() {
  const response = await fetch(UNDERSTAT_LEAGUE_DATA_URL, {
    headers: {
      accept: "application/json, text/javascript, */*; q=0.01",
      referer: UNDERSTAT_URL,
      "user-agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36",
      "x-requested-with": "XMLHttpRequest",
    },
  });

  if (!response.ok) {
    throw new Error(`Understat league endpoint returned HTTP ${response.status}`);
  }

  return normalizeLeaguePayload(await response.json());
}

async function fetchLegacyEmbeddedData() {
  const response = await fetch(UNDERSTAT_URL, {
    headers: {
      "user-agent":
        "Mozilla/5.0 (compatible; PremierLeagueDashboard/1.0; +https://localhost)",
    },
  });

  if (!response.ok) {
    throw new Error(`Understat returned HTTP ${response.status}`);
  }

  const html = await response.text();
  const match = html.match(/var teamsData\s*=\s*JSON\.parse\('([^']+)'\)/);
  if (!match) {
    const availableVars = [...html.matchAll(/var\s+([a-zA-Z]+Data)\s*=/g)].map(
      ([, name]) => name,
    );
    throw new Error(
      `Could not find teamsData payload in Understat page. Available data variables: ${
        availableVars.join(", ") || "none"
      }.`,
    );
  }

  const decoded = decodeUnderstatPayload(match[1]);
  const rawTeamsData = JSON.parse(decoded);
  return normalizeTeamData(rawTeamsData);
}

async function main() {
  let normalized;

  try {
    normalized = await fetchLeagueData();
  } catch (endpointError) {
    console.warn(
      `Understat JSON endpoint failed: ${endpointError.message}. Trying legacy embedded payload.`,
    );
    normalized = await fetchLegacyEmbeddedData();
  }

  const scrapedAt = new Date().toISOString();
  const output = Object.fromEntries(
    Object.entries(normalized).map(([team, stats]) => [
      team,
      {
        ...stats,
        scrapedAt,
      },
    ]),
  );

  await writeFile(OUTPUT_PATH, `${JSON.stringify(output, null, 2)}\n`);
  console.log(
    `Wrote xG data for ${Object.keys(output).length} teams to ${OUTPUT_PATH.pathname}`,
  );
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
