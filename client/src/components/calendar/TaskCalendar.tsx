import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import type { View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import './calendar.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import type { Task } from '../../types/task';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface TaskCalendarProps {
  tasks: Task[];
  onSelectTask: (task: Task) => void;
  view?: View;
  onView?: (view: View) => void;
  onNavigate?: (date: Date) => void;
  date?: Date;
  defaultView?: View;
  min?: Date;
  max?: Date;
  step?: number;
  timeslots?: number;
  views?: {
    month?: boolean;
    week?: boolean;
    day?: boolean;
    agenda?: boolean;
  };
}

export default function TaskCalendar({
  tasks,
  onSelectTask,
  view = Views.MONTH,
  onView,
  onNavigate,
  date = new Date(),
  defaultView = Views.MONTH,
  min = new Date(0, 0, 0, 8, 0, 0),    // Default: 8am
  max = new Date(0, 0, 0, 22, 0, 0),   // Default: 10pm
  step = 30,                            // Default: 30 minutes
  timeslots = 2,                        // Default: 2 slots per hour
  views = { month: true, week: true, day: true, agenda: true }
}: TaskCalendarProps) {
  // Convert tasks to calendar events
  const events = tasks.map(task => {
    // Create base start date from due_date
    const startDate = task.due_date ? new Date(task.due_date) : new Date();

    // If task has a due_time, combine it with the date
    if (task.due_time) {
      const [hours, minutes] = task.due_time.split(':').map(Number);
      startDate.setHours(hours, minutes, 0, 0);
    } else {
      // For all-day events, set to start of day
      startDate.setHours(0, 0, 0, 0);
    }

    // Create end date - 1 hour after start for timed events, end of day for all-day
    const endDate = new Date(startDate);
    if (task.due_time) {
      endDate.setHours(endDate.getHours() + 1); // 1 hour duration for timed events
    } else {
      endDate.setHours(23, 59, 59, 999); // End of day for all-day events
    }

    return {
      id: task.id,
      title: task.title,
      start: startDate,
      end: endDate,
      allDay: !task.due_time, // Mark as allDay if no time specified
      resource: task,
    };
  });

  return (
    <div className="h-[800px]">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        view={view}
        onView={onView}
        onNavigate={onNavigate}
        date={date}
        views={views}
        defaultView={defaultView}
        min={min}
        max={max}
        step={step}
        timeslots={timeslots}
        onSelectEvent={(event) => onSelectTask(event.resource)}
        eventPropGetter={(event) => {
          const task = event.resource as Task;
          let backgroundColor = '#3174ad';

          if (task.status === 'done') {
            backgroundColor = '#4CAF50';
          } else if (new Date(task.due_date) < new Date()) {
            backgroundColor = '#F44336';
          } else if (task.priority === 'high') {
            backgroundColor = '#FF9800';
          }

          return { style: { backgroundColor } };
        }}
        components={{
          toolbar: CustomToolbar
        }}
      />
    </div>
  );
}

// Custom toolbar component for better styling
const CustomToolbar = ({ label, onNavigate, onView, view }: any) => {
  return (
    <div className="rbc-toolbar mb-4">
      {/* Mobile-first layout */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Top row for mobile - navigation and label */}
        <div className="flex items-center justify-between sm:justify-start sm:gap-4">
          {/* Navigation buttons */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              onClick={() => onNavigate('TODAY')}
              className="px-2 py-1 text-xs sm:text-sm font-medium rounded-md bg-gray-100 hover:bg-gray-200 whitespace-nowrap"
            >
              Today
            </button>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onNavigate('PREV')}
                className="p-1 rounded-md hover:bg-gray-200"
                aria-label="Previous"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => onNavigate('NEXT')}
                className="p-1 rounded-md hover:bg-gray-200"
                aria-label="Next"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Month/year label - moves to center on desktop */}
          <span className="text-sm sm:text-lg font-semibold sm:mx-4 whitespace-nowrap">
            {label}
          </span>
        </div>

        {/* View switcher - wraps on small screens */}
        <div className="flex flex-wrap justify-center gap-1 sm:gap-2">
          {['month', 'week', 'day', 'agenda'].map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => onView(v)}
              className={`px-2 py-1 text-xs sm:text-sm font-medium rounded-md whitespace-nowrap ${view === v
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 hover:bg-gray-200'
                }`}
            >
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};