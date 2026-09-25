// Renders the Attendees tab from the same real localStorage records that
// index.html's registration flow (script.js) and organizer.html's check-in
// flow (organizer.js) read and write. No mock data, no separate logic for
// what "checked in" means — this just displays what's already there.
const ATTENDEES_STORAGE_KEY = "rsvpAttendees";

function loadLiveAttendees() {
  try {
    return JSON.parse(localStorage.getItem(ATTENDEES_STORAGE_KEY)) || [];
  } catch (e) {
    return [];
  }
}

let attendeesFilter = "all";
let attendeesSearchName = "";
let attendeesSearchEmail = "";
let attendeesSearchTicket = "";

function matchesAttendeesFilter(a) {
  if (attendeesFilter === "checked-in") return a.checkedIn;
  if (attendeesFilter === "not-checked-in") return !a.checkedIn;
  return true;
}

function matchesAttendeesSearch(a) {
  const name = attendeesSearchName.trim().toLowerCase();
  const email = attendeesSearchEmail.trim().toLowerCase();
  const ticket = attendeesSearchTicket.trim().toLowerCase();
  return (
    (!name || a.name.toLowerCase().includes(name)) &&
    (!email || a.email.toLowerCase().includes(email)) &&
    (!ticket || a.ticketId.toLowerCase().includes(ticket))
  );
}

function renderAttendeesTab() {
  const attendees = loadLiveAttendees();
  const checkedInCount = attendees.filter((a) => a.checkedIn).length;
  const notCheckedInCount = attendees.length - checkedInCount;

  document.getElementById("attendeesHeading").textContent = `Registered Attendees (${attendees.length})`;
  document.querySelector('[data-count="all"]').textContent = attendees.length;
  document.querySelector('[data-count="checked-in"]').textContent = checkedInCount;
  document.querySelector('[data-count="not-checked-in"]').textContent = notCheckedInCount;

  const visible = attendees.filter((a) => matchesAttendeesFilter(a) && matchesAttendeesSearch(a));
  const body = document.getElementById("attendeesTableBody");

  if (!attendees.length) {
    body.innerHTML = `<tr><td colspan="6" class="muted">No one has registered yet. Once a guest registers on the event page, they'll show up here.</td></tr>`;
    return;
  }
  if (!visible.length) {
    body.innerHTML = `<tr><td colspan="6" class="muted">No attendees match this search/filter.</td></tr>`;
    return;
  }

  body.innerHTML = visible
    .map((a) => {
      const status = a.checkedIn ? "checked-in" : "registered";
      const badgeClass = a.checkedIn ? "badge-success" : "badge-warning";
      const statusLabel = a.checkedIn ? "Checked in" : "Not checked in";
      return `
        <tr>
          <td>${a.name}</td>
          <td>${a.email}</td>
          <td>${a.ticketId}</td>
          <td>General Admission</td>
          <td><span class="badge ${badgeClass}">${statusLabel}</span></td>
          <td>&mdash;</td>
        </tr>
      `;
    })
    .join("");
}

document.addEventListener("DOMContentLoaded", () => {
  renderAttendeesTab();

  document.getElementById("attendeesSearchName").addEventListener("input", (e) => {
    attendeesSearchName = e.target.value;
    renderAttendeesTab();
  });

  document.getElementById("attendeesSearchEmail").addEventListener("input", (e) => {
    attendeesSearchEmail = e.target.value;
    renderAttendeesTab();
  });

  document.getElementById("attendeesSearchTicket").addEventListener("input", (e) => {
    attendeesSearchTicket = e.target.value;
    renderAttendeesTab();
  });

  document.querySelectorAll(".pill-row .pill").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".pill-row .pill").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      attendeesFilter = btn.getAttribute("data-filter");
      renderAttendeesTab();
    });
  });

  // Refresh when returning to this tab after a check-in elsewhere in the page.
  document.querySelector('[data-tab="attendees"]').addEventListener("click", renderAttendeesTab);
});
