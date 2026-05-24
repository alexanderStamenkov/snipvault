export type Language = "typescript" | "javascript" | "css" | "html";

export interface Snippet {
  id: string;
  title: string;
  description: string;
  code: string;
  language: Language;
  tags: string[];
  createdAt: number;
}

export interface FilterOptions {
  language: Language | "all";
  searchQuery: string;
}
