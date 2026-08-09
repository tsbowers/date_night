import { eventsService } from "./eventsApi.mjs";
import { tmdbService } from "./streamingApi.mjs";
import { loadHeaderFooter, getUserLocation } from "./utils.mjs";

document.addEventListener("DOMContentLoaded", async () => {
  await loadHeaderFooter();
  await loadSpotlights();
});

async function loadSpotlights() {
  const outTarget = document.getElementById("out-spotlight-target");
  const inTarget = document.getElementById("in-spotlight-target");

  await Promise.all([loadOutSpotlight(outTarget), loadInSpotlight(inTarget)]);
}

// Renders a random local event, using the visitor's real location when they grant it.
async function loadOutSpotlight(target) {
  if (!target) return;

  target.innerHTML =
    '<p style="color: var(--warm-cream);">Loading local event spotlight...</p>';

  const userCoords = await getUserLocation();
  const events = userCoords
    ? await eventsService.fetchLocalEvents({
        lat: userCoords.lat,
        lon: userCoords.lon,
        radius: 50,
      })
    : await eventsService.fetchLocalEvents();

  if (events && events.length > 0) {
    const randomEvent = events[Math.floor(Math.random() * events.length)];
    target.innerHTML = `
      <img src="${randomEvent.image}" alt="${randomEvent.title}" />
      <h3>${randomEvent.title}</h3>
      <p><strong>Category:</strong> ${randomEvent.category} | <strong>Price:</strong> ${randomEvent.price}</p>
      <p>${randomEvent.description ? randomEvent.description.substring(0, 120) : "Check out this event for your next date night."}...</p>
      <a href="/out/index.html" class="btn">Explore Going Out</a>
    `;
  } else {
    target.innerHTML = `
      <h3>Featured Event</h3>
      <p>Discover exciting local concerts, dining, and outdoor date options.</p>
      <a href="/out/index.html" class="btn">Explore Going Out</a>
    `;
  }
}

// Renders a random trending movie from TMDB.
async function loadInSpotlight(target) {
  if (!target) return;

  target.innerHTML =
    '<p style="color: var(--warm-cream);">Loading streaming spotlight...</p>';

  const movies = await tmdbService.fetchTrending();

  if (movies && movies.length > 0) {
    const randomMovie = movies[Math.floor(Math.random() * movies.length)];
    target.innerHTML = `
      <img src="${randomMovie.image}" alt="${randomMovie.title}" />
      <h3>${randomMovie.title} (${randomMovie.releaseYear})</h3>
      <p><strong>Rating:</strong> ⭐ ${randomMovie.rating}</p>
      <p>${randomMovie.description ? randomMovie.description.substring(0, 120) : "A great choice for a cozy night in."}...</p>
      <a href="/in/index.html" class="btn btn-accent">Explore Staying In</a>
    `;
  } else {
    target.innerHTML = `
      <h3>Featured Movie</h3>
      <p>Find top trending movies and shows to watch at home tonight.</p>
      <a href="/in/index.html" class="btn btn-accent">Explore Staying In</a>
    `;
  }
}
