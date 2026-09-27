/**
 * DMN City Apartments — Canvas Landing Page Controller
 * Direct counterpart to Canvas ID 631237757
 */

document.addEventListener("DOMContentLoaded", () => {
  const btnLoginDialog = document.getElementById("btnLoginDialog");
  const loginModal = document.getElementById("loginModal");
  const btnCloseModal = document.getElementById("btnCloseModal");
  const authForm = document.getElementById("authForm");
  const btnSubmitAuth = document.getElementById("btnSubmitAuth");

  // Open Dialogue Box on Click
  btnLoginDialog.addEventListener("click", () => {
    loginModal.classList.add("open");
    document.getElementById("staffId").focus();
  });

  // Close Dialogue Box
  btnCloseModal.addEventListener("click", () => {
    loginModal.classList.remove("open");
  });

  // Close when clicking outside dialogue card
  loginModal.addEventListener("click", (e) => {
    if (e.target === loginModal) {
      loginModal.classList.remove("open");
    }
  });

  // Handle ESC key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && loginModal.classList.contains("open")) {
      loginModal.classList.remove("open");
    }
  });

  // Authenticate & Connect
  authForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const staffId = document.getElementById("staffId").value.trim();
    
    btnSubmitAuth.disabled = true;
    btnSubmitAuth.innerHTML = "<span>Authenticating...</span>";

    setTimeout(() => {
      alert(`Welcome, ${staffId}. Synchronizing with DMN Hotel Res System 2026...`);
      btnSubmitAuth.disabled = false;
      btnSubmitAuth.innerHTML = `
        <span>Authorized</span>
        <svg viewBox="0 0 20 20" fill="currentColor" class="submit-arrow">
          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
        </svg>
      `;
      loginModal.classList.remove("open");
    }, 700);
  });
});
