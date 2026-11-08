/* Along Digital - Supabase Authentication
   Publishable key is intended for browser use. Keep RLS enabled on database tables.
*/
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "https://ueipsvlziqeswmtnasbk.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_SVTnqZGDh0vKHuGh42lzyw_iAOSi4y7";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

const $ = (id) => document.getElementById(id);
const showMessage = (message) => window.alert(message);

function setBusy(button, busy, busyText = "Please wait...") {
  if (!button) return;
  if (busy) {
    button.dataset.originalText = button.textContent.trim();
    button.disabled = true;
    button.textContent = busyText;
  } else {
    button.disabled = false;
    if (button.dataset.originalText) button.textContent = button.dataset.originalText;
  }
}

function setupPasswordToggles() {
  document.querySelectorAll("#togglePassword, .show-password").forEach((button) => {
    button.addEventListener("click", () => {
      const targetId = button.dataset.target || "password";
      const input = $(targetId);
      if (!input) return;
      const show = input.type === "password";
      input.type = show ? "text" : "password";
      button.textContent = show ? "Hide" : "Show";
    });
  });
}

async function setupSignup() {
  const form = $("signupForm");
  if (!form) return;

  const fullName = $("fullName");
  const email = $("email");
  const mobile = $("mobile");
  const password = $("password");
  const confirmPassword = $("confirmPassword");
  const terms = $("termsAccepted");
  const button = form.querySelector('button[type="submit"]');

  mobile?.addEventListener("input", function () {
    this.value = this.value.replace(/\D/g, "").slice(0, 10);
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const nameValue = fullName.value.trim();
    const emailValue = email.value.trim();
    const mobileValue = mobile.value.trim();

    if (nameValue.length < 2) return showMessage("Please enter your full name.");
    if (!email.validity.valid) return showMessage("Please enter a valid email address.");
    if (mobileValue && !/^[0-9]{10}$/.test(mobileValue)) return showMessage("Mobile number must contain exactly 10 digits.");
    if (password.value.length < 8) return showMessage("Password must contain at least 8 characters.");
    if (password.value !== confirmPassword.value) return showMessage("Passwords do not match.");
    if (!terms.checked) return showMessage("Please accept the Terms & Conditions.");

    setBusy(button, true, "Creating account...");
    const { data, error } = await supabase.auth.signUp({
      email: emailValue,
      password: password.value,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/login.html`,
        data: {
          full_name: nameValue,
          mobile: mobileValue || null
        }
      }
    });
    setBusy(button, false);

    if (error) {
      showMessage(error.message);
      return;
    }

    if (data.session) {
      showMessage("Account created successfully. You are now signed in.");
    } else {
      showMessage("Account created. Please check your email and click the confirmation link before logging in.");
    }
    form.reset();
  });
}

async function setupLogin() {
  const form = $("loginForm");
  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = $("email");
    const password = $("password");
    const button = form.querySelector('button[type="submit"]');

    if (!email.value.trim() || !password.value) return showMessage("Please enter your email and password.");
    if (!email.validity.valid) return showMessage("Please enter a valid email address.");

    setBusy(button, true, "Signing in...");
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.value.trim(),
      password: password.value
    });
    setBusy(button, false);

    if (error) {
      showMessage(error.message);
      return;
    }

    showMessage("Login successful. Welcome to AlongDigital!");
    // Dashboard destination can be changed when its page is ready.
    console.info("Signed in user:", data.user?.id);
  });
}

async function setupForgotPassword() {
  const form = $("forgotPasswordForm");
  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = $("email");
    const button = form.querySelector('button[type="submit"]');

    if (!email.validity.valid) {
      showMessage("Please enter a valid email address.");
      email.focus();
      return;
    }

    setBusy(button, true, "Sending link...");
    const { error } = await supabase.auth.resetPasswordForEmail(email.value.trim(), {
      redirectTo: `${window.location.origin}/auth/login.html?mode=reset`
    });
    setBusy(button, false);

    if (error) {
      showMessage(error.message);
      return;
    }
    showMessage("If an account exists for that email, a password reset link has been sent. Please check your inbox.");
    form.reset();
  });
}

async function setupPasswordRecovery() {
  const isRecovery = new URLSearchParams(window.location.search).get("mode") === "reset"
    || window.location.hash.includes("type=recovery");
  if (!isRecovery || !$("loginForm")) return;

  const card = document.querySelector(".login-card");
  if (!card) return;

  card.innerHTML = `
    <div class="heading">
      <h1>Set New Password</h1>
      <p>Choose a new password for your AlongDigital account.</p>
    </div>
    <form id="newPasswordForm">
      <div class="form-group">
        <label for="newPassword">New Password</label>
        <div class="password-box">
          <input type="password" id="newPassword" minlength="8" autocomplete="new-password" required>
          <button type="button" class="show-password" id="toggleNewPassword">Show</button>
        </div>
      </div>
      <div class="form-group">
        <label for="confirmNewPassword">Confirm New Password</label>
        <input type="password" id="confirmNewPassword" minlength="8" autocomplete="new-password" required>
      </div>
      <button type="submit" class="login-btn">Update Password</button>
    </form>
    <div class="signup-link"><a href="login.html">Back to Login</a></div>
  `;

  $("toggleNewPassword").addEventListener("click", () => {
    const input = $("newPassword");
    const show = input.type === "password";
    input.type = show ? "text" : "password";
    $("toggleNewPassword").textContent = show ? "Hide" : "Show";
  });

  $("newPasswordForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const newPassword = $("newPassword").value;
    const confirm = $("confirmNewPassword").value;
    if (newPassword.length < 8) return showMessage("Password must contain at least 8 characters.");
    if (newPassword !== confirm) return showMessage("Passwords do not match.");

    const button = event.currentTarget.querySelector('button[type="submit"]');
    setBusy(button, true, "Updating...");
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setBusy(button, false);

    if (error) {
      showMessage(error.message);
      return;
    }
    showMessage("Password updated successfully. Please log in with your new password.");
    window.location.href = "login.html";
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  setupPasswordToggles();
  await setupPasswordRecovery();
  await setupSignup();
  await setupLogin();
  await setupForgotPassword();
});
