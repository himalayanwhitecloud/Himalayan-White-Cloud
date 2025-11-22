// js/reveal.js - simple loader to add .in to .reveal elements
document.addEventListener('DOMContentLoaded', function () {
  // small delay so page feels smoother
  setTimeout(() => {
    document.querySelectorAll('.reveal').forEach((el, i) => {
      // stagger
      setTimeout(() => el.classList.add('in'), i * 80);
    });
  }, 120);
});
