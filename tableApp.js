/**
 * TableApp クラス
 * ソート・フィルタ・ページング・選択・画像プレビュー付きの汎用テーブルUIを管理する。
 */
class TableApp {
    /**
     * @private
     * @type {HTMLTableElement}
     * 操作対象のテーブル要素。renderや各種初期化処理でDOM操作の基点となる。
     */
    #table;

    /**
     * @private
     * @type {Object[]}
     * 表示対象となる元データ配列。各要素は行データオブジェクト。
     */
    #data;

    /**
     * @private
     * @type {{key: string, label: string}[]}
     * テーブル列の定義配列。keyがデータキー、labelが列見出し文字列。
     */
    #columns;

    /**
     * @private
     * @type {Object.<string, ("match"|"range")>}
     * 各列のフィルタ種別設定。キーが列key、値が"match"または"range"。
     */
    #filterTypes;

    /**
     * @private
     * @type {number}
     * 1ページあたりに表示する行数。
     */
    #pageSize;

    /**
     * @private
     * @type {Object.<string, "none"|"asc"|"desc">}
     * 各列のソート状態を保持するマップ。
     * 例: { Name: "asc", Age: "none" }
     */
    #sortStates;

    /**
     * @private
     * @type {Object.<string, {text?: string|null, min?: number|null, max?: number|null}>}
     * 各列に設定されたフィルタ条件を保持。
     * "match"フィルタではtextを使用、"range"フィルタではmin/maxを使用。
     */
    #filters;

    /**
     * @private
     * @type {Object[]}
     * フィルタ処理後のデータ配列。ソートやページング処理の入力となる。
     */
    #filtered;

    /**
     * @private
     * @type {Object[]}
     * 現在ページに表示中の行データ配列。render()内でpaginate()の結果を保持。
     */
    #pageRows;

    /**
     * @private
     * @type {number}
     * 現在のページ番号（1始まり）。
     */
    #currentPage;

    /**
     * @private
     * @type {number}
     * 現在選択中の行インデックス。0始まり。
     */
    #selectedIndex;

    /**
     * @private
     * @type {{cur: HTMLInputElement, total: HTMLElement}}
     * ページングUI要素をまとめたオブジェクト。
     * cur: 現在ページ入力欄、total: 総ページ数表示欄。
     */
    #pageUI;

    /**
     * @private
     * @type {HTMLImageElement|null}
     * 行選択時にプレビュー表示を行う画像要素。存在しない場合はnull。
     */
    #imgPreview;

    /**
     * @param {HTMLTableElement} table - 操作対象のテーブル要素
     * @param {Object[]} data - 表示データ配列
     * @param {{key: string, label: string}[]} columns - 列定義
     * @param {Object.<string, ("match"|"range")>} filterTypes - 各列のフィルタ種別
     * @param {number} [pageSize=10] - 1ページあたりの行数
     */
    constructor(table, data, columns, filterTypes, pageSize = 10) {
        this.#table = table;
        this.#data = data;
        this.#columns = columns;
        this.#filterTypes = filterTypes;
        this.#pageSize = pageSize;

        this.#sortStates = {};
        this.#filters = {};
        this.#currentPage = 1;
        this.#selectedIndex = 0;
        this.#imgPreview = document.getElementById("row-preview");

        // --- 初期化 ---
        this.#renderHeader();
        this.#initSort();
        this.#initPaging();
        this.#initRowSelect();
        this.#initResetFilters();
        this.render();
    }

    /**
     * テーブルヘッダーとフィルタ行を生成する。
     * @private
     */
    #renderHeader() {
        const thead = this.#table.createTHead();

        // --- ソート行作成 ---
        const trHead = thead.insertRow();
        this.#columns.forEach(col => {
            const th = document.createElement("th");
            th.textContent = col.label;

            const btn = document.createElement("button");
            btn.className = "sort-btn";
            btn.dataset.key = col.key;
            btn.textContent = "△▽";
            th.appendChild(btn);
            trHead.appendChild(th);

