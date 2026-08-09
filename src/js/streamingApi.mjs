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

export async function fetchTrendingStreaming() {
  const cacheKey = "trending_streaming";
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  const url = `https://${HOST}/shows/search/filters?country=us&series_granularity=show&order_by=popularity_alltime&desc=true&output_language=en`;

  try {
    const response = await fetch(url, baseOptions);

    if (response.status === 429) {
      // Rate limited / quota exceeded on RapidAPI - don't retry, surface a clear signal
      throw new Error("RATE_LIMITED");
    }
    if (!response.ok) throw new Error(`Streaming API error: ${response.status}`);

    const result = await response.json();
    console.log("RAW API RESPONSE (trending):", result);
    const rawShows = result.shows || result.result || [];
    const shows = rawShows.map(normalizeShow);

    setCachedData(cacheKey, shows);
    return shows;
  } catch (error) {
    if (error.message === "RATE_LIMITED") {
      console.warn("RapidAPI quota exceeded - showing fallback state.");
    } else {
      console.error("Error fetching trending streaming data:", error);
    }
    return [];
  }
}

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

    if (response.status === 429) {
      throw new Error("RATE_LIMITED");
    }
    if (!response.ok) throw new Error(`Streaming search error: ${response.status}`);

    const result = await response.json();
    console.log("RAW API RESPONSE (search):", result);
    const rawShows = Array.isArray(result) ? result : result.shows || result.result || [];
    const shows = rawShows.map(normalizeShow);

    setCachedData(cacheKey, shows);
    return shows;
  } catch (error) {
    if (error.message === "RATE_LIMITED") {
      console.warn("RapidAPI quota exceeded during search.");
    } else {
      console.error("Error searching streaming titles:", error);
    }
    return [];
  }
}

export async function fetchShowById(id, type = "movie") {
  const cacheKey = `show_${type}_${id}`;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  const url = `https://${HOST}/shows/${type}/${id}`;

  try {
    const response = await fetch(url, baseOptions);

    if (response.status === 429) {
      throw new Error("RATE_LIMITED");
    }
    if (!response.ok) throw new Error(`Show lookup error: ${response.status}`);

    const result = await response.json();
    const show = normalizeShow(result);

    setCachedData(cacheKey, show);
    return show;
  } catch (error) {
    if (error.message === "RATE_LIMITED") {
      console.warn("RapidAPI quota exceeded during show lookup.");
    } else {
      console.error("Error fetching show by id:", error);
    }
    return null;
  }
}