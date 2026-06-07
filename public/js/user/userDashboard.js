/* =====================
   USER DASHBOARD
===================== */

const token = localStorage.getItem("token");
const container = document.getElementById("visitsContainer");
const form = document.getElementById("visitForm");

/* ---------- SOCKET ---------- */
const socket = io("http://localhost:3000", {
  extraHeaders: { token },
});

/* ---------- SOUNDS ---------- */
const sendSound = new Audio("/sound/send.mp3");
const acceptSound = new Audio("/sound/accepted.mp3");
const rejectSound = new Audio("/sound/rejected.mp3");
const finishSound = new Audio("/sound/finish.mp3");
const ringSound = new Audio("/sound/ring.mp3");

/* ---------- UNLOCK AUDIO (REQUIRED FOR CHROME) ---------- */
let audioUnlocked = false;

function unlockAudio() {
  if (audioUnlocked) return;

  ringSound
    .play()
    .then(() => {
      ringSound.pause();
      ringSound.currentTime = 0;
      audioUnlocked = true;
      console.log("🔊 Audio unlocked");
    })
    .catch(() => {});
}

document.addEventListener("click", unlockAudio, { once: true });

/* ---------- STATE ---------- */
let currentVisits = [];

/* ---------- HELPERS ---------- */
function formatDate(dateStr) {
  return new Date(dateStr).toLocaleString();
}

/* ---------- RENDER ---------- */
function renderVisits(visits = []) {
  container.innerHTML = "";
  currentVisits = visits;

  if (!visits.length) {
    container.innerHTML = `<p class="empty">No visits yet</p>`;
    return;
  }

  visits.forEach((v) => {
    const card = document.createElement("div");
    card.className = "visit-card";
    card.dataset.id = v._id;

    card.innerHTML = `
      <div class="visit-header">
        <span class="badge ${v.status || "pending"}">
          ${v.status || "pending"}
        </span>
        <span class="date">${formatDate(v.createdAt)}</span>
      </div>

      <div class="visit-body">
        <p><strong>Name:</strong> ${v.vName}</p>
        <p><strong>Rank:</strong> ${v.vRank}</p>
        <p><strong>Job:</strong> ${v.vJob}</p>
        <p><strong>Unit:</strong> ${v.unit}</p>
        <p><strong>Note:</strong> ${v.note || "-"}</p>
      </div>

      ${
        v.isFinished
          ? `
          <div class="visit-footer">
            <span class="finished">Visit Finished</span>
            <button class="delete-btn" onclick="deleteVisit('${v._id}')">
              Delete
            </button>
          </div>
        `
          : ""
      }
    `;

    container.appendChild(card);
  });
}

/* ---------- LOAD VISITS ---------- */
async function loadVisits() {
  try {
    const res = await fetch("http://localhost:3000/visit/userVisit", {
      headers: { token },
    });

    const data = await res.json();

    if (!res.ok) {
      renderVisits([]);
      return;
    }

    renderVisits(data.result || []);
  } catch (err) {
    console.error(err);
    renderVisits([]);
  }
}

/* ---------- SEND VISIT ---------- */
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const payload = {
    vName: document.getElementById("vName").value,
    vRank: document.getElementById("vRank").value,
    vJob: document.getElementById("vJob").value,
    unit: document.getElementById("unit").value,
    note: document.getElementById("note").value,
  };

  socket.emit("sendVisit", payload);
});

/* ---------- DELETE VISIT (NO SOCKET) ---------- */
async function deleteVisit(visitId) {
  if (!confirm("Are you sure you want to delete this visit?")) return;

  try {
    const res = await fetch(
      `http://localhost:3000/visit/deleteVisit/${visitId}`,
      {
        method: "DELETE",
        headers: { token },
      }
    );

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Delete failed");
      return;
    }

    // ✅ SAME AS USER MANAGEMENT
    currentVisits = currentVisits.filter((v) => v._id !== visitId);
    renderVisits(currentVisits);
  } catch (err) {
    console.error(err);
  }
}

/* ---------- SOCKET EVENTS ---------- */

socket.on("sendVisitSuccess", () => {
  sendSound.play().catch(() => {});
  form.reset();
  loadVisits();
});

socket.on("sendVisitError", (data) => {
  alert(data.message);
});

socket.on("receiveResponse", ({ status }) => {
  if (status === "accepted") acceptSound.play().catch(() => {});
  if (status === "rejected") rejectSound.play().catch(() => {});
  loadVisits();
});

socket.on("endVisit", () => {
  finishSound.play().catch(() => {});
  loadVisits();
});

socket.on("ringing", ({ message }) => {
  ringSound.play().catch(() => {});
  alert(message || "Admin is calling you");
});

/* ---------- INIT ---------- */
loadVisits();
