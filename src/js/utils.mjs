// wrapper for querySelector...returns matching element
export function qs(selector, parent = document) {
  return parent.querySelector(selector);
}

// get a query string parameter by name
export function getParam(param) {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  return urlParams.get(param);
}

// retrieve data from localStorage
export function getLocalStorage(key) {
  return JSON.parse(localStorage.getItem(key));
}

// save data to localStorage
export function setLocalStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// Cache aliases matching eventsApi.mjs / streamingApi.mjs imports
export function getCachedData(key) {
  return getLocalStorage(key);
}

export function setCachedData(key, data) {
  setLocalStorage(key, data);
}

// render a list of items into a parent element using a template function
export function renderListWithTemplate(
  templateFn,
  parentElement,
  list,
  position = "afterbegin",
  clear = false,
) {
  const htmlStrings = list.map(templateFn);
  if (clear) {
    parentElement.innerHTML = "";
  }
  parentElement.insertAdjacentHTML(position, htmlStrings.join(""));
}

// render a single HTML template string into a parent element
export function renderWithTemplate(template, parentElement, data, callback) {
  parentElement.innerHTML = template;
  if (callback) {
    callback(data);
  }
}

// fetch an HTML partial as text
export async function loadTemplate(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load template at ${path}`);
  const template = await res.text();
  return template;
}

// load the shared header and footer partials into the current page
export async function loadHeaderFooter() {
  try {
    // Root-relative paths ensure partials load on /index.html as well as /in/ and /out/
    const headerTemplate = await loadTemplate("/partials/header.html");
    const headerElement = document.querySelector("#main-header");
    if (headerElement) renderWithTemplate(headerTemplate, headerElement);

    const footerTemplate = await loadTemplate("/partials/footer.html");
    const footerElement = document.querySelector("#main-footer");
    if (footerElement) renderWithTemplate(footerTemplate, footerElement);
  } catch (error) {
    console.error("Error loading header/footer partials:", error);
  }
}

// format a number as US currency, e.g. "$12.34"
export function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}