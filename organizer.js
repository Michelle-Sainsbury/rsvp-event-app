// Mock attendee data. Once the backend is ready, replace this array with
// a fetch() call to the registrations API — the shape (eventId, attendeeId,
// registrationId, name, email, status) should stay the same.
const mockAttendees = [
  { eventId: "evt1", attendeeId: "att1", registrationId: "reg1", name: "Jordan Lee", email: "jordan@example.com", status: "registered" },
  { eventId: "evt1", attendeeId: "att2", registrationId: "reg2", name: "Priya Shah", email: "priya@example.com", status: "registered" },
  { eventId: "evt1", attendeeId: "att3", registrationId: "reg3", name: "Sam Okafor", email: "sam@example.com", status: "checked-in" },
  { eventId: "evt1", attendeeId: "att4", registrationId: "reg4", name: "Casey Kim", email: "casey@example.com", status: "registered" },
];

// Dev-only: names that look like real attendees but whose IDs don't match
// anyone in mockAttendees, so their "Scan" button always fails check-in.
const devFakeAttendees = [
  { eventId: "evt9", attendeeId: "att9", registrationId: "reg9", name: "Alex Rivera" },
  { eventId: "evt1", attendeeId: "att1", registrationId: "reg999", name: "Taylor Morgan" },
];

let nameSearchTerm = "";
let emailSearchTerm = "";
let checkInMessage = null; // { type: "success" | "error", text: string }

function parseQrPayload(raw) {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  try {
    const parsed = JSON.parse(trimmed);
    if (parsed.eventId && parsed.attendeeId && parsed.registrationId) {
      return parsed;
    }
  } catch (e) {
    // not JSON, fall through to colon-separated format
  }

  const parts = trimmed.split(":");
  if (parts.length === 3) {
    const [eventId, attendeeId, registrationId] = parts;
    return { eventId, attendeeId, registrationId };
  }

  return null;
}

function checkInAttendee(raw) {
  const payload = parseQrPayload(raw);

  if (!payload) {
    checkInMessage = { type: "error", text: "Invalid QR code format." };
    render();
    return;
  }

  const attendee = mockAttendees.find(
    (a) =>
      a.eventId === payload.eventId &&
      a.attendeeId === payload.attendeeId &&
      a.registrationId === payload.registrationId
  );

  if (!attendee) {
    checkInMessage = { type: "error", text: "No matching registration found." };
    render();
    return;
  }

  if (attendee.status === "checked-in") {
    checkInMessage = { type: "error", text: `${attendee.name} has already been checked in.` };
    render();
    return;
  }

  attendee.status = "checked-in";
  checkInMessage = { type: "success", text: `${attendee.name} checked in successfully.` };
  render();
}

// The attendee table always shows everyone. Search boxes only drive the
// suggestion dropdowns below them — they don't filter this list.
function getSuggestions(term, field) {
  const t = term.trim().toLowerCase();
  if (!t) return [];
  return mockAttendees
    .filter((a) => a[field].toLowerCase().includes(t))
    .slice(0, 5);
}

function renderSuggestions(term, field) {
  const suggestions = getSuggestions(term, field);
  if (!suggestions.length) return "";

  return `
    <ul class="suggestion-list">
      ${suggestions
        .map(
          (a) => `<li class="suggestion-item" data-field="${field}" data-value="${a[field]}">${a[field]}</li>`
        )
        .join("")}
    </ul>
  `;
}