            this.#sortStates[col.key] = "none";
        });

        // --- フィルタ行作成 ---
        const trFilter = thead.insertRow();
        this.#columns.forEach(col => {
            const th = document.createElement("th");
            const type = this.#filterTypes[col.key] || "match";

            // 範囲指定フィルタ
            if (type === "range") {
                const min = document.createElement("input");
                const max = document.createElement("input");
                min.type = max.type = "number";
                min.placeholder = "Min";
                max.placeholder = "Max";
                min.style.width = max.style.width = "40%";

                // 値変更時にフィルタ適用
                min.oninput = max.oninput = () => {
                    this.#filters[col.key] = {
                        ...this.#filters[col.key],
                        min: Number(min.value) || null,
                        max: Number(max.value) || null
                    };
                    this.#currentPage = 1;
                    this.render();
                };
                th.append(min, document.createTextNode(" - "), max);
            } else {
                // 文字列一致フィルタ + ドロップダウン候補
                const wrapper = document.createElement("div");
                wrapper.className = "filter-wrapper";

                const input = document.createElement("input");
                input.type = "text";
                input.placeholder = "Filter";
                input.oninput = () => {
                    this.#filters[col.key] = { text: input.value || null };
                    this.#currentPage = 1;
                    this.render();
                };
                wrapper.appendChild(input);

                const btn = document.createElement("button");
                btn.textContent = "▼";
                btn.className = "filter-btn";
                wrapper.appendChild(btn);

                const dropdown = document.createElement("div");
                dropdown.className = "dropdown";
                document.body.appendChild(dropdown);

                // ▼ボタン押下時、候補一覧を表示
                btn.onclick = (e) => {
                    e.stopPropagation();
                    dropdown.innerHTML = "";
                    const rect = btn.getBoundingClientRect();
                    dropdown.style.left = rect.left + "px";
                    dropdown.style.top = rect.bottom + "px";

                    // ユニークな値を抽出してドロップダウンに反映
                    const uniqueValues = [...new Set(this.#data.map(d => d[col.key]))];
                    uniqueValues.forEach(v => {
                        const div = document.createElement("div");
                        div.textContent = v;
                        div.onclick = () => {
                            input.value = v;
                            this.#filters[col.key] = { text: v };
                            dropdown.style.display = "none";
                            this.#currentPage = 1;
                            this.render();
                        };
                        dropdown.appendChild(div);
                    });
                    dropdown.style.display = "block";
                };

                document.addEventListener("click", () => dropdown.style.display = "none");
                th.appendChild(wrapper);
            }
            trFilter.appendChild(th);
        });
    }

    /**
     * ソートボタンのクリックイベントを初期化する。
     * @private
     */
    #initSort() {
        this.#table.querySelectorAll(".sort-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const key = btn.dataset.key;
                const current = this.#sortStates[key];
                const next = current === "none" ? "asc" : current === "asc" ? "desc" : "none";

                // 他列のソート状態をリセット
                Object.keys(this.#sortStates).forEach(k => this.#sortStates[k] = "none");
                this.#sortStates[key] = next;

                this.#updateSortIcons();
                this.#currentPage = 1;
                this.render();
            });
        });
    }

    /**
     * ソートボタンの表示アイコンを更新する。
     * @private
     */
    #updateSortIcons() {
        this.#table.querySelectorAll(".sort-btn").forEach(btn => {
            const state = this.#sortStates[btn.dataset.key];
            btn.textContent = state === "none" ? "△▽" : state === "asc" ? "▲▽" : "△▼";
        });
    }

    /**
     * ページングボタンと入力欄のイベントを初期化する。
     * @private
     */
    #initPaging() {
        const prev = document.getElementById("prev-page");
        const next = document.getElementById("next-page");
        const cur = document.getElementById("current-page");
        const total = document.getElementById("total-pages");
        const size = document.getElementById("page-size");

        // 前ページへ
        prev.onclick = () => {
            const totalPages = Math.ceil(this.#filtered.length / this.#pageSize) || 1;
            this.#currentPage = (this.#currentPage - 2 + totalPages) % totalPages + 1;
            this.render();
        };

        // 次ページへ
        next.onclick = () => {
            const totalPages = Math.ceil(this.#filtered.length / this.#pageSize) || 1;
            this.#currentPage = this.#currentPage % totalPages + 1;
            this.render();
        };

        // ページ番号入力時
        cur.onchange = () => {
            const totalPages = Math.ceil(this.#filtered.length / this.#pageSize) || 1;
            this.#currentPage = Math.min(Math.max(1, +cur.value), totalPages);
            this.render();
        };

        // 1ページ行数変更
        size.onchange = () => {
            this.#pageSize = +size.value;
            this.#currentPage = 1;
            this.render();
        };

        this.#pageUI = { cur, total };
    }

    /**
     * 行選択および矢印キーでの移動を初期化する。
     * @private
     */
    #initRowSelect() {
        // クリックで選択
        this.#table.addEventListener("click", e => {
            const tr = e.target.closest("tr");
            if (!tr) return;
            const idx = [...this.#table.tBodies[0].rows].indexOf(tr);
            this.#selectedIndex = idx;
            this.#updateSelection(0);
        });

        // キーボード操作で移動
        document.addEventListener("keydown", e => {
            if (!this.#pageRows?.length) return;
            if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                e.preventDefault(); // 全体ページスクロール防止
                const lastIndex = this.#selectedIndex;
                const dir = e.key === "ArrowDown" ? 1 : -1;
                this.#selectedIndex = (this.#selectedIndex + dir + this.#pageRows.length) % this.#pageRows.length;
                this.#updateSelection(lastIndex);
            }
        });
    }

    /**
     * 行選択時のスタイルとプレビュー、スクロール位置を更新する。
     * @param {number} lastIndex - 前回選択された行インデックス
     * @private
     */
    #updateSelection(lastIndex) {
        const rows = this.#table.tBodies[0].rows;

        // 選択行のハイライト更新
        [...rows].forEach((r, i) => r.classList.toggle("selected", i === this.#selectedIndex));

        // プレビュー画像更新
        const sel = this.#pageRows[this.#selectedIndex];
        if (sel && this.#imgPreview) this.#imgPreview.src = sel.img || "";

        const container = document.querySelector(".table-container");

        // 固定ヘッダーの高さ計算
        const thead = this.#table.tHead;
        let headerHeight = 0;
        if (thead) [...thead.rows].forEach(r => headerHeight += r.offsetHeight);

        // 行末→先頭 / 先頭→末尾 のスクロール処理
        if (this.#selectedIndex === 0 && lastIndex === rows.length - 1) {
            container.scrollTop = 0;
        } else if (this.#selectedIndex === rows.length - 1 && lastIndex === 0) {
            container.scrollTop = container.scrollHeight;
        } else {
            // 可視領域に収まるようスクロール補正
            const rowTop = rows[this.#selectedIndex].offsetTop;
            const rowBottom = rowTop + rows[this.#selectedIndex].offsetHeight;
            const viewTop = container.scrollTop;
            const viewBottom = viewTop + container.clientHeight;

            if (rowBottom > viewBottom) {
                container.scrollTop += rows[this.#selectedIndex].offsetHeight;
            } else if (rowTop < viewTop + headerHeight) {
                container.scrollTop -= rows[this.#selectedIndex].offsetHeight;
            }
        }
    }

    /**
     * フィルターリセットボタンの初期化。
     * @private
     */
    #initResetFilters() {
        document.getElementById("reset-filters").onclick = () => {
            this.#filters = {};
            document.querySelectorAll("thead input").forEach(el => el.value = "");
            this.#currentPage = 1;
            this.render();
        };
    }
    
    /**
     * tbody要素を再描画する。
     *
     * @private
     * @param {Object[]} rows - 描画対象の行データ配列。paginate()で抽出された現在ページのデータ。
     * @returns {void} - 出力値はなし。DOM操作によりテーブルを更新する。
     *
     * @description
     * - tbodyが存在しない場合は新規作成。
     * - tbody内をクリアし、rowsの各要素を<tr><td>として描画。
     * - this.#columnsのkey順にセルを生成。
     */
    #renderTableBody(rows) {
    if (!this.#table.tBodies[0]) this.#table.appendChild(document.createElement("tbody"));
    const tbody = this.#table.tBodies[0];
    tbody.innerHTML = "";
    rows.forEach(d => {
        const tr = document.createElement("tr");
        this.#columns.forEach(c => {
        const td = document.createElement("td");
        td.textContent = d[c.key];
        tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
    }

    /**
     * テーブルを再描画する。
     * フィルタ・ソート・ページングを順に適用し、tbody要素を更新する。
     *
     * @returns {void} - 出力値はなし。DOM更新および内部状態を変更する。
     *
     * @description
     * - this.#data: 元データに対してフィルタを適用し、this.#filteredに格納。
     * - this.#sortStates: 現在のソート状態に従って並べ替え。
     * - paginate(): ページング処理を行い、現在ページ・総ページ数を更新。
     * - #renderTableBody(): tbodyを再描画。
     * - ページUIと選択状態をリセット。
     */
    render() {
    this.#filtered = filterData(this.#data, this.#filters, this.#columns);
    const sorted = sortData(this.#filtered, this.#sortStates);
    const { rows, currentPage, totalPages } = paginate(sorted, this.#currentPage, this.#pageSize);

    this.#pageRows = rows;
    this.#currentPage = currentPage;

    this.#renderTableBody(rows);
    this.#pageUI.cur.value = currentPage;
    this.#pageUI.total.textContent = totalPages;
    this.#selectedIndex = 0;
    this.#updateSelection(0);
    }
}
