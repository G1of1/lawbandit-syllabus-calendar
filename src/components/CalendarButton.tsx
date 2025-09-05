"use client";

interface Props {
  events: { title: string; date: string; description?: string }[];
}

export default function CalendarButton({ events }: Props) {
  const handleExport = () => {
    // TODO: integrate Google Calendar API
    alert(`Exporting ${events.length} tasks to Google Calendar...`);
  };

  return (
    <button
      onClick={handleExport}
      className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
    >
      Add to Google Calendar
    </button>
  );
}
