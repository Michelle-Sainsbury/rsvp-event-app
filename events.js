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
    coverImage: "assets/covers/summer-makers-festival.png",
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
    coverImage: "assets/covers/community-tech-night.png",
  },
  {
    id: "wedding-celebration",
    name: "Imani & Leo's Wedding",
    description: "Join us as we celebrate the marriage of Imani and Leo with an evening of dinner, dancing, and toasts under the stars.",
    date: "2026-09-12",
    startTime: "17:00",
    endTime: "23:00",
    location: "Hudson Valley, NY",
    organizer: "Imani & Leo",
    capacity: 120,
    registrationOpen: true,
    draft: false,
    artClass: "placeholder-art-cool",
    coverImage: "assets/covers/wedding-celebration.png",
  },
];

// Realistic-looking name pool for seeded attendees, so demo screens show
// actual names instead of "Guest 1, Guest 2..." placeholders. First/last
// names each cycle through their own pool at a different, coprime stride
// (7 and 11 against pool sizes of 30), so consecutive indices never land on
// the same last name the way a naive i % / i / would (that previously put
// 30 people in a row under "Chen"). No Math.random, so names stay stable
// across reloads.
const GUEST_FIRST_NAMES = [
  "Jamie", "Priya", "Sam", "Casey", "Jordan", "Taylor", "Morgan", "Alex",
  "Riley", "Avery", "Quinn", "Dana", "Elliot", "Harper", "Rowan", "Skyler",
  "Reese", "Drew", "Finley", "Emerson", "Kai", "Micah", "Noor", "Sage",
  "Devon", "Blake", "Marisol", "Theo", "Yuki", "Zoe",
];

const GUEST_LAST_NAMES = [
  "Chen", "Sharma", "Okafor", "Kim", "Rivera", "Patel", "Nguyen", "Carter",
  "Bennett", "Osei", "Kowalski", "Ahmed", "Diaz", "Okonkwo", "Fischer",
  "Suzuki", "Morales", "Lindqvist", "Haddad", "Park", "Silva", "Moreau",
  "Adeyemi", "Novak", "Reyes", "Whitfield", "Hassan", "Delgado", "Brennan", "Ito",
];

function guestFirst(i) {
  return GUEST_FIRST_NAMES[(i * 7) % GUEST_FIRST_NAMES.length];
}

function guestLast(i) {
  return GUEST_LAST_NAMES[(i * 11) % GUEST_LAST_NAMES.length];
}

function guestName(i) {
  return `${guestFirst(i)} ${guestLast(i)}`;
}

function guestEmail(i) {
  return `${guestFirst(i).toLowerCase()}.${guestLast(i).toLowerCase()}@example.com`;
}

// Anchors a seeded timestamp to an event's own date/time instead of
// Date.now(), so registration/check-in times stay sensible regardless of
// what day this is actually opened on (an already-past event shouldn't show
// check-ins from "today", and a not-yet-happened event can't have anyone
// checked in at all).
function eventStartMs(dateStr, timeStr) {
  return new Date(`${dateStr}T${timeStr}:00`).getTime();
}

const SMF_START = eventStartMs("2026-06-14", "10:00");
const WED_START = eventStartMs("2026-09-12", "17:00");

// SMF_START/WED_START parse to an exact :00.000 second, and every offset
// above is a clean multiple of a second, so without this every seeded
// timestamp would end in "000" milliseconds — a dead giveaway it's fake,
// unlike a real Date.now() which always has real millisecond noise.
// Deterministic (no Math.random) so seed data stays stable across reloads.
function seedJitterMs(seed) {
  return (seed * 137 + 59) % 1000;
}

