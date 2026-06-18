export default function StandingsTable({ data, onSelectTeam }) {
  // Sort teams by rank/position to render them in exact order
  const sortedData = [...data].sort((a, b) => parseInt(a.intRank, 10) - parseInt(b.intRank, 10));

  return (
    <div className="standings-table-container">
      <div className="table-header-row">
        <h3 className="chart-title">League Table</h3>
        <span className="table-hint">* Click any team row to view its detailed club profile</span>
      </div>
      
      <table className="standings-table">
        <thead>
          <tr>
            <th className="table-rank">Pos</th>
            <th>Team</th>
            <th style={{ textAlign: 'center' }}>Pld</th>
            <th style={{ textAlign: 'center' }}>W</th>
            <th style={{ textAlign: 'center' }}>D</th>
            <th style={{ textAlign: 'center' }}>L</th>
            <th style={{ textAlign: 'center' }}>GF</th>
            <th style={{ textAlign: 'center' }}>GA</th>
            <th style={{ textAlign: 'center' }}>GD</th>
            <th style={{ textAlign: 'center' }}>Pts</th>
            <th style={{ display: 'none' }}>Form</th>
            <th>Form</th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map((team) => {
            const rank = parseInt(team.intRank, 10);
            
            // Set class names for qualification visual borders
            let borderClass = '';
            if (rank <= 4) borderClass = 'row-cl';
            else if (rank === 5) borderClass = 'row-el';
            else if (rank >= 18) borderClass = 'row-rel';

            const formList = team.strForm ? team.strForm.split('') : [];

            return (
              <tr
                key={team.idTeam}
                className={borderClass}
                onClick={() => onSelectTeam(team.idTeam)}
                title={`Click to view ${team.strTeam} profile`}
              >
                <td className="table-rank">{team.intRank}</td>
                <td>
                  <div className="table-team-cell">
                    {team.strBadge && (
                      <img
                        src={team.strBadge}
                        alt={`${team.strTeam} Badge`}
                        className="table-team-badge"
                      />
                    )}
                    <span>
                      {team.strTeam}
                      {team.isLive && <span className="live-tag" style={{ marginLeft: '6px', fontSize: '8px' }}>LIVE</span>}
                    </span>
                  </div>
                </td>
                <td style={{ textAlign: 'center' }}>{team.intPlayed}</td>
                <td style={{ textAlign: 'center' }}>{team.intWin}</td>
                <td style={{ textAlign: 'center' }}>{team.intDraw}</td>
                <td style={{ textAlign: 'center' }}>{team.intLoss}</td>
                <td style={{ textAlign: 'center' }}>{team.intGoalsFor}</td>
                <td style={{ textAlign: 'center' }}>{team.intGoalsAgainst}</td>
                <td style={{ textAlign: 'center', fontWeight: '500' }} className={parseInt(team.intGoalDifference, 10) >= 0 ? 'pos-gd' : 'neg-gd'}>
                  {parseInt(team.intGoalDifference, 10) >= 0 ? '+' : ''}
                  {team.intGoalDifference}
                </td>
                <td style={{ textAlign: 'center', fontWeight: '700' }} className="points-highlight">
                  {team.intPoints}
                </td>
                <td>
                  <div className="form-dots" style={{ scale: '0.9', transformOrigin: 'left center' }}>
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
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
