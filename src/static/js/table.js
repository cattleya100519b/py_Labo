document.addEventListener("DOMContentLoaded", () => {
  const table = document.getElementById("data-table");
  const tbody = table.querySelector("tbody");

  // --- 元データを配列に保持 ---
  const originalRows = Array.from(tbody.querySelectorAll("tr")).map(tr => ({
    element: tr,
    // 各行のセル値を配列で保持
    cells: Array.from(tr.querySelectorAll("td")).map(td => td.textContent.trim()),
    index: Number(tr.dataset.originalIndex) // 元の並び順を記録
  }));

  // --- 列名 → インデックスのマッピング（最初のヘッダー行のみ） ---
  const firstHeaderRow = table.querySelector("thead tr:first-child");
  const colMap = {};
  Array.from(firstHeaderRow.querySelectorAll("th")).forEach((th, i) => {
    const key = th.dataset.key;
    if (key) colMap[key] = i;
  });

  // --- ソート状態の管理 ---
  const sortStates = {};
  table.querySelectorAll(".sort-btn").forEach(btn => {
    const key = btn.dataset.key;
    sortStates[key] = "none"; // 初期はソート無し

    btn.addEventListener("click", () => {
      // ソート状態を循環: none → asc → desc → none
      sortStates[key] =
        sortStates[key] === "none" ? "asc" :
        sortStates[key] === "asc" ? "desc" : "none";

      // 他の列のソート状態はリセット
      Object.keys(sortStates).forEach(k => {
        if (k !== key) sortStates[k] = "none";
      });

      // ボタン表示を更新
      table.querySelectorAll(".sort-btn").forEach(b => {
        const k = b.dataset.key;
        b.textContent =
          sortStates[k] === "none" ? "△▽" :
          sortStates[k] === "asc" ? "▲▽" : "△▼";
      });

      render();
    });
  });

  // --- フィルター状態の管理 ---
  const filters = {};
  Array.from(table.querySelectorAll(".filter-input")).forEach(input => {
    const key = input.dataset.key;
    if (!filters[key]) filters[key] = { min: null, max: null, select: null };

    // 入力・変更イベントで更新
    input.addEventListener("input", updateFilters);
    input.addEventListener("change", updateFilters);
  });

  // --- フィルター更新関数 ---
  function updateFilters() {
    Array.from(table.querySelectorAll(".filter-input")).forEach(input => {
      const key = input.dataset.key;
      const type = input.dataset.type || "select";
      filters[key][type] = input.value.trim() || null;
    });
    render();
  }

  // --- 行がフィルターを通るか判定 ---
  const passesFilter = row => Object.keys(filters).every(colKey => {
    const i = colMap[colKey];
    const val = row.cells[i];
    const f = filters[colKey];
    return (
      (!f.select || val === f.select) &&
      (!f.min || Number(val) >= Number(f.min)) &&
      (!f.max || Number(val) <= Number(f.max))
    );
  });

  // --- 行比較関数（ソート用） ---
  function compare(rowA, rowB) {
    const sortCol = Object.keys(sortStates).find(k => sortStates[k] !== "none");
    if (!sortCol) return rowA.index - rowB.index; // ソート無しは元の順

    const order = sortStates[sortCol];
    const i = colMap[sortCol];
    const a = rowA.cells[i];
    const b = rowB.cells[i];

    // 数値ソート・文字列ソートを自動判定
    const na = parseFloat(a);
    const nb = parseFloat(b);
    const bothNumeric = !isNaN(na) && !isNaN(nb);

    if (bothNumeric) return order === "asc" ? na - nb : nb - na;
    return order === "asc" ? a.localeCompare(b) : b.localeCompare(a);
  }

  // --- テーブル描画関数 ---
  function render() {
    // フィルターを通した後にソート
    const rows = originalRows
      .filter(passesFilter)
      .sort(compare);

    // tbody を再描画
    tbody.innerHTML = "";
    rows.forEach(r => tbody.appendChild(r.element));
  }
});
