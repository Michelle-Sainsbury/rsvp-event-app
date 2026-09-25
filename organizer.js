// Mock event data. Matches the event shown on index.html; once the backend
// is ready, replace with a fetch() call keyed by eventId.
const currentEvent = {
  eventId: "evt1",
  name: "Community Tech Night",
  organizer: "Brooklyn Tech Collective",
};

const STORAGE_KEY = "rsvpAttendees";

// Real attendees come from index.html's registration flow, which writes
// { name, email, ticketId, checkedIn } objects to localStorage under
// STORAGE_KEY. Loaded once on page load; check-ins write back to it.
function loadRealAttendees() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch (e) {
    return [];
  }
}

function saveRealAttendees() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(realAttendees));
}

let realAttendees = loadRealAttendees();

// Seed attendees so the dashboard has something to show/search/check in
// before anyone has actually registered through index.html. Same shape as
// real attendees so all the same code paths apply.
const seedAttendees = [
  { ticketId: "SEED-1001", name: "Jordan Lee", email: "jordan@example.com", checkedIn: false },
  { ticketId: "SEED-1002", name: "Priya Shah", email: "priya@example.com", checkedIn: false },
  { ticketId: "SEED-1003", name: "Sam Okafor", email: "sam@example.com", checkedIn: true },
  { ticketId: "SEED-1004", name: "Casey Kim", email: "casey@example.com", checkedIn: false },
];

// Dev-only: names that look like real attendees but whose "Scan" button
// always fails check-in, so both failure paths can be tested.
// Alex Rivera: well-formed-looking ticket ID, but no registration matches it.
// Taylor Morgan: blank scan, fails before even reaching a lookup.
const devFakeAttendees = [
  { name: "Alex Rivera", payload: "RSVP-0000000000" },
  { name: "Taylor Morgan", payload: "" },
];

function getAllAttendees() {
  return [...realAttendees, ...seedAttendees];
}

let nameSearchTerm = "";
let emailSearchTerm = "";
let checkInMessage = null; // { type: "success" | "error", text: string }

function checkInAttendee(raw) {
  const ticketId = (raw || "").trim();

  if (!ticketId) {
    checkInMessage = { type: "error", text: "Invalid QR code format." };
    render();
    return;
  }

  let attendee = realAttendees.find((a) => a.ticketId === ticketId);
  const isReal = Boolean(attendee);
  if (!attendee) {
    attendee = seedAttendees.find((a) => a.ticketId === ticketId);
  }

  if (!attendee) {
    checkInMessage = { type: "error", text: "No matching registration found." };
    render();
    return;
  }

  if (attendee.checkedIn) {
    checkInMessage = { type: "error", text: `${attendee.name} has already been checked in.` };
    render();
    return;
  }

  attendee.checkedIn = true;
  if (isReal) saveRealAttendees();
  checkInMessage = { type: "success", text: `${attendee.name} checked in successfully.` };
  render();
}

// The attendee table always shows everyone. Search boxes only drive the
// suggestion dropdowns below them — they don't filter this list.
function getSuggestions(term, field) {
  const t = term.trim().toLowerCase();
  if (!t) return [];
  return getAllAttendees()
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
  const attendees = getAllAttendees();
  const checkedInCount = attendees.filter((a) => a.checkedIn).length;

  app.innerHTML = `
    <section class="event-info-card">
      <h2>${currentEvent.name}</h2>
      <p><strong>Organizer:</strong> ${currentEvent.organizer}</p>
      <p><strong>Event ID:</strong> ${currentEvent.eventId}</p>
    </section>

    <section class="summary-card">
      <div>
        <span class="summary-count">${checkedInCount}/${attendees.length}</span>
        <span class="summary-label">Checked in today</span>
      </div>
    </section>

    <section class="checkin-card">
      <h2>Check In Attendee</h2>
      <p class="hint">Paste a scanned ticket ID to verify and check in an attendee.</p>
      <div class="checkin-row">
        <input id="qrInput" type="text" placeholder="Ticket ID" />
        <button id="checkInBtn">Check In</button>
      </div>
      <button id="scanQrBtn" type="button">Scan QR Code</button>
<div id="qrReader" style="display: none;"></div>
      ${
        checkInMessage
          ? `<p class="checkin-message ${checkInMessage.type}">${checkInMessage.text}</p>`
          : ""
      }

      <div class="dev-panel">
        <p class="dev-panel-label">Dev tools: simulate scanning a QR code</p>
        <div class="dev-panel-buttons">
          ${[...seedAttendees, ...devFakeAttendees]
            .map(
              (a) => `
            <button
              class="dev-scan-btn"
              type="button"
              data-payload="${a.payload !== undefined ? a.payload : a.ticketId}"
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
            <th>Ticket ID</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${attendees
            .map((a) => {
              const status = a.checkedIn ? "checked-in" : "registered";
              return `
            <tr>
              <td>${a.name}</td>
              <td>${a.email}</td>
              <td>${a.ticketId}</td>
              <td><span class="status-badge ${status}">${status}</span></td>
            </tr>
          `;
            })
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
  
  document.getElementById("scanQrBtn").addEventListener("click", async () => {
  const reader = document.getElementById("qrReader");
  reader.style.display = "block";

  const scanner = new Html5Qrcode("qrReader");

  try {
    await scanner.start(
      { facingMode: "environment" },
      { fps: 10 },
      async (decodedText) => {
        await scanner.stop();
        reader.style.display = "none";

        document.getElementById("qrInput").value = decodedText;
        checkInAttendee(decodedText);
      },
      () => {}
    );
  } catch (error) {
    reader.style.display = "none";
    console.error("Unable to start QR scanner:", error);
    alert("Unable to access the camera. Please check camera permissions or use the Ticket ID field.");
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
