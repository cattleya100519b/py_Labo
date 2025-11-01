/**
 * @fileoverview JSONデータからテーブルを生成し、フィルタリング・ページング・キーボード操作を提供する。
 */

const ROWS_PER_PAGE = 5;
let currentPage = 1;
let filteredData = [...TABLE_DATA];

/**
 * テーブルヘッダを生成する
 * @param {HTMLElement} thead - テーブルのヘッダ要素
 * @param {string[]} columns - カラム名配列
 */
function createTableHeader(thead, columns) {
    thead.innerHTML = "";
    const tr = document.createElement("tr");
    columns.forEach(col => {
        const th = document.createElement("th");
        th.textContent = col;
        tr.appendChild(th);
    });
    thead.appendChild(tr);
}

/**
 * フィルターUIを生成する
 * @param {HTMLElement} container - フィルターコンテナ
 * @param {string[]} columns - カラム名配列
 */
function createFilters(container, columns) {
    container.innerHTML = "";
    columns.forEach(col => {
        const type = FILTER_TYPES[col];
        if (!type) return;

        const div = document.createElement("div");
        div.className = "filter-item";
        const label = document.createElement("label");
        label.textContent = col;

        if (type === "text") {
            const input = document.createElement("input");
            input.type = "text";
            input.dataset.column = col;
            div.append(label, input);
        } else if (type === "range") {
            const min = document.createElement("input");
            const max = document.createElement("input");
            min.type = max.type = "number";
            min.placeholder = "min";
            max.placeholder = "max";
            min.dataset.column = max.dataset.column = col;
            min.dataset.range = "min";
            max.dataset.range = "max";
            div.append(label, min, max);
        } else if (type === "select") {
            const select = document.createElement("select");
            select.dataset.column = col;
            const uniqueVals = [...new Set(TABLE_DATA.map(d => d[col]))];
            const optAll = document.createElement("option");
            optAll.value = "";
            optAll.textContent = "すべて";
            select.appendChild(optAll);
            uniqueVals.forEach(v => {
                const opt = document.createElement("option");
                opt.value = v;
                opt.textContent = v;
                select.appendChild(opt);
            });
            div.append(label, select);
        }
        container.appendChild(div);
    });

    container.querySelectorAll("input, select").forEach(el => {
        el.addEventListener("input", applyFilters);
    });
}

/**
 * フィルタを適用してデータを更新する
 */
function applyFilters() {
    const filters = {};
    document.querySelectorAll(".filter-item input, .filter-item select").forEach(el => {
        const col = el.dataset.column;
        const val = el.value;
        const rangeType = el.dataset.range;
        if (!filters[col]) filters[col] = {};

        if (rangeType) {
            filters[col][rangeType] = val;
        } else {
            filters[col].value = val;
        }
    });

    filteredData = TABLE_DATA.filter(row => {
        return Object.entries(filters).every(([col, filter]) => {
            const cell = String(row[col] ?? "");

            if (FILTER_TYPES[col] === "text" && filter.value) {
                return cell.toLowerCase().startsWith(filter.value.toLowerCase());
            }

            if (FILTER_TYPES[col] === "range") {
                const num = Number(cell);
                if (filter.min && num < Number(filter.min)) return false;
                if (filter.max && num > Number(filter.max)) return false;
            }

            if (FILTER_TYPES[col] === "select" && filter.value) {
                return cell === filter.value;
            }

            return true;
        });
    });

    currentPage = 1;
    renderTable();
}

/**
 * 現在ページのデータをテーブルに描画する
 */
function renderTable() {
    const tbody = document.querySelector("#data-table tbody");
    tbody.innerHTML = "";
    const start = (currentPage - 1) * ROWS_PER_PAGE;
    const end = start + ROWS_PER_PAGE;
    const pageData = filteredData.slice(start, end);

    pageData.forEach(row => {
        const tr = document.createElement("tr");
        Object.values(row).forEach(val => {
            const td = document.createElement("td");
            td.textContent = val;
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });

    document.querySelector("#total-pages").textContent = Math.max(1, Math.ceil(filteredData.length / ROWS_PER_PAGE));
    document.querySelector("#page-number").value = currentPage;
}

/**
 * ページ番号を変更する
 * @param {number} delta - ページ増減値
 */
function changePage(delta) {
    const total = Math.ceil(filteredData.length / ROWS_PER_PAGE);
    currentPage = Math.min(Math.max(1, currentPage + delta), total);
    renderTable();
}

/**
 * 行キーボードナビゲーション
 */
function setupKeyboardNavigation() {
    const tbody = document.querySelector("#data-table tbody");
    let currentRow = 0;

    tbody.addEventListener("click", e => {
        if (e.target.tagName === "TD") {
            currentRow = [...tbody.children].indexOf(e.target.parentElement);
        }
    });

    document.addEventListener("keydown", e => {
        const rows = tbody.querySelectorAll("tr");
        if (!rows.length) return;

        if (e.key === "ArrowDown") {
            currentRow = (currentRow + 1) % rows.length;
            rows[currentRow].scrollIntoView({ block: "nearest" });
        } else if (e.key === "ArrowUp") {
            currentRow = (currentRow - 1 + rows.length) % rows.length;
            rows[currentRow].scrollIntoView({ block: "nearest" });
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const columns = Object.keys(TABLE_DATA[0]);
    createTableHeader(document.querySelector("#data-table thead"), columns);
    createFilters(document.querySelector("#filter-container"), columns);
    renderTable();

    document.querySelector("#prev-page").addEventListener("click", () => changePage(-1));
    document.querySelector("#next-page").addEventListener("click", () => changePage(1));
    document.querySelector("#page-number").addEventListener("change", e => {
        const val = parseInt(e.target.value, 10);
        const total = Math.ceil(filteredData.length / ROWS_PER_PAGE);
        if (!isNaN(val) && val >= 1 && val <= total) {
            currentPage = val;
            renderTable();
        }
    });

    setupKeyboardNavigation();
});
