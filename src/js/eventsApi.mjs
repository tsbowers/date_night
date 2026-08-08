import { getCachedData, setCachedData } from './utils.mjs';

const TICKETMASTER_KEY = 'qygDCWISyVEJqT6HkZpoylb9b83ACWMA';

export async function fetchLocalEvents(params = { lat: 40.7128, lon: -74.0060, radius: 50 }) {
  const cacheKey = `tm_events_v2_${params.lat}_${params.lon}`;
  
  const cached = getCachedData(cacheKey);
  if (cached && cached.length > 0) return cached;

  const queryParams = new URLSearchParams({
    apikey: TICKETMASTER_KEY,
    geoPoint: `${params.lat},${params.lon}`,
    radius: params.radius,
    unit: 'miles',
    size: 20,
    sort: 'date,asc'
  });

  const url = `https://app.ticketmaster.com/discovery/v2/events.json?${queryParams.toString()}`;

  try {
    const response = await fetch(url);
    console.log('Ticketmaster Response Status:', response.status);

    if (!response.ok) {
      console.warn(`Ticketmaster returned HTTP ${response.status}. Please ensure TICKETMASTER_KEY is set.`);
      return getFallbackEvents();
    }
    
    const result = await response.json();
    const rawEvents = result._embedded?.events || [];

    if (rawEvents.length === 0) {
      return getFallbackEvents();
    }

    const events = rawEvents.map(event => {
      const venue = event._embedded?.venues?.[0];
      const image = event.images?.find(img => img.width > 500) || event.images?.[0];

      return {
        id: event.id || String(Math.random()),
        title: event.name || 'Local Event',
        description: event.pleaseNote || event.info || 'No details specified for this event.',
        category: event.classifications?.[0]?.segment?.name || 'Live Event',
        startDate: event.dates?.start?.localDate || 'Upcoming',
        address: venue ? `${venue.name || ''}, ${venue.city?.name || ''}` : 'Local Venue',
        price: event.priceRanges?.[0] ? `$${event.priceRanges[0].min}` : 'See Details',
        distance: 'Nearby',
        image: image?.url || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600',
        url: event.url || '#'
      };
    });

    setCachedData(cacheKey, events);
    return events;
  } catch (error) {
    console.error('Fetch error caught:', error);
    return getFallbackEvents();
  }
}

function getFallbackEvents() {
  return [
    {
      id: 'fallback-1',
      title: 'Candlelight Jazz & Rooftop Dinner',
      description: 'An evening of live jazz standards paired with artisan cocktails and city views.',
      category: 'Music & Dining',
      startDate: 'Tonight',
      address: 'Downtown Arts District',
      price: '$45.00',
      distance: '2 miles',
      image: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=600',
      url: 'https://www.ticketmaster.com'
    },
    {
      id: 'fallback-2',
      title: 'Broadway Theater Night',
      description: 'Award-winning musical performance live on stage.',
      category: 'Theater',
      startDate: 'Tomorrow',
      address: 'Grand Theater',
      price: '$75.00',
      distance: '4 miles',
      image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600',
      url: 'https://www.ticketmaster.com'
    }
  ];
}