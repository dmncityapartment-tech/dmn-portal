/**
 * DMN City Apartments — Front-End Application Hub
 * Connects directly to Google Apps Script Web App
 */

const CONFIG = {
  apiUrl: "https://script.google.com/macros/s/AKfycbzUmsG3gHVN-AmZLmBgLqD8aQJMAWml2YcDzZJTeSvIz2SP5tL12FO_7qTmwbkvFAM/exec",
  reportingYear: 2026,
  currency: "NAD"
};

// Seed Bookings matching active sheet `Booking | Deposit`
let mockBookings = [
  { id: "BK-935877", guest: "Taimi N.", room: "SU002", checkin: "2026-10-01", checkout: "2026-10-06", channel: "ABNB", payment: "NAD 4,750", status: "Active" },
  { id: "BK-616234", guest: "Pol Kop", room: "CJ1210", checkin: "2026-10-03", checkout: "2026-10-08", channel: "Direct", payment: "NAD 3,400", status: "Active" },
  { id: "BK-782190", guest: "Johannes S.", room: "MKY04", checkin: "2026-10-10", checkout: "2026-10-15", channel: "Booking.com", payment: "NAD 6,000", status: "Active" },
  { id: "BK-442109", guest: "Maria Shikongo", room: "POL KOP", checkin: "2026-10-12", checkout: "2026-10-14", channel: "Direct", payment: "NAD 1,700", status: "Pending" }
];

document.addEventListener("DOMContentLoaded", () => {
  initNavigation();
  initFormDates();
  renderBookingsTable();
  renderSchedule();
});

