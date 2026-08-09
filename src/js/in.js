import { fetchTrendingStreaming, searchStreamingByTitle } from "./streamingApi.mjs";
import { loadHeaderFooter, renderListWithTemplate } from "./utils.mjs";

document.addEventListener("DOMContentLoaded", async () => {
  await loadHeaderFooter();
  await displayTrending();
  wireSearch();
});

function movieCardTemplate(movie) {
  return `
    <li class="movie-card">
      <div class="movie-image-wrapper">
        <img src="${movie.image}" alt="${movie.title}" loading="lazy" />
      </div>
      <div class="movie-details">
        <h3>${movie.title} ${movie.releaseYear ? `(${movie.releaseYear})` : ""}</h3>
        <p class="movie-meta">
          <span>⭐ ${movie.rating}</span> • <span>📺 ${movie.streamingPlatform}</span>
        </p>
        <p class="movie-description">
          ${movie.description ? movie.description.substring(0, 100) : "No description provided."}...
        </p>
      </div>
    </li>
  `;
}

async function displayTrending() {
  const container = document.querySelector(".movie-list");
  if (!container) return;

  container.innerHTML = '<p style="color: var(--warm-cream);">Loading trending picks...</p>';

  const movies = await fetchTrendingStreaming();

  if (!movies || movies.length === 0) {
    container.innerHTML = '<p class="no-results">No trending titles available right now.</p>';
    return;
  }

  renderListWithTemplate(movieCardTemplate, container, movies, "afterbegin", true);
}

function wireSearch() {
  const input = document.getElementById("movie-search-input");
  const button = document.getElementById("movie-search-btn");
  if (!input || !button) return;

  const runSearch = () => handleSearch(input.value);

  button.addEventListener("click", runSearch);
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") runSearch();
  });
}

async function handleSearch(query) {
  const container = document.querySelector(".movie-list");
  if (!container) return;

  if (!query || !query.trim()) {
    await displayTrending();
    return;
  }

  container.innerHTML = '<p style="color: var(--warm-cream);">Searching...</p>';

  try {
    const results = await searchStreamingByTitle(query);

    if (!results || results.length === 0) {
      container.innerHTML = `<p class="no-results">No results found for "${query}".</p>`;
      return;
    }

    renderListWithTemplate(movieCardTemplate, container, results, "afterbegin", true);
  } catch (error) {
    console.error("Search failed:", error);
    container.innerHTML = '<p class="error-msg">Something went wrong searching. Try again.</p>';
  }
}