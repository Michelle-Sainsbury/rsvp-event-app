function showTab(name) {
  document.querySelectorAll(".tab-content").forEach((el) => {
    el.classList.toggle("active", el.id === "tab-" + name);
  });
  document.querySelectorAll(".sidebar-nav [data-tab]").forEach((el) => {
    el.classList.toggle("active", el.getAttribute("data-tab") === name);
  });
}

document.querySelectorAll(".sidebar-nav [data-tab]").forEach((el) => {
  el.addEventListener("click", (e) => {
    e.preventDefault();
    showTab(el.getAttribute("data-tab"));
  });
});
