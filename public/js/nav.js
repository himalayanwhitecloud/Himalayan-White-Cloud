// nav.js — auto-highlight active nav link
document.addEventListener('DOMContentLoaded', function () {
  let current = location.pathname.split("/").pop();

  // If on domain root (no filename), treat as index.html
  if (current === "") current = "index.html";

  document.querySelectorAll("nav a.nav-link").forEach(link => {
    const href = link.getAttribute("href");

    if (href === current) {
      link.classList.add("active");
      link.setAttribute("aria-current", "page");
    } else {
      link.classList.remove("active");
      link.removeAttribute("aria-current");
    }
  });
});
