// src/js/streamingApi.mjs
import { getCachedData, setCachedData } from "./utils.mjs";

const TMDB_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

// Normalize a raw TMDB movie object into what our templates expect
function normalizeMovie(movie) {
  return {
    id: movie.id,
    title: movie.title || movie.name || "Featured Title",
    releaseYear: (movie.release_date || movie.first_air_date || "").slice(0, 4) || "N/A",
    rating: movie.vote_average ? movie.vote_average.toFixed(1) : "N/A",
    streamingPlatform: "Check availability", // filled in by fetchWatchProviders when needed
    description: movie.overview || "No overview available.",
    image: movie.poster_path
      ? `${IMAGE_BASE}${movie.poster_path}`
      : "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600",
  };
}

// Fetch trending movies for the initial page load
export async function fetchTrendingStreaming() {
  const cacheKey = "trending_streaming";
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  const url = `${BASE_URL}/trending/movie/week?api_key=${TMDB_KEY}`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`TMDB trending error: ${response.status}`);

    const result = await response.json();
    const movies = (result.results || []).map(normalizeMovie);

    setCachedData(cacheKey, movies);
    return movies;
  } catch (error) {
    console.error("Error fetching trending movies:", error);
    return [];
  }
}

// Search by title
export async function searchStreamingByTitle(query) {
  if (!query || !query.trim()) return [];

  const cacheKey = `search_${query.trim().toLowerCase()}`;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  const url = `${BASE_URL}/search/movie?api_key=${TMDB_KEY}&query=${encodeURIComponent(query.trim())}`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`TMDB search error: ${response.status}`);

    const result = await response.json();
    const movies = (result.results || []).map(normalizeMovie);

    setCachedData(cacheKey, movies);
    return movies;
  } catch (error) {
    console.error("Error searching movies:", error);
    return [];
  }
}

// Optional: fetch which streaming services (US) carry a specific movie by id
export async function fetchWatchProviders(id) {
  const cacheKey = `providers_${id}`;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  const url = `${BASE_URL}/movie/${id}/watch/providers?api_key=${TMDB_KEY}`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`TMDB providers error: ${response.status}`);

    const result = await response.json();
    const usProviders = result.results?.US?.flatrate || [];
    const names = usProviders.map((p) => p.provider_name);

    setCachedData(cacheKey, names);
    return names;
  } catch (error) {
    console.error("Error fetching watch providers:", error);
    return [];
  }
}