import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function StandingsChart({ data }) {
  // Sort data by rank/points to ensure proper ordered rendering
  const sortedData = [...data].sort((a, b) => parseInt(a.intRank, 10) - parseInt(b.intRank, 10));

  const labels = sortedData.map((team) => team.strTeam);
  const points = sortedData.map((team) => parseInt(team.intPoints, 10) || 0);

  // Set colors based on standing position (1-indexed rank)
  const backgroundColors = sortedData.map((team) => {
    const rank = parseInt(team.intRank, 10);
    if (rank <= 4) {
      return '#00ff87'; // Champions League zone: Neon Green
    } else if (rank === 5) {
      return '#00f2fe'; // Europa League zone: Bright Cyan
    } else if (rank >= 18) {
      return '#ff007f'; // Relegation zone: Neon Magenta
    }
    return 'rgba(255, 255, 255, 0.25)'; // Mid-table: Semi-transparent white
  });

  const borderColors = sortedData.map((team) => {
    const rank = parseInt(team.intRank, 10);
    if (rank <= 4) return '#00ff87';
    if (rank === 5) return '#00f2fe';
    if (rank >= 18) return '#ff007f';
    return 'rgba(255, 255, 255, 0.4)';
  });

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Points',
        data: points,
        backgroundColor: backgroundColors,
        borderColor: borderColors,
        borderWidth: 1,
        borderRadius: 4,
        hoverBackgroundColor: sortedData.map((team) => {
          const rank = parseInt(team.intRank, 10);
          if (rank <= 4) return '#10ff97';
          if (rank === 5) return '#20f7ff';
          if (rank >= 18) return '#ff209f';
          return 'rgba(255, 255, 255, 0.5)';
        })
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: '#1c072d',
        titleFont: {
          family: 'Outfit, sans-serif',
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          family: 'Inter, sans-serif',
          size: 12
        },
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: (context) => {
            const team = sortedData[context.dataIndex];
            return [
              ` Points: ${team.intPoints}`,
              ` Rank: #${team.intRank}`,
              ` Record: ${team.intWin}W - ${team.intDraw}D - ${team.intLoss}L`,
              ` Goal Diff: ${team.intGoalDifference >= 0 ? '+' : ''}${team.intGoalDifference}`,
              ` Form: ${team.strForm}`
            ];
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.6)',
          font: {
            family: 'Outfit, sans-serif',
            size: 11
          },
          maxRotation: 45,
          minRotation: 45
        }
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
          drawBorder: false
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.6)',
          font: {
            family: 'Outfit, sans-serif',
            size: 11
          },
          stepSize: 10
        },
        min: 0,
        max: 100
      }
    }
  };

  return (
    <div className="chart-container">
      <div className="chart-header">
        <h3 className="chart-title">League Standings - Points Breakdown</h3>
        <div className="legend-pills">
          <span className="pill pill-cl"><span className="dot dot-cl"></span>CL Top 4</span>
          <span className="pill pill-el"><span className="dot dot-el"></span>EL 5th</span>
          <span className="pill pill-mid"><span className="dot dot-mid"></span>Mid Table</span>
          <span className="pill pill-rel"><span className="dot dot-rel"></span>Relegation</span>
        </div>
      </div>
      <div className="chart-wrapper" style={{ height: '350px', position: 'relative' }}>
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}
