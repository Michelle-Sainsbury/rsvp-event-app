// The event this workspace page is for, read from ?event=<id> and looked up
// in events.js's shared store. Falls back to the original demo event if the
// id isn't found (e.g. events.js hasn't seeded yet), so the page never
// renders blank.
const currentEventId = (typeof getEventIdFromURL === "function" && getEventIdFromURL()) || "community-tech-night";
let currentEvent =
  (typeof getEventById === "function" && getEventById(currentEventId)) || {
    id: currentEventId,
    name: "Community Tech Night",
    description: "Join us for an evening of lightning talks, demos, and networking with Brooklyn's tech community.",
    date: "2026-10-15",
    startTime: "10:00",
    endTime: "18:00",
    location: "Brooklyn, NY",
    organizer: "Brooklyn Tech Collective",
    capacity: 80,
    registrationOpen: true,
    artClass: "placeholder-art",
  };

function formatSettingsDate(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" });
}

function formatSettingsTime(t) {
  const [h, m] = t.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = ((h + 11) % 12) + 1;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

function persistCurrentEvent() {
  if (typeof upsertEvent === "function") upsertEvent(currentEvent);
}

function getCurrentEventAttendees() {
  return typeof getAttendeesForEvent === "function" ? getAttendeesForEvent(currentEvent.id) : [];
}

// ---- Sidebar: real event list, current one highlighted ----
function renderSidebar() {
  if (typeof renderAppSidebar !== "function") return;
  renderAppSidebar({ activeEventId: currentEvent.id });
}

// ---- Header: name, date/time, location, art, view-event-page link ----
function renderHeader() {
  document.title = `RSVP | ${currentEvent.name}`;
  const nameEl = document.getElementById("eventHeaderName");
  nameEl.innerHTML = "";
  const nameWords = currentEvent.name.split(" ");
  nameEl.appendChild(document.createTextNode(nameWords[0]));
  if (nameWords.length > 1) {
    nameEl.appendChild(document.createElement("br"));
    nameEl.appendChild(document.createTextNode(nameWords.slice(1).join(" ")));
  }
  document.getElementById("eventHeaderDateTime").textContent =
    `${formatSettingsDate(currentEvent.date)} · ${formatSettingsTime(currentEvent.startTime)} – ${formatSettingsTime(currentEvent.endTime)}`;
  document.getElementById("eventHeaderLocation").textContent = currentEvent.location;

  const art = document.getElementById("eventHeaderArt");
  art.className = `event-header-art ${currentEvent.artClass || "placeholder-art"}`;
  if (currentEvent.coverImage) {
    art.style.backgroundImage = `url("${currentEvent.coverImage}")`;
    art.style.backgroundSize = "cover";
    art.style.backgroundPosition = "center 65%";
  } else {
    art.style.backgroundImage = "";
  }

  const viewLink = document.getElementById("viewEventPageLink");
  viewLink.href = `public-event.html?event=${encodeURIComponent(currentEvent.id)}`;
}

// ---- Overview tab: real attendee counts + check-in rate ring ----
function renderOverview() {
  const attendees = getCurrentEventAttendees();
  const registered = attendees.length;
  const checkedIn = attendees.filter((a) => a.checkedIn).length;
  const notCheckedIn = registered - checkedIn;
  const capacity = currentEvent.capacity || 0;
  const remaining = Math.max(capacity - registered, 0);
  const pct = registered ? Math.round((checkedIn / registered) * 100) : 0;

  document.getElementById("statRegistered").textContent = registered;
  document.getElementById("statCheckedIn").textContent = checkedIn;
  document.getElementById("statNotCheckedIn").textContent = notCheckedIn;
  document.getElementById("statCapacity").textContent = capacity;
  document.getElementById("statRemaining").textContent = remaining;

  document.getElementById("checkinRingPct").textContent = `${pct}%`;
  document.getElementById("checkinRingLbl").textContent = `of ${registered}`;
  document.getElementById("legendCheckedIn").textContent = `Checked in (${checkedIn})`;
  document.getElementById("legendNotCheckedIn").textContent = `Not checked in (${notCheckedIn})`;
  document.getElementById("checkinRing").style.background =
    `conic-gradient(var(--color-green-chart) 0% ${pct}%, var(--color-yellow-chart) ${pct}% 100%)`;

  const regPct = capacity ? Math.min(Math.round((registered / capacity) * 100), 100) : 0;
  document.getElementById("registrationRingPct").textContent = `${regPct}%`;
  document.getElementById("registrationRingLbl").textContent = `of ${capacity}`;
  document.getElementById("legendRegistered").textContent = `Registered (${registered})`;
  document.getElementById("legendRemaining").textContent = `Remaining (${remaining})`;
  document.getElementById("registrationRing").style.background =
    `conic-gradient(var(--color-blue-chart) 0% ${regPct}%, var(--color-pink-chart) ${regPct}% 100%)`;

  renderRecentActivity();
}

// Overview tab: most recent registration/check-in events, name + status +
// time, newest first. Each attendee can contribute up to two entries (one
// for registering, one for checking in) — merged into a single timeline.
function renderRecentActivity() {
  const list = document.getElementById("recentActivityList");
  if (!list) return;

  const events = [];
  getCurrentEventAttendees().forEach((a) => {
    if (a.registeredAt) events.push({ name: a.name, status: "Registered", badgeClass: "badge-blue", time: a.registeredAt });
    if (a.checkedIn && a.checkedInAt) events.push({ name: a.name, status: "Checked in", badgeClass: "badge-success", time: a.checkedInAt });
  });

  const recent = events.sort((a, b) => b.time - a.time).slice(0, 3);

  if (!recent.length) {
    list.innerHTML = `<p class="muted" style="font-size:13px;margin:0;">No activity yet.</p>`;
    return;
  }

  list.innerHTML = recent
    .map(
      (e) => `
        <div class="recent-checkin-row">
          <span class="recent-checkin-name">${e.name}</span>
          <span class="badge ${e.badgeClass}">${e.status}</span>
          <span class="recent-checkin-time">${new Date(e.time).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}</span>
        </div>
      `
    )
    .join("");
}

// Check-in tab's arrival-summary cards — same real numbers as the Overview
// tab, since check-ins happen right there and organizers shouldn't have to
// tab away to see whether the count moved.
function renderArrivalSummary() {
  const attendees = getCurrentEventAttendees();
  const registered = attendees.length;
  const checkedIn = attendees.filter((a) => a.checkedIn).length;
  const capacity = currentEvent.capacity || 0;
  const pct = registered ? Math.round((checkedIn / registered) * 100) : 0;

  document.getElementById("arrivalCapacity").textContent = capacity;
  document.getElementById("arrivalRegistered").textContent = registered;
  document.getElementById("arrivalCheckedIn").textContent = checkedIn;
  document.getElementById("arrivalProgressText").textContent = `${checkedIn} of ${registered} arrived`;
  document.getElementById("arrivalProgressPct").textContent = `${pct}%`;
  document.getElementById("arrivalProgressFill").style.width = `${pct}%`;
}

function showTab(name) {
  document.querySelectorAll(".tab-content").forEach((el) => {
    el.classList.toggle("active", el.id === "tab-" + name);
  });
  document.querySelectorAll(".tab-bar [data-tab]").forEach((el) => {
    el.classList.toggle("active", el.getAttribute("data-tab") === name);
  });
  if (name === "overview") renderOverview();
  if (name === "checkin") renderArrivalSummary();
}

document.querySelectorAll(".tab-bar [data-tab]").forEach((el) => {
  el.addEventListener("click", (e) => {
    e.preventDefault();
    showTab(el.getAttribute("data-tab"));
  });
});

// Settings tab: each section shows static text until its own "Edit" is
// clicked, matching only that section's fields become editable.
function toggleSettingsEdit(section, editing) {
  const view = document.querySelector(`.settings-view[data-view="${section}"]`);
  const edit = document.querySelector(`.settings-edit[data-edit-panel="${section}"]`);
  const editBtn = document.querySelector(`.settings-edit-btn[data-edit="${section}"]`);
  if (!view || !edit) return;
  view.hidden = editing;
  edit.hidden = !editing;
  if (editBtn) editBtn.hidden = editing;
}

// Holds a newly-picked (not yet saved) cover image as a data URL, so
// Cancel can drop it and Save can commit it to currentEvent.
let pendingArtworkDataUrl = null;

function renderUploadBoxPreview(dataUrl) {
  const box = document.getElementById("artworkUploadBox");
  if (!box) return;
  if (dataUrl) {
    box.innerHTML = `<img src="${dataUrl}" alt="Cover image preview" style="max-height:120px;border-radius:8px;display:block;margin:0 auto;">`;
  } else {
    box.textContent = "Drop an image or click to upload";
  }
}

function populateSettingsInputs(section) {
  if (section === "details") {
    document.getElementById("settingsName").value = currentEvent.name;
    document.getElementById("settingsCap").value = currentEvent.capacity;
    document.getElementById("settingsHost").value = currentEvent.organizer;
    document.getElementById("settingsDesc").value = currentEvent.description;
  } else if (section === "datetime") {
    document.getElementById("settingsDate").value = currentEvent.date;
    document.getElementById("settingsTime").value = currentEvent.startTime;
    document.getElementById("settingsEndTime").value = currentEvent.endTime;
    document.getElementById("settingsLoc").value = currentEvent.location;
  } else if (section === "artwork") {
    pendingArtworkDataUrl = null;
    document.getElementById("artworkFileInput").value = "";
    renderUploadBoxPreview(currentEvent.coverImage);
  }
}

const artworkFileInput = document.getElementById("artworkFileInput");
if (artworkFileInput) {
  artworkFileInput.addEventListener("change", () => {
    const file = artworkFileInput.files[0];
    if (!file) return;
    fileToCoverImageDataUrl(file)
      .then((dataUrl) => {
        pendingArtworkDataUrl = dataUrl;
        renderUploadBoxPreview(pendingArtworkDataUrl);
      })
      .catch((e) => alert(e.message || "Couldn't read that image file."));
  });
}

function renderSettingsView() {
  document.querySelector('[data-field="settingsName"]').textContent = currentEvent.name;
  document.querySelector('[data-field="settingsCap"]').textContent = currentEvent.capacity;
  document.querySelector('[data-field="settingsDesc"]').textContent = currentEvent.description;
  document.querySelector('[data-field="settingsDateDisplay"]').textContent = formatSettingsDate(currentEvent.date);
  document.querySelector('[data-field="settingsTimeDisplay"]').textContent =
    `${formatSettingsTime(currentEvent.startTime)} – ${formatSettingsTime(currentEvent.endTime)}`;
  document.querySelector('[data-field="settingsLoc"]').textContent = currentEvent.location;
  document.querySelector('[data-field="settingsHost"]').textContent = currentEvent.organizer;
  document.querySelector('[data-field="settingsArtwork"]').textContent =
    currentEvent.coverImage ? "Custom image uploaded" : "No image uploaded";
}

function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.hidden = false;
  // Force layout so the next class change actually transitions in, even
  // if a previous toast just got hidden.
  void toast.offsetWidth;
  toast.classList.add("show");
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => { toast.hidden = true; }, 200);
  }, 2200);
}

