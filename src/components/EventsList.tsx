interface Props {
  events: { title: string; date: string; description?: string }[];
}

export default function EventsList({ events }: Props) {
  return (
    <div className="bg-white shadow-md rounded-lg p-4 mt-4 text-black">
      <h2 className="text-xl font-semibold mb-3">Extracted Tasks</h2>
      <ul className="space-y-3">
        {events.map((event, i) => (
          <li key={i} className="border-b pb-2">
            <p className="font-bold">{event.title}</p>
            <p className="text-sm text-gray-600">{event.date}</p>
            {event.description && (
              <p className="text-sm mt-1">{event.description}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}