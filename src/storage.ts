import type { Snippet } from "./types.js";

const STORAGE_KEY = "snipvault_snippets";

export function saveSnippets(snippets: Snippet[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(snippets));
}

export function loadSnippets(): Snippet[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  return JSON.parse(raw) as Snippet[];
}
