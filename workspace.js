function showTab(name) {
  document.querySelectorAll(".tab-content").forEach((el) => {
    el.classList.toggle("active", el.id === "tab-" + name);
  });
  document.querySelectorAll(".tab-bar [data-tab]").forEach((el) => {
    el.classList.toggle("active", el.getAttribute("data-tab") === name);
  });
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

// Source of truth for the editable fields, so Cancel can restore inputs
// to their last-saved values instead of leaving a discarded edit behind.
const settingsData = {
  name: "Community Tech Night",
  capacity: "80",
  desc: "Join us for an evening of lightning talks, demos, and networking with Brooklyn's tech community.",
  date: "2026-10-15",
  time: "10:00",
  endTime: "18:00",
  loc: "Brooklyn, NY",
  host: "Brooklyn Tech Collective",
};

function populateSettingsInputs(section) {
  if (section === "details") {
    document.getElementById("settingsName").value = settingsData.name;
    document.getElementById("settingsCap").value = settingsData.capacity;
    document.getElementById("settingsDesc").value = settingsData.desc;
  } else if (section === "datetime") {
    document.getElementById("settingsDate").value = settingsData.date;
    document.getElementById("settingsTime").value = settingsData.time;
    document.getElementById("settingsEndTime").value = settingsData.endTime;
    document.getElementById("settingsLoc").value = settingsData.loc;
    document.getElementById("settingsHost").value = settingsData.host;
  }
}

function saveSettingsSection(section) {
  if (section === "details") {
    settingsData.name = document.getElementById("settingsName").value;
    settingsData.capacity = document.getElementById("settingsCap").value;
    settingsData.desc = document.getElementById("settingsDesc").value;
    document.querySelector('[data-field="settingsName"]').textContent = settingsData.name;
    document.querySelector('[data-field="settingsCap"]').textContent = settingsData.capacity;
    document.querySelector('[data-field="settingsDesc"]').textContent = settingsData.desc;
  } else if (section === "datetime") {
    settingsData.date = document.getElementById("settingsDate").value;
    settingsData.time = document.getElementById("settingsTime").value;
    settingsData.endTime = document.getElementById("settingsEndTime").value;
    settingsData.loc = document.getElementById("settingsLoc").value;
    settingsData.host = document.getElementById("settingsHost").value;
    document.querySelector('[data-field="settingsDateDisplay"]').textContent = formatSettingsDate(settingsData.date);
    document.querySelector('[data-field="settingsTimeDisplay"]').textContent =
      `${formatSettingsTime(settingsData.time)} – ${formatSettingsTime(settingsData.endTime)}`;
    document.querySelector('[data-field="settingsLoc"]').textContent = settingsData.loc;
    document.querySelector('[data-field="settingsHost"]').textContent = settingsData.host;
  }
  toggleSettingsEdit(section, false);
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
}

const copyShareLinkBtn = document.getElementById("copyShareLinkBtn");
if (copyShareLinkBtn) {
  copyShareLinkBtn.addEventListener("click", async () => {
    const link = document.getElementById("shareLink").value;
    try {
      await navigator.clipboard.writeText(link);
    } catch (e) {
      document.getElementById("shareLink").select();
    }
    const originalText = copyShareLinkBtn.textContent;
    copyShareLinkBtn.textContent = "Copied!";
    setTimeout(() => {
      copyShareLinkBtn.textContent = originalText;
    }, 1500);
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
    window.location.href = "dashboard.html";
  });
}
