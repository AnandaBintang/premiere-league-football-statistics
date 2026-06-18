# Premier League 2025-2026 Visual Statistics Dashboard

This repository contains a premium, interactive statistics and performance dashboard for the English Premier League 2025-2026 season. Built using React, Vite, and Chart.js, the application provides comprehensive visualization tools to analyze team standings, goal records, player leaderboards, and detailed club profiles.

## Core Features

*   **Multi-Tab Navigation:** Fluid, single-page application structure separating statistics into Standings, Player Stats, and Club Profiles.
*   **Standings and Charts Page:**
    *   Four KPI Cards: Displaying total matches played, overall goals scored, current champion team, and relegation count.
    *   Standings Points Bar Chart: Color-coded bars showing league points with visual zones for UEFA Champions League, UEFA Europa League, and Relegation.
    *   Goals Analysis Chart: A grouped bar chart comparing Goals For and Goals Against side-by-side.
    *   League Standings Table: Complete table displaying Rank, Team name, Played, Won, Drawn, Lost, Goals For, Goals Against, Goal Difference, Points, and Recent Form.
*   **Player Statistics Page:**
    *   Top Goalscorers: Leaderboard tracking the Golden Boot race with progressive visual bars.
    *   Top Assists: Leaderboard tracking playmakers with progress indicators.
*   **Club Profiles Page:**
    *   Roster Viewer: List of key squad members, numbers, and positions for the selected club.
    *   Match Outcomes: Interactive doughnut chart representing Wins, Draws, and Losses.
    *   Advanced Performance Metrics: Dynamically calculated rates including Win Rate percentage, Draw Rate percentage, average Goals Scored per match, and average Goals Conceded per match.

## Linked Navigation UX

The dashboard includes connected routing logic: clicking on any club row in the main standings table automatically updates the active selection and redirects the user directly to the Club Profiles page. A return button is provided on the profile view to navigate back to the standings dashboard.

## Technical Architecture and Data Strategy

### Live API Architecture
To supply the dashboard with comprehensive and complete statistics in real-time, the application fetches live records directly from the public ESPN API endpoints:
1. **Standings Feed:** The hook fetches all 20 Premier League clubs dynamically, parsing Played, Wins, Draws, Losses, Goals For, Goals Against, Goal Difference, and Points.
2. **Squad Rosters:** Selected club profiles query the roster feed to retrieve live athlete jersey numbers, positions, nationalities, and ages.
3. **Match Histories:** The system queries completed match schedules for the selected club to compute Win-Draw-Loss rates and formats the previous five match outcomes.

### Lightweight Metadata Lookup
To avoid unnecessary network roundtrips and API bottlenecks, the dashboard merges the live standings feed with a minimal local lookup catalog. This catalog translates team records to append stadium details, founded years, capacities, managers, nicknames, and cities.

## Tech Stack

*   **Framework:** React 19 and Vite 8 (scaffolded for fast builds and hot module replacement).
*   **Data Visualization:** Chart.js with react-chartjs-2 wrapper.
*   **Styling:** Vanilla CSS utilizing custom properties, glassmorphism layouts, radial lighting gradients, and fluid transform animations.
*   **Package Manager:** pnpm 10.

## Installation and Local Running

To run this project locally, ensure you have Node.js and pnpm installed.

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/AnandaBintang/premiere-league-football-statistics
    cd football-statistics
    ```

2.  **Install Dependencies:**
    ```bash
    pnpm install
    ```

3.  **Run Development Server:**
    ```bash
    pnpm run dev
    ```
    Once started, open the local address shown in the terminal (typically http://localhost:5173/) in your web browser.

4.  **Build for Production:**
    ```bash
    pnpm run build
    ```