// Seed a handful of real (localStorage-backed) attendees per default event so
// the dashboard/workspace numbers aren't all zero before anyone has actually
// registered — but these count and check in through the exact same code path
// as a real guest registration, so they move for real as check-ins happen.
const DEFAULT_ATTENDEES = [
  // Summer Makers Festival already happened (June 14) — registrations land
  // in the weeks before it, check-ins land during its actual 8-hour window.
  ...Array.from({ length: 412 }, (_, i) => {
    const registeredAt = SMF_START - (450 - i) * 60 * 60 * 1000 + seedJitterMs(i);
    return {
      eventId: "summer-makers-festival",
      name: guestName(i),
      email: guestEmail(i),
      // Same shape as a real registration's ticket ID (RSVP- + a millisecond
      // timestamp) — reuses this attendee's own registeredAt so it's a real
      // timestamp, not an arbitrary sequential number.
      ticketId: `RSVP-${registeredAt}`,
      checkedIn: i < 328,
      registeredAt,
      checkedInAt: i < 328 ? SMF_START + Math.round((i / 328) * 7 * 60) * 60 * 1000 + seedJitterMs(i + 1000) : undefined,
    };
  }),
  // Community Tech Night hasn't happened yet (Oct 15) — people can have
  // registered already, but nobody can be checked in yet.
  ...[
    { name: "Jordan Lee", email: "jordan@example.com", registeredAt: Date.now() - 3 * 24 * 60 * 60 * 1000 + seedJitterMs(1) },
    { name: "Priya Shah", email: "priya@example.com", registeredAt: Date.now() - 2 * 24 * 60 * 60 * 1000 + seedJitterMs(2) },
    { name: "Sam Okafor", email: "sam@example.com", registeredAt: Date.now() - 5 * 24 * 60 * 60 * 1000 + seedJitterMs(3) },
    { name: "Casey Kim", email: "casey@example.com", registeredAt: Date.now() - 26 * 60 * 60 * 1000 + seedJitterMs(4) },
  ].map((a) => ({ ...a, eventId: "community-tech-night", ticketId: `RSVP-${a.registeredAt}`, checkedIn: false })),
  ...Array.from({ length: 8 }, (_, i) => {
    const registeredAt = Date.now() - (16 - i) * 6 * 60 * 60 * 1000 + seedJitterMs(i + 2000);
    return {
      eventId: "community-tech-night",
      name: guestName(i + 20),
      email: guestEmail(i + 20),
      ticketId: `RSVP-${registeredAt}`,
      checkedIn: false,
      registeredAt,
    };
  }),
  // Imani & Leo's wedding already happened (Sep 12) — registrations (RSVPs)
  // land in the months before it; nobody's marked checked in since this
  // event never used the check-in flow.
  ...Array.from({ length: 12 }, (_, i) => {
    const registeredAt = WED_START - (30 - i) * 2 * 24 * 60 * 60 * 1000 + seedJitterMs(i + 3000);
    return {
      eventId: "wedding-celebration",
      name: guestName(i + 40),
      email: guestEmail(i + 40),
      ticketId: `RSVP-${registeredAt}`,
      checkedIn: false,
      registeredAt,
    };
  }),
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
  try {
    localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events));
  } catch (e) {
    // Most likely a quota overflow from a large uploaded cover image data
    // URL — surface it instead of silently dropping the save.
    throw new Error("Couldn't save — your browser's local storage is full. Try a smaller image.");
  }
}

function getEventById(id) {
  return loadEvents().find((e) => e.id === id) || null;
}

// Single source of truth for the app shell's left sidebar (wordmark, Events
// nav link, event list, create-event button) — dashboard.html, workspace.html,
// and create-event.html all call this instead of each keeping their own
// hardcoded copy, so edits here apply everywhere at once instead of risking
// the three copies drifting apart.
function renderAppSidebar(options) {
  options = options || {};
  const sidebar = document.querySelector(".sidebar");
  if (!sidebar) return;

  const eventsActive = options.eventsActive ? " active" : "";

  sidebar.innerHTML = `
    <div class="sidebar-header">
      <a href="landing.html" class="wordmark">RSVP</a>
    </div>
    <nav class="sidebar-nav">
      <a href="dashboard.html" class="nav-events-link${eventsActive}"><svg viewBox="0 0 16 16" fill="none" width="16" height="16"><rect x="2" y="3" width="12" height="11" rx="2" stroke="currentColor" stroke-width="1.3"/><path d="M2 6.5h12M5 2v2M11 2v2" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>Events</a>
      <div class="sidebar-label">Your events</div>
      <div id="sidebarEventList"></div>
      <div class="sidebar-divider"></div>
      <a href="create-event.html" class="btn btn-primary btn-sm sidebar-create-btn">+ Create event</a>
    </nav>
  `;

  document.getElementById("sidebarEventList").innerHTML = loadEvents()
    .map((e) => {
      const active = e.id === options.activeEventId ? " active" : "";
      return `<a href="workspace.html?event=${encodeURIComponent(e.id)}" class="sidebar-event-link${active}">${e.name}</a>`;
    })
    .join("");
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

function formatEventDateShort(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}

function formatEventDateLong(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" });
}

function formatEventTime(t) {
  const [h, m] = t.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = ((h + 11) % 12) + 1;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

// Uploaded cover photos come straight off a phone/camera and can run several
// MB each as base64 — easily enough to blow the ~5MB localStorage quota
// after a couple of events. Downscale to a max dimension and re-encode as
// JPEG before it ever becomes a data URL.
function fileToCoverImageDataUrl(file, maxDim = 1600, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Couldn't read that image file."));
      img.onload = () => {
        const scale = Math.min(1, maxDim / Math.max(img.naturalWidth, img.naturalHeight));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.naturalWidth * scale);
        canvas.height = Math.round(img.naturalHeight * scale);
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
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
