const FORM_POINTS = {
  W: 3,
  D: 1,
  L: 0,
};

function numberValue(value, fallback = 0) {
  const parsed = Number.parseFloat(String(value ?? "").replace("+", ""));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function teamKey(teamName) {
  return String(teamName || "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function getXgForTeam(team, xgStats = {}) {
  const direct = xgStats[team.strTeam];
  if (direct) return direct;

  const normalizedTeam = teamKey(team.strTeam);
  const matchedKey = Object.keys(xgStats).find(
    (key) => teamKey(key) === normalizedTeam,
  );

  return matchedKey ? xgStats[matchedKey] : null;
}

function estimateXg(team) {
  const goals = numberValue(team.intGoalsFor);
  const goalDifference = numberValue(team.intGoalDifference);
  const rank = numberValue(team.intRank, 10);
  const played = Math.max(numberValue(team.intPlayed, 1), 1);
  const rankPressure = Math.max(0, 21 - rank) / 20;
  const controlAdjustment = goalDifference / Math.max(played, 1);

  return Math.max(
    0.3,
    goals * 0.92 + rankPressure * 2.4 + controlAdjustment * 0.7,
  );
}

export function buildExpectedGoalsDataset(teams, xgStats = {}) {
  return [...teams]
    .sort((a, b) => numberValue(a.intRank) - numberValue(b.intRank))
    .map((team) => {
      const scraped = getXgForTeam(team, xgStats);
      const xG = scraped ? numberValue(scraped.xG) : estimateXg(team);
      const goals = numberValue(team.intGoalsFor);
      const differential = goals - xG;

      let performance = "In line";
      if (differential >= 2) performance = "Over-performing";
      if (differential <= -2) performance = "Under-performing";

      return {
        team: team.strTeam,
        rank: numberValue(team.intRank),
        goals,
        xG: Number(xG.toFixed(2)),
        xGA: scraped ? Number(numberValue(scraped.xGA).toFixed(2)) : null,
        differential: Number(differential.toFixed(2)),
        performance,
        source: scraped ? "scraped" : "derived",
      };
    });
}

function formScore(form) {
  const results = String(form || "").split("");
  if (results.length === 0) return 0;
  const total = results.reduce((sum, result) => sum + (FORM_POINTS[result] ?? 0), 0);
  return total / results.length;
}

function pearson(valuesA, valuesB) {
  const length = Math.min(valuesA.length, valuesB.length);
  if (length < 2) return 0;

  const a = valuesA.slice(0, length);
  const b = valuesB.slice(0, length);
  const meanA = a.reduce((sum, value) => sum + value, 0) / length;
  const meanB = b.reduce((sum, value) => sum + value, 0) / length;

  let numerator = 0;
  let denominatorA = 0;
  let denominatorB = 0;

  for (let i = 0; i < length; i += 1) {
    const diffA = a[i] - meanA;
    const diffB = b[i] - meanB;
    numerator += diffA * diffB;
    denominatorA += diffA ** 2;
    denominatorB += diffB ** 2;
  }

  const denominator = Math.sqrt(denominatorA * denominatorB);
  if (denominator === 0) return 0;

  return Number((numerator / denominator).toFixed(2));
}

export function buildCorrelationMatrix(teams) {
  const metrics = [
    {
      label: "Points",
      values: teams.map((team) => numberValue(team.intPoints)),
    },
    {
      label: "Wins",
      values: teams.map((team) => numberValue(team.intWin)),
    },
    {
      label: "Goals For",
      values: teams.map((team) => numberValue(team.intGoalsFor)),
    },
    {
      label: "Goals Against",
      values: teams.map((team) => numberValue(team.intGoalsAgainst)),
    },
    {
      label: "Goal Diff",
      values: teams.map((team) => numberValue(team.intGoalDifference)),
    },
    {
      label: "Win Rate",
      values: teams.map((team) => {
        const played = Math.max(numberValue(team.intPlayed), 1);
        return numberValue(team.intWin) / played;
      }),
    },
    {
      label: "Form Score",
      values: teams.map((team) => formScore(team.strForm)),
    },
  ];

  return {
    labels: metrics.map((metric) => metric.label),
    rows: metrics.map((rowMetric) => ({
      label: rowMetric.label,
      values: metrics.map((columnMetric) =>
        rowMetric.label === columnMetric.label
          ? 1
          : pearson(rowMetric.values, columnMetric.values),
      ),
    })),
  };
}

function fallbackScheduleFromForm(team, maxWeeks) {
  const played = Math.min(Math.max(numberValue(team.intPlayed), 1), maxWeeks);
  const currentPoints = numberValue(team.intPoints);
  const formResults = String(team.strForm || "")
    .split("")
    .map((result) => FORM_POINTS[result] ?? 0);
  const knownRecentPoints = formResults.reduce((sum, value) => sum + value, 0);
  const earlierMatches = Math.max(played - formResults.length, 0);
  const earlierPoints = Math.max(currentPoints - knownRecentPoints, 0);
  const averageEarlier = earlierMatches > 0 ? earlierPoints / earlierMatches : 0;

  const schedule = [];
  for (let week = 1; week <= played; week += 1) {
    const formIndex = week - earlierMatches - 1;
    schedule.push({
      matchweek: week,
      points: formIndex >= 0 ? formResults[formIndex] : averageEarlier,
    });
  }

  return schedule;
}

export function buildMomentumSeries(teams, schedulesByTeam = {}, maxWeeks = 38) {
  const labels = Array.from({ length: maxWeeks }, (_, index) => `MW ${index + 1}`);
  const cumulativeByTeam = teams.map((team) => {
    const rawSchedule =
      schedulesByTeam[team.idTeam] || fallbackScheduleFromForm(team, maxWeeks);
    const byWeek = new Map(
      rawSchedule.map((match) => [numberValue(match.matchweek), numberValue(match.points)]),
    );

    let total = 0;
    const data = labels.map((_, index) => {
      total += byWeek.get(index + 1) ?? 0;
      return Number(total.toFixed(1));
    });

    return {
      idTeam: team.idTeam,
      label: team.strTeam,
      data,
      currentRank: numberValue(team.intRank),
    };
  });

  const rankByTeam = cumulativeByTeam.map((teamSeries) => ({
    idTeam: teamSeries.idTeam,
    label: teamSeries.label,
    data: labels.map((_, weekIndex) => {
      const ranking = [...cumulativeByTeam].sort((a, b) => {
        const pointsDiff = b.data[weekIndex] - a.data[weekIndex];
        if (pointsDiff !== 0) return pointsDiff;
        return a.currentRank - b.currentRank;
      });
      return ranking.findIndex((candidate) => candidate.idTeam === teamSeries.idTeam) + 1;
    }),
  }));

  return {
    labels,
    pointsByTeam: cumulativeByTeam,
    rankByTeam,
  };
}

export function getNumberValue(value, fallback = 0) {
  return numberValue(value, fallback);
}
