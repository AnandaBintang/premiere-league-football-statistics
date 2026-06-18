import { useMemo } from 'react';

export default function TeamSelector({ data, selectedTeamId, onSelectTeam }) {
  // Sort teams alphabetically by name
  const sortedTeams = useMemo(() => {
    return [...data].sort((a, b) => a.strTeam.localeCompare(b.strTeam));
  }, [data]);

  return (
    <div className="selector-container">
      <label htmlFor="team-select" className="selector-label">
        Select Team for Detailed Insights
      </label>
      <div className="custom-select-wrapper">
        <select
          id="team-select"
          value={selectedTeamId || ''}
          onChange={(e) => onSelectTeam(e.target.value)}
          className="team-select-input"
        >
          <option value="" disabled>
            -- Choose a Club --
          </option>
          {sortedTeams.map((team) => (
            <option key={team.idTeam} value={team.idTeam}>
              {team.strTeam} (Rank: #{team.intRank})
            </option>
          ))}
        </select>
        <div className="select-arrow">
          <svg
            width="10"
            height="6"
            viewBox="0 0 10 6"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M1 1L5 5L9 1"
              stroke="white"
              strokeOpacity="0.7"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
