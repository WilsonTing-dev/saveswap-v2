import "./style.css";
import { login, register, logout, watchAuth } from "./auth";
import {
  createItem,
  watchAvailableItems,
  watchMyItems,
  deleteItem,
  setItemStatus,
} from "./items";

const appEl = document.querySelector("#app");

function esc(s = "") {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function itemCard(item) {
  return `
    <div class="card" style="text-align:left; margin-top:12px;">
      <div style="display:flex; justify-content:space-between; gap:12px; align-items:start;">
        <div>
          <h3 style="margin:0 0 6px 0;">${esc(item.title)}</h3>
          <div style="opacity:.8; font-size:14px;">
            <b>Category:</b> ${esc(item.category)} ·
            Marketplace shows: <b>available</b> only
          </div>
          <div style="opacity:.8; font-size:14px; margin-top:4px;">
            <b>Condition:</b> ${esc(item.condition)} ·
            <b>Location:</b> ${esc(item.locationText || "-")}
          </div>
          <p style="margin:10px 0; white-space:pre-wrap;">${esc(item.description)}</p>
        </div>
        <div style="opacity:.7; font-size:12px; white-space:nowrap;">
          ${esc(item.status)}
        </div>
      </div>
    </div>
  `;
}

function myItemRow(item) {
  const id = esc(item.id);
  return `
    <div class="card" style="text-align:left; margin-top:12px;">
      <div style="display:flex; justify-content:space-between; gap:12px; align-items:start;">
        <div>
          <h3 style="margin:0 0 6px 0;">${esc(item.title)}</h3>
          <div style="opacity:.8; font-size:14px;">
            <b>Category:</b> ${esc(item.category)} ·
            <b>Condition:</b> ${esc(item.condition)}
          </div>
          <div style="opacity:.8; font-size:14px; margin-top:4px;">
            <b>Location:</b> ${esc(item.locationText || "-")}
          </div>
          <p style="margin:10px 0; white-space:pre-wrap;">${esc(item.description)}</p>

          <div style="display:flex; gap:10px; align-items:center; flex-wrap:wrap;">
            <label style="display:flex; gap:8px; align-items:center;">
              <span style="opacity:.85;">Status</span>
              <select data-status="${id}">
                <option value="available" ${item.status === "available" ? "selected" : ""}>available</option>
                <option value="pending" ${item.status === "pending" ? "selected" : ""}>pending</option>
                <option value="swapped" ${item.status === "swapped" ? "selected" : ""}>swapped</option>
              </select>
            </label>

            <button data-delete="${id}" type="button">Delete</button>
          </div>
        </div>

        <div style="opacity:.7; font-size:12px; white-space:nowrap;">
          ${esc(item.status)}
        </div>
      </div>
    </div>
  `;
}

function renderLoggedOut() {
  appEl.innerHTML = `
    <div class="card">
      <h2>Save&Swap v2 — Auth + Items</h2>

      <div style="display:grid; gap:10px; max-width:360px; margin: 0 auto;">
        <label>
          Email
          <input id="email" type="email" placeholder="you@example.com" />
        </label>

        <label>
          Password
          <input id="password" type="password" placeholder="min 6 characters" />
        </label>

        <div style="display:flex; gap:10px; justify-content:center;">
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

  const showMsg = (text) => (msgEl.textContent = text);

  document.querySelector("#registerBtn").addEventListener("click", async () => {
    showMsg("Registering...");
    try {
      await register(emailEl.value.trim(), passEl.value);
      showMsg("✅ Registered and logged in!");
    } catch (e) {
      showMsg(`❌ ${e.code || "error"}: ${e.message}`);
    }
  });

  document.querySelector("#loginBtn").addEventListener("click", async () => {
    showMsg("Logging in...");
    try {
      await login(emailEl.value.trim(), passEl.value);
      showMsg("✅ Logged in!");
    } catch (e) {
      showMsg(`❌ ${e.code || "error"}: ${e.message}`);
    }
  });
}

let unsubscribeMarket = null;
let unsubscribeMine = null;

function renderLoggedIn(user) {
  appEl.innerHTML = `
    <div class="card">
      <div style="display:flex; justify-content:space-between; align-items:center; gap:12px;">
        <div style="text-align:left;">
          <h2 style="margin:0;">✅ Logged in</h2>
          <div style="opacity:.8; font-size:14px;"><b>Email:</b> ${esc(user.email)}</div>
        </div>
        <button id="logoutBtn">Logout</button>
      </div>
    </div>

    <div class="card" style="text-align:left; margin-top:12px;">
      <h2 style="margin-top:0;">Create Item</h2>

      <div style="display:grid; gap:10px; max-width:520px;">
        <label>
          Title
          <input id="title" type="text" placeholder="e.g. Winter Jacket" />
        </label>

        <label>
          Category
          <select id="category">
            <option value="Clothing">Clothing</option>
            <option value="Books">Books</option>
            <option value="Electronics">Electronics</option>
            <option value="Home">Home</option>
            <option value="Sports">Sports</option>
            <option value="Others">Others</option>
          </select>
        </label>

        <label>
          Condition
          <select id="condition">
            <option value="New">New</option>
            <option value="Like New">Like New</option>
            <option value="Good">Good</option>
            <option value="Fair">Fair</option>
          </select>
        </label>

        <label>
          Location (text)
          <input id="locationText" type="text" placeholder="e.g. Johor Bahru" />
        </label>

        <label>
          Description
          <textarea id="description" rows="4" placeholder="Describe your item..."></textarea>
        </label>

        <div style="display:flex; gap:10px; align-items:center;">
          <button id="createItemBtn" type="button">Post Item</button>
          <span id="itemMsg" style="opacity:.9;"></span>
        </div>
      </div>
    </div>

    <div class="card" style="text-align:left; margin-top:12px;">
      <h2 style="margin-top:0;">My Listings</h2>
      <div id="myItemsList" style="margin-top:8px;"></div>
      <div id="myMsg" style="margin-top:10px; opacity:.85;"></div>
    </div>

    <div class="card" style="text-align:left; margin-top:12px;">
      <h2 style="margin-top:0;">Marketplace (Available Items)</h2>
      <div id="marketList" style="margin-top:8px;"></div>
    </div>
  `;

  document.querySelector("#logoutBtn").addEventListener("click", async () => {
    await logout();
  });

  const itemMsg = document.querySelector("#itemMsg");
  const myItemsList = document.querySelector("#myItemsList");
  const myMsg = document.querySelector("#myMsg");
  const marketList = document.querySelector("#marketList");

  const showItemMsg = (t) => (itemMsg.textContent = t);
  const showMyMsg = (t) => (myMsg.textContent = t);

  document.querySelector("#createItemBtn").addEventListener("click", async () => {
    showItemMsg("Posting...");
    try {
      const title = document.querySelector("#title").value;
      const category = document.querySelector("#category").value;
      const condition = document.querySelector("#condition").value;
      const locationText = document.querySelector("#locationText").value;
      const description = document.querySelector("#description").value;

      if (!title.trim()) {
        showItemMsg("❌ Title is required");
        return;
      }

      await createItem({
        ownerId: user.uid,
        title,
        description,
        category,
        condition,
        locationText,
      });

      showItemMsg("✅ Item posted!");
      document.querySelector("#title").value = "";
      document.querySelector("#description").value = "";
      document.querySelector("#locationText").value = "";
    } catch (e) {
      showItemMsg(`❌ ${e.code || "error"}: ${e.message}`);
    }
  });

  // My listings subscription
  if (unsubscribeMine) unsubscribeMine();
  unsubscribeMine = watchMyItems(user.uid, (items) => {
    if (!items.length) {
      myItemsList.innerHTML = `<div style="opacity:.8;">You have no listings yet.</div>`;
      return;
    }
    myItemsList.innerHTML = items.map(myItemRow).join("");

    // Wire up status dropdowns
    document.querySelectorAll("select[data-status]").forEach((sel) => {
      sel.addEventListener("change", async (e) => {
        const itemId = e.target.getAttribute("data-status");
        const status = e.target.value;
        showMyMsg("Updating status...");
        try {
          await setItemStatus(itemId, status);
          showMyMsg("✅ Status updated");
        } catch (err) {
          showMyMsg(`❌ ${err.code || "error"}: ${err.message}`);
        }
      });
    });

    // Wire up delete buttons
    document.querySelectorAll("button[data-delete]").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const itemId = e.target.getAttribute("data-delete");
        const ok = confirm("Delete this item?");
        if (!ok) return;

        showMyMsg("Deleting...");
        try {
          await deleteItem(itemId);
          showMyMsg("✅ Deleted");
        } catch (err) {
          showMyMsg(`❌ ${err.code || "error"}: ${err.message}`);
        }
      });
    });
  });

  // Marketplace subscription (available only)
  if (unsubscribeMarket) unsubscribeMarket();
  unsubscribeMarket = watchAvailableItems((items) => {
    if (!items.length) {
      marketList.innerHTML = `<div style="opacity:.8;">No available items yet.</div>`;
      return;
    }
    marketList.innerHTML = items.map(itemCard).join("");
  });
}

watchAuth((user) => {
  if (!user) {
    if (unsubscribeMarket) unsubscribeMarket();
    if (unsubscribeMine) unsubscribeMine();
    unsubscribeMarket = null;
    unsubscribeMine = null;
    renderLoggedOut();
    return;
  }
  renderLoggedIn(user);
});
