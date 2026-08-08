import { fetchLocalEvents } from './eventsApi.mjs';
import { fetchTrendingStreaming } from './streamingApi.mjs';

document.addEventListener('DOMContentLoaded', async () => {
  await loadSpotlights();
});

async function loadSpotlights() {
  const outTarget = document.getElementById('out-spotlight-target');
  const inTarget = document.getElementById('in-spotlight-target');

  // Load Go Out Spotlight from LotaData API
  if (outTarget) {
    outTarget.innerHTML = '<p style="color: var(--warm-cream);">Loading local event spotlight...</p>';
    const events = await fetchLocalEvents();

    if (events && events.length > 0) {
      // Pick a random event from the returned API list
      const randomEvent = events[Math.floor(Math.random() * events.length)];
      outTarget.innerHTML = `
        <img src="${randomEvent.image}" alt="${randomEvent.title}" />
        <h3>${randomEvent.title}</h3>
        <p><strong>Category:</strong> ${randomEvent.category} | <strong>Price:</strong> ${randomEvent.price}</p>
        <p>${randomEvent.description.substring(0, 120)}...</p>
        <a href="/out/index.html" class="btn">Explore Going Out</a>
      `;
    } else {
      outTarget.innerHTML = `
        <h3>Featured Event</h3>
        <p>Discover exciting local concerts, dining, and outdoor date options.</p>
        <a href="/out/index.html" class="btn">Explore Going Out</a>
      `;
    }
  }

  // Load Stay In Spotlight from Movie of the Night API
  if (inTarget) {
    inTarget.innerHTML = '<p style="color: var(--warm-cream);">Loading streaming spotlight...</p>';
    const movies = await fetchTrendingStreaming();

    if (movies && movies.length > 0) {
      // Pick a random movie from the returned API list
      const randomMovie = movies[Math.floor(Math.random() * movies.length)];
      inTarget.innerHTML = `
        <img src="${randomMovie.image}" alt="${randomMovie.title}" />
        <h3>${randomMovie.title} (${randomMovie.releaseYear})</h3>
        <p><strong>Rating:</strong> ⭐ ${randomMovie.rating} | <strong>Platform:</strong> ${randomMovie.streamingPlatform}</p>
        <p>${randomMovie.description.substring(0, 120)}...</p>
        <a href="/in/index.html" class="btn btn-accent">Explore Staying In</a>
      `;
    } else {
      inTarget.innerHTML = `
        <h3>Featured Movie</h3>
        <p>Find top trending movies and shows to watch at home tonight.</p>
        <a href="/in/index.html" class="btn btn-accent">Explore Staying In</a>
      `;
    }
  }
}