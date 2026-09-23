// Mock attendee data. Once the backend is ready, replace this array with
// a fetch() call to the registrations API — the shape (eventId, attendeeId,
// registrationId, name, email, status) should stay the same.
const mockAttendees = [
  { eventId: "evt1", attendeeId: "att1", registrationId: "reg1", name: "Jordan Lee", email: "jordan@example.com", status: "registered" },
  { eventId: "evt1", attendeeId: "att2", registrationId: "reg2", name: "Priya Shah", email: "priya@example.com", status: "registered" },
  { eventId: "evt1", attendeeId: "att3", registrationId: "reg3", name: "Sam Okafor", email: "sam@example.com", status: "checked-in" },
  { eventId: "evt1", attendeeId: "att4", registrationId: "reg4", name: "Casey Kim", email: "casey@example.com", status: "registered" },
];

let searchTerm = "";
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
  const term = searchTerm.toLowerCase();
  if (!term) return mockAttendees;
  return mockAttendees.filter(
    (a) =>
      a.name.toLowerCase().includes(term) ||
      a.email.toLowerCase().includes(term)
  );
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
      <input id="searchInput" type="text" placeholder="Search by name or email" value="${searchTerm}" />
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

  document.getElementById("searchInput").addEventListener("input", (e) => {
    searchTerm = e.target.value;
    render();
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
