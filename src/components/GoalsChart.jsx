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

export default function GoalsChart({ data }) {
  // Sort by standings rank so we see high performing teams on the left
  const sortedData = [...data].sort((a, b) => parseInt(a.intRank, 10) - parseInt(b.intRank, 10));

  const labels = sortedData.map((team) => team.strTeam);
  const goalsFor = sortedData.map((team) => parseInt(team.intGoalsFor, 10) || 0);
  const goalsAgainst = sortedData.map((team) => parseInt(team.intGoalsAgainst, 10) || 0);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Goals For (Scored)',
        data: goalsFor,
        backgroundColor: '#00f2fe',
        borderColor: '#00f2fe',
        borderWidth: 1,
        borderRadius: 3,
        hoverBackgroundColor: '#20f7ff'
      },
      {
        label: 'Goals Against (Conceded)',
        data: goalsAgainst,
        backgroundColor: '#ff007f',
        borderColor: '#ff007f',
        borderWidth: 1,
        borderRadius: 3,
        hoverBackgroundColor: '#ff209f'
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: 'rgba(255, 255, 255, 0.7)',
          font: {
            family: 'Outfit, sans-serif',
            size: 12
          },
          usePointStyle: true,
          pointStyle: 'circle'
        }
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
            const label = context.dataset.label || '';
            const val = context.raw || 0;
            return ` ${label}: ${val} goals`;
          },
          afterLabel: (context) => {
            const team = sortedData[context.dataIndex];
            const gd = parseInt(team.intGoalDifference, 10) || 0;
            return ` Goal Diff: ${gd >= 0 ? '+' : ''}${gd}`;
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
          }
        },
        min: 0,
        max: 90
      }
    }
  };

  return (
    <div className="chart-container">
      <div className="chart-header">
        <h3 className="chart-title">Goals Analysis - Offensive vs Defensive Strength</h3>
      </div>
      <div className="chart-wrapper" style={{ height: '350px', position: 'relative' }}>
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}
