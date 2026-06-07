/*const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "./../pages/login.html";
}
*/
/*const token = localStorage.getItem("token");

if (!token) {
  // ✅ ABSOLUTE path
  window.location.href = "/pages/login.html";
}
*/
(() => {
  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "/pages/login.html";
  }
})();
  