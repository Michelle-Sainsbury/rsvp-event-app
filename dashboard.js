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
            <div class="event-mini-stat"><span class="n">${e.capacity}</span><span class="l">Capacity</span></div>
            <div class="event-mini-stat"><span class="n">${registered}</span><span class="l">Registered</span></div>
            <div class="event-mini-stat"><span class="n">${checkedIn}</span><span class="l">Checked in</span></div>
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
