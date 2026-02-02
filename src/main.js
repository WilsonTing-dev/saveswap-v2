import "./style.css";
import { login, register, logout, watchAuth } from "./auth";
import {
  createItem,
  watchAvailableItems,
  watchMyItems,
  deleteItem,
  setItemStatus,
} from "./items";
import {
  createRequest,
  watchIncomingRequests,
  watchMyRequests,
  acceptRequest,
  rejectRequest,
} from "./requests";

const appEl = document.querySelector("#app");

function esc(s = "") {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function itemCard(item, currentUserId) {
  const isMine = item.ownerId === currentUserId;
  const requestBtn = isMine
    ? `<span style="opacity:.7; font-size:12px;">(Your item)</span>`
    : `<button type="button" data-request="${esc(item.id)}" data-owner="${esc(
        item.ownerId
      )}">Request Swap</button>`;

  return `
    <div class="card" style="text-align:left; margin-top:12px;">
      <div style="display:flex; justify-content:space-between; gap:12px; align-items:start;">
        <div style="flex:1;">
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
            ${requestBtn}
          </div>
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
        <div style="flex:1;">
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

function requestRowIncoming(req) {
  const canAct = req.status === "pending";
  return `
    <div class="card" style="text-align:left; margin-top:12px;">
      <div style="display:flex; justify-content:space-between; gap:12px; align-items:start;">
        <div style="flex:1;">
          <h3 style="margin:0 0 6px 0;">Incoming Request</h3>
          <div style="opacity:.85; font-size:14px;">
            <b>Status:</b> ${esc(req.status)}
          </div>
          <div style="opacity:.85; font-size:14px; margin-top:4px;">
            <b>Item ID:</b> ${esc(req.itemId)}
          </div>
          <div style="opacity:.85; font-size:14px; margin-top:4px;">
            <b>Requester ID:</b> ${esc(req.requesterId)}
          </div>

          <div style="display:flex; gap:10px; align-items:center; margin-top:10px;">
            ${
              canAct
                ? `<button data-accept="${esc(req.id)}" type="button">Accept</button>
                   <button data-reject="${esc(req.id)}" type="button">Reject</button>`
                : `<span style="opacity:.7;">No actions</span>`
            }
          </div>
        </div>
      </div>
    </div>
  `;
}

function requestRowOutgoing(req) {
  return `
    <div class="card" style="text-align:left; margin-top:12px;">
      <div style="display:flex; justify-content:space-between; gap:12px; align-items:start;">
        <div style="flex:1;">
          <h3 style="margin:0 0 6px 0;">My Request</h3>
          <div style="opacity:.85; font-size:14px;">
            <b>Status:</b> ${esc(req.status)}
          </div>
          <div style="opacity:.85; font-size:14px; margin-top:4px;">
            <b>Item ID:</b> ${esc(req.itemId)}
          </div>
          <div style="opacity:.85; font-size:14px; margin-top:4px;">
            <b>Owner ID:</b> ${esc(req.itemOwnerId)}
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderLoggedOut() {
  appEl.innerHTML = `
    <div class="card">
      <h2>Save&Swap v2 — Auth + Items + Requests</h2>

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

let unsubMarket = null;
let unsubMine = null;
let unsubIncoming = null;
let unsubOutgoing = null;

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
      <h2 style="margin-top:0;">Incoming Requests (for your items)</h2>
      <div id="incomingList" style="margin-top:8px;"></div>
      <div id="incomingMsg" style="margin-top:10px; opacity:.85;"></div>
    </div>

    <div class="card" style="text-align:left; margin-top:12px;">
      <h2 style="margin-top:0;">My Requests</h2>
      <div id="outgoingList" style="margin-top:8px;"></div>
    </div>

    <div class="card" style="text-align:left; margin-top:12px;">
      <h2 style="margin-top:0;">My Listings</h2>
      <div id="myItemsList" style="margin-top:8px;"></div>
      <div id="myMsg" style="margin-top:10px; opacity:.85;"></div>
    </div>

    <div class="card" style="text-align:left; margin-top:12px;">
      <h2 style="margin-top:0;">Marketplace (Available Items)</h2>
      <div id="marketList" style="margin-top:8px;"></div>
      <div id="marketMsg" style="margin-top:10px; opacity:.85;"></div>
    </div>
  `;

  document.querySelector("#logoutBtn").addEventListener("click", async () => {
    await logout();
  });

  const itemMsg = document.querySelector("#itemMsg");
  const myItemsList = document.querySelector("#myItemsList");
  const myMsg = document.querySelector("#myMsg");
  const marketList = document.querySelector("#marketList");
  const marketMsg = document.querySelector("#marketMsg");

  const incomingList = document.querySelector("#incomingList");
  const incomingMsg = document.querySelector("#incomingMsg");
  const outgoingList = document.querySelector("#outgoingList");

  const showItemMsg = (t) => (itemMsg.textContent = t);
  const showMyMsg = (t) => (myMsg.textContent = t);
  const showMarketMsg = (t) => (marketMsg.textContent = t);
  const showIncomingMsg = (t) => (incomingMsg.textContent = t);

  // Create item
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
  if (unsubMine) unsubMine();
  unsubMine = watchMyItems(user.uid, (items) => {
    if (!items.length) {
      myItemsList.innerHTML = `<div style="opacity:.8;">You have no listings yet.</div>`;
      return;
    }
    myItemsList.innerHTML = items.map(myItemRow).join("");

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

  // Marketplace subscription + request
  if (unsubMarket) unsubMarket();
  unsubMarket = watchAvailableItems((items) => {
    if (!items.length) {
      marketList.innerHTML = `<div style="opacity:.8;">No available items yet.</div>`;
      return;
    }

    marketList.innerHTML = items.map((it) => itemCard(it, user.uid)).join("");

    document.querySelectorAll("button[data-request]").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const itemId = e.target.getAttribute("data-request");
        const ownerId = e.target.getAttribute("data-owner");

        showMarketMsg("Sending request...");
        try {
          await createRequest({
            itemId,
            itemOwnerId: ownerId,
            requesterId: user.uid,
          });
          showMarketMsg("✅ Request sent!");
        } catch (err) {
          showMarketMsg(`❌ ${err.code || "error"}: ${err.message}`);
        }
      });
    });
  });

  // Incoming requests subscription
  if (unsubIncoming) unsubIncoming();
  unsubIncoming = watchIncomingRequests(user.uid, (reqs) => {
    if (!reqs.length) {
      incomingList.innerHTML = `<div style="opacity:.8;">No incoming requests yet.</div>`;
      return;
    }

    incomingList.innerHTML = reqs.map(requestRowIncoming).join("");

    // ACCEPT: now also sets item -> pending
    document.querySelectorAll("button[data-accept]").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const requestId = e.target.getAttribute("data-accept");
        showIncomingMsg("Accepting...");
        try {
          const itemId = reqs.find((r) => r.id === requestId)?.itemId;
          await acceptRequest(requestId, itemId);
          showIncomingMsg("✅ Accepted (item set to pending)");
        } catch (err) {
          showIncomingMsg(`❌ ${err.code || "error"}: ${err.message}`);
        }
      });
    });

    document.querySelectorAll("button[data-reject]").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const requestId = e.target.getAttribute("data-reject");
        showIncomingMsg("Rejecting...");
        try {
          await rejectRequest(requestId);
          showIncomingMsg("✅ Rejected");
        } catch (err) {
          showIncomingMsg(`❌ ${err.code || "error"}: ${err.message}`);
        }
      });
    });
  });

  // Outgoing requests subscription
  if (unsubOutgoing) unsubOutgoing();
  unsubOutgoing = watchMyRequests(user.uid, (reqs) => {
    if (!reqs.length) {
      outgoingList.innerHTML = `<div style="opacity:.8;">You have not requested any swaps yet.</div>`;
      return;
    }
    outgoingList.innerHTML = reqs.map(requestRowOutgoing).join("");
  });
}

watchAuth((user) => {
  if (!user) {
    if (unsubMarket) unsubMarket();
    if (unsubMine) unsubMine();
    if (unsubIncoming) unsubIncoming();
    if (unsubOutgoing) unsubOutgoing();
    unsubMarket = null;
    unsubMine = null;
    unsubIncoming = null;
    unsubOutgoing = null;
    renderLoggedOut();
    return;
  }
  renderLoggedIn(user);
});
