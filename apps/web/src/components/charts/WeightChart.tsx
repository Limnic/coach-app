'use client';

import { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartData,
  ChartOptions,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface WeightDataPoint {
  date: string;
  weight: number;
}

interface WeightChartProps {
  data: WeightDataPoint[];
  targetWeight?: number;
  startWeight?: number;
  unit?: 'kg' | 'lbs';
  height?: number;
}

export default function WeightChart({
  data,
  targetWeight,
  startWeight,
  unit = 'kg',
  height = 300,
}: WeightChartProps) {
  const chartData: ChartData<'line'> = {
    labels: data.map(d => {
      const date = new Date(d.date);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }),
    datasets: [
      {
        label: `Weight (${unit})`,
        data: data.map(d => d.weight),
        borderColor: '#f97316',
        backgroundColor: 'rgba(249, 115, 22, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: '#f97316',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointHoverRadius: 6,
      },
      ...(targetWeight ? [{
        label: 'Target',
        data: data.map(() => targetWeight),
        borderColor: '#84cc16',
        borderWidth: 2,
        borderDash: [5, 5],
        pointRadius: 0,
        fill: false,
      }] : []),
      ...(startWeight ? [{
        label: 'Start',
        data: data.map(() => startWeight),
        borderColor: '#71717a',
        borderWidth: 1,
        borderDash: [3, 3],
        pointRadius: 0,
        fill: false,
      }] : []),
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index',
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        align: 'end',
        labels: {
          color: '#a1a1aa',
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20,
          font: {
            family: 'Outfit',
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: '#18181b',
        titleColor: '#fafafa',
        bodyColor: '#a1a1aa',
        borderColor: '#27272a',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: (context) => `${context.parsed.y.toFixed(1)} ${unit}`,
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
          callback: (value) => `${value} ${unit}`,
        },
      },
    },
  };

  return (
    <div style={{ height }}>
      <Line data={chartData} options={options} />
    </div>
  );
}

