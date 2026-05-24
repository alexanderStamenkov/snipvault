const STORAGE_KEY = "snipvault_snippets";
export function saveSnippets(snippets) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snippets));
}
export function loadSnippets() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw)
        return [];
    return JSON.parse(raw);
}
//# sourceMappingURL=storage.js.map