(function () {
  const notice = document.getElementById("site-notice");
  const closeBtn = document.getElementById("site-notice-close");

  // If the notice HTML isn't on this page, exit quietly
  if (!notice || !closeBtn) return;

  function show() {
    notice.hidden = false;
    setTimeout(() => notice.classList.add("show"), 10);
  }

  function hide() {
    notice.classList.remove("show");
    setTimeout(() => (notice.hidden = true), 400);
  }

  window.addEventListener("load", () => {
    setTimeout(show, 400);
  });

  closeBtn.addEventListener("click", hide);
})();
