'use client';

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

interface MacroChartProps {
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
  targetCalories?: number;
  size?: number;
}

export default function MacroChart({
  protein,
  carbs,
  fat,
  calories,
  targetCalories,
  size = 200,
}: MacroChartProps) {
  const proteinCals = protein * 4;
  const carbsCals = carbs * 4;
  const fatCals = fat * 9;

  const data: ChartData<'doughnut'> = {
    labels: ['Protein', 'Carbs', 'Fat'],
    datasets: [
      {
        data: [proteinCals, carbsCals, fatCals],
        backgroundColor: [
          'rgba(244, 63, 94, 0.8)',
          'rgba(132, 204, 22, 0.8)',
          'rgba(59, 130, 246, 0.8)',
        ],
        borderColor: [
          '#f43f5e',
          '#84cc16',
          '#3b82f6',
        ],
        borderWidth: 2,
        hoverOffset: 8,
      },
    ],
  };

  const options: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: true,
    cutout: '70%',
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
          label: (context) => {
            const label = context.label;
            const value = context.parsed;
            const total = proteinCals + carbsCals + fatCals;
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value} kcal (${percentage}%)`;
          },
        },
      },
    },
  };

  const percentage = targetCalories 
    ? Math.min(Math.round((calories / targetCalories) * 100), 100) 
    : 100;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <Doughnut data={data} options={options} />
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold font-display text-surface-100">
          {calories}
        </span>
        <span className="text-sm text-surface-500">kcal</span>
        {targetCalories && (
          <span className="text-xs text-surface-400 mt-1">
            {percentage}% of goal
          </span>
        )}
      </div>
    </div>
  );
}

