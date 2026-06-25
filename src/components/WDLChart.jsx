import { useState, useEffect } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function WDLChart({ teamData }) {
  const [liveRoster, setLiveRoster] = useState([]);
  const [liveHistory, setLiveHistory] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState(null);

  useEffect(() => {
    if (!teamData?.idTeam) return;

    let active = true;

    async function fetchClubDetails() {
      try {
        setLoadingDetails(true);
        setDetailsError(null);

        // Fetch roster and schedule concurrently
        const [rosterRes, scheduleRes] = await Promise.all([
          fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/teams/${teamData.idTeam}/roster?season=2025`),
          fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/teams/${teamData.idTeam}/schedule?season=2025`)
        ]);

        if (!active) return;

        let rosterData = [];
        let historyData = [];

        if (rosterRes.ok) {
          const rosterJson = await rosterRes.json();
          const athletes = rosterJson?.athletes || [];
          rosterData = athletes.map((player) => ({
            no: player.jersey || '-',
            name: player.displayName || 'Player',
            pos: player.position?.displayName || 'Position',
            nat: player.citizenship || player.citizenshipCountry || '-',
            age: player.age || '-'
          }));
        }

        if (scheduleRes.ok) {
          const scheduleJson = await scheduleRes.json();
          const events = scheduleJson?.events || [];
          
          const completedMatches = events
            .filter((event) => {
              const comp = event.competitions?.[0];
              return comp && comp.status?.type?.completed;
            })
            .map((event) => {
              const comp = event.competitions[0];
              const competitors = comp.competitors || [];
              
              const ourTeamComp = competitors.find(
                (c) => String(c.team?.id) === String(teamData.idTeam)
              );
              const oppTeamComp = competitors.find(
                (c) => String(c.team?.id) !== String(teamData.idTeam)
              );

              if (!ourTeamComp || !oppTeamComp) return null;

              const ourScore = parseInt(ourTeamComp.score?.value || 0, 10);
              const oppScore = parseInt(oppTeamComp.score?.value || 0, 10);
              
              let resultOutcome = 'D';
              if (ourScore > oppScore) resultOutcome = 'W';
              else if (ourScore < oppScore) resultOutcome = 'L';

              const dateObj = new Date(event.date);
              const formattedDate = dateObj.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              });

              return {
                opponent: oppTeamComp.team?.displayName || 'Opponent',
                score: `${ourScore}-${oppScore}`,
                date: formattedDate,
                round: comp.status?.type?.detail || 'FT',
                wasHome: ourTeamComp.homeAway === 'home',
                result: resultOutcome
              };
            })
            .filter(Boolean)
            .reverse() // Most recent first
            .slice(0, 5);

          historyData = completedMatches;
        }

        if (active) {
          setLiveRoster(rosterData.length > 0 ? rosterData : teamData.squad);
          setLiveHistory(historyData.length > 0 ? historyData : teamData.history);
        }
      } catch (err) {
        console.error('Failed to fetch live club details:', err);
        if (active) {
          setDetailsError('Could not fetch real-time club details. Showing fallback.');
          setLiveRoster(teamData.squad || []);
          setLiveHistory(teamData.history || []);
        }
      } finally {
        if (active) {
          setLoadingDetails(false);
        }
      }
    }

    fetchClubDetails();

    return () => {
      active = false;
    };
  }, [teamData?.idTeam, teamData?.squad, teamData?.history]);

  if (!teamData) {
    return (
      <div className="wdl-chart-placeholder">
        <p>Select a club from the selector to display its complete profile.</p>
      </div>
    );
  }

  const wins = parseInt(teamData.intWin, 10) || 0;
  const draws = parseInt(teamData.intDraw, 10) || 0;
  const losses = parseInt(teamData.intLoss, 10) || 0;
  const played = parseInt(teamData.intPlayed, 10) || 1;
  const goalsFor = parseInt(teamData.intGoalsFor, 10) || 0;
  const goalsAgainst = parseInt(teamData.intGoalsAgainst, 10) || 0;

  // Calculate advanced statistics
  const winRate = ((wins / played) * 100).toFixed(1);
  const avgGoalsScored = (goalsFor / played).toFixed(2);
  const avgGoalsConceded = (goalsAgainst / played).toFixed(2);

  const chartData = {
    labels: ['Wins', 'Draws', 'Losses'],
    datasets: [
      {
        data: [wins, draws, losses],
        backgroundColor: ['#00ff87', 'rgba(255, 255, 255, 0.35)', '#ff007f'],
        borderColor: ['#00ff87', 'rgba(255, 255, 255, 0.5)', '#ff007f'],
        borderWidth: 1,
        hoverBackgroundColor: ['#20ff97', 'rgba(255, 255, 255, 0.5)', '#ff209f']
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: 'rgba(255, 255, 255, 0.7)',
          font: {
            family: 'Outfit, sans-serif',
            size: 11
          },
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        backgroundColor: '#1c072d',
        titleFont: {
          family: 'Outfit, sans-serif',
          size: 13,
          weight: 'bold'
        },
        bodyFont: {
          family: 'Inter, sans-serif',
          size: 12
        },
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 6,
        callbacks: {
          label: (context) => {
            const val = context.raw || 0;
            const pct = played > 0 ? ((val / played) * 100).toFixed(1) : 0;
            return ` ${context.label}: ${val} (${pct}%)`;
          }
        }
      }
    },
    cutout: '65%'
  };

  return (
    <div className="team-detail-card" style={{ background: 'transparent', border: 'none', padding: 0, boxShadow: 'none', gap: '24px' }}>
      {/* Profile Header */}
      <div className="team-detail-header" style={{ width: '100%' }}>
        <div className="team-badge-name">
          {teamData.strBadge && (
            <img
              src={teamData.strBadge}
              alt={`${teamData.strTeam} Badge`}
              className="team-detail-badge"
            />
          )}
          <div>
            <h3 className="team-detail-name" style={{ fontSize: '22px' }}>{teamData.strTeam}</h3>
            <span className="team-league-name">
              English Premier League {teamData.isLive && <span className="live-tag">LIVE</span>}
            </span>
          </div>
        </div>
        <div className="team-rank-badge">
          <span className="rank-label">POSITION</span>
          <span className="rank-value" style={{ fontSize: '32px' }}>#{teamData.intRank}</span>
        </div>
      </div>

      {/* Error warning for details */}
      {detailsError && (
        <div className="glass-panel" style={{ borderColor: 'rgba(255, 0, 127, 0.3)', padding: '10px 16px', background: 'rgba(25, 4, 20, 0.6)', width: '100%', fontSize: '12px' }}>
          <span style={{ color: '#ff007f', marginRight: '6px' }}>⚠️</span>
          {detailsError}
        </div>
      )}

      {/* Grid of details: upper section */}
      <div className="club-details-grid">
        
        {/* Outcomes & Performance box */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h4 className="squad-title" style={{ fontSize: '12px' }}>Match Outcomes & Performance</h4>
          <div className="wdl-chart-wrapper" style={{ height: '150px', width: '100%', position: 'relative' }}>
            <Doughnut data={chartData} options={options} />
          </div>
          <div className="team-stats-grid" style={{ marginTop: '8px' }}>
            <div className="stat-row">
              <span className="stat-label">Win Rate</span>
              <span className="stat-val points-highlight">{winRate}%</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Avg Goals Scored</span>
              <span className="stat-val" style={{ color: 'var(--color-pl-cyan)' }}>{avgGoalsScored}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Avg Goals Conceded</span>
              <span className="stat-val" style={{ color: 'var(--color-pl-pink)' }}>{avgGoalsConceded}</span>
            </div>
          </div>
        </div>

        {/* Club Information Directory Card */}
        {teamData.info && (
          <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h4 className="squad-title" style={{ fontSize: '12px' }}>Club Information</h4>
            <div className="team-stats-grid">
              <div className="stat-row">
                <span className="stat-label">Nickname</span>
                <span className="stat-val">{teamData.info.nickname}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Founded</span>
                <span className="stat-val">{teamData.info.founded}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Manager</span>
                <span className="stat-val">{teamData.info.manager}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Stadium</span>
                <span className="stat-val">{teamData.info.stadium}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Capacity</span>
                <span className="stat-val">{teamData.info.capacity}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">City</span>
                <span className="stat-val">{teamData.info.city}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Grid of details: lower section */}
      <div className="club-details-grid">
        
        {/* Past Match History Card */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', position: 'relative' }}>
          <h4 className="squad-title" style={{ fontSize: '12px' }}>Match History (Last 5 Games)</h4>
          
          {loadingDetails ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '150px' }}>
              <div className="spinner" style={{ width: '24px', height: '24px', borderWidth: '2px' }}></div>
            </div>
          ) : liveHistory && liveHistory.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {liveHistory.map((match, idx) => {
                let resClass = 'neutral';
                if (match.result === 'W') resClass = 'win';
                if (match.result === 'L') resClass = 'loss';
                
                return (
                  <div key={idx} className="stat-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ fontSize: '13px', fontWeight: '600' }}>
                        {match.opponent} {match.wasHome ? '(Home)' : '(Away)'}
                      </span>
                      <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>
                        {match.round} - {match.date}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '13px', fontWeight: '700' }}>{match.score}</span>
                      <span className={`form-dot ${resClass}`} style={{ width: '18px', height: '18px', fontSize: '9px' }}>
                        {match.result}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px', color: 'var(--color-text-muted)' }}>
              No history found.
            </div>
          )}
        </div>

        {/* Player Roster Card */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', position: 'relative' }}>
          <h4 className="squad-title" style={{ fontSize: '12px' }}>Key Squad Roster</h4>
          
          {loadingDetails ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '150px' }}>
              <div className="spinner" style={{ width: '24px', height: '24px', borderWidth: '2px' }}></div>
            </div>
          ) : liveRoster && liveRoster.length > 0 ? (
            <div style={{ overflowY: 'auto', maxHeight: '250px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    <th style={{ padding: '6px 4px', color: 'var(--color-text-muted)' }}>No</th>
                    <th style={{ padding: '6px 4px', color: 'var(--color-text-muted)' }}>Name</th>
                    <th style={{ padding: '6px 4px', color: 'var(--color-text-muted)' }}>Pos</th>
                    <th style={{ padding: '6px 4px', color: 'var(--color-text-muted)' }}>Nat</th>
                    <th style={{ padding: '6px 4px', color: 'var(--color-text-muted)', textAlign: 'center' }}>Age</th>
                  </tr>
                </thead>
                <tbody>
                  {liveRoster.map((player, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                      <td style={{ padding: '8px 4px', fontWeight: '600', color: 'var(--color-pl-green)' }}>{player.no}</td>
                      <td style={{ padding: '8px 4px', fontWeight: '500' }}>{player.name}</td>
                      <td style={{ padding: '8px 4px', color: 'var(--color-text-secondary)' }}>{player.pos}</td>
                      <td style={{ padding: '8px 4px', color: 'var(--color-text-muted)' }}>{player.nat}</td>
                      <td style={{ padding: '8px 4px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>{player.age}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px', color: 'var(--color-text-muted)' }}>
              No players found.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
