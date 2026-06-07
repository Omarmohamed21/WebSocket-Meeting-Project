/*const form = document.getElementById("loginForm");
const errorMsg = document.getElementById("errorMsg");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  errorMsg.textContent = "";

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!username || !password) {
    errorMsg.textContent = "Please fill all fields";
    return;
  }

  try {
    const response = await fetch("http://localhost:3000/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      errorMsg.textContent = data.message || "Login failed";
      return;
    }

    // ✅ Save token & user info
    localStorage.setItem("token", data.token);
    localStorage.setItem("name", data.name);
    localStorage.setItem("role", data.role);

    // ✅ Role-based redirect (matches your backend roles)
    if (data.role === "admin") {
      window.location.href = "/admin/dashboard.html";
    } else if (data.role === "superAdmin") {
      window.location.href = "/super-admin/dashboard.html";
    } else {
      window.location.href = "/dashboard.html";
    }
  } catch (error) {
    console.error(error);
    errorMsg.textContent = "Server error. Please try again later.";
  }
});*/
/*  const form = document.getElementById("loginForm");
const errorMsg = document.getElementById("errorMsg");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorMsg.textContent = "";

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!username || !password) {
    errorMsg.textContent = "All fields are required";
    return;
  }

  try {
    const res = await fetch("http://localhost:3000/user/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();
    console.log("RAW RESPONSE:", data);
    console.log("STATUS:", res.status);

    if (!res.ok) {
      errorMsg.textContent = data.message || "Login failed";
      return;
    }

    // ✅ STORE DATA
    console.log("SAVING TOKEN:", data.token);

    localStorage.setItem("token", data.token);
    localStorage.setItem("name", data.name);
    localStorage.setItem("role", data.role);

    // ✅ REDIRECT (dashboard later)
    if (data.role === "admin") {
      window.location.href = "/admin/dashboard.html";
    } else if (data.role === "superAdmin") {
      window.location.href = "/super-admin/dashboard.html";
    } else {
      window.location.href = "/dashboard.html";
    }
  } catch (err) {
    console.error(err);
    errorMsg.textContent = "Server error. Try again later.";
  }
});*/

const form = document.getElementById("loginForm");
const errorMsg = document.getElementById("errorMsg");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorMsg.textContent = "";

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!username || !password) {
    errorMsg.textContent = "All fields are required";
    return;
  }

  try {
    const res = await fetch("http://localhost:3000/user/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    console.log("LOGIN RESPONSE:", data);

    if (!res.ok) {
      errorMsg.textContent = data.message || "Login failed";
      return;
    }

    // ✅ STORE TOKEN IN LOCAL STORAGE (FRONTEND ORIGIN)
    localStorage.setItem("token", data.token);
    localStorage.setItem("name", data.name);
    localStorage.setItem("role", data.role);

    // ✅ REDIRECT (TEMP)
    if (data.role === "admin") {
      window.location.href = "./../pages/admin/adminDashboard.html";
    } else if (data.role === "superAdmin") {
      window.location.href = "./../pages/superAdmin/superAdmin.html";
    } else {
      window.location.href = "./../pages/user/userDashboard.html";
    }
  } catch (err) {
    console.error(err);
    errorMsg.textContent = "Server error. Try again later.";
  }
});
