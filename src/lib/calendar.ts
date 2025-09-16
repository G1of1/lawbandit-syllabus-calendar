import { google } from "googleapis";

/**
 * Initializes a Google Calendar API client
 * ----------------------------------------
 * - Uses an access token from the authenticated user
 * - Returns a `calendar` client that can be used for list/insert/etc.
 */
export const getCalendarClient = (accessToken: string) => {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });

  return google.calendar({ version: "v3", auth });
};

/**
 * List upcoming calendar events
 * -----------------------------
 * @param accessToken - The Google OAuth2 access token
 * @returns A list of the next 10 upcoming events from the primary calendar
 */
export const listEvents = async (accessToken: string) => {
  const calendar = getCalendarClient(accessToken);

  const events = await calendar.events.list({
    calendarId: "primary",   // Always use the user's main Google Calendar
    maxResults: 10,          // Limit number of results
    singleEvents: true,      // Expands recurring events into individual ones
    orderBy: "startTime",    // Sort chronologically
    timeMin: new Date().toISOString(), // Only future events
  });

  return events.data.items;
};

/**
 * Create new calendar events
 * --------------------------
 * @param accessToken - The Google OAuth2 access token
 * @param events - Array of simplified event objects { title, date, description }
 * @returns An array of created Google Calendar events
 *
 * Notes:
 * - Uses `date` (all-day event) instead of `dateTime`
 * - Adds default reminders (1 day before via email, 10 minutes before via popup)
 */
export const createEvents = async (
  accessToken: string,
  events: { title: string; date: string; description: string }[]
) => {
  const calendar = getCalendarClient(accessToken);
  const createdEvents = [];

  for (const e of events) {
    const googleEvent = {
      summary: e.title,             // Event title
      description: e.description,   // Event details
      start: { date: e.date },      // All-day start
      end: { date: e.date },        // All-day end (same day)
      reminders: {
        useDefault: false,
        overrides: [
          { method: "email", minutes: 24 * 60 }, // Reminder: 1 day before
          { method: "popup", minutes: 10 },      // Reminder: 10 minutes before
        ],
      },
    };

    const res = await calendar.events.insert({
      calendarId: "primary",
      requestBody: googleEvent,
    });

    createdEvents.push(res.data);
  }

  return createdEvents;
};
