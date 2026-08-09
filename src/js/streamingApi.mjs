import { getCachedData, setCachedData } from "./utils.mjs";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE = "https://image.tmdb.org/t/p/w500";
const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600";
const GENRE_CACHE_KEY = "tmdb_genre_map";
const CACHE_VERSION = "v2";

export class TMDBService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.genreMap = null;
  }

  /**
   * Fetches and caches the TMDB movie genre id -> name map. The map rarely
   * changes, so it's cached in localStorage alongside other API responses.
   * @returns {Promise<Record<number, string>>}
   */
  async #getGenreMap() {
    if (this.genreMap) return this.genreMap;

    const cached = getCachedData(GENRE_CACHE_KEY);
    if (cached) {
      this.genreMap = cached;
      return cached;
    }

    const url = `${BASE_URL}/genre/movie/list?api_key=${this.apiKey}`;

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`TMDB genre list error: ${response.status}`);

      const result = await response.json();
      const map = {};
      (result.genres || []).forEach((genre) => {
        map[genre.id] = genre.name;
      });

      this.genreMap = map;
      setCachedData(GENRE_CACHE_KEY, map);
      return map;
    } catch (error) {
      console.error("Error fetching genre list:", error);
      return {};
    }
  }

  /**
   * Converts a raw TMDB movie object into the shape the UI expects.
   * @param {object} movie - raw TMDB movie/show result
   * @param {Record<number, string>} genreMap - id -> name lookup
   * @returns {object} normalized movie record
   */
  #normalizeMovie(movie, genreMap) {
    const genreIds = movie.genre_ids || [];
    const genreNames = genreIds.map((id) => genreMap[id]).filter(Boolean);

    return {
      id: movie.id,
      title: movie.title || movie.name || "Featured Title",
      releaseYear: (movie.release_date || movie.first_air_date || "").slice(0, 4) || "N/A",
      rating: movie.vote_average ? movie.vote_average.toFixed(1) : "N/A",
      voteCount: movie.vote_count ?? 0,
      popularity: movie.popularity ?? 0,
      genreIds,
      genreNames,
      description: movie.overview || "No overview available.",
      image: movie.poster_path ? `${IMAGE_BASE}${movie.poster_path}` : FALLBACK_IMAGE,
    };
  }

  /**
   * Fetches this week's trending movies.
   * @returns {Promise<object[]>}
   */
  async fetchTrending() {
    const cacheKey = `trending_streaming_${CACHE_VERSION}`;
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    const url = `${BASE_URL}/trending/movie/week?api_key=${this.apiKey}`;

    try {
      const [response, genreMap] = await Promise.all([fetch(url), this.#getGenreMap()]);
      if (!response.ok) throw new Error(`TMDB trending error: ${response.status}`);

      const result = await response.json();
      const movies = (result.results || []).map((movie) => this.#normalizeMovie(movie, genreMap));

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
    const cacheKey = `search_${CACHE_VERSION}_${trimmed.toLowerCase()}`;
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    const url = `${BASE_URL}/search/movie?api_key=${this.apiKey}&query=${encodeURIComponent(trimmed)}`;

    try {
      const [response, genreMap] = await Promise.all([fetch(url), this.#getGenreMap()]);
      if (!response.ok) throw new Error(`TMDB search error: ${response.status}`);

      const result = await response.json();
      const movies = (result.results || []).map((movie) => this.#normalizeMovie(movie, genreMap));

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

export const tmdbService = new TMDBService(API_KEY);