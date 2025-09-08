import { google } from "googleapis";

export const getCalendarClient = (accessToken: string) => {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({access_token: accessToken});

    return google.calendar({version: 'v3', auth})
}

//Viewing events


export const listEvents = async (accessToken: string) => {
    const calendar = getCalendarClient(accessToken);

    const events = await calendar.events.list({
        calendarId: "primary",
        maxResults: 10,
        singleEvents: true,
        orderBy: "startTime",
        timeMin: new Date().toISOString()
    })

    return events.data.items;
}

export const createEvents = async (accessToken: string, events: {title: string, date: string, description: string}[]) => {
    const calendar = getCalendarClient(accessToken);

    const createdEvents = [];
    for (const e of events) {
        const googleEvent = {
            summary: e.title,
            description: e.description,
            start: {
                date: e.date,
            },
            end: {
                date: e.date
            },
            reminders: {
                useDefault: false,
                overrides: [
                    { method: "email", minutes: 24 * 60},
                    { method: "popup", minutes: 10 }
                ]
            }
        }
        const res = await calendar.events.insert({
            calendarId: "primary",
            requestBody: googleEvent,
        })
        createdEvents.push(res.data);
    }
    return createdEvents;
}