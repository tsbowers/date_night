import { getCachedData, setCachedData } from './utils.mjs';

// Free Ticketmaster API Key
const TICKETMASTER_KEY = '7elT6gA43j5p6A9AGAGx1G63gG06086G'; 

export async function fetchLocalEvents(params = { lat: 40.7128, lon: -74.0060, radius: 50 }) {
  const cacheKey = `tm_events_${params.lat}_${params.lon}`;
  
  const cached = getCachedData(cacheKey);
  if (cached && cached.length > 0) return cached;

  // Convert lat/lon into Ticketmaster's geoPoint format (lat,long)
  const queryParams = new URLSearchParams({
    apikey: '7elT6gA43j5p6A9AGAGx1G63gG06086G', // Fallback key or replace with your key from developer.ticketmaster.com
    geoPoint: `${params.lat},${params.lon}`,
    radius: params.radius,
    unit: 'miles',
    size: 20,
    sort: 'date,asc'
  });

  const url = `https://app.ticketmaster.com/discovery/v2/events.json?${queryParams.toString()}`;

  try {
    const response = await fetch(url);
    console.log('Ticketmaster API Status:', response.status);

    if (!response.ok) {
      const errorMsg = await response.text();
      console.error('API Error details:', errorMsg);
      return [];
    }
    
    const result = await response.json();
    console.log('Ticketmaster API Payload:', result);

    const rawEvents = result._embedded?.events || [];

    const events = rawEvents.map(event => {
      const venue = event._embedded?.venues?.[0];
      const image = event.images?.find(img => img.width > 500) || event.images?.[0];

      return {
        id: event.id || String(Math.random()),
        title: event.name || 'Local Event',
        description: event.pleaseNote || event.info || 'No description provided.',
        category: event.classifications?.[0]?.segment?.name || 'General',
        startDate: event.dates?.start?.localDate || 'Upcoming',
        address: venue ? `${venue.name || ''}, ${venue.city?.name || ''}` : 'Local Venue',
        price: event.priceRanges?.[0] ? `$${event.priceRanges[0].min}` : 'Varies',
        distance: 'Nearby',
        image: image?.url || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600',
        url: event.url || '#'
      };
    });

    setCachedData(cacheKey, events);
    return events;
  } catch (error) {
    console.error('Fetch error:', error);
    return [];
  }
}