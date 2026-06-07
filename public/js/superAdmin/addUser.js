const form = document.getElementById("registerForm");
const msg = document.getElementById("msg");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "/pages/login.html";
    return;
  }

  const body = {
    name: document.getElementById("name").value,
    username: document.getElementById("username").value,
    password: document.getElementById("password").value,
    confirmPassword: document.getElementById("confirmPassword").value,
    slug: document.getElementById("slug").value,
    job: document.getElementById("job").value,
    rank: document.getElementById("rank").value,
    role: document.getElementById("role").value,
  };

  try {
    const res = await fetch("http://localhost:3000/user/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        token: token, // 🔥 THIS WAS MISSING
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      msg.style.color = "red";
      msg.textContent = data.message || "Failed to create user";
      return;
    }

    msg.style.color = "#00eaff";
    msg.textContent = data.message;

    form.reset();
  } catch (err) {
    console.error(err);
    msg.style.color = "red";
    msg.textContent = "Server error";
  }
});
