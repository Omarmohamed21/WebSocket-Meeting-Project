document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "/pages/login.html";
    return;
  }

  fetchUsers(token);

  // 🔍 SEARCH LISTENER
  let searchTimeout;
  const searchInput = document.getElementById("searchInput");

  searchInput.addEventListener("input", (e) => {
    clearTimeout(searchTimeout);

    searchTimeout = setTimeout(() => {
      const keyword = e.target.value.trim();

      if (!keyword) {
        fetchUsers(token);
      } else {
        searchUsers(keyword, token);
      }
    }, 300);
  });
});

/* ===============================
   FETCH ALL USERS
================================ */
async function fetchUsers(token) {
  try {
    const res = await fetch("http://localhost:3000/user/allUsers", {
      headers: { token },
    }); 

    const data = await res.json();

    if (!res.ok) {
      renderUsers([]);
      return;
    }

    renderUsers(data.results);
  } catch (err) {
    console.error(err);
  }
}

/* ===============================
   SEARCH USERS
   (MATCHES YOUR API)
================================ */
async function searchUsers(keyword, token) {
  try {
    const res = await fetch(
      `http://localhost:3000/user/search?q=${encodeURIComponent(keyword)}`,
      {
        headers: { token },
      }
    );

    const data = await res.json();

    if (!res.ok) {
      renderUsers([]);
      return;
    }

    renderUsers(data.result);
  } catch (err) {
    console.error(err);
  }
}

/* ===============================
   RENDER USERS
================================ */
function renderUsers(users) {
  const tbody = document.getElementById("usersBody");
  tbody.innerHTML = "";

  if (!users || users.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center; padding:20px;">
          No users found
        </td>
      </tr>
    `;
    return;
  }

  users.forEach((user) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${user.name || "-"}</td>
      <td>${user.username || "-"}</td>
      <td>${user.role || "-"}</td>
      <td>${user.rank || "-"}</td>
      <td>${user.job || "-"}</td>
      <td>${user.slug || "-"}</td>
      <td>
        <button onclick="event.stopPropagation(); editUser('${user._id}')">
          Edit
        </button>
        <button onclick="event.stopPropagation(); deleteUser('${user._id}')">
          Delete
        </button>
      </td>
    `;

    // CLICK ROW → EDIT
    tr.addEventListener("click", () => {
      window.location.href = `/pages/superAdmin/editUsers.html?id=${user._id}`;
    });

    tbody.appendChild(tr);
  });
}

/* ===============================
   EDIT USER
================================ */
function editUser(id) {
  window.location.href = `/pages/superAdmin/editUsers.html?id=${id}`;
}

/* ===============================
   DELETE USER
================================ */
async function deleteUser(id) {
  if (!confirm("Are you sure you want to delete this user?")) return;

  const token = localStorage.getItem("token");

  try {
    const res = await fetch(`http://localhost:3000/user/deleteUser/${id}`, {
      method: "DELETE",
      headers: { token },
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Delete failed");
      return;
    }

    fetchUsers(token);
  } catch (err) {
    console.error(err);
  }
}
