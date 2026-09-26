// Shared events store — the events counterpart to script.js's / organizer.js's
// localStorage["rsvpAttendees"]. Each event has a unique `id` (used as the
// `?event=` query param everywhere) so create-event.html, dashboard.html,
// workspace.html, and public-event.html can all read/write the same record.
//
// Attendees stay in Michelle's existing "rsvpAttendees" key/shape
// ({ name, email, ticketId, checkedIn }) — this file only adds an `eventId`
// field on top when saving, and filters by it when reading. That key and its
// object shape are untouched so index.html/organizer.js/attendees-live.js
// keep working exactly as before for anything not yet scoped to an event.

const EVENTS_STORAGE_KEY = "rsvpEvents";
const ATTENDEES_STORAGE_KEY = "rsvpAttendees";

const DEFAULT_EVENTS = [
  {
    id: "summer-makers-festival",
    name: "Summer Makers Festival",
    description: "A day of hands-on workshops, live demos, and maker showcases from Brooklyn's creative and technical community.",
    date: "2026-06-14",
    startTime: "10:00",
    endTime: "18:00",
    location: "Brooklyn, NY",
    organizer: "Brooklyn Tech Collective",
    capacity: 520,
    registrationOpen: true,
    artClass: "placeholder-art-alt",
  },
  {
    id: "community-tech-night",
    name: "Community Tech Night",
    description: "Join us for an evening of lightning talks, live demos, and hands-on workshops from builders across the Brooklyn tech scene. Whether you're shipping your first side project or your tenth startup, come meet the people building alongside you. Light refreshments and plenty of time to connect will follow the talks.",
    date: "2026-10-15",
    startTime: "10:00",
    endTime: "18:00",
    location: "Brooklyn, NY",
    organizer: "Brooklyn Tech Collective",
    capacity: 80,
    registrationOpen: true,
    artClass: "placeholder-art",
  },
  {
    id: "product-launch-mixer",
    name: "Product Launch Mixer",
    description: "An evening mixer celebrating our latest product launch, with drinks, demos, and time to connect with the team.",
    date: "2026-11-06",
    startTime: "18:00",
    endTime: "21:00",
    location: "Manhattan, NY",
    organizer: "Brooklyn Tech Collective",
    capacity: 150,
    registrationOpen: false,
    artClass: "placeholder-art-cool",
  },
];

// Seed a handful of real (localStorage-backed) attendees per default event so
// the dashboard/workspace numbers aren't all zero before anyone has actually
// registered — but these count and check in through the exact same code path
// as a real guest registration, so they move for real as check-ins happen.
const DEFAULT_ATTENDEES = [
  ...Array.from({ length: 412 }, (_, i) => ({
    eventId: "summer-makers-festival",
    name: `Guest ${i + 1}`,
    email: `guest${i + 1}@example.com`,
    ticketId: `SEED-SMF-${1000 + i}`,
    checkedIn: i < 328,
  })),
  { eventId: "community-tech-night", name: "Jordan Lee", email: "jordan@example.com", ticketId: "SEED-CTN-1001", checkedIn: false },
  { eventId: "community-tech-night", name: "Priya Shah", email: "priya@example.com", ticketId: "SEED-CTN-1002", checkedIn: false },
  { eventId: "community-tech-night", name: "Sam Okafor", email: "sam@example.com", ticketId: "SEED-CTN-1003", checkedIn: true },
  { eventId: "community-tech-night", name: "Casey Kim", email: "casey@example.com", ticketId: "SEED-CTN-1004", checkedIn: false },
  ...Array.from({ length: 8 }, (_, i) => ({
    eventId: "community-tech-night",
    name: `Guest ${i + 1}`,
    email: `ctn-guest${i + 1}@example.com`,
    ticketId: `SEED-CTN-${1100 + i}`,
    checkedIn: i < 32,
  })),
  ...Array.from({ length: 12 }, (_, i) => ({
    eventId: "product-launch-mixer",
    name: `Guest ${i + 1}`,
    email: `plm-guest${i + 1}@example.com`,
    ticketId: `SEED-PLM-${1000 + i}`,
    checkedIn: false,
  })),
];

function loadEvents() {
  try {
    const stored = JSON.parse(localStorage.getItem(EVENTS_STORAGE_KEY));
    if (stored && stored.length) return stored;
  } catch (e) {
    // fall through to seeding defaults
  }
  localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(DEFAULT_EVENTS));
  return DEFAULT_EVENTS;
}

function saveEvents(events) {
  localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events));
}

function getEventById(id) {
  return loadEvents().find((e) => e.id === id) || null;
}

function upsertEvent(event) {
  const events = loadEvents();
  const idx = events.findIndex((e) => e.id === event.id);
  if (idx >= 0) {
    events[idx] = event;
  } else {
    events.push(event);
  }
  saveEvents(events);
  return event;
}

function deleteEventById(id) {
  saveEvents(loadEvents().filter((e) => e.id !== id));
}

function slugifyEventName(name) {
  const base =
    name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "event";
  const events = loadEvents();
  let id = base;
  let n = 2;
  while (events.some((e) => e.id === id)) {
    id = `${base}-${n++}`;
  }
  return id;
}

function getEventIdFromURL() {
  return new URLSearchParams(window.location.search).get("event");
}

// Attendees, scoped by eventId, sharing Michelle's ATTENDEES_STORAGE_KEY.
function loadAllAttendees() {
  try {
    const stored = JSON.parse(localStorage.getItem(ATTENDEES_STORAGE_KEY));
    if (stored && stored.length) return stored;
  } catch (e) {
    // fall through to seeding defaults
  }
  localStorage.setItem(ATTENDEES_STORAGE_KEY, JSON.stringify(DEFAULT_ATTENDEES));
  return DEFAULT_ATTENDEES;
}

function getAttendeesForEvent(eventId) {
  return loadAllAttendees().filter((a) => a.eventId === eventId);
}