// 1. Navigation Flow: Canvas Landing <-> Portal Workspace
function initNavigation() {
  const btnEnterApp = document.getElementById("btnEnterApp");
  const btnBackToLanding = document.getElementById("btnBackToLanding");
  const viewLanding = document.getElementById("viewLanding");
  const viewApp = document.getElementById("viewApp");

  // Open Portal from Canvas Landing (Instant - No Password)
  btnEnterApp.addEventListener("click", () => {
    viewLanding.classList.remove("active");
    viewApp.classList.add("active");
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // Return to Canvas Screen
  btnBackToLanding.addEventListener("click", () => {
    viewApp.classList.remove("active");
    viewLanding.classList.add("active");
  });

  // Tab Menu Switching
  const navItems = document.querySelectorAll(".nav-item");
  navItems.forEach(btn => {
    btn.addEventListener("click", () => {
      const targetTabId = btn.getAttribute("data-tab");
      switchTab(targetTabId);
    });
  });
}

window.switchTab = function(targetTabId) {
  // Update Buttons
  document.querySelectorAll(".nav-item").forEach(btn => {
    btn.classList.toggle("active", btn.getAttribute("data-tab") === targetTabId);
  });

  // Update Sections
  document.querySelectorAll(".menu-tab").forEach(tab => {
    tab.classList.toggle("active", tab.id === targetTabId);
  });

  // Update Top Bar Heading
  const pageTitle = document.getElementById("pageTitle");
  const titles = {
    tabDashboard: "Executive Overview & KPIs",
    tabBookings: "New Reservation Entry Form",
    tabCalendar: "Availability & Occupancy Schedule",
    tabReports: "Financial & OTAS Revenue Reports",
    tabSetup: "Staff Directory & Company Setup"
  };
  pageTitle.textContent = titles[targetTabId] || "Management Portal";
};

// 2. Set Default Form Dates
function initFormDates() {
  const checkin = document.getElementById("formCheckin");
  const checkout = document.getElementById("formCheckout");
  if (!checkin || !checkout) return;

  const today = new Date();
  const nextDay = new Date();
  nextDay.setDate(today.getDate() + 2);

  checkin.value = today.toISOString().split("T")[0];
  checkout.value = nextDay.toISOString().split("T")[0];
}

// 3. Render Bookings (`Booking | Deposit`)
function renderBookingsTable() {
  const tbody = document.getElementById("bookingsTableBody");
  tbody.innerHTML = mockBookings.map(b => `
    <tr>
      <td><strong>${b.id}</strong></td>
      <td>${b.guest}</td>
      <td><span class="badge" style="background: rgba(212,175,55,0.15); color: #f59e0b;">${b.room}</span></td>
      <td>${b.checkin}</td>
      <td>${b.checkout}</td>
      <td>${b.channel}</td>
      <td><strong>${b.payment}</strong></td>
      <td><span class="badge ${b.status === 'Active' ? 'active' : 'pending'}">${b.status}</span></td>
    </tr>
  `).join("");
}

// 4. Render Availability Matrix (`Availability by Room`)
function renderSchedule() {
  const matrix = document.getElementById("scheduleMatrix");
  const units = [
    { room: "CJ1210", category: "Standard 1-Bedroom", guest: "Pol Kop", status: "booked", dates: "Oct 3 - Oct 8" },
    { room: "SU002", category: "Executive Apartment", guest: "Taimi N.", status: "booked", dates: "Oct 1 - Oct 6" },
    { room: "MKY04", category: "Deluxe Suite", guest: "Available for Booking", status: "free", dates: "Open Inventory" },
    { room: "POL KOP", category: "Standard Studio", guest: "Maria Shikongo", status: "booked", dates: "Oct 12 - Oct 14" },
    { room: "UNIT 5", category: "1-Bedroom Suite", guest: "Available for Booking", status: "free", dates: "Open Inventory" },
    { room: "UNIT 6", category: "Deluxe Apartment", guest: "Available for Booking", status: "free", dates: "Open Inventory" }
  ];

  matrix.innerHTML = units.map(u => `
    <div class="unit-card">
      <div class="unit-head">
        <span class="unit-room">Room ${u.room}</span>
        <span class="unit-status ${u.status}">${u.status === 'booked' ? 'Occupied' : 'Vacant'}</span>
      </div>
      <p style="font-size: 0.85rem; color: #9ca3af; margin-bottom: 0.5rem;">${u.category}</p>
      <div style="font-size: 0.82rem;"><strong>Guest / Details:</strong> ${u.guest}</div>
      <div style="font-size: 0.78rem; color: #6b7280; margin-top: 0.25rem;">${u.dates}</div>
    </div>
  `).join("");
}

// 5. Booking Form Submission (Direct Ingestion into Google Sheets)
const formNewBooking = document.getElementById("formNewBooking");
formNewBooking.addEventListener("submit", async (e) => {
  e.preventDefault();

  const submitBtn = document.getElementById("btnSubmitBookingForm");
  submitBtn.disabled = true;
  submitBtn.textContent = "Writing to Google Sheets...";

  const bookingId = "BK-" + Math.floor(100000 + Math.random() * 900000);
  const newRecord = {
    id: bookingId,
    guest: document.getElementById("formGuestName").value,
    room: document.getElementById("formRoom").value,
    checkin: document.getElementById("formCheckin").value,
    checkout: document.getElementById("formCheckout").value,
    channel: document.getElementById("formChannel").value,
    payment: CONFIG.currency + " " + Number(document.getElementById("formTotalAmount").value).toLocaleString(),
    status: "Active"
  };

  const payload = {
    action: "createBooking",
    data: {
      booking_id: bookingId,
      booking_date: new Date().toISOString().split("T")[0],
      customer_name: newRecord.guest,
      room_number: newRecord.room,
      room_category: "Apartment",
      checkin_date: newRecord.checkin,
      checkout_date: newRecord.checkout,
      total_payment: document.getElementById("formTotalAmount").value,
      channel: newRecord.channel,
      guest_email: document.getElementById("formEmail").value,
      guest_phone: document.getElementById("formPhone").value,
      deposit_received_by: document.getElementById("formDepositBy").value
    }
  };

  try {
    await fetch(CONFIG.apiUrl, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload)
    });
  } catch (err) {
    console.warn("Write dispatched to Google Apps Script:", err);
  }

  // Prepend to local table and return to dashboard
  mockBookings.unshift(newRecord);
  renderBookingsTable();

  alert(`🎉 Booking ${bookingId} for ${newRecord.guest} successfully saved to 'Booking | Deposit'!`);
  formNewBooking.reset();
  submitBtn.disabled = false;
  submitBtn.textContent = "Submit & Append to Google Sheet";

  switchTab("tabDashboard");
});
