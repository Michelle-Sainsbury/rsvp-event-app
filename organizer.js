// Mock attendee data. Once the backend is ready, replace this array with
// a fetch() call to the registrations API — the shape (eventId, attendeeId,
// registrationId, name, email, status) should stay the same.
const mockAttendees = [
  { eventId: "evt1", attendeeId: "att1", registrationId: "reg1", name: "Jordan Lee", email: "jordan@example.com", status: "registered" },
  { eventId: "evt1", attendeeId: "att2", registrationId: "reg2", name: "Priya Shah", email: "priya@example.com", status: "registered" },
  { eventId: "evt1", attendeeId: "att3", registrationId: "reg3", name: "Sam Okafor", email: "sam@example.com", status: "checked-in" },
  { eventId: "evt1", attendeeId: "att4", registrationId: "reg4", name: "Casey Kim", email: "casey@example.com", status: "registered" },
];

let nameSearchTerm = "";
let emailSearchTerm = "";
let nameSuggestionsOpen = false;
let emailSuggestionsOpen = false;
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

function getFilteredAttendees() {
  const nameTerm = nameSearchTerm.toLowerCase();
  const emailTerm = emailSearchTerm.toLowerCase();
  return mockAttendees.filter(
    (a) =>
      a.name.toLowerCase().includes(nameTerm) &&
      a.email.toLowerCase().includes(emailTerm)
  );
}

function getSuggestions(term, field) {
  const t = term.toLowerCase();
  if (!t) return [];
  return mockAttendees
    .filter((a) => a[field].toLowerCase().includes(t))
    .slice(0, 5);
}

// Re-rendering replaces the whole #organizerApp subtree on every keystroke,
// which would otherwise kick focus out of whichever input the user is
// typing in. Save focus + cursor position before render and restore it after.
function withPreservedFocus(renderFn) {
  const active = document.activeElement;
  const activeId = active && active.id;
  const selectionStart = active && "selectionStart" in active ? active.selectionStart : null;
  const selectionEnd = active && "selectionEnd" in active ? active.selectionEnd : null;

  renderFn();

  if (activeId) {
    const restored = document.getElementById(activeId);
    if (restored) {
      restored.focus();
      if (selectionStart !== null && selectionEnd !== null && "setSelectionRange" in restored) {
        restored.setSelectionRange(selectionStart, selectionEnd);
      }
    }
  }
}

function renderSuggestions(term, field, suggestionsId) {
  const suggestions = getSuggestions(term, field);
  if (!suggestions.length) return "";

  return `
    <ul id="${suggestionsId}" class="suggestion-list">
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
  const attendees = getFilteredAttendees();
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
    </section>

    <section class="attendee-list-card">
      <h2>Registered Attendees</h2>
      <div class="search-row">
        <div class="search-field">
          <input
            id="nameSearchInput"
            type="text"
            autocomplete="off"
            placeholder="Search by name"
            value="${nameSearchTerm}"
          />
          ${nameSuggestionsOpen ? renderSuggestions(nameSearchTerm, "name", "nameSuggestions") : ""}
        </div>

        <div class="search-field">
          <input
            id="emailSearchInput"
            type="text"
            autocomplete="off"
            placeholder="Search by email"
            value="${emailSearchTerm}"
          />
          ${emailSuggestionsOpen ? renderSuggestions(emailSearchTerm, "email", "emailSuggestions") : ""}
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
          ${attendees
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
      ${attendees.length === 0 ? '<p class="hint">No attendees match your search.</p>' : ""}
    </section>
  `;

  const nameSearchInput = document.getElementById("nameSearchInput");
  const emailSearchInput = document.getElementById("emailSearchInput");

  nameSearchInput.addEventListener("input", (e) => {
    nameSearchTerm = e.target.value;
    nameSuggestionsOpen = true;
    withPreservedFocus(render);
  });

  emailSearchInput.addEventListener("input", (e) => {
    emailSearchTerm = e.target.value;
    emailSuggestionsOpen = true;
    withPreservedFocus(render);
  });

  nameSearchInput.addEventListener("blur", () => {
    // Delay so a click on a suggestion registers before the list disappears.
    setTimeout(() => {
      nameSuggestionsOpen = false;
      render();
    }, 150);
  });

  emailSearchInput.addEventListener("blur", () => {
    setTimeout(() => {
      emailSuggestionsOpen = false;
      render();
    }, 150);
  });

  document.querySelectorAll(".suggestion-item").forEach((item) => {
    item.addEventListener("mousedown", (e) => {
      const field = e.target.getAttribute("data-field");
      const value = e.target.getAttribute("data-value");
      if (field === "name") {
        nameSearchTerm = value;
        nameSuggestionsOpen = false;
      } else {
        emailSearchTerm = value;
        emailSuggestionsOpen = false;
      }
      render();
    });
  });

  document.getElementById("checkInBtn").addEventListener("click", () => {
    const input = document.getElementById("qrInput");
    checkInAttendee(input.value);
  });

  document.getElementById("qrInput").addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      checkInAttendee(e.target.value);
    }
  });
}

render();
