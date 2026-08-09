import { tmdbService } from "./streamingApi.mjs";
import { loadHeaderFooter, renderListWithTemplate } from "./utils.mjs";

document.addEventListener("DOMContentLoaded", async () => {
  await loadHeaderFooter();
  await displayTrending();
  wireSearch();
  wireWatchButtons();
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
          <span>⭐ ${movie.rating}</span>
        </p>
        <p class="movie-description">
          ${movie.description ? movie.description.substring(0, 100) : "No description provided."}...
        </p>
        <button class="btn btn-accent watch-btn" data-id="${movie.id}" type="button">
          Where to Watch
        </button>
        <div class="watch-providers" data-providers-for="${movie.id}"></div>
      </div>
    </li>
  `;
}

async function displayTrending() {
  const container = document.querySelector(".movie-list");
  if (!container) return;

  container.innerHTML =
    '<p style="color: var(--warm-cream);">Loading trending picks...</p>';

  const movies = await tmdbService.fetchTrending();

  if (!movies || movies.length === 0) {
    container.innerHTML =
      '<p class="no-results">No trending titles available right now.</p>';
    return;
  }

  renderListWithTemplate(
    movieCardTemplate,
    container,
    movies,
    "afterbegin",
    true,
  );
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

// Event delegation on the list container: works for cards rendered now
// AND cards re-rendered later after a search.
function wireWatchButtons() {
  const container = document.querySelector(".movie-list");
  if (!container) return;

  container.addEventListener("click", async (event) => {
    const btn = event.target.closest(".watch-btn");
    if (!btn) return;

    const id = btn.dataset.id;
    const target = container.querySelector(
      `.watch-providers[data-providers-for="${id}"]`,
    );
    if (!target) return;

    btn.disabled = true;
    btn.textContent = "Loading...";

    try {
      const providers = await tmdbService.fetchWatchProviders(id);

      if (providers && providers.length > 0) {
        target.innerHTML = `<p class="providers-list">📺 Stream on: ${providers.join(", ")}</p>`;
      } else {
        target.innerHTML =
          '<p class="providers-list">Not currently streaming — check theaters or rental.</p>';
      }
    } catch (error) {
      console.error("Error loading providers:", error);
      target.innerHTML =
        '<p class="providers-list error-msg">Couldn\'t load streaming info.</p>';
    } finally {
      btn.remove();
    }
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
    const results = await tmdbService.searchByTitle(query);

    if (!results || results.length === 0) {
      container.innerHTML = `<p class="no-results">No results found for "${query}".</p>`;
      return;
    }

    renderListWithTemplate(
      movieCardTemplate,
      container,
      results,
      "afterbegin",
      true,
    );
  } catch (error) {
    console.error("Search failed:", error);
    container.innerHTML =
      '<p class="error-msg">Something went wrong searching. Try again.</p>';
  }
}
