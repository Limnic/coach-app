'use client';

import { motion } from 'framer-motion';

interface ActivityDay {
  date: string;
  count: number; // 0-4 (intensity levels)
}

interface ActivityHeatmapProps {
  data: ActivityDay[];
  weeks?: number;
}

export default function ActivityHeatmap({ data, weeks = 12 }: ActivityHeatmapProps) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  // Generate grid data
  const gridData: (ActivityDay | null)[][] = [];
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - (weeks * 7));

  // Create a map of date -> count
  const dataMap = new Map(data.map(d => [d.date, d.count]));

  // Generate weeks
  for (let w = 0; w < weeks; w++) {
    const week: (ActivityDay | null)[] = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + (w * 7) + d);
      
      if (date > endDate) {
        week.push(null);
      } else {
        const dateStr = date.toISOString().split('T')[0];
        week.push({
          date: dateStr,
          count: dataMap.get(dateStr) || 0,
        });
      }
    }
    gridData.push(week);
  }

  const getIntensityColor = (count: number) => {
    switch (count) {
      case 0:
        return 'bg-surface-800';
      case 1:
        return 'bg-lime-900/50';
      case 2:
        return 'bg-lime-700/60';
      case 3:
        return 'bg-lime-500/70';
      case 4:
        return 'bg-lime-400';
      default:
        return 'bg-surface-800';
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        {/* Day labels */}
        <div className="flex flex-col gap-1 mr-2">
          {days.map((day, i) => (
            <div key={day} className="h-3 flex items-center">
              {i % 2 === 0 && (
                <span className="text-[10px] text-surface-500 w-6">{day}</span>
              )}
            </div>
          ))}
        </div>

        {/* Grid */}
        {gridData.map((week, weekIndex) => (
          <div key={weekIndex} className="flex flex-col gap-1">
            {week.map((day, dayIndex) => (
              <motion.div
                key={`${weekIndex}-${dayIndex}`}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: (weekIndex * 7 + dayIndex) * 0.005 }}
                className="relative group"
              >
                <div
                  className={`w-3 h-3 rounded-sm ${
                    day ? getIntensityColor(day.count) : 'bg-transparent'
                  } ${day ? 'hover:ring-2 hover:ring-brand-500/50 cursor-pointer' : ''}`}
                />
                {day && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded bg-surface-800 text-xs text-surface-300 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    {formatDate(day.date)}
                    <br />
                    <span className="text-surface-400">
                      {day.count === 0 ? 'No activity' : `${day.count} workout${day.count > 1 ? 's' : ''}`}
                    </span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-4">
        <span className="text-xs text-surface-500">Less</span>
        <div className="flex gap-1">
          {[0, 1, 2, 3, 4].map((level) => (
            <div
              key={level}
              className={`w-3 h-3 rounded-sm ${getIntensityColor(level)}`}
            />
          ))}
        </div>
        <span className="text-xs text-surface-500">More</span>
      </div>
    </div>
  );
}

