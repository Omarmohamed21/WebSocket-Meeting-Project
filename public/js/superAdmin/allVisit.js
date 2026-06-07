document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "/pages/login.html";
    return;
  }

  fetchVisits(token);

  // 🔍 SEARCH
  let timer;
  document.getElementById("searchInput").addEventListener("input", (e) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      const q = e.target.value.trim();
      if (!q) fetchVisits(token);
      else searchVisits(q, token);
    }, 300);
  });
});

/* ===============================
   FETCH ALL VISITS
================================ */
async function fetchVisits(token) {
  try {
    const res = await fetch("http://localhost:3000/visit/allVisits", {
      headers: { token },
    });

    const data = await res.json();

    if (!res.ok) {
      renderVisits([]);
      return;
    }

    renderVisits(data.result);
  } catch (err) {
    console.error(err);
  }
}

/* ===============================
   SEARCH VISITS
================================ */
async function searchVisits(q, token) {
  try {
    const res = await fetch(
      `http://localhost:3000/visit/searchVisit?q=${encodeURIComponent(q)}`,
      { headers: { token } }
    );

    const data = await res.json();

    if (!res.ok) {
      renderVisits([]);
      return;
    }

    renderVisits(data.results.visits);
  } catch (err) {
    console.error(err);
  }
}

/* ===============================
   RENDER VISITS
================================ */
function renderVisits(visits) {
  const tbody = document.getElementById("visitsBody");
  tbody.innerHTML = "";

  if (!visits || visits.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center;padding:20px;">
          No visits found
        </td>
      </tr>`;
    return;
  }

  visits.forEach((visit) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${visit.vName || "-"}</td>
      <td>${visit.vJob || "-"}</td>
      <td>${visit.vRank || "-"}</td>
      <td>${visit.unit || "-"}</td>
      <td>${visit.status || "-"}</td>
      <td>${visit.isFinished ? "Yes" : "No"}</td>
      <td>
        <button onclick="event.stopPropagation(); viewVisit('${visit._id}')">
          View
        </button>
        <button onclick="event.stopPropagation(); deleteVisit('${visit._id}')">
          Delete
        </button>
      </td>
    `;

    // CLICK ROW → VIEW VISIT
    tr.onclick = () => {
      window.location.href = `/pages/superAdmin/editVisit.html?id=${visit._id}`;
    };

    tbody.appendChild(tr);
  });
}

/* ===============================
   VIEW VISIT
================================ */
function viewVisit(id) {
  window.location.href = `/pages/superAdmin/editVisit.html?id=${id}`;
}

/* ===============================
   DELETE VISIT
================================ */
async function deleteVisit(id) {
  if (!confirm("Delete this visit?")) return;

  const token = localStorage.getItem("token");

  try {
    const res = await fetch(`http://localhost:3000/visit/deleteVisit/${id}`, {
      method: "DELETE",
      headers: { token },
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Delete failed");
      return;
    }

    fetchVisits(token);
  } catch (err) {
    console.error(err);
  }
}
