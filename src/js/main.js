import { loadHeaderFooter } from "./utils.mjs";

loadHeaderFooter();
initSpotlights();

function initSpotlights() {
  // Sample pool for rotating "Go Out" options
  const outOptions = [
    { title: "Live Jazz & Dining", img: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop", desc: "Enjoy local live jazz with food truck vendors." },
    { title: "Stargazing at the Park", img: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&auto=format&fit=crop", desc: "Bundle up for a quiet night observing constellation views." }
  ];

  // Sample pool for rotating "Stay In" options
  const inOptions = [
    { title: "Top Rated Sci-Fi Thriller", img: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&auto=format&fit=crop", desc: "Stream the highest rated mystery thriller on Netflix." },
    { title: "Cozy Gourmet Cooking Night", img: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=600&auto=format&fit=crop", desc: "Pair a trending comedy series with homemade pasta." }
  ];

  // Pick random spotlight item for each block
  const randomOut = outOptions[Math.floor(Math.random() * outOptions.length)];
  const randomIn = inOptions[Math.floor(Math.random() * inOptions.length)];

  const outTarget = document.getElementById('out-spotlight-target');
  if (outTarget) {
    outTarget.innerHTML = `
      <img src="${randomOut.img}" alt="${randomOut.title}" />
      <h3>${randomOut.title}</h3>
      <p>${randomOut.desc}</p>
      <a href="/out/index.html" class="btn">Explore Out Options</a>
    `;
  }

  const inTarget = document.getElementById('in-spotlight-target');
  if (inTarget) {
    inTarget.innerHTML = `
      <img src="${randomIn.img}" alt="${randomIn.title}" />
      <h3>${randomIn.title}</h3>
      <p>${randomIn.desc}</p>
      <a href="/in/index.html" class="btn btn-accent">Explore In Options</a>
    `;
  }
}