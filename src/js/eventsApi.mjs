import { getCachedData, setCachedData } from './utils.mjs';

const RAPID_API_KEY = '8f5afc3d5amsh8598cd8e8df1036p1bb319jsn1be134821cab';
const HOST = 'global-hyper-local-events.p.rapidapi.com';

// Fallback date night events for testing when API quota/location yields 0 results
const FALLBACK_EVENTS = [
  {
    id: 'nyc-1',
    title: 'Broadway Musical & Rooftop Dinner',
    description: 'Experience a world-class Broadway show followed by dinner overlooking the NYC skyline.',
    category: 'Theater & Dining',
    startDate: 'Tonight at 7:00 PM',
    address: 'Times Square, New York, NY',
    price: '$85.00',
    distance: '1 mile',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600',
    url: 'https://www.broadway.com'
  },
  {
    id: 'nyc-2',
    title: 'Candlelight Jazz Night at Blue Note',
    description: 'An intimate evening of live smooth jazz with artisan cocktails and small bites.',
    category: 'Music & Drinks',
    startDate: 'Tomorrow at 8:30 PM',
    address: 'Greenwich Village, New York, NY',
    price: '$35.00',
    distance: '3 miles',
    image: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=600',
    url: 'https://www.bluenotejazz.com'
  },
  {
    id: 'nyc-3',
    title: 'Central Park Moonlight Stroll & Dessert',
    description: 'Guided evening walk through Central Park followed by handmade gelato.',
    category: 'Outdoors & Food',
    startDate: 'This Weekend',
    address: 'Central Park South, NY',
    price: '$20.00',
    distance: '2 miles',
    image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600',
    url: 'https://www.centralparknyc.org'
  }
];

export async function fetchLocalEvents(params = { lat: 40.7128, lon: -74.0060, radius: 100 }) {
  // Bypassing stale empty cache keys by adding nyc_v2 suffix
  const cacheKey = `events_nyc_v2_${params.lat}_${params.lon}`;
  
  const cached = getCachedData(cacheKey);
  if (cached && cached.length > 0) return cached;

  const queryParams = new URLSearchParams({
    lat: params.lat,
    lon: params.lon,
    radius: params.radius
  });

  const url = `https://${HOST}/events?${queryParams.toString()}`;
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
      console.warn('API error or rate limit hit, using fallback events.');
      return FALLBACK_EVENTS;
    }
    
    const result = await response.json();
    console.log('Events API Payload:', result);

    const rawEvents = Array.isArray(result) 
      ? result 
      : (result.events || result.data || result.results || []);

    if (rawEvents.length === 0) {
      console.log('No live events returned from RapidAPI for NYC, rendering fallback date ideas.');
      return FALLBACK_EVENTS;
    }

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
    console.error('Error fetching events, serving fallback:', error);
    return FALLBACK_EVENTS;
  }
}