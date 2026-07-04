const navLinks = [...document.querySelectorAll(".primary-nav a")];
const nav = document.querySelector(".primary-nav");
const toggle = document.querySelector(".nav-toggle");

toggle.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  toggle.setAttribute("aria-expanded", String(open));
});

const currentPage = location.pathname.split("/").pop() || "index.html";

navLinks.forEach((link) => {
  link.classList.toggle("active", link.getAttribute("href") === currentPage);
  link.addEventListener("click", () => {
    nav.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  });
});
