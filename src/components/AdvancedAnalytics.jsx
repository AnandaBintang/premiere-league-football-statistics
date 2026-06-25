import { useEffect, useMemo, useState } from "react";
import { Line, Scatter } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import {
  buildCorrelationMatrix,
  buildExpectedGoalsDataset,
  buildMomentumSeries,
} from "../utils/advancedAnalytics";
import xgStats from "../data/xgStats.json";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
);

const TEAM_COLORS = [
  "#00ff87",
  "#00f2fe",
  "#ff007f",
  "#ffd166",
  "#a78bfa",
  "#f97316",
];

function resultPointsForTeam(event, teamId) {
  const competition = event.competitions?.[0];
  const competitors = competition?.competitors || [];
  const team = competitors.find((candidate) => String(candidate.team?.id) === String(teamId));
  const opponent = competitors.find((candidate) => String(candidate.team?.id) !== String(teamId));

  if (!team || !opponent) return null;

  const teamScore = Number.parseInt(team.score?.value ?? team.score ?? 0, 10);
  const opponentScore = Number.parseInt(opponent.score?.value ?? opponent.score ?? 0, 10);
  let points = 1;
  if (teamScore > opponentScore) points = 3;
  if (teamScore < opponentScore) points = 0;

  return {
    date: event.date,
    points,
  };
}

async function fetchSchedules(teams) {
  const entries = await Promise.all(
    teams.map(async (team) => {
      const response = await fetch(
        `https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/teams/${team.idTeam}/schedule?season=2025`,
      );
      if (!response.ok) return [team.idTeam, []];

      const payload = await response.json();
      const matches = (payload.events || [])
        .filter((event) => event.competitions?.[0]?.status?.type?.completed)
        .map((event) => resultPointsForTeam(event, team.idTeam))
        .filter(Boolean)
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .map((match, index) => ({
          matchweek: index + 1,
          points: match.points,
        }));

      return [team.idTeam, matches];
    }),
  );

  return Object.fromEntries(entries);
}

