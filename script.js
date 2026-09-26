const app = document.getElementById("app");
// public-event.html splits the app into a left info column and a right,
// sticky registration column; index.html (standalone fallback) has no
// such split, so both just point at the single #app container.
const appInfo = document.getElementById("appInfo") || app;
const appForm = document.getElementById("appForm") || app;

// Falls back to the original hardcoded demo event when opened standalone
// (index.html, with no ?event= param and events.js not loaded), so that
// flow keeps working exactly as before. When opened as public-event.html?
// event=<id> with events.js loaded, this reflects the real event record.
const currentEventId = new URLSearchParams(window.location.search).get("event") || "community-tech-night";
const realEvent = typeof getEventById === "function" ? getEventById(currentEventId) : null;

function toICSStamp(dateStr, timeStr) {
  return `${dateStr.replace(/-/g, "")}T${timeStr.replace(":", "")}00Z`;
}

const eventDetails = realEvent
  ? {
      title: realEvent.name,
      date: formatEventDateLong(realEvent.date),
      time: formatEventTime(realEvent.startTime),
      timeRange: `${formatEventTime(realEvent.startTime)} – ${formatEventTime(realEvent.endTime)}`,
      location: realEvent.location,
      organizer: realEvent.organizer,
      description: realEvent.description || "Join us for an evening of technology, community, and networking.",
      startUTC: toICSStamp(realEvent.date, realEvent.startTime),
      endUTC: toICSStamp(realEvent.date, realEvent.endTime),
    }
  : {
      title: "Community Tech Night",
      date: "October 15, 2026",
      time: "6:00 PM",
      timeRange: "6:00 PM – 9:00 PM",
      location: "Brooklyn, NY",
      organizer: "Brooklyn Tech Collective",
      description: "Join us for an evening of technology, community, and networking.",
      startUTC: "20261015T220000Z",
      endUTC: "20261016T000000Z",
    };

const attendees = JSON.parse(localStorage.getItem("rsvpAttendees")) || [];
const eventAttendees = attendees.filter((a) => a.eventId === currentEventId);
const capacity = realEvent ? realEvent.capacity : 80;
const registeredCount = realEvent ? eventAttendees.length : 54;
const remaining = Math.max(capacity - registeredCount, 0);
const pct = capacity ? Math.min(Math.round((registeredCount / capacity) * 100), 100) : 0;

appInfo.innerHTML = `
  <section class="event-card">
    <p class="card-desc">${eventDetails.description}</p>
  </section>

  <section class="event-card availability-card">
    <div class="card-availability">
      <div class="avail-row">
        <span>${registeredCount} of ${capacity} spots filled</span>
        <span>${remaining} remaining</span>
      </div>
      <div class="progress-bar"><div class="progress-bar-fill" style="width:${pct}%"></div></div>
    </div>
  </section>
`;

function renderTicket(name, email, ticketId) {
  appForm.innerHTML = `
    <section class="ticket">
      <h2>Registration Complete!</h2>
      <p><strong>${name}</strong>, you're registered for ${eventDetails.title}.</p>
      <p><strong>Email:</strong> ${email}</p>
      <p>Your digital ticket:</p>
      <div id="qrcode"></div>
      <p><strong>Ticket ID:</strong> ${ticketId}</p>
      <button id="calendarBtn">Add to Calendar</button>
      <button id="cancelBtn">Cancel Registration</button>
    </section>
  `;

  new QRCode(document.getElementById("qrcode"), ticketId);
  const cancelBtn = document.getElementById("cancelBtn");
  const calendarBtn = document.getElementById("calendarBtn");

  calendarBtn.addEventListener("click", () => {
    const calendarUrl =
      "https://calendar.google.com/calendar/render?action=TEMPLATE" +
      "&text=" + encodeURIComponent(eventDetails.title) +
      "&dates=" + `${eventDetails.startUTC}/${eventDetails.endUTC}` +
      "&details=" + encodeURIComponent(`${eventDetails.title} event registration`) +
      "&location=" + encodeURIComponent(eventDetails.location);

    window.open(calendarUrl, "_blank");
  });

  cancelBtn.addEventListener("click", () => {
    const updatedAttendees = attendees.filter(
      attendee => attendee.ticketId !== ticketId
    );

    localStorage.setItem("rsvpAttendees", JSON.stringify(updatedAttendees));

    appForm.innerHTML = `
      <section class="cancellation">
        <h2>Registration Cancelled</h2>
        <p>Your registration for ${eventDetails.title} has been cancelled.</p>
        <button id="registerAgainBtn" style="width:100%">Register for Event</button>
      </section>
    `;

    document.getElementById("registerAgainBtn").addEventListener("click", () => {
      renderRegistrationForm(true);
    });
  });
}

function renderRegistrationForm(startExpanded) {
  appForm.innerHTML = `
    <section class="registration-form">
      <form id="registrationForm">
        <div class="reg-fields${startExpanded ? " expanded" : ""}" id="regFields">
          <label for="name">Full Name</label>
          <input type="text" id="name" required>

          <label for="email">Email Address</label>
          <input type="email" id="email" required>
        </div>

        <button type="submit" id="registerBtn" style="width:100%">Register for Event</button>
      </form>
    </section>
  `;
  const registrationForm = document.getElementById("registrationForm");
  const regFields = document.getElementById("regFields");
  const registerBtn = document.getElementById("registerBtn");
  let fieldsRevealed = !!startExpanded;

  if (startExpanded) document.getElementById("name").focus();

  registerBtn.addEventListener("click", (event) => {
    if (!fieldsRevealed) {
      event.preventDefault();
      regFields.classList.add("expanded");
      fieldsRevealed = true;
      document.getElementById("name").focus();
    }
  });

  registrationForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;

    const ticketId = `RSVP-${Date.now()}`;
    const attendee = {
      name: name,
      email: email,
      ticketId: ticketId,
      checkedIn: false,
      eventId: currentEventId
    };

    attendees.push(attendee);
    localStorage.setItem("rsvpAttendees", JSON.stringify(attendees));
    renderTicket(name, email, ticketId);
  });
}

if (realEvent && realEvent.registrationOpen === false) {
  appForm.innerHTML = `
    <section class="registration-form">
      <h2>Registration is closed</h2>
      <p>The organizer has closed registration for ${eventDetails.title}. Check back later or reach out to the organizer directly.</p>
    </section>
  `;
} else {
  renderRegistrationForm(false);
}
