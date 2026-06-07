const params = new URLSearchParams(window.location.search);
const userId = params.get("id");
const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "/pages/login.html";
}

/* =====================
   TOAST HELPER
===================== */
const toast = document.getElementById("toast");

function showToast(message, type = "success") {
  toast.textContent = message;
  toast.className = `toast show ${type === "error" ? "error" : ""}`;

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2200);
}

/* =====================
   LOAD USER
===================== */
async function loadUser() {
  try {
    const res = await fetch(
      `http://localhost:3000/user/specificUser/${userId}`,
      {
        headers: { token },
      }
    );

    const data = await res.json();

    if (!res.ok) {
      showToast(data.message || "Failed to load user", "error");
      return;
    }

    const u = data.result;

    document.getElementById("name").value = u.name;
    document.getElementById("username").value = u.username;
    document.getElementById("job").value = u.job;
    document.getElementById("slug").value = u.slug;
    document.getElementById("role").value = u.role;
    document.getElementById("rank").value = u.rank;
  } catch (err) {
    showToast("Server error", "error");
  }
}

/* =====================
   SUBMIT FORM
===================== */
document.getElementById("editForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const body = {
    name: document.getElementById("name").value,
    username: document.getElementById("username").value,
    job: document.getElementById("job").value,
    slug: document.getElementById("slug").value,
    role: document.getElementById("role").value,
    rank: document.getElementById("rank").value,
    password: document.getElementById("password").value || undefined,
    confirmPassword:
      document.getElementById("confirmPassword").value || undefined,
  };

  try {
    const res = await fetch(
      `http://localhost:3000/user/updateUser/${userId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          token,
        },
        body: JSON.stringify(body),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      showToast(data.message || "Update failed", "error");
      return;
    }

    showToast("User updated successfully ✅");

    setTimeout(() => {
      window.location.href = "../../pages/superAdmin/allUsers.html";
    }, 2000);
  } catch (err) {
    showToast("Server error during update", "error");
  }
});

loadUser();
