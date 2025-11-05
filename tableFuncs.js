/**
 * データをフィルタする。
 * @param {Object[]} data - フィルタ対象となるデータ配列。各要素は1行分のオブジェクト。
 * @param {Object} filters - 列キーをプロパティ名とし、フィルタ条件（text/min/max）を持つオブジェクト。
 * @param {Object[]} columns - フィルタ対象の列定義配列。各要素は {key, label} 形式。
 * @returns {Object[]} - フィルタ条件に一致するデータのみを抽出した新しい配列。
 */
function filterData(data, filters, columns) {
  return data.filter(d =>
    columns.every(col => {
      const f = filters[col.key];
      if (!f) return true;
      const val = d[col.key];
      if (f.text != null)
        return String(val).toLowerCase().includes(f.text.toLowerCase());
      if (f.min != null && val < f.min) return false;
      if (f.max != null && val > f.max) return false;
      return true;
    })
  );
}

/**
 * データをソートする。
 * @param {Object[]} data - ソート対象のデータ配列。各要素は1行分のオブジェクト。
 * @param {Object} sortStates - 列キーをプロパティ名とし、ソート状態（"asc" | "desc" | "none"）を持つオブジェクト。
 * @returns {Object[]} - 指定された列・順序でソートされた新しいデータ配列。
 */
function sortData(data, sortStates) {
  const sortKey = Object.keys(sortStates).find(k => sortStates[k] !== "none");
  if (!sortKey) return [...data];
  const order = sortStates[sortKey];

  return [...data].sort((a, b) => {
    const va = a[sortKey], vb = b[sortKey];
    const num = !isNaN(va) && !isNaN(vb);
    if (num) return order === "asc" ? va - vb : vb - va;
    return order === "asc"
      ? String(va).localeCompare(String(vb))
      : String(vb).localeCompare(String(va));
  });
}

/**
 * ページング処理。
 * @param {Object[]} data - ページング対象のデータ配列。
 * @param {number} currentPage - 現在のページ番号（1始まり）。
 * @param {number} pageSize - 1ページあたりの表示件数。
 * @returns {{rows: Object[], currentPage: number, totalPages: number}} - 現在ページの行データ、補正後のページ番号、総ページ数を持つオブジェクト。
 */
function paginate(data, currentPage, pageSize) {
  const totalPages = Math.ceil(data.length / pageSize) || 1;
  const clampedPage = Math.min(Math.max(1, currentPage), totalPages);
  const start = (clampedPage - 1) * pageSize;
  const end = start + pageSize;
  return {
    rows: data.slice(start, end),
    currentPage: clampedPage,
    totalPages
  };
}
