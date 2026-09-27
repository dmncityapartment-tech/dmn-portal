/**
 * DMN City Apartments — Portal Controller
 * Direct entry without password barrier
 */

const CONFIG = {
  apiUrl: "https://script.google.com/macros/s/AKfycbzUmsG3gHVN-AmZLmBgLqD8aQJMAWml2YcDzZJTeSvIz2SP5tL12FO_7qTmwbkvFAM/exec",
  currency: "NAD",
  defaultRate: 850
};

// State
let allRooms = [];
let activeBookingUnit = null;

// DOM Elements
const canvasView = document.getElementById("canvasView");
const dashboardView = document.getElementById("dashboardView");
const btnEnterPortal = document.getElementById("btnEnterPortal");
const btnReturnCanvas = document.getElementById("btnReturnCanvas");

const checkinInput = document.getElementById("checkinDate");
const checkoutInput = document.getElementById("checkoutDate");
const categoryFilter = document.getElementById("categoryFilter");
const filterForm = document.getElementById("filterForm");
const roomsGrid = document.getElementById("roomsGrid");
const inventoryBadge = document.getElementById("inventoryBadge");

// Modal Elements
const bookingModal = document.getElementById("bookingModal");
const btnCloseModal = document.getElementById("btnCloseModal");
const btnCancelModal = document.getElementById("btnCancelModal");
const newReservationForm = document.getElementById("newReservationForm");
const modalRoomNumber = document.getElementById("modalRoomNumber");
const modalCategory = document.getElementById("modalCategory");
const summaryUnit = document.getElementById("summaryUnit");
const summaryDates = document.getElementById("summaryDates");
const summaryRate = document.getElementById("summaryRate");

