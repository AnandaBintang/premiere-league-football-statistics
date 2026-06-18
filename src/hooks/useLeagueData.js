import { useState, useEffect } from 'react';
import fallbackData from '../data/fallbackStandings.json';

export default function useLeagueData() {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchStandings() {
      try {
        setLoading(true);
        // ESPN public v2 standings endpoint for English Premier League (eng.1)
        const response = await fetch(
          "https://site.api.espn.com/apis/v2/sports/soccer/eng.1/standings",
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        const entries = result?.children?.[0]?.standings?.entries;

        if (entries && entries.length > 0) {
          const parsed = entries.map((entry) => {
            const team = entry.team;
            const stats = entry.stats || [];

            const getStatValue = (name) => {
              const stat = stats.find((s) => s.name === name);
              return stat ? String(stat.value) : "0";
            };

            const getStatDisplayValue = (name) => {
              const stat = stats.find((s) => s.name === name);
              return stat ? String(stat.displayValue) : "0";
            };

            const idTeam = String(team.id);
            const strTeam = team.displayName;
            // High-resolution logo from ESPN
            const strBadge = team.logos?.[0]?.href || "";

            const rank = getStatValue("rank");
            const played = getStatValue("gamesPlayed");
            const win = getStatValue("wins");
            const draw = getStatValue("ties");
            const loss = getStatValue("losses");
            const goalsFor = getStatValue("pointsFor");
            const goalsAgainst = getStatValue("pointsAgainst");
            const goalDifference = getStatDisplayValue("pointDifferential");
            const points = getStatValue("points");

            // Find matching static data (for stadium, founded year, manager, etc.)
            const fallbackTeam = fallbackData.find(
              (t) =>
                t.strTeam.toLowerCase() === strTeam.toLowerCase() ||
                t.idTeam === idTeam ||
                (idTeam === "359" && t.strTeam === "Arsenal") ||
                (idTeam === "382" && t.strTeam === "Manchester City"),
            );

            return {
              idTeam,
              strTeam,
              strBadge,
              intRank: rank,
              intPlayed: played,
              intWin: win,
              intDraw: draw,
              intLoss: loss,
              intGoalsFor: goalsFor,
              intGoalsAgainst: goalsAgainst,
              intGoalDifference: goalDifference,
              intPoints: points,
              strForm: fallbackTeam?.strForm || "WWWWW",
              info: fallbackTeam?.info || {
                founded: "1880",
                nickname: "Club",
                manager: "Manager",
                stadium: "Stadium",
                capacity: "40,000",
                city: "England",
              },
              squad: fallbackTeam?.squad || [],
              history: fallbackTeam?.history || [],
            };
          });

          // Sort by rank ascending
          const sorted = [...parsed].sort(
            (a, b) => parseInt(a.intRank, 10) - parseInt(b.intRank, 10),
          );
          setTableData(sorted);
        } else {
          setTableData(fallbackData);
        }
      } catch (err) {
        console.error(
          "Failed to fetch from ESPN API, using fallback data:",
          err,
        );
        setError('Could not fetch real-time standings. Showing fallback data.');
        setTableData(fallbackData);
      } finally {
        setLoading(false);
      }
    }

    fetchStandings();
  }, []);

  return { tableData, loading, error };
}
