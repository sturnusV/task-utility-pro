// src/components/charts/TaskStats.tsx
import { Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
} from 'chart.js';
import type { TaskAnalytics } from '../../types/task';
import { startOfISOWeek, endOfISOWeek, format, addWeeks } from 'date-fns';

// Register all necessary Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

interface TaskStatsProps {
  analytics: TaskAnalytics;
}

export default function TaskStats({ analytics }: TaskStatsProps) {
  // Improved week to month and week converter
  const weekToDateRange = (weekNumber: number, year = new Date().getFullYear()): string => {
    const firstDayOfYear = new Date(year, 0, 1);
    const firstMonday = startOfISOWeek(firstDayOfYear);
    const weekStartDate = addWeeks(firstMonday, weekNumber - 1);
    const weekEndDate = endOfISOWeek(weekStartDate);

    // Format as "Jun 1-7" or "Jun 28-Jul 4" for cross-month weeks
    const startMonth = format(weekStartDate, 'MMM');
    const startDay = format(weekStartDate, 'd');
    const endMonth = format(weekEndDate, 'MMM');
    const endDay = format(weekEndDate, 'd');

    return startMonth === endMonth
      ? `${startMonth} ${startDay}-${endDay}`
      : `${startMonth} ${startDay}-${endMonth} ${endDay}`;
  };


  const pieChartOptions = {
    plugins: {
      legend: {
        display: false
      },
    },
  };

  const statusData = {
    labels: ['To Do', 'In Progress', 'Done'],
    datasets: [
      {
        data: [
          analytics.tasks_by_status.todo,
          analytics.tasks_by_status.in_progress,
          analytics.tasks_by_status.done
        ],
        backgroundColor: [
          '#9CA3AF', // Gray (To Do)
          '#8B5CF6', // Purple (In Progress)
          '#3B82F6'  // Blue (Done)
        ],
        borderWidth: 1,
      },
    ],
  };

  const priorityData = {
    labels: ['Low', 'Medium', 'High'],
    datasets: [
      {
        data: [
          analytics.tasks_by_priority.low,
          analytics.tasks_by_priority.medium,
          analytics.tasks_by_priority.high
        ],
        backgroundColor: [
          '#10B981', // Green (Low)
          '#F59E0B', // Yellow (Medium)
          '#EF4444'  // Red (High)
        ],
        borderWidth: 1,
      },
    ],
  };

  // Get all unique weeks from both completion and archived data
  const allWeeks = Array.from(new Set([
    ...analytics.weekly_completion.map(item => item.week),
    ...(analytics.weekly_archived?.map(item => item.week) || [])
  ])).sort((a, b) => parseInt(a) - parseInt(b));

  // Create labels showing date ranges
  const weekLabels = allWeeks.map(week =>
    weekToDateRange(Number(week))
  );

  const weeklyCompletionChartData = {
    labels: weekLabels,
    datasets: [
      {
        label: 'Tasks Completed',
        data: allWeeks.map(week =>
          analytics.weekly_completion.find(item => item.week === week)?.count || 0
        ),
        backgroundColor: '#3B82F6',
        borderColor: '#2563EB',
        borderWidth: 1,
        barThickness: 8,
        maxBarThickness: 8,
      },
      {
        label: 'Tasks Archived',
        data: allWeeks.map(week =>
          analytics.weekly_archived?.find(item => item.week === week)?.count || 0
        ),
        backgroundColor: '#F97316',
        borderColor: '#EA580C',
        borderWidth: 1,
        barThickness: 8,
        maxBarThickness: 8,
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Pie charts row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-medium mb-3">Tasks by Status</h3>
          <div className="flex justify-center mb-4 space-x-4">
            <div className="flex items-center">
              <div className="w-3 h-3 text-nowrap bg-gray-400 mr-2 shrink-0"></div>
              <span className="text-sm whitespace-nowrap truncate">To Do</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 text-nowrap bg-violet-500 mr-2 shrink-0"></div>
              <span className="text-sm whitespace-nowrap truncate">In Progress</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 text-nowrap bg-blue-500 mr-2 shrink-0"></div>
              <span className="text-sm whitespace-nowrap truncate">Done</span>
            </div>
          </div>
          <Pie data={statusData} options={pieChartOptions} />
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-medium mb-3">Tasks by Priority</h3>
                    <div className="flex justify-center mb-4 space-x-4">
            <div className="flex items-center">
              <div className="w-3 h-3 text-nowrap bg-emerald-500 mr-2 shrink-0"></div>
              <span className="text-sm whitespace-nowrap truncate">Low</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 text-nowrap bg-amber-500 mr-2 shrink-0"></div>
              <span className="text-sm whitespace-nowrap truncate">Medium</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 text-nowrap bg-red-500 mr-2 shrink-0"></div>
              <span className="text-sm whitespace-nowrap truncate">High</span>
            </div>
          </div>
          <Pie data={priorityData} options={pieChartOptions} />
        </div>
      </div>

      {/* Bar chart row */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="font-medium mb-3">Weekly Tasks Completed</h3>
        <div className="flex justify-center mb-4 space-x-4">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 mr-2 shrink-0"></div>
            <span className="text-sm whitespace-nowrap truncate">Tasks Completed</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-orange-500 mr-2 shrink-0"></div>
            <span className="text-sm whitespace-nowrap truncate">Tasks Archived</span>
          </div>
        </div>
        <Bar
          data={weeklyCompletionChartData}
          options={{
            scales: {
              x: {
                ticks: {
                  autoSkip: false,
                  maxRotation: 45,
                  minRotation: 45
                }
              }
            },
            plugins: {
              legend: {
                display: false
              },
            },
          }}
        />
      </div>
    </div>
  );
}