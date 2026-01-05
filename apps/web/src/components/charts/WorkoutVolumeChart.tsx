'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface WorkoutDataPoint {
  week: string;
  volume: number; // Total weight lifted in kg
  sessions: number;
}

interface WorkoutVolumeChartProps {
  data: WorkoutDataPoint[];
  height?: number;
}

export default function WorkoutVolumeChart({
  data,
  height = 300,
}: WorkoutVolumeChartProps) {
  const chartData: ChartData<'bar'> = {
    labels: data.map(d => d.week),
    datasets: [
      {
        label: 'Volume (kg)',
        data: data.map(d => d.volume),
        backgroundColor: 'rgba(59, 130, 246, 0.7)',
        borderColor: '#3b82f6',
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#18181b',
        titleColor: '#fafafa',
        bodyColor: '#a1a1aa',
        borderColor: '#27272a',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          afterLabel: (context) => {
            const dataPoint = data[context.dataIndex];
            return `Sessions: ${dataPoint.sessions}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#71717a',
          font: {
            family: 'Outfit',
            size: 11,
          },
        },
      },
      y: {
        grid: {
          color: 'rgba(39, 39, 42, 0.5)',
        },
        ticks: {
          color: '#71717a',
          font: {
            family: 'Outfit',
            size: 11,
          },
          callback: (value) => `${(Number(value) / 1000).toFixed(0)}k`,
        },
      },
    },
  };

  return (
    <div style={{ height }}>
      <Bar data={chartData} options={options} />
    </div>
  );
}