function saveSettingsSection(section) {
  let artworkChanged = false;
  if (section === "details") {
    currentEvent.name = document.getElementById("settingsName").value;
    currentEvent.capacity = Number(document.getElementById("settingsCap").value) || 0;
    currentEvent.organizer = document.getElementById("settingsHost").value;
    currentEvent.description = document.getElementById("settingsDesc").value;
  } else if (section === "datetime") {
    currentEvent.date = document.getElementById("settingsDate").value;
    currentEvent.startTime = document.getElementById("settingsTime").value;
    currentEvent.endTime = document.getElementById("settingsEndTime").value;
    currentEvent.location = document.getElementById("settingsLoc").value;
  } else if (section === "artwork") {
    if (pendingArtworkDataUrl && pendingArtworkDataUrl !== currentEvent.coverImage) {
      currentEvent.coverImage = pendingArtworkDataUrl;
      artworkChanged = true;
    }
    pendingArtworkDataUrl = null;
  }
  try {
    persistCurrentEvent();
  } catch (e) {
    alert(e.message || "Couldn't save changes.");
    return;
  }
  renderSettingsView();
  renderHeader();
  renderSidebar();
  toggleSettingsEdit(section, false);
  if (artworkChanged) showToast("Artwork updated");
}

function cancelSettingsSection(section) {
  populateSettingsInputs(section);
  toggleSettingsEdit(section, false);
}

