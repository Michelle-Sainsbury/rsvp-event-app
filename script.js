const app = document.getElementById("app");

app.innerHTML = `
  <section class="event-card">
    <h2>Community Tech Night</h2>

    <p><strong>Date:</strong> October 15, 2026</p>
    <p><strong>Time:</strong> 6:00 PM</p>
    <p><strong>Location:</strong> Brooklyn, NY</p>

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
      <h2>Register for Community Tech Night</h2>

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
    <p><strong>${name}</strong>, you're registered for Community Tech Night.</p>
    <p><strong>Email:</strong> ${email}</p>
    <p>Your digital ticket:</p>
    <div id="qrcode"></div>
    <p><strong>Ticket ID:</strong> ${ticketId}</p>
  </section>
`;

new QRCode(document.getElementById("qrcode"), ticketId);
});
});

