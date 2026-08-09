// src/js/streamingApi.mjs
import { getCachedData, setCachedData } from "./utils.mjs";

const RAPID_API_KEY = import.meta.env.VITE_RAPID_API_KEY;
const HOST = "streaming-availability.p.rapidapi.com";

const baseOptions = {
  method: "GET",
  headers: {
    "x-rapidapi-key": RAPID_API_KEY,
    "x-rapidapi-host": HOST,
  },
};

// Normalize a raw API show object into what our templates expect
function normalizeShow(show) {
  const usOptions = show.streamingOptions?.us || [];
  return {
    id: show.id || String(Math.random()),
    title: show.title || "Featured Title",
    releaseYear: show.releaseYear || show.firstAirYear || "N/A",
    rating: show.rating ? (show.rating / 10).toFixed(1) : "N/A",
    streamingPlatform: usOptions[0]?.service?.name || "Multiple Platforms",
    description: show.overview || "No overview available.",
    image:
      show.imageSet?.verticalPoster?.w360 ||
      show.imageSet?.verticalPoster?.w240 ||
      "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600",
  };
}

// Fetch trending/popular titles for the initial page load
export async function fetchTrendingStreaming() {
  const cacheKey = "trending_streaming";
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  const url = `https://${HOST}/shows/search/filters?country=us&series_granularity=show&order_by=popularity_alltime&desc=true&output_language=en`;

  try {
    const response = await fetch(url, baseOptions);
    if (!response.ok) throw new Error(`Streaming API error: ${response.status}`);

    const result = await response.json();
    const rawShows = result.shows || result.result || [];
    const shows = rawShows.map(normalizeShow);

    setCachedData(cacheKey, shows);
    return shows;
  } catch (error) {
    console.error("Error fetching trending streaming data:", error);
    return [];
  }
}

// Search by title — this is the new function for the "in" page search bar
export async function searchStreamingByTitle(query) {
  if (!query || !query.trim()) return [];

  const cacheKey = `search_${query.trim().toLowerCase()}`;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  const queryParams = new URLSearchParams({
    title: query.trim(),
    country: "us",
    series_granularity: "show",
    output_language: "en",
  });

  const url = `https://${HOST}/shows/search/title?${queryParams.toString()}`;

  try {
    const response = await fetch(url, baseOptions);
    if (!response.ok) throw new Error(`Streaming search error: ${response.status}`);

    const result = await response.json();
    const rawShows = Array.isArray(result) ? result : result.shows || result.result || [];
    const shows = rawShows.map(normalizeShow);

    setCachedData(cacheKey, shows);
    return shows;
  } catch (error) {
    console.error("Error searching streaming titles:", error);
    return [];
  }
}

// Fetch a single show/movie by id — matches the curl endpoint you shared
export async function fetchShowById(id, type = "movie") {
  const cacheKey = `show_${type}_${id}`;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  const url = `https://${HOST}/shows/${type}/${id}`;

  try {
    const response = await fetch(url, baseOptions);
    if (!response.ok) throw new Error(`Show lookup error: ${response.status}`);

    const result = await response.json();
    const show = normalizeShow(result);

    setCachedData(cacheKey, show);
    return show;
  } catch (error) {
    console.error("Error fetching show by id:", error);
    return null;
  }
}