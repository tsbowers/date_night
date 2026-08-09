import { tmdbService } from "./streamingApi.mjs";
import { loadHeaderFooter, renderListWithTemplate } from "./utils.mjs";

document.addEventListener("DOMContentLoaded", async () => {
  await loadHeaderFooter();
  await displayTrending();
  wireSearch();
  wireWatchButtons();
  wireReadMoreButtons();
});

function movieCardTemplate(movie) {
  const fullDescription = movie.description || "No description provided.";
  const isLong = fullDescription.length > 100;
  const shortDescription = isLong
    ? `${fullDescription.substring(0, 100)}...`
    : fullDescription;

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
        <p
          class="movie-description"
          data-full="${encodeURIComponent(fullDescription)}"
          data-short="${encodeURIComponent(shortDescription)}"
          data-expanded="false"
        >
          ${shortDescription}
        </p>
        ${isLong ? '<button class="read-more-btn" type="button">Read more</button>' : ""}
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

// Event delegation on the list container: toggles between short and full
// movie descriptions when a "Read more" / "Show less" button is clicked.
function wireReadMoreButtons() {
  const container = document.querySelector(".movie-list");
  if (!container) return;

  container.addEventListener("click", (event) => {
    const btn = event.target.closest(".read-more-btn");
    if (!btn) return;

    const descriptionEl = btn.previousElementSibling;
    if (
      !descriptionEl ||
      !descriptionEl.classList.contains("movie-description")
    )
      return;

    const isExpanded = descriptionEl.dataset.expanded === "true";
    const full = decodeURIComponent(descriptionEl.dataset.full);
    const short = decodeURIComponent(descriptionEl.dataset.short);

    if (isExpanded) {
      descriptionEl.textContent = short;
      descriptionEl.dataset.expanded = "false";
      btn.textContent = "Read more";
    } else {
      descriptionEl.textContent = full;
      descriptionEl.dataset.expanded = "true";
      btn.textContent = "Show less";
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