document.querySelectorAll(".settings-edit-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const section = btn.getAttribute("data-edit");
    populateSettingsInputs(section);
    toggleSettingsEdit(section, true);
  });
});

document.querySelectorAll("[data-cancel]").forEach((btn) => {
  btn.addEventListener("click", () => cancelSettingsSection(btn.getAttribute("data-cancel")));
});

document.querySelectorAll("[data-save]").forEach((btn) => {
  btn.addEventListener("click", () => saveSettingsSection(btn.getAttribute("data-save")));
});

const registrationOpenToggle = document.getElementById("registrationOpenToggle");
if (registrationOpenToggle) {
  const registrationOpenLabel = document.getElementById("registrationOpenLabel");
  const registrationOpenNotice = document.getElementById("registrationOpenNotice");
  const registrationClosedNotice = document.getElementById("registrationClosedNotice");
  const registrationConfirmOverlay = document.getElementById("registrationConfirmOverlay");
  const registrationConfirmTitle = document.getElementById("registrationConfirmTitle");
  const registrationConfirmBody = document.getElementById("registrationConfirmBody");
  const confirmRegistrationConfirmBtn = document.getElementById("confirmRegistrationConfirmBtn");

  function applyRegistrationState(isOpen) {
    registrationOpenToggle.checked = isOpen;
    registrationOpenLabel.textContent = isOpen ? "Registration open" : "Registration closed";
    registrationOpenNotice.hidden = !isOpen;
    registrationClosedNotice.hidden = isOpen;
    currentEvent.registrationOpen = isOpen;
    persistCurrentEvent();
  }

  function closeRegistrationConfirm() {
    registrationConfirmOverlay.hidden = true;
  }

  registrationOpenToggle.addEventListener("change", () => {
    const requestedOpen = registrationOpenToggle.checked;
    // Revert immediately — the flip only sticks once the organizer confirms
    // they understand what it does to guests.
    registrationOpenToggle.checked = !requestedOpen;

    if (requestedOpen) {
      registrationConfirmTitle.textContent = "Reopen registration?";
      registrationConfirmBody.textContent =
        "Anyone with the event link will be able to register again, including people who missed the original window. Make sure you're ready to accept more attendees before reopening.";
    } else {
      registrationConfirmTitle.textContent = "Close registration?";
      registrationConfirmBody.textContent =
        "This immediately stops new guests from registering — anyone with the link will see registration is closed. Existing registrations and check-ins aren't affected, but people who haven't registered yet will lose the chance to.";
    }

    confirmRegistrationConfirmBtn.onclick = () => {
      applyRegistrationState(requestedOpen);
      closeRegistrationConfirm();
    };

    registrationConfirmOverlay.hidden = false;
  });

  document.getElementById("closeRegistrationConfirmBtn").addEventListener("click", closeRegistrationConfirm);
  document.getElementById("cancelRegistrationConfirmBtn").addEventListener("click", closeRegistrationConfirm);
  registrationConfirmOverlay.addEventListener("click", (e) => {
    if (e.target === registrationConfirmOverlay) closeRegistrationConfirm();
  });

  // Reflect the event's real stored state on load, not always "open".
  applyRegistrationState(currentEvent.registrationOpen !== false);
}

