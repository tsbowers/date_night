import { getCachedData, setCachedData } from './utils.mjs';

const RAPID_API_KEY = '8f5afc3d5amsh8598cd8e8df1036p1bb319jsn1be134821cab';
const HOST = 'global-hyper-local-events.p.rapidapi.com';

export async function fetchLocalEvents(params = { lat: 43.826, lon: -111.789, radius: 25 }) {
  const cacheKey = `events_${params.lat}_${params.lon}`;
  
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  const queryString = new URLSearchParams({
    lat: params.lat,
    lon: params.lon,
    radius: params.radius,
    ...(params.category && { category: params.category })
  }).toString();

  const url = `https://${HOST}/events?${queryString}`;
  const options = {
    method: 'GET',
    headers: {
      'x-rapidapi-key': RAPID_API_KEY,
      'x-rapidapi-host': HOST
    }
  };
 
  try {
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`Events API error: ${response.status}`);
    
    const result = await response.json();
    
    // Normalizing JSON response properties
    const events = (result.events || result || []).map(event => ({
      id: event.id || event.event_id || String(Math.random()),
      title: event.title || event.name || 'Local Event',
      description: event.description || 'No description provided.',
      category: event.category || 'General',
      startDate: event.start_datetime || 'Upcoming',
      address: event.address || 'Local Venue',
      price: event.price ? `$${event.price}` : 'Free / Varies',
      distance: event.distance ? `${Math.round(event.distance)} miles` : 'Nearby',
      image: event.image_url || event.image || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600',
      url: event.url || '#'
    }));

    setCachedData(cacheKey, events);
    return events;
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
}
