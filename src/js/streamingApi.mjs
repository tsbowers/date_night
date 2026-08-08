// src/js/streamingApi.mjs
import { getCachedData, setCachedData } from './utils.mjs';

const RAPID_API_KEY = 'fill in later';
const HOST = 'movie-of-the-night-streaming-availability-with-subtitles.p.rapidapi.com';

export async function fetchTrendingStreaming() {
  const cacheKey = 'trending_streaming';
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  const url = `https://${HOST}/shows/search/filters?country=us&series_granularity=show&order_by=popularity_alltime&descending=true&output_language=en`;
  
  const options = {
    method: 'GET',
    headers: {
      'x-rapidapi-key': RAPID_API_KEY,
      'x-rapidapi-host': HOST
    }
  };

  try {
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`Streaming API error: ${response.status}`);
    
    const result = await response.json();
    const shows = (result.shows || result || []).map(show => ({
      id: show.id || String(Math.random()),
      title: show.title || 'Featured Movie',
      releaseYear: show.releaseYear || show.year || '2024',
      rating: show.rating ? (show.rating / 10).toFixed(1) : 'N/A',
      streamingPlatform: show.streamingOptions?.us?.[0]?.service?.name || 'Popular Platforms',
      description: show.overview || show.description || 'No overview available.',
      image: show.imageSet?.verticalPoster?.w360 || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600'
    }));

    setCachedData(cacheKey, shows);
    return shows;
  } catch (error) {
    console.error('Error fetching streaming data:', error);
    return [];
  }
}