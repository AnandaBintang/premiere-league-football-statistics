import { useState, useEffect } from "react";
import useLeagueData from "./hooks/useLeagueData";
import KpiCard from "./components/KpiCard";
import StandingsChart from "./components/StandingsChart";
import GoalsChart from "./components/GoalsChart";
import StandingsTable from "./components/StandingsTable";
import PlayerStats from "./components/PlayerStats";
import WDLChart from "./components/WDLChart";
import TeamSelector from "./components/TeamSelector";
import plLogo from "./assets/premier-league-logo.svg";
import "./App.css";

export default function App() {
  const { tableData, loading, error } = useLeagueData();
  const [activeTab, setActiveTab] = useState("standings"); // 'standings' | 'players' | 'clubs'
  const [selectedTeamId, setSelectedTeamId] = useState("");

  // Auto-select the top team once data is loaded
  useEffect(() => {
    if (tableData && tableData.length > 0 && !selectedTeamId) {
      const topTeam = tableData.find((team) => String(team.intRank) === "1");
      if (topTeam) {
        setSelectedTeamId(topTeam.idTeam);
      }
    }
  }, [tableData, selectedTeamId]);

  // Handle click on a team row in the standings table to redirect to Club Profiles
  const handleSelectTeamRow = (teamId) => {
    setSelectedTeamId(teamId);
    setActiveTab("clubs");
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p className="loading-text">Loading Premier League Stats...</p>
      </div>
    );
  }

  // Calculate KPIs
  const totalGoals = tableData.reduce(
    (acc, team) => acc + (parseInt(team.intGoalsFor, 10) || 0),
    0,
  );

  const totalMatches = Math.round(
    tableData.reduce(
      (acc, team) => acc + (parseInt(team.intPlayed, 10) || 0),
      0,
    ) / 2,
  );

  const championTeam =
    tableData.find((t) => String(t.intRank) === "1")?.strTeam || "Arsenal";

  const selectedTeam = tableData.find(
    (team) => String(team.idTeam) === String(selectedTeamId),
  );

  return (
    <div className="dashboard-layout">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-brand">
          <img src={plLogo} alt="Premier League" className="pl-logo-img" />
          <div className="dashboard-title-area">
            <span className="dashboard-subtitle">
              Visual Statistics & Performance Dashboard
            </span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div className="season-badge">SEASON 2025/2026</div>
          <a
            href="/presentasi.html"
            className="tab-btn"
            target="_blank"
            rel="noopener noreferrer"
            style={{ padding: "6px 10px" }}
          >
            📽️ Presentation
          </a>
        </div>
      </header>

      {/* Tabs Navigation Header */}
      <nav className="tabs-nav">
        <button
          className={`tab-btn ${activeTab === "standings" ? "active" : ""}`}
          onClick={() => setActiveTab("standings")}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 3v18h18" />
            <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" />
          </svg>
          Standings & Charts
        </button>
        <button
          className={`tab-btn ${activeTab === "players" ? "active" : ""}`}
          onClick={() => setActiveTab("players")}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          Player Stats
        </button>
        <button
          className={`tab-btn ${activeTab === "clubs" ? "active" : ""}`}
          onClick={() => setActiveTab("clubs")}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          Club Profiles
        </button>
      </nav>

      {/* API Warn Banner if error occurred */}
      {error && (
        <div
          className="glass-panel"
          style={{
            borderColor: "rgba(255, 0, 127, 0.4)",
            padding: "12px 20px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            background: "rgba(25, 4, 20, 0.8)",
          }}
        >
          <span
            style={{ color: "#ff007f", fontSize: "18px", fontWeight: "bold" }}
          >
            ⚠️
          </span>
          <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.85)" }}>
            {error} Displaying cached standings from June 2026.
          </span>
        </div>
      )}

      {/* KPI Section */}
      <section className="kpi-grid">
        <KpiCard
          label="Total Matches"
          value={totalMatches}
          suffix=" / 380"
          icon={
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2v20M2 12h20" />
            </svg>
          }
        />
        <KpiCard
          label="Goals Scored"
          value={totalGoals}
          suffix=" Goals"
          icon={
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          }
        />
        <KpiCard
          label="Champion Team"
          value={championTeam}
          icon={
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          }
        />
        <KpiCard
          label="Relegation Zone"
          value="3"
          suffix=" Clubs"
          icon={
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          }
        />
      </section>

      {/* Main Pages Content */}
      <main>
        {/* Tab 1: Standings & Visual Charts */}
        {activeTab === "standings" && (
          <div className="main-content-grid">
            <div className="charts-column">
              <StandingsChart data={tableData} />
              <GoalsChart data={tableData} />
            </div>
            <div className="details-column">
              <StandingsTable
                data={tableData}
                onSelectTeam={handleSelectTeamRow}
              />
            </div>
          </div>
        )}

        {/* Tab 2: Player stats leaderboards */}
        {activeTab === "players" && <PlayerStats />}

        {/* Tab 3: Detailed Club profiles */}
        {activeTab === "clubs" && (
          <div className="main-content-grid clubs-grid">
            <div className="details-column">
              <button
                className="back-btn"
                onClick={() => setActiveTab("standings")}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ marginRight: "6px" }}
                >
                  <line x1="19" y1="12" x2="5" y2="12"></line>
                  <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
                Back to Standings
              </button>
              <div className="profile-selection-card glass-panel">
                <TeamSelector
                  data={tableData}
                  selectedTeamId={selectedTeamId}
                  onSelectTeam={setSelectedTeamId}
                />
              </div>
            </div>
            <div className="charts-column">
              {selectedTeam && <WDLChart teamData={selectedTeam} />}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="dashboard-footer">
        <div>
          Data fetched live in real-time from the public ESPN API endpoints
          (including live league standings, club rosters, and match schedules).
        </div>
        <div>
          Premier League Visual Dashboard &copy; {new Date().getFullYear()} -
          Mata Kuliah Visualisasi Data
        </div>
      </footer>
    </div>
  );
}
