export type ReleaseItem = {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string | null;
  href: string;
};

function formatDateEs(dateStr: string): string {
  try {
    return new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short" }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

/**
 * Pelis actualmente en cartelera en España, vía la API pública de TMDB.
 * Si no hay TMDB_API_KEY configurada, o la API falla, devuelve una lista
 * vacía en vez de romper la portada — el widget simplemente no se muestra.
 */
export async function getNowPlayingMovies(limit = 6): Promise<ReleaseItem[]> {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) return [];

  try {
    const url = `https://api.themoviedb.org/3/movie/now_playing?language=es-ES&region=ES&page=1&api_key=${apiKey}`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error(`TMDB respondió ${res.status}`);
    const data = await res.json();

    return (data.results ?? []).slice(0, limit).map((movie: any) => ({
      id: String(movie.id),
      title: movie.title,
      subtitle: movie.release_date ? `Estreno: ${formatDateEs(movie.release_date)}` : "",
      imageUrl: movie.poster_path ? `https://image.tmdb.org/t/p/w342${movie.poster_path}` : null,
      href: `https://www.themoviedb.org/movie/${movie.id}`,
    }));
  } catch (error) {
    console.error("Error al obtener estrenos de cine de TMDB:", error);
    return [];
  }
}

/**
 * Videojuegos lanzados recientemente (últimos 60 días), vía la API pública
 * de RAWG. Mismo criterio que TMDB: sin clave o con fallo, lista vacía.
 */
export async function getLatestGameReleases(limit = 6): Promise<ReleaseItem[]> {
  const apiKey = process.env.RAWG_API_KEY;
  if (!apiKey) return [];

  try {
    const today = new Date();
    const past = new Date(today.getTime() - 60 * 24 * 60 * 60 * 1000);
    const dates = `${past.toISOString().slice(0, 10)},${today.toISOString().slice(0, 10)}`;
    const url = `https://api.rawg.io/api/games?key=${apiKey}&dates=${dates}&ordering=-released&page_size=${limit}`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error(`RAWG respondió ${res.status}`);
    const data = await res.json();

    return (data.results ?? []).slice(0, limit).map((game: any) => ({
      id: String(game.id),
      title: game.name,
      subtitle: game.released ? `Lanzado: ${formatDateEs(game.released)}` : "",
      imageUrl: game.background_image ?? null,
      href: `https://rawg.io/games/${game.slug}`,
    }));
  } catch (error) {
    console.error("Error al obtener lanzamientos de videojuegos de RAWG:", error);
    return [];
  }
}
