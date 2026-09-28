const app = document.getElementById("app");
// public-event.html splits the app into three sticky columns (event details,
// registration, ticket); index.html (standalone fallback) has no such split,
// so all three just point at the single #app container.
const appInfo = document.getElementById("appInfo") || app;
const appForm = document.getElementById("appForm") || app;
const appTicket = document.getElementById("appTicket") || app;

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
      coverImage: realEvent.coverImage || null,
      artClass: realEvent.artClass || "placeholder-art",
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
      coverImage: null,
      artClass: "placeholder-art",
    };

// Goes through events.js's loadAllAttendees() (not a raw localStorage read)
// so its seed-if-empty check runs first. Reading rsvpAttendees directly here
// would "poison" it: the very first registration on a fresh domain writes a
// 1-item array, and loadAllAttendees() only ever seeds when the key is
// completely empty — so the full demo dataset would never load after that.
function loadStoredAttendees() {
  return typeof loadAllAttendees === "function"
    ? loadAllAttendees()
    : JSON.parse(localStorage.getItem("rsvpAttendees")) || [];
}

let attendees = loadStoredAttendees();
const capacity = realEvent ? realEvent.capacity : 80;

function renderAvailability() {
  attendees = loadStoredAttendees();
  const eventAttendees = attendees.filter((a) => a.eventId === currentEventId);
  const registeredCount = realEvent ? eventAttendees.length : 54;
  const remaining = Math.max(capacity - registeredCount, 0);
  const pct = capacity ? Math.min(Math.round((registeredCount / capacity) * 100), 100) : 0;

  document.getElementById("availabilityCard").innerHTML = `
    <div class="card-availability">
      <div class="avail-row">
        <span>${registeredCount} of ${capacity} spots filled</span>
        <span>${remaining} remaining</span>
      </div>
      <div class="progress-bar"><div class="progress-bar-fill" style="width:${pct}%"></div></div>
    </div>
  `;
}

appInfo.innerHTML = `
  <section class="event-card">
    <div class="card-detail-list">
      <div class="card-detail-row"><span class="card-detail-label">Date</span><span class="card-detail-value">${eventDetails.date}</span></div>
      <div class="card-detail-row"><span class="card-detail-label">Time</span><span class="card-detail-value">${eventDetails.timeRange}</span></div>
      <div class="card-detail-row"><span class="card-detail-label">Location</span><span class="card-detail-value">${eventDetails.location}</span></div>
      <div class="card-detail-row"><span class="card-detail-label">Hosted by</span><span class="card-detail-value">${eventDetails.organizer}</span></div>
    </div>
    <div class="card-divider"></div>
    <p class="card-desc">${eventDetails.description}</p>
    <div class="card-divider"></div>
    <div class="card-availability" id="availabilityCard"></div>
  </section>
`;

renderAvailability();

function renderTicketPlaceholder() {
  appTicket.innerHTML = `
    <section class="ticket-placeholder">
      <div class="ticket-placeholder-icon">
        <svg viewBox="0 0 16 16" fill="none" width="20" height="20"><rect x="1.5" y="4" width="13" height="8" rx="1.5" stroke="currentColor" stroke-width="1.3"/><path d="M6 4v8" stroke="currentColor" stroke-width="1.3" stroke-dasharray="1.6 1.6"/></svg>
      </div>
      <p>Your ticket will appear here once you register.</p>
    </section>
  `;
}

function renderTicket(name, email, ticketId) {
  const ticketArtClass = eventDetails.coverImage ? "" : eventDetails.artClass;
  const ticketArtStyle = eventDetails.coverImage ? ` style="background-image:url('${eventDetails.coverImage}')"` : "";

  // Same first-word / rest-of-name line break used in the event header, so
  // long titles wrap the same way here.
  const titleWords = eventDetails.title.split(" ");
  const ticketTitleHtml =
    titleWords.length > 1
      ? `${titleWords[0]}<br>${titleWords.slice(1).join(" ")}`
      : eventDetails.title;

  appForm.innerHTML = `
    <section class="registration-form" style="text-align:center;">
      <h2>Registration Complete!</h2>
      <p><strong>${name}</strong>, you're registered for ${eventDetails.title}.</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Ticket ID:</strong> ${ticketId}</p>
      <p>Bring your QR ticket to the event and have it ready to scan at check-in. Save a screenshot so you can easily show it when you arrive.</p>
    </section>
  `;

  appTicket.innerHTML = `
    <section class="event-card">
      <h2 class="ticket-section-title">Your Ticket</h2>
      <div class="ticket ${ticketArtClass}"${ticketArtStyle}>
        <div class="ticket-overlay">
          <h2 class="ticket-event-name">${ticketTitleHtml}</h2>
          <p class="ticket-meta-line">${eventDetails.date}</p>
          <p class="ticket-meta-line">${eventDetails.timeRange}</p>
          <p class="ticket-meta-line">${eventDetails.location}</p>
          <div class="ticket-qr-card"><div id="qrcode"></div></div>
          <div class="ticket-guest-card">
            <p class="ticket-guest-name">${name}</p>
            <p class="ticket-guest-type">General Admission</p>
            <p class="ticket-guest-id">${ticketId}</p>
          </div>
        </div>
      </div>
      <div class="ticket-actions">
        <button id="calendarBtn">Add to Google Calendar</button>
        <button id="cancelBtn" class="ticket-delete-link">Delete Registration</button>
      </div>
    </section>
  `;

  new QRCode(document.getElementById("qrcode"), { text: ticketId, width: 220, height: 220 });
  appTicket.scrollIntoView({ behavior: "smooth", block: "center" });
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
    renderAvailability();

    appTicket.innerHTML = `
      <section class="cancellation">
        <h2>Registration Cancelled</h2>
        <p>Your registration for ${eventDetails.title} has been cancelled.</p>
      </section>
    `;

    renderRegistrationForm(false);
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
      <!-- DEV ONLY: auto-fills + submits the form for faster testing. Delete
           this button (and the devFillBtn listener below) before shipping. -->
      <button type="button" id="devFillBtn" style="width:100%;margin-top:10px;background:transparent;border:1px dashed var(--color-border);color:var(--color-muted);">Dev: Auto-fill &amp; Register</button>
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

  document.getElementById("devFillBtn").addEventListener("click", () => {
    document.getElementById("name").value = "Dev Tester";
    document.getElementById("email").value = "dev@example.com";
    regFields.classList.add("expanded");
    fieldsRevealed = true;
    registrationForm.requestSubmit();
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
      registeredAt: Date.now(),
      eventId: currentEventId
    };

    attendees.push(attendee);
    localStorage.setItem("rsvpAttendees", JSON.stringify(attendees));
    renderAvailability();
    renderTicket(name, email, ticketId);
  });
}

renderTicketPlaceholder();

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
