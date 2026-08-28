export const RATING_CATEGORY_SLUG = "analisis";
export const RATING_TOPIC_SLUGS = ["videojuegos", "cine"];

export function articleSupportsRating(category: { slug: string }, topic: { slug: string }) {
  return category.slug === RATING_CATEGORY_SLUG && RATING_TOPIC_SLUGS.includes(topic.slug);
}

export function ratingVerb(topicSlug: string) {
  return topicSlug === "videojuegos" ? "puntuar el juego" : "puntuar la película";
}