function Heatmap({ matrix }) {
  const colorForValue = (value) => {
    const intensity = Math.min(Math.abs(value), 1);
    if (value >= 0) {
      return `rgba(0, 255, 135, ${0.12 + intensity * 0.68})`;
    }
    return `rgba(255, 0, 127, ${0.12 + intensity * 0.68})`;
  };

  return (
    <div
      className="correlation-grid"
      style={{ gridTemplateColumns: `120px repeat(${matrix.labels.length}, minmax(72px, 1fr))` }}
    >
      <div className="correlation-axis-cell" />
      {matrix.labels.map((label) => (
        <div className="correlation-axis-cell" key={label}>
          {label}
        </div>
      ))}
      {matrix.rows.map((row) => (
        <div className="correlation-row" key={row.label}>
          <div className="correlation-axis-cell correlation-row-label">{row.label}</div>
          {row.values.map((value, index) => (
            <div
              className="correlation-cell"
              key={`${row.label}-${matrix.labels[index]}`}
              style={{ background: colorForValue(value) }}
              title={`${row.label} vs ${matrix.labels[index]}: ${value}`}
            >
              {value.toFixed(2)}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default function AdvancedAnalytics({ data }) {
  const [schedulesByTeam, setSchedulesByTeam] = useState({});
  const [scheduleStatus, setScheduleStatus] = useState("loading");
  const [viewMode, setViewMode] = useState("points");

  useEffect(() => {
    if (!data.length) return;

    let active = true;

    fetchSchedules(data)
      .then((schedules) => {
        if (!active) return;
        setSchedulesByTeam(schedules);
        setScheduleStatus("live");
      })
      .catch((error) => {
        console.error("Failed to fetch ESPN schedules:", error);
        if (!active) return;
        setSchedulesByTeam({});
        setScheduleStatus("fallback");
      });

    return () => {
      active = false;
    };
  }, [data]);

  const playedWeeks = Math.max(
    1,
    Math.min(38, ...data.map((team) => Number.parseInt(team.intPlayed, 10) || 1)),
  );

  const momentum = useMemo(
    () => buildMomentumSeries(data, schedulesByTeam, playedWeeks),
    [data, schedulesByTeam, playedWeeks],
  );
  const expectedGoals = useMemo(() => buildExpectedGoalsDataset(data, xgStats), [data]);
  const correlation = useMemo(() => buildCorrelationMatrix(data), [data]);
  const topTeams = momentum.pointsByTeam.slice(0, 6);
  const scrapedCount = expectedGoals.filter((team) => team.source === "scraped").length;

  const lineData = {
    labels: momentum.labels,
    datasets: topTeams.map((team, index) => {
      const rankSeries = momentum.rankByTeam.find((series) => series.idTeam === team.idTeam);
      return {
        label: team.label,
        data: viewMode === "points" ? team.data : rankSeries?.data || [],
        borderColor: TEAM_COLORS[index % TEAM_COLORS.length],
        backgroundColor: TEAM_COLORS[index % TEAM_COLORS.length],
        borderWidth: 2,
        pointRadius: 2,
        pointHoverRadius: 5,
        tension: 0.32,
      };
    }),
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: {
        labels: {
          color: "rgba(255, 255, 255, 0.72)",
          usePointStyle: true,
          pointStyle: "circle",
          font: { family: "Outfit, sans-serif", size: 11 },
        },
      },
      tooltip: {
        backgroundColor: "#1c072d",
        borderColor: "rgba(255, 255, 255, 0.12)",
        borderWidth: 1,
        callbacks: {
          label: (context) =>
            ` ${context.dataset.label}: ${
              viewMode === "points" ? `${context.raw} pts` : `rank #${context.raw}`
            }`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: "rgba(255,255,255,0.04)" },
        ticks: { color: "rgba(255,255,255,0.58)", maxTicksLimit: 10 },
      },
      y: {
        reverse: viewMode === "rank",
        min: viewMode === "rank" ? 1 : 0,
        max: viewMode === "rank" ? 20 : undefined,
        grid: { color: "rgba(255,255,255,0.06)" },
        ticks: { color: "rgba(255,255,255,0.58)" },
      },
    },
  };

  const scatterData = {
    datasets: [
      {
        label: "Over-performing",
        data: expectedGoals
          .filter((team) => team.performance === "Over-performing")
          .map((team) => ({ x: team.xG, y: team.goals, team })),
        backgroundColor: "#00ff87",
        pointRadius: 6,
        pointHoverRadius: 8,
      },
      {
        label: "In line",
        data: expectedGoals
          .filter((team) => team.performance === "In line")
          .map((team) => ({ x: team.xG, y: team.goals, team })),
        backgroundColor: "#00f2fe",
        pointRadius: 5,
        pointHoverRadius: 7,
      },
      {
        label: "Under-performing",
        data: expectedGoals
          .filter((team) => team.performance === "Under-performing")
          .map((team) => ({ x: team.xG, y: team.goals, team })),
        backgroundColor: "#ff007f",
        pointRadius: 6,
        pointHoverRadius: 8,
      },
    ],
  };

  const scatterOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: "rgba(255, 255, 255, 0.72)",
          usePointStyle: true,
          font: { family: "Outfit, sans-serif", size: 11 },
        },
      },
      tooltip: {
        backgroundColor: "#1c072d",
        borderColor: "rgba(255, 255, 255, 0.12)",
        borderWidth: 1,
        callbacks: {
          title: (items) => items[0]?.raw?.team?.team || "",
          label: (context) => {
            const team = context.raw.team;
            return [
              ` xG: ${team.xG}`,
              ` Goals: ${team.goals}`,
              ` Delta: ${team.differential > 0 ? "+" : ""}${team.differential}`,
              ` Source: ${team.source}`,
            ];
          },
        },
      },
    },
    scales: {
      x: {
        title: { display: true, text: "Expected Goals", color: "rgba(255,255,255,0.7)" },
        grid: { color: "rgba(255,255,255,0.06)" },
        ticks: { color: "rgba(255,255,255,0.58)" },
      },
      y: {
        title: { display: true, text: "Actual Goals", color: "rgba(255,255,255,0.7)" },
        grid: { color: "rgba(255,255,255,0.06)" },
        ticks: { color: "rgba(255,255,255,0.58)" },
      },
    },
  };

  return (
    <section className="advanced-analytics-section">
      <div className="chart-container advanced-chart wide-chart">
        <div className="chart-header">
          <div>
            <h3 className="chart-title">Interactive Momentum Line Chart</h3>
            <p className="chart-caption">
              {scheduleStatus === "live"
                ? "Built from ESPN completed match schedules."
                : "Using standings/form fallback while schedules load."}
            </p>
          </div>
          <div className="segmented-control" aria-label="Momentum chart mode">
            <button
              className={viewMode === "points" ? "active" : ""}
              onClick={() => setViewMode("points")}
            >
              Points
            </button>
            <button
              className={viewMode === "rank" ? "active" : ""}
              onClick={() => setViewMode("rank")}
            >
              Rank
            </button>
          </div>
        </div>
        <div className="chart-wrapper advanced-line-wrapper">
          <Line data={lineData} options={lineOptions} />
        </div>
      </div>

      <div className="advanced-grid">
        <div className="chart-container advanced-chart">
          <div className="chart-header">
            <div>
              <h3 className="chart-title">Annotated xG vs Actual Goals</h3>
              <p className="chart-caption">
                {scrapedCount > 0
                  ? `${scrapedCount} teams use scraped Understat xG; the rest use derived estimates.`
                  : "Run pnpm scrape:xg to replace derived estimates with scraped Understat xG."}
              </p>
            </div>
          </div>
          <div className="chart-wrapper advanced-scatter-wrapper">
            <Scatter data={scatterData} options={scatterOptions} />
          </div>
          <div className="performance-list">
            {expectedGoals.slice(0, 5).map((team) => (
              <div className="performance-item" key={team.team}>
                <span>{team.team}</span>
                <strong className={team.differential >= 0 ? "positive" : "negative"}>
                  {team.differential >= 0 ? "+" : ""}
                  {team.differential}
                </strong>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-container advanced-chart">
          <div className="chart-header">
            <div>
              <h3 className="chart-title">Correlation Heatmap</h3>
              <p className="chart-caption">
                Matrix correlation across points, wins, goals, goal difference, and form.
              </p>
            </div>
          </div>
          <Heatmap matrix={correlation} />
        </div>
      </div>
    </section>
  );
}
