/*const logoutBtn = document.getElementById("logoutBtn");

logoutBtn.addEventListener("click", async () => {
  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "../pages/login.html";
    return;
  }

  try {
    const res = await fetch("http://localhost:3000/user/logout", {
      method: "POST",
      headers: {
        token: token,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Logout failed");
      return;
    }

    // ✅ CLEAR FRONTEND SESSION
    localStorage.clear();

    // ✅ REDIRECT TO HOME
    window.location.href = "./../pages/login.html";
  } catch (err) {
    console.error(err);
    alert("Server error during logout");
  }
});
*/ const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    const token = localStorage.getItem("token");

    try {
      if (token) {
        await fetch("http://localhost:3000/user/logout", {
          method: "POST",
          headers: {
            token: token,
          },
        });
      }
    } catch (err) {
      console.error("Logout request failed:", err);
    } finally {
      // ✅ clear session
      localStorage.clear();

      // ✅ ABSOLUTE redirect (NO duplication)
      window.location.href = "/pages/login.html";
    }
  });
}
