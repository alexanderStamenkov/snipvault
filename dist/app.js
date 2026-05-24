import { loadSnippets, saveSnippets } from "./storage.js";
// ── STATE ──────────────────────────────────────────────────
let snippets = loadSnippets();
let filters = {
    language: "all",
    searchQuery: "",
};
let isGridView = true;
// ── DOM REFS ───────────────────────────────────────────────
const grid = document.getElementById("grid");
const emptyState = document.getElementById("empty-state");
const resultLabel = document.getElementById("result-label");
const searchInput = document.getElementById("search");
const viewToggle = document.getElementById("view-toggle");
const iconGrid = document.getElementById("icon-grid");
const iconList = document.getElementById("icon-list");
const modalOverlay = document.getElementById("modal-overlay");
const openModalBtn = document.getElementById("open-modal-btn");
const modalClose = document.getElementById("modal-close");
const btnCancel = document.getElementById("btn-cancel");
const btnSave = document.getElementById("btn-save");
const toast = document.getElementById("toast");
const fTitle = document.getElementById("f-title");
const fLang = document.getElementById("f-lang");
const fDesc = document.getElementById("f-desc");
const fCode = document.getElementById("f-code");
const fTags = document.getElementById("f-tags");
// ── HELPERS ────────────────────────────────────────────────
function escapeHtml(str) {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
function formatDate(timestamp) {
    return new Date(timestamp).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}
function getLangClass(lang) {
    const map = {
        typescript: "ts",
        javascript: "js",
        css: "css",
        html: "html",
    };
    return map[lang];
}
// ── FILTER ─────────────────────────────────────────────────
function applyFilters(all, options) {
    return all.filter((s) => {
        const matchLang = options.language === "all" || s.language === options.language;
        const q = options.searchQuery.toLowerCase();
        const matchSearch = q === "" ||
            s.title.toLowerCase().includes(q) ||
            s.description.toLowerCase().includes(q) ||
            s.tags.some((t) => t.toLowerCase().includes(q));
        return matchLang && matchSearch;
    });
}
// ── COUNTS ─────────────────────────────────────────────────
function updateCounts() {
    const languages = [
        "all",
        "typescript",
        "javascript",
        "css",
        "html",
    ];
    for (const lang of languages) {
        const el = document.getElementById(`count-${lang}`);
        if (!el)
            continue;
        const count = lang === "all"
            ? snippets.length
            : snippets.filter((s) => s.language === lang).length;
        el.textContent = String(count);
    }
}
// ── CARD ───────────────────────────────────────────────────
function createCard(snippet) {
    const langClass = getLangClass(snippet.language);
    const tags = snippet.tags
        .map((t) => `<span class="tag">#${escapeHtml(t)}</span>`)
        .join("");
    return `
    <div class="card" data-id="${snippet.id}">
      <div class="card-top">
        <span class="card-title">${escapeHtml(snippet.title)}</span>
        <span class="lang-badge ${langClass}">${snippet.language}</span>
      </div>

      ${snippet.description
        ? `<p class="card-desc">${escapeHtml(snippet.description)}</p>`
        : ""}

      <pre class="code-block">${escapeHtml(snippet.code)}</pre>

      <div class="card-bottom">
        <div class="tags">${tags}</div>
        <div class="card-actions">
          <button class="icon-btn btn-copy" data-id="${snippet.id}" title="Copy code">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
          </button>
          <button class="icon-btn btn-delete" data-id="${snippet.id}" title="Delete">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
            </svg>
          </button>
        </div>
      </div>

      <span style="font-size:11px;color:var(--text-subtle);font-family:var(--font-body);">
        ${formatDate(snippet.createdAt)}
      </span>
    </div>
  `;
}
// ── RENDER ─────────────────────────────────────────────────
function render() {
    const filtered = applyFilters(snippets, filters);
    resultLabel.textContent =
        filtered.length === 1 ? "1 snippet" : `${filtered.length} snippets`;
    if (filtered.length === 0) {
        grid.style.display = "none";
        emptyState.style.display = "flex";
        return;
    }
    grid.style.display = "grid";
    emptyState.style.display = "none";
    grid.innerHTML = filtered.map(createCard).join("");
}
// ── TOAST ──────────────────────────────────────────────────
let toastTimer = null;
function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");
    if (toastTimer)
        clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2000);
}
// ── MODAL ──────────────────────────────────────────────────
function openModal() {
    modalOverlay.classList.add("open");
    fTitle.focus();
}
function closeModal() {
    modalOverlay.classList.remove("open");
    fTitle.value = "";
    fDesc.value = "";
    fCode.value = "";
    fTags.value = "";
    fLang.value = "typescript";
}
function saveSnippet() {
    const title = fTitle.value.trim();
    const code = fCode.value.trim();
    if (!title || !code) {
        showToast("Title and code are required");
        return;
    }
    const newSnippet = {
        id: generateId(),
        title,
        description: fDesc.value.trim(),
        code,
        language: fLang.value,
        tags: fTags.value
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
        createdAt: Date.now(),
    };
    snippets = [newSnippet, ...snippets];
    saveSnippets(snippets);
    updateCounts();
    render();
    closeModal();
    showToast("Snippet saved");
}
// ── DELETE ─────────────────────────────────────────────────
function deleteSnippet(id) {
    snippets = snippets.filter((s) => s.id !== id);
    saveSnippets(snippets);
    updateCounts();
    render();
    showToast("Snippet deleted");
}
// ── COPY ───────────────────────────────────────────────────
function copySnippet(id, btn) {
    const snippet = snippets.find((s) => s.id === id);
    if (!snippet)
        return;
    navigator.clipboard
        .writeText(snippet.code)
        .then(() => {
        btn.classList.add("copied-state");
        setTimeout(() => btn.classList.remove("copied-state"), 1500);
        showToast("Copied to clipboard");
    })
        .catch(() => {
        showToast("Could not copy");
    });
}
// ── VIEW TOGGLE ────────────────────────────────────────────
function toggleView() {
    isGridView = !isGridView;
    grid.classList.toggle("list-view", !isGridView);
    iconGrid.style.display = isGridView ? "block" : "none";
    iconList.style.display = isGridView ? "none" : "block";
}
// ── EVENT LISTENERS ────────────────────────────────────────
// Search
searchInput.addEventListener("input", () => {
    filters = Object.assign(Object.assign({}, filters), { searchQuery: searchInput.value });
    render();
});
// Keyboard shortcut ⌘K / Ctrl+K
document.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchInput.focus();
    }
    if (e.key === "Escape")
        closeModal();
});
// Sidebar nav filters
document.querySelectorAll(".nav-item").forEach((btn) => {
    btn.addEventListener("click", () => {
        document
            .querySelectorAll(".nav-item")
            .forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        filters = Object.assign(Object.assign({}, filters), { language: btn.dataset["filter"] });
        render();
    });
});
// Modal open / close
openModalBtn.addEventListener("click", openModal);
modalClose.addEventListener("click", closeModal);
btnCancel.addEventListener("click", closeModal);
btnSave.addEventListener("click", saveSnippet);
// Close modal when clicking the overlay backdrop
modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay)
        closeModal();
});
// View toggle
viewToggle.addEventListener("click", toggleView);
// Card actions (event delegation)
grid.addEventListener("click", (e) => {
    const target = e.target;
    const copyBtn = target.closest(".btn-copy");
    const deleteBtn = target.closest(".btn-delete");
    if (copyBtn) {
        const id = copyBtn.dataset["id"];
        if (id)
            copySnippet(id, copyBtn);
    }
    if (deleteBtn) {
        const id = deleteBtn.dataset["id"];
        if (id)
            deleteSnippet(id);
    }
});
// ── INIT ───────────────────────────────────────────────────
updateCounts();
render();
// ── SIDEBAR MOBILE ─────────────────────────────────────────
const hamburger = document.getElementById("hamburger");
const sidebar = document.querySelector(".sidebar");
const sidebarOverlay = document.getElementById("sidebar-overlay");
function openSidebar() {
    sidebar.classList.add("open");
    sidebarOverlay.classList.add("visible");
    document.body.style.overflow = "hidden";
}
function closeSidebar() {
    sidebar.classList.remove("open");
    sidebarOverlay.classList.remove("visible");
    document.body.style.overflow = "";
}
hamburger.addEventListener("click", () => {
    sidebar.classList.contains("open") ? closeSidebar() : openSidebar();
});
sidebarOverlay.addEventListener("click", closeSidebar);
// Close sidebar when a nav filter is picked on mobile
document.querySelectorAll(".nav-item").forEach((btn) => {
    btn.addEventListener("click", () => {
        if (window.innerWidth <= 900)
            closeSidebar();
    });
});
//# sourceMappingURL=app.js.map