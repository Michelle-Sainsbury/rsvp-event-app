const app = document.getElementById("app");

const eventDetails = {
  title: "Community Tech Night",
  date: "October 15, 2026",
  time: "6:00 PM",
  location: "Brooklyn, NY",
  startUTC: "20261015T220000Z",
  endUTC: "20261016T000000Z",
};

app.innerHTML = `
  <section class="event-card">
    <h2>${eventDetails.title}</h2>

    <p><strong>Date:</strong> ${eventDetails.date}</p>
    <p><strong>Time:</strong> ${eventDetails.time}</p>
    <p><strong>Location:</strong> ${eventDetails.location}</p>

    <p>
      Join us for an evening of technology, community, and networking.
    </p>

    <button id="registerBtn">Register for Event</button>
  </section>
`;
const registerBtn = document.getElementById("registerBtn");

registerBtn.addEventListener("click", () => {
  app.innerHTML = `
    <section class="registration-form">
      <h2>Register for ${eventDetails.title}</h2>

      <form id="registrationForm">
        <label for="name">Full Name</label>
        <input type="text" id="name" required>

        <label for="email">Email Address</label>
        <input type="email" id="email" required>

        <button type="submit">Complete Registration</button>
      </form>
    </section>
  `;
  const registrationForm = document.getElementById("registrationForm");

registrationForm.addEventListener("submit", (event) => {
  event.preventDefault();
  
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  
  const ticketId = `RSVP-${Date.now()}`;
const attendee = {
  name: name,
  email: email,
  ticketId: ticketId,
  checkedIn: false
};

const attendees = JSON.parse(localStorage.getItem("rsvpAttendees")) || [];
attendees.push(attendee);
localStorage.setItem("rsvpAttendees", JSON.stringify(attendees));
app.innerHTML = `
  <section class="ticket">
    <h2>Registration Complete!</h2>
    <p><strong>${name}</strong>, you're registered for ${eventDetails.title}.</p>
    <p><strong>Email:</strong> ${email}</p>
    <p>Your digital ticket:</p>
    <div id="qrcode"></div>
    <p><strong>Ticket ID:</strong> ${ticketId}</p>
    <button id="calendarBtn">Add to Calendar</button>
    <button id="cancelBtn">Cancel Registration</button>
  </section>
`;

new QRCode(document.getElementById("qrcode"), ticketId);
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
  
  app.innerHTML = `
    <section class="cancellation">
      <h2>Registration Cancelled</h2>
      <p>Your registration for ${eventDetails.title} has been cancelled.</p>
    </section>
  `;
});
});
});

