import { getCachedData, setCachedData } from "./utils.mjs";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE = "https://image.tmdb.org/t/p/w500";
const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600";


export class TMDBService {
  constructor(apiKey) {
    this.apiKey = apiKey;
  }

  /**
   * Converts a raw TMDB movie object into the shape the UI expects.
   * @param {object} movie - raw TMDB movie/show result
   * @returns {object} normalized movie record
   */
  #normalizeMovie(movie) {
    return {
      id: movie.id,
      title: movie.title || movie.name || "Featured Title",
      releaseYear: (movie.release_date || movie.first_air_date || "").slice(0, 4) || "N/A",
      rating: movie.vote_average ? movie.vote_average.toFixed(1) : "N/A",
      voteCount: movie.vote_count ?? 0,
      popularity: movie.popularity ?? 0,
      genreIds: movie.genre_ids || [],
      description: movie.overview || "No overview available.",
      image: movie.poster_path ? `${IMAGE_BASE}${movie.poster_path}` : FALLBACK_IMAGE,
    };
  }

  /**
   * Fetches this week's trending movies.
   * @returns {Promise<object[]>}
   */
  async fetchTrending() {
    const cacheKey = "trending_streaming";
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    const url = `${BASE_URL}/trending/movie/week?api_key=${this.apiKey}`;

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`TMDB trending error: ${response.status}`);

      const result = await response.json();
      const movies = (result.results || []).map((movie) => this.#normalizeMovie(movie));

      setCachedData(cacheKey, movies);
      return movies;
    } catch (error) {
      console.error("Error fetching trending movies:", error);
      return [];
    }
  }

  /**
   * Searches TMDB for movies matching a title query.
   * @param {string} query
   * @returns {Promise<object[]>}
   */
  async searchByTitle(query) {
    if (!query || !query.trim()) return [];

    const trimmed = query.trim();
    const cacheKey = `search_${trimmed.toLowerCase()}`;
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    const url = `${BASE_URL}/search/movie?api_key=${this.apiKey}&query=${encodeURIComponent(trimmed)}`;

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`TMDB search error: ${response.status}`);

      const result = await response.json();
      const movies = (result.results || []).map((movie) => this.#normalizeMovie(movie));

      setCachedData(cacheKey, movies);
      return movies;
    } catch (error) {
      console.error("Error searching movies:", error);
      return [];
    }
  }

  /**
   * Looks up US streaming providers for a given TMDB movie id.
   * @param {number|string} id
   * @returns {Promise<string[]>} provider names
   */
  async fetchWatchProviders(id) {
    const cacheKey = `providers_${id}`;
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    const url = `${BASE_URL}/movie/${id}/watch/providers?api_key=${this.apiKey}`;

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`TMDB providers error: ${response.status}`);

      const result = await response.json();
      const usProviders = result.results?.US?.flatrate || [];
      const names = usProviders.map((provider) => provider.provider_name);

      setCachedData(cacheKey, names);
      return names;
    } catch (error) {
      console.error("Error fetching watch providers:", error);
      return [];
    }
  }
}

// Single shared instance used throughout the app.
export const tmdbService = new TMDBService(API_KEY);