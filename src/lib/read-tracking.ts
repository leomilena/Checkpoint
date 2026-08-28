const KEY = "cp-read-articles";

export function isArticleRead(slug: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return false;
    const list: string[] = JSON.parse(raw);
    return list.includes(slug);
  } catch {
    return false;
  }
}

export function markArticleRead(slug: string) {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(KEY);
    const list: string[] = raw ? JSON.parse(raw) : [];
    if (!list.includes(slug)) {
      list.push(slug);
      window.localStorage.setItem(KEY, JSON.stringify(list.slice(-500)));
    }
  } catch {
    // localStorage no disponible; se ignora silenciosamente
  }
}
