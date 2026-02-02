import "./style.css";
import { login, register, logout, watchAuth } from "./auth";

const appEl = document.querySelector("#app");

function render(user) {
  if (user) {
    appEl.innerHTML = `
      <div class="card">
        <h2>✅ Logged in</h2>
        <p><b>Email:</b> ${user.email}</p>
        <button id="logoutBtn">Logout</button>
      </div>
    `;

    document.querySelector("#logoutBtn").addEventListener("click", async () => {
      await logout();
    });

    return;
  }

  appEl.innerHTML = `
    <div class="card">
      <h2>Save&Swap v2 — Auth Test</h2>

      <div style="display:grid; gap:10px; max-width:360px;">
        <label>
          Email
          <input id="email" type="email" placeholder="you@example.com" />
        </label>

        <label>
          Password
          <input id="password" type="password" placeholder="min 6 characters" />
        </label>

        <div style="display:flex; gap:10px;">
          <button id="registerBtn" type="button">Register</button>
          <button id="loginBtn" type="button">Login</button>
        </div>

        <p id="msg" style="margin:0;"></p>
      </div>
    </div>
  `;

  const emailEl = document.querySelector("#email");
  const passEl = document.querySelector("#password");
  const msgEl = document.querySelector("#msg");

  const showMsg = (text) => {
    msgEl.textContent = text;
  };

  document.querySelector("#registerBtn").addEventListener("click", async () => {
    console.log("REGISTER clicked");
    showMsg("Registering...");
    try {
      await register(emailEl.value.trim(), passEl.value);
      showMsg("✅ Registered and logged in!");
    } catch (e) {
      showMsg(`❌ ${e.code || "error"}: ${e.message}`);
    }
  });

  document.querySelector("#loginBtn").addEventListener("click", async () => {
    console.log("LOGIN clicked");
    showMsg("Logging in...");
    try {
      await login(emailEl.value.trim(), passEl.value);
      showMsg("✅ Logged in!");
    } catch (e) {
      showMsg(`❌ ${e.code || "error"}: ${e.message}`);
    }
  });
}

watchAuth((user) => {
  render(user);
});
