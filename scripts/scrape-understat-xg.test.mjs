import test from "node:test";
import assert from "node:assert/strict";

import { normalizeLeaguePayload } from "./scrape-understat-xg.mjs";

test("normalizeLeaguePayload sums Understat team history into team xG totals", () => {
  const normalized = normalizeLeaguePayload({
    teams: {
      1: {
        title: "Example FC",
        history: [
          { xG: 1.25, xGA: 0.75, npxG: 1, npxGA: 0.5 },
          { xG: 0.5, xGA: 2, npxG: 0.5, npxGA: 1.8 },
        ],
      },
    },
  });

  assert.deepEqual(normalized["Example FC"], {
    xG: 1.75,
    xGA: 2.75,
    npxG: 1.5,
    npxGA: 2.3,
    matches: 2,
    source: "https://understat.com/getLeagueData/EPL/2025",
  });
});
