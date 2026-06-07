const params = new URLSearchParams(window.location.search);
const visitId = params.get("id");
const token = localStorage.getItem("token");

async function loadVisit() {
  const res = await fetch(
    `http://localhost:3000/visit/specificVisit/${visitId}`,
    { headers: { token } }
  );

  const data = await res.json();

  if (!res.ok) {
    alert(data.message || "Failed to load visit");
    return;
  }

  const visit = data.result.visit;

  vName.textContent = visit.vName || "-";
  vJob.textContent = visit.vJob || "-";
  vRank.textContent = visit.vRank || "-";
  unit.textContent = visit.unit || "-";
  status.textContent = visit.status || "-";
  isFinished.textContent = visit.isFinished ? "Yes" : "No";
  note.textContent = visit.note || "-";
}

loadVisit();
