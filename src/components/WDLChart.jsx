import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function WDLChart({ teamData }) {
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
  const drawRate = ((draws / played) * 100).toFixed(1);
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

  const formList = teamData.strForm ? teamData.strForm.split('') : [];

  return (
    <div className="team-detail-card" style={{ background: 'transparent', border: 'none', padding: 0, boxShadow: 'none' }}>
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

      <div className="team-detail-body">
        {/* Doughnut WDL Visual */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', gap: '8px' }}>
          <span className="squad-title" style={{ fontSize: '11px', alignSelf: 'flex-start' }}>Match Outcomes Breakdown</span>
          <div className="wdl-chart-wrapper" style={{ height: '170px', width: '100%', position: 'relative' }}>
            <Doughnut data={chartData} options={options} />
          </div>
        </div>

        {/* Regular Statistics Grid */}
        <div className="team-stats-grid">
          <div className="stat-row">
            <span className="stat-label">Played Matches</span>
            <span className="stat-val">{teamData.intPlayed}</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">Total Points</span>
            <span className="stat-val points-highlight" style={{ fontSize: '18px' }}>{teamData.intPoints}</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">Goal Difference</span>
            <span className={`stat-val ${parseInt(teamData.intGoalDifference, 10) >= 0 ? 'pos-gd' : 'neg-gd'}`}>
              {parseInt(teamData.intGoalDifference, 10) >= 0 ? '+' : ''}
              {teamData.intGoalDifference}
            </span>
          </div>
          <div className="form-section">
            <span className="stat-label">Recent Form</span>
            <div className="form-dots">
              {formList.map((outcome, idx) => {
                let statusClass = 'neutral';
                if (outcome === 'W') statusClass = 'win';
                if (outcome === 'L') statusClass = 'loss';
                return (
                  <span key={idx} className={`form-dot ${statusClass}`} title={outcome}>
                    {outcome}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        {/* Advanced Calculations Section */}
        <div className="team-stats-grid">
          <span className="squad-title" style={{ fontSize: '11px', alignSelf: 'flex-start', marginTop: '6px' }}>Calculated Performance Metrics</span>
          <div className="metrics-grid">
            <div className="metric-box">
              <span className="stat-label" style={{ fontSize: '11px' }}>Win Rate</span>
              <span className="metric-value-large">{winRate}%</span>
            </div>
            <div className="metric-box">
              <span className="stat-label" style={{ fontSize: '11px' }}>Draw Rate</span>
              <span className="metric-value-large" style={{ color: 'rgba(255,255,255,0.7)' }}>{drawRate}%</span>
            </div>
            <div className="metric-box">
              <span className="stat-label" style={{ fontSize: '11px' }}>Avg Goals Scored</span>
              <span className="metric-value-large" style={{ color: 'var(--color-pl-cyan)' }}>{avgGoalsScored}</span>
            </div>
            <div className="metric-box">
              <span className="stat-label" style={{ fontSize: '11px' }}>Avg Goals Conceded</span>
              <span className="metric-value-large" style={{ color: 'var(--color-pl-pink)' }}>{avgGoalsConceded}</span>
            </div>
          </div>
        </div>

        {/* Star Players Roster list */}
        {teamData.squad && teamData.squad.length > 0 && (
          <div className="squad-container">
            <h4 className="squad-title">Key Players & Roster</h4>
            <div className="squad-list">
              {teamData.squad.map((player) => (
                <div key={player.name} className="squad-item">
                  <span className="squad-no">#{player.no}</span>
                  <span className="squad-name">{player.name}</span>
                  <span className="squad-pos">{player.pos}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
