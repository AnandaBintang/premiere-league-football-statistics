import test from "node:test";
import assert from "node:assert/strict";

import {
  buildExpectedGoalsDataset,
  buildCorrelationMatrix,
  buildMomentumSeries,
} from "./advancedAnalytics.js";

const teams = [
  {
    idTeam: "1",
    strTeam: "North FC",
    intRank: "1",
    intPlayed: "3",
    intWin: "3",
    intDraw: "0",
    intLoss: "0",
    intGoalsFor: "8",
    intGoalsAgainst: "2",
    intGoalDifference: "+6",
    intPoints: "9",
    strForm: "WWW",
  },
  {
    idTeam: "2",
    strTeam: "South FC",
    intRank: "2",
    intPlayed: "3",
    intWin: "1",
    intDraw: "1",
    intLoss: "1",
    intGoalsFor: "4",
    intGoalsAgainst: "4",
    intGoalDifference: "0",
    intPoints: "4",
    strForm: "WDL",
  },
  {
    idTeam: "3",
    strTeam: "East FC",
    intRank: "3",
    intPlayed: "3",
    intWin: "0",
    intDraw: "1",
    intLoss: "2",
    intGoalsFor: "2",
    intGoalsAgainst: "7",
    intGoalDifference: "-5",
    intPoints: "1",
    strForm: "LDL",
  },
];

test("buildMomentumSeries converts match results into cumulative points and rank trend", () => {
  const schedules = {
    1: [
      { matchweek: 1, points: 3 },
      { matchweek: 2, points: 3 },
      { matchweek: 3, points: 3 },
    ],
    2: [
      { matchweek: 1, points: 1 },
      { matchweek: 2, points: 3 },
      { matchweek: 3, points: 0 },
    ],
    3: [
      { matchweek: 1, points: 0 },
      { matchweek: 2, points: 1 },
      { matchweek: 3, points: 0 },
    ],
  };

  const series = buildMomentumSeries(teams, schedules, 3);

  assert.deepEqual(series.labels, ["MW 1", "MW 2", "MW 3"]);
  assert.deepEqual(series.pointsByTeam[0].data, [3, 6, 9]);
  assert.deepEqual(series.rankByTeam[0].data, [1, 1, 1]);
  assert.equal(series.rankByTeam[2].data.at(-1), 3);
});

test("buildExpectedGoalsDataset uses scraped xG when available and flags performance bands", () => {
  const xgStats = {
    "North FC": { xG: 5.4, xGA: 2.1 },
    "South FC": { xG: 4.2, xGA: 3.9 },
  };

  const dataset = buildExpectedGoalsDataset(teams, xgStats);

  assert.equal(dataset[0].team, "North FC");
  assert.equal(dataset[0].xG, 5.4);
  assert.equal(dataset[0].goals, 8);
  assert.equal(dataset[0].performance, "Over-performing");
  assert.equal(dataset[2].source, "derived");
});

test("buildCorrelationMatrix returns a square matrix with strong self-correlation", () => {
  const matrix = buildCorrelationMatrix(teams);

  assert.equal(matrix.labels.includes("Points"), true);
  assert.equal(matrix.rows.length, matrix.labels.length);
  assert.equal(matrix.rows[0].values.length, matrix.labels.length);
  assert.equal(matrix.rows[0].values[0], 1);
});
