// src/js/eventsApi.mjs
import { getCachedData, setCachedData } from './utils.mjs';

const RAPID_API_KEY = '8f5afc3d5amsh8598cd8e8df1036p1bb319jsn1be134821cab';
const HOST = 'lotadata-events-v1.p.rapidapi.com'; // Corrected host

export async function fetchLocalEvents(params = { lat: 40.7128, lon: -74.0060, radius: 50 }) {
  const cacheKey = `events_v3_${params.lat}_${params.lon}`;
  
  const cached = getCachedData(cacheKey);
  if (cached && cached.length > 0) return cached;

  const queryParams = new URLSearchParams({
    lat: params.lat,
    lon: params.lon,
    radius: params.radius
  });

  // Updated URL path from /events to /events/search
  const url = `https://${HOST}/events/search?${queryParams.toString()}`;
  
  const options = {
    method: 'GET',
    headers: {
      'x-rapidapi-key': RAPID_API_KEY,
      'x-rapidapi-host': HOST
    }
  };

  try {
    const response = await fetch(url, options);
    console.log('Events API Status:', response.status);

    if (!response.ok) {
      const errorMsg = await response.text();
      console.error('API Error details:', errorMsg);
      return []; // Return empty array so we know real data failed
    }
    
    const result = await response.json();
    console.log('Live API Response:', result);

    const rawEvents = Array.isArray(result) 
      ? result 
      : (result.events || result.data || result.results || []);

    const events = rawEvents.map(event => ({
      id: event.id || event.event_id || String(Math.random()),
      title: event.title || event.name || 'Local Event',
      description: event.description || event.summary || 'No description provided.',
      category: event.category || 'General',
      startDate: event.start_datetime || event.start_date || 'Upcoming',
      address: event.address || event.venue_name || 'Local Venue',
      price: event.price ? `$${event.price}` : 'Free / Varies',
      distance: event.distance ? `${Math.round(event.distance)} miles` : 'Nearby',
      image: event.image_url || event.image || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600',
      url: event.url || event.event_url || '#'
    }));

    setCachedData(cacheKey, events);
    return events;
  } catch (error) {
    console.error('Fetch error:', error);
    return [];
  }
}