const copyShareLinkBtn = document.getElementById("copyShareLinkBtn");
if (copyShareLinkBtn) {
  const shareLinkInput = document.getElementById("shareLink");
  shareLinkInput.value = new URL(`public-event.html?event=${encodeURIComponent(currentEvent.id)}`, window.location.href).href;

  copyShareLinkBtn.addEventListener("click", async () => {
    const link = shareLinkInput.value;
    let copied = true;
    try {
      await navigator.clipboard.writeText(link);
    } catch (e) {
      shareLinkInput.select();
      copied = false;
    }
    const originalText = copyShareLinkBtn.textContent;
    copyShareLinkBtn.textContent = copied ? "Copied!" : "Press Ctrl+C";
    setTimeout(() => {
      copyShareLinkBtn.textContent = originalText;
    }, 1500);
  });
}

const testShareLinkBtn = document.getElementById("testShareLinkBtn");
if (testShareLinkBtn) {
  testShareLinkBtn.addEventListener("click", () => {
    window.open(document.getElementById("shareLink").value, "_blank");
  });
}

const deleteEventBtn = document.getElementById("deleteEventBtn");
const deleteEventOverlay = document.getElementById("deleteEventOverlay");
const deleteEventConfirmInput = document.getElementById("deleteEventConfirmInput");
const confirmDeleteEventBtn = document.getElementById("confirmDeleteEventBtn");

function closeDeleteEventModal() {
  deleteEventOverlay.hidden = true;
  deleteEventConfirmInput.value = "";
  confirmDeleteEventBtn.disabled = true;
}

if (deleteEventBtn) {
  document.querySelector('#deleteEventOverlay .modal-panel p').innerHTML =
    `This permanently deletes <strong>${currentEvent.name}</strong> and all attendee data. This can't be undone. Type <strong>delete</strong> below to confirm.`;

  deleteEventBtn.addEventListener("click", () => {
    deleteEventOverlay.hidden = false;
    deleteEventConfirmInput.focus();
  });

  document.getElementById("closeDeleteEventBtn").addEventListener("click", closeDeleteEventModal);
  document.getElementById("cancelDeleteEventBtn").addEventListener("click", closeDeleteEventModal);

  deleteEventOverlay.addEventListener("click", (e) => {
    if (e.target === deleteEventOverlay) closeDeleteEventModal();
  });

  deleteEventConfirmInput.addEventListener("input", () => {
    confirmDeleteEventBtn.disabled = deleteEventConfirmInput.value.trim().toLowerCase() !== "delete";
  });

  confirmDeleteEventBtn.addEventListener("click", () => {
    if (confirmDeleteEventBtn.disabled) return;
    if (typeof deleteEventById === "function") deleteEventById(currentEvent.id);
    window.location.href = "dashboard.html";
  });
}

renderSidebar();
renderHeader();
renderOverview();
renderArrivalSummary();
renderSettingsView();
