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
        <p class="event-description">
          ${event.description ? event.description.substring(0, 110) : 'No description provided.'}...
        </p>
        <a href="${event.url}" target="_blank" rel="noopener noreferrer" class="btn">
          View Event Details
        </a>
      </div>
    </article>
  `;
}

async function displayEvents() {
  const container = document.getElementById('events-grid');
  if (!container) return;

  try {
    // Calling NYC coordinates specifically (New York City)
    const events = await fetchLocalEvents({ lat: 40.7128, lon: -74.0060, radius: 100 });

    if (!events || events.length === 0) {
      container.innerHTML = '<p class="no-results">No local events found.</p>';
      return;
    }

    renderListWithTemplate(eventCardTemplate, container, events, 'afterbegin', true);
  } catch (error) {
    console.error('Error rendering events page:', error);
    container.innerHTML = '<p class="error-msg">Failed to load local events.</p>';
  }
}