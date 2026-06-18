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
        // EPL league ID = 4328, Season = 2025-2026
        const response = await fetch(
          'https://www.thesportsdb.com/api/v1/json/3/lookuptable.php?l=4328&s=2025-2026'
        );
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result && result.table && result.table.length > 0) {
          // Merge fetched data (top 5) with our 20-team fallback data
          const merged = fallbackData.map((fallbackTeam) => {
            // Find live team in the fetched table by idTeam
            const liveTeam = result.table.find(
              (item) => String(item.idTeam) === String(fallbackTeam.idTeam)
            );
            
            if (liveTeam) {
              return {
                ...fallbackTeam,
                intRank: liveTeam.intRank || fallbackTeam.intRank,
                intPlayed: liveTeam.intPlayed || fallbackTeam.intPlayed,
                intWin: liveTeam.intWin || fallbackTeam.intWin,
                intDraw: liveTeam.intDraw || fallbackTeam.intDraw,
                intLoss: liveTeam.intLoss || fallbackTeam.intLoss,
                intGoalsFor: liveTeam.intGoalsFor || fallbackTeam.intGoalsFor,
                intGoalsAgainst: liveTeam.intGoalsAgainst || fallbackTeam.intGoalsAgainst,
                intGoalDifference: liveTeam.intGoalDifference || fallbackTeam.intGoalDifference,
                intPoints: liveTeam.intPoints || fallbackTeam.intPoints,
                strForm: liveTeam.strForm || fallbackTeam.strForm,
                // Use live badge if available
                strBadge: liveTeam.strBadge || fallbackTeam.strBadge,
                isLive: true // Visual indicator that this team has live updated data
              };
            }
            return {
              ...fallbackTeam,
              isLive: false
            };
          });

          // Sort by points desc, then goal difference desc, then goals for desc
          const sorted = [...merged].sort((a, b) => {
            const ptsA = parseInt(a.intPoints, 10) || 0;
            const ptsB = parseInt(b.intPoints, 10) || 0;
            if (ptsA !== ptsB) return ptsB - ptsA;

            const gdA = parseInt(a.intGoalDifference, 10) || 0;
            const gdB = parseInt(b.intGoalDifference, 10) || 0;
            if (gdA !== gdB) return gdB - gdA;

            const gfA = parseInt(a.intGoalsFor, 10) || 0;
            const gfB = parseInt(b.intGoalsFor, 10) || 0;
            return gfB - gfA;
          });

          // Re-calculate ranks based on sorted order
          const ranked = sorted.map((team, index) => ({
            ...team,
            intRank: String(index + 1)
          }));

          setTableData(ranked);
        } else {
          // If API structure was unexpected or empty, fall back directly
          setTableData(fallbackData);
        }
      } catch (err) {
        console.error('Failed to fetch from TheSportsDB API, using fallback data:', err);
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
