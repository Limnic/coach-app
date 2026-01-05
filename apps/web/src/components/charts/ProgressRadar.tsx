'use client';

import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface ProgressRadarProps {
  metrics: {
    label: string;
    value: number; // 0-100
  }[];
  size?: number;
}

export default function ProgressRadar({ metrics, size = 300 }: ProgressRadarProps) {
  const data: ChartData<'radar'> = {
    labels: metrics.map(m => m.label),
    datasets: [
      {
        label: 'Progress',
        data: metrics.map(m => m.value),
        backgroundColor: 'rgba(249, 115, 22, 0.2)',
        borderColor: '#f97316',
        borderWidth: 2,
        pointBackgroundColor: '#f97316',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const options: ChartOptions<'radar'> = {
    responsive: true,
    maintainAspectRatio: true,
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
          label: (context) => `${context.parsed.r}%`,
        },
      },
    },
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        ticks: {
          stepSize: 25,
          color: '#71717a',
          backdropColor: 'transparent',
          font: {
            size: 10,
          },
        },
        grid: {
          color: 'rgba(39, 39, 42, 0.5)',
        },
        angleLines: {
          color: 'rgba(39, 39, 42, 0.5)',
        },
        pointLabels: {
          color: '#a1a1aa',
          font: {
            family: 'Outfit',
            size: 12,
          },
        },
      },
    },
  };

  return (
    <div style={{ width: size, height: size }}>
      <Radar data={data} options={options} />
    </div>
  );
}

