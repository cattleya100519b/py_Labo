document.addEventListener("DOMContentLoaded", () => {
  // カードの折りたたみ
  document.querySelectorAll(".toggle-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const details = btn.nextElementSibling;
      details.classList.toggle("hidden");
    });
  });

  // テーブルソート（文字列・昇順）
  document.querySelectorAll("table.sortable th").forEach((th, idx) => {
    th.addEventListener("click", () => {
      const table = th.closest("table");
      const tbody = table.querySelector("tbody");
      const rows = Array.from(tbody.querySelectorAll("tr"));
      rows.sort((a,b) => a.children[idx].textContent.localeCompare(b.children[idx].textContent));
      tbody.innerHTML = "";
      rows.forEach(r => tbody.appendChild(r));
    });
  });
});