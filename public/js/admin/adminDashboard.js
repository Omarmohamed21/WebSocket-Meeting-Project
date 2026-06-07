const token = localStorage.getItem("token");
const container = document.getElementById("visitsContainer");
const searchInput = document.getElementById("searchInput");
const ringBtn = document.getElementById("ringAllBtn");

/* ---------- SOCKET ---------- */
const socket = io("http://localhost:3000", {
  extraHeaders: { token },
});

/* ---------- SOUNDS ---------- */
const newVisitSound = new Audio("/sound/alert.mp3");

/* ---------- STATE ---------- */
let currentVisits = [];

/* ---------- HELPERS ---------- */
function formatGroupDate(dateStr) {
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toDateString();
}

/* ---------- RENDER ---------- */
function renderVisitsGrouped(visits = []) {
  container.innerHTML = "";
  currentVisits = visits;

  if (!visits.length) {
    container.innerHTML = `<p class="empty">No visits found</p>`;
    return;
  }

  const groups = {};

  visits.forEach((v) => {
    const key = formatGroupDate(v.createdAt);
    if (!groups[key]) groups[key] = [];
    groups[key].push(v);
  });

  Object.keys(groups).forEach((date) => {
    const section = document.createElement("div");
    section.className = "date-group";

    section.innerHTML = `
      <div class="date-title">${date}</div>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Rank</th>
            <th>Job</th>
            <th>Unit</th>
            <th>Note</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${groups[date]
            .map((v) => {
              const finished = v.isFinished === true;

              return `
              <tr data-id="${v._id}">
                <td>${v.vName}</td>
                <td>${v.vRank}</td>
                <td>${v.vJob}</td>
                <td>${v.unit}</td>
                <td class="note">${v.note || "-"}</td>
                <td>
                  <span class="badge ${v.status || "pending"}">
                    ${v.status || "pending"}
                  </span>
                </td>
                <td class="actions">
                  ${
                    !finished
                      ? `
                    <button class="accept" onclick="respond('${v._id}','accepted')">Accept</button>
                    <button class="reject" onclick="respond('${v._id}','rejected')">Reject</button>
                    <button class="finish" onclick="finishVisit('${v._id}')">Finish</button>
                  `
                      : `
                  `
                  }
                </td>
              </tr>
            `;
            })
            .join("")}
        </tbody>
      </table>
    `;

    container.appendChild(section);
  });
}

/* ---------- LOAD VISITS ---------- */
async function loadVisits() {
  try {
    const res = await fetch("http://localhost:3000/visit/adminVisits", {
      headers: { token },
    });

    const data = await res.json();

    if (!res.ok) {
      renderVisitsGrouped([]);
      return;
    }

    renderVisitsGrouped(data.result || []);
  } catch (err) {
    console.error(err);
    renderVisitsGrouped([]);
  }
}

/* ---------- SOCKET EVENTS ---------- */

// 🔔 زيارة جديدة
socket.on("newVisit", () => {
  newVisitSound.play().catch(() => {});
  loadVisits();
});

// ✅ Accept / Reject / Finish → تحديث فوري للأدمن
socket.on("adminVisitUpdated", ({ visitId, status }) => {
  const row = document.querySelector(`tr[data-id="${visitId}"]`);
  if (!row) return;

  // 🔚 Finish → حذف الزيارة فورًا
  if (status === "finished") {
    currentVisits = currentVisits.filter((v) => v._id !== visitId);
    renderVisitsGrouped(currentVisits);
    return;
  }

  // ✅ Update status
  const badge = row.querySelector(".badge");
  badge.className = `badge ${status}`;
  badge.textContent = status;
});

/* ---------- ACTIONS ---------- */
function respond(visitId, status) {
  socket.emit("visitResponse", { visitId, status });
}

function finishVisit(visitId) {
  socket.emit("visitEnding", { visitId, isFinished: true });
}

/* ---------- DELETE VISIT (REST ONLY) ---------- */
/*async function deleteVisit(visitId) {
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

    currentVisits = currentVisits.filter((v) => v._id !== visitId);
    renderVisitsGrouped(currentVisits);
  } catch (err) {
    console.error(err);
  }
}*/

/* ---------- RING ALL USERS ---------- */
ringBtn.addEventListener("click", () => {
  if (!currentVisits.length) return;

  const users = [...new Set(currentVisits.map((v) => v.user).filter(Boolean))];
  users.forEach((userId) => {
    socket.emit("ringUser", { toUserId: userId });
  });
});

/* ---------- SEARCH ---------- */
let t;
searchInput.addEventListener("input", () => {
  clearTimeout(t);

  t = setTimeout(async () => {
    const q = searchInput.value.trim();

    if (!q) {
      loadVisits();
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:3000/visit/adminSearch?q=${encodeURIComponent(q)}`,
        { headers: { token } }
      );

      const data = await res.json();

      if (!res.ok) {
        renderVisitsGrouped([]);
        return;
      }

      renderVisitsGrouped(data.result || []);
    } catch (err) {
      console.error(err);
      renderVisitsGrouped([]);
    }
  }, 400);
});

/* ---------- INIT ---------- */
loadVisits();
