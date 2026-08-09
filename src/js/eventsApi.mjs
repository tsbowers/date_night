import { getCachedData, setCachedData } from "./utils.mjs";

const API_KEY = import.meta.env.VITE_TICKETMASTER_API_KEY;
const DEFAULT_LAT = 40.7128;
const DEFAULT_LON = -74.006;

/**
 * Wraps calls to the Ticketmaster Discovery API for local event listings.
 * Falls back to a small static list of sample events if the live request
 * fails or returns nothing nearby, so the UI never dead-ends.
 */
export class TicketmasterService {
  constructor(apiKey) {
    this.apiKey = apiKey;
  }

  /**
   * Converts a raw Ticketmaster event object into the shape the UI expects.
   * @param {object} event - raw Ticketmaster event
   * @returns {object} normalized event record
   */
  #normalizeEvent(event) {
    const venue = event._embedded?.venues?.[0];
    const image = event.images?.find((img) => img.width > 500) || event.images?.[0];

    return {
      id: event.id || String(Math.random()),
      title: event.name || "Local Event",
      description: event.pleaseNote || event.info || "No details specified for this event.",
      category: event.classifications?.[0]?.segment?.name || "Live Event",
      startDate: event.dates?.start?.localDate || "Upcoming",
      address: venue ? `${venue.name || ""}, ${venue.city?.name || ""}` : "Local Venue",
      price: event.priceRanges?.[0] ? `$${event.priceRanges[0].min}` : "See Details",
      image: image?.url || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600",
      url: event.url || "#",
    };
  }

  /**
   * Small static fallback list shown when the live API is unavailable or
   * returns no nearby results.
   * @returns {object[]}
   */
  #getFallbackEvents() {
    return [
      {
        id: "fallback-1",
        title: "Candlelight Jazz & Rooftop Dinner",
        description: "An evening of live jazz standards paired with artisan cocktails and city views.",
        category: "Music & Dining",
        startDate: "Tonight",
        address: "Downtown Arts District",
        price: "$45.00",
        image: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=600",
        url: "https://www.ticketmaster.com",
      },
      {
        id: "fallback-2",
        title: "Broadway Theater Night",
        description: "Award-winning musical performance live on stage.",
        category: "Theater",
        startDate: "Tomorrow",
        address: "Grand Theater",
        price: "$75.00",
        image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600",
        url: "https://www.ticketmaster.com",
      },
    ];
  }

  /**
   * Fetches local events near the given coordinates (or a default city
   * if none are provided).
   * @param {{lat?: number, lon?: number, radius?: number}} params
   * @returns {Promise<object[]>}
   */
  async fetchLocalEvents(params = {}) {
    const lat = params.lat || DEFAULT_LAT;
    const lon = params.lon || DEFAULT_LON;
    const radius = params.radius || 50;

    const roundedLat = Number(lat).toFixed(2);
    const roundedLon = Number(lon).toFixed(2);
    const cacheKey = `tm_events_geo_${roundedLat}_${roundedLon}`;

    const cached = getCachedData(cacheKey);
    if (cached && cached.length > 0) return cached;

    const queryParams = new URLSearchParams({
      apikey: this.apiKey,
      geoPoint: `${lat},${lon}`,
      radius,
      unit: "miles",
      size: 20,
      sort: "date,asc",
    });

    const url = `https://app.ticketmaster.com/discovery/v2/events.json?${queryParams.toString()}`;

    try {
      const response = await fetch(url);

      if (!response.ok) {
        console.warn(`Ticketmaster returned HTTP ${response.status}.`);
        return this.#getFallbackEvents();
      }

      const result = await response.json();
      const rawEvents = result._embedded?.events || [];

      if (rawEvents.length === 0) {
        return this.#getFallbackEvents();
      }

      const events = rawEvents.map((event) => this.#normalizeEvent(event));

      setCachedData(cacheKey, events);
      return events;
    } catch (error) {
      console.error("Error fetching local events:", error);
      return this.#getFallbackEvents();
    }
  }
}

// Single shared instance used throughout the app.
export const eventsService = new TicketmasterService(API_KEY);