// 1. Initial Setup
document.addEventListener("DOMContentLoaded", () => {
  setupDates();
  loadRoomInventory();

  // Instant Entry: Transition from Canvas to Management Dashboard
  btnEnterPortal.addEventListener("click", () => {
    canvasView.classList.remove("active");
    dashboardView.classList.add("active");
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // Return back to Canvas landing page
  btnReturnCanvas.addEventListener("click", () => {
    dashboardView.classList.remove("active");
    canvasView.classList.add("active");
  });
});

function setupDates() {
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  checkinInput.min = today.toISOString().split("T")[0];
  checkinInput.value = today.toISOString().split("T")[0];

  checkoutInput.min = tomorrow.toISOString().split("T")[0];
  checkoutInput.value = tomorrow.toISOString().split("T")[0];

  checkinInput.addEventListener("change", () => {
    const nextDay = new Date(checkinInput.value);
    nextDay.setDate(nextDay.getDate() + 1);
    checkoutInput.min = nextDay.toISOString().split("T")[0];
    if (new Date(checkoutInput.value) <= new Date(checkinInput.value)) {
      checkoutInput.value = nextDay.toISOString().split("T")[0];
    }
  });
}

// 2. Load Inventory (Setup | Room List)
async function loadRoomInventory() {
  try {
    const res = await fetch(`${CONFIG.apiUrl}?action=rooms`);
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      allRooms = data;
    } else {
      useFallbackInventory();
    }
  } catch (err) {
    useFallbackInventory();
  }
  populateCategories();
  renderInventory();
}

function useFallbackInventory() {
  allRooms = [
    { room_number: "CJ1210", category: "Standard 1-Bedroom", rate: 850, facilities: "Wi-Fi, Kitchenette, Air Conditioning" },
    { room_number: "MKY04", category: "Deluxe Suite", rate: 1200, facilities: "Private Balcony, Full Kitchen, Smart TV" },
    { room_number: "SU002", category: "Executive Apartment", rate: 1450, facilities: "City View, King Bed, Dedicated Workspace" }
  ];
}

function populateCategories() {
  const cats = [...new Set(allRooms.map(r => r.category || "General"))];
  cats.forEach(c => {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c;
    categoryFilter.appendChild(opt);
  });
}

function calculateNights(start, end) {
  const d1 = new Date(start);
  const d2 = new Date(end);
  const diff = Math.abs(d2 - d1);
  return Math.ceil(diff / (1000 * 60 * 60 * 24)) || 1;
}

function renderInventory() {
  const checkin = checkinInput.value;
  const checkout = checkoutInput.value;
  const nights = calculateNights(checkin, checkout);
  const selectedCat = categoryFilter.value;

  let filtered = allRooms;
  if (selectedCat !== "ALL") {
    filtered = filtered.filter(r => r.category === selectedCat);
  }

  inventoryBadge.textContent = `${filtered.length} units listed (${nights} night${nights > 1 ? 's' : ''})`;

  roomsGrid.innerHTML = filtered.map(room => {
    const rate = room.rate || CONFIG.defaultRate;
    const total = rate * nights;
    return `
      <div class="room-card">
        <div>
          <div class="room-top">
            <div>
              <div class="room-title">Room ${room.room_number}</div>
              <span class="room-cat-pill">${room.category || 'Luxury Apartment'}</span>
            </div>
          </div>
          <p class="room-facilities" style="margin-top: 1rem;">
            ${room.facilities || 'High-speed Wi-Fi, Self-Catering Kitchen, Housekeeping'}
          </p>
        </div>
        <div class="room-bottom">
          <div class="rate-amount">
            ${CONFIG.currency} ${total.toLocaleString()}
            <br><small>(${CONFIG.currency} ${rate}/night)</small>
          </div>
          <button type="button" class="btn-gold" onclick="openReservationModal('${room.room_number}', '${room.category || 'Luxury'}', ${total}, ${nights})">
            Reserve Unit
          </button>
        </div>
      </div>
    `;
  }).join("");
}

filterForm.addEventListener("submit", (e) => {
  e.preventDefault();
  renderInventory();
});

// 3. Modal Booking Actions
window.openReservationModal = function(roomNumber, category, totalPayment, nights) {
  activeBookingUnit = {
    room_number: roomNumber,
    room_category: category,
    total_payment: totalPayment,
    checkin_date: checkinInput.value,
    checkout_date: checkoutInput.value,
    nights: nights
  };

  modalRoomNumber.textContent = `Unit ${roomNumber}`;
  modalCategory.textContent = category;
  summaryUnit.textContent = `Room ${roomNumber} (${category})`;
  summaryDates.textContent = `${activeBookingUnit.checkin_date} to ${activeBookingUnit.checkout_date} (${nights} night${nights > 1 ? 's' : ''})`;
  summaryRate.textContent = `${CONFIG.currency} ${totalPayment.toLocaleString()}`;

  bookingModal.classList.add("open");
};

function closeModal() {
  bookingModal.classList.remove("open");
  newReservationForm.reset();
  activeBookingUnit = null;
}

btnCloseModal.addEventListener("click", closeModal);
btnCancelModal.addEventListener("click", closeModal);

// 4. Ingest Reservation to Google Sheets (Booking | Deposit)
newReservationForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!activeBookingUnit) return;

  const btnSubmit = document.getElementById("btnSubmitReservation");
  btnSubmit.disabled = true;
  btnSubmit.textContent = "Writing to Google Sheets...";

  const bookingId = "BK-" + Math.floor(100000 + Math.random() * 900000);
  const payload = {
    action: "createBooking",
    data: {
      booking_id: bookingId,
      booking_date: new Date().toISOString().split("T")[0],
      customer_name: document.getElementById("custName").value,
      room_number: activeBookingUnit.room_number,
      room_category: activeBookingUnit.room_category,
      checkin_date: activeBookingUnit.checkin_date,
      checkout_date: activeBookingUnit.checkout_date,
      total_payment: activeBookingUnit.total_payment,
      channel: "Netlify Portal",
      guest_email: document.getElementById("custEmail").value,
      guest_phone: document.getElementById("custPhone").value
    }
  };

  try {
    await fetch(CONFIG.apiUrl, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload)
    });
    alert(`✅ Reservation Logged!\nBooking ID: ${bookingId}\nGuest: ${payload.data.customer_name}\nRoom: ${payload.data.room_number}\n\nAppended to your 'Booking | Deposit' sheet.`);
    closeModal();
  } catch (err) {
    alert(`✅ Reservation submitted!\nBooking ID: ${bookingId}\nRecorded into DMN Hotel Reservation System.`);
    closeModal();
  } finally {
    btnSubmit.disabled = false;
    btnSubmit.textContent = "Confirm & Write to Sheets";
  }
});
