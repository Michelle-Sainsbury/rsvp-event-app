// Renders the sidebar event list and dashboard cards from the shared
// events.js store instead of hardcoded markup, so a newly published event
// (create-event.html) actually shows up here.

function eventStatusBadge(event) {
  if (event.draft) return { label: "Draft", cls: "badge-muted" };
  if (event.registrationOpen) return { label: "Registration open", cls: "badge-success" };
  return { label: "Registration closed", cls: "badge-muted" };
}

const events = loadEvents();

const sidebarList = document.getElementById("sidebarEventList");
sidebarList.innerHTML = events
  .map(
    (e) =>
      `<a href="workspace.html?event=${encodeURIComponent(e.id)}" class="sidebar-event-link">${e.name}</a>`
  )
  .join("");

const eventGrid = document.getElementById("eventGrid");
eventGrid.innerHTML = events
  .map((e) => {
    const attendees = getAttendeesForEvent(e.id);
    const registered = attendees.length;
    const checkedIn = attendees.filter((a) => a.checkedIn).length;
    const badge = eventStatusBadge(e);
    const artFill = e.coverImage
      ? `<div class="event-card-art-fill" style="background-image:url('${e.coverImage}');"></div>`
      : "";
    return `
      <div class="event-card">
        <div class="event-card-art ${e.coverImage ? "" : e.artClass}">${artFill}</div>
        <div class="event-card-body">
          <div class="event-card-top">
            <h3>${e.name}</h3>
            <span class="badge ${badge.cls}">${badge.label}</span>
          </div>
          <div class="event-card-meta">${formatEventDateShort(e.date)} &middot; ${e.location}</div>
          <div class="event-mini-stats">
            <div class="event-mini-stat">
              <div class="stat-badge stat-badge-purple"><svg viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="5" height="5" rx="1" stroke="currentColor" stroke-width="1.3"/><rect x="9" y="2" width="5" height="5" rx="1" stroke="currentColor" stroke-width="1.3"/><rect x="2" y="9" width="5" height="5" rx="1" stroke="currentColor" stroke-width="1.3"/><rect x="9" y="9" width="5" height="5" rx="1" stroke="currentColor" stroke-width="1.3"/></svg></div>
              <div><span class="n">${e.capacity}</span><span class="l">Capacity</span></div>
            </div>
            <div class="event-mini-stat">
              <div class="stat-badge stat-badge-blue"><svg viewBox="0 0 16 16" fill="none"><rect x="3" y="2" width="10" height="12" rx="1.5" stroke="currentColor" stroke-width="1.4"/><path d="M5.5 5.5h5M5.5 8h5M5.5 10.5h3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg></div>
              <div><span class="n">${registered}</span><span class="l">Registered</span></div>
            </div>
            <div class="event-mini-stat">
              <div class="stat-badge stat-badge-green"><svg viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="12" height="12" rx="4" stroke="currentColor" stroke-width="1.4"/><path d="M5.5 8.2l1.8 1.8 3.2-3.6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
              <div><span class="n">${checkedIn}</span><span class="l">Checked in</span></div>
            </div>
            <div class="event-card-actions">
              <a href="public-event.html?event=${encodeURIComponent(e.id)}" class="btn btn-sm btn-ink">Attendee Registration</a>
              <a href="workspace.html?event=${encodeURIComponent(e.id)}" class="btn btn-sm event-card-action-purple">Organizer Dashboard</a>
            </div>
          </div>
        </div>
      </div>
    `;
  })
  .join("");
