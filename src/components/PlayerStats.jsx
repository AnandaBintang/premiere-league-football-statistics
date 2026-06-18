import playersData from '../data/fallbackPlayers.json';

export default function PlayerStats() {
  const { scorers, assists } = playersData;

  const maxGoals = parseInt(scorers[0]?.intGoals, 10) || 30;
  const maxAssists = parseInt(assists[0]?.intAssists, 10) || 25;

  return (
    <div className="player-stats-grid">
      {/* Top Scorers Card */}
      <div className="leaderboard-card">
        <div className="chart-header" style={{ marginBottom: '10px' }}>
          <h3 className="chart-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>⚽</span> Top Goalscorers
          </h3>
          <span className="season-badge" style={{ padding: '4px 10px', fontSize: '11px' }}>Golden Boot Race</span>
        </div>

        <div className="leaderboard-list">
          {scorers.map((player) => {
            const rank = parseInt(player.intRank, 10);
            const goals = parseInt(player.intGoals, 10) || 0;
            const pct = (goals / maxGoals) * 100;

            return (
              <div key={player.strPlayer} className="leaderboard-item">
                <span className={`player-rank player-rank-${rank}`}>{player.intRank}</span>
                
                <div className="player-info">
                  <span className="player-name">{player.strPlayer}</span>
                  <span className="player-team">
                    {player.strBadge && (
                      <img
                        src={player.strBadge}
                        alt=""
                        className="table-team-badge"
                        style={{ width: '14px', height: '14px' }}
                      />
                    )}
                    {player.strTeam}
                  </span>
                  
                  {/* Progress Bar */}
                  <div className="progress-bar-bg">
                    <div className="progress-bar-fill" style={{ width: `${pct}%` }}></div>
                  </div>
                </div>

                <div className="player-metric">
                  <span className="metric-count">{player.intGoals}</span>
                  <span className="metric-label">Goals</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Assists Card */}
      <div className="leaderboard-card">
        <div className="chart-header" style={{ marginBottom: '10px' }}>
          <h3 className="chart-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>👟</span> Top Assist Providers
          </h3>
          <span className="season-badge" style={{ padding: '4px 10px', fontSize: '11px', borderColor: 'rgba(0, 242, 254, 0.3)', color: 'var(--color-pl-cyan)' }}>Playmaker Award</span>
        </div>

        <div className="leaderboard-list">
          {assists.map((player) => {
            const rank = parseInt(player.intRank, 10);
            const assistsCount = parseInt(player.intAssists, 10) || 0;
            const pct = (assistsCount / maxAssists) * 100;

            return (
              <div key={player.strPlayer} className="leaderboard-item">
                <span className={`player-rank player-rank-${rank}`}>{player.intRank}</span>
                
                <div className="player-info">
                  <span className="player-name">{player.strPlayer}</span>
                  <span className="player-team">
                    {player.strBadge && (
                      <img
                        src={player.strBadge}
                        alt=""
                        className="table-team-badge"
                        style={{ width: '14px', height: '14px' }}
                      />
                    )}
                    {player.strTeam}
                  </span>
                  
                  {/* Progress Bar */}
                  <div className="progress-bar-bg">
                    <div className="progress-bar-fill" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #38003c, var(--color-pl-cyan))' }}></div>
                  </div>
                </div>

                <div className="player-metric">
                  <span className="metric-count" style={{ color: 'var(--color-pl-cyan)' }}>{player.intAssists}</span>
                  <span className="metric-label">Assists</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
