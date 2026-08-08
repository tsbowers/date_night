import { fetchLocalEvents } from './eventsApi.mjs';
import { loadHeaderFooter, renderListWithTemplate } from './utils.mjs';

document.addEventListener('DOMContentLoaded', async () => {
  await loadHeaderFooter();
  await displayEvents();
});

function eventCardTemplate(event) {
  return `
    <article class="event-card">
      <div class="event-image-wrapper">
        <img src="${event.image}" alt="${event.title}" loading="lazy" />
        <span class="event-category">${event.category}</span>
      </div>
      <div class="event-details">
        <h3>${event.title}</h3>
        <p class="event-meta">
          <span>📅 ${event.startDate}</span> • <span>🏷️ ${event.price}</span>
        </p>
        <p class="event-address">📍 ${event.address}</p>
        <p class="event-description">
          ${event.description ? event.description.substring(0, 100) : 'No description provided.'}...
        </p>
        <a href="${event.url}" target="_blank" rel="noopener noreferrer" class="btn">
          Get Tickets / Details
        </a>
      </div>
    </article>
  `;
}

// Helper function to get the user's current GPS location
function getUserLocation() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      console.warn('Geolocation is not supported by this browser.');
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude
        });
      },
      (error) => {
        console.warn('Geolocation access denied or failed:', error.message);
        resolve(null); // Fallback to default coordinates inside eventsApi
      },
      { timeout: 8000 }
    );
  });
}

async function displayEvents() {
  const container = document.getElementById('events-grid');
  if (!container) return;

  container.innerHTML = '<p style="color: var(--warm-cream);">Detecting your location...</p>';

  try {
    // 1. Request user's coordinates
    const userCoords = await getUserLocation();

    // 2. Pass user location if available, otherwise fetchLocalEvents uses default fallback
    const events = userCoords 
      ? await fetchLocalEvents({ lat: userCoords.lat, lon: userCoords.lon, radius: 50 })
      : await fetchLocalEvents();

    if (!events || events.length === 0) {
      container.innerHTML = '<p class="no-results">No local events found in your area right now.</p>';
      return;
    }

    renderListWithTemplate(eventCardTemplate, container, events, 'afterbegin', true);
  } catch (error) {
    console.error('Error rendering events page:', error);
    container.innerHTML = '<p class="error-msg">Failed to load local events.</p>';
  }
}