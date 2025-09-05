"use client";

import { useState } from "react";
import FileUpload from "../../components/FileUpload";
import EventsList from "../../components/EventsList";
import CalendarButton from "../../components/CalendarButton";

export default function UploadPage() {
  const [events, setEvents] = useState<any[]>([]);

  const handleEvents = (parsedEvents: any[]) => {
    setEvents(parsedEvents);
    console.log('Working')
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-2xl font-bold mb-6">Syllabus → Calendar</h1>

      <FileUpload onEventsExtracted={handleEvents} />

      {events.length > 0 && (
        <div className="mt-8 w-full max-w-xl">
          <EventsList events={events} />
          <CalendarButton events={events} />
        </div>
      )}
    </main>
  );
}