function render() {
  const app = document.getElementById("organizerApp");
  const checkedInCount = mockAttendees.filter((a) => a.status === "checked-in").length;

  app.innerHTML = `
    <section class="summary-card">
      <div>
        <span class="summary-count">${checkedInCount}</span>
        <span class="summary-label">/ ${mockAttendees.length} checked in</span>
      </div>
    </section>

    <section class="checkin-card">
      <h2>Check In Attendee</h2>
      <p class="hint">Paste a scanned QR code payload to verify and check in an attendee.</p>
      <div class="checkin-row">
        <input id="qrInput" type="text" placeholder="eventId:attendeeId:registrationId" />
        <button id="checkInBtn">Check In</button>
      </div>
      ${
        checkInMessage
          ? `<p class="checkin-message ${checkInMessage.type}">${checkInMessage.text}</p>`
          : ""
      }

      <div class="dev-panel">
        <p class="dev-panel-label">Dev tools: simulate scanning a QR code</p>
        <div class="dev-panel-buttons">
          ${[...mockAttendees, ...devFakeAttendees]
            .map(
              (a) => `
            <button
              class="dev-scan-btn"
              type="button"
              data-payload="${a.eventId}:${a.attendeeId}:${a.registrationId}"
            >
              Scan ${a.name}
            </button>
          `
            )
            .join("")}
        </div>
      </div>
    </section>

    <section class="attendee-list-card">
      <h2>Registered Attendees</h2>
      <div class="search-row">
        <div class="search-field" data-field="name">
          <input
            id="nameSearchInput"
            type="text"
            autocomplete="off"
            placeholder="Search by name"
            value="${nameSearchTerm}"
          />
          <div id="nameSuggestions">${renderSuggestions(nameSearchTerm, "name")}</div>
        </div>

        <div class="search-field" data-field="email">
          <input
            id="emailSearchInput"
            type="text"
            autocomplete="off"
            placeholder="Search by email"
            value="${emailSearchTerm}"
          />
          <div id="emailSuggestions">${renderSuggestions(emailSearchTerm, "email")}</div>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${mockAttendees
            .map(
              (a) => `
            <tr>
              <td>${a.name}</td>
              <td>${a.email}</td>
              <td><span class="status-badge ${a.status}">${a.status}</span></td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    </section>
  `;

  wireUpEvents();
}

// Instead of re-rendering the whole page on every keystroke (which destroys
// and recreates the focused input, breaking typing), we only patch the
// suggestion list for the field being typed in.
function wireUpEvents() {
  const nameSearchInput = document.getElementById("nameSearchInput");
  const emailSearchInput = document.getElementById("emailSearchInput");

  nameSearchInput.addEventListener("input", (e) => {
    nameSearchTerm = e.target.value;
    document.getElementById("nameSuggestions").innerHTML = renderSuggestions(nameSearchTerm, "name");
    wireUpSuggestionClicks();
  });

  emailSearchInput.addEventListener("input", (e) => {
    emailSearchTerm = e.target.value;
    document.getElementById("emailSuggestions").innerHTML = renderSuggestions(emailSearchTerm, "email");
    wireUpSuggestionClicks();
  });

  wireUpSuggestionClicks();

  document.getElementById("checkInBtn").addEventListener("click", () => {
    const input = document.getElementById("qrInput");
    checkInAttendee(input.value);
  });

  document.getElementById("qrInput").addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      checkInAttendee(e.target.value);
    }
  });

  document.querySelectorAll(".dev-scan-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const payload = btn.getAttribute("data-payload");
      document.getElementById("qrInput").value = payload;
      checkInAttendee(payload);
    });
  });
}

function wireUpSuggestionClicks() {
  document.querySelectorAll(".suggestion-item").forEach((item) => {
    item.addEventListener("click", () => {
      const field = item.getAttribute("data-field");
      const value = item.getAttribute("data-value");
      if (field === "name") {
        nameSearchTerm = value;
        document.getElementById("nameSearchInput").value = value;
        document.getElementById("nameSuggestions").innerHTML = "";
      } else {
        emailSearchTerm = value;
        document.getElementById("emailSearchInput").value = value;
        document.getElementById("emailSuggestions").innerHTML = "";
      }
    });
  });
}

function handleOutsideClick(e) {
  if (!e.target.closest('[data-field="name"]')) {
    const list = document.getElementById("nameSuggestions");
    if (list) list.innerHTML = "";
  }
  if (!e.target.closest('[data-field="email"]')) {
    const list = document.getElementById("emailSuggestions");
    if (list) list.innerHTML = "";
  }
}

document.addEventListener("click", handleOutsideClick);
render();
