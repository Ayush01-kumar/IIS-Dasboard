import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

export default function SpeedChart({ dataPoints }) {
  const labels = dataPoints.map((item) =>
    new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  );
  const values = dataPoints.map((item) => Number(item.speed.toFixed(2)));

  const data = {
    labels,
    datasets: [
      {
        label: 'ISS Speed (km/h)',
        data: values,
        borderColor: '#818cf8',
        backgroundColor: 'rgba(129, 140, 248, 0.25)',
        pointRadius: 2,
        tension: 0.28,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: {
        ticks: { color: '#94a3b8' },
        grid: { color: 'rgba(148, 163, 184, 0.15)' },
      },
      x: {
        ticks: { color: '#94a3b8' },
        grid: { color: 'rgba(148, 163, 184, 0.1)' },
      },
    },
  };

  return (
    <div className="h-52 w-full">
      <Line data={data} options={options} />
    </div>
  );
}
