const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwRFOvo3bPHohjOfsKndbMoAAdEESca56_EZA4OB35SSE7yTHtAHQ3aq1kYK8O54A4P/exec";

const form = document.getElementById("studentForm");
const submitBtn = document.getElementById("submitBtn");
const studentIdInput = document.getElementById("studentId");
const mobileInput = document.getElementById("mobile");

const popupOverlay = document.getElementById("popupOverlay");
const popupCard = document.getElementById("popupCard");
const popupIcon = document.getElementById("popupIcon");
const popupTitle = document.getElementById("popupTitle");
const popupText = document.getElementById("popupText");

// Digits only
function digitsOnly(input, limit) {
  input.addEventListener("input", function() {
    this.value = this.value.replace(/\D/g, "").slice(0, limit);
  });
}


digitsOnly(studentIdInput, 11);
digitsOnly(mobileInput, 10);

// Popup
function showPopup(type, title, text) {
  popupCard.className = "popup-card " + type;
  popupIcon.textContent = type === "success" ? "✓" : "!";
  popupTitle.textContent = title;
  popupText.textContent = text;
  popupOverlay.classList.add("show");
}

function closePopup() {
  popupOverlay.classList.remove("show");
}

popupOverlay.addEventListener("click", function(event) {
  if (event.target === popupOverlay) closePopup();
});

// Submit
form.addEventListener("submit", async function(event) {
  event.preventDefault();

  if (!form.reportValidity()) return;

  if (SCRIPT_URL === "YOUR_APPS_SCRIPT_WEB_APP_URL") {
    showPopup("error", "Setup Required",
      "Please add your Apps Script Web App URL first.");
    return;
  }

  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span class="loader"></span>Submitting...';

  try {
    const formData = new FormData(form);
    const body = new URLSearchParams(formData);

    const response = await fetch(SCRIPT_URL, {
      method: "POST",
      body: body
    });

    if (!response.ok) {
      throw new Error("Server response error. Please try again.");
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || "Registration failed.");
    }

    form.reset();

    showPopup(
      "success",
      "Registration Successful!",
      "Your data has been saved. Record Number: " + result.recordId
    );

  } catch (error) {
    showPopup(
      "error",
      "Submission Failed",
      error.message || "Something went wrong. Please try again."
    );

  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Submit Registration";
  }
});
  // CAPTCHA SYSTEM

let captchaCorrectAnswer = 0;

function generateCaptcha() {

  const first = Math.floor(Math.random() * 9) + 1;
  const second = Math.floor(Math.random() * 9) + 1;

  captchaCorrectAnswer = first + second;

  const question = document.getElementById("captchaQuestion");
  const answer = document.getElementById("captchaAnswer");

  question.textContent = first + " + " + second + " = ?";

  answer.value = "";
}

// Refresh CAPTCHA
document.getElementById("refreshCaptcha")
  .addEventListener("click", generateCaptcha);

// Generate first CAPTCHA
generateCaptcha();
