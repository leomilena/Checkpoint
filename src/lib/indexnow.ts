const INDEXNOW_KEY = "5fcc1e2d4c0f7ed9c124cda28c4031b0";

/**
 * Avisa a los buscadores que soportan IndexNow (Bing, Yandex, Seznam,
 * Naver...) de que una URL es nueva o ha cambiado, para que la rastreen al
 * momento en vez de esperar a su próximo rastreo programado. Google no
 * forma parte de este protocolo, así que no acelera la indexación ahí.
 * Best-effort: un fallo aquí nunca debe romper la publicación del artículo.
 */
export async function notifyIndexNowBulk(urls: string[]): Promise<void> {
  if (urls.length === 0) return;
  try {
    const { host } = new URL(urls[0]);
    await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host,
        key: INDEXNOW_KEY,
        keyLocation: `https://${host}/${INDEXNOW_KEY}.txt`,
        urlList: urls,
      }),
    });
  } catch (error) {
    console.error("Error al avisar a IndexNow:", error);
  }
}

export async function notifyIndexNow(url: string): Promise<void> {
  return notifyIndexNowBulk([url]);
